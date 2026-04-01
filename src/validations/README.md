# validations/

Schémas de validation Zod pour les entrées utilisateur.

- **index.ts** : schémas pour l'authentification, les téléphones (CRUD), les ordinateurs (assign/unassign), le mobile, et les query params de l'annuaire ordinateurs

Utilisés par `validateRequest` et `validateQueryParams` dans `utils/request-helpers.ts`.

**Règle** : tout schéma Zod partagé doit être ici. Les constantes de validation (messages, limites) restent dans `constants/`.
