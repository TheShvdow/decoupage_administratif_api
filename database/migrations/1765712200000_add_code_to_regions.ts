import BaseSchema from '@ioc:Adonis/Lucid/Schema'

export default class extends BaseSchema {
  protected tableName = 'regions'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Pas de unique() ici car la table a déjà des lignes avec la valeur par défaut ''.
      // La contrainte unique sera ajoutée après le seed via la migration 1765712220000.
      table.string('code').notNullable().defaultTo('')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('code')
    })
  }
}
