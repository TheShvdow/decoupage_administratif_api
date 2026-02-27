import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Departement from 'App/Models/Departement'
import Commune from 'App/Models/Commune'
import ApiResponse from 'App/Utils/ApiResponse'

export default class DepartementsController {
  /**
   * @swagger
   * /api/v1/departements:
   *   get:
   *     tags:
   *       - Départements
   *     summary: Liste tous les départements
   *     description: Retourne la liste de tous les départements (sans communes). Peut être filtré par région
   *     parameters:
   *       - name: region_id
   *         in: query
   *         required: false
   *         description: Filtrer par identifiant de région
   *         schema:
   *           type: number
   *           example: 1
   *     responses:
   *       200:
   *         description: Liste des départements
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
   *                     $ref: '#/components/schemas/Departement'
   */
  public async index({ request, response }: HttpContextContract) {
    const regionIdRaw = request.input('region_id')

    if (regionIdRaw !== null && regionIdRaw !== undefined && regionIdRaw !== '') {
      const regionId = Number(regionIdRaw)
      if (isNaN(regionId) || regionId <= 0 || !Number.isInteger(regionId)) {
        return response.badRequest(
          ApiResponse.error("Le paramètre 'region_id' doit être un entier positif.")
        )
      }
    }

    const query = Departement.query().orderBy('name', 'asc')

    if (regionIdRaw) {
      query.where('region_id', regionIdRaw)
    }

    const departements = await query
    return ApiResponse.success(departements)
  }

  /**
   * @swagger
   * /api/v1/departements/{id}:
   *   get:
   *     tags:
   *       - Départements
   *     summary: Obtenir un département avec ses communes
   *     description: Retourne un département spécifique avec la liste de toutes ses communes
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         description: Identifiant du département
   *         schema:
   *           type: number
   *           example: 1
   *     responses:
   *       200:
   *         description: Département avec ses communes
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
   *                   $ref: '#/components/schemas/DepartementWithCommunes'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   */
  public async show({ params }: HttpContextContract) {
    const departement = await Departement.query()
      .where('id', params.id)
      .preload('communes', (query) => {
        query.orderBy('name', 'asc')
      })
      .firstOrFail()

    return ApiResponse.success(departement)
  }

  /**
   * @swagger
   * /api/v1/departements/{id}/communes:
   *   get:
   *     tags:
   *       - Départements
   *     summary: Liste des communes d'un département
   *     description: Retourne toutes les communes d'un département spécifique
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         description: Identifiant du département
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
   *                 message:
   *                   type: string
   *                   example: Succès
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Commune'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   */
  public async communes({ params }: HttpContextContract) {
    const departement = await Departement.findOrFail(params.id)
    const communes = await Commune.query()
      .where('departement_id', departement.id)
      .orderBy('name', 'asc')

    return ApiResponse.success(communes)
  }
}
