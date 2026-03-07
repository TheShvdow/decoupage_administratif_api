import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Localite from 'App/Models/Localite'
import ApiResponse from 'App/Utils/ApiResponse'

export default class LocalitesController {
  /**
   * @swagger
   * /api/v1/localites:
   *   get:
   *     tags:
   *       - Localites
   *     summary: Liste toutes les localites
   *     description: Retourne la liste de toutes les localites du Sénégal. Peut être filtré par commune. Supporte la pagination optionnelle via ?page= et ?limit=
   *     parameters:
   *       - name: commune_id
   *         in: query
   *         required: false
   *         description: Filtrer par identifiant de commune
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
   *         description: Liste des localites
   */
  public async index({ request, response }: HttpContextContract) {
    const validateIntParam = (raw: string | null, _name?: string): number | null | false => {
      if (raw === null || raw === undefined || raw === '') return null
      const val = Number(raw)
      if (isNaN(val) || val <= 0 || !Number.isInteger(val)) return false
      return val
    }

    const communeId = validateIntParam(request.input('commune_id'), 'commune_id')
    const departementId = validateIntParam(request.input('departement_id'), 'departement_id')
    const regionId = validateIntParam(request.input('region_id'), 'region_id')

    if (communeId === false)
      return response.badRequest(ApiResponse.error("Le paramètre 'commune_id' doit être un entier positif."))
    if (departementId === false)
      return response.badRequest(ApiResponse.error("Le paramètre 'departement_id' doit être un entier positif."))
    if (regionId === false)
      return response.badRequest(ApiResponse.error("Le paramètre 'region_id' doit être un entier positif."))

    const pageRaw = request.input('page')
    const limit = Math.min(Number(request.input('limit', 100)), 200)

    const query = Localite.query().orderBy('name', 'asc')

    if (communeId !== null) query.where('commune_id', communeId)
    if (departementId !== null) query.where('departement_id', departementId)
    if (regionId !== null) query.where('region_id', regionId)

    if (pageRaw) {
      const page = Math.max(1, Number(pageRaw))
      const paginated = await query.paginate(page, limit)
      return ApiResponse.success(paginated.toJSON())
    }

    const localites = await query
    return ApiResponse.success(localites)
  }

  /**
   * @swagger
   * /api/v1/localites/{id}:
   *   get:
   *     tags:
   *       - Localites
   *     summary: Obtenir une localite avec sa hiérarchie complète
   *     description: Retourne une localite spécifique avec sa commune, son département et sa région
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         description: Identifiant de la localite
   *         schema:
   *           type: number
   *           example: 1
   *     responses:
   *       200:
   *         description: Localite avec hiérarchie complète
   *       404:
   *         description: Localite non trouvée
   */
  public async show({ params }: HttpContextContract) {
    const localite = await Localite.query()
      .where('id', params.id)
      .preload('commune', (communeQuery) => {
        communeQuery.preload('departement', (deptQuery) => {
          deptQuery.preload('region')
        })
      })
      .firstOrFail()

    return ApiResponse.success(localite)
  }
}