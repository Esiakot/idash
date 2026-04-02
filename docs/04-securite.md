# 04 — Sécurité et cybersécurité

## 4.1 Politique de sécurité globale

La sécurisation d'iDash repose sur une approche **défense en profondeur** (Defense in Depth), avec des mécanismes de protection à chaque couche de l'application :

```
┌──────────────────────────────────────────────────┐
│  COUCHE 1 — Réseau / Infrastructure              │
│  • Conteneurs Docker isolés                       │
│  • Port MySQL non exposé en production            │
│  • Réseau Docker interne entre services           │
├──────────────────────────────────────────────────┤
│  COUCHE 2 — Transport / HTTP                      │
│  • En-têtes de sécurité (CSP, X-Frame-Options)   │
│  • Cookies HttpOnly, Secure, SameSite=Lax         │
│  • Permissions-Policy restrictive                 │
├──────────────────────────────────────────────────┤
│  COUCHE 3 — Authentification                      │
│  • Hachage bcrypt des mots de passe               │
│  • Cookies signés HMAC-SHA256                     │
│  • Rate limiting (5 tentatives / 15 min)          │
├──────────────────────────────────────────────────┤
│  COUCHE 4 — Autorisation (RBAC)                   │
│  • Middleware Edge (vérification cookie)           │
│  • Contrôle de groupe par route API               │
│  • Séparation lecture / écriture                  │
├──────────────────────────────────────────────────┤
│  COUCHE 5 — Données                               │
│  • Requêtes SQL paramétrées (anti-injection)      │
│  • Validation Zod en entrée                       │
│  • Transactions avec verrouillage ligne           │
├──────────────────────────────────────────────────┤
│  COUCHE 6 — Traçabilité                           │
│  • Audit logger (toutes actions sensibles)        │
│  • Journalisation des échecs d'authentification   │
│  • Journalisation des accès non autorisés        │
└──────────────────────────────────────────────────┘
```

## 4.2 Authentification

### 4.2.1 Hachage des mots de passe

Les mots de passe sont stockés sous forme de **hash bcrypt** dans la colonne `mot_de_passe` de la table `utilisateurs`.

```
Mot de passe "demo" → $2b$10$abcdef... (60 caractères)
```

**Propriétés de bcrypt :**
- Algorithme adaptatif (coût configurable)
- Salt intégré automatiquement
- Résistant aux attaques par dictionnaire et force brute
- Temps de calcul volontairement élevé (~100ms par vérification)

### 4.2.2 Processus d'authentification

```
1. L'utilisateur soumet username + password
2. Rate limiter vérifie : IP autorisée ? (< 5 tentatives / 15 min)
3. Requête SQL : SELECT * FROM utilisateurs WHERE samaccountname = ?
4. bcrypt.compare(password, user.mot_de_passe)
5. Si OK : extraction des groupes depuis les colonnes BIT(1)
6. Signature HMAC-SHA256 du username et des groupes
7. Envoi de 2 cookies signés : auth_token + auth_groups
8. Si KO : incrémentation du compteur rate limit + audit log
```

### 4.2.3 Signature des cookies (HMAC-SHA256)

Les cookies ne contiennent **aucune donnée sensible** mais sont signés pour garantir leur intégrité :

```
Cookie auth_token = "DemoAdmin.a1b2c3d4e5f6..."
                     ─────────  ──────────────
                     valeur     signature HMAC
```

**Vérification :**
1. Séparer la valeur et la signature
2. Recalculer `HMAC-SHA256(valeur, COOKIE_SECRET)`
3. Comparer avec la signature reçue en **temps constant** (`timingSafeEqual`)
4. Si la signature ne correspond pas → cookie rejeté

La comparaison en temps constant protège contre les **attaques par timing** (timing attacks) qui pourraient deviner la signature octet par octet.

### 4.2.4 Configuration des cookies

| Propriété | Valeur | Objectif sécuritaire |
|-----------|--------|---------------------|
| `HttpOnly` | `true` | Inaccessible au JavaScript (protection XSS) |
| `Secure` | `true` (production) | Transmis uniquement en HTTPS |
| `SameSite` | `Lax` | Protection CSRF (cross-site request forgery) |
| `Path` | `/` | Accessible sur toutes les routes |
| `Max-Age` | `28800` (8 heures) | Expiration automatique de la session |

## 4.3 Autorisation — Contrôle d'accès basé sur les rôles (RBAC)

### 4.3.1 Matrice des droits

| Ressource | Méthode | Non authentifié | Authentifié | ServiceInfo | Direction |
|-----------|---------|:-:|:-:|:-:|:-:|
| `/api/auth` | POST | ✅ | ✅ | ✅ | ✅ |
| `/api/session` | GET/DELETE | ✅ | ✅ | ✅ | ✅ |
| `/api/health` | GET | ✅ | ✅ | ✅ | ✅ |
| `/api/annuaire` | GET | ❌ | ✅ | ✅ | ✅ |
| `/api/ordinateurs` | GET | ❌ | ✅ | ✅ | ✅ |
| `/api/ordinateurs` | POST/DELETE | ❌ | ❌ | ✅ | ❌ |
| `/api/ordinateurs?free=true` | GET | ❌ | ❌ | ✅ | ❌ |
| `/api/telephones` | GET | ❌ | ✅ | ✅ | ✅ |
| `/api/telephones` | POST/PUT/DELETE | ❌ | ❌ | ✅ | ❌ |
| `/api/utilisateurs/[id]/mobile` | GET/PATCH | ❌ | ❌ | ✅ | ❌ |

### 4.3.2 Deux niveaux de vérification

**Niveau 1 — Middleware Edge (middleware.ts)**

Point d'entrée unique exécuté **avant** toute route API protégée. Vérifie la simple présence du cookie `auth_token`.

```
Matcher : /api/annuaire, /api/ordinateurs, /api/telephones, /api/utilisateurs
→ Cookie absent ? → 401 Unauthorized
→ Cookie présent ? → Passe au Route Handler
```

**Niveau 2 — Auth Middleware applicatif**

Dans chaque route API, vérification fine des groupes :

| Fonction | Comportement |
|----------|-------------|
| `requireAuth(req)` | Vérifie la signature du cookie, retourne `{username, groups, ip}` |
| `requireGroup(req, "Glo_ServiceInfo")` | Vérifie que l'utilisateur appartient au groupe requis |
| `requireAnyGroup(req, [...groups])` | Vérifie l'appartenance à au moins un des groupes listés |

## 4.4 Protection contre les attaques — Conformité OWASP

### Référentiel : OWASP Top 10 (2021)

| # | Risque OWASP | Mesures implémentées dans iDash |
|---|-------------|--------------------------------|
| **A01** | **Broken Access Control** | Middleware Edge + RBAC par groupes + vérification à chaque endpoint |
| **A02** | **Cryptographic Failures** | bcrypt pour les mots de passe, HMAC-SHA256 pour les cookies, COOKIE_SECRET ≥ 32 caractères |
| **A03** | **Injection** | Requêtes SQL paramétrées (placeholders `?`), validation Zod en entrée |
| **A04** | **Insecure Design** | Architecture en couches, séparation des responsabilités, principe du moindre privilège |
| **A05** | **Security Misconfiguration** | En-têtes de sécurité HTTP, variables d'environnement requises, health check |
| **A06** | **Vulnerable Components** | Dépendances à jour (React 19, Next.js 16, Zod 4), ESLint strict |
| **A07** | **Auth Failures** | Rate limiting (5 tentatives / 15 min), audit des échecs, bcrypt adaptatif |
| **A08** | **Data Integrity Failures** | Cookies signés (HMAC), validation Zod à chaque entrée, transactions SQL |
| **A09** | **Logging Failures** | Audit logger complet (auth, CRUD, accès refusés) avec horodatage |
| **A10** | **SSRF** | Pas d'appels HTTP sortants depuis le serveur, API fermée |

## 4.5 Protection contre les injections SQL

Toutes les requêtes SQL utilisent des **requêtes paramétrées** avec le driver `mysql2` :

```typescript
// ✅ SÉCURISÉ — Requête paramétrée
const [rows] = await pool.execute(
  'SELECT * FROM utilisateurs WHERE samaccountname = ?',
  [username]   // La valeur est échappée automatiquement
);

// ❌ VULNÉRABLE — Concaténation (jamais utilisé dans iDash)
const [rows] = await pool.execute(
  `SELECT * FROM utilisateurs WHERE samaccountname = '${username}'`
);
```

Le driver `mysql2` convertit automatiquement les paramètres en valeurs échappées, rendant toute tentative d'injection SQL inopérante.

## 4.6 Rate limiting — Protection brute-force

Le rate limiter protège la route d'authentification (`/api/auth`) contre les attaques par **force brute** — c'est-à-dire quand un attaquant essaie des milliers de mots de passe automatiquement. Il fonctionne avec une `Map` en mémoire qui associe chaque adresse IP à un compteur de tentatives et une date d'expiration. Au-delà de 5 tentatives en 15 minutes, l'IP est bloquée (HTTP 429). Un nettoyage automatique supprime les entrées expirées toutes les 5 minutes pour éviter les fuites mémoire.

### Implémentation — Classe `RateLimiter`

```typescript
class RateLimiter {
  private attempts: Map<string, RateLimitEntry> = new Map();

  check(ip: string): boolean {
    const now = Date.now();
    const entry = this.attempts.get(ip);

    if (!entry || now > entry.resetTime) {
      // Première tentative ou fenêtre expirée → on autorise
      this.attempts.set(ip, {
        count: 1,
        resetTime: now + this.windowMs,  // 15 min
      });
      return true;
    }

    if (entry.count >= this.maxAttempts) {
      return false;  // Bloqué → 429
    }

    entry.count++;
    return true;
  }

  reset(ip: string): void {
    this.attempts.delete(ip);  // Appelé après un login réussi
  }
}
```

### Comportement

| Tentative | Résultat | Action |
|-----------|----------|--------|
| 1 à 5 | Mot de passe incorrect | Compteur incrémenté, audit log |
| 6+ | Bloqué | HTTP 429 Too Many Requests |
| Après 15 min | Fenêtre expirée | Compteur remis à zéro |
| Succès | Authentifié | Compteur effacé immédiatement |

### Extraction de l'IP client

La fonction `getClientIp()` gère les cas de reverse proxy. Derrière un reverse proxy (Nginx, Docker), l'IP directe serait celle du proxy et non du client réel, d'où l'inspection des headers :

```typescript
export function getClientIp(headers: Headers): string {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();

  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp;

  return headers.get("x-client-ip") || "unknown";
}
```

## 4.7 Audit et traçabilité

### Actions journalisées

| Action | Niveau | Détails capturés |
|--------|--------|-----------------|
| `AUTH_SUCCESS` | Info | username, IP, groupes obtenus |
| `AUTH_FAILED` | Warning | username tenté, IP, raison de l'échec |
| `AUTH_RATE_LIMITED` | Warning | IP, endpoint |
| `TELEPHONE_CREATE` | Info | username, IP, ID téléphone, détails |
| `TELEPHONE_UPDATE` | Info | username, IP, ID téléphone, modifications |
| `TELEPHONE_DELETE` | Info | username, IP, ID téléphone |
| `COMPUTER_ASSIGN` | Info | username, IP, ID ordinateur, ID utilisateur |
| `COMPUTER_UNASSIGN` | Info | username, IP, ID ordinateur |
| `USER_MOBILE_UPDATE` | Info | username, IP, ID utilisateur, nouveau numéro |
| `UNAUTHORIZED_ACCESS` | Warning | username, IP, endpoint, groupe requis |

### Format des logs

```json
{
  "timestamp": "2026-04-02T10:30:00.000Z",
  "action": "AUTH_FAILED",
  "username": "intrus",
  "ip": "192.168.1.42",
  "details": { "reason": "Invalid password" },
  "success": false
}
```

## 4.8 Sécurisation du déploiement

### Variables d'environnement requises

| Variable | Sensibilité | Description |
|----------|-------------|-------------|
| `DB_HOST` | Faible | Hôte MySQL (DNS interne Docker) |
| `DB_USER` | Moyenne | Utilisateur BDD |
| `DB_PASSWORD` | **Haute** | Mot de passe BDD |
| `DB_NAME` | Faible | Nom de la base |
| `COOKIE_SECRET` | **Très haute** | Clé HMAC-SHA256 (≥ 32 caractères) |

### Bonnes pratiques de déploiement

- **COOKIE_SECRET** ne doit jamais être committé dans le dépôt
- Les ports MySQL (3306) ne sont pas exposés en production (réseau Docker interne)
- L'utilisateur MySQL `si_user` a des droits limités (pas de DROP, pas de GRANT)
- L'application Next.js s'exécute en tant qu'utilisateur non-root (`nextjs`, uid 1001)
- Le conteneur a une politique de redémarrage contrôlée (`restart: no`)

## 4.9 Schéma récapitulatif — Flux d'une requête sécurisée

```
                    REQUÊTE ENTRANTE
                          │
                          ▼
               ┌─────────────────────┐
               │  En-têtes sécurité  │  X-Frame-Options, CSP, etc.
               │   (next.config.ts)  │
               └──────────┬──────────┘
                          │
                          ▼
               ┌─────────────────────┐
               │  Middleware Edge     │  Cookie auth_token présent ?
               │   (middleware.ts)   │
               └──────────┬──────────┘
                     ┌────┴────┐
                  NON│         │OUI
                     ▼         ▼
                 401 JSON   Continue
                             │
                             ▼
               ┌─────────────────────┐
               │  Auth Middleware     │  Signature HMAC valide ?
               │  (requireAuth)      │  Groupe autorisé ?
               └──────────┬──────────┘
                     ┌────┴────┐
                  NON│         │OUI
                     ▼         ▼
              401/403 JSON   Continue
                             │
                             ▼
               ┌─────────────────────┐
               │  Validation Zod     │  Données conformes au schéma ?
               │  (validateRequest)  │
               └──────────┬──────────┘
                     ┌────┴────┐
                  NON│         │OUI
                     ▼         ▼
                 400 JSON   Continue
                             │
                             ▼
               ┌─────────────────────┐
               │  Requête SQL        │  Requête paramétrée
               │  paramétrée         │  + Transaction si écriture
               └──────────┬──────────┘
                          │
                          ▼
               ┌─────────────────────┐
               │  Audit Logger       │  Journalisation de l'action
               └──────────┬──────────┘
                          │
                          ▼
                    RÉPONSE JSON
```
