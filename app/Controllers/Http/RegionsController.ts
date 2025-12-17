import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Region from 'App/Models/Region'
import Departement from 'App/Models/Departement'

export default class RegionsController {
  /**
   * @swagger
   * /api/v1/regions:
   *   get:
   *     tags:
   *       - Régions
   *     summary: Liste toutes les régions
   *     description: Retourne la liste complète des 14 régions du Sénégal (sans départements ni communes)
   *     responses:
   *       200:
   *         description: Liste des régions
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
   *                     $ref: '#/components/schemas/Region'
   */
  public async index() {
    const regions = await Region.query().orderBy('name', 'asc')

    return {
      success: true,
      data: regions,
    }
  }

  /**
   * @swagger
   * /api/v1/regions/{id}:
   *   get:
   *     tags:
   *       - Régions
   *     summary: Obtenir une région avec ses départements
   *     description: Retourne une région spécifique avec la liste de ses départements (sans les communes)
   *     parameters:
   *       - name: id
   *         in: path
   *         required: true
   *         description: Identifiant de la région
   *         schema:
   *           type: number
   *           example: 1
   *     responses:
   *       200:
   *         description: Région avec ses départements
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   $ref: '#/components/schemas/RegionWithDepartements'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   */
  public async show({ params }: HttpContextContract) {
    const region = await Region.query()
      .where('id', params.id)
      .preload('departements', (query) => {
        query.orderBy('name', 'asc')
      })
      .firstOrFail()

    return {
      success: true,
      data: region,
    }
  }

  /**
   * @swagger
   * /api/v1/regions/{regionId}/departements:
   *   get:
   *     tags:
   *       - Régions
   *     summary: Liste des départements d'une région
   *     description: Retourne tous les départements d'une région spécifique (sans les communes)
   *     parameters:
   *       - name: regionId
   *         in: path
   *         required: true
   *         description: Identifiant de la région
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
   *       404:
   *         $ref: '#/components/responses/NotFound'
   */
  public async departements({ params }: HttpContextContract) {
    const region = await Region.findOrFail(params.regionId)
    const departements = await Departement.query()
      .where('region_id', region.id)
      .orderBy('name', 'asc')

    return {
      success: true,
      data: departements,
    }
  }

  /**
   * @swagger
   * /api/v1/regions/{regionId}/departements/{departementId}:
   *   get:
   *     tags:
   *       - Régions
   *     summary: Département d'une région avec ses communes
   *     description: Retourne un département spécifique d'une région avec toutes ses communes
   *     parameters:
   *       - name: regionId
   *         in: path
   *         required: true
   *         description: Identifiant de la région
   *         schema:
   *           type: number
   *           example: 1
   *       - name: departementId
   *         in: path
   *         required: true
   *         description: Identifiant du département
   *         schema:
   *           type: number
   *           example: 1
   *     responses:
   *       200:
   *         description: Région, département et ses communes
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: object
   *                   properties:
   *                     region:
   *                       type: object
   *                       properties:
   *                         id:
   *                           type: number
   *                         name:
   *                           type: string
   *                     departement:
   *                       $ref: '#/components/schemas/DepartementWithCommunes'
   *       404:
   *         $ref: '#/components/responses/NotFound'
   */
  public async showDepartement({ params, response }: HttpContextContract) {
    const region = await Region.query()
      .where('id', params.regionId)
      .preload('departements', (deptQuery) => {
        deptQuery.where('id', params.departementId).preload('communes', (communeQuery) => {
          communeQuery.orderBy('name', 'asc')
        })
      })
      .firstOrFail()

    // Vérifier que le département appartient bien à cette région
    const departement = region.departements.find((d) => d.id === Number(params.departementId))
    if (!departement) {
      return response.notFound({
        errors: [{ message: 'Departement not found in this region' }],
      })
    }

    return {
      success: true,
      data: {
        region: {
          id: region.id,
          name: region.name,
        },
        departement: departement,
      },
    }
  }
}
