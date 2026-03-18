/**
 * Script d'import des coordonnées GPS pour les régions et départements.
 *
 * Usage :
 *   node ace exec scripts/import_coordinates.ts
 *
 * Prérequis :
 *   - Les fichiers CSV doivent exister dans database/data/
 *   - La migration ajoutant lat/lon aux régions et code/lat/lon aux départements doit être exécutée
 */

import Application from '@ioc:Adonis/Core/Application'
import Database from '@ioc:Adonis/Lucid/Database'
import { readFileSync } from 'fs'
import { join } from 'path'

// ── Helpers ──────────────────────────────────────────────────────────────────

function parseCsv(content: string): Record<string, string>[] {
  const lines = content.trim().split('\n')
  const headers = lines[0].split(',').map((h) => h.trim())
  return lines.slice(1).map((line) => {
    const values = line.split(',').map((v) => v.trim())
    const row: Record<string, string> = {}
    headers.forEach((h, i) => {
      row[h] = values[i] ?? ''
    })
    return row
  })
}

/**
 * Normalise un nom pour la comparaison :
 * minuscule, suppression des accents, tirets remplacés par des espaces.
 */
function normalize(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/-/g, ' ')
    .trim()
}

/**
 * Extrait le code département depuis HASC_2 (ex: SN.DK.DK → DK).
 */
function extractCode(hasc: string): string {
  const parts = hasc.split('.')
  return parts[parts.length - 1] ?? ''
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function run() {
  const dataDir = join(Application.appRoot, 'database', 'data')

  let regionsUpdated = 0
  let departementsUpdated = 0
  let errors = 0

  // ── Import coordonnées régions ───────────────────────────────────────────

  console.log('\n📍 Import des coordonnées des régions...\n')

  const regionsCsvPath = join(dataDir, 'regionss_coordinates.csv')
  const regionsCsv = readFileSync(regionsCsvPath, 'utf-8')
  const regionsRows = parseCsv(regionsCsv)

  const dbRegions = await Database.from('regions').select('id', 'name')

  for (const row of regionsRows) {
    const csvName = normalize(row['NAME_1'] ?? '')
    const lat = parseFloat(row['Y'] ?? '')
    const lon = parseFloat(row['X'] ?? '')

    if (!csvName || isNaN(lat) || isNaN(lon)) {
      console.warn(`  ⚠️  Ligne ignorée (données invalides) : NAME_1=${row['NAME_1']}`)
      errors++
      continue
    }

    const match = dbRegions.find((r) => normalize(r.name) === csvName)

    if (!match) {
      console.warn(`  ❌ Région non trouvée en base : "${row['NAME_1']}"`)
      errors++
      continue
    }

    await Database.from('regions').where('id', match.id).update({ lat, lon })
    console.log(`  ✅ ${match.name} → lat=${lat}, lon=${lon}`)
    regionsUpdated++
  }

  // ── Import coordonnées + code départements ───────────────────────────────

  console.log('\n📍 Import des coordonnées et codes des départements...\n')

  const deptsCsvPath = join(dataDir, 'departements_coordinates.csv')
  const deptsCsv = readFileSync(deptsCsvPath, 'utf-8')
  const deptsRows = parseCsv(deptsCsv)

  const dbDepts = await Database.from('departements').select('id', 'name')

  for (const row of deptsRows) {
    const csvName = normalize(row['NAME_2'] ?? '')
    const lat = parseFloat(row['Y'] ?? '')
    const lon = parseFloat(row['X'] ?? '')
    const code = extractCode(row['HASC_2'] ?? '')

    if (!csvName || isNaN(lat) || isNaN(lon)) {
      console.warn(`  ⚠️  Ligne ignorée (données invalides) : NAME_2=${row['NAME_2']}`)
      errors++
      continue
    }

    const match = dbDepts.find((d) => normalize(d.name) === csvName)

    if (!match) {
      console.warn(`  ❌ Département non trouvé en base : "${row['NAME_2']}"`)
      errors++
      continue
    }

    await Database.from('departements').where('id', match.id).update({ lat, lon, code })
    console.log(`  ✅ ${match.name} → code=${code}, lat=${lat}, lon=${lon}`)
    departementsUpdated++
  }

  // ── Résumé ───────────────────────────────────────────────────────────────

  console.log('\n────────────────────────────────────')
  console.log(`Regions updated: ${regionsUpdated}`)
  console.log(`Departements updated: ${departementsUpdated}`)
  console.log(`Errors: ${errors}`)
  console.log('────────────────────────────────────\n')
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
