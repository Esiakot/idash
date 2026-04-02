# 03 — Base de données

La base de données MySQL `sym_ad` centralise les données du système d'information : utilisateurs (importés depuis l'Active Directory), parc informatique et postes téléphoniques. Elle comporte 3 tables reliées par des clés étrangères avec une politique `ON DELETE SET NULL` pour libérer automatiquement les ressources lors de la suppression d'un utilisateur.

## 3.1 Modèle Conceptuel de Données (MCD)

```
┌─────────────────────┐          ┌─────────────────────┐
│    UTILISATEUR       │          │     ORDINATEUR       │
│─────────────────────│          │─────────────────────│
│ # id                 │          │ # id                 │
│ trigramme            │          │ nom                  │
│ prenom               │    1,n   │ systeme_exploitation │
│ nom                  │◄────────│ version              │
│ samaccountname       │  0,1    │ type                 │
│ mot_de_passe         │          └─────────────────────┘
│ mobile               │
│ type_utilisateur     │          ┌─────────────────────┐
│ activite             │          │     TELEPHONE        │
│ Glo_Stagiaire        │          │─────────────────────│
│ Glo_ServiceInfo      │    1,n   │ # id                 │
│ Glo_Commercial       │◄────────│ poste                │
│ Glo_Direction        │  0,1    │ lignes_internes      │
│ Glo_Symetrie         │          └─────────────────────┘
│ Glo_Comptabilite     │
│ Glo_Production       │
│ Glo_RH               │
└─────────────────────┘

Cardinalités :
  UTILISATEUR (1,n) ◄── (0,1) ORDINATEUR
    → Un utilisateur peut avoir 0 à N ordinateurs
    → Un ordinateur est affecté à 0 ou 1 utilisateur

  UTILISATEUR (1,n) ◄── (0,1) TELEPHONE
    → Un utilisateur peut avoir 0 à N téléphones
    → Un téléphone est affecté à 0 ou 1 utilisateur
```

## 3.2 Dictionnaire de données

### Table `utilisateurs`

| Attribut | Type | Taille | Contraintes | Description |
|----------|------|--------|-------------|-------------|
| `id` | INT | - | PK, AUTO_INCREMENT | Identifiant unique |
| `trigramme` | VARCHAR | 10 | NOT NULL, UNIQUE | Code à 3 lettres (ex : TPA, OLA) |
| `prenom` | VARCHAR | 100 | NOT NULL | Prénom de l'utilisateur |
| `nom` | VARCHAR | 100 | NOT NULL | Nom de famille |
| `samaccountname` | VARCHAR | 100 | NOT NULL, UNIQUE | Identifiant Active Directory |
| `mot_de_passe` | VARCHAR | 255 | NULL | Hash bcrypt du mot de passe |
| `mobile` | VARCHAR | 50 | NULL | Numéro de téléphone mobile |
| `type_utilisateur` | VARCHAR | 50 | DEFAULT 'Employé' | Type : Employé, Stagiaire, Autre |
| `activite` | ENUM | - | DEFAULT 'Actif' | Statut : Actif ou Inactif |
| `Glo_Stagiaire` | BIT | 1 | DEFAULT 0 | Appartenance au groupe Stagiaire |
| `Glo_ServiceInfo` | BIT | 1 | DEFAULT 0 | Appartenance au groupe Service Info |
| `Glo_Commercial` | BIT | 1 | DEFAULT 0 | Appartenance au groupe Commercial |
| `Glo_Direction` | BIT | 1 | DEFAULT 0 | Appartenance au groupe Direction |
| `Glo_Symetrie` | BIT | 1 | DEFAULT 0 | Appartenance au groupe Symétrie |
| `Glo_Comptabilite` | BIT | 1 | DEFAULT 0 | Appartenance au groupe Comptabilité |
| `Glo_Production` | BIT | 1 | DEFAULT 0 | Appartenance au groupe Production |
| `Glo_RH` | BIT | 1 | DEFAULT 0 | Appartenance au groupe RH |
| `created_at` | TIMESTAMP | - | DEFAULT CURRENT_TIMESTAMP | Date de création |
| `updated_at` | TIMESTAMP | - | ON UPDATE CURRENT_TIMESTAMP | Date de dernière modification |

### Table `ordinateurs`

| Attribut | Type | Taille | Contraintes | Description |
|----------|------|--------|-------------|-------------|
| `id` | INT | - | PK, AUTO_INCREMENT | Identifiant unique |
| `nom` | VARCHAR | 100 | NOT NULL, UNIQUE | Nom du poste (ex : PC-DIR-001) |
| `systeme_exploitation` | VARCHAR | 100 | NULL | OS installé (Windows 11, Ubuntu...) |
| `version` | VARCHAR | 50 | NULL | Version de l'OS (23H2, 24.04 LTS...) |
| `type` | ENUM | - | DEFAULT 'Station' | Type : Station, Serveur, Portable, Autre |
| `utilisateur_id` | INT | - | FK → utilisateurs(id), NULL | Utilisateur affecté (NULL = libre) |
| `created_at` | TIMESTAMP | - | DEFAULT CURRENT_TIMESTAMP | Date de création |
| `updated_at` | TIMESTAMP | - | ON UPDATE CURRENT_TIMESTAMP | Date de dernière modification |

### Table `telephones`

| Attribut | Type | Taille | Contraintes | Description |
|----------|------|--------|-------------|-------------|
| `id` | INT | - | PK, AUTO_INCREMENT | Identifiant unique |
| `poste` | VARCHAR | 20 | NOT NULL | Numéro de poste (2 chiffres, ex : 10) |
| `lignes_internes` | VARCHAR | 100 | NULL | Ligne interne (ex : 04 66 11 22 33) |
| `utilisateur_id` | INT | - | FK → utilisateurs(id), NULL | Utilisateur affecté |
| `created_at` | TIMESTAMP | - | DEFAULT CURRENT_TIMESTAMP | Date de création |
| `updated_at` | TIMESTAMP | - | ON UPDATE CURRENT_TIMESTAMP | Date de dernière modification |

**Index supplémentaires** (en plus des clés primaires et contraintes UNIQUE) :

| Table | Index | Colonnes | Justification |
|-------|-------|----------|---------------|
| `utilisateurs` | `idx_utilisateurs_activite` | `activite` | Filtrage rapide par statut |
| `ordinateurs` | `idx_ordinateurs_type` | `type` | Filtrage par type de machine |
| `ordinateurs` | `idx_ordinateurs_utilisateur` | `utilisateur_id` | Jointures utilisateur ↔ ordinateur |
| `telephones` | `idx_telephones_utilisateur` | `utilisateur_id` | Jointures utilisateur ↔ téléphone |

## 3.3 Règles de gestion métier

| N° | Règle | Implémentation |
|----|-------|----------------|
| RG1 | Un ordinateur ne peut être affecté qu'à un seul utilisateur | FK `utilisateur_id` (1:N) |
| RG2 | Seuls les ordinateurs de type Station ou Portable peuvent être affectés | Vérification dans l'API (POST /api/ordinateurs) |
| RG3 | Un ordinateur doit être libre pour pouvoir être affecté | Vérification `utilisateur_id IS NULL` + verrouillage `FOR UPDATE` |
| RG4 | Un poste téléphonique est composé de 2 chiffres | Validation Zod : `z.string().length(2).regex(/^[0-9]+$/)` |
| RG5 | Les mots de passe sont stockés sous forme de hash bcrypt | bcryptjs dans la route d'authentification |

## 3.4 Schéma SQL complet

Le script d'initialisation complet se trouve dans [`scripts/init.sql`](../scripts/init.sql). Il contient :

- Création de la base `sym_ad` (avec `IF NOT EXISTS`)
- Création des 3 tables avec contraintes
- Insertion de 55 utilisateurs de démonstration
- Insertion de 70+ ordinateurs
- Insertion de 20+ postes téléphoniques
- 2 comptes de démonstration :
  - `DemoLecture` / `demo` — Accès lecture seule
  - `DemoAdmin` / `demo` — Accès administrateur (ServiceInfo + Direction)
