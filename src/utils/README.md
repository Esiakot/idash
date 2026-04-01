# utils/

Fonctions utilitaires pures et stateless.

- **formatters.ts** : normalisation de flags DB, troncature de texte, labels de groupes AD, formatage de numéros de téléphone
- **pdf-helpers.ts** : résolution et formatage des données téléphones pour l'export PDF
- **request-helpers.ts** : parsing d'ID de route, validation de body/query params avec Zod

**Règle** : uniquement des fonctions pures (pas d'état, pas de side-effects). Le code d'infrastructure va dans `libs/`.
