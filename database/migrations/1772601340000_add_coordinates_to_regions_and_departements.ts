import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  public async up() {
    this.schema.alterTable('regions', (table) => {
      table.double('lat').nullable()
      table.double('lon').nullable()
      table.integer('elevation').nullable()
    })

    this.schema.alterTable('departements', (table) => {
      table.string('code').nullable()
      table.double('lat').nullable()
      table.double('lon').nullable()
      table.integer('elevation').nullable()
    })
  }

  public async down() {
    this.schema.alterTable('regions', (table) => {
      table.dropColumn('lat')
      table.dropColumn('lon')
      table.dropColumn('elevation')
    })

    this.schema.alterTable('departements', (table) => {
      table.dropColumn('code')
      table.dropColumn('lat')
      table.dropColumn('lon')
      table.dropColumn('elevation')
    })
  }
}
