import { test } from '@japa/runner'
import Database from '@ioc:Adonis/Lucid/Database'

test.group('Map (GeoJSON)', (group) => {
  group.each.setup(async () => {
    await Database.beginGlobalTransaction()
    return () => Database.rollbackGlobalTransaction()
  })

  // ── /api/v1/map/regions ──────────────────────────────────────────

  test('GET /api/v1/map/regions - should return GeoJSON FeatureCollection', async ({ client }) => {
    const response = await client.get('/api/v1/map/regions')

    response.assertStatus(200)

    const body = response.body()
    // @ts-ignore
    client.assert.equal(body.type, 'FeatureCollection')
    // @ts-ignore
    client.assert.isArray(body.features)
  })

  test('GET /api/v1/map/regions - features should have correct structure', async ({ client }) => {
    const response = await client.get('/api/v1/map/regions')
    const body = response.body()

    if (body.features.length > 0) {
      const feature = body.features[0]
      // @ts-ignore
      client.assert.equal(feature.type, 'Feature')
      // @ts-ignore
      client.assert.property(feature, 'geometry')
      // @ts-ignore
      client.assert.property(feature, 'properties')
      // @ts-ignore
      client.assert.property(feature.properties, 'id')
      // @ts-ignore
      client.assert.property(feature.properties, 'name')
      // @ts-ignore
      client.assert.property(feature.properties, 'superficie_km2')
      // @ts-ignore
      client.assert.property(feature.properties, 'population')
      // @ts-ignore
      client.assert.property(feature.properties, 'densite')
    }
  })

  // ── /api/v1/map/departements ─────────────────────────────────────

  test('GET /api/v1/map/departements - should return GeoJSON FeatureCollection', async ({
    client,
  }) => {
    const response = await client.get('/api/v1/map/departements')

    response.assertStatus(200)

    const body = response.body()
    // @ts-ignore
    client.assert.equal(body.type, 'FeatureCollection')
    // @ts-ignore
    client.assert.isArray(body.features)
  })

  test('GET /api/v1/map/departements?region_id=1 - should filter by region', async ({ client }) => {
    const response = await client.get('/api/v1/map/departements?region_id=1')

    response.assertStatus(200)

    const body = response.body()
    // @ts-ignore
    client.assert.equal(body.type, 'FeatureCollection')

    if (body.features.length > 0) {
      body.features.forEach((f: { properties: { region_id: number } }) => {
        // @ts-ignore
        client.assert.equal(f.properties.region_id, 1)
      })
    }
  })

  // ── /api/v1/map/communes ─────────────────────────────────────────

  test('GET /api/v1/map/communes - should return GeoJSON FeatureCollection', async ({ client }) => {
    const response = await client.get('/api/v1/map/communes')

    response.assertStatus(200)

    const body = response.body()
    // @ts-ignore
    client.assert.equal(body.type, 'FeatureCollection')
    // @ts-ignore
    client.assert.isArray(body.features)
  })

  test('GET /api/v1/map/communes?departement_id=1 - should filter by departement', async ({
    client,
  }) => {
    const response = await client.get('/api/v1/map/communes?departement_id=1')

    response.assertStatus(200)

    const body = response.body()
    // @ts-ignore
    client.assert.equal(body.type, 'FeatureCollection')

    if (body.features.length > 0) {
      body.features.forEach((f: { properties: { departement_id: number } }) => {
        // @ts-ignore
        client.assert.equal(f.properties.departement_id, 1)
      })
    }
  })

  // ── /api/v1/map/localites ─────────────────────────────────────────

  test('GET /api/v1/map/localites - should return GeoJSON FeatureCollection', async ({ client }) => {
    const response = await client.get('/api/v1/map/localites?limit=10')

    response.assertStatus(200)

    const body = response.body()
    // @ts-ignore
    client.assert.equal(body.type, 'FeatureCollection')
    // @ts-ignore
    client.assert.isArray(body.features)
  })

  test('GET /api/v1/map/localites - features should have coordinate properties', async ({
    client,
  }) => {
    const response = await client.get('/api/v1/map/localites?limit=5')
    const body = response.body()

    if (body.features.length > 0) {
      const feature = body.features[0]
      // @ts-ignore
      client.assert.equal(feature.type, 'Feature')
      // @ts-ignore
      client.assert.property(feature.properties, 'id')
      // @ts-ignore
      client.assert.property(feature.properties, 'name')
      // @ts-ignore
      client.assert.property(feature.properties, 'commune_id')
      // @ts-ignore
      client.assert.property(feature.properties, 'population')
    }
  })
})
