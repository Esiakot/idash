# types/

Définitions TypeScript partagées (types, interfaces).

- **index.ts** : types métier (Utilisateur, Ordinateur, Telephone, sessions, audit, PDF) + types DB (`RowDataPacket` de mysql2)

**Règle** : tout type partagé entre plusieurs fichiers doit être ici. Les `Props` locaux de composants restent co-localisés.
