import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'communes'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.double('lat').notNullable().defaultTo(0)
      table.double('lon').notNullable().defaultTo(0)
      table.integer('elevation').nullable()
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('lat')
      table.dropColumn('lon')
      table.dropColumn('elevation')
    })
  }
}
