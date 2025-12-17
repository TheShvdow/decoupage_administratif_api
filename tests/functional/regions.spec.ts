import { test } from '@japa/runner'
import Database from '@ioc:Adonis/Lucid/Database'

test.group('Regions', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('GET /api/v1/regions - should return list of all regions only', async ({ client }) => {
    const response = await client.get('/api/v1/regions')

    response.assertStatus(200)
    response.assertBodyContains({ success: true })

    const body = response.body()
    const { data } = body

    // Vérifie que c'est un tableau
    // @ts-ignore
    client.assert.isArray(data)
    // @ts-ignore
    client.assert.isAbove(data.length, 0)

    // Vérifie qu'on a exactement les régions (sans départements)
    const firstRegion = data[0]
    // @ts-ignore
    client.assert.property(firstRegion, 'id')
    // @ts-ignore
    client.assert.property(firstRegion, 'name')
    // @ts-ignore
    client.assert.notProperty(firstRegion, 'departements')

    // Vérifie que les régions sont triées alphabétiquement
    const regionNames = data.map((r: { name: string }) => r.name)
    const sortedNames = [...regionNames].sort()
    // @ts-ignore
    client.assert.deepEqual(regionNames, sortedNames)
  })

  test('GET /api/v1/regions/:id - should return region with departments (no communes)', async ({
    client,
  }) => {
    const response = await client.get('/api/v1/regions/1')

    response.assertStatus(200)
    response.assertBodyContains({ success: true })

    const body = response.body()
    const { data } = body

    // Vérifie la structure de la région
    // @ts-ignore
    client.assert.property(data, 'id')
    // @ts-ignore
    client.assert.property(data, 'name')
    // @ts-ignore
    client.assert.property(data, 'departements')

    // Vérifie que departements est un tableau
    // @ts-ignore
    client.assert.isArray(data.departements)

    // Si la région a des départements, vérifie qu'ils n'ont pas de communes
    if (data.departements.length > 0) {
      const firstDept = data.departements[0]
      // @ts-ignore
      client.assert.property(firstDept, 'id')
      // @ts-ignore
      client.assert.property(firstDept, 'name')
      // @ts-ignore
      client.assert.notProperty(firstDept, 'communes')

      // Vérifie le tri alphabétique des départements
      const deptNames = data.departements.map((d: { name: string }) => d.name)
      const sortedDeptNames = [...deptNames].sort()
      // @ts-ignore
      client.assert.deepEqual(deptNames, sortedDeptNames)
    }
  })

  test('GET /api/v1/regions/:id - should return 404 for non-existent region', async ({
    client,
  }) => {
    const response = await client.get('/api/v1/regions/999999')

    response.assertStatus(404)
  })

  test('GET /api/v1/regions/:regionId/departements - should return departments of a region', async ({
    client,
  }) => {
    const response = await client.get('/api/v1/regions/1/departements')

    response.assertStatus(200)
    response.assertBodyContains({ success: true })

    const body = response.body()
    const { data } = body

    // @ts-ignore
    client.assert.isArray(data)

    // Vérifie la structure des départements
    if (data.length > 0) {
      const firstDept = data[0]
      // @ts-ignore
      client.assert.property(firstDept, 'id')
      // @ts-ignore
      client.assert.property(firstDept, 'name')
      // @ts-ignore
      client.assert.property(firstDept, 'region_id')
      // @ts-ignore
      client.assert.notProperty(firstDept, 'communes')

      // Vérifie que tous les départements appartiennent à la région
      data.forEach((dept: { region_id: number }) => {
        // @ts-ignore
        client.assert.equal(dept.region_id, 1)
      })

      // Vérifie le tri alphabétique
      const deptNames = data.map((d: { name: string }) => d.name)
      const sortedNames = [...deptNames].sort()
      // @ts-ignore
      client.assert.deepEqual(deptNames, sortedNames)
    }
  })

  test('GET /api/v1/regions/:regionId/departements/:departementId - should return region, department and communes', async ({
    client,
  }) => {
    // D'abord, récupérer une région avec ses départements
    const regionsResponse = await client.get('/api/v1/regions/1')
    const region = regionsResponse.body().data

    if (region.departements.length > 0) {
      const departementId = region.departements[0].id

      const response = await client.get(`/api/v1/regions/1/departements/${departementId}`)

      response.assertStatus(200)
      response.assertBodyContains({ success: true })

      const body = response.body()
      const { data } = body

      // Vérifie la structure de la réponse
      // @ts-ignore
      client.assert.property(data, 'region')
      // @ts-ignore
      client.assert.property(data, 'departement')

      // Vérifie la région
      // @ts-ignore
      client.assert.property(data.region, 'id')
      // @ts-ignore
      client.assert.property(data.region, 'name')

      // Vérifie le département
      // @ts-ignore
      client.assert.property(data.departement, 'id')
      // @ts-ignore
      client.assert.property(data.departement, 'name')
      // @ts-ignore
      client.assert.property(data.departement, 'communes')

      // Vérifie les communes
      // @ts-ignore
      client.assert.isArray(data.departement.communes)

      if (data.departement.communes.length > 0) {
        const firstCommune = data.departement.communes[0]
        // @ts-ignore
        client.assert.property(firstCommune, 'id')
        // @ts-ignore
        client.assert.property(firstCommune, 'name')
        // @ts-ignore
        client.assert.property(firstCommune, 'departement_id')

        // Vérifie le tri alphabétique des communes
        const communeNames = data.departement.communes.map((c: { name: string }) => c.name)
        const sortedNames = [...communeNames].sort()
        // @ts-ignore
        client.assert.deepEqual(communeNames, sortedNames)
      }
    }
  })

  test('GET /api/v1/regions/:regionId/departements/:departementId - should return 404 for non-existent region', async ({
    client,
  }) => {
    const response = await client.get('/api/v1/regions/999999/departements/1')

    response.assertStatus(404)
  })

  test('GET /api/v1/regions/:regionId/departements/:departementId - should return 404 for non-existent department', async ({
    client,
  }) => {
    const response = await client.get('/api/v1/regions/1/departements/999999')

    response.assertStatus(404)
  })

  test('GET /api/v1/regions/:regionId/departements/:departementId - should return 404 when department does not belong to region', async ({
    client,
  }) => {
    // Récupérer deux régions différentes
    const region1Response = await client.get('/api/v1/regions/1')
    const region2Response = await client.get('/api/v1/regions/2')

    const region1 = region1Response.body().data
    const region2 = region2Response.body().data

    if (region1.departements.length > 0 && region2.departements.length > 0) {
      const dept1 = region1.departements[0].id

      // Essayer d'accéder au département de la région 1 via la région 2
      const response = await client.get(`/api/v1/regions/2/departements/${dept1}`)

      response.assertStatus(404)
    }
  })
})
