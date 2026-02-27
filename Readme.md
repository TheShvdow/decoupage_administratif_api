# Découpage Administratif API 🇸🇳

API REST construite avec **AdonisJS (TypeScript)** fournissant le découpage administratif complet du Sénégal : **régions, départements et communes**.

---

## 🚀 Fonctionnalités

* 📍 Liste des **14 régions** avec leur code (DK, SL, KD...)
* 🏘️ Liste des **46 départements** par région
* 🏠 Liste des **549 communes** avec coordonnées GPS et altitude
* 🔍 Recherche par nom dans les régions, départements et communes (avec relations imbriquées)
* 📊 Statistiques globales (nombre de régions, départements, communes)
* 📄 Pagination sur la liste des communes
* 🌐 CORS activé
* 🛡️ Validation des paramètres d’URL (IDs numériques)
* 📦 Réponses JSON uniformisées `{ success, message, data }`
* 📖 Documentation interactive (Redoc + OpenAPI)
* 🧪 49 tests fonctionnels

---

## 🛠️ Stack technique

* **Node.js** >= 18
* **AdonisJS v5** — framework HTTP
* **Lucid ORM v18** — requêtes et relations (PostgreSQL)
* **PostgreSQL** — base de données (hébergée sur Neon)
* **TypeScript** ~5.6 (mode strict)
* **Luxon** — gestion des dates
* **Japa** — tests fonctionnels
* **pnpm** — gestionnaire de paquets
* Déployée sur **Render**

---

## 📦 Installation locale

```bash
# Cloner le projet
git clone https://github.com/TheShvdow/decoupage_administratif_api.git
cd decoupage_administratif_api

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
```

---

## ▶️ Lancer le projet en développement

```bash
pnpm run dev
```

L’API sera disponible sur :
👉 `http://localhost:3333`

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

### Variables d’environnement requises :

| Clé      | Valeur     |
| -------- | ---------- |
| NODE_ENV | production |
| HOST     | 0.0.0.0    |
| PORT     | 3333       |

### Commandes Render

**Build command**

```bash
pnpm install --frozen-lockfile && pnpm run build
```

**Start command**

```bash
cd build && node server.js
```

---

## 📚 Endpoints

Tous les endpoints sont préfixés par `/api/v1`.

### 🔹 Régions

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/v1/regions` | Liste des 14 régions |
| `GET` | `/api/v1/regions/:id` | Région + ses départements |
| `GET` | `/api/v1/regions/:regionId/departements` | Départements d’une région |
| `GET` | `/api/v1/regions/:regionId/departements/:departementId` | Département + ses communes |

### 🔹 Départements

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/v1/departements` | Liste de tous les départements |
| `GET` | `/api/v1/departements?region_id=1` | Départements filtrés par région |
| `GET` | `/api/v1/departements/:id` | Département + ses communes |
| `GET` | `/api/v1/departements/:id/communes` | Communes d’un département |

### 🔹 Communes

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/v1/communes` | Liste de toutes les communes |
| `GET` | `/api/v1/communes?departement_id=1` | Communes filtrées par département |
| `GET` | `/api/v1/communes?page=1&limit=10` | Communes paginées |
| `GET` | `/api/v1/communes/:id` | Commune + département + région |

### 🔹 Recherche

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/v1/search?q=dakar` | Recherche dans régions, départements et communes |
| `GET` | `/api/v1/search?q=dakar&type=region` | Recherche limitée aux régions (avec départements et communes imbriqués) |
| `GET` | `/api/v1/search?q=dakar&type=departement` | Recherche limitée aux départements (avec communes) |
| `GET` | `/api/v1/search?q=dakar&type=commune` | Recherche limitée aux communes (avec département et région) |

> Le paramètre `q` doit contenir au moins 2 caractères. La recherche est insensible à la casse.

### 🔹 Statistiques & Utilitaires

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/v1/stats` | Nombre total de régions, départements et communes |
| `GET` | `/health` | Statut du serveur (uptime, timestamp) |
| `GET` | `/docs` | Documentation interactive (Redoc) |
| `GET` | `/api/openapi.json` | Spécification OpenAPI JSON |

---

## 🧪 Tests

```bash
pnpm run test
```

---

## 🤝 Contribuer

Les contributions sont les bienvenues ! Voici comment participer :

### 1. Fork & Clone

```bash
git clone https://github.com/<ton-username>/decoupage_administratif_api.git
cd decoupage_administratif_api
pnpm install
```

### 2. Créer une branche

```bash
git checkout -b feat/ma-fonctionnalite
```

### 3. Faire tes modifications

- Respecte la structure existante (AdonisJS v5, TypeScript strict)
- Ajoute des tests fonctionnels pour chaque nouveau endpoint
- Vérifie que tous les tests passent :

```bash
pnpm run test
```

### 4. Ouvrir une Pull Request

- Décris clairement ce que tu as ajouté ou corrigé
- Référence l’issue correspondante si elle existe (ex: `Closes #12`)
- Attends la revue avant le merge

### 5. Signaler un bug ou proposer une idée

Ouvre une [issue GitHub](https://github.com/TheShvdow/decoupage_administratif_api/issues) en décrivant :
- Le comportement observé
- Le comportement attendu
- Les étapes pour reproduire

---

## 📄 Licence

MIT

---

## 👨🏽‍💻 Auteur

**Idriss Wade**
GitHub : [https://github.com/TheShvdow](https://github.com/TheShvdow)

---

> Projet open-source visant à faciliter l’accès aux données administratives du Sénégal 🇸🇳
