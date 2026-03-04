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
  
  @column.dateTime({ autoCreate: true, serializeAs: null })
  declare public createdAt: DateTime
  
  @column.dateTime({ autoCreate: true, autoUpdate: true, serializeAs: null })
  declare public updatedAt: DateTime
  
  @belongsTo(() => Commune)
  declare public commune: BelongsTo<typeof Commune>
}
