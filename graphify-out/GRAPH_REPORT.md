# Graph Report - data_classification_API_blizzard  (2026-09-08)

## Corpus Check
- Corpus is ~30,739 words - fits in a single context window. You may not need a graph.

## Summary
- 217 nodes · 326 edges · 19 communities (16 shown, 3 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.9)
- Token cost: 194,961 input · 0 output

## Community Hubs (Navigation)
- Dashboard App Shell & Pages
- TypeScript Config (App)
- Metiers UI & Derivation Logic
- Metiers Data Hooks & Types
- Dev Dependencies
- Runtime Dependencies
- Roster Data Layer
- Docs & CI/Deploy Pipeline
- shadcn/ui Config
- TypeScript Config (Vite/Node)
- package.json Metadata
- Profession Roster Screenshot
- MCP Server Config
- Vite Config
- Background Art Asset

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `cn()` - 12 edges
3. `useRoster()` - 11 edges
4. `MetiersPage()` - 10 edges
5. `dataUrl()` - 9 edges
6. `Character` - 9 edges
7. `CLASS_COLORS` - 8 edges
8. `compilerOptions` - 8 edges
9. `README` - 7 edges
10. `Dashboard React Revamp Design Spec` - 6 edges

## Surprising Connections (you probably didn't know these)
- `README` --references--> `Airflow Service (docker-compose.yaml)`  [EXTRACTED]
  README.md → docker-compose.yaml
- `README` --references--> `index.html (Vite Entry Point)`  [EXTRACTED]
  README.md → index.html
- `README` --references--> `Deploy Dashboard Workflow`  [EXTRACTED]
  README.md → .github/workflows/deploy.yml
- `README` --references--> `WoW Character List Workflow`  [EXTRACTED]
  README.md → .github/workflows/main.yml
- `Apache Airflow Option Abandoned for GitHub Actions` --rationale_for--> `Airflow Service (docker-compose.yaml)`  [EXTRACTED]
  README.md → docker-compose.yaml

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Runtime-Fetch CI/CD Decoupling Architecture** — readme_runtime_data_fetch, readme_skip_ci_decoupling, github_workflows_main, github_workflows_deploy [EXTRACTED 1.00]
- **GitHub Actions vs Local Airflow Orchestration Decision** — docker_compose, github_workflows_main, readme_airflow_abandoned [EXTRACTED 1.00]

## Communities (19 total, 3 thin omitted)

### Community 0 - "Dashboard App Shell & Pages"
Cohesion: 0.14
Nodes (15): App(), BarRow(), CharRow(), FilterBar(), FilterBarProps, StatCard(), useRoster(), Layout() (+7 more)

### Community 1 - "TypeScript Config (App)"
Cohesion: 0.08
Nodes (24): DOM, DOM.Iterable, ES2020, node, src, vite/client, compilerOptions, allowImportingTsExtensions (+16 more)

### Community 2 - "Metiers UI & Derivation Logic"
Cohesion: 0.20
Nodes (17): Button, ButtonProps, buttonVariants, Table, TableBody, TableCaption, TableCell, TableFooter (+9 more)

### Community 3 - "Metiers Data Hooks & Types"
Cohesion: 0.16
Nodes (14): EMPTY, Status, useMetiersAssignations(), Status, useMetiersReference(), dataUrl(), exportAssignations(), BuildsPage() (+6 more)

### Community 4 - "Dev Dependencies"
Cohesion: 0.11
Nodes (19): autoprefixer, devDependencies, autoprefixer, postcss, tailwindcss, @types/node, @types/react, @types/react-dom (+11 more)

### Community 5 - "Runtime Dependencies"
Cohesion: 0.12
Nodes (17): class-variance-authority, clsx, framer-motion, dependencies, class-variance-authority, clsx, framer-motion, @radix-ui/react-slot (+9 more)

### Community 6 - "Roster Data Layer"
Cohesion: 0.20
Nodes (12): RosterContext, RosterContextValue, RosterProvider(), load(), Status, parseCSV(), MetierCompteur, PersonneMetier (+4 more)

### Community 7 - "Docs & CI/Deploy Pipeline"
Cohesion: 0.23
Nodes (14): Airflow Service (docker-compose.yaml), Dashboard React Revamp Implementation Plan, Native <select> Chosen Over shadcn/ui Select, Dashboard React Revamp Design Spec, Manual Export + Commit Persistence for Métiers Assignations, Real URL Routes via React Router (not internal tab state), Context-only State Management (no Zustand/React Query), Deploy Dashboard Workflow (+6 more)

### Community 8 - "shadcn/ui Config"
Cohesion: 0.15
Nodes (12): aliases, components, utils, rsc, $schema, style, tailwind, baseColor (+4 more)

### Community 9 - "TypeScript Config (Vite/Node)"
Cohesion: 0.18
Nodes (10): vite.config.ts, compilerOptions, allowSyntheticDefaultImports, composite, module, moduleResolution, outDir, skipLibCheck (+2 more)

### Community 10 - "package.json Metadata"
Cohesion: 0.20
Nodes (9): description, main, name, scripts, build, dev, preview, type (+1 more)

### Community 11 - "Profession Roster Screenshot"
Cohesion: 0.60
Nodes (6): Table: Compteur Total & Pickeurs (per-profession counts), Table: Crafteurs (crafter roster with craft/pick profession & gear), Table: Equipements métiers (Tool/Accessory per profession), Table: Pickeurs (gatherer roster with profession & gear), Table: Raciaux & Classes (race/profession eligibility matrix), WoW Profession Gear & Roster Tracker (Screenshot)

## Knowledge Gaps
- **79 isolated node(s):** `npx`, `$schema`, `style`, `rsc`, `tsx` (+74 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `Dev Dependencies` to `package.json Metadata`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Runtime Dependencies` to `package.json Metadata`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **What connects `npx`, `$schema`, `style` to the rest of the system?**
  _79 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Dashboard App Shell & Pages` be split into smaller, more focused modules?**
  _Cohesion score 0.1354679802955665 - nodes in this community are weakly interconnected._
- **Should `TypeScript Config (App)` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._
- **Should `Dev Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.10526315789473684 - nodes in this community are weakly interconnected._
- **Should `Runtime Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.11764705882352941 - nodes in this community are weakly interconnected._