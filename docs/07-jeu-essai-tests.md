# 07 — Jeu d'essai et tests

## 7.1 Données de test

### Comptes de démonstration

| Compte | Login | Mot de passe | Groupes | Rôle |
|--------|-------|-------------|---------|------|
| **DemoLecture** | `DemoLecture` | `demo` | `Glo_Symetrie` | Lecture seule — Peut consulter l'annuaire et les ordinateurs |
| **DemoAdmin** | `DemoAdmin` | `demo` | `Glo_ServiceInfo`, `Glo_Direction`, `Glo_Symetrie` | Administrateur — Peut modifier téléphones, mobiles, affectations |

### Jeu de données initial (`scripts/init.sql`)

| Table | Nombre d'enregistrements | Description |
|-------|:------------------------:|-------------|
| `utilisateurs` | 55 | Répartis entre Direction (3), Service Info (3), Commercial (10), Comptabilité (4), Production (15), RH (3), Stagiaires (5), comptes de service (2), démo (2), divers |
| `ordinateurs` | 70+ | Stations, portables, serveurs avec Windows 11, Windows 10, Ubuntu, macOS, CentOS |
| `telephones` | 20+ | Postes téléphoniques + salles de conférence (non affectés) |

### Répartition des utilisateurs par groupe

| Groupe | Membres | Exemples |
|--------|:-------:|---------|
| `Glo_Direction` | 3 | OLA, TRO, GDI |
| `Glo_ServiceInfo` | 3 | OLA, TRO, DemoAdmin |
| `Glo_Commercial` | 10 | ADU, LBO, CLG... |
| `Glo_Comptabilite` | 4 | SVA, MBE, PRO, LDA |
| `Glo_Production` | 15 | JMA, PGA, RLE... |
| `Glo_RH` | 3 | ABC, DEF, GHI |
| `Glo_Stagiaire` | 5 | STA, STB, STC, STD, STE |
| `Glo_Symetrie` | ~50 | Tous les employés actifs |

### Types d'ordinateurs disponibles

| Type | Exemples | OS |
|------|---------|-----|
| Station | PC-DIR-001, PC-COM-001 | Windows 11 23H2, Windows 10 22H2 |
| Portable | LAP-IT-001, LAP-COM-001 | Windows 11 24H2, macOS Sonoma 14.2 |
| Serveur | SRV-DC-001, SRV-FILE-001 | Ubuntu 24.04 LTS, CentOS Stream 9 |
| Autre | — | — |

---

## 7.2 Scénarios de test fonctionnels

### SC-01 : Authentification réussie

| Étape | Action | Résultat attendu |
|:-----:|--------|-----------------|
| 1 | Accéder à l'application (http://localhost:3000) | Page d'accueil affichée avec bouton "Se connecter" |
| 2 | Cliquer sur "Se connecter" | Modal de connexion affichée |
| 3 | Saisir `DemoAdmin` / `demo` | Champs remplis |
| 4 | Cliquer "Connexion" | Modal fermée, "DemoAdmin" affiché dans le header |
| 5 | Vérifier les cookies (DevTools → Application) | `auth_token` et `auth_groups` présents, HttpOnly |

---

### SC-02 : Authentification échouée

| Étape | Action | Résultat attendu |
|:-----:|--------|-----------------|
| 1 | Ouvrir la modal de connexion | Modal affichée |
| 2 | Saisir `DemoAdmin` / `mauvais_mdp` | Champs remplis |
| 3 | Cliquer "Connexion" | Message d'erreur "Identifiants invalides" |
| 4 | Répéter 5 fois | Messages d'erreur successifs |
| 5 | 6ème tentative | Message "Trop de tentatives, réessayez dans X minutes" (HTTP 429) |

---

### SC-03 : Rate limiting

| Étape | Action | Résultat attendu |
|:-----:|--------|-----------------|
| 1 | Tenter 5 connexions invalides depuis la même IP | 5 réponses 401 |
| 2 | 6ème tentative (même invalide) | Réponse 429 avec `retryAfter` en secondes |
| 3 | Attendre 15 minutes ou se connecter avec succès | Compteur réinitialisé |

---

### SC-04 : Consultation de l'annuaire

| Étape | Action | Résultat attendu |
|:-----:|--------|-----------------|
| 1 | Se connecter avec `DemoLecture` / `demo` | Authentifié |
| 2 | Naviguer vers `/annuaire` | Tableau des utilisateurs chargé (~55 lignes) |
| 3 | Vérifier les colonnes | Trigramme, Prénom, Nom, Login AD, Mobiles, Téléphones, Ordinateurs, 8 colonnes groupes |
| 4 | Cliquer sur l'en-tête "Nom" | Tri ascendant (🔼), puis descendant (🔽), puis aucun |
| 5 | Saisir "OLA" dans la recherche | Seul l'utilisateur OLA affiché |
| 6 | Cocher "Inactif" dans les filtres | Seuls les utilisateurs inactifs affichés |

---

### SC-05 : Recherche plein texte (insensible aux accents)

| Étape | Action | Résultat attendu |
|:-----:|--------|-----------------|
| 1 | Se connecter et accéder à l'annuaire | Tableau chargé |
| 2 | Saisir "comptabilite" (sans accent) | Utilisateurs du groupe Comptabilité affichés |
| 3 | Saisir "Windows" | Utilisateurs ayant un PC Windows affichés |
| 4 | Saisir un numéro de poste (ex : "10") | Utilisateurs avec ce poste téléphonique affichés |
| 5 | Effacer la recherche | Tous les utilisateurs réaffichés |

---

### SC-06 : Affectation d'un ordinateur (ServiceInfo uniquement)

| Étape | Action | Résultat attendu |
|:-----:|--------|-----------------|
| 1 | Se connecter avec `DemoAdmin` | Authentifié avec Glo_ServiceInfo |
| 2 | Aller dans l'annuaire | Tableau affiché avec boutons d'action visibles |
| 3 | Cliquer "+" sur un utilisateur sans PC | Modal AssignPc ouverte |
| 4 | Rechercher un PC disponible | Liste des PC libres (Station/Portable) affichée |
| 5 | Sélectionner un PC et valider | PC affecté, chips mises à jour dans le tableau |

---

### SC-07 : Désaffectation d'un ordinateur

| Étape | Action | Résultat attendu |
|:-----:|--------|-----------------|
| 1 | Se connecter avec `DemoAdmin` | Authentifié |
| 2 | Trouver un utilisateur avec un PC affecté | Chips de PC visibles |
| 3 | Cliquer le bouton "×" sur le chip du PC | Confirmation et désaffectation |
| 4 | Vérifier | PC retiré de la liste de l'utilisateur |

---

### SC-08 : Gestion des téléphones (CRUD)

| Étape | Action | Résultat attendu |
|:-----:|--------|-----------------|
| 1 | Se connecter avec `DemoAdmin` | Authentifié |
| 2 | Cliquer sur l'icône téléphone d'un utilisateur | Modal PhonesEditor ouverte |
| 3 | **Créer** : saisir poste "25" + ligne "04 66 99 88 77" | Téléphone créé, affiché dans la liste |
| 4 | **Modifier** : changer la ligne en "04 66 11 22 33" | Téléphone mis à jour |
| 5 | **Supprimer** : cliquer le bouton supprimer | Téléphone supprimé de la liste |
| 6 | Fermer la modal | Tableau mis à jour |

---

### SC-09 : Modification du mobile

| Étape | Action | Résultat attendu |
|:-----:|--------|-----------------|
| 1 | Se connecter avec `DemoAdmin` | Authentifié |
| 2 | Cliquer sur le chip mobile d'un utilisateur | Modal MobileEditor ouverte |
| 3 | Saisir "0612345678" | Formaté automatiquement en "06 12 34 56 78" |
| 4 | Valider | Mobile mis à jour dans le tableau |
| 5 | Rouvrir et effacer le champ | Mobile supprimé |

---

### SC-10 : Export PDF de l'annuaire

| Étape | Action | Résultat attendu |
|:-----:|--------|-----------------|
| 1 | Se connecter et accéder à l'annuaire | Tableau affiché |
| 2 | Appliquer des filtres (ex : Actif uniquement) | Tableau filtré |
| 3 | Cliquer le bouton "Export PDF" | Fichier PDF téléchargé |
| 4 | Ouvrir le PDF | Tableau avec colonnes Nom, Prénom, Trig., Poste, Ligne, Mobile |
| 5 | Vérifier | Seuls les utilisateurs filtrés sont présents |

---

### SC-11 : Consultation du parc informatique

| Étape | Action | Résultat attendu |
|:-----:|--------|-----------------|
| 1 | Se connecter et naviguer vers `/ordinateurs` | Tableau et statistiques affichés |
| 2 | Vérifier les statistiques | Total, affectés (%), non affectés (%), par type |
| 3 | Filtrer par type "Serveur" | Seuls les serveurs affichés |
| 4 | Filtrer par statut "Non affecté" | Seuls les PC libres affichés |
| 5 | Filtrer par OS "Ubuntu" | Seules les machines Ubuntu affichées |
| 6 | Cliquer "Réinitialiser" | Tous les filtres remis à zéro |

---

### SC-12 : Contrôle d'accès — Utilisateur lecture seule

| Étape | Action | Résultat attendu |
|:-----:|--------|-----------------|
| 1 | Se connecter avec `DemoLecture` / `demo` | Authentifié (Glo_Symetrie uniquement) |
| 2 | Accéder à l'annuaire | Tableau affiché en lecture seule |
| 3 | Vérifier l'absence de boutons d'édition | Pas de "+" pour PC, pas d'icône édition mobile/téléphone |
| 4 | Tenter `POST /api/ordinateurs` via DevTools | HTTP 403 Forbidden |
| 5 | Tenter `POST /api/telephones` via DevTools | HTTP 403 Forbidden |

---

### SC-13 : Accès non authentifié

| Étape | Action | Résultat attendu |
|:-----:|--------|-----------------|
| 1 | Supprimer les cookies (DevTools) | Session nettoyée |
| 2 | Accéder à `/api/annuaire` directement | HTTP 401 Unauthorized |
| 3 | Accéder à `/annuaire` | Page affichée mais données non chargées |
| 4 | Accéder à `/api/health` | HTTP 200 (endpoint public) |

---

### SC-14 : Health check

| Étape | Action | Résultat attendu |
|:-----:|--------|-----------------|
| 1 | `GET /api/health` (sans auth) | `{ "status": "healthy", "checks": { "database": "ok", "environment": "ok" } }` |
| 2 | Arrêter le conteneur MySQL | `{ "status": "unhealthy", "checks": { "database": "error" } }` |

---

### SC-15 : Persistance des filtres (localStorage)

| Étape | Action | Résultat attendu |
|:-----:|--------|-----------------|
| 1 | Se connecter et accéder à l'annuaire | Tableau affiché |
| 2 | Cocher le filtre "Actif" + rechercher "production" | Filtres appliqués |
| 3 | Recharger la page (F5) | Filtres et recherche restaurés automatiquement |
| 4 | Naviguer vers /ordinateurs puis revenir | Filtres toujours présents |

---

## 7.3 Tests de sécurité

### TS-01 : Injection SQL

| Test | Entrée | Résultat attendu |
|------|--------|-----------------|
| Login avec injection | `' OR 1=1 --` | Identifiants invalides (requête paramétrée) |
| Recherche avec injection | `'; DROP TABLE utilisateurs; --` | Recherche côté client, pas de requête SQL |

### TS-02 : Manipulation de cookies

| Test | Action | Résultat attendu |
|------|--------|-----------------|
| Modifier la valeur du cookie | Changer `auth_token` dans DevTools | Session invalidée (signature HMAC incorrecte) |
| Copier un cookie d'un autre utilisateur | Remplacer le cookie | Rejeté (signature liée au contenu) |

### TS-03 : Validation des entrées

| Test | Entrée | Résultat attendu |
|------|--------|-----------------|
| Poste avec 3 chiffres | `"123"` | Erreur Zod : "String must contain exactly 2 character(s)" |
| Poste avec lettres | `"AB"` | Erreur Zod : regex /^[0-9]+$/ |
| Mobile invalide | `"abc"` | Erreur Zod : format invalide |
| ordinateur_id négatif | `-1` | Erreur Zod : "Number must be greater than 0" |

### TS-04 : Affectation concurrente

| Test | Action | Résultat attendu |
|------|--------|-----------------|
| 2 admins affectent le même PC | POST simultanés avec même `ordinateur_id` | Un seul réussit (201), l'autre échoue (409 Conflict) grâce au `FOR UPDATE` |
