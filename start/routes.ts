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
      "Bienvu dans l'api du Decoupage administratif du Sénégal . Cette Api recence l'ensemble des Regions, Départements et Communes du pays pour faciliter l'intégration dans vos applications. Pour plus d'informations, rendez-vous sur https://github.com/Theshvdow/DecoupageAdministratifSenegalApi",
  }
})
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
  // Routes Régions
  Route.get('/regions', 'RegionsController.index') // Liste toutes les régions seulement
  Route.get('/regions/:id', 'RegionsController.show') // Région + départements (sans communes)
  Route.get('/regions/:regionId/departements', 'RegionsController.departements') // Départements d'une région
  Route.get('/regions/:regionId/departements/:departementId', 'RegionsController.showDepartement') // Région + département + communes

  // Routes Départements
  Route.get('/departements', 'DepartementsController.index') // Liste tous les départements (filtre ?region_id= optionnel)
  Route.get('/departements/:id', 'DepartementsController.show') // Département + ses communes
  Route.get('/departements/:id/communes', 'DepartementsController.communes') // Communes d'un département

  // Routes Communes
  Route.get('/communes', 'CommunesController.index') // Liste toutes les communes (filtre ?departement_id= optionnel)
  Route.get('/communes/:id', 'CommunesController.show') // Commune + département + région
}).prefix('/api/v1')
