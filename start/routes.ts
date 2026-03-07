/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| This file is dedicated for defining HTTP routes. A single file is enough
| for majority of projects, however you can define routes in different
| files and just make sure to import them inside this file. For example
|
| Define routes in following two files
| ├── start/routes/cart.ts
| ├── start/routes/customer.ts
|
| and then import them inside `start/routes.ts` as follows
|
| import './routes/cart'
| import './routes/customer'
|
*/

import Route from '@ioc:Adonis/Core/Route'

Route.get('/', async () => {
  return {
    welcome:
      "Bienvenu dans l'API du Découpage administratif du Sénégal. Cette API recense l'ensemble des Régions, Départements et Communes du pays pour faciliter l'intégration dans vos applications. Pour plus d'informations, rendez-vous sur https://github.com/Theshvdow/DecoupageAdministratifSenegalApi",
  }
})

//Route Health for monitoring with UptimeRobot
Route.get('/health', async () => {
  return {
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  }
})

// Routes Documentation
Route.get('/docs', 'DocsController.redoc') // Documentation Redoc
Route.get('/api/openapi.json', 'DocsController.spec') // Spécification OpenAPI

Route.group(() => {
  // ── Pays ────────────────────────────────────────────────────────
  Route.get('/pays', 'PaysController.index')

  // ── Régions ─────────────────────────────────────────────────────
  Route.get('/regions', 'RegionsController.index')
  Route.get('/regions/:id', 'RegionsController.show').middleware('validateId')
  Route.get('/regions/:regionId/departements', 'RegionsController.departements').middleware('validateId:regionId')
  Route.get('/regions/:regionId/departements/:departementId', 'RegionsController.showDepartement').middleware('validateId:regionId,departementId')

  // ── Départements ────────────────────────────────────────────────
  Route.get('/departements', 'DepartementsController.index')
  Route.get('/departements/:id', 'DepartementsController.show').middleware('validateId')
  Route.get('/departements/:id/communes', 'DepartementsController.communes').middleware('validateId')

  // ── Communes ────────────────────────────────────────────────────
  Route.get('/communes', 'CommunesController.index')
  Route.get('/communes/:id', 'CommunesController.show').middleware('validateId')
  Route.get('/communes/:id/localites', 'CommunesController.localites').middleware('validateId')

  // ── Localités ───────────────────────────────────────────────────
  Route.get('/localites', 'LocalitesController.index')
  Route.get('/localites/:id', 'LocalitesController.show').middleware('validateId')

  // ── Recherche & Statistiques ────────────────────────────────────
  Route.get('/search', 'SearchController.index')
  Route.get('/stats', 'StatsController.index')

  // ── Map (GeoJSON) ────────────────────────────────────────────────
  Route.get('/map/pays', 'PaysController.mapFeature')
  Route.get('/map/regions', 'MapController.regions')
  Route.get('/map/departements', 'MapController.departements')
  Route.get('/map/communes', 'MapController.communes')
  Route.get('/map/localites', 'MapController.localites')
}).prefix('/api/v1')
