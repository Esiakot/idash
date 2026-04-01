# middleware/

Middleware de traitement des requêtes (pipeline auth et sécurité).

- **auth-middleware.ts** : vérification des cookies signés, extraction de session, contrôle des groupes (`requireAuth`, `requireGroup`, `requireAnyGroup`)
- **rate-limiter.ts** : limitation de débit par IP (protection brute-force sur l'authentification) + extraction IP client

Appelé par les route handlers API avant toute logique métier.
