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
    const [[regionsCount], [departementsCount], [communesCount]] = await Promise.all([
      Database.from('regions').count('* as total'),
      Database.from('departements').count('* as total'),
      Database.from('communes').count('* as total'),
    ])

    return ApiResponse.success(
      {
        regions: Number(regionsCount.total),
        departements: Number(departementsCount.total),
        communes: Number(communesCount.total),
      },
      'Statistiques globales du découpage administratif du Sénégal'
    )
  }
}
