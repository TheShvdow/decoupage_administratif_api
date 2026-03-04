# feat: ajout des localités — 4ème niveau du découpage administratif

## Résumé global

Cette branche complète le découpage administratif du Sénégal en ajoutant le **4ème niveau hiérarchique : les localités** (villages, quartiers). Elle s'appuie sur la base déjà construite (régions → départements → communes) pour l'étendre avec les localités, ainsi que les routes, le modèle, la migration et les tests associés.

---

## Fonctionnalités principales ajoutées

- **Localités** : nouveau modèle `Localite` avec relation `belongsTo Commune`
- **`LocalitesController`** : liste, détail, pagination, filtre par `commune_id`, hiérarchie complète (localité → commune → département → région)
- **`GET /api/v1/communes/:id/localites`** : liste des localités d'une commune
- **Pagination** sur `GET /api/v1/localites` (`?page=&limit=`)
- **Filtre** par `?commune_id=` sur la liste des localités

---

## Nouveaux endpoints API

| Méthode | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/localites` | Liste toutes les localités (filtre `?commune_id=`, pagination `?page=&limit=`) |
| `GET` | `/api/v1/localites/:id` | Localité avec hiérarchie complète (commune → département → région) |
| `GET` | `/api/v1/communes/:id/localites` | Localités d'une commune donnée |

> **Rappel — endpoints existants :**
> `GET /api/v1/regions`, `/regions/:id`, `/regions/:regionId/departements`, `/regions/:regionId/departements/:departementId`, `/departements`, `/departements/:id`, `/departements/:id/communes`, `/communes`, `/communes/:id`, `/search?q=&type=`, `/stats`, `/health`, `/docs`, `/api/openapi.json`

---

## Changements techniques importants

- **Migration** `1772601331887_localites.ts` — nouvelle table `localites` avec `FK → communes`
- **Modèle** `app/Models/Localite.ts` — relation `belongsTo` vers `Commune`
- **Contrôleur** `app/Controllers/Http/LocalitesController.ts` — index, show, validation `ValidateId`
- **Route** `CommunesController.localites` — sous-ressource ajoutée
- Mise à jour du **seeder** et des **données** `database/data/senegal.ts` avec les localités
- Mise à jour des **specs OpenAPI** (`config/swagger.ts`) pour documenter les nouveaux endpoints

---

## Tests ajoutés

- **`tests/functional/localites.spec.ts`** — nouveau fichier de tests (11 cas)
- **`tests/functional/communes.spec.ts`** — 4 nouveaux cas pour `GET /api/v1/communes/:id/localites`

### Cas testés

- Liste toutes les localités
- Filtre `?commune_id=`
- Pagination `?page=1&limit=10`
- Localité avec hiérarchie complète
- 404 localité inexistante
- 400 id non numérique
- 400 `commune_id` non numérique
- Tableau vide pour `commune_id` inexistant
- Cohérence des données sur plusieurs requêtes
- Cohérence de la hiérarchie (localité → commune → département → région)
- `GET /api/v1/communes/:id/localites` — 404, 400, liste vide

---

## Résultats des tests

```
Tests : 65 passed (65)
```

**65/65 tests passent** (7 suites : communes, departements, docs, localites, regions, search, stats)
