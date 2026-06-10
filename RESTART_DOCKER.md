# Relancer Docker (purge complète + rebuild)

Une seule commande pour tout arrêter, purger (conteneurs, volumes, images orphelines, cache de build) puis relancer le projet à neuf.

## Commande unique

```bash
docker compose down -v --remove-orphans --rmi local && docker builder prune -af && docker compose build --no-cache && docker compose up -d
```

### Détail de chaque étape

| Étape | Action |
|-------|--------|
| `docker compose down -v --remove-orphans --rmi local` | Stoppe et supprime les conteneurs, les volumes (dont `mysql_data`) et les images locales du projet |
| `docker builder prune -af` | Vide tout le cache de build Docker |
| `docker compose build --no-cache` | Reconstruit les images depuis zéro |
| `docker compose up -d` | Relance la stack en arrière-plan |

## Variante encore plus agressive (purge système)

> ⚠️ Supprime **toutes** les ressources Docker inutilisées sur la machine, pas uniquement celles du projet.

```bash
docker compose down -v --remove-orphans --rmi all && docker system prune -af --volumes && docker compose build --no-cache && docker compose up -d
```

## Suivre les logs après redémarrage

```bash
docker compose logs -f
```

## Vérifier l'état

```bash
docker compose ps
```
