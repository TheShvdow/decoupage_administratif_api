import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database'
import ApiResponse from 'App/Utils/ApiResponse'

export default class StatsController {
  /**
   * @swagger
   * /api/v1/stats:
   *   get:
   *     tags:
   *       - Statistiques
   *     summary: Statistiques globales du découpage administratif
   *     description: Retourne le nombre total de régions, départements et communes du Sénégal
   *     responses:
   *       200:
   *         description: Statistiques globales
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
   *                   example: Statistiques globales du découpage administratif du Sénégal
   *                 data:
   *                   $ref: '#/components/schemas/Stats'
   */
  public async index(_ctx: HttpContextContract) {
    const [
      [regionsCount],
      [departementsCount],
      [communesCount],
      [localitesCount],
      paysResult,
    ] = await Promise.all([
      Database.from('regions').count('* as total'),
      Database.from('departements').count('* as total'),
      Database.from('communes').count('* as total'),
      Database.from('localites').count('* as total'),
      Database.rawQuery(
        'SELECT name, superficie_km2, population, densite FROM pays LIMIT 1'
      ),
    ])

    const pays = paysResult.rows[0] ?? null

    return ApiResponse.success(
      {
        pays: pays
          ? {
              name: pays.name,
              superficie_km2: pays.superficie_km2,
              population: pays.population,
              densite: pays.densite,
            }
          : null,
        regions: Number(regionsCount.total),
        departements: Number(departementsCount.total),
        communes: Number(communesCount.total),
        localites: Number(localitesCount.total),
      },
      'Statistiques globales du découpage administratif du Sénégal'
    )
  }
}
