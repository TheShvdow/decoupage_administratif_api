import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'regions'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.unique(['code'])
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropUnique(['code'])
    })
  }
}
