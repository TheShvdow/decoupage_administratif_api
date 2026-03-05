# feat: ajout des coordonnées GPS pour les régions et départements

## Résumé global

Cette branche enrichit les données des **régions** et **départements** du Sénégal en ajoutant des **coordonnées géographiques** (latitude, longitude) ainsi qu'un **code administratif** pour les départements.

---

## Fonctionnalités principales ajoutées

- **Coordonnées GPS des régions** : champs `lat` et `lon` ajoutés aux 14 régions
- **Coordonnées GPS des départements** : champs `lat` et `lon` ajoutés aux 46 départements
- **Code administratif des départements** : champ `code` ajouté aux 46 départements

---

## Changements techniques importants

- **Migration** `1772601340000_add_coordinates_to_regions_and_departements.ts` — ajout des colonnes `lat`, `lon` à `regions` et `code`, `lat`, `lon` à `departements`
- **Modèle** `app/Models/Region.ts` — ajout des propriétés `lat` et `lon`
- **Modèle** `app/Models/Departement.ts` — ajout des propriétés `code`, `lat` et `lon`
- **Script** `scripts/import_coordinates.ts` — lecture des CSV, normalisation des noms (accents, tirets), mise à jour via Lucid Database, résumé final
- **Specs OpenAPI** (`config/swagger.ts`) — schémas `Region`, `RegionWithDepartements`, `Departement`, `DepartementWithCommunes` mis à jour avec `lat`, `lon`, `code`
- **Tests** — vérification de la présence des champs `lat`, `lon` dans les réponses régions et `code`, `lat`, `lon` dans les réponses départements
- **README.md** — descriptions des entités mises à jour

---

## Réponses JSON mises à jour

### Region

```json
{
  "id": 1,
  "name": "Dakar",
  "code": "DK",
  "lat": 14.7546268300533,
  "lon": -17.265298801692
}
```

### Departement

```json
{
  "id": 1,
  "name": "Dakar",
  "code": "DK",
  "region_id": 1,
  "lat": 14.7224089876618,
  "lon": -17.4602367337582
}
```

## Tests mis à jour

- **`tests/functional/regions.spec.ts`** — vérification des propriétés `lat` et `lon`
- **`tests/functional/departements.spec.ts`** — vérification des propriétés `code`, `lat` et `lon`
