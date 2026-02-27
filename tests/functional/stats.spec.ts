import { test } from '@japa/runner'

test.group('Stats', () => {
  test('GET /api/v1/stats - should return global statistics', async ({ client }) => {
    const response = await client.get('/api/v1/stats')
    response.assertStatus(200)
    response.assertBodyContains({ success: true })

    const body = response.body()
    const { data } = body

    // @ts-ignore
    client.assert.property(data, 'regions')
    // @ts-ignore
    client.assert.property(data, 'departements')
    // @ts-ignore
    client.assert.property(data, 'communes')
    // @ts-ignore
    client.assert.isNumber(data.regions)
    // @ts-ignore
    client.assert.isNumber(data.departements)
    // @ts-ignore
    client.assert.isNumber(data.communes)

    // Le Sénégal a exactement 14 régions
    // @ts-ignore
    client.assert.equal(data.regions, 14)
    // @ts-ignore
    client.assert.isAbove(data.departements, 0)
    // @ts-ignore
    client.assert.isAbove(data.communes, 0)
  })

  test('GET /api/v1/stats - communes count should match actual communes', async ({ client }) => {
    const statsResponse = await client.get('/api/v1/stats')
    const communesResponse = await client.get('/api/v1/communes')

    const stats = statsResponse.body().data
    const communes = communesResponse.body().data

    // @ts-ignore
    client.assert.equal(stats.communes, communes.length)
  })
})
