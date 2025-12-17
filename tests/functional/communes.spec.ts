import { test } from '@japa/runner'
import Database from '@ioc:Adonis/Lucid/Database'

test.group('Communes', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('GET /api/v1/communes - should return list of all communes only', async ({ client }) => {
    const response = await client.get('/api/v1/communes')

    response.assertStatus(200)
    response.assertBodyContains({ success: true })

    const body = response.body()
    const { data } = body

    // Vérifie que c'est un tableau
    // @ts-ignore
    client.assert.isArray(data)
    // @ts-ignore
    client.assert.isAbove(data.length, 0)

    // Vérifie la structure d'une commune
    const firstCommune = data[0]
    // @ts-ignore
    client.assert.property(firstCommune, 'id')
    // @ts-ignore
    client.assert.property(firstCommune, 'name')
    // @ts-ignore
    client.assert.property(firstCommune, 'departement_id')
    // @ts-ignore
    client.assert.notProperty(firstCommune, 'departement')

    // Vérifie le tri alphabétique
    const communeNames = data.map((c) => c.name)
    const sortedNames = [...communeNames].sort()
    // @ts-ignore
    client.assert.deepEqual(communeNames, sortedNames)
  })

  test('GET /api/v1/communes?departement_id=1 - should filter communes by department', async ({
    client,
  }) => {
    const response = await client.get('/api/v1/communes?departement_id=1')

    response.assertStatus(200)
    response.assertBodyContains({ success: true })

    const body = response.body()
    const { data } = body

    // @ts-ignore
    client.assert.isArray(data)

    // Vérifie que toutes les communes appartiennent au département 1
    data.forEach((commune) => {
      // @ts-ignore
      client.assert.equal(commune.departement_id, 1)
    })

    // Vérifie le tri alphabétique
    if (data.length > 0) {
      const communeNames = data.map((c) => c.name)
      const sortedNames = [...communeNames].sort()
      // @ts-ignore
      client.assert.deepEqual(communeNames, sortedNames)
    }
  })


  test('GET /api/v1/communes/:id - should return commune with full hierarchy (department + region)', async ({
    client,
  }) => {
    const response = await client.get('/api/v1/communes/1')

    response.assertStatus(200)
    response.assertBodyContains({ success: true })

    const body = response.body()
    const { data } = body

    // Vérifie la structure de la commune
    // @ts-ignore
    client.assert.property(data, 'id')
    // @ts-ignore
    client.assert.property(data, 'name')
    // @ts-ignore
    client.assert.property(data, 'departement_id')
    // @ts-ignore
    client.assert.property(data, 'departement')

    // Vérifie la structure du département
    const departement = data.departement
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
    client.assert.equal(data.departement_id, departement.id)
    // @ts-ignore
    client.assert.equal(departement.region_id, region.id)
  })

  test('GET /api/v1/communes/:id - should return 404 for non-existent commune', async ({
    client,
  }) => {
    const response = await client.get('/api/v1/communes/999999')

    response.assertStatus(404)
  })

  test('GET /api/v1/communes - should have consistent data across multiple requests', async ({
    client,
  }) => {
    const response1 = await client.get('/api/v1/communes')
    const response2 = await client.get('/api/v1/communes')

    const data1 = response1.body().data
    const data2 = response2.body().data

    // Vérifie que les deux requêtes retournent les mêmes données
    // @ts-ignore
    client.assert.equal(data1.length, data2.length)
    // @ts-ignore
    client.assert.deepEqual(data1, data2)
  })

  test('GET /api/v1/communes - commune hierarchy should match department and region data', async ({
    client,
  }) => {
    // Récupérer une commune avec hiérarchie complète
    const communeResponse = await client.get('/api/v1/communes/1')
    const commune = communeResponse.body().data

    // Récupérer le département directement
    const deptResponse = await client.get(`/api/v1/departements/${commune.departement_id}`)
    const departement = deptResponse.body().data

    // Récupérer la région directement
    const regionResponse = await client.get(`/api/v1/regions/${commune.departement.region_id}`)
    const region = regionResponse.body().data

    // Vérifie la cohérence des noms
    // @ts-ignore
    client.assert.equal(commune.departement.name, departement.name)
    // @ts-ignore
    client.assert.equal(commune.departement.region.name, region.name)
  })

  test('GET /api/v1/communes?departement_id=999999 - should return empty array for non-existent department', async ({
    client,
  }) => {
    const response = await client.get('/api/v1/communes?departement_id=999999')

    response.assertStatus(200)
    response.assertBodyContains({ success: true })

    const body = response.body()
    // @ts-ignore
    client.assert.isArray(body.data)
    // @ts-ignore
    client.assert.equal(body.data.length, 0)
  })

  test('GET /api/v1/communes - should return all communes without filter', async ({ client }) => {
    const allCommunesResponse = await client.get('/api/v1/communes')
    const allCommunes = allCommunesResponse.body().data

    // Récupérer toutes les communes par département et compter
    const deptsResponse = await client.get('/api/v1/departements')
    const departments = deptsResponse.body().data

    let totalCommunesByDept = 0
    for (const dept of departments) {
      const communesResponse = await client.get(`/api/v1/communes?departement_id=${dept.id}`)
      totalCommunesByDept += communesResponse.body().data.length
    }

    // Vérifie que le nombre total correspond
    // @ts-ignore
    client.assert.equal(allCommunes.length, totalCommunesByDept)
  })
})
