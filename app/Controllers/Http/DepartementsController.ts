import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Departement from 'App/Models/Departement'
import Commune from 'App/Models/Commune'

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
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Departement'
   */
  public async index({ request }: HttpContextContract) {
    const regionId = request.input('region_id')

    const query = Departement.query().orderBy('name', 'asc')

    if (regionId) {
      query.where('region_id', regionId)
    }

    const departements = await query

    return {
      success: true,
      data: departements,
    }
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

    return {
      success: true,
      data: departement,
    }
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

    return {
      success: true,
      data: communes,
    }
  }
}
