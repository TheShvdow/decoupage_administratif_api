import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'

/**
 * MapController — retourne des GeoJSON FeatureCollection / Feature
 * pour toutes les entités administratives.
 * Toutes les requêtes utilisent ST_AsGeoJSON côté PostgreSQL (PostGIS)
 * pour éviter de sérialiser des données binaires en JS.
 */
export default class MapController {
  // ── /api/v1/map/regions ──────────────────────────────────────────

  /**
   * @swagger
   * /api/v1/map/regions:
   *   get:
   *     tags:
   *       - Map
   *     summary: GeoJSON FeatureCollection de toutes les régions
   *     responses:
   *       200:
   *         description: GeoJSON FeatureCollection
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GeoJSONFeatureCollection'
   */
  public async regions(_ctx: HttpContextContract) {
    const result = await Database.rawQuery(`
      SELECT json_build_object(
        'type', 'FeatureCollection',
        'features', COALESCE(json_agg(
          json_build_object(
            'type', 'Feature',
            'geometry', ST_AsGeoJSON(geometry)::json,
            'properties', json_build_object(
              'id',             id,
              'name',           name,
              'code',           code,
              'lat',            lat,
              'lon',            lon,
              'superficie_km2', superficie_km2,
              'population',     population,
              'densite',        densite
            )
          )
        ORDER BY name), '[]'::json)
      ) AS fc
      FROM regions
      WHERE geometry IS NOT NULL
    `)
    return result.rows[0]?.fc ?? { type: 'FeatureCollection', features: [] }
  }

  // ── /api/v1/map/departements ─────────────────────────────────────

  /**
   * @swagger
   * /api/v1/map/departements:
   *   get:
   *     tags:
   *       - Map
   *     summary: GeoJSON FeatureCollection de tous les départements
   *     parameters:
   *       - name: region_id
   *         in: query
   *         schema:
   *           type: integer
   *         description: Filtrer par région
   *     responses:
   *       200:
   *         description: GeoJSON FeatureCollection
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GeoJSONFeatureCollection'
   */
  public async departements({ request }: HttpContextContract) {
    const regionId = request.input('region_id')
    const where = regionId ? `WHERE geometry IS NOT NULL AND region_id = ${Number(regionId)}` : 'WHERE geometry IS NOT NULL'

    const result = await Database.rawQuery(`
      SELECT json_build_object(
        'type', 'FeatureCollection',
        'features', COALESCE(json_agg(
          json_build_object(
            'type', 'Feature',
            'geometry', ST_AsGeoJSON(geometry)::json,
            'properties', json_build_object(
              'id',             id,
              'name',           name,
              'region_id',      region_id,
              'superficie_km2', superficie_km2,
              'population',     population,
              'densite',        densite
            )
          )
        ORDER BY name), '[]'::json)
      ) AS fc
      FROM departements
      ${where}
    `)
    return result.rows[0]?.fc ?? { type: 'FeatureCollection', features: [] }
  }

  // ── /api/v1/map/communes ─────────────────────────────────────────

  /**
   * @swagger
   * /api/v1/map/communes:
   *   get:
   *     tags:
   *       - Map
   *     summary: GeoJSON FeatureCollection de toutes les communes
   *     parameters:
   *       - name: departement_id
   *         in: query
   *         schema:
   *           type: integer
   *         description: Filtrer par département
   *       - name: region_id
   *         in: query
   *         schema:
   *           type: integer
   *         description: Filtrer par région
   *     responses:
   *       200:
   *         description: GeoJSON FeatureCollection
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GeoJSONFeatureCollection'
   */
  public async communes({ request }: HttpContextContract) {
    const departementId = request.input('departement_id')
    const regionId = request.input('region_id')

    const conditions: string[] = ['geometry IS NOT NULL']
    if (departementId) conditions.push(`departement_id = ${Number(departementId)}`)
    if (regionId) conditions.push(`region_id = ${Number(regionId)}`)

    const result = await Database.rawQuery(`
      SELECT json_build_object(
        'type', 'FeatureCollection',
        'features', COALESCE(json_agg(
          json_build_object(
            'type', 'Feature',
            'geometry', ST_AsGeoJSON(geometry)::json,
            'properties', json_build_object(
              'id',             id,
              'name',           name,
              'departement_id', departement_id,
              'region_id',      region_id,
              'superficie_km2', superficie_km2,
              'population',     population,
              'densite',        densite
            )
          )
        ORDER BY name), '[]'::json)
      ) AS fc
      FROM communes
      WHERE ${conditions.join(' AND ')}
    `)
    return result.rows[0]?.fc ?? { type: 'FeatureCollection', features: [] }
  }

  // ── /api/v1/map/localites ─────────────────────────────────────────

  /**
   * @swagger
   * /api/v1/map/localites:
   *   get:
   *     tags:
   *       - Map
   *     summary: GeoJSON FeatureCollection des localités (polygones Voronoï)
   *     parameters:
   *       - name: commune_id
   *         in: query
   *         schema:
   *           type: integer
   *         description: Filtrer par commune
   *       - name: departement_id
   *         in: query
   *         schema:
   *           type: integer
   *         description: Filtrer par département
   *       - name: region_id
   *         in: query
   *         schema:
   *           type: integer
   *         description: Filtrer par région
   *       - name: limit
   *         in: query
   *         schema:
   *           type: integer
   *           default: 500
   *         description: Nombre maximum de features (défaut 500)
   *     responses:
   *       200:
   *         description: GeoJSON FeatureCollection
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GeoJSONFeatureCollection'
   */
  public async localites({ request }: HttpContextContract) {
    const communeId = request.input('commune_id')
    const departementId = request.input('departement_id')
    const regionId = request.input('region_id')
    const limit = Math.min(Number(request.input('limit', 500)), 2000)

    const conditions: string[] = ['geometry IS NOT NULL']
    if (communeId) conditions.push(`commune_id = ${Number(communeId)}`)
    if (departementId) conditions.push(`departement_id = ${Number(departementId)}`)
    if (regionId) conditions.push(`region_id = ${Number(regionId)}`)

    const result = await Database.rawQuery(`
      SELECT json_build_object(
        'type', 'FeatureCollection',
        'features', COALESCE(json_agg(
          json_build_object(
            'type', 'Feature',
            'geometry', ST_AsGeoJSON(geometry)::json,
            'properties', json_build_object(
              'id',             id,
              'name',           name,
              'commune_id',     commune_id,
              'departement_id', departement_id,
              'region_id',      region_id,
              'lat',            lat,
              'lon',            lon,
              'superficie_km2', superficie_km2,
              'population',     population,
              'densite',        densite
            )
          )
        ORDER BY name), '[]'::json)
      ) AS fc
      FROM (
        SELECT * FROM localites
        WHERE ${conditions.join(' AND ')}
        ORDER BY name
        LIMIT ${limit}
      ) sub
    `)
    return result.rows[0]?.fc ?? { type: 'FeatureCollection', features: [] }
  }
}
