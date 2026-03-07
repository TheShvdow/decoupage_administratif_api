import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'pays'

  public async up() {
    const tableExists = await this.db.rawQuery(
      "SELECT to_regclass('public.pays') AS name"
    )
    if (!tableExists.rows[0]?.name) {
      this.schema.createTable(this.tableName, (table) => {
        table.increments('id').primary()
        table.string('name').notNullable()
        table.specificType('geometry', 'geometry(MultiPolygon,4326)').nullable()
        table.double('superficie_km2').nullable()
        table.bigInteger('population').nullable()
        table.double('densite').nullable()
        table.timestamp('created_at', { useTz: true })
        table.timestamp('updated_at', { useTz: true })
      })
    }

    // Index créé après la table (idempotent)
    this.schema.raw(
      'CREATE INDEX IF NOT EXISTS idx_pays_geom ON pays USING GIST (geometry)'
    )
  }

  public async down() {
    this.schema.dropTableIfExists(this.tableName)
  }
}
