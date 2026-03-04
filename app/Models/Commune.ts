import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import Departement from './Departement'
import Localite from './Localite'

export default class Commune extends BaseModel {
  @column({ isPrimary: true })
  declare public id: number

  @column()
  declare public name: string

  @column()
  declare public departementId: number

  @column()
  declare public lat: number

  @column()
  declare public lon: number

  @column()
  declare public elevation: number | null

  @column.dateTime({ autoCreate: true, serializeAs: null })
  declare public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  declare public updatedAt: DateTime

  @hasMany(() => Localite)
  declare public localites: HasMany<typeof Localite>

  @belongsTo(() => Departement)
  declare public departement: BelongsTo<typeof Departement>
}
