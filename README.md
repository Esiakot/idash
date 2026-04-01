# SI Dashboard

Tableau de bord Service Informatique — gestion du parc informatique et annuaire utilisateurs.

## Prérequis

- **Node.js** 18+
- **Docker** et **Docker Compose**

## 1 — Développement local (MySQL Docker + npm run dev)

Seule la base de données tourne dans Docker, l'app Next.js tourne en local.

```bash
# Installer les dépendances
npm install

# Démarrer le conteneur MySQL
sudo docker compose up -d db

# Attendre ~20 secondes que MySQL soit healthy, puis :
npm run dev
```

L'application est accessible sur **http://localhost:3000**.

### Connexion mode démo

| Champ        | Valeur |
|--------------|--------|
| Utilisateur  | `demo` |
| Mot de passe | `demo` |

### Commandes utiles

```bash
npm run dev                     # Lancer le serveur de dev
npm run build && npm start      # Build + serveur de prod
npm run lint                    # Linter

sudo docker compose ps          # État du conteneur MySQL
sudo docker compose logs -f db  # Logs MySQL
sudo docker compose stop db     # Arrêter MySQL
sudo docker compose start db    # Redémarrer MySQL
sudo docker compose down -v     # Supprimer le conteneur + les données
```

### Réinitialiser la base de données

```bash
sudo docker compose down -v
sudo docker compose up -d db
```

---

## 2 — Tout en Docker (MySQL + App)

L'application et la base de données tournent toutes les deux dans Docker.

Créer un fichier `.env` à la racine avec au minimum :

```env
COOKIE_SECRET=<une clé d'au moins 32 caractères>
```

Puis :

```bash
sudo docker compose up -d
```

L'application est accessible sur **http://localhost:8080**.

### Commandes utiles

```bash
sudo docker compose ps              # État des conteneurs
sudo docker compose logs -f         # Logs de tous les services
sudo docker compose stop            # Arrêter tout
sudo docker compose down            # Arrêter + supprimer les conteneurs
sudo docker compose down -v         # Arrêter + supprimer conteneurs et données
```
