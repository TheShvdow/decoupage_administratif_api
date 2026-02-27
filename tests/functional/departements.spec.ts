import { test } from '@japa/runner'
import Database from '@ioc:Adonis/Lucid/Database'

test.group('Departements', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('GET /api/v1/departements - should return list of all departments only', async ({
    client,
  }) => {
    const response = await client.get('/api/v1/departements')

    response.assertStatus(200)
    response.assertBodyContains({ success: true })

    const body = response.body()
    const { data } = body

    // Vérifie que c'est un tableau
    // @ts-ignore
    client.assert.isArray(data)
    // @ts-ignore
    client.assert.isAbove(data.length, 0)

    // Vérifie la structure d'un département
    const firstDept = data[0]
    // @ts-ignore
    client.assert.property(firstDept, 'id')
    // @ts-ignore
    client.assert.property(firstDept, 'name')
    // @ts-ignore
    client.assert.property(firstDept, 'region_id')
    // @ts-ignore
    client.assert.notProperty(firstDept, 'communes')
    // @ts-ignore
    client.assert.notProperty(firstDept, 'region')

    // Vérifie le tri alphabétique
    const deptNames = data.map((d: { name: string }) => d.name)
    const sortedNames = [...deptNames].sort()
    // @ts-ignore
    client.assert.deepEqual(deptNames, sortedNames)
  })

  test('GET /api/v1/departements?region_id=1 - should filter departments by region', async ({
    client,
  }) => {
    const response = await client.get('/api/v1/departements?region_id=1')

    response.assertStatus(200)
    response.assertBodyContains({ success: true })

    const body = response.body()
    const { data } = body

    // @ts-ignore
    client.assert.isArray(data)

    // Vérifie que tous les départements appartiennent à la région 1
    data.forEach((dept: { region_id: number }) => {
      // @ts-ignore
      client.assert.equal(dept.region_id, 1)
    })

    // Vérifie le tri alphabétique
    if (data.length > 0) {
      const deptNames = data.map((d: { name: string }) => d.name)
      const sortedNames = [...deptNames].sort()
      // @ts-ignore
      client.assert.deepEqual(deptNames, sortedNames)
    }
  })

  test('GET /api/v1/departements/:id - should return department with communes', async ({
    client,
  }) => {
    const response = await client.get('/api/v1/departements/1')

    response.assertStatus(200)
    response.assertBodyContains({ success: true })

    const body = response.body()
    const { data } = body

    // Vérifie la structure du département
    // @ts-ignore
    client.assert.property(data, 'id')
    // @ts-ignore
    client.assert.property(data, 'name')
    // @ts-ignore
    client.assert.property(data, 'region_id')
    // @ts-ignore
    client.assert.property(data, 'communes')

    // Vérifie que communes est un tableau
    // @ts-ignore
    client.assert.isArray(data.communes)

    // Vérifie la structure des communes
    if (data.communes.length > 0) {
      const firstCommune = data.communes[0]
      // @ts-ignore
      client.assert.property(firstCommune, 'id')
      // @ts-ignore
      client.assert.property(firstCommune, 'name')
      // @ts-ignore
      client.assert.property(firstCommune, 'departement_id')

      // Vérifie que toutes les communes appartiennent au département
      data.communes.forEach((commune: { departement_id: number }) => {
        // @ts-ignore
        client.assert.equal(commune.departement_id, data.id)
      })

      // Vérifie le tri alphabétique des communes
      const communeNames = data.communes.map((c: { name: string }) => c.name)
      const sortedNames = [...communeNames].sort()
      // @ts-ignore
      client.assert.deepEqual(communeNames, sortedNames)
    }
  })

  test('GET /api/v1/departements/:id - should return 404 for non-existent department', async ({
    client,
  }) => {
    const response = await client.get('/api/v1/departements/999999')

    response.assertStatus(404)
  })

  test('GET /api/v1/departements/:id/communes - should return communes of a department', async ({
    client,
  }) => {
    const response = await client.get('/api/v1/departements/1/communes')

    response.assertStatus(200)
    response.assertBodyContains({ success: true })

    const body = response.body()
    const { data } = body

    // @ts-ignore
    client.assert.isArray(data)

    // Vérifie la structure des communes
    if (data.length > 0) {
      const firstCommune = data[0]
      // @ts-ignore
      client.assert.property(firstCommune, 'id')
      // @ts-ignore
      client.assert.property(firstCommune, 'name')
      // @ts-ignore
      client.assert.property(firstCommune, 'departement_id')

      // Vérifie que toutes les communes appartiennent au département
      data.forEach((commune: { departement_id: number }) => {
        // @ts-ignore
        client.assert.equal(commune.departement_id, 1)
      })

      // Vérifie le tri alphabétique
      const communeNames = data.map((c: { name: string }) => c.name)
      const sortedNames = [...communeNames].sort()
      // @ts-ignore
      client.assert.deepEqual(communeNames, sortedNames)
    }
  })

  test('GET /api/v1/departements/:id/communes - should return 404 for non-existent department', async ({
    client,
  }) => {
    const response = await client.get('/api/v1/departements/999999/communes')

    response.assertStatus(404)
  })

  test('GET /api/v1/departements/abc - should return 400 for non-numeric id', async ({ client }) => {
    const response = await client.get('/api/v1/departements/abc')
    response.assertStatus(400)
    response.assertBodyContains({ success: false })
  })

  test('GET /api/v1/departements?region_id=abc - should return 400 for non-numeric region_id', async ({
    client,
  }) => {
    const response = await client.get('/api/v1/departements?region_id=abc')
    response.assertStatus(400)
    response.assertBodyContains({ success: false })
  })

  test('GET /api/v1/departements/:id/communes - should return empty array for department without communes', async ({
    client,
  }) => {
    // Récupérer tous les départements
    const deptsResponse = await client.get('/api/v1/departements')
    const departments = deptsResponse.body().data

    // Trouver un département sans communes (si existant)
    for (const dept of departments) {
      const deptDetailResponse = await client.get(`/api/v1/departements/${dept.id}`)
      const deptDetail = deptDetailResponse.body().data

      if (deptDetail.communes.length === 0) {
        const response = await client.get(`/api/v1/departements/${dept.id}/communes`)

        response.assertStatus(200)
        response.assertBodyContains({ success: true })

        const body = response.body()
        // @ts-ignore
        client.assert.isArray(body.data)
        // @ts-ignore
        client.assert.equal(body.data.length, 0)
        break
      }
    }
  })
})
