import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import Region from 'App/Models/Region'
import Departement from 'App/Models/Departement'
import Commune from 'App/Models/Commune'
import { senegal } from '../data/senegal'

export default class SenegalSeeder extends BaseSeeder {
  public async run() {
    await Region.query().delete()
    for (const regionData of senegal) {
      const region = await Region.create({
        name: regionData.name,
      })

      for (const deptData of regionData.departements) {
        const departement = await Departement.create({
          name: deptData.name,
          regionId: region.id,
        })

        for (const communeName of deptData.communes) {
          await Commune.create({
            name: communeName,
            departementId: departement.id,
          })
        }
      }
    }
  }
}
