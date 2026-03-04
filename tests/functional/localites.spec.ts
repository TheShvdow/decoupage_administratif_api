import { test } from '@japa/runner'
import Database from '@ioc:Adonis/Lucid/Database'

test.group('Localites', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('GET /api/v1/localites - should return list of all localites only', async ({ client }) => {
    const response = await client.get('/api/v1/localites')

    response.assertStatus(200)
    response.assertBodyContains({ success: true })

    const body = response.body()
    const { data } = body

    // Vérifie que c'est un tableau
    // @ts-ignore
    client.assert.isArray(data)
    // @ts-ignore
    client.assert.isAbove(data.length, 0)

    // Vérifie la structure d'une localite
    const firstLocalite = data[0]
    // @ts-ignore
    client.assert.property(firstLocalite, 'id')
    // @ts-ignore
    client.assert.property(firstLocalite, 'name')
    // @ts-ignore
    client.assert.property(firstLocalite, 'commune_id')
    // @ts-ignore
    client.assert.notProperty(firstLocalite, 'commune')

    // Vérifie le tri alphabétique
    const localiteNames = data.map((c: { name: string }) => c.name)
    const sortedNames = [...localiteNames].sort()
    // @ts-ignore
    client.assert.deepEqual(localiteNames, sortedNames)
  })

  test('GET /api/v1/localites?commune_id=1 - should filter localites by commune', async ({
    client,
  }) => {
    const response = await client.get('/api/v1/localites?commune_id=1')

    response.assertStatus(200)
    response.assertBodyContains({ success: true })

    const body = response.body()
    const { data } = body

    // @ts-ignore
    client.assert.isArray(data)

    // Vérifie que toutes les localites appartiennent à la commune 1
    data.forEach((localite: { commune_id: number }) => {
      // @ts-ignore
      client.assert.equal(localite.commune_id, 1)
    })

    // Vérifie le tri alphabétique
    if (data.length > 0) {
      const localiteNames = data.map((c: { name: string }) => c.name)
      const sortedNames = [...localiteNames].sort()
      // @ts-ignore
      client.assert.deepEqual(localiteNames, sortedNames)
    }
  })

  test('GET /api/v1/localites/:id - should return localite with full hierarchy (department + region + commune)', async ({
    client,
  }) => {
    const response = await client.get('/api/v1/localites/1')

    response.assertStatus(200)
    response.assertBodyContains({ success: true })

    const body = response.body()
    const { data } = body

    // Vérifie la structure de la localite
    // @ts-ignore
    client.assert.property(data, 'id')
    // @ts-ignore
    client.assert.property(data, 'name')
    // @ts-ignore
    client.assert.property(data, 'commune_id')
    // @ts-ignore
    client.assert.property(data, 'commune')

    // Vérifie la structure de la commune
    const commune = data.commune
    // @ts-ignore
    client.assert.property(commune, 'id')
    // @ts-ignore
    client.assert.property(commune, 'name')
    // @ts-ignore
    client.assert.property(commune, 'departement_id')
    // @ts-ignore
    client.assert.property(commune, 'departement')

    // Vérifie la structure du département
    const departement = commune.departement
    // @ts-ignore
    client.assert.property(departement, 'id')
    // @ts-ignore
    client.assert.property(departement, 'name')
    // @ts-ignore
    client.assert.property(departement, 'region_id')
    // @ts-ignore
    client.assert.property(departement, 'region')

    // Vérifie la structure de la région
    const region = departement.region
    // @ts-ignore
    client.assert.property(region, 'id')
    // @ts-ignore
    client.assert.property(region, 'name')

    // Vérifie la cohérence des IDs
    // @ts-ignore
    client.assert.equal(data.commune_id, commune.id)
    // @ts-ignore
    client.assert.equal(commune.departement_id, departement.id)
    // @ts-ignore
    client.assert.equal(departement.region_id, region.id)
  })

  test('GET /api/v1/localites/:id - should return 404 for non-existent localite', async ({
    client,
  }) => {
    const response = await client.get('/api/v1/localites/999999')

    response.assertStatus(404)
  })

  test('GET /api/v1/localites - should have consistent data across multiple requests', async ({
    client,
  }) => {
    const response1 = await client.get('/api/v1/localites')
    const response2 = await client.get('/api/v1/localites')

    const data1 = response1.body().data
    const data2 = response2.body().data

    // Vérifie que les deux requêtes retournent les mêmes données
    // @ts-ignore
    client.assert.equal(data1.length, data2.length)
    // @ts-ignore
    client.assert.deepEqual(data1, data2)
  })

  test('GET /api/v1/localites - localite hierarchy should match commune, department and region data', async ({
    client,
  }) => {
    // Récupérer une localite avec hiérarchie complète
    const localiteResponse = await client.get('/api/v1/localites/1')
    const localite = localiteResponse.body().data

    // Récupérer la commune directement
    const communeResponse = await client.get(`/api/v1/communes/${localite.commune_id}`)
    const commune = communeResponse.body().data

    // Récupérer le département directement
    const deptResponse = await client.get(`/api/v1/departements/${localite.commune.departement_id}`)
    const departement = deptResponse.body().data

    // Récupérer la région directement
    const regionResponse = await client.get(`/api/v1/regions/${localite.commune.departement.region_id}`)
    const region = regionResponse.body().data

    // Vérifie la cohérence des noms
    
    // @ts-ignore
    client.assert.equal(localite.commune.name, commune.name)
    // @ts-ignore
    client.assert.equal(localite.commune.departement.name, departement.name)
    // @ts-ignore
    client.assert.equal(localite.commune.departement.region.name, region.name)
  })

  test('GET /api/v1/localites?commune_id=999999 - should return empty array for non-existent commune', async ({
    client,
  }) => {
    const response = await client.get('/api/v1/localites?commune_id=999999')

    response.assertStatus(200)
    response.assertBodyContains({ success: true })

    const body = response.body()
    // @ts-ignore
    client.assert.isArray(body.data)
    // @ts-ignore
    client.assert.equal(body.data.length, 0)
  })

  test('GET /api/v1/localites/abc - should return 400 for non-numeric id', async ({ client }) => {
    const response = await client.get('/api/v1/localites/abc')
    response.assertStatus(400)
    response.assertBodyContains({ success: false })
  })

  test('GET /api/v1/localites?commune_id=abc - should return 400 for non-numeric commune_id', async ({
    client,
  }) => {
    const response = await client.get('/api/v1/localites?commune_id=abc')
    response.assertStatus(400)
    response.assertBodyContains({ success: false })
  })

  test('GET /api/v1/localites?page=1&limit=10 - should return paginated localites', async ({
    client,
  }) => {
    const response = await client.get('/api/v1/localites?page=1&limit=10')
    response.assertStatus(200)
    response.assertBodyContains({ success: true })

    const body = response.body()
    const { data } = body
    // @ts-ignore
    client.assert.property(data, 'meta')
    // @ts-ignore
    client.assert.property(data, 'data')
    // @ts-ignore
    client.assert.isArray(data.data)
    // @ts-ignore
    client.assert.equal(data.data.length, 10)
    // @ts-ignore
    client.assert.property(data.meta, 'total')
    // @ts-ignore
    client.assert.property(data.meta, 'current_page')
  })

  test('GET /api/v1/localites - should return all localites without filter', async ({ client }) => {
    const allLocalitesResponse = await client.get('/api/v1/localites')
    const allLocalites = allLocalitesResponse.body().data

    // Récupérer toutes les localites par commune et compter
    const communesResponse = await client.get('/api/v1/communes')
    const communes = communesResponse.body().data

    let totalLocalitesByCommune = 0
    for (const commune of communes) {
      const localitesResponse = await client.get(`/api/v1/localites?commune_id=${commune.id}`)
      totalLocalitesByCommune += localitesResponse.body().data.length
    }

    // Vérifie que le nombre total correspond
    // @ts-ignore
    client.assert.equal(allLocalites.length, totalLocalitesByCommune)
  })
})
