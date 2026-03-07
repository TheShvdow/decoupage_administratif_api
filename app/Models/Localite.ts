import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, BelongsTo } from '@ioc:Adonis/Lucid/Orm'
import Commune from './Commune'

export default class Localite extends BaseModel {
  @column({ isPrimary: true })
  declare public id: number

  @column()
  declare public name: string

  @column()
  declare public communeId: number

  @column()
  declare public departementId: number | null

  @column()
  declare public regionId: number | null

  @column()
  declare public lat: number | null

  @column()
  declare public lon: number | null

  @column()
  declare public elevation: number | null

  @column()
  declare public geometry: object | null

  @column()
  declare public superficieKm2: number | null

  @column()
  declare public population: number | null

  @column()
  declare public densite: number | null

  @column()
  declare public normalizedName: string | null

  @column.dateTime({ autoCreate: true, serializeAs: null })
  declare public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  declare public updatedAt: DateTime

  @belongsTo(() => Commune)
  declare public commune: BelongsTo<typeof Commune>
}
