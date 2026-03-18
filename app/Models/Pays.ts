import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'

export default class Pays extends BaseModel {
  public static table = 'pays'

  @column({ isPrimary: true })
  declare public id: number

  @column()
  declare public name: string

  @column()
  declare public geometry: object | null

  @column()
  declare public superficieKm2: number | null

  @column()
  declare public population: number | null

  @column()
  declare public densite: number | null

  @column.dateTime({ autoCreate: true, serializeAs: null })
  declare public createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  declare public updatedAt: DateTime
}
