# 01 — Présentation du projet et contexte

## 1.1 Contexte organisationnel

L'organisation **Symétrie** disposait d'un système de gestion du parc informatique morcelé et peu efficace. Les données étaient réparties entre plusieurs sources hétérogènes :

- **Une base de données interne**, alimentée par un script PowerShell interrogeant l'Active Directory.
- **Un fichier Excel indépendant** recensant les postes informatiques.

Ce fonctionnement décentralisé, associé à l'absence de panneau d'administration visuel, limitait fortement l'efficacité de la gestion des données et leur maintenance au quotidien.

## 1.2 Expression des besoins

Pour répondre à ces problématiques, l'organisation a défini plusieurs objectifs majeurs :

| N° | Besoin | Description |
|----|--------|-------------|
| 1 | **Interface back-office** | Concevoir un panneau d'administration s'interfaçant directement avec la base de données existante |
| 2 | **Annuaire interactif** | Module de consultation avec filtrage avancé et exportation PDF |
| 3 | **Gestion du parc informatique** | Interface dédiée au suivi des ordinateurs (disponibles / affectés) |
| 4 | **Évolution du schéma de données** | Intégration d'une entité « Téléphones » associant postes et lignes internes |
| 5 | **Sécurisation de l'application** | Système d'authentification robuste avec accès administrateur restreint |

## 1.3 Périmètre du projet

### Fonctionnalités développées

```
iDash (SI Dashboard)
├── Authentification
│   ├── Connexion par identifiant / mot de passe (bcrypt)
│   ├── Gestion de session par cookies signés (HMAC-SHA256)
│   └── Contrôle d'accès basé sur les groupes (RBAC)
│
├── Annuaire des utilisateurs
│   ├── Tableau interactif avec tri et recherche plein texte
│   ├── Filtres par activité, type d'utilisateur, groupes
│   ├── Gestion des numéros mobiles
│   ├── Gestion des postes téléphoniques
│   ├── Affectation / dés-affectation d'ordinateurs
│   └── Export PDF de l'annuaire filtré
│
├── Parc informatique
│   ├── Tableau des ordinateurs avec filtres (type, OS, statut)
│   ├── Statistiques facettées (total, affectés, par type)
│   └── Tri multi-colonnes
│
└── Administration
    ├── Journalisation des actions (audit)
    ├── Rate limiting sur l'authentification
    └── Vérification de santé du système (health check)
```

### Acteurs du système

| Acteur | Rôle | Droits |
|--------|------|--------|
| **Visiteur non authentifié** | N'a accès à aucune donnée | Peut se connecter uniquement |
| **Utilisateur authentifié** | Consultation de l'annuaire et du parc | Lecture seule |
| **Service Informatique** (`Glo_ServiceInfo`) | Administration complète | CRUD téléphones, affectation PC, édition mobiles |
| **Direction** (`Glo_Direction`) | Consultation avancée | Accès étendu à l'annuaire |

## 1.4 Planning prévisionnel

| Phase | Activités | Livrables |
|-------|-----------|-----------|
| **Analyse** | Étude de l'existant, recueil des besoins, modélisation | Cahier des charges, MCD/MLD |
| **Conception** | Architecture technique, maquettes, choix technologiques | Dossier de conception |
| **Développement** | Implémentation back-end (API), front-end (React), BDD | Code source, scripts SQL |
| **Sécurisation** | Authentification, autorisation, audit, hardening | Documentation sécurité |
| **Tests** | Tests fonctionnels, jeux d'essai, validation | Cahier de tests |
| **Déploiement** | Conteneurisation Docker, mise en production | Docker Compose, documentation |

## 1.5 Environnement de développement

| Élément | Technologie | Version |
|---------|-------------|---------|
| **Langage** | TypeScript | 5.x |
| **Framework front-end** | React | 19.2.3 |
| **Framework full-stack** | Next.js (App Router) | 16.1.1 |
| **Base de données** | MySQL | 8.0 |
| **Conteneurisation** | Docker / Docker Compose | - |
| **Validation** | Zod | 4.3.5 |
| **Export PDF** | jsPDF + jsPDF-AutoTable | 3.0.3 / 5.0.2 |
| **Hachage** | bcryptjs | 3.0.3 |
| **Linting** | ESLint (Next.js + TypeScript) | 9.x |
| **IDE** | Visual Studio Code | - |
