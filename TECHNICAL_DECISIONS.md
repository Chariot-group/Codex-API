# Choix Techniques - Codex API

> Document technique expliquant les décisions d'architecture, les choix technologiques et les patterns utilisés dans le projet Codex API.

---

## 📋 Table des matières

- [Choix de la Stack Technique](#choix-de-la-stack-technique)
- [Architecture de la Base de Données](#architecture-de-la-base-de-données)
- [Stratégie de Versioning](#stratégie-de-versioning)
- [Gestion des Authentifications et Autorisations](#gestion-des-authentifications-et-autorisations)
- [Gestion des Erreurs](#gestion-des-erreurs)
- [Patterns et Architectures Utilisés](#patterns-et-architectures-utilisés)
- [Logging et Monitoring](#logging-et-monitoring)

---

## 🛠 Choix de la Stack Technique

### Backend Framework : NestJS

**Décision :** Utilisation de NestJS v11 comme framework backend principal.

**Justifications :**

1. **Documentation exhaustive** : NestJS dispose d'une documentation complète et maintenue, facilitant l'onboarding et la résolution de problèmes
2. **Maturité du framework** : Framework éprouvé en production avec une communauté active et un écosystème riche
3. **Compétences de l'équipe** : Stack déjà maîtrisée par l'équipe de développement, réduisant le temps de développement et les risques
4. **Architecture modulaire** : Structure en modules facilitant la scalabilité et la maintenance du code
5. **TypeScript natif** : Support first-class de TypeScript avec décorateurs et métadonnées
6. **Intégration Swagger** : Documentation API automatique via `@nestjs/swagger`

**Alternatives considérées :**

- Express.js pur : Plus léger mais moins structuré, nécessite plus de configuration manuelle
- Fastify : Meilleures performances mais écosystème moins mature et équipe moins familière
- Koa : Moderne mais communauté plus restreinte

### Base de données : MongoDB + Mongoose

**Décision :** MongoDB comme base de données principale avec Mongoose v8 comme ODM.

**Justifications :**

1. **Flexibilité des schémas** : MongoDB permet une évolution facile des schémas de données sans migration complexe
2. **Évolutivité du projet** : Prévu pour supporter à terme des contenus hors D&D (autres jeux de rôle, systèmes personnalisés)
3. **Structure documentaire** : Parfaitement adapté au stockage de traductions multiples et de contenus riches
4. **Performances en lecture** : Optimisé pour les opérations de lecture fréquentes (cas d'usage principal de l'API)
5. **Développement itératif** : Facilite l'ajout de nouveaux champs sans casser l'existant

**Pourquoi pas une base relationnelle ?**

- Les schémas relationnels (PostgreSQL, MySQL) nécessitent des migrations complexes pour chaque changement de structure
- Les relations many-to-many (traductions, tags, métadonnées) seraient plus lourdes à gérer en SQL
- La nature documentaire des sorts et monstres (JSON imbriqués) s'adapte mieux au modèle NoSQL

### Langage : TypeScript

**Décision :** TypeScript pour l'ensemble du codebase.

**Justifications :**

1. **Typage statique** : Réduction des bugs en production grâce à la détection des erreurs à la compilation
2. **Meilleure maintenabilité** : Auto-complétion, refactoring facilité, documentation inline
3. **Standard de l'industrie** : Langue de facto pour les projets Node.js modernes
4. **Intégration NestJS** : NestJS est conçu pour TypeScript (décorateurs, interfaces)

---

## 🗄 Architecture de la Base de Données

### Modèle de données

L'architecture de la base de données repose sur **deux collections principales** : `spells` et `monsters`, avec un schéma flexible permettant les traductions multiples.

#### Diagramme d'architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CODEX DATABASE                       │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────────────────┐      ┌──────────────────────────────────┐
│          Collection: Spells       │      │      Collection: Monsters        │
├──────────────────────────────────┤      ├──────────────────────────────────┤
│ _id: ObjectId                    │      │ _id: ObjectId                    │
│ tag: Number (0=homebrew, 1=cert) │      │ tag: Number (0=homebrew, 1=cert) │
│ languages: String[] (ISO codes)  │      │ languages: String[] (ISO codes)  │
│ translations: Map<String, Object>│      │ translations: Map<String, Object>│
│   ├─ "fr": SpellContent {}       │      │   ├─ "fr": MonsterContent {}     │
│   ├─ "en": SpellContent {}       │      │   ├─ "en": MonsterContent {}     │
│   └─ "es": SpellContent {}       │      │   └─ "es": MonsterContent {}     │
│ deletedAt: Date | null           │      │ deletedAt: Date | null           │
│ createdAt: Date (auto)           │      │ createdAt: Date (auto)           │
│ updatedAt: Date (auto)           │      │ updatedAt: Date (auto)           │
└──────────────────────────────────┘      └──────────────────────────────────┘
                                                      │
                                                      │ references
                                                      ▼
                                          ┌─────────────────────┐
                                          │  spells: ObjectId[] │
                                          │  (validated on C/U) │
                                          └─────────────────────┘
```

#### Structure détaillée

**SpellContent (Contenu d'une traduction)**

```typescript
{
  name: string
  description: string
  level: number
  school: string
  castingTime: string
  range: string
  components: string[]
  duration: string
  // ... autres propriétés du sort
}
```

**MonsterContent (Contenu d'une traduction)**

```typescript
{
  name: string
  description: string
  hitPoints: number
  armorClass: number
  type: string
  size: string
  alignment: string
  spells: ObjectId[]  // Références aux sorts
  // ... autres propriétés du monstre
}
```

### Concepts clés de l'architecture

#### 1. Système de traductions embarqué

**Décision :** Utilisation d'une `Map<string, Content>` dans chaque document pour stocker les traductions.

**Justifications :**

- **Performance** : Une seule requête pour récupérer toutes les traductions d'une ressource
- **Cohérence** : Les traductions restent liées à la ressource principale
- **Simplicité** : Pas de jointures ou de requêtes multiples nécessaires
- **Validation** : Chaque clé de la Map est validée comme code ISO 2 lettres (regex `/^[a-z]{2}$/`)

**Alternative rejetée :** Collection séparée `translations`

- Nécessiterait des jointures (lookup) pour chaque requête
- Plus complexe à maintenir (cohérence des références)
- Moins performant pour les cas d'usage de lecture intensive

#### 2. Système de tags (Certification)

**Décision :** Champ `tag` avec validation à deux niveaux.

```typescript
tag: 0; // Homebrew - Contenu créé par la communauté
tag: 1; // Certified by Chariot - Contenu officiel validé
```

**Validation à deux niveaux :**

1. **Validation schéma** : Mongoose vérifie que `tag` est un nombre (0 ou 1)
2. **Validation métier** : Les services vérifient les permissions de l'utilisateur pour définir `tag = 1`

**Justifications :**

- Permet de distinguer le contenu officiel du contenu communautaire
- Facilite le filtrage et la recherche
- Prépare un système de modération futur

#### 3. Soft Delete

**Décision :** Implémentation du soft delete via le champ `deletedAt`.

```typescript
deletedAt: Date | null; // null = actif, Date = supprimé le...
```

**Justifications :**

- **Traçabilité** : Conservation de l'historique des suppressions
- **Récupération** : Possibilité de restaurer des données supprimées par erreur
- **Audit** : Suivi des actions de suppression pour la conformité
- **Relations** : Évite les références cassées (foreign keys)

**Implémentation :**

- Toutes les requêtes `find()` filtrent automatiquement les documents avec `deletedAt != null`
- Les admins peuvent accéder aux ressources supprimées si nécessaire

#### 4. Relations Monsters ↔ Spells

**Décision :** Références par ObjectId avec validation à la création/modification.

**Flux de validation :**

```
1. Client → POST /monsters avec { spells: [ObjectId1, ObjectId2] }
2. Service vérifie : spellModel.findById(ObjectId1) exists ?
3. Si NON → 404 Not Found
4. Si OUI → Sauvegarde du monstre
```

**Justifications :**

- **Intégrité référentielle** : Garantit que les sorts référencés existent
- **Cohérence** : Empêche les références cassées
- **Clarté** : Le code métier gère explicitement les validations

**Code exemple :**

```typescript
// Validation dans monsters.service.ts
for (const spellId of monsterDto.spells) {
  const spell = await this.spellModel.findById(spellId);
  if (!spell) {
    throw new NotFoundException(`Spell with ID ${spellId} not found`);
  }
}
```

---

## 📦 Stratégie de Versioning

### Versioning Sémantique (SemVer)

**Décision :** Adoption du versioning sémantique **X.Y.Z**.

```
X (Major)   : Breaking changes - Changements incompatibles avec les versions précédentes
Y (Minor)   : Correctifs majeurs - Nouvelles fonctionnalités rétrocompatibles ou résolution de bugs importants
Z (Patch)   : Correctifs mineurs - Petites corrections (typos, messages d'erreur, etc.)
```

**Exemples :**

| Version | Type de changement                                   |
| ------- | ---------------------------------------------------- |
| `1.0.0` | Version initiale de production                       |
| `1.1.0` | Ajout d'un nouveau endpoint `/monsters/:id/stats`    |
| `1.1.1` | Correction d'un message d'erreur                     |
| `2.0.0` | Renommage de `/spells` en `/magic-spells` (breaking) |

### Politique de déploiement

**Décision :** Une seule version déployée en production à tout moment.

**Justifications :**

- **Simplicité** : Pas de maintenance de versions multiples en parallèle
- **Rapidité** : Déploiements plus rapides et moins complexes
- **Cohérence** : Tous les clients utilisent la même version de l'API
- **Ressources** : Moins de charge serveur (pas de duplication de services)

**Gestion des breaking changes :**

1. Communication préalable aux utilisateurs (changelog, email)
2. Période de transition avec logs de dépréciation
3. Migration documentée dans le README/CHANGELOG

**Variable d'environnement :**

```env
API_VERSION=1.2.3  # Affichée dans Swagger et les headers
```

---

## 🔐 Gestion des Authentifications et Autorisations

### Architecture SSO + OAuth 2.0

**Décision :** Authentification centralisée via SSO avec intégration OAuth 2.0 dans Swagger.

```
        ┌─────────────────────────────────────────────────────────────┐
        │                   Flux d'authentification                   │
        └─────────────────────────────────────────────────────────────┘

   Client                  Swagger UI              SSO Provider          API
     │                          │                         │               │
     │  1. Accès à /swagger     │                         │               │
     ├─────────────────────────>│                         │               │
     │                          │                         │               │
     │  2. Clic "Authorize"     │                         │               │
     │  (OAuth 2.0)             │  3. Redirect to SSO     │               │
     │                          ├────────────────────────>│               │
     │                          │                         │               │
     │  4. Login SSO            │                         │               │
     ├──────────────────────────┼────────────────────────>│               │
     │                          │                         │               │
     │  5. JWT Token            │                         │               │
     │<─────────────────────────┼─────────────────────────┤               │
     │                          │                         │               │
     │  6. Request + Bearer JWT │                         │               │
     ├──────────────────────────┼─────────────────────────┼──────────────>│
     │                          │                         │               │
     │                          │                         │  7. Validate  │
     │                          │                         │     Token     │
     │                          │                         │               │
     │  8. Response 200/401     │                         │               │
     │<───────────────────────────────────────────────────────────────────┤
```

### Niveaux d'accès

**Décision :** Trois niveaux d'accès distincts.

| Niveau     | Permissions                                    | Authentification |
| ---------- | ---------------------------------------------- | ---------------- |
| **Public** | GET (lecture seule)                            | ❌ Non requise   |
| **User**   | POST, PATCH, DELETE sur ses propres ressources | ✅ SSO requise   |

### Pas d'API Keys

**Décision :** Pas de système d'API Keys traditionnel, tout passe par le SSO.

**Justifications :**

- **Sécurité** : Les tokens JWT sont plus sécurisés (expiration, révocation)
- **Centralisation** : Un seul système d'authentification à maintenir
- **UX** : Expérience utilisateur unifiée (pas de gestion manuelle de clés)
- **Audit** : Traçabilité complète des actions via les comptes utilisateurs

**Routes publiques :**

```typescript
GET /spells          // ✅ Public
GET /spells/:id      // ✅ Public
GET /monsters        // ✅ Public
GET /monsters/:id    // ✅ Public
```

---

## ⚠️ Gestion des Erreurs

### Standard RFC 9457 - Problem Details

**Décision :** Utilisation du standard RFC 9457 (Problem Details for HTTP APIs) pour toutes les erreurs.

**Justifications :**

1. **Norme internationale** : Standard reconnu et documenté
2. **Structure cohérente** : Format uniforme pour toutes les erreurs
3. **Lisibilité** : Format JSON clair et exploitable par les clients
4. **Interopérabilité** : Compatible avec les outils standards (Postman, Swagger, etc.)

### Format des erreurs

**Structure de base :**

```json
{
  "type": "https://httpstatuses.io/404",
  "title": "Not Found",
  "status": 404,
  "instance": "/spells/invalid-id",
  "detail": "Spell with ID 'invalid-id' not found"
}
```

**Erreurs de validation (422) :**

```json
{
  "type": "https://httpstatuses.io/422",
  "title": "Unprocessable Entity",
  "status": 422,
  "instance": "/spells",
  "detail": "Validation failed",
  "invalid-params": [
    {
      "name": "name",
      "reason": "must be a string"
    },
    {
      "name": "level",
      "reason": "must be a number between 0 and 9"
    }
  ]
}
```

### Implémentation : ProblemDetailsFilter

**Fonctionnalités :**

- ✅ Capture toutes les exceptions (HttpException, erreurs inconnues)
- ✅ Transformation automatique des erreurs class-validator
- ✅ Extraction des champs invalides avec raisons détaillées
- ✅ Logs automatiques des erreurs serveur (500)

### Avantages

| Avantage               | Description                                                |
| ---------------------- | ---------------------------------------------------------- |
| **Cohérence**          | Toutes les erreurs suivent le même format                  |
| **Debugging facilité** | Les développeurs comprennent immédiatement le problème     |
| **Interopérabilité**   | Les clients peuvent parser les erreurs de manière uniforme |
| **Documentation**      | Swagger documente automatiquement le format des erreurs    |
| **Standards**          | Respect des normes HTTP et REST                            |

---

## 🏗 Patterns et Architectures Utilisés

### 1. Pattern Repository (via Mongoose)

**Décision :** Utilisation de Mongoose Models comme couche Repository.

```typescript
// Injection du Model dans le Service
constructor(
  @InjectModel(Spell.name) private spellModel: Model<Spell>,
) {}

// Utilisation comme Repository
async findAll(): Promise<Spell[]> {
  return this.spellModel.find({ deletedAt: null }).exec();
}
```

**Justifications :**

- **Abstraction** : Sépare la logique métier de la persistance
- **Testabilité** : Facilite le mocking dans les tests unitaires
- **Maintenabilité** : Changement de base de données facilité (si nécessaire)

### 2. Pattern DTO (Data Transfer Object)

**Décision :** Utilisation systématique de DTOs pour les requêtes et réponses.

**Pourquoi transformer les données ?**

1. **Sécurité** : Évite l'exposition de champs sensibles (`__v`, données internes MongoDB)
2. **Contrôle** : Maîtrise exacte de ce qui est envoyé au client
3. **Validation** : Validation stricte des inputs avec `class-validator`
4. **Documentation** : Génération automatique de la documentation Swagger
5. **Décomplexification** : Simplification de la structure avant envoi au client

**Flux DTO → Entity → DTO :**

```
Client Request (JSON)
    ↓
CreateSpellDto (Validation)
    ↓
Service (Logique métier)
    ↓
Spell Entity (Mongoose)
    ↓
MongoDB
    ↓
Spell Entity
    ↓
Mapper (Transformation)
    ↓
SpellResponseDto
    ↓
Client Response (JSON)
```

### 3. Pattern Mapper

**Décision :** Séparation des Mappers dans des fichiers dédiés.

**Fichiers :** `src/resources/spells/mappers/spells.mapper.ts`

**Justifications :**

- **Réutilisabilité** : Mappers utilisables dans plusieurs contextes
- **Maintenabilité** : Logique de transformation centralisée
- **Testabilité** : Mappers testables indépendamment des services

### 4. Architecture Modulaire (NestJS)

**Décision :** Organisation en modules fonctionnels.

```
src/
├── resources/
│   ├── spells/
│   │   ├── spells.module.ts      # Module autonome
│   │   ├── spells.controller.ts
│   │   ├── spells.service.ts
│   │   ├── dtos/
│   │   ├── schemas/
│   │   └── mappers/
│   └── monsters/
│       └── (même structure)
├── common/                        # Code partagé
└── config/                        # Configuration globale
```

**Avantages :**

- **Isolation** : Chaque module est indépendant et testable séparément
- **Scalabilité** : Ajout de nouvelles ressources sans impact sur l'existant
- **Collaboration** : Plusieurs développeurs peuvent travailler sur des modules différents

### 5. Validation Multi-Niveaux

**Décision :** Validation à trois niveaux complémentaires.

```
1. Validation DTO (class-validator)
   ↓ Vérifie les types, formats, contraintes basiques

2. Validation Schéma (Mongoose)
   ↓ Vérifie les contraintes de la base de données

3. Validation Métier (Service)
   ↓ Vérifie la logique applicative (références, permissions)
```

### 6. Traductions via Map<string, Content>

**Décision :** Système de traductions embarqué dans chaque document.

**Choix délibéré vs Collection séparée :**

| Critère             | Map embarquée ✅     | Collection séparée ❌ |
| ------------------- | -------------------- | --------------------- |
| **Requêtes**        | 1 seule requête      | 2+ requêtes (join)    |
| **Performance**     | Excellente           | Moyenne               |
| **Cohérence**       | Automatique          | Manuelle              |
| **Complexité code** | Faible               | Élevée                |
| **Cas d'usage**     | Lecture intensive ✅ | Écriture intensive    |

**Validation ISO 2 lettres :**

---

## 📊 Logging et Monitoring

### Winston Logger

**Décision :** Utilisation de Winston pour le logging applicatif.

**Justifications :**

1. **Modularité** : Configuration flexible et extensible
2. **Transports multiples** : Logs dans fichiers, console, services externes (Datadog, Sentry, etc.)
3. **Niveaux de logs** : Support de tous les niveaux (error, warn, info, debug, verbose)
4. **Configuration environnementale** : Configuration différente entre dev et prod
5. **Rotation de fichiers** : Gestion automatique de la taille et de l'archivage des logs

**Configuration :** `src/logger/winston.logger.ts`

### Différences Dev vs Prod

| Aspect                | Développement              | Production                     |
| --------------------- | -------------------------- | ------------------------------ |
| **Niveau**            | `debug`                    | `info`                         |
| **Console**           | ✅ Activée (format simple) | ❌ Désactivée                  |
| **Fichiers**          | ✅ `logs/combined.log`     | ✅ `logs/combined.log`         |
| **Rotation**          | ❌ Non                     | ✅ Oui (daily, max 14 jours)   |
| **Services externes** | ❌ Non                     | ✅ Oui (Datadog, Sentry, etc.) |

---

## 📝 Synthèse des Décisions

### Récapitulatif

| Domaine              | Décision                          | Raison principale                           |
| -------------------- | --------------------------------- | ------------------------------------------- |
| **Framework**        | NestJS v11                        | Maturité, documentation, compétences équipe |
| **Base de données**  | MongoDB + Mongoose v8             | Flexibilité schémas, évolution projet       |
| **Authentification** | SSO + OAuth 2.0                   | Sécurité, centralisation, UX                |
| **Gestion erreurs**  | RFC 9457 Problem Details          | Standard, cohérence, interopérabilité       |
| **Logging**          | Winston                           | Modularité, configuration dev/prod          |
| **Versioning**       | SemVer (X.Y.Z), version unique    | Simplicité, communication claire            |
| **Traductions**      | Map embarquée                     | Performance lecture, cohérence              |
| **Validation**       | Multi-niveaux (DTO/Schema/Métier) | Sécurité, robustesse                        |
| **Architecture**     | Modulaire (NestJS)                | Scalabilité, isolation, collaboration       |

### Évolutions Prévues

1. **Système de rôles** : Implémentation complète des guards pour Admin/User
2. **Support multi-jeux** : Extension des schémas pour d'autres univers que D&D
3. **API de recherche avancée** : Elasticsearch pour recherche full-text
4. **Cache** : Redis pour améliorer les performances des requêtes fréquentes
5. **Rate limiting** : Protection contre les abus d'API

---

## 👥 Contributeurs

- **Elvis PICHOU**
- **Jovis LELUE**
- **Hugo PIEDANNA**

---

**Date de création :** 9 décembre 2025  
**Version du document :** 1.0.0  
**Dernière mise à jour :** 9 décembre 2025
