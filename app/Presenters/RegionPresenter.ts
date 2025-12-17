import Region from 'App/Models/Region'

export default class RegionPresenter {
  public static one(region: Region) {
    return {
      id: region.id,
      name: region.name,
      departements: region.departements?.map((d) => ({
        id: d.id,
        name: d.name,
        communes: d.communes?.map((c) => ({
          id: c.id,
          name: c.name,
        })),
      })),
    }
  }

  public static many(regions: Region[]) {
    return regions.map(this.one)
  }
}
