import { DateTime } from 'luxon'
import { BaseModel, BelongsTo, belongsTo, column, HasMany, hasMany } from '@ioc:Adonis/Lucid/Orm'
import Commune from './Commune'
import Region from './Region'

export default class Departement extends BaseModel {
  @column({ isPrimary: true })
  declare public id: number

  @column()
  declare public name: string

  @column()
  declare public regionId: number

  @column.dateTime({ autoCreate: true, serializeAs: null })
  declare public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  declare public updatedAt: DateTime

  @hasMany(() => Commune)
  declare public communes: HasMany<typeof Commune>

  @belongsTo(() => Region)
  declare public region: BelongsTo<typeof Region>
}
