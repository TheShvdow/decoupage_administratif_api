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

require('dotenv').config()
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
  log('\n=== Localités (par lots de 1000) ===')
  const total = (await source.query('SELECT COUNT(*) AS n FROM localites')).rows[0].n
  const BATCH = 1000
  let offset = 0
  let updated = 0

  while (offset < total) {
    const { rows } = await source.query(
      `SELECT l.id, l.name, l.commune_id, l.departement_id, l.region_id,
              l.lat, l.lon, l.elevation,
              l.superficie_km2, l.population, l.densite,
              l.normalized_name,
              ST_AsGeoJSON(l.geometry)::text AS geojson,
              c.name AS commune_name
       FROM localites l
       LEFT JOIN communes c ON c.id = l.commune_id
       WHERE l.name IS NOT NULL
       ORDER BY l.id
       LIMIT $1 OFFSET $2`,
      [BATCH, offset]
    )

    for (const row of rows) {
      // Chercher la commune cible par nom
      if (!row.commune_name) continue
      const { rows: tc } = await target.query(
        'SELECT id FROM communes WHERE LOWER(name) = LOWER($1) LIMIT 1',
        [row.commune_name]
      )
      if (!tc.length) continue
      const tgtCommuneId = tc[0].id

      await target.query(
        `UPDATE localites
         SET geometry        = CASE WHEN $1 IS NOT NULL THEN ST_SetSRID(ST_GeomFromGeoJSON($1), 4326) ELSE geometry END,
             lat             = COALESCE(lat, $2),
             lon             = COALESCE(lon, $3),
             elevation       = COALESCE(elevation, $4),
             superficie_km2  = COALESCE(superficie_km2, $5),
             population      = COALESCE(population, $6),
             densite         = COALESCE(densite, $7),
             normalized_name = COALESCE(normalized_name, $8),
             departement_id  = COALESCE(departement_id, $9),
             region_id       = COALESCE(region_id, $10)
         WHERE commune_id = $11
           AND LOWER(name) = LOWER($12)`,
        [
          row.geojson,
          row.lat,
          row.lon,
          row.elevation,
          row.superficie_km2,
          row.population,
          row.densite,
          row.normalized_name,
          row.departement_id,
          row.region_id,
          tgtCommuneId,
          row.name,
        ]
      )
      updated++
    }

    offset += BATCH
    process.stdout.write(`  [${Math.min(offset, total)}/${total}]\r`)
  }
  log(`\n  ✓ ${updated} localités mises à jour`)
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
