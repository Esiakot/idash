# 02 — Architecture technique

## 2.1 Vue d'ensemble de l'architecture

iDash repose sur une architecture **monolithique moderne** basée sur Next.js, qui unifie le front-end React et le back-end API dans un même projet. Le déploiement s'effectue via Docker Compose avec deux services : l'application Next.js et la base de données MySQL.

```
┌─────────────────────────────────────────────────────────┐
│                    NAVIGATEUR CLIENT                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Annuaire    │  │  Ordinateurs │  │    Login     │  │
│  │   (React)     │  │   (React)    │  │   (Modal)    │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
└─────────┼──────────────────┼──────────────────┼─────────┘
          │  HTTP/HTTPS      │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────┐
│                 SERVEUR NEXT.JS (Node.js)                │
│                                                          │
│  ┌────────────────────────────────────────┐              │
│  │          MIDDLEWARE (Edge)              │              │
│  │  • Vérification cookie auth_token      │              │
│  │  • Redirection si non authentifié      │              │
│  └────────────────┬───────────────────────┘              │
│                   │                                      │
│  ┌────────────────▼───────────────────────┐              │
│  │           API ROUTES (Node.js)          │              │
│  │                                         │              │
│  │  ┌─────────┐ ┌──────────┐ ┌─────────┐ │              │
│  │  │  Auth   │ │ Annuaire │ │ Ordis   │ │              │
│  │  │  Rate   │ │ CRUD     │ │ Assign  │ │              │
│  │  │  Limit  │ │ Filter   │ │ Filter  │ │              │
│  │  └────┬────┘ └────┬─────┘ └────┬────┘ │              │
│  │       │           │            │       │              │
│  │  ┌────▼───────────▼────────────▼────┐  │              │
│  │  │     COUCHE SERVICES              │  │              │
│  │  │  • Auth Middleware (RBAC)        │  │              │
│  │  │  • Audit Logger                  │  │              │
│  │  │  • Cookie Signer (HMAC)         │  │              │
│  │  │  • API Wrapper (Error Handler)  │  │              │
│  │  │  • Validations (Zod)            │  │              │
│  │  └────────────┬─────────────────────┘  │              │
│  └───────────────┼────────────────────────┘              │
│                  │                                        │
│  ┌───────────────▼────────────────────────┐              │
│  │       POOL MySQL (mysql2/promise)       │              │
│  │  • Connection pooling (10 max)          │              │
│  │  • Transactions avec FOR UPDATE         │              │
│  └───────────────┬─────────────────────────┘              │
└──────────────────┼───────────────────────────────────────┘
                   │ TCP 3306
                   ▼
┌──────────────────────────────────────────┐
│            MySQL 8.0 (Docker)            │
│                                          │
│  Base : sym_ad                           │
│  ┌─────────────┐  ┌──────────────┐       │
│  │ utilisateurs│  │  ordinateurs │       │
│  │  (55 rows)  │◄─┤  (70+ rows)  │       │
│  └──────┬──────┘  └──────────────┘       │
│         │                                │
│  ┌──────▼──────┐                         │
│  │  telephones │                         │
│  │  (20+ rows) │                         │
│  └─────────────┘                         │
└──────────────────────────────────────────┘
```

## 2.2 Stack technologique détaillée

### Front-end

| Technologie | Rôle | Justification |
|-------------|------|---------------|
| **React 19** | Bibliothèque UI | Composants réutilisables, état réactif, écosystème riche |
| **Next.js 16 (App Router)** | Framework full-stack | SSR/SSG, routing fichier, API Routes intégrées, middleware Edge |
| **CSS Modules** | Stylisation | Scoping automatique, pas de conflit CSS, colocation avec composants |
| **jsPDF + AutoTable** | Export PDF | Génération côté client, pas de dépendance serveur |
| **Recharts** | Graphiques | Visualisation de données (prévu pour évolutions futures) |

### Back-end

| Technologie | Rôle | Justification |
|-------------|------|---------------|
| **Next.js API Routes** | API REST | Colocation avec le front, typage partagé, déploiement unifié |
| **mysql2/promise** | Driver MySQL | Async/await natif, connection pooling, requêtes préparées |
| **Zod 4** | Validation | Schémas TypeScript-first, inférence de types, messages d'erreur |
| **bcryptjs** | Hachage mot de passe | Algorithme bcrypt, résistant aux attaques par force brute |
| **HMAC-SHA256** | Signature cookies | Intégrité des cookies, comparaison timing-safe |

### Infrastructure

| Technologie | Rôle | Justification |
|-------------|------|---------------|
| **Docker** | Conteneurisation | Isolation, reproductibilité, déploiement simplifié |
| **Docker Compose** | Orchestration | Multi-services (app + BDD), réseau interne, health checks |
| **MySQL 8.0** | SGBDR | Fiabilité, performances, compatibilité Active Directory existant |

## 2.3 Architecture applicative (couches)

```
┌─────────────────────────────────────────────────┐
│                COUCHE PRÉSENTATION               │
│  Composants React (TSX) + CSS Modules            │
│  • Pages : Hub, Annuaire, Ordinateurs            │
│  • Composants : Tables, Filtres, Modaux, Export  │
│  • Hooks : useAnnuaire, useOrdinateursData       │
├─────────────────────────────────────────────────┤
│                  COUCHE MÉTIER                    │
│  API Routes Next.js (Route Handlers)             │
│  • Validation entrée (Zod schemas)               │
│  • Logique métier (affectation, filtrage)         │
│  • Contrôle d'accès (RBAC par groupes)           │
├─────────────────────────────────────────────────┤
│                 COUCHE SERVICES                   │
│  • Auth Middleware (parseSession, requireGroup)   │
│  • Rate Limiter (protection brute-force)          │
│  • Audit Logger (traçabilité des actions)         │
│  • Cookie Signer (HMAC intégrité)                │
│  • API Wrapper (gestion d'erreurs centralisée)   │
├─────────────────────────────────────────────────┤
│               COUCHE DONNÉES                     │
│  • Pool de connexions MySQL (Singleton)           │
│  • Requêtes paramétrées (protection injection)    │
│  • Transactions avec verrouillage (FOR UPDATE)   │
└─────────────────────────────────────────────────┘
```

## 2.4 Organisation du code source

```
idash_bts/
├── docs/                          # Documentation E6
├── public/                        # Fichiers statiques
├── scripts/
│   └── init.sql                   # Schéma et données initiales
├── src/
│   ├── app/                       # Pages et API (Next.js App Router)
│   │   ├── layout.tsx             # Layout racine (Header + fonts)
│   │   ├── page.tsx               # Page d'accueil (Hub)
│   │   ├── annuaire/page.tsx      # Page annuaire
│   │   ├── ordinateurs/page.tsx   # Page parc informatique
│   │   ├── unauthorized/page.tsx  # Page accès refusé
│   │   └── api/                   # Routes API REST
│   │       ├── auth/route.ts      # POST : authentification
│   │       ├── session/route.ts   # GET/DELETE : session
│   │       ├── annuaire/route.ts  # GET : liste utilisateurs
│   │       ├── health/route.ts    # GET : santé système
│   │       ├── ordinateurs/
│   │       │   ├── route.ts       # GET/POST/DELETE : ordinateurs
│   │       │   └── annuaire/route.ts  # GET : filtrage avancé
│   │       ├── telephones/route.ts    # GET/POST/PUT/DELETE
│   │       └── utilisateurs/[id]/mobile/route.ts  # GET/PATCH
│   ├── components/                # Composants React réutilisables
│   │   ├── auth/                  # LoginModal
│   │   ├── common/                # Header, HubGrid, SortableHeader
│   │   └── si/                    # Composants métier
│   │       ├── annuaire/          # 8 composants annuaire
│   │       └── ordinateurs/       # 2 composants ordinateurs
│   ├── constants/index.ts         # Constantes centralisées
│   ├── hooks/                     # Hooks React personnalisés
│   ├── libs/                      # Bibliothèques (DB, cookie, API wrapper)
│   ├── middleware/                 # Auth middleware, rate limiter
│   ├── services/                  # Audit logger
│   ├── styles/                    # CSS global + modules
│   ├── types/index.ts             # Types TypeScript
│   ├── utils/                     # Utilitaires (formatage, PDF, validation)
│   └── validations/index.ts       # Schémas Zod
├── middleware.ts                   # Middleware Edge Next.js (auth gateway)
├── docker-compose.yml             # Orchestration conteneurs
├── Dockerfile                     # Build multi-étapes
├── next.config.ts                 # Configuration Next.js + en-têtes sécurité
├── package.json                   # Dépendances et scripts
└── tsconfig.json                  # Configuration TypeScript
```

## 2.5 Déploiement Docker

### Architecture de déploiement

```
┌──────────────┐        Port 8080        ┌───────────────────────────────┐
│              │ ◄─────────────────────► │  si-dashboard (Next.js)       │
│  Navigateur  │     HTTP / HTTPS        │  Container : node:20-alpine   │
│  (Client)    │                         │  Port interne : 3000          │
└──────────────┘                         └──────────────┬────────────────┘
                                                        │
                                          depends_on: service_healthy
                                          (attend que MySQL soit prêt)
                                                        │
                                                        │ TCP 3306
                                                        │ (réseau Docker interne)
                                                        ▼
                                         ┌───────────────────────────────┐
                                         │  si-mysql (MySQL 8.0)         │
                                         │  Container : mysql:8.0        │
                                         │  Port exposé local : 3307     │
                                         │  Base : sym_ad                │
                                         └──────────────┬────────────────┘
                                                        │
                                                        ▼
                                         ┌───────────────────────────────┐
                                         │  Volume Docker : mysql_data   │
                                         │  Persistance des données      │
                                         │  + init.sql (schéma initial)  │
                                         └───────────────────────────────┘
```

### Dockerfile — Build multi-étapes

Le Dockerfile utilise un build en 4 étapes pour optimiser la taille de l'image :

| Étape | Base | Rôle | Taille |
|-------|------|------|--------|
| **base** | `node:20-alpine` | Image de base légère | ~180 Mo |
| **deps** | base | Installation des dépendances npm | +200 Mo |
| **builder** | base + deps | Compilation Next.js (`npm run build`) | +500 Mo |
| **runner** | `node:20-alpine` | Image finale avec `standalone` uniquement | ~200 Mo |

La configuration `output: "standalone"` de Next.js produit un binaire autonome contenant uniquement les fichiers nécessaires à l'exécution.

### Docker Compose — Services

```yaml
services:
  db:                          # MySQL 8.0
    image: mysql:8.0
    container_name: si-mysql
    ports: "3307:3306"         # Exposé en local sur 3307
    healthcheck:               # Vérification toutes les 10s
      test: mysqladmin ping
    volumes:
      - mysql_data:/var/lib/mysql         # Persistance
      - ./scripts/init.sql:/docker-entrypoint-initdb.d/  # Init auto

  app:                         # Next.js (production)
    build: .
    container_name: si-dashboard
    ports: "8080:3000"
    depends_on:
      db:
        condition: service_healthy  # Attend que MySQL soit prêt
    environment:
      - DB_HOST=db              # DNS interne Docker
      - COOKIE_SECRET=...       # Clé de signature (min. 32 car.)
```

## 2.6 Flux de données — Diagramme de séquence

### Authentification

```
Client                    Middleware Edge        API /auth          Rate Limiter       MySQL
  │                            │                    │                   │                │
  │  POST /api/auth            │                    │                   │                │
  │  {username, password}      │                    │                   │                │
  │───────────────────────────►│                    │                   │                │
  │                            │ (route non protégée, passe)           │                │
  │                            │───────────────────►│                   │                │
  │                            │                    │  check(ip)        │                │
  │                            │                    │──────────────────►│                │
  │                            │                    │  OK / 429         │                │
  │                            │                    │◄─────────────────│                │
  │                            │                    │                   │                │
  │                            │                    │  SELECT user WHERE samaccountname  │
  │                            │                    │──────────────────────────────────►│
  │                            │                    │  {id, hash, groupes}              │
  │                            │                    │◄─────────────────────────────────│
  │                            │                    │                   │                │
  │                            │                    │  bcrypt.compare(password, hash)   │
  │                            │                    │                   │                │
  │  200 + Set-Cookie:         │                    │                   │                │
  │  auth_token=user.signature │                    │                   │                │
  │  auth_groups=groups.sig    │                    │                   │                │
  │◄───────────────────────────┤◄──────────────────│                   │                │
```

### Requête API protégée

```
Client                    Middleware Edge        Auth Middleware       API Route         MySQL
  │                            │                    │                    │                │
  │  GET /api/annuaire         │                    │                    │                │
  │  Cookie: auth_token=...    │                    │                    │                │
  │───────────────────────────►│                    │                    │                │
  │                            │ cookie présent ?   │                    │                │
  │                            │ OUI → next()       │                    │                │
  │                            │───────────────────►│                    │                │
  │                            │                    │ unsignCookie()     │                │
  │                            │                    │ vérif. groupes     │                │
  │                            │                    │───────────────────►│                │
  │                            │                    │                    │ SELECT users   │
  │                            │                    │                    │───────────────►│
  │                            │                    │                    │ [{user data}]  │
  │  200 JSON [{...}]          │                    │                    │◄──────────────│
  │◄───────────────────────────┤◄──────────────────┤◄──────────────────│                │
```

## 2.7 En-têtes de sécurité HTTP

Configurés dans `next.config.ts`, ces en-têtes sont appliqués à **toutes les réponses** :

| En-tête | Valeur | Protection |
|---------|--------|------------|
| `X-Content-Type-Options` | `nosniff` | Empêche le MIME sniffing |
| `X-Frame-Options` | `DENY` | Protection contre le clickjacking |
| `X-XSS-Protection` | `1; mode=block` | Filtre XSS navigateur (legacy) |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Contrôle les informations envoyées dans le Referer |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Désactive les API sensibles du navigateur |
