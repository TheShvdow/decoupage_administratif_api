/**
 * migrate-from-frontieres-api.js
 *
 * Migre les données géospatiales de frontieres_api (PostgreSQL local)
 * vers la base Neon de decoupage_administratif_api.
 *
 * Ce script :
 * 1. Lit depuis la base locale (frontieres_db) : geometry, superficie_km2, population, densite
 * 2. Met à jour les lignes correspondantes sur Neon par correspondance de nom (LOWER)
 * 3. Importe la table `pays` entièrement
 *
 * Usage :
 *   node scripts/migrate-from-frontieres-api.js
 *
 * Variables d'environnement requises (dans .env) :
 *   DATABASE_URL=postgresql://...neon...  (cible)
 *   SOURCE_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/frontieres_db  (source)
 */

// Lecture manuelle du .env (pas de dépendance dotenv requise)
const fs = require('fs')
const envPath = require('path').join(__dirname, '../.env')
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^([^#=]+)=(.*)$/)
    if (m) process.env[m[1].trim()] = m[2].trim()
  }
}
const { Pool } = require('pg')

const SOURCE_URL =
  process.env.SOURCE_DATABASE_URL ||
  'postgresql://postgres:postgres@localhost:5432/frontieres_db'
const TARGET_URL = process.env.DATABASE_URL

if (!TARGET_URL) {
  console.error('❌ DATABASE_URL manquant dans .env')
  process.exit(1)
}

const source = new Pool({ connectionString: SOURCE_URL })
const target = new Pool({
  connectionString: TARGET_URL,
  ssl: { rejectUnauthorized: false },
})

async function log(msg) {
  process.stdout.write(msg + '\n')
}

// ── 1. Régions ───────────────────────────────────────────────────────────────
async function migrateRegions() {
  log('\n=== Régions ===')
  const { rows } = await source.query(
    'SELECT name, ST_AsGeoJSON(geometry)::text AS geojson, superficie_km2, population, densite FROM regions'
  )
  let updated = 0
  for (const row of rows) {
    if (!row.geojson) continue
    const res = await target.query(
      `UPDATE regions
       SET geometry       = ST_SetSRID(ST_GeomFromGeoJSON($1), 4326),
           superficie_km2 = $2,
           population     = $3,
           densite        = $4
       WHERE LOWER(name) = LOWER($5)`,
      [row.geojson, row.superficie_km2, row.population, row.densite, row.name]
    )
    if (res.rowCount > 0) updated++
  }
  log(`  ✓ ${updated}/${rows.length} régions mises à jour`)
}

// ── 2. Départements ──────────────────────────────────────────────────────────
async function migrateDepartements() {
  log('\n=== Départements ===')
  const { rows } = await source.query(
    'SELECT name, region_id, ST_AsGeoJSON(geometry)::text AS geojson, superficie_km2, population, densite FROM departements'
  )
  // Construire une map region_id source → region_id cible par nom
  const { rows: srcRegions } = await source.query('SELECT id, name FROM regions')
  const { rows: tgtRegions } = await target.query('SELECT id, name FROM regions')
  const regionIdMap = new Map()
  for (const sr of srcRegions) {
    const tr = tgtRegions.find((r) => r.name.toLowerCase() === sr.name.toLowerCase())
    if (tr) regionIdMap.set(sr.id, tr.id)
  }

  let updated = 0
  for (const row of rows) {
    if (!row.geojson) continue
    const tgtRegionId = regionIdMap.get(row.region_id) ?? null
    const res = await target.query(
      `UPDATE departements
       SET geometry       = ST_SetSRID(ST_GeomFromGeoJSON($1), 4326),
           superficie_km2 = $2,
           population     = $3,
           densite        = $4,
           region_id      = COALESCE(region_id, $5)
       WHERE LOWER(name) = LOWER($6)`,
      [row.geojson, row.superficie_km2, row.population, row.densite, tgtRegionId, row.name]
    )
    if (res.rowCount > 0) updated++
  }
  log(`  ✓ ${updated}/${rows.length} départements mis à jour`)
}

// ── 3. Communes ──────────────────────────────────────────────────────────────
async function migrateCommunes() {
  log('\n=== Communes ===')
  const { rows } = await source.query(
    'SELECT name, departement_id, region_id, ST_AsGeoJSON(geometry)::text AS geojson, superficie_km2, population, densite FROM communes'
  )

  // map dept_id source → dept_id cible
  const { rows: srcDepts } = await source.query('SELECT id, name FROM departements')
  const { rows: tgtDepts } = await target.query('SELECT id, name FROM departements')
  const deptIdMap = new Map()
  for (const sd of srcDepts) {
    const td = tgtDepts.find((d) => d.name.toLowerCase() === sd.name.toLowerCase())
    if (td) deptIdMap.set(sd.id, td.id)
  }

  let updated = 0
  for (const row of rows) {
    if (!row.geojson) continue
    const tgtDeptId = deptIdMap.get(row.departement_id) ?? null
    const res = await target.query(
      `UPDATE communes
       SET geometry       = ST_SetSRID(ST_GeomFromGeoJSON($1), 4326),
           superficie_km2 = $2,
           population     = $3,
           densite        = $4,
           region_id      = COALESCE(region_id, $5)
       WHERE LOWER(name) = LOWER($6)
         AND (departement_id = $7 OR $7 IS NULL)`,
      [
        row.geojson,
        row.superficie_km2,
        row.population,
        row.densite,
        row.region_id,
        row.name,
        tgtDeptId,
      ]
    )
    if (res.rowCount > 0) updated++
  }
  log(`  ✓ ${updated}/${rows.length} communes mises à jour`)
}

// ── 4. Localités ─────────────────────────────────────────────────────────────
async function migrateLocalites() {
  log('\n=== Localités (par lots de 500) ===')

  // Construire une map commune_name (lower) → commune_id cible en une seule requête
  const { rows: tgtCommunes } = await target.query('SELECT id, LOWER(name) AS lname FROM communes')
  const communeMap = new Map()
  for (const c of tgtCommunes) communeMap.set(c.lname, c.id)

  const total = parseInt((await source.query('SELECT COUNT(*) AS n FROM localites')).rows[0].n, 10)
  const BATCH = 500
  let offset = 0
  let updated = 0

  while (offset < total) {
    const { rows } = await source.query(
      `SELECT l.name, l.lat, l.lon, l.elevation,
              l.superficie_km2, l.population, l.densite,
              l.normalized_name, l.departement_id, l.region_id,
              ST_AsGeoJSON(l.geometry)::text AS geojson,
              LOWER(c.name) AS commune_lname
       FROM localites l
       LEFT JOIN communes c ON c.id = l.commune_id
       WHERE l.name IS NOT NULL
       ORDER BY l.id
       LIMIT $1 OFFSET $2`,
      [BATCH, offset]
    )

    // Séparer les lignes avec et sans géométrie
    const withGeom = rows.filter((r) => r.geojson && communeMap.has(r.commune_lname))
    const withoutGeom = rows.filter((r) => !r.geojson && communeMap.has(r.commune_lname))

    if (withGeom.length > 0) {
      // Batch update avec géométrie via UNNEST
      await target.query(
        `UPDATE localites AS t
         SET geometry        = ST_SetSRID(ST_GeomFromGeoJSON(v.geojson), 4326),
             lat             = COALESCE(t.lat, v.lat::double precision),
             lon             = COALESCE(t.lon, v.lon::double precision),
             elevation       = COALESCE(t.elevation, v.elevation::double precision),
             superficie_km2  = COALESCE(t.superficie_km2, v.superficie_km2::double precision),
             population      = COALESCE(t.population, v.population::integer),
             densite         = COALESCE(t.densite, v.densite::double precision),
             normalized_name = COALESCE(t.normalized_name, v.normalized_name),
             departement_id  = COALESCE(t.departement_id, v.dept_id::integer),
             region_id       = COALESCE(t.region_id, v.reg_id::integer)
         FROM (
           SELECT
             UNNEST($1::text[])    AS lname,
             UNNEST($2::integer[]) AS commune_id,
             UNNEST($3::text[])    AS lname_loc,
             UNNEST($4::text[])    AS geojson,
             UNNEST($5::text[])    AS lat,
             UNNEST($6::text[])    AS lon,
             UNNEST($7::text[])    AS elevation,
             UNNEST($8::text[])    AS superficie_km2,
             UNNEST($9::text[])    AS population,
             UNNEST($10::text[])   AS densite,
             UNNEST($11::text[])   AS normalized_name,
             UNNEST($12::text[])   AS dept_id,
             UNNEST($13::text[])   AS reg_id
         ) AS v
         WHERE t.commune_id = v.commune_id
           AND LOWER(t.name) = v.lname_loc`,
        [
          withGeom.map((r) => r.commune_lname),
          withGeom.map((r) => communeMap.get(r.commune_lname)),
          withGeom.map((r) => r.name.toLowerCase()),
          withGeom.map((r) => r.geojson),
          withGeom.map((r) => r.lat?.toString() ?? null),
          withGeom.map((r) => r.lon?.toString() ?? null),
          withGeom.map((r) => r.elevation?.toString() ?? null),
          withGeom.map((r) => r.superficie_km2?.toString() ?? null),
          withGeom.map((r) => r.population?.toString() ?? null),
          withGeom.map((r) => r.densite?.toString() ?? null),
          withGeom.map((r) => r.normalized_name ?? null),
          withGeom.map((r) => r.departement_id?.toString() ?? null),
          withGeom.map((r) => r.region_id?.toString() ?? null),
        ]
      )
      updated += withGeom.length
    }

    if (withoutGeom.length > 0) {
      await target.query(
        `UPDATE localites AS t
         SET lat             = COALESCE(t.lat, v.lat::double precision),
             lon             = COALESCE(t.lon, v.lon::double precision),
             elevation       = COALESCE(t.elevation, v.elevation::double precision),
             superficie_km2  = COALESCE(t.superficie_km2, v.superficie_km2::double precision),
             population      = COALESCE(t.population, v.population::integer),
             densite         = COALESCE(t.densite, v.densite::double precision),
             normalized_name = COALESCE(t.normalized_name, v.normalized_name),
             departement_id  = COALESCE(t.departement_id, v.dept_id::integer),
             region_id       = COALESCE(t.region_id, v.reg_id::integer)
         FROM (
           SELECT
             UNNEST($1::integer[]) AS commune_id,
             UNNEST($2::text[])    AS lname_loc,
             UNNEST($3::text[])    AS lat,
             UNNEST($4::text[])    AS lon,
             UNNEST($5::text[])    AS elevation,
             UNNEST($6::text[])    AS superficie_km2,
             UNNEST($7::text[])    AS population,
             UNNEST($8::text[])    AS densite,
             UNNEST($9::text[])    AS normalized_name,
             UNNEST($10::text[])   AS dept_id,
             UNNEST($11::text[])   AS reg_id
         ) AS v
         WHERE t.commune_id = v.commune_id
           AND LOWER(t.name) = v.lname_loc`,
        [
          withoutGeom.map((r) => communeMap.get(r.commune_lname)),
          withoutGeom.map((r) => r.name.toLowerCase()),
          withoutGeom.map((r) => r.lat?.toString() ?? null),
          withoutGeom.map((r) => r.lon?.toString() ?? null),
          withoutGeom.map((r) => r.elevation?.toString() ?? null),
          withoutGeom.map((r) => r.superficie_km2?.toString() ?? null),
          withoutGeom.map((r) => r.population?.toString() ?? null),
          withoutGeom.map((r) => r.densite?.toString() ?? null),
          withoutGeom.map((r) => r.normalized_name ?? null),
          withoutGeom.map((r) => r.departement_id?.toString() ?? null),
          withoutGeom.map((r) => r.region_id?.toString() ?? null),
        ]
      )
      updated += withoutGeom.length
    }

    offset += BATCH
    process.stdout.write(`  [${Math.min(offset, total)}/${total}]\r`)
  }
  log(`\n  ✓ ${updated} localités traitées`)
}

// ── 5. Pays ──────────────────────────────────────────────────────────────────
async function migratePays() {
  log('\n=== Pays ===')
  const { rows } = await source.query(
    'SELECT name, ST_AsGeoJSON(geometry)::text AS geojson, superficie_km2, population, densite FROM pays'
  )
  if (!rows.length) {
    log('  ⚠ Table pays vide dans la source')
    return
  }
  const row = rows[0]
  await target.query('TRUNCATE pays RESTART IDENTITY')
  await target.query(
    `INSERT INTO pays (name, geometry, superficie_km2, population, densite)
     VALUES ($1, ST_SetSRID(ST_GeomFromGeoJSON($2), 4326), $3, $4, $5)`,
    [row.name, row.geojson, row.superficie_km2, row.population, row.densite]
  )
  log(`  ✓ Pays inséré : ${row.name} — ${row.population} hab, ${row.superficie_km2?.toFixed(0)} km²`)
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  log('╔════════════════════════════════════════════════╗')
  log('║  Migration frontieres_api → Neon               ║')
  log('╚════════════════════════════════════════════════╝')

  try {
    await migrateRegions()
    await migrateDepartements()
    await migrateCommunes()
    await migrateLocalites()
    await migratePays()
    log('\n✅ Migration terminée avec succès.')
  } catch (err) {
    log(`\n❌ Erreur : ${err.message}`)
    console.error(err)
    process.exit(1)
  } finally {
    await source.end()
    await target.end()
  }
}

main()
