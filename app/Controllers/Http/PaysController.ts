import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import ApiResponse from 'App/Utils/ApiResponse'

export default class PaysController {
  /**
   * @swagger
   * /api/v1/pays:
   *   get:
   *     tags:
   *       - Pays
   *     summary: Statistiques nationales du Sénégal
   *     description: Retourne le nom, la superficie, la population et la densité du Sénégal
   *     responses:
   *       200:
   *         description: Statistiques nationales
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: Succès
   *                 data:
   *                   $ref: '#/components/schemas/Pays'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   */
  public async index({ response }: HttpContextContract) {
    const result = await Database.rawQuery(
      'SELECT id, name, superficie_km2, population, densite FROM pays LIMIT 1'
    )
    const row = result.rows[0]
    if (!row) {
      return response.notFound(ApiResponse.error('Données pays non disponibles.'))
    }
    return ApiResponse.success({
      id: row.id,
      name: row.name,
      superficie_km2: row.superficie_km2,
      population: row.population,
      densite: row.densite,
    })
  }

  /**
   * @swagger
   * /api/v1/map/pays:
   *   get:
   *     tags:
   *       - Map
   *       - Pays
   *     summary: GeoJSON Feature du polygone national du Sénégal
   *     description: Retourne le polygone MultiPolygon du Sénégal au format GeoJSON Feature (RFC 7946)
   *     responses:
   *       200:
   *         description: GeoJSON Feature
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/GeoJSONFeature'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   */
  public async mapFeature({ response }: HttpContextContract) {
    const result = await Database.rawQuery(`
      SELECT
        id,
        name,
        superficie_km2,
        population,
        densite,
        ST_AsGeoJSON(geometry)::json AS geometry
      FROM pays
      LIMIT 1
    `)
    const row = result.rows[0]
    if (!row) {
      return response.notFound(ApiResponse.error('Géométrie pays non disponible.'))
    }
    return {
      type: 'Feature',
      geometry: row.geometry,
      properties: {
        id: row.id,
        name: row.name,
        superficie_km2: row.superficie_km2,
        population: row.population,
        densite: row.densite,
      },
    }
  }
}
