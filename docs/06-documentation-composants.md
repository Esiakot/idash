# 06 — Documentation technique — Composants et hooks

## 6.1 Arborescence des composants

```
src/components/
├── auth/
│   └── LoginModal.tsx           # Modal d'authentification
├── common/
│   ├── Header.tsx               # Barre de navigation principale
│   ├── HubGrid.tsx              # Grille de la page d'accueil
│   ├── SortableHeader.tsx       # En-tête de colonne triable
│   └── UnauthorizedClient.tsx   # Page accès refusé
└── si/
    ├── annuaire/
    │   ├── AnnuaireTable.tsx     # Tableau principal de l'annuaire
    │   ├── AssignPcModal.tsx     # Modal d'affectation de PC
    │   ├── ExportPdfButton.tsx   # Export PDF de l'annuaire
    │   ├── FiltersSidebar.tsx    # Barre latérale de filtres
    │   ├── MobileEditorModal.tsx # Modal d'édition du mobile
    │   ├── PhonesEditorModal.tsx # Modal d'édition des téléphones
    │   ├── Toolbar.tsx           # Barre d'outils (recherche, compteur)
    │   ├── UserComputers.tsx     # Cellule ordinateurs d'un utilisateur
    │   └── UserPhones.tsx        # Cellule téléphones d'un utilisateur
    └── ordinateurs/
        ├── OrdinateurFiltersSidebar.tsx  # Filtres du parc informatique
        └── OrdinateursTable.tsx          # Tableau des ordinateurs
```

## 6.2 Composants communs

### Header

| Propriété | Description |
|-----------|-------------|
| **Fichier** | `src/components/common/Header.tsx` |
| **Type** | Client Component (`"use client"`) |
| **Props** | Aucune |
| **Rôle** | Barre de navigation principale en haut de chaque page |

**Fonctionnalités :**
- Affiche le logo Symétrie avec lien vers l'accueil
- Navigation : lien Accueil
- Zone authentification : bouton Connexion / nom d'utilisateur + bouton Déconnexion
- Vérifie la session au montage (`GET /api/session`)
- Écoute l'événement personnalisé `OPEN_LOGIN_MODAL` pour ouvrir la modal
- Gère le redirect post-connexion

**Extrait du code source :**

```tsx
// Vérification de la session au montage du composant
useEffect(() => {
  fetch("/api/session")
    .then((r) => r.json())
    .then((data) => {
      if (data.authenticated) {
        setUser(data.username);
        setGroups(data.groups);
      }
    });
}, []);
```

---

### HubGrid

| Propriété | Description |
|-----------|-------------|
| **Fichier** | `src/components/common/HubGrid.tsx` |
| **Props** | `title: string`, `subtitle: string` |
| **Rôle** | Page d'accueil avec cartes de navigation |

**Cartes affichées :**
- 📇 **Annuaire** → `/annuaire` — Utilisateurs, groupes, téléphones, postes affectés
- 💻 **Ordinateurs** → `/ordinateurs` — Parc informatique, affectations, statistiques

---

### SortableHeader

| Propriété | Description |
|-----------|-------------|
| **Fichier** | `src/components/common/SortableHeader.tsx` |
| **Props** | `label`, `column`, `sortColumn`, `sortDirection`, `onClick`, `className?`, `onMouseEnter?`, `onMouseLeave?` |
| **Rôle** | En-tête `<th>` cliquable avec indicateur de tri |

**Comportement tri-état :**
1. Aucun tri → clic → Ascendant (🔼)
2. Ascendant → clic → Descendant (🔽)
3. Descendant → clic → Aucun tri

---

### LoginModal

| Propriété | Description |
|-----------|-------------|
| **Fichier** | `src/components/auth/LoginModal.tsx` |
| **Props** | `onClose: () => void`, `onSuccess: (username, groups) => void` |
| **Rôle** | Modal d'authentification par identifiant / mot de passe |

**Fonctionnalités :**
- Rendu via React Portal (en dehors du DOM parent)
- Backdrop avec effet blur
- Champs : identifiant + mot de passe
- Affichage des erreurs (identifiants invalides, rate limit)
- Appel `POST /api/auth` au submit
- Callback `onSuccess` avec username et groupes

**Extrait du code source :**

```tsx
// src/components/auth/LoginModal.tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  const res = await fetch("/api/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();
  if (!res.ok) {
    setError(data.error || "Erreur de connexion");
    setLoading(false);
    return;
  }

  onSuccess(data.username, data.groupes);
  onClose();
};
```

---

## 6.3 Composants Annuaire

### AnnuaireTable

| Propriété | Description |
|-----------|-------------|
| **Fichier** | `src/components/si/annuaire/AnnuaireTable.tsx` |
| **Props** | `users`, `allGroups`, `filterGroups`, `sortColumn`, `sortDirection`, `handleHeaderClick`, `hoveredGroup`, `setHoveredGroup`, `computersByUserId`, `phonesByUserId`, `isServiceInfo`, callbacks modaux |
| **Rôle** | Tableau principal de l'annuaire des utilisateurs |

**Colonnes :**

| Colonne | Triable | Contenu |
|---------|:-------:|---------|
| Trigramme | ✅ | Code 3 lettres |
| Prénom | ✅ | Prénom de l'utilisateur |
| Nom | ✅ | Nom de famille |
| Login AD | ✅ | `samaccountname` |
| Mobiles | ❌ | Numéro + bouton édition (ServiceInfo) |
| Téléphones | ❌ | Postes + lignes + bouton édition |
| Ordinateurs | ❌ | Noms des PC + tooltip + boutons |
| Glo_* (×8) | ✅ | Checkmarks ✔ par groupe |

**Comportements spécifiques :**
- Badge activité : vert (Actif) / rouge (Inactif)
- Colonnes de groupes masquées dynamiquement selon `filterGroups`
- Boutons d'édition visibles uniquement pour `Glo_ServiceInfo`

---

### FiltersSidebar

| Propriété | Description |
|-----------|-------------|
| **Fichier** | `src/components/si/annuaire/FiltersSidebar.tsx` |
| **Rôle** | Barre latérale de filtres de l'annuaire |

**Sections de filtres :**

| Section | Options | Comportement |
|---------|---------|-------------|
| **Activité** | Actif, Inactif | Checkbox (multi-sélection) |
| **Type** | Utilisateur, Autre, Stagiaire | Checkbox |
| **Affichage** | Épingler les leaders | Toggle (trigrammes OLA, TRO, GDI en haut) |
| **Groupes** | 8 groupes AD | Checkbox par catégorie |

Tous les filtres sont **persistés en `localStorage`** via les hooks `useLocalStorage*`.

---

### Toolbar

| Propriété | Description |
|-----------|-------------|
| **Fichier** | `src/components/si/annuaire/Toolbar.tsx` |
| **Props** | `count`, `query`, `setQuery`, `hoveredGroup`, `right` (slot) |
| **Rôle** | Barre d'outils avec recherche et compteur |

**Fonctionnalités :**
- Compteur d'utilisateurs filtrés
- Champ de recherche plein texte avec bouton clear
- Affichage du groupe survolé dans le tableau
- Slot à droite pour le bouton d'export PDF

---

### ExportPdfButton

| Propriété | Description |
|-----------|-------------|
| **Fichier** | `src/components/si/annuaire/ExportPdfButton.tsx` |
| **Props** | `users`, `phonesByUserId` |
| **Rôle** | Génère et télécharge un PDF de l'annuaire filtré |

**Format du PDF :**
- Orientation paysage (A4)
- Colonnes : Nom, Prénom, Trigramme, Poste, Ligne interne, Mobile
- En-tête bleu, lignes alternées (zébrées)
- Métadonnées : titre, date de génération
- Pagination automatique

**Bibliothèques :** jsPDF 3.0.3 + jsPDF-AutoTable 5.0.2

---

### AssignPcModal

| Propriété | Description |
|-----------|-------------|
| **Fichier** | `src/components/si/annuaire/AssignPcModal.tsx` |
| **Props** | `userId`, `userLabel`, `onClose`, `onAssigned` |
| **Rôle** | Modal d'affectation d'un PC à un utilisateur |

**Flux :**
1. Charge les PC libres (`GET /api/ordinateurs?free=true`)
2. L'utilisateur recherche et sélectionne un PC (radio)
3. Confirmation → `POST /api/ordinateurs` (affectation)
4. Callback `onAssigned` pour mise à jour de l'état parent

---

### PhonesEditorModal

| Propriété | Description |
|-----------|-------------|
| **Fichier** | `src/components/si/annuaire/PhonesEditorModal.tsx` |
| **Props** | `user`, `phones`, `onClose`, `onSaved` |
| **Rôle** | Éditeur CRUD complet des postes téléphoniques |

**Opérations :**
- **Créer** : formulaire poste (2 chiffres) + ligne interne → `POST /api/telephones`
- **Modifier** : édition inline → `PUT /api/telephones`
- **Supprimer** : bouton delete → `DELETE /api/telephones`

---

### MobileEditorModal

| Propriété | Description |
|-----------|-------------|
| **Fichier** | `src/components/si/annuaire/MobileEditorModal.tsx` |
| **Props** | `user`, `onClose`, `onSaved` |
| **Rôle** | Édition du numéro de mobile d'un utilisateur |

**Fonctionnalités :**
- Formatage automatique (10 chiffres → `06 12 34 56 78`)
- Accepte la valeur vide (suppression du numéro)
- Persiste via `PATCH /api/utilisateurs/[id]/mobile`

---

### UserComputers / UserPhones

| Composant | Rôle |
|-----------|------|
| `UserComputers` | Affiche les PC affectés en chips avec tooltip (OS, version, type) et bouton de désaffectation |
| `UserPhones` | Affiche les postes et lignes internes en chips avec bouton d'édition |

---

## 6.4 Composants Ordinateurs

### OrdinateursTable

| Propriété | Description |
|-----------|-------------|
| **Fichier** | `src/components/si/ordinateurs/OrdinateursTable.tsx` |
| **Props** | `computers`, `sortBy`, `sortDir`, `onSort` |
| **Rôle** | Tableau des ordinateurs du parc informatique |

**Colonnes :**

| Colonne | Triable | Contenu |
|---------|:-------:|---------|
| Nom | ✅ | Nom du poste (PC-DIR-001) |
| Type | ✅ | Station / Serveur / Portable / Autre |
| Système | ✅ | OS + version |
| Utilisateur | ✅ | Nom de l'utilisateur affecté ou « Non affecté » |

---

### OrdinateurFiltersSidebar

| Propriété | Description |
|-----------|-------------|
| **Fichier** | `src/components/si/ordinateurs/OrdinateurFiltersSidebar.tsx` |
| **Props** | Filtres sélectionnés, setters, facets |
| **Rôle** | Filtres et statistiques du parc informatique |

**Sections :**
- **Type** : Radio (Station, Serveur, Portable, Autre)
- **Statut** : Radio (Tous, Affecté, Non affecté)
- **Système** : Radio (Windows 11, Ubuntu, macOS..., Non spécifié)
- **Statistiques** : Total, affectés (%), non affectés (%), par type

---

## 6.5 Hooks personnalisés

### useAnnuaire (hook principal de l'annuaire)

Le hook `useAnnuaire` est composé de 3 sous-hooks combinés dans la page annuaire :

```
useAnnuaire
├── useAnnuaireData()      → Chargement des données (users, PCs, phones)
├── useAnnuaireFilters()   → Filtrage, tri, recherche
└── useAnnuaireActions()   → Gestion des modaux et actions CRUD
```

#### useAnnuaireData

| Retour | Type | Description |
|--------|------|-------------|
| `users` | `Utilisateur[]` | Liste des utilisateurs |
| `loading` | `boolean` | État de chargement |
| `error` | `string \| null` | Message d'erreur |
| `computersByUserId` | `Record<number, Ordinateur[]>` | Ordinateurs groupés par utilisateur |
| `phonesByUserId` | `Record<number, Telephone[]>` | Téléphones groupés par utilisateur |
| `isServiceInfo` | `boolean` | L'utilisateur courant a le groupe ServiceInfo |

**Comportement :** Charge en parallèle (`Promise.all`) les 3 API + session au montage.

**Extrait du code source :**

```typescript
// src/hooks/useAnnuaire.ts
useEffect(() => {
  Promise.all([
    fetch("/api/annuaire").then((r) => r.json()),
    fetch("/api/ordinateurs").then((r) => r.json()),
    fetch("/api/telephones").then((r) => r.json()),
  ])
    .then(([usersData, pcsData, telsData]) => {
      setUsers(usersData);

      // Regroupement des PC par utilisateur_id
      const pcMap: ComputersByUserId = {};
      for (const pc of pcsData) {
        if (!pc.utilisateur_id) continue;
        if (!pcMap[pc.utilisateur_id]) pcMap[pc.utilisateur_id] = [];
        pcMap[pc.utilisateur_id].push(pc);
      }
      setComputersByUserId(pcMap);
      // Même logique pour les téléphones...
    })
    .catch((err) => setError(err.message))
    .finally(() => setLoading(false));
}, []);
```

#### useAnnuaireFilters

| Retour | Type | Description |
|--------|------|-------------|
| `filteredUsers` | `Utilisateur[]` | Utilisateurs après application de tous les filtres |
| `filterActif` / `filterInactif` | `boolean` | Filtres d'activité |
| `filterType*` | `boolean` | Filtres par type |
| `filterGroups` | `Record<string, boolean>` | Filtres par groupe AD |
| `pinLeaders` | `boolean` | Épingler les leaders en haut |
| `sortColumn` / `sortDirection` | `string \| null` | Colonne et direction de tri |
| `query` | `string` | Texte de recherche |

**Recherche plein texte :** Insensible aux accents (normalisation NFD), cherche dans trigramme, noms, login AD, mobile, ordinateurs, téléphones, groupes.

**Extrait du code source :**

```typescript
// Normalisation pour recherche insensible aux accents
const normalize = (s: string) =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

// Filtrage : recherche dans tous les champs pertinents
const matchesQuery = (user: Utilisateur) => {
  const q = normalize(query);
  return (
    normalize(user.trigramme).includes(q) ||
    normalize(user.nom).includes(q) ||
    normalize(user.prenom).includes(q) ||
    normalize(user.samaccountname).includes(q)
  );
};
```

**Persistance :** Tous les états sont sauvegardés en `localStorage` via `useLocalStorage*`.

#### useAnnuaireActions

| Retour | Description |
|--------|-------------|
| `openAssignFor(user)` | Ouvre la modal d'affectation PC |
| `unassignPc(pcId, userId)` | Désaffecte un PC (`DELETE /api/ordinateurs`) |
| `openPhonesEditor(user)` | Ouvre l'éditeur de téléphones |
| `openMobileEditor(user)` | Ouvre l'éditeur de mobile |
| `onAssigned(pc)` | Callback post-affectation |
| `onPhonesSaved(phones)` | Callback post-sauvegarde téléphones |
| `onMobileSaved(mobile)` | Callback post-sauvegarde mobile |

---

### useOrdinateursData

| Retour | Type | Description |
|--------|------|-------------|
| `computers` | `OrdinateurWithUser[]` | Ordinateurs filtrés |
| `facets` | `OrdinateurFacets` | Statistiques et listes de facettes |
| `loading` / `error` | `boolean` / `string` | États de chargement |
| `selectedType` / `selectedStatus` / `selectedOS` | `string` | Filtres actifs |
| `sortBy` / `sortDir` | `string` | Tri actif |
| `countLabel` | `string` | Label de compteur formaté |
| `resetFilters()` | `() => void` | Réinitialise tous les filtres |

---

### useLocalStorage*

Famille de hooks pour la persistance d'état dans `localStorage` :

| Hook | Type stocké | Utilisation |
|------|-------------|-------------|
| `useLocalStorageBool(key, default)` | `boolean` | Filtres checkbox |
| `useLocalStorageString(key, default)` | `string` | Recherche, filtres radio |
| `useLocalStorageJson(key, default)` | `T` (JSON) | Objets complexes (filterGroups) |
| `useLocalStorageSort(key, default)` | `[col, dir]` | État de tri |

---

## 6.6 Services et utilitaires

### Audit Logger (`src/services/audit-logger.ts`)

Service singleton de journalisation des actions sensibles. Méthodes :

| Méthode | Paramètres | Action journalisée |
|---------|-----------|-------------------|
| `logAuthSuccess()` | username, ip, groups | Connexion réussie |
| `logAuthFailed()` | username, ip, reason | Échec de connexion |
| `logRateLimited()` | ip, endpoint | Limitation de débit |
| `logTelephoneCreate/Update/Delete()` | username, ip, id, details | CRUD téléphones |
| `logComputerAssign/Unassign()` | username, ip, computerId | Affectation PC |
| `logMobileUpdate()` | username, ip, userId, mobile | Modification mobile |
| `logUnauthorizedAccess()` | username, ip, endpoint | Accès refusé |

### Utilitaires (`src/utils/`)

| Fichier | Fonctions | Description |
|---------|-----------|-------------|
| `formatters.ts` | `flagOn()`, `truncateText()`, `prettifyGroupKey()`, `formatPhone()` | Formatage des données UI |
| `request-helpers.ts` | `parseRouteId()`, `validateRequest()`, `validateQueryParams()` | Validation des requêtes API |
| `pdf-helpers.ts` | `normFixeFromObj()`, `resolveTelephonesList()`, `stringifyPostes()`, `stringifyFixes()` | Helpers pour l'export PDF |
