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
| Visualisation | Dashboard React + Vite + Tailwind + shadcn/ui, lecture CSV/JSON distante (raw GitHub) |
| Déploiement | GitHub Pages |

## Ce que le pipeline fait

**Collecte** — Le script `requetage_one.py` s'authentifie auprès de l'API via un flux OAuth2 client credentials, puis interroge les endpoints de profil pour plusieurs entités. Pour chaque entité, il extrait : un identifiant textuel, des attributs catégoriels (classe, race) et des attributs numériques (niveau, score d'équipement, deux métiers primaires). Les réponses sont normalisées et traduites en français.

**Traitement** — Les données brutes sont nettoyées, triées (par niveau décroissant puis par score d'équipement décroissant) et exportées en CSV encodé UTF-8.

**Automatisation** — Un workflow GitHub Actions déclenche le pipeline tous les jours à 23h47. Le CSV résultant est committé directement sur le dépôt via le token Actions.

**Visualisation** — Le dashboard React lit le CSV et les fichiers JSON de référence (métiers, builds) depuis l'URL raw GitHub via `fetch()`, jamais depuis le build — la mise à jour quotidienne du CSV n'exige donc aucun redéploiement. Il recalcule à la volée les agrégats : moyennes par groupe, classements, distributions. Pas de backend, pas de base de données.

## Structure du projet

```
├── .github/
│   └── workflows/
│       ├── main.yml           # Pipeline CI/CD — collecte et commit quotidiens
│       └── deploy.yml         # Build + déploiement du dashboard sur GitHub Pages
├── dags/
│   └── wow_export_dag.py     # DAG Airflow (orchestration locale alternative)
├── src/                       # Dashboard React (pages, composants, hooks, contexte roster)
├── data/
│   ├── mon_dataset_wow.csv    # Dataset généré automatiquement
│   ├── metiers_reference.json # Équipements métiers + bonus raciaux (référence statique)
│   ├── metiers_assignations.json # Crafteurs désignés + pickeurs inactifs (hors saison)
│   └── builds_wowhead.json    # Liens Wowhead par classe + spécialisation
├── scripts/
│   ├── config.py             # Paramètres, credentials via variables d'environnement
│   └── requetage_one.py      # Script de collecte et traitement
├── docker-compose.yaml       # Stack Airflow locale
└── index.html                 # Entrée Vite
```

## Orchestration

### GitHub Actions (solution retenue)

Le workflow `.github/workflows/main.yml` installe les dépendances, exécute le script de collecte, puis commit et pousse le CSV sur le dépôt. Le dashboard reflète toujours les données du dernier run.

Les credentials API sont gérés via les secrets GitHub (`ID_CLIENT`, `SECRET_CLIENT`) et injectés comme variables d'environnement au moment de l'exécution. Aucune clé n'est écrite dans le code.

Déclenchement manuel : onglet Actions → "WoW Character List" → "Run workflow".

### Déploiement du dashboard

Le workflow `.github/workflows/deploy.yml` build le dashboard React (`npm ci && npm run build`) et le publie sur GitHub Pages via `actions/deploy-pages`, à chaque push sur `main`. Un `404.html` (copie de `index.html`) est ajouté au build pour que les routes React Router (`/roster`, `/metiers`, etc.) fonctionnent aussi en accès direct/rafraîchissement sur l'hébergement statique de GitHub Pages.

Ce workflow est indépendant de `main.yml` : le commit quotidien du CSV porte `[skip ci]` et ne redéclenche donc pas de build — cohérent avec le fait que le dashboard lit le CSV/JSON à l'exécution, jamais depuis le build.

Prérequis (déjà configuré) : Settings → Pages → Source → **GitHub Actions** (au lieu de "Deploy from a branch").

Déclenchement manuel : onglet Actions → "Deploy Dashboard" → "Run workflow".

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

### Développement local

```bash
npm install
npm run dev
```

Le serveur de dev sert `data/*.csv|json` directement depuis la racine du repo — aucune configuration supplémentaire nécessaire.

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