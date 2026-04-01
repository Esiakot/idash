# libs/

Code d'infrastructure et d'intégration technique (côté serveur).

- **api-wrapper.ts** : classe `ApiError` + wrapper `withErrorHandler` pour les route handlers
- **cookie-signer.ts** : signature/vérification HMAC-SHA256 des cookies d'authentification
- **db.ts** : pool de connexions MySQL (singleton) + helper `withTransaction`

**Règle** : uniquement du code d'infrastructure (DB, crypto, HTTP wrappers). Pas de logique métier.
