# SI Dashboard - Tableau de bord Service Informatique

Application web de gestion du parc informatique et de l'annuaire des utilisateurs.

## 🚀 Démarrage rapide (Mode Démonstration)

### Prérequis
- **Node.js** 18+ 
- **Docker** et **Docker Compose**
- **npm** ou **yarn**

### Installation et lancement

#### 1. Installation des dépendances
```bash
npm install
```

#### 2. Démarrage avec Docker (recommandé pour la démo)

Lancez la base de données MySQL et l'application :
```bash
docker-compose up -d
```

Cela va :
- Créer un conteneur MySQL avec les données fictives
- Lancer l'application Next.js sur le port 8080

Accédez à : **http://localhost:8080**

#### 3. Démarrage en développement local

Pour développer localement (sans Docker pour l'app) :

```bash
# Démarrer seulement la base MySQL
docker-compose up -d db

# Attendre que MySQL soit prêt (environ 30 secondes)
# Puis lancer l'application Next.js
npm run dev
```

Accédez à : **http://localhost:3000**

### 🔐 Connexion en mode démo

Utilisez les identifiants suivants :
- **Utilisateur** : `demo`
- **Mot de passe** : `demo`

Le compte démo a les droits du groupe **Glo_ServiceInfo**, permettant de :
- ✅ Consulter l'annuaire des utilisateurs
- ✅ Voir les ordinateurs et téléphones
- ✅ Assigner/désassigner des PC aux utilisateurs
- ✅ Modifier les téléphones (poste, lignes internes)
- ✅ Modifier les numéros de mobile

## 📁 Structure du projet

```
src/
├── app/
│   ├── api/               # Routes API
│   │   ├── auth/          # Authentification
│   │   ├── si/            # API Service Informatique
│   │   │   ├── annuaire/  # Liste des utilisateurs
│   │   │   ├── ordinateurs/ # Gestion des PC
│   │   │   ├── telephones/  # Gestion des téléphones
│   │   │   └── utilisateurs/ # Mise à jour mobile
│   ├── si/                # Pages SI
│   │   ├── annuaire/      # Page annuaire
│   │   └── ordinateurs/   # Page parc informatique
├── components/            # Composants React
├── lib/                   # Utilitaires et helpers
└── styles/               # Fichiers CSS
```

## 🗄️ Base de données

En mode démo, la base MySQL contient :
- **19 utilisateurs** fictifs (direction, SI, commercial, etc.)
- **31 ordinateurs** (stations, portables, serveurs)
- **18 téléphones** assignés à des utilisateurs

### Réinitialiser les données
```bash
docker-compose down -v
docker-compose up -d
```

## ⚙️ Configuration

Le fichier `.env.local` contient la configuration :

```env
# Base de données
DB_HOST=localhost    # ou "db" dans Docker
DB_PORT=3306
DB_USER=si_user
DB_PASSWORD=si_password
DB_NAME=sym_ad
```

## 🛠️ Commandes utiles

```bash
# Développement
npm run dev

# Build production
npm run build
npm start

# Lint
npm run lint

# Docker
docker-compose up -d      # Démarrer
docker-compose down       # Arrêter
docker-compose logs -f    # Voir les logs
docker-compose down -v    # Arrêter et supprimer les données
```

## 📋 Fonctionnalités

### Annuaire
- Liste des utilisateurs avec filtres (actif/inactif, type, groupes)
- Recherche par nom, prénom, trigramme
- Tri par colonnes
- Export PDF
- Affichage des groupes AD (limité à 15 caractères)

### Gestion des ordinateurs
- Assignation de PC aux utilisateurs
- Désassignation
- Filtres par type (Station, Serveur, Portable)
- Filtres par statut (affecté/non affecté)

### Gestion des téléphones
- Modification du poste et des lignes internes
- Ajout/suppression de téléphones
- Modification du numéro mobile personnel

---

*Projet réalisé avec Next.js 16, React 19, MySQL 8 et Docker*
