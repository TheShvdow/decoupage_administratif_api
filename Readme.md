# Découpage Administratif API 🇸🇳

API REST construite avec **AdonisJS (TypeScript)** fournissant le découpage administratif complet du Sénégal : **régions, départements et communes**.

---

## 🚀 Fonctionnalités

* 📍 Liste des **14 régions** du Sénégal
* 🏘️ Récupération des ***46 départements** par région
* 🏠 Récupération des **549 communes** par département
* 📦 API REST JSON
* 🔐 Validation stricte des variables d’environnement
* 🧪 Tests fonctionnels

---

## 🛠️ Stack technique

* **Node.js** (>= 18)
* **AdonisJS v6**
* **TypeScript**
* **pnpm**
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

## 📚 Endpoints principaux

### 🔹 Régions

```http
GET /regions
```

### 🔹 Départements d’une région

```http
GET /regions/:id/departements
```

### 🔹 Communes d’un département

```http
GET /departements/:id/communes
```

---

## 🧪 Tests

```bash
pnpm run test
```

---

## 📄 Licence

MIT

---

## 👨🏽‍💻 Auteur

**Idriss Wade**
GitHub : [https://github.com/TheShvdow](https://github.com/TheShvdow)

---

> Projet open-source visant à faciliter l’accès aux données administratives du Sénégal 🇸🇳
