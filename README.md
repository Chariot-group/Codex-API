# Codex API

API communautaire pour la gestion et la traduction de sorts et de monstres D&D. Cette API permet aux utilisateurs de proposer leurs propres versions de monstres et de sorts, et de les traduire dans différentes langues.

## 📋 Table des matières

- [Description](#description)
- [Technologies utilisées](#technologies-utilisées)
- [Prérequis](#prérequis)
- [Installation](#installation)
- [Lancement](#lancement)
- [Structure du projet](#structure-du-projet)
- [Exemples d'utilisation](#exemples-dutilisation)
- [Scripts disponibles](#scripts-disponibles)
- [Documentation API](#documentation-api)
- [Tests](#tests)
- [Auteurs](#auteurs)
- [Licence](#licence)

## 📖 Description

Codex API est une API RESTful communautaire qui permet de gérer un catalogue de sorts et de monstres pour Donjons & Dragons. Les fonctionnalités principales incluent :

- ✅ **Consultation publique** : Accès libre aux sorts et monstres
- 🔐 **Authentification SSO** : Création, modification et suppression nécessitent une authentification via SSO
- 🌍 **Multi-langues** : Support de traductions multiples pour chaque ressource
- 📊 **Pagination** : Navigation efficace dans les collections
- 📝 **Validation** : Validation des données avec class-validator
- 📚 **Documentation** : Documentation Swagger interactive disponible

## 🛠 Technologies utilisées

### Backend

- **[NestJS](https://nestjs.com/)** v11 - Framework Node.js progressif
- **[TypeScript](https://www.typescriptlang.org/)** - Langage typé
- **[MongoDB](https://www.mongodb.com/)** - Base de données NoSQL
- **[Mongoose](https://mongoosejs.com/)** v8 - ODM pour MongoDB

### Authentification

L'API utilise un système d'**authentification SSO (Single Sign-On)** pour sécuriser les opérations d'écriture.

- **Accès public** : Les routes de lecture (GET) sont accessibles sans authentification
- **Accès protégé** : Les opérations de création, modification et suppression nécessitent une authentification via SSO
- **OAuth 2.0** : L'authentification SSO est intégrée via Swagger OAuth 2.0, permettant de tester directement les endpoints protégés depuis la documentation interactive
- **Tokens JWT** : Une fois authentifié via le SSO, l'utilisateur reçoit un token JWT pour accéder aux ressources protégées
- **Validation automatique** : Les guards NestJS vérifient la validité des tokens sur chaque requête protégée

### Outils & Bibliothèques

- **[Swagger/OpenAPI](https://swagger.io/)** - Documentation API
- **[Winston](https://github.com/winstonjs/winston)** - Logging
- **[Class Validator](https://github.com/typestack/class-validator)** - Validation des DTOs
- **[Class Transformer](https://github.com/typestack/class-transformer)** - Transformation d'objets
- **[Jest](https://jestjs.io/)** - Framework de tests
- **[Docker](https://www.docker.com/)** - Conteneurisation

## 📦 Prérequis

- **Node.js** >= 18.x
- **npm** >= 9.x
- **Docker** et **Docker Compose** (recommandé)
- **MongoDB** (si non utilisé avec Docker)

## 🚀 Installation

### 1. Cloner le projet

```bash
git clone https://github.com/Chariot-group/Codex-API.git
cd Codex-API
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configuration de l'environnement

Copier le fichier `.env.example` et le renommer en `.env`, puis configurer les variables d'environnement selon vos besoins :

```bash
cp .env.example .env
```

Adapter les valeurs dans le fichier `.env` créé.

## 🎯 Lancement

### Option 1 : Avec Docker (Recommandé)

```bash
# Lancer tous les services (API + MongoDB)
docker-compose up

# En mode détaché
docker-compose up -d

# Arrêter les services
docker-compose down
```

L'API sera accessible sur `http://localhost:9000`

### Option 2 : En mode développement (sans Docker)

```bash
# S'assurer que MongoDB est en cours d'exécution
# Puis lancer l'API en mode watch
npm run start:dev
```

### Option 3 : En mode production

```bash
# Build du projet
npm run build

# Lancer en production
npm run start:prod
```

## 📁 Structure du projet

```
Codex-API/
├── src/
│   ├── common/                    # Modules partagés
│   │   ├── dtos/                  # DTOs communs (pagination, erreurs, etc.)
│   │   ├── filters/               # Filtres d'exception globaux
│   │   ├── mappers/               # Mappers de transformation
│   │   ├── models/                # Interfaces et types communs
│   │   ├── pipes/                 # Pipes de validation personnalisés
│   │   └── schemas/               # Schémas Mongoose partagés
│   │
│   ├── config/                    # Configuration de l'application
│   │   └── swagger.config.ts      # Configuration Swagger
│   │
│   ├── logger/                    # Configuration Winston
│   │   └── winston.logger.ts
│   │
│   ├── resources/                 # Modules métier
│   │   ├── monsters/              # Gestion des monstres
│   │   │   ├── dtos/              # DTOs pour les monstres
│   │   │   ├── mappers/           # Mappers des monstres
│   │   │   ├── schemas/           # Schémas Mongoose des monstres
│   │   │   ├── monsters.controller.ts
│   │   │   ├── monsters.service.ts
│   │   │   └── monsters.module.ts
│   │   │
│   │   └── spells/                # Gestion des sorts
│   │       ├── dtos/              # DTOs pour les sorts
│   │       ├── mappers/           # Mappers des sorts
│   │       ├── schemas/           # Schémas Mongoose des sorts
│   │       ├── spells.controller.ts
│   │       ├── spells.service.ts
│   │       └── spells.module.ts
│   │
│   ├── script/                    # Scripts utilitaires
│   │   ├── converter/             # Convertisseur de données
│   │   ├── dyson/                 # Module Dyson
│   │   └── runner.ts              # Exécuteur de scripts
│   │
│   ├── app.module.ts              # Module racine
│   ├── main.ts                    # Point d'entrée de l'application
│   └── swagger-generator.ts       # Générateur de documentation Swagger
│
├── test/                          # Tests E2E
├── coverage/                      # Rapports de couverture de tests
├── logger/logs/                   # Fichiers de logs
├── compose.yml                    # Docker Compose développement
├── compose.prod.yml               # Docker Compose production
├── Dockerfile                     # Dockerfile développement
├── Dockerfile.prod                # Dockerfile production
├── package.json                   # Dépendances et scripts
├── tsconfig.json                  # Configuration TypeScript
├── jest.config.ts                 # Configuration Jest
└── eslint.config.mjs              # Configuration ESLint
```

## 💡 Exemples d'utilisation

### Documentation interactive

La documentation Swagger est disponible à la racine de l'API :

```
http://localhost:9000
```

### Récupérer tous les sorts (paginé)

```bash
GET http://localhost:9000/spells?page=1&limit=10&lang=fr
```

**Réponse :**

```json
{
  "data": [
    {
      "_id": "674d1234567890abcdef1234",
      "codexId": "spell-fireball",
      "content": {
        "name": "Boule de feu",
        "description": "Une boule de feu explose...",
        "level": 3,
        "school": "Évocation"
      },
      "metadata": {
        "lang": "fr",
        "version": "1.0.0"
      }
    }
  ],
  "metadata": {
    "total": 150,
    "page": 1,
    "limit": 10,
    "totalPages": 15
  }
}
```

### Récupérer un sort spécifique

```bash
GET http://localhost:9000/spells/674d1234567890abcdef1234?lang=fr
```

**Réponse :**

```json
{
  "data": {
    "_id": "674d1234567890abcdef1234",
    "codexId": "spell-fireball",
    "content": {
      "name": "Boule de feu",
      "description": "Description complète du sort...",
      "level": 3,
      "school": "Évocation",
      "castingTime": "1 action",
      "range": "150 feet",
      "components": ["V", "S", "M"],
      "duration": "Instantané"
    }
  }
}
```

### Créer un nouveau sort (authentification requise)

```bash
POST http://localhost:9000/spells
Content-Type: application/json

{
  "codexId": "spell-custom-fireball",
  "content": {
    "name": "Boule de feu personnalisée",
    "description": "Une version modifiée de la boule de feu...",
    "level": 3,
    "school": "Évocation"
  },
  "metadata": {
    "lang": "fr",
    "version": "1.0.0"
  }
}
```

### Ajouter une traduction à un sort

```bash
POST http://localhost:9000/spells/674d1234567890abcdef1234/translations
Content-Type: application/json

{
  "content": {
    "name": "Fireball",
    "description": "A bright streak flashes...",
    "level": 3,
    "school": "Evocation"
  },
  "metadata": {
    "lang": "en",
    "version": "1.0.0"
  }
}
```

### Récupérer tous les monstres avec filtres

```bash
GET http://localhost:9000/monsters?page=1&limit=20&lang=fr&type=dragon
```

### Mettre à jour un monstre (authentification requise)

```bash
PATCH http://localhost:9000/monsters/674d1234567890abcdef5678
Content-Type: application/json

{
  "content": {
    "name": "Dragon rouge adulte",
    "hitPoints": 256,
    "armorClass": 19
  }
}
```

### Supprimer une traduction

```bash
DELETE http://localhost:9000/spells/674d1234567890abcdef1234/translations/fr
```

## 📜 Scripts disponibles

```bash
# Développement
npm run start:dev          # Lancer en mode développement avec watch
npm run start:debug        # Lancer en mode debug

# Production
npm run build              # Build du projet
npm run start:prod         # Lancer en production

# Tests
npm run test               # Lancer les tests unitaires
npm run test:watch         # Lancer les tests en mode watch
npm run test:cov           # Générer le rapport de couverture
npm run test:e2e           # Lancer les tests E2E

# Qualité du code
npm run lint               # Linter le code
npm run format             # Formater le code avec Prettier

# Documentation
npm run swagger:generate   # Générer le fichier swagger.json

# Scripts de données
npm run dyson:spells       # Importer des sorts avec Dyson
npm run dyson:monsters     # Importer des monstres avec Dyson
npm run converter:spells   # Convertir des sorts
npm run converter:monsters # Convertir des monstres
```

## 📚 Documentation API

### Swagger UI

Accédez à la documentation interactive à :

```
http://localhost:9000
```

### Génération du fichier Swagger

Pour générer le fichier `swagger.json` :

```bash
npm run swagger:generate
```

## 🧪 Tests

### Tests unitaires

```bash
npm run test
```

### Tests E2E

```bash
npm run test:e2e
```

### Couverture de code

```bash
npm run test:cov
```

Le rapport de couverture sera généré dans le dossier `coverage/`.

## 👥 Auteurs

- **Elvis PICHOU**
- **Jovis LELUE**
- **Hugo PIEDANNA**

## 📄 Licence

Copyright © 2025 Codex. Tous droits réservés.

Voir le fichier [LICENSE](LICENSE) pour plus d'informations.

---

**Note** : Les routes de consultation (GET) sont publiques. L'authentification SSO est requise pour les opérations de création (POST), modification (PATCH) et suppression (DELETE).
