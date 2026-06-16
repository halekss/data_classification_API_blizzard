# Pipeline de collecte et visualisation de données via API REST

Projet Data end-to-end : collecte automatisée de données via une API REST authentifiée, traitement et structuration en CSV, puis restitution dans un dashboard web interactif mis à jour quotidiennement.

La source de données est l'API Battle.net de Blizzard. Les entités collectées sont des profils utilisateur avec attributs numériques et catégoriels (niveau, score d'équipement, classe, race, métiers). Le jeu vidéo n'est que le prétexte : ce qui est démontré ici s'applique à n'importe quelle API REST paginée avec authentification OAuth2.

## Stack technique

| Couche | Technologie |
|---|---|
| Collecte | Python, `requests`, OAuth2 client credentials |
| Traitement | `pandas` |
| Orchestration | GitHub Actions (prod) · Apache Airflow + Docker (option locale) |
| Stockage | CSV versionné sur GitHub |
| Visualisation | Dashboard HTML/CSS/JS vanilla, lecture CSV distante |
| Déploiement | GitHub Pages |

## Ce que le pipeline fait

**Collecte** — Le script `requetage_one.py` s'authentifie auprès de l'API via un flux OAuth2 client credentials, puis interroge les endpoints de profil pour plusieurs entités. Pour chaque entité, il extrait : un identifiant textuel, des attributs catégoriels (classe, race) et des attributs numériques (niveau, score d'équipement, deux métiers primaires). Les réponses sont normalisées et traduites en français.

**Traitement** — Les données brutes sont nettoyées, triées (par niveau décroissant puis par score d'équipement décroissant) et exportées en CSV encodé UTF-8.

**Automatisation** — Un workflow GitHub Actions déclenche le pipeline tous les jours à 23h47. Le CSV résultant est committé directement sur le dépôt via le token Actions.

**Visualisation** — Le dashboard HTML lit le CSV depuis l'URL raw GitHub via `fetch()`. Il recalcule à la volée les agrégats : moyennes par groupe, classements, distributions. Pas de backend, pas de base de données.

## Structure du projet

```
├── .github/
│   └── workflows/
│       └── main.yml          # Pipeline CI/CD — collecte et commit quotidiens
├── dags/
│   └── wow_export_dag.py     # DAG Airflow (orchestration locale alternative)
├── data/
│   └── mon_dataset_wow.csv   # Dataset généré automatiquement
├── scripts/
│   ├── config.py             # Paramètres, credentials via variables d'environnement
│   └── requetage_one.py      # Script de collecte et traitement
├── docker-compose.yaml       # Stack Airflow locale
└── index.html                # Dashboard web
```

## Orchestration

### GitHub Actions (solution retenue)

Le workflow `.github/workflows/main.yml` installe les dépendances, exécute le script de collecte, puis commit et pousse le CSV sur le dépôt. Le dashboard reflète toujours les données du dernier run.

Les credentials API sont gérés via les secrets GitHub (`ID_CLIENT`, `SECRET_CLIENT`) et injectés comme variables d'environnement au moment de l'exécution. Aucune clé n'est écrite dans le code.

Déclenchement manuel : onglet Actions → "WoW Character List" → "Run workflow".

### Apache Airflow via Docker (option développée)

Un DAG Airflow a été développé en parallèle pour orchestrer le même pipeline en local. Il planifie la tâche à 19h00 et s'appuie sur un conteneur `apache/airflow:latest-python3.11`.

```bash
docker-compose up
```

Interface disponible sur `http://localhost:8080` (admin / admin), DAG `wow_character_update`.

Cette option a été abandonnée au profit de GitHub Actions : elle nécessite une machine allumée en permanence et une stack Docker à opérer. GitHub Actions élimine complètement l'infrastructure côté client.

## Dashboard

```
https://halekss.github.io/data_classification_API_blizzard/
```

Rafraîchissement automatique toutes les heures. Actualisation manuelle disponible en haut à droite.

En local : 

Une version du script de requête et de la config existe en local.

## Prérequis

Python 3.10+. Credentials API à créer sur [develop.battle.net](https://develop.battle.net).

```bash
pip install requests pandas
```

Le dataset est écrit dans `data/mon_dataset_wow.csv`.

## Étendre la collecte

Les entités à collecter sont déclarées dans `scripts/config.py` sous forme de tuples `('identifiant', 'endpoint-slug')`. Ajouter ou retirer une ligne suffit pour modifier le périmètre du dataset.