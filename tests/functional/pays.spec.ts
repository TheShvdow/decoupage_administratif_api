import { test } from '@japa/runner'
import Database from '@ioc:Adonis/Lucid/Database'

test.group('Pays', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  test('GET /api/v1/pays - should return national statistics or 404 if not yet imported', async ({
    client,
  }) => {
    const response = await client.get('/api/v1/pays')

    // 404 is acceptable before running `pnpm migrate-geo`
    if (response.status() === 404) return

    response.assertStatus(200)
    response.assertBodyContains({ success: true })

    const body = response.body()
    const { data } = body

    // @ts-ignore
    client.assert.property(data, 'name')
    // @ts-ignore
    client.assert.property(data, 'superficie_km2')
    // @ts-ignore
    client.assert.property(data, 'population')
    // @ts-ignore
    client.assert.property(data, 'densite')
    // @ts-ignore
    client.assert.isString(data.name)
  })

  test('GET /api/v1/map/pays - should return GeoJSON Feature or 404 if not yet imported', async ({
    client,
  }) => {
    const response = await client.get('/api/v1/map/pays')

    // 404 is acceptable before running `pnpm migrate-geo`
    if (response.status() === 404) return

    response.assertStatus(200)

    const body = response.body()

    // @ts-ignore
    client.assert.equal(body.type, 'Feature')
    // @ts-ignore
    client.assert.property(body, 'geometry')
    // @ts-ignore
    client.assert.property(body, 'properties')
    // @ts-ignore
    client.assert.equal(body.geometry.type, 'MultiPolygon')
    // @ts-ignore
    client.assert.property(body.properties, 'name')
    // @ts-ignore
    client.assert.property(body.properties, 'superficie_km2')
  })
})
