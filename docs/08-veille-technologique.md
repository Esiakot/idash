# 08 — Veille technologique

## 8.1 Choix technologiques et justifications

### 8.1.1 Next.js — Framework full-stack React

**Choix retenu :** Next.js 16 (App Router)

| Critère | Next.js | Express.js + React SPA | PHP (Laravel) |
|---------|---------|----------------------|---------------|
| **Langage unifié** | ✅ TypeScript partout | ✅ TypeScript (2 projets) | ❌ PHP + JS séparés |
| **Routing** | ✅ Fichier-based (convention) | ❌ Configuration manuelle | ✅ Convention |
| **API intégrée** | ✅ Route Handlers | ❌ Serveur séparé | ✅ Controllers |
| **SSR / SSG** | ✅ Natif | ❌ Requiert config | ✅ Blade templates |
| **Écosystème React** | ✅ Natif | ✅ Natif | ❌ Via Inertia |
| **Middleware Edge** | ✅ Performant | ❌ Non disponible | ❌ Non disponible |
| **Déploiement** | ✅ Standalone binary | ⚠️ 2 déploiements | ✅ Simple |

**Justification :** Next.js permet de développer front-end et back-end dans un même projet TypeScript, éliminant les problèmes de synchronisation entre deux bases de code. Le mode `standalone` produit un binaire léger idéal pour Docker.

---

### 8.1.2 React 19 — Bibliothèque UI

**Choix retenu :** React 19.2.3

| Critère | React | Vue.js | Angular |
|---------|-------|--------|---------|
| **Popularité** | #1 mondial | #2 | #3 |
| **Courbe d'apprentissage** | Moyenne | Faible | Élevée |
| **Écosystème** | Très riche | Riche | Intégré |
| **Performances** | ✅ Virtual DOM | ✅ Proxy reactivity | ✅ Change detection |
| **Intégration Next.js** | ✅ Natif | ❌ (Nuxt) | ❌ |
| **Server Components** | ✅ React 19 | ❌ | ❌ |

**Justification :** React est le choix naturel pour Next.js. React 19 apporte les Server Components et les hooks optimisés, permettant un rendu plus performant.

---

### 8.1.3 MySQL — Système de gestion de base de données

**Choix retenu :** MySQL 8.0

| Critère | MySQL | PostgreSQL | SQLite |
|---------|-------|-----------|--------|
| **Compatibilité existante** | ✅ Base `sym_ad` déjà en MySQL | ❌ Migration requise | ❌ Migration requise |
| **Performances** | ✅ Rapide en lecture | ✅ Meilleur en écriture | ⚠️ Mono-thread |
| **Docker** | ✅ Image officielle légère | ✅ Image officielle | ✅ Embarqué |
| **ACID / Transactions** | ✅ InnoDB | ✅ Natif | ⚠️ Limité |
| **Row locking (FOR UPDATE)** | ✅ InnoDB | ✅ | ❌ |
| **Typage BIT** | ✅ BIT(1) natif | ⚠️ BOOLEAN | ❌ |

**Justification :** La base de données existante (`sym_ad`) étant déjà sur MySQL, conserver le même SGBD élimine le risque de migration et garantit la compatibilité avec les scripts PowerShell/AD existants.

---

### 8.1.4 Zod — Validation de données

**Choix retenu :** Zod 4.3.5

| Critère | Zod | Joi | Yup | Validation manuelle |
|---------|-----|-----|-----|-------------------|
| **TypeScript-first** | ✅ Inférence native | ❌ Types séparés | ⚠️ Partiel | ❌ |
| **Taille bundle** | 13 KB | 150 KB | 40 KB | 0 KB |
| **Validation côté serveur** | ✅ | ✅ | ✅ | ⚠️ Erreur humaine |
| **Messages d'erreur** | ✅ Détaillés | ✅ | ✅ | ❌ |
| **Composabilité** | ✅ `.extend()`, `.pick()` | ⚠️ | ⚠️ | ❌ |

**Justification :** Zod permet de définir un schéma de validation qui génère automatiquement le type TypeScript correspondant, garantissant la cohérence entre la validation et le typage statique. Zod 4 est ultra-léger (13 KB).

---

### 8.1.5 bcryptjs — Hachage de mots de passe

**Choix retenu :** bcryptjs 3.0.3

| Critère | bcryptjs | argon2 | scrypt | SHA-256 |
|---------|----------|--------|--------|---------|
| **Sécurité** | ✅ Élevée | ✅ Très élevée | ✅ Élevée | ❌ Insuffisant |
| **Compatibilité Node** | ✅ Pure JS | ⚠️ Binding natif | ✅ Node.js natif | ✅ |
| **Docker Alpine** | ✅ Pas de compilation | ❌ Requiert gcc | ✅ | ✅ |
| **Standard industriel** | ✅ Très répandu | ✅ OWASP recommandé | ✅ | ❌ |
| **Salt automatique** | ✅ | ✅ | ❌ Manuel | ❌ |

**Justification :** bcryptjs fonctionne en JavaScript pur (pas de compilation C nécessaire), ce qui simplifie le build Docker sur Alpine Linux. Il offre un niveau de sécurité suffisant pour l'application avec un salt automatique intégré.

---

### 8.1.6 Docker — Conteneurisation

**Choix retenu :** Docker + Docker Compose

| Critère | Docker | VM (VirtualBox) | Déploiement direct |
|---------|--------|-----------------|-------------------|
| **Isolation** | ✅ Conteneurs légers | ✅ VM complète | ❌ Aucune |
| **Reproductibilité** | ✅ Dockerfile déclaratif | ⚠️ Script d'install | ❌ |
| **Temps de démarrage** | ✅ Secondes | ❌ Minutes | ✅ Immédiat |
| **Portabilité** | ✅ Any OS | ⚠️ Dépend hyperviseur | ❌ |
| **Ressources** | ✅ Partagées avec l'hôte | ❌ RAM/CPU dédiée | ✅ |

**Justification :** Docker garantit que l'application fonctionne de manière identique en développement et en production. Le build multi-étapes réduit la taille de l'image finale.

---

## 8.2 Évolutions technologiques récentes

### 8.2.1 React 19 — Nouveautés (2024-2025)

| Fonctionnalité | Description | Impact sur iDash |
|---------------|-------------|-----------------|
| **Server Components** | Composants rendus côté serveur | Potentiel d'optimisation des pages de lecture |
| **Actions** | Gestion simplifiée des formulaires | Simplification des modaux CRUD |
| **use() hook** | Lecture de promesses pendant le rendu | Chargement de données plus propre |
| **Concurrent features** | Rendu non-bloquant | Meilleure réactivité de l'UI |

### 8.2.2 Next.js 16 — App Router mature (2025-2026)

| Fonctionnalité | Description | Utilisé dans iDash |
|---------------|-------------|:------------------:|
| **Route Handlers** | API Routes avec l'App Router | ✅ |
| **Middleware Edge** | Exécution sur l'Edge Runtime | ✅ |
| **Streaming SSR** | Rendu progressif | ❌ (potentiel) |
| **Parallel Routes** | Layouts imbriqués parallèles | ❌ (potentiel) |

### 8.2.3 Tendances de la cybersécurité web (2025-2026)

| Tendance | Description | Pertinence pour iDash |
|----------|-------------|----------------------|
| **Passkeys / WebAuthn** | Authentification sans mot de passe | Évolution possible de l'auth actuelle |
| **Zero Trust Architecture** | Vérification à chaque requête | Déjà implémenté (middleware à chaque route) |
| **Supply Chain Security** | Audit des dépendances npm | `npm audit` recommandé en CI/CD |
| **OWASP Top 10 2021** | Référentiel de sécurité web | Conformité vérifiée (doc 04-securite.md) |

---

## 8.3 Sources de veille

### Sources utilisées pour le projet

| Source | Type | URL | Fréquence |
|--------|------|-----|-----------|
| **Next.js Blog** | Blog officiel | https://nextjs.org/blog | Hebdomadaire |
| **React Dev Blog** | Blog officiel | https://react.dev/blog | Mensuel |
| **OWASP** | Référentiel sécurité | https://owasp.org/Top10/ | Annuel |
| **MDN Web Docs** | Documentation | https://developer.mozilla.org | À la demande |
| **npm Security** | Alertes vulnérabilités | `npm audit` / Dependabot | Continue |
| **Zod Changelog** | Changelog lib | https://github.com/colinhacks/zod | À la mise à jour |

### Outils de veille

| Outil | Usage |
|-------|-------|
| **GitHub Dependabot** | Alertes automatiques sur les vulnérabilités des dépendances |
| **npm audit** | Scan des vulnérabilités dans `node_modules` |
| **ESLint** | Détection de patterns insécurisés ou déconseillés |
| **TypeScript strict** | Prévention des erreurs de type à la compilation |

---

## 8.4 Axes d'amélioration et perspectives

| Axe | Description | Priorité |
|-----|-------------|:--------:|
| **Tests automatisés** | Ajout de tests unitaires (Jest/Vitest) et E2E (Playwright) | Haute |
| **CI/CD** | Pipeline GitHub Actions (lint, test, build, deploy) | Haute |
| **Logs centralisés** | Intégration ELK Stack ou Datadog pour l'audit logger | Moyenne |
| **Authentification SSO** | Intégration LDAP/AD réel (remplacer les comptes locaux) | Moyenne |
| **PWA** | Mode hors-ligne avec Service Worker | Faible |
| **Graphiques** | Exploiter Recharts pour des tableaux de bord visuels | Faible |
| **Accessibilité** | Audit WCAG 2.1 et améliorations ARIA | Moyenne |
| **Rate limiter distribué** | Redis pour supporter le scaling horizontal | Faible |
