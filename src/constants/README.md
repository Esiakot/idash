# constants/

Toutes les constantes partagées de l'application, centralisées dans `index.ts`.

Contient : groupes d'accès, routes API, messages d'erreur, codes HTTP, configuration cookies, types d'ordinateur, statuts d'activité, statuts d'affectation, labels d'affichage, codes erreur MySQL, paramètres rate-limiter, configuration DB, etc.

**Règle** : aucune valeur magique (string, nombre) ne doit être hardcodée ailleurs dans `src/`. Tout passe par ce dossier.
