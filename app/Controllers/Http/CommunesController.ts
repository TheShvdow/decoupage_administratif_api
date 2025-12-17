import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Commune from 'App/Models/Commune'

export default class CommunesController {
  /**
   * @swagger
   * /api/v1/communes:
   *   get:
   *     tags:
   *       - Communes
   *     summary: Liste toutes les communes
   *     description: Retourne la liste de toutes les communes du Sénégal. Peut être filtré par département
   *     parameters:
   *       - name: departement_id
   *         in: query
   *         required: false
   *         description: Filtrer par identifiant de département
   *         schema:
   *           type: number
   *           example: 1
   *     responses:
   *       200:
   *         description: Liste des communes
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Commune'
   */
  public async index({ request }: HttpContextContract) {
    const departementId = request.input('departement_id')

    const query = Commune.query().orderBy('name', 'asc')

    if (departementId) {
      query.where('departement_id', departementId)
    }

    const communes = await query

    return {
      success: true,
      data: communes,
    }
  }

  /**
   * @swagger
   * /api/v1/communes/{id}:
   *   get:
   *     tags:
   *       - Communes
   *     summary: Obtenir une commune avec sa hiérarchie complète
   *     description: Retourne une commune spécifique avec son département et sa région (hiérarchie complète pour breadcrumb)
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         description: Identifiant de la commune
   *         schema:
   *           type: number
   *           example: 1
   *     responses:
   *       200:
   *         description: Commune avec hiérarchie complète
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/CommuneWithHierarchy'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   */
  public async show({ params }: HttpContextContract) {
    const commune = await Commune.query()
      .where('id', params.id)
      .preload('departement', (deptQuery) => {
        deptQuery.preload('region')
      })
      .firstOrFail()

    return {
      success: true,
      data: commune,
    }
  }
}
