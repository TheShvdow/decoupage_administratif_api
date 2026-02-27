import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Region from 'App/Models/Region'
import Departement from 'App/Models/Departement'
import Commune from 'App/Models/Commune'
import ApiResponse from 'App/Utils/ApiResponse'

export default class SearchController {
  /**
   * @swagger
   * /api/v1/search:
   *   get:
   *     tags:
   *       - Recherche
   *     summary: Rechercher par nom dans toutes les entités
   *     description: |
   *       Recherche insensible à la casse dans les régions, départements et communes.
   *       Le paramètre `q` doit contenir au moins 2 caractères.
   *       Le paramètre optionnel `type` restreint la recherche à un seul type d'entité.
   *     parameters:
   *       - name: q
   *         in: query
   *         required: true
   *         description: Terme de recherche (minimum 2 caractères)
   *         schema:
   *           type: string
   *           minLength: 2
   *           example: dakar
   *       - name: type
   *         in: query
   *         required: false
   *         description: "Type d'entité à rechercher : region, departement ou commune"
   *         schema:
   *           type: string
   *           enum: [region, departement, commune]
   *     responses:
   *       200:
   *         description: Résultats de la recherche
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
   *                   $ref: '#/components/schemas/SearchResults'
   *       400:
   *         $ref: '#/components/responses/BadRequest'
   */
  public async index({ request, response }: HttpContextContract) {
    const q = (request.input('q', '') as string).trim()
    const type = request.input('type') as string | null

    if (!q || q.length < 2) {
      return response.badRequest(
        ApiResponse.error("Le paramètre 'q' est requis et doit contenir au moins 2 caractères.")
      )
    }

    const searchTerm = `%${q}%`

    if (type === 'region') {
      const regions = await Region.query()
        .whereILike('name', searchTerm)
        .preload('departements', (deptQuery) => {
          deptQuery.orderBy('name', 'asc').preload('communes', (communeQuery) => {
            communeQuery.orderBy('name', 'asc')
          })
        })
        .orderBy('name', 'asc')
      return ApiResponse.success({ query: q, total: regions.length, results: { regions } })
    }

    if (type === 'departement') {
      const departements = await Departement.query()
        .whereILike('name', searchTerm)
        .preload('communes', (communeQuery) => {
          communeQuery.orderBy('name', 'asc')
        })
        .orderBy('name', 'asc')
      return ApiResponse.success({ query: q, total: departements.length, results: { departements } })
    }

    if (type === 'commune') {
      const communes = await Commune.query()
        .whereILike('name', searchTerm)
        .preload('departement', (deptQuery) => {
          deptQuery.preload('region')
        })
        .orderBy('name', 'asc')
      return ApiResponse.success({ query: q, total: communes.length, results: { communes } })
    }

    // Sans filtre de type : recherche dans toutes les entités
    const [regions, departements, communes] = await Promise.all([
      Region.query()
        .whereILike('name', searchTerm)
        .preload('departements', (deptQuery) => {
          deptQuery.orderBy('name', 'asc').preload('communes', (communeQuery) => {
            communeQuery.orderBy('name', 'asc')
          })
        })
        .orderBy('name', 'asc'),
      Departement.query()
        .whereILike('name', searchTerm)
        .preload('communes', (communeQuery) => {
          communeQuery.orderBy('name', 'asc')
        })
        .orderBy('name', 'asc'),
      Commune.query()
        .whereILike('name', searchTerm)
        .preload('departement', (deptQuery) => {
          deptQuery.preload('region')
        })
        .orderBy('name', 'asc'),
    ])

    return ApiResponse.success({
      query: q,
      total: regions.length + departements.length + communes.length,
      results: { regions, departements, communes },
    })
  }
}
