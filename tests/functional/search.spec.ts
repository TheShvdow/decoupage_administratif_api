import { test } from '@japa/runner'
import Database from '@ioc:Adonis/Lucid/Database'

test.group('Search', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('GET /api/v1/search?q=dakar - should return results across all types', async ({
    client,
  }) => {
    const response = await client.get('/api/v1/search?q=dakar')
    response.assertStatus(200)
    response.assertBodyContains({ success: true })

    const body = response.body()
    const { data } = body

    // @ts-ignore
    client.assert.property(data, 'query')
    // @ts-ignore
    client.assert.property(data, 'total')
    // @ts-ignore
    client.assert.property(data, 'results')
    // @ts-ignore
    client.assert.property(data.results, 'regions')
    // @ts-ignore
    client.assert.property(data.results, 'departements')
    // @ts-ignore
    client.assert.property(data.results, 'communes')
    // @ts-ignore
    client.assert.isArray(data.results.regions)
    // @ts-ignore
    client.assert.isArray(data.results.departements)
    // @ts-ignore
    client.assert.isArray(data.results.communes)
    // @ts-ignore
    client.assert.equal(data.query, 'dakar')
    // @ts-ignore
    client.assert.isAbove(data.total, 0)
  })

  test('GET /api/v1/search - should return 400 when q is missing', async ({ client }) => {
    const response = await client.get('/api/v1/search')
    response.assertStatus(400)
    response.assertBodyContains({ success: false })
  })

  test('GET /api/v1/search?q=a - should return 400 when q is too short (< 2 chars)', async ({
    client,
  }) => {
    const response = await client.get('/api/v1/search?q=a')
    response.assertStatus(400)
    response.assertBodyContains({ success: false })
  })

  test('GET /api/v1/search?q=dakar&type=region - should filter results by type region', async ({
    client,
  }) => {
    const response = await client.get('/api/v1/search?q=dakar&type=region')
    response.assertStatus(200)
    response.assertBodyContains({ success: true })

    const body = response.body()
    const { data } = body

    // @ts-ignore
    client.assert.isAbove(data.results.regions.length, 0)
    // @ts-ignore
    client.assert.notProperty(data.results, 'departements')
    // @ts-ignore
    client.assert.notProperty(data.results, 'communes')
  })

  test('GET /api/v1/search?q=xyz_nonexistent_99 - should return empty results with total 0', async ({
    client,
  }) => {
    const response = await client.get('/api/v1/search?q=xyz_nonexistent_99')
    response.assertStatus(200)
    response.assertBodyContains({ success: true })

    const body = response.body()
    // @ts-ignore
    client.assert.equal(body.data.total, 0)
    // @ts-ignore
    client.assert.equal(body.data.results.regions.length, 0)
    // @ts-ignore
    client.assert.equal(body.data.results.departements.length, 0)
    // @ts-ignore
    client.assert.equal(body.data.results.communes.length, 0)
  })

  test('GET /api/v1/search - total should equal sum of all result arrays', async ({ client }) => {
    const response = await client.get('/api/v1/search?q=saint')
    response.assertStatus(200)

    const body = response.body()
    const { data } = body
    const expected =
      data.results.regions.length + data.results.departements.length + data.results.communes.length
    // @ts-ignore
    client.assert.equal(data.total, expected)
  })

  test('GET /api/v1/search?q=dakar&type=region - region results should include code field', async ({
    client,
  }) => {
    const response = await client.get('/api/v1/search?q=dakar&type=region')
    response.assertStatus(200)

    const body = response.body()
    if (body.data.results.regions.length > 0) {
      const firstRegion = body.data.results.regions[0]
      // @ts-ignore
      client.assert.property(firstRegion, 'code')
      // @ts-ignore
      client.assert.isString(firstRegion.code)
    }
  })

  test('GET /api/v1/search?q=dakar&type=commune - commune results should include GPS coordinates', async ({
    client,
  }) => {
    const response = await client.get('/api/v1/search?q=dakar&type=commune')
    response.assertStatus(200)

    const body = response.body()
    if (body.data.results.communes.length > 0) {
      const firstCommune = body.data.results.communes[0]
      // @ts-ignore
      client.assert.property(firstCommune, 'lat')
      // @ts-ignore
      client.assert.property(firstCommune, 'lon')
      // @ts-ignore
      client.assert.property(firstCommune, 'elevation')
      // @ts-ignore
      client.assert.isNumber(firstCommune.lat)
      // @ts-ignore
      client.assert.isNumber(firstCommune.lon)
    }
  })
})
