# 05 — Documentation technique — API REST

## 5.1 Vue d'ensemble des endpoints

| Méthode | Endpoint | Auth | Groupe requis | Description |
|---------|----------|:----:|---------------|-------------|
| `POST` | `/api/auth` | ❌ | — | Authentification |
| `GET` | `/api/session` | ❌ | — | État de la session |
| `DELETE` | `/api/session` | ❌ | — | Déconnexion |
| `GET` | `/api/health` | ❌ | — | Vérification de santé |
| `GET` | `/api/annuaire` | ✅ | Tout groupe autorisé | Liste des utilisateurs |
| `GET` | `/api/ordinateurs` | ✅ | Tout groupe autorisé | Liste des ordinateurs |
| `POST` | `/api/ordinateurs` | ✅ | `Glo_ServiceInfo` | Affecter un ordinateur |
| `DELETE` | `/api/ordinateurs` | ✅ | `Glo_ServiceInfo` | Désaffecter un ordinateur |
| `GET` | `/api/ordinateurs/annuaire` | ✅ | Tout groupe autorisé | Ordinateurs avec filtres et facettes |
| `GET` | `/api/telephones` | ✅ | Tout groupe autorisé | Liste des téléphones |
| `POST` | `/api/telephones` | ✅ | `Glo_ServiceInfo` | Créer un téléphone |
| `PUT` | `/api/telephones` | ✅ | `Glo_ServiceInfo` | Modifier un téléphone |
| `DELETE` | `/api/telephones` | ✅ | `Glo_ServiceInfo` | Supprimer un téléphone |
| `GET` | `/api/utilisateurs/[id]/mobile` | ✅ | `Glo_ServiceInfo` | Lire le mobile d'un utilisateur |
| `PATCH` | `/api/utilisateurs/[id]/mobile` | ✅ | `Glo_ServiceInfo` | Modifier le mobile |

---

## 5.2 Détail des endpoints

### POST `/api/auth` — Authentification

**Description :** Authentifie un utilisateur avec ses identifiants Active Directory.

**Requête :**
```http
POST /api/auth
Content-Type: application/json

{
  "username": "DemoAdmin",
  "password": "demo"
}
```

**Réponse succès (200) :**
```json
{
  "ok": true,
  "username": "DemoAdmin",
  "groupes": ["Glo_ServiceInfo", "Glo_Direction", "Glo_Symetrie"]
}
```

**Cookies positionnés :**
```
Set-Cookie: auth_token=DemoAdmin.<signature>; HttpOnly; SameSite=Lax; Path=/; Max-Age=28800
Set-Cookie: auth_groups=Glo_ServiceInfo,Glo_Direction,Glo_Symetrie.<signature>; HttpOnly; SameSite=Lax; Path=/; Max-Age=28800
```

**Erreurs :**

| Code | Cas | Corps |
|------|-----|-------|
| 401 | Identifiants invalides | `{ "error": "Identifiants invalides" }` |
| 429 | Rate limit atteint | `{ "error": "Trop de tentatives...", "retryAfter": 540 }` |

**Sécurité :** Rate limiting (5 tentatives / 15 min par IP), audit logging.

**Extrait du code source :**

```typescript
// src/app/api/auth/route.ts
export async function POST(req: NextRequest) {
  return withErrorHandler(async () => {
    const clientIp = getClientIp(req.headers);

    // 1. Vérification du rate limiter
    if (!authRateLimiter.check(clientIp)) {
      const retryAfter = authRateLimiter.getTimeUntilReset(clientIp);
      auditLogger.logRateLimited(clientIp, API_ROUTES.AUTH);
      throw new ApiError(ERROR_MESSAGES.RATE_LIMITED(retryAfter), 429);
    }

    // 2. Validation Zod des données d'entrée
    const parsed = AuthSchema.safeParse(await req.json());
    if (!parsed.success) throw new ApiError("Identifiants requis", 400);
    const { username, password } = parsed.data;

    // 3. Recherche de l'utilisateur en BDD (requête paramétrée)
    const [rows] = await pool.query(
      'SELECT *, mot_de_passe FROM utilisateurs WHERE samaccountname = ?',
      [username]
    );

    // 4. Comparaison bcrypt du mot de passe
    const isMatch = await bcrypt.compare(password, dbUser.mot_de_passe);
    if (!isMatch) throw new ApiError("Identifiants invalides", 401);

    // 5. Succès : reset du rate limiter + cookies signés HMAC
    authRateLimiter.reset(clientIp);
    response.cookies.set("auth_token", signCookie(username), {
      httpOnly: true, secure: true, sameSite: "lax",
    });
    return response;
  })(req);
}
```

---

### GET `/api/session` — État de la session

**Description :** Retourne l'état de la session courante.

**Requête :**
```http
GET /api/session
Cookie: auth_token=DemoAdmin.<signature>; auth_groups=...
```

**Réponse authentifié (200) :**
```json
{
  "authenticated": true,
  "username": "DemoAdmin",
  "groups": ["Glo_ServiceInfo", "Glo_Direction", "Glo_Symetrie"]
}
```

**Réponse non authentifié (200) :**
```json
{
  "authenticated": false
}
```

---

### DELETE `/api/session` — Déconnexion

**Description :** Supprime les cookies d'authentification.

**Réponse (200) :**
```json
{ "success": true }
```

**Cookies supprimés :** `auth_token`, `auth_groups` (Max-Age=0).

---

### GET `/api/health` — Vérification de santé

**Description :** Endpoint public de surveillance du système.

**Réponse saine (200) :**
```json
{
  "status": "healthy",
  "timestamp": "2026-04-02T10:30:00.000Z",
  "checks": {
    "database": { "status": "ok" },
    "environment": { "status": "ok" }
  }
}
```

**Réponse dégradée (200) :**
```json
{
  "status": "degraded",
  "timestamp": "2026-04-02T10:30:00.000Z",
  "checks": {
    "database": { "status": "ok" },
    "environment": { "status": "warning", "missing": ["COOKIE_SECRET"] }
  }
}
```

---

### GET `/api/annuaire` — Liste des utilisateurs

**Description :** Retourne la liste complète des utilisateurs avec leurs groupes.

**Requête :**
```http
GET /api/annuaire
Cookie: auth_token=...
```

**Réponse (200) :**
```json
[
  {
    "id": 1,
    "trigramme": "OLA",
    "prenom": "Olivier",
    "nom": "LACAN",
    "samaccountname": "o.lacan",
    "mobile": "06 00 00 00 01",
    "type_utilisateur": "Employé",
    "activite": "Actif",
    "Glo_Stagiaire": { "type": "Buffer", "data": [0] },
    "Glo_ServiceInfo": { "type": "Buffer", "data": [1] },
    "Glo_Direction": { "type": "Buffer", "data": [1] },
    "isStagiaire": false,
    "created_at": "2026-01-01T00:00:00.000Z",
    "updated_at": "2026-04-02T10:00:00.000Z"
  }
]
```

**Notes :**
- Triés par `nom ASC, prenom ASC`
- Le champ `mot_de_passe` est **exclu** de la réponse
- Les champs `Glo_*` sont des Buffer MySQL (BIT), normalisés côté client via `flagOn()`

---

### GET `/api/ordinateurs` — Liste des ordinateurs

**Description :** Retourne la liste des ordinateurs avec leurs affectations.

**Paramètres de requête :**

| Paramètre | Type | Valeurs | Description |
|-----------|------|---------|-------------|
| `free` | string | `"true"` | Retourne uniquement les postes libres (Station/Portable) |

**Réponse standard (200) :**
```json
[
  {
    "id": 1,
    "nom": "PC-DIR-001",
    "systeme_exploitation": "Windows 11",
    "version": "23H2",
    "type": "Station",
    "utilisateur_id": 1
  }
]
```

**Réponse `?free=true` (200) — Requiert `Glo_ServiceInfo` :**
```json
[
  {
    "id": 45,
    "nom": "PC-SPARE-001",
    "systeme_exploitation": "Windows 11",
    "version": "24H2",
    "type": "Station",
    "utilisateur_id": null
  }
]
```

---

### POST `/api/ordinateurs` — Affecter un ordinateur

**Description :** Affecte un ordinateur libre à un utilisateur. Utilise une transaction SQL avec verrouillage de ligne (`SELECT ... FOR UPDATE`).

**Requête :**
```http
POST /api/ordinateurs
Content-Type: application/json
Cookie: auth_token=...

{
  "ordinateur_id": 45,
  "utilisateur_id": 1
}
```

**Réponse succès (201) :**
```json
{
  "ok": true,
  "ordinateur": {
    "id": 45,
    "nom": "PC-SPARE-001",
    "utilisateur_id": 1
  }
}
```

**Validations :**
- L'ordinateur doit être de type Station ou Portable
- L'ordinateur doit être libre (`utilisateur_id IS NULL`)
- Transaction avec `FOR UPDATE` pour éviter les affectations concurrentes

**Extrait du code source :**

```typescript
// src/app/api/ordinateurs/route.ts
const ordinateur = await withTransaction(async (conn) => {
  // Verrouillage de la ligne pour éviter les affectations concurrentes
  const [rows] = await conn.execute(
    "SELECT id, type, utilisateur_id, nom FROM ordinateurs WHERE id = ? FOR UPDATE",
    [ordId]
  );
  const r = (rows as any[])[0];

  if (!r) throw new ApiError("Ordinateur introuvable", 404);
  if (r.type !== "Station" && r.type !== "Portable")
    throw new ApiError("Seuls les stations et portables sont assignables", 400);
  if (r.utilisateur_id !== null)
    throw new ApiError("Ordinateur déjà affecté", 409);

  await conn.execute(
    "UPDATE ordinateurs SET utilisateur_id = ? WHERE id = ?",
    [userId, ordId]
  );
  return { ...r, utilisateur_id: userId };
});
```

**Erreurs :**

| Code | Cas |
|------|-----|
| 400 | Données invalides (Zod) |
| 403 | Groupe `Glo_ServiceInfo` manquant |
| 409 | Ordinateur déjà affecté |

---

### DELETE `/api/ordinateurs` — Désaffecter un ordinateur

**Requête :**
```http
DELETE /api/ordinateurs
Content-Type: application/json
Cookie: auth_token=...

{
  "ordinateur_id": 45
}
```

**Réponse succès (200) :**
```json
{ "ok": true }
```

---

### GET `/api/ordinateurs/annuaire` — Ordinateurs filtrés avec facettes

**Description :** Endpoint avancé retournant les ordinateurs filtrés et des statistiques facettées.

**Paramètres de requête :**

| Paramètre | Type | Valeurs possibles | Défaut |
|-----------|------|-------------------|--------|
| `type` | string | `Station`, `Serveur`, `Portable`, `Autre` | — |
| `status` | string | `Tous`, `Affecté`, `Non affecté` | `Tous` |
| `os` | string | `Windows 11`, `Ubuntu`, `NULL` (non spécifié) | — |
| `sortBy` | string | `nom`, `type`, `os`, `utilisateur` | `nom` |
| `sortDir` | string | `asc`, `desc` | `asc` |

**Réponse (200) :**
```json
{
  "computers": [
    {
      "id": 1,
      "nom": "PC-DIR-001",
      "systeme_exploitation": "Windows 11",
      "utilisateur_id": 1,
      "type": "Station",
      "prenom": "Olivier",
      "nom_utilisateur": "LACAN",
      "activite": 1
    }
  ],
  "facets": {
    "types": ["Station", "Serveur", "Portable", "Autre"],
    "osList": ["Windows 11", "Windows 10", "Ubuntu", "macOS Sonoma", null],
    "stats": {
      "total": 72,
      "assigned": 55,
      "nonAssigned": 17,
      "station": 50,
      "serveur": 10,
      "other": 12
    }
  }
}
```

---

### GET `/api/telephones` — Liste des téléphones

**Réponse (200) :**
```json
[
  {
    "id": 1,
    "poste": "10",
    "lignes_internes": "04 66 11 22 33",
    "utilisateur_id": 1,
    "prenom": "Olivier",
    "nom": "LACAN"
  }
]
```

---

### POST `/api/telephones` — Créer un téléphone

**Requête :**
```json
{
  "poste": "25",
  "lignes_internes": "04 66 11 22 55",
  "utilisateur_id": 3
}
```

**Validation Zod :**
- `poste` : exactement 2 chiffres
- `lignes_internes` : 1 à 100 caractères
- `utilisateur_id` : entier positif

**Réponse (201) :** `{ "ok": true, "telephone": {...} }`

---

### PUT `/api/telephones` — Modifier un téléphone

**Requête :**
```json
{
  "id": 1,
  "poste": "10",
  "lignes_internes": "04 66 99 88 77"
}
```

**Réponse (200) :** `{ "ok": true }`

---

### DELETE `/api/telephones` — Supprimer un téléphone

**Requête :**
```json
{ "id": 1 }
```

**Réponse (200) :** `{ "ok": true }`

---

### GET `/api/utilisateurs/[id]/mobile` — Lire le mobile

**Réponse (200) :**
```json
{
  "ok": true,
  "mobiles": "06 12 34 56 78"
}
```

---

### PATCH `/api/utilisateurs/[id]/mobile` — Modifier le mobile

**Requête :**
```json
{ "mobile": "06 98 76 54 32" }
```

**Validation :** Format téléphone (`/^[\d\s+()-]+$/`) ou chaîne vide.

**Réponse (200) :** `{ "ok": true, "mobiles": "06 98 76 54 32" }`

---

## 5.3 Codes d'erreur standardisés

| Code HTTP | Signification | Utilisation |
|-----------|--------------|-------------|
| `200` | OK | Succès (lecture, modification, suppression) |
| `201` | Created | Succès (création) |
| `400` | Bad Request | Données invalides (validation Zod) |
| `401` | Unauthorized | Non authentifié |
| `403` | Forbidden | Groupe insuffisant |
| `404` | Not Found | Ressource inexistante |
| `409` | Conflict | Ressource déjà utilisée (ex : PC déjà affecté) |
| `429` | Too Many Requests | Rate limit dépassé |
| `500` | Internal Server Error | Erreur serveur inattendue |

## 5.4 Gestion centralisée des erreurs

Toutes les routes API sont encapsulées dans un wrapper `withErrorHandler()` qui capture les exceptions et retourne des réponses JSON standardisées :

```typescript
// src/libs/api-wrapper.ts
export function withErrorHandler(handler: ApiHandler): ApiHandler {
  return async (req: NextRequest) => {
    try {
      return await handler(req);
    } catch (error: any) {
      console.error("API Error:", error);

      // Erreur métier (ex: 401, 403, 409)
      if (error instanceof ApiError) {
        return NextResponse.json(
          { error: error.message },
          { status: error.statusCode }
        );
      }

      // Erreur MySQL doublon (ex: trigramme déjà existant)
      if (error?.code === "ER_DUP_ENTRY") {
        return NextResponse.json(
          { error: "Entrée en doublon" },
          { status: 409 }
        );
      }

      // Erreur générique — détails masqués en production
      return NextResponse.json(
        { error: "Erreur interne du serveur" },
        { status: 500 }
      );
    }
  };
}
```

**Points clés :**
- Les `ApiError` sont des erreurs métier avec un code HTTP explicite
- Les erreurs MySQL spécifiques (doublon, FK invalide) sont gérées automatiquement
- Les détails techniques sont masqués en production pour éviter les fuites d'information
