import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Commune from 'App/Models/Commune'
import ApiResponse from 'App/Utils/ApiResponse'

export default class CommunesController {
  /**
   * @swagger
   * /api/v1/communes:
   *   get:
   *     tags:
   *       - Communes
   *     summary: Liste toutes les communes
   *     description: Retourne la liste de toutes les communes du Sénégal. Peut être filtré par département. Supporte la pagination optionnelle via ?page= et ?limit=
   *     parameters:
   *       - name: departement_id
   *         in: query
   *         required: false
   *         description: Filtrer par identifiant de département
   *         schema:
   *           type: number
   *           example: 1
   *       - name: page
   *         in: query
   *         required: false
   *         description: Numéro de page (active la pagination)
   *         schema:
   *           type: integer
   *           minimum: 1
   *           example: 1
   *       - name: limit
   *         in: query
   *         required: false
   *         description: Nombre de résultats par page (max 200, défaut 100)
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 200
   *           example: 100
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
   *                 message:
   *                   type: string
   *                   example: Succès
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Commune'
   */
  public async index({ request, response }: HttpContextContract) {
    const departementIdRaw = request.input('departement_id')

    if (departementIdRaw !== null && departementIdRaw !== undefined && departementIdRaw !== '') {
      const departementId = Number(departementIdRaw)
      if (isNaN(departementId) || departementId <= 0 || !Number.isInteger(departementId)) {
        return response.badRequest(
          ApiResponse.error("Le paramètre 'departement_id' doit être un entier positif.")
        )
      }
    }

    const pageRaw = request.input('page')
    const limit = Math.min(Number(request.input('limit', 100)), 200)

    const query = Commune.query().orderBy('name', 'asc')

    if (departementIdRaw) {
      query.where('departement_id', departementIdRaw)
    }

    if (pageRaw) {
      const page = Math.max(1, Number(pageRaw))
      const paginated = await query.paginate(page, limit)
      return ApiResponse.success(paginated.toJSON())
    }

    const communes = await query
    return ApiResponse.success(communes)
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
   *                 message:
   *                   type: string
   *                   example: Succès
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

    return ApiResponse.success(commune)
  }
}
