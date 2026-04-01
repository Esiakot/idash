# services/

Services métier avec effets de bord (logging, appels externes, etc.).

- **audit-logger.ts** : journalisation des événements de sécurité (auth succès/échec, rate-limit, CRUD téléphones, assignation ordinateurs, modification mobile)

**Règle** : les services encapsulent de la logique métier avec side-effects. Les fonctions pures vont dans `utils/`.
