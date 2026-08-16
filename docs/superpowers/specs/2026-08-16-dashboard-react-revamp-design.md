# Refonte du dashboard WoW en React + section Métiers interactive

**Date** : 2026-08-16
**Statut** : Approuvé pour implémentation

## Contexte

Le dashboard actuel (`index.html` + `styles.css`, ~23K + 334K) est un site 100% statique en vanilla JS/CSS, thème "parchemin & or" WoW, déployé sur GitHub Pages sans build. Il lit `data/mon_dataset_wow.csv` (mis à jour quotidiennement par un workflow GitHub Actions, commit avec `[skip ci]`) via `fetch()` côté client, et affiche 4 onglets : Vue d'ensemble, Classes, Roster, Métiers.

Objectifs de cette refonte :
1. Passer à un stack component-based (React) pour gagner en ergonomie/animations, sans perdre l'existant.
2. Ajouter des filtres (faction, classe, race) à la page Classes.
3. Ajouter une page Builds : liens Wowhead (talents/rotation/stats) par classe+spécialisation, purement statique.
4. Porter dans la page Métiers l'outil de planification crafteur/cueilleur que l'utilisateur tenait auparavant sous Excel (capture dans `screens/`), avec une section interactive.

## Décisions actées (issues du brainstorming)

- **Stack** : React + Vite + TypeScript, Tailwind CSS, shadcn/ui (déjà installé via `npx shadcn mcp init`), React Router, Framer Motion pour les animations.
- **État/données** : hooks React + Context, pas de librairie d'état externe (Zustand/React Query jugés overkill pour ce volume de données).
- **Navigation** : vraies routes URL via React Router (`/`, `/classes`, `/roster`, `/metiers`, `/builds`) plutôt que des onglets à état interne.
- **Persistance des assignations métiers** : fichier `data/metiers_assignations.json` versionné dans le repo (comme le CSV), édité via une action "Exporter" dans l'UI puis commité manuellement par l'utilisateur — pas de backend d'écriture.
- **Données de référence métiers/raciaux** : fichier statique `data/metiers_reference.json`, pré-rempli depuis la capture d'écran `screens/`, édité à la main si besoin (pas d'UI d'édition).
- **Page Builds** : granularité classe+spécialisation, liens statiques vers Wowhead, aucune interaction avec l'API/CSV.
- **Déploiement** : nouveau workflow GitHub Actions qui build (`npm run build`) et publie via `actions/deploy-pages`, déclenché sur push `main`. Le workflow existant de collecte CSV (avec `[skip ci]`) reste inchangé et ne redéclenche pas de build, car les JSON/CSV sont fetchés au runtime, jamais importés au build.

## Architecture & structure de fichiers

```
├── src/
│   ├── main.tsx, App.tsx              # bootstrap + routes
│   ├── layout/                        # Header, Nav, background WoW (thème conservé)
│   ├── pages/
│   │   ├── Overview.tsx
│   │   ├── Classes.tsx
│   │   ├── Roster.tsx
│   │   ├── Metiers.tsx                # inclut la section interactive crafteur/cueilleur
│   │   └── Builds.tsx
│   ├── components/                    # StatCard, CharRow, FilterBar, PyramidChart, ui/ (shadcn)
│   ├── context/RosterContext.tsx      # fetch + parse CSV une fois, expose DATA + loading/erreur
│   ├── hooks/
│   │   ├── useMetiersReference.ts     # fetch data/metiers_reference.json
│   │   └── useMetiersAssignations.ts  # fetch data/metiers_assignations.json + état local + export
│   ├── lib/csv.ts, wow-constants.ts   # parsing CSV, couleurs classes/factions (portées telles quelles)
│   └── types/                         # types partagés (Character, MetierRef, Assignation, BuildLink)
├── data/                              # inchangé côté pipeline, PAS inclus dans le build Vite
│   ├── mon_dataset_wow.csv            # généré par le pipeline Python existant
│   ├── metiers_reference.json         # nouveau — équipements + bonus raciaux
│   ├── metiers_assignations.json      # nouveau — rôles crafteur/cueilleur par perso
│   └── builds_wowhead.json            # nouveau — liens par classe+spé
└── index.html (entry Vite), vite.config.ts, tailwind.config.ts, tsconfig.json
```

Point critique conservé de l'existant : ces 4 fichiers sont fetchés en production depuis l'URL **raw GitHub** (`raw.githubusercontent.com/.../data/*.json|csv`, comme `CONFIG.githubUrl` aujourd'hui), pas depuis `dist/` — sinon un commit `[skip ci]` sur le CSV ou une modification manuelle de `metiers_assignations.json` resterait invisible tant qu'aucun rebuild n'est déclenché. `data/` n'est donc **pas** passé en `publicDir` Vite ; en dev, un mode local (équivalent de l'actuel `CONFIG.mode`) fetch depuis `./data/*` via le serveur dev.

L'ancien `index.html` et `styles.css` à la racine sont supprimés une fois le nouveau projet vérifié fonctionnel. Les scripts Python (`scripts/`, `dags/`, `local/`) et `.github/workflows/main.yml` (collecte CSV) restent inchangés.

## Pages

### Overview
Logique identique à l'actuelle (stats globales, champion, top 5 iLvl, distribution par niveau), portée en composants React sans changement fonctionnel.

### Roster
Inchangé fonctionnellement : recherche texte + filtre par classe.

### Classes
Ajout d'une `FilterBar` (Faction: Toutes/Horde/Alliance · Race: Toutes/spécifique · Classe: Toutes/multi-sélection) au-dessus des graphiques existants. Les filtres réduisent le sous-ensemble de personnages **avant** recalcul de toutes les visualisations de la page : iLvl moyen par classe, effectif par classe, effectif par race, effectif par faction, pyramide classes/faction. Si un filtre réduit le jeu à zéro résultat, affichage d'un état vide plutôt qu'un graphique cassé.

### Builds (nouvelle page)
Page 100% statique et déconnectée du CSV/API. Alimentée par `data/builds_wowhead.json` :
```json
{
  "Guerrier": [
    { "spe": "Fury", "build": "https://...", "rotation": "https://...", "stats": "https://..." },
    { "spe": "Arms", "build": "...", "rotation": "...", "stats": "..." }
  ]
}
```
UI : une carte par classe (couleur de classe existante), listant ses spécialisations avec 3 boutons (Build / Rotation / Stats) ouvrant Wowhead dans un nouvel onglet. Le fichier JSON est initialement vide ou avec quelques entrées d'exemple — l'utilisateur le complète après coup, ce n'est pas un blocage à l'implémentation.

### Métiers
Reprend et étend la page actuelle avec les 5 blocs identifiés depuis `screens/Capture d'écran 2026-08-16 221953.png` :

1. **Équipements métiers** — tableau lecture seule (métier → outil, accessoire 1, accessoire 2), depuis `metiers_reference.json.equipements`.
2. **Crafteurs** — une ligne par personnage désigné crafteur (présent dans `metiers_assignations.json`) : son métier de craft + équipement associé, et s'il pratique un 2e métier, un bloc "Pick" avec l'équipement de récolte correspondant.
3. **Pickeurs** — une ligne par personnage pratiquant un métier de récolte sans être désigné crafteur pour ce métier : métier(s) + équipement(s).
4. **Compteur Total & Cueilleurs** — par métier : nombre total de pratiquants (depuis le CSV) vs nombre de cueilleurs (total − crafteurs désignés), recalculé en direct à chaque changement d'assignation.
5. **Raciaux & Classes** — grille race × métier en lecture seule, cellule mise en avant si `metiers_reference.json.bonusRaciaux[race]` contient ce métier.

**Données de référence** (`data/metiers_reference.json`) :
```json
{
  "equipements": {
    "Calligraphie": { "outil": "Plume / Calligraphie", "accessoire1": "Loupe / Joaillerie", "accessoire2": "Lunettes / Joaillerie" },
    "Couture":      { "outil": "Ciseaux / Ingénieur",  "accessoire1": "Aiguilles / Forge",  "accessoire2": "Robe / Couture" },
    "Dépeçage":     { "outil": "Couteau / Forge",       "accessoire1": "Coiffe / TDC",        "accessoire2": "Sac / TDC" },
    "Enchantement": { "outil": "Bâtonnet / Enchantement","accessoire1": "Chapeau / Couture",  "accessoire2": "Eclat / Joaillerie" },
    "Forge":        { "outil": "Marteau / Forge",       "accessoire1": "Outils / Forge",      "accessoire2": "Tablier / TDC" },
    "Herboriste":   { "outil": "Faucille / Forge",      "accessoire1": "Chapeau / Couture",   "accessoire2": "Sac / TDC" },
    "Minage":       { "outil": "Pioche / Forge",        "accessoire1": "Casque / Ingénieur",  "accessoire2": "Sac / TDC" },
    "TDC":          { "outil": "Couteau / Forge",       "accessoire1": "Outils / Forge",      "accessoire2": "Tablier / TDC" }
  },
  "bonusRaciaux": {
    "Tauren":              ["Herboriste"],
    "Elfe de Sang":        ["Enchantement"],
    "Worgen":               ["Dépeçage"],
    "Tauren Haut-Roc":      ["Couture", "Dépeçage", "Herboriste", "Minage"],
    "Kultirassiens":        ["Couture", "Dépeçage", "Herboriste", "Minage"],
    "Dracthyrs/Evoker":     ["Enchantement", "Minage"],
    "Terrestres":           ["Couture", "Dépeçage", "Herboriste", "Minage"]
  }
}
```
> Ces valeurs sont retranscrites à l'œil depuis la capture d'écran. **À vérifier par l'utilisateur après implémentation** contre la source (capture ou données en jeu) — ce n'est pas un blocage, juste une tâche de relecture incluse dans le plan.

**Données d'assignation** (`data/metiers_assignations.json`, remplace le `CRAFTEURS` actuellement codé en dur dans `index.html`) :
```json
{ "Daarken": ["Enchantement"] }
```
= liste des (personnage → métiers) où ce personnage est désigné crafteur plutôt que cueilleur. Tout personnage pratiquant un métier de craft sans entrée ici est traité comme cueilleur par défaut (comportement identique à l'actuel).

**Interactivité** : dans les tableaux Crafteurs/Pickeurs, cliquer sur le badge d'un personnage bascule son rôle (crafteur ↔ cueilleur) pour ce métier — état local React initialisé depuis `metiers_assignations.json`, indépendant du fichier tant que non exporté. Un bouton **"Exporter les assignations"** en haut de la section :
- copie le JSON mis à jour dans le presse-papier, et
- déclenche le téléchargement du fichier `metiers_assignations.json`,

que l'utilisateur commite ensuite manuellement dans `data/`. Pas d'écriture serveur.

## Style & animations

- Couleurs actuelles (`--gold`, `--gold-light`, `--dark`, `--panel`, `--parchment`, couleurs par classe/faction déjà définies en JS) portées en tokens Tailwind (`tailwind.config.ts` theme.extend.colors).
- Polices Cinzel (titres) / Crimson Text (corps) conservées.
- shadcn/ui pour : Tabs/nav, Select (filtres), Table (Métiers/Builds), Dialog si besoin ponctuel — thémés aux couleurs ci-dessus plutôt que le style par défaut shadcn.
- Framer Motion : transition de page (fade/slide au changement de route), animation d'apparition des barres de graphique, animation de layout (`AnimatePresence`/`layout`) sur les listes filtrées (Roster, Classes) pour une réorganisation fluide plutôt qu'un saut.

## CI/CD

Nouveau workflow `.github/workflows/deploy.yml` :
- Déclenché sur `push` vers `main`.
- Étapes : `npm ci`, `npm run build`, publication du dossier `dist/` via `actions/deploy-pages`.
- Le commit quotidien du CSV (`main.yml`, message `[skip ci]`) ne redéclenche pas ce workflow — cohérent avec le fait que CSV et JSON sont fetchés au runtime, jamais importés au build.

Le workflow existant `.github/workflows/main.yml` (collecte CSV) n'est pas modifié.

## Tests

Pas de suite de tests automatisés à porter (le dashboard actuel n'en a pas, et la logique métier n'est pas critique — visualisation de données, pas de calculs à fort enjeu). Vérification manuelle en dev (`npm run dev`) page par page, y compris les cas limites (CSV vide/inaccessible, filtres combinés donnant zéro résultat, assignation métiers sans aucun crafteur désigné).

## Hors périmètre

- Édition UI des données statiques (`metiers_reference.json`, `builds_wowhead.json`) — édition manuelle du fichier uniquement.
- Backend d'écriture pour les assignations métiers — export manuel + commit utilisateur.
- Filtres faction/race sur la page Roster (seule la page Classes est concernée par cette demande).
- Spécialisation par personnage dans le CSV/pipeline Python — la page Builds est indépendante des personnages.
