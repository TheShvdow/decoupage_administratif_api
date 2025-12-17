import { test } from '@japa/runner'

test.group('Documentation', () => {
  test('GET /api/openapi.json - should return OpenAPI specification', async ({ client }) => {
    const response = await client.get('/api/openapi.json')

    response.assertStatus(200)
    response.assertHeader('content-type', 'application/json; charset=utf-8')

    const body = response.body()

    // Vérifie la structure OpenAPI 3.0
    // @ts-ignore
    client.assert.property(body, 'openapi')
    // @ts-ignore
    client.assert.equal(body.openapi, '3.0.0')

    // Vérifie les informations de base
    // @ts-ignore
    client.assert.property(body, 'info')
    // @ts-ignore
    client.assert.property(body.info, 'title')
    // @ts-ignore
    client.assert.property(body.info, 'version')
    // @ts-ignore
    client.assert.property(body.info, 'description')

    // Vérifie les serveurs
    // @ts-ignore
    client.assert.property(body, 'servers')
    // @ts-ignore
    client.assert.isArray(body.servers)

    // Vérifie les paths (routes)
    // @ts-ignore
    client.assert.property(body, 'paths')
    // @ts-ignore
    client.assert.property(body.paths, '/api/v1/regions')
    // @ts-ignore
    client.assert.property(body.paths, '/api/v1/departements')
    // @ts-ignore
    client.assert.property(body.paths, '/api/v1/communes')

    // Vérifie les composants (schémas)
    // @ts-ignore
    client.assert.property(body, 'components')
    // @ts-ignore
    client.assert.property(body.components, 'schemas')
    // @ts-ignore
    client.assert.property(body.components.schemas, 'Region')
    // @ts-ignore
    client.assert.property(body.components.schemas, 'Departement')
    // @ts-ignore
    client.assert.property(body.components.schemas, 'Commune')
  })

  test('GET /docs - should return Redoc HTML page', async ({ client, assert }) => {
    const response = await client.get('/docs')

    response.assertStatus(200)
    response.assertHeader('content-type', 'text/html')

    const body = response.text()

    // Vérifie que c'est du HTML valide
    assert.include(body, '<!DOCTYPE html>')
    assert.include(body, '<html')
    assert.include(body, '</html>')

    // Vérifie que Redoc est présent
    assert.include(body, '<redoc')
    assert.include(body, 'spec-url="/api/openapi.json"')

    // Vérifie que le script Redoc est inclus
    assert.include(body, 'redoc.standalone.js')

    // Vérifie le titre
    assert.include(body, 'API Découpage Administratif du Sénégal')
  })

  test('GET /api/openapi.json - should contain all API endpoints', async ({ client }) => {
    const response = await client.get('/api/openapi.json')
    const spec = response.body()

    const expectedPaths = [
      '/api/v1/regions',
      '/api/v1/regions/{id}',
      '/api/v1/regions/{regionId}/departements',
      '/api/v1/regions/{regionId}/departements/{departementId}',
      '/api/v1/departements',
      '/api/v1/departements/{id}',
      '/api/v1/departements/{id}/communes',
      '/api/v1/communes',
      '/api/v1/communes/{id}',
    ]

    expectedPaths.forEach((path) => {
      // @ts-ignore
      client.assert.property(spec.paths, path, `Path ${path} should be documented`)
    })
  })

  test('GET /api/openapi.json - should contain all schemas', async ({ client }) => {
    const response = await client.get('/api/openapi.json')
    const spec = response.body()

    const expectedSchemas = [
      'Region',
      'RegionWithDepartements',
      'Departement',
      'DepartementWithCommunes',
      'Commune',
      'CommuneWithHierarchy',
      'SuccessResponse',
      'ErrorResponse',
    ]

    expectedSchemas.forEach((schema) => {
      // @ts-ignore
      client.assert.property(
        spec.components.schemas,
        schema,
        `Schema ${schema} should be documented`
      )
    })
  })

  test('GET /api/openapi.json - schemas should have proper structure', async ({ client }) => {
    const response = await client.get('/api/openapi.json')
    const spec = response.body()

    // Vérifie le schéma Region
    const regionSchema = spec.components.schemas.Region
    // @ts-ignore
    client.assert.property(regionSchema, 'type')
    // @ts-ignore
    client.assert.equal(regionSchema.type, 'object')
    // @ts-ignore
    client.assert.property(regionSchema, 'properties')
    // @ts-ignore
    client.assert.property(regionSchema.properties, 'id')
    // @ts-ignore
    client.assert.property(regionSchema.properties, 'name')

    // Vérifie le schéma Departement
    const departementSchema = spec.components.schemas.Departement
    // @ts-ignore
    client.assert.property(departementSchema.properties, 'id')
    // @ts-ignore
    client.assert.property(departementSchema.properties, 'name')
    // @ts-ignore
    client.assert.property(departementSchema.properties, 'region_id')

    // Vérifie le schéma Commune
    const communeSchema = spec.components.schemas.Commune
    // @ts-ignore
    client.assert.property(communeSchema.properties, 'id')
    // @ts-ignore
    client.assert.property(communeSchema.properties, 'name')
    // @ts-ignore
    client.assert.property(communeSchema.properties, 'departement_id')
  })

  test('GET /api/openapi.json - paths should have proper HTTP methods', async ({ client }) => {
    const response = await client.get('/api/openapi.json')
    const spec = response.body()

    // Toutes les routes doivent être des GET
    Object.keys(spec.paths).forEach((path) => {
      const pathSpec = spec.paths[path]
      // @ts-ignore
      client.assert.property(pathSpec, 'get', `Path ${path} should have GET method`)
    })
  })

  test('GET /api/openapi.json - should include response schemas', async ({ client }) => {
    const response = await client.get('/api/openapi.json')
    const spec = response.body()

    // Vérifie qu'au moins une route a des réponses définies
    const regionsPath = spec.paths['/api/v1/regions']
    // @ts-ignore
    client.assert.property(regionsPath.get, 'responses')
    // @ts-ignore
    client.assert.property(regionsPath.get.responses, '200')
  })

  test('GET /docs - should be accessible without authentication', async ({ client }) => {
    const response = await client.get('/docs')

    // Ne devrait pas rediriger vers une page de login
    response.assertStatus(200)
  })

  test('GET /api/openapi.json - should be accessible without authentication', async ({
    client,
  }) => {
    const response = await client.get('/api/openapi.json')

    // Ne devrait pas rediriger vers une page de login
    response.assertStatus(200)
  })
})
