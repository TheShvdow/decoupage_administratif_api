import BaseSchema from '@ioc:Adonis/Lucid/Schema'

/**
 * Migration additive : ajoute les colonnes géospatiales et statistiques
 * sur les tables regions, departements, communes et localites existantes.
 * Utilise ADD COLUMN IF NOT EXISTS — idempotente, safe sur Neon.
 */
export default class extends BaseSchema {
  public async up() {
    // Extensions PostGIS (idempotent)
    await this.db.rawQuery('CREATE EXTENSION IF NOT EXISTS postgis')
    await this.db.rawQuery('CREATE EXTENSION IF NOT EXISTS pg_trgm')

    // ── regions ──────────────────────────────────────────────────────
    await this.db.rawQuery(
      "ALTER TABLE regions ADD COLUMN IF NOT EXISTS geometry geometry(MultiPolygon,4326)"
    )
    await this.db.rawQuery(
      'ALTER TABLE regions ADD COLUMN IF NOT EXISTS superficie_km2 DOUBLE PRECISION'
    )
    await this.db.rawQuery(
      'ALTER TABLE regions ADD COLUMN IF NOT EXISTS population INTEGER'
    )
    await this.db.rawQuery(
      'ALTER TABLE regions ADD COLUMN IF NOT EXISTS densite DOUBLE PRECISION'
    )

    // ── departements ─────────────────────────────────────────────────
    await this.db.rawQuery(
      "ALTER TABLE departements ADD COLUMN IF NOT EXISTS geometry geometry(MultiPolygon,4326)"
    )
    await this.db.rawQuery(
      'ALTER TABLE departements ADD COLUMN IF NOT EXISTS superficie_km2 DOUBLE PRECISION'
    )
    await this.db.rawQuery(
      'ALTER TABLE departements ADD COLUMN IF NOT EXISTS population INTEGER'
    )
    await this.db.rawQuery(
      'ALTER TABLE departements ADD COLUMN IF NOT EXISTS densite DOUBLE PRECISION'
    )

    // ── communes ─────────────────────────────────────────────────────
    await this.db.rawQuery(
      "ALTER TABLE communes ADD COLUMN IF NOT EXISTS geometry geometry(MultiPolygon,4326)"
    )
    await this.db.rawQuery(
      'ALTER TABLE communes ADD COLUMN IF NOT EXISTS superficie_km2 DOUBLE PRECISION'
    )
    await this.db.rawQuery(
      'ALTER TABLE communes ADD COLUMN IF NOT EXISTS population INTEGER'
    )
    await this.db.rawQuery(
      'ALTER TABLE communes ADD COLUMN IF NOT EXISTS densite DOUBLE PRECISION'
    )
    await this.db.rawQuery(
      'ALTER TABLE communes ADD COLUMN IF NOT EXISTS region_id INTEGER'
    )

    // ── localites ────────────────────────────────────────────────────
    await this.db.rawQuery(
      "ALTER TABLE localites ADD COLUMN IF NOT EXISTS geometry geometry(MultiPolygon,4326)"
    )
    await this.db.rawQuery(
      'ALTER TABLE localites ADD COLUMN IF NOT EXISTS departement_id INTEGER'
    )
    await this.db.rawQuery(
      'ALTER TABLE localites ADD COLUMN IF NOT EXISTS region_id INTEGER'
    )
    await this.db.rawQuery(
      'ALTER TABLE localites ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION'
    )
    await this.db.rawQuery(
      'ALTER TABLE localites ADD COLUMN IF NOT EXISTS lon DOUBLE PRECISION'
    )
    await this.db.rawQuery(
      'ALTER TABLE localites ADD COLUMN IF NOT EXISTS elevation DOUBLE PRECISION'
    )
    await this.db.rawQuery(
      'ALTER TABLE localites ADD COLUMN IF NOT EXISTS superficie_km2 DOUBLE PRECISION'
    )
    await this.db.rawQuery(
      'ALTER TABLE localites ADD COLUMN IF NOT EXISTS population INTEGER'
    )
    await this.db.rawQuery(
      'ALTER TABLE localites ADD COLUMN IF NOT EXISTS densite DOUBLE PRECISION'
    )
    await this.db.rawQuery(
      'ALTER TABLE localites ADD COLUMN IF NOT EXISTS normalized_name TEXT'
    )

    // ── Index GIST spatiaux ───────────────────────────────────────────
    await this.db.rawQuery(
      'CREATE INDEX IF NOT EXISTS idx_regions_geom ON regions USING GIST (geometry)'
    )
    await this.db.rawQuery(
      'CREATE INDEX IF NOT EXISTS idx_departements_geom ON departements USING GIST (geometry)'
    )
    await this.db.rawQuery(
      'CREATE INDEX IF NOT EXISTS idx_communes_geom ON communes USING GIST (geometry)'
    )
    await this.db.rawQuery(
      'CREATE INDEX IF NOT EXISTS idx_localites_geom ON localites USING GIST (geometry)'
    )

    // ── Index GIN trgm pour recherche floue ──────────────────────────
    await this.db.rawQuery(
      'CREATE INDEX IF NOT EXISTS idx_localites_trgm ON localites USING GIN (normalized_name gin_trgm_ops)'
    )

    // ── Index sur clés étrangères additionnelles ─────────────────────
    await this.db.rawQuery(
      'CREATE INDEX IF NOT EXISTS idx_communes_region_id ON communes (region_id)'
    )
    await this.db.rawQuery(
      'CREATE INDEX IF NOT EXISTS idx_localites_departement_id ON localites (departement_id)'
    )
    await this.db.rawQuery(
      'CREATE INDEX IF NOT EXISTS idx_localites_region_id ON localites (region_id)'
    )
  }

  public async down() {
    // On retire uniquement les colonnes ajoutées par cette migration
    const cols: Array<{ table: string; col: string }> = [
      { table: 'regions', col: 'geometry' },
      { table: 'regions', col: 'superficie_km2' },
      { table: 'regions', col: 'population' },
      { table: 'regions', col: 'densite' },
      { table: 'departements', col: 'geometry' },
      { table: 'departements', col: 'superficie_km2' },
      { table: 'departements', col: 'population' },
      { table: 'departements', col: 'densite' },
      { table: 'communes', col: 'geometry' },
      { table: 'communes', col: 'superficie_km2' },
      { table: 'communes', col: 'population' },
      { table: 'communes', col: 'densite' },
      { table: 'communes', col: 'region_id' },
      { table: 'localites', col: 'geometry' },
      { table: 'localites', col: 'departement_id' },
      { table: 'localites', col: 'region_id' },
      { table: 'localites', col: 'lat' },
      { table: 'localites', col: 'lon' },
      { table: 'localites', col: 'elevation' },
      { table: 'localites', col: 'superficie_km2' },
      { table: 'localites', col: 'population' },
      { table: 'localites', col: 'densite' },
      { table: 'localites', col: 'normalized_name' },
    ]
    for (const { table, col } of cols) {
      await this.db.rawQuery(`ALTER TABLE ${table} DROP COLUMN IF EXISTS ${col}`)
    }
  }
}
