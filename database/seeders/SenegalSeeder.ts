import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Region from 'App/Models/Region'
import Departement from 'App/Models/Departement'
import Commune from 'App/Models/Commune'
import Database from '@ioc:Adonis/Lucid/Database'
import { senegal } from '../data/senegal'

export default class SenegalSeeder extends BaseSeeder {
  public async run() {
    // TRUNCATE avec RESTART IDENTITY remet les séquences à 1
    await Database.rawQuery('TRUNCATE TABLE communes, departements, regions RESTART IDENTITY CASCADE')
    for (const regionData of senegal) {
      const region = await Region.create({
        name: regionData.name,
        code: regionData.code,
      })

      for (const deptData of regionData.departements) {
        const departement = await Departement.create({
          name: deptData.name,
          regionId: region.id,
        })

        for (const communeData of deptData.communes) {
          await Commune.create({
            name: communeData.name,
            lat: communeData.lat,
            lon: communeData.lon,
            elevation: communeData.elevation,
            departementId: departement.id,
          })
        }
      }
    }
  }
}
