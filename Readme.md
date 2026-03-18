# SenGeoMap API 🇸🇳

API REST géospatiale du Sénégal construite avec **AdonisJS v5 (TypeScript)**, **PostgreSQL + PostGIS** et les données de population du **recensement ANSD 2023**.

Fournit le découpage administratif complet (régions, départements, communes, localités), les **polygones MultiPolygon** de chaque entité, et des **endpoints GeoJSON** prêts pour Leaflet, Mapbox, OpenLayers ou D3.js.

---

## 🚀 Fonctionnalités

- 🇸🇳 **Sénégal (pays)** — polygone national, population, densité, superficie
- 📍 **14 régions** — polygones MultiPolygon, code, population, densité, superficie
- 🏘️ **46 départements** — polygones MultiPolygon, population, densité, superficie
- 🏠 **552 communes** — polygones MultiPolygon, coordonnées GPS, population, densité
- 📌 **25 515 localités** — polygones Voronoï, coordonnées GPS, population ANSD 2023, densité
- 🗺️ **Endpoints GeoJSON** (`/api/v1/map/*`) — FeatureCollections conformes RFC 7946
- 🔍 **Recherche** par nom avec filtre multi-niveaux (région, département, commune, localité)
- 📊 **Statistiques globales** (compteurs + données pays)
- 📄 Pagination (`page`, `limit`) sur communes et localités
- 🌐 CORS activé
- 🛡️ Validation des paramètres d'URL (IDs numériques)
- 📦 Réponses JSON uniformisées `{ success, message, data }`
- 📖 Documentation interactive (Redoc + OpenAPI)
- 🧪 **75 tests fonctionnels** (Japa)

---

## 📊 Données de population

Les données proviennent du **Recensement Général de la Population et de l'Habitat (RGPH) 2023** de l'ANSD.

| Niveau | Couverture |
|--------|------------|
| Pays | 1 / 1 |
| Régions | 14 / 14 |
| Départements | 46 / 46 |
| Communes | 552 / 552 |
| Localités | 25 515 / 25 515 |

**Population totale : ~22 488 341 habitants**

Les densités (`densite`, hab/km²) sont calculées à partir de `population` / `superficie_km2`.

---

## � Sources des données

| Donnée | Source | Détail |
|--------|--------|--------|
| Découpage administratif (régions, départements, communes) | [decoupage_administratif_api](https://github.com/TheShvdow/decoupage_administratif_api) | Hiérarchie, codes, coordonnées GPS, altitudes |
| Polygones administratifs (frontières) | [GADM](https://gadm.org/download_country.html) — Sénégal | Niveaux 0 (pays), 1 (régions), 2 (départements), 3 (communes) — format GeoJSON |
| Polygones des localités | Diagrammes de Voronoï générés par PostGIS | Calculés à partir des coordonnées GPS des 25 515 localités |
| Population (régions, départements, communes) | [ANSD](https://www.ansd.sn/) — RGPH 2023 | Recensement Général de la Population et de l'Habitat 2023 |
| Population des localités | [ANSD](https://www.ansd.sn/) — RGPH 2023 | Données désagrégées par localité |
| Superficie (km²) | Calculée par PostGIS | `ST_Area(geometry::geography) / 1e6` à partir des polygones |
| Densité (hab/km²) | Calculée | `population / superficie_km2` |
| Coordonnées GPS des localités | [data.gouv.sn](https://data.gouv.sn/) / collecte terrain | Latitude, longitude, altitude |

---

## �🗄️ Schéma de la base

```sql
-- Toutes les entités géographiques utilisent le même type
geometry(MultiPolygon, 4326)

pays          (id, name, geometry, superficie_km2, population, densite)
regions       (id, name, code, lat, lon, elevation, geometry, superficie_km2, population, densite)
departements  (id, name, region_id, code, lat, lon, elevation, geometry, superficie_km2, population, densite)
communes      (id, name, departement_id, region_id, lat, lon, elevation, geometry, superficie_km2, population, densite)
localites     (id, name, commune_id, departement_id, region_id,
               lat, lon, elevation, normalized_name, geometry, superficie_km2, population, densite)
```

Les index PostGIS (`GIST`) et trigrammes (`pg_trgm`) sont créés automatiquement par les migrations Lucid.

---

## 🛠️ Stack technique

| Composant | Technologie |
|-----------|-------------|
| Framework | **AdonisJS v5** (TypeScript strict) |
| ORM | **Lucid ORM v18** |
| Base de données | **PostgreSQL** + **PostGIS** (hébergée sur **Neon**) |
| Recherche floue | **pg_trgm** |
| Tests | **Japa** (75 tests fonctionnels) |
| Package manager | **pnpm** |
| Dates | **Luxon** |
| Docs | **Redoc** + **OpenAPI 3.0** |
| Déploiement | **Render** |

---

## 📦 Installation locale

```bash
# Cloner le projet
git clone https://github.com/taphacoobams/sengeomap.git
cd sengeomap

# Installer les dépendances
pnpm install
```

---

## ⚙️ Configuration

Créer un fichier `.env` à la racine :

```env
NODE_ENV=development
HOST=127.0.0.1
PORT=3333
APP_KEY=<générer avec: node ace generate:key>

# Base de données Neon (ou PostgreSQL local avec PostGIS)
DATABASE_URL=postgresql://user:pass@host/dbname?sslmode=require

# (optionnel) Source pour le script de migration des données géo
SOURCE_DATABASE_URL=postgresql://postgres:postgres@localhost:5432/frontieres_db
```

---

## ▶️ Démarrage

```bash
# Développement (hot-reload)
pnpm run dev

# Lancer les migrations
pnpm node ace migration:run

# (optionnel) Importer les données géo depuis frontieres_api
pnpm migrate-geo
```

L'API sera disponible sur `http://localhost:3333`.

---

## 🏗️ Build & Production

```bash
pnpm run build
cd build
npm ci --production
node server.js
```

---

## 🌍 Déploiement (Render)

### Variables d'environnement

| Clé | Valeur |
|-----|--------|
| `NODE_ENV` | `production` |
| `HOST` | `0.0.0.0` |
| `PORT` | `3333` |
| `DATABASE_URL` | Connection string PostgreSQL (Neon / Render) |
| `APP_KEY` | Clé secrète AdonisJS |

### Commandes Render

| Rôle | Commande |
|------|----------|
| **Build** | `pnpm install --frozen-lockfile && pnpm run build` |
| **Start** | `cd build && node server.js` |

---

## 📚 Endpoints

Tous les endpoints sont préfixés par **`/api/v1`**.

### 🔹 Pays

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/v1/pays` | Statistiques nationales (population, superficie, densité) |
| `GET` | `/api/v1/map/pays` | GeoJSON Feature du polygone national |

### 🔹 Régions

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/v1/regions` | Liste des 14 régions (code, GPS, altitude, population, superficie, densité) |
| `GET` | `/api/v1/regions/:id` | Région + ses départements |
| `GET` | `/api/v1/regions/:regionId/departements` | Départements d'une région |
| `GET` | `/api/v1/regions/:regionId/departements/:departementId` | Département + ses communes |
| `GET` | `/api/v1/map/regions` | FeatureCollection GeoJSON des régions |

### 🔹 Départements

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/v1/departements` | Liste des 46 départements |
| `GET` | `/api/v1/departements?region_id=1` | Filtrés par région |
| `GET` | `/api/v1/departements/:id` | Département + ses communes |
| `GET` | `/api/v1/departements/:id/communes` | Communes d'un département |
| `GET` | `/api/v1/map/departements` | FeatureCollection GeoJSON |
| `GET` | `/api/v1/map/departements?region_id=1` | FeatureCollection filtrée par région |

### 🔹 Communes

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/v1/communes` | Liste des 552 communes |
| `GET` | `/api/v1/communes?departement_id=1` | Filtrées par département |
| `GET` | `/api/v1/communes?page=1&limit=10` | Paginées |
| `GET` | `/api/v1/communes/:id` | Commune + hiérarchie complète |
| `GET` | `/api/v1/communes/:id/localites` | Localités d'une commune |
| `GET` | `/api/v1/map/communes` | FeatureCollection GeoJSON |
| `GET` | `/api/v1/map/communes?departement_id=1` | FeatureCollection filtrée par département |

### 🔹 Localités

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/v1/localites` | Liste des localités (tri alphabétique) |
| `GET` | `/api/v1/localites?commune_id=1` | Filtrées par commune |
| `GET` | `/api/v1/localites?departement_id=1` | Filtrées par département |
| `GET` | `/api/v1/localites?region_id=1` | Filtrées par région |
| `GET` | `/api/v1/localites?page=1&limit=10` | Paginées |
| `GET` | `/api/v1/localites/:id` | Localité + hiérarchie complète |
| `GET` | `/api/v1/map/localites` | FeatureCollection GeoJSON (point features) |

### 🔹 Recherche

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/v1/search?q=dakar` | Recherche dans tous les niveaux |
| `GET` | `/api/v1/search?q=dakar&type=region` | Régions uniquement |
| `GET` | `/api/v1/search?q=dakar&type=departement` | Départements uniquement |
| `GET` | `/api/v1/search?q=dakar&type=commune` | Communes uniquement |
| `GET` | `/api/v1/search?q=dakar&type=localite` | Localités uniquement |

> Le paramètre `q` doit contenir au moins **2 caractères**. La recherche est insensible à la casse.

### 🔹 Statistiques & Utilitaires

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/v1/stats` | Compteurs globaux + statistiques pays |
| `GET` | `/health` | Statut serveur (uptime, timestamp) |
| `GET` | `/docs` | Documentation interactive Redoc |
| `GET` | `/api/openapi.json` | Spécification OpenAPI JSON |

---

## 📐 Format GeoJSON

Les endpoints `/api/v1/map/*` retournent des **FeatureCollections** conformes [RFC 7946](https://tools.ietf.org/html/rfc7946) :

```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": { "type": "MultiPolygon", "coordinates": ["..."] },
      "properties": {
        "id": 1,
        "name": "Dakar",
        "superficie_km2": 542.6,
        "population": 4391619,
        "densite": 8107.84
      }
    }
  ]
}
```

Les localités incluent `lat`, `lon` et `elevation` dans les properties.

Le endpoint `/api/v1/map/pays` retourne un **Feature** unique (pas une collection).

Exemple `/api/v1/pays` :

```json
{
  "success": true,
  "data": {
    "name": "Sénégal",
    "superficie_km2": 196629.32,
    "population": 22488341,
    "densite": 114.37
  }
}
```

---

## 🧪 Tests

```bash
pnpm run test
```

**75 tests fonctionnels** couvrant :
- Régions, départements, communes, localités (CRUD, hiérarchie, pagination, validation)
- Pays (statistiques, GeoJSON)
- Map (FeatureCollections GeoJSON, filtres)
- Recherche (multi-niveaux, validation)
- Statistiques globales
- Documentation OpenAPI

---

## 🤝 Contribuer

### 1. Fork & Clone

```bash
git clone https://github.com/<ton-username>/sengeomap.git
cd sengeomap
pnpm install
```

### 2. Créer une branche

```bash
git checkout -b feat/ma-fonctionnalite
```

### 3. Développer

- Respecte la structure AdonisJS v5, TypeScript strict
- Ajoute des tests Japa pour chaque nouveau endpoint
- Vérifie que tous les tests passent :

```bash
pnpm run test
```

### 4. Ouvrir une Pull Request

- Décris clairement ce que tu as ajouté ou corrigé
- Référence l'issue si applicable (`Closes #12`)

### 5. Signaler un bug

Ouvre une [issue GitHub](https://github.com/taphacoobams/sengeomap/issues) avec le comportement observé, attendu, et les étapes pour reproduire.

---

## 💡 Origines

Ce projet fusionne deux APIs :

- [**decoupage_administratif_api**](https://github.com/TheShvdow/decoupage_administratif_api) de [@TheShvdow](https://github.com/TheShvdow) — hiérarchie administrative AdonisJS
- [**frontieres_api**](https://github.com/taphacoobams/frontieres_api) de [@taphacoobams](https://github.com/taphacoobams) — polygones PostGIS et population ANSD 2023

---

## 📄 Licence

MIT

---

## 👨🏽‍💻 Auteur

**taphacoobams** — [github.com/taphacoobams](https://github.com/taphacoobams)

---

> API open-source pour faciliter l'accès aux données administratives, géographiques et démographiques du Sénégal 🇸🇳
