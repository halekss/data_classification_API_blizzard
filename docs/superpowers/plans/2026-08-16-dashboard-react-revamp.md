# Dashboard React Revamp Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the WoW roster dashboard from a single vanilla HTML/CSS/JS file to a React + Vite + Tailwind + shadcn/ui app, adding faction/race/class filters to the Classes page, a new static Builds page (Wowhead links per class+spec), and an interactive crafteur/cueilleur planning section on the Métiers page.

**Architecture:** A Vite/React/TypeScript SPA at the repo root, routed with React Router, styled with Tailwind (WoW gold/parchment theme) and shadcn/ui components, animated with Framer Motion. Character data (`data/mon_dataset_wow.csv`) and two new JSON files (`data/metiers_reference.json`, `data/metiers_assignations.json`, `data/builds_wowhead.json`) are fetched at runtime from the raw GitHub URL in production (dev fetches the same files locally) — never bundled into the build — so the existing daily `[skip ci]` CSV-update commit keeps working without triggering a rebuild.

**Tech Stack:** React 18, TypeScript, Vite 5, Tailwind CSS 3, shadcn/ui, React Router 6, Framer Motion.

**Spec:** `docs/superpowers/specs/2026-08-16-dashboard-react-revamp-design.md`

## Global Constraints

- No automated test suite (Vitest/RTL) — per the approved spec, verification is manual via `npm run dev` and `npm run build` at the end of each task. This replaces the "write failing test" step in every task below with "manually verify in the dev server."
- `data/*.csv|json` are fetched at runtime, never imported or copied into the Vite build (`publicDir` stays unset/default `public/`, which will remain empty). Use the `dataUrl()` helper from Task 3 everywhere data is fetched.
- Production data URL base: `https://raw.githubusercontent.com/halekss/data_classification_API_blizzard/main/data/`. Dev data URL base: `/data/` (served automatically by the Vite dev server from the project root, since `data/` lives at the repo root alongside `index.html`).
- Vite `base` must be `/data_classification_API_blizzard/` (GitHub Pages project site path) — forgetting this breaks all built asset paths.
- Never fabricate Wowhead URLs. `data/builds_wowhead.json` ships as `{}` — the user fills it in manually after implementation.
- Existing Python pipeline (`scripts/`, `dags/`, `local/`, `.github/workflows/main.yml`) is out of scope — do not modify it.
- French UI copy throughout, matching the existing dashboard's language and tone.

---

### Task 1: Scaffold Vite + React + TypeScript + Tailwind project

**Files:**
- Modify: `.gitignore`, `package.json`
- Create: `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `tailwind.config.ts`, `postcss.config.js`, `src/main.tsx`, `src/App.tsx`, `src/index.css`
- Replace: `index.html` (root)
- Delete: `styles.css` (root)

**Interfaces:**
- Produces: a working `npm run dev` / `npm run build` pipeline that every later task builds on. `src/App.tsx` exports a default component mounted at `#root`.

- [ ] **Step 1: Update `.gitignore`**

Add these lines to the existing `.gitignore`:
```
node_modules
dist
```

- [ ] **Step 2: Install dependencies**

```bash
npm install react react-dom react-router-dom framer-motion
npm install -D vite @vitejs/plugin-react typescript tailwindcss postcss autoprefixer @types/react @types/react-dom
```

- [ ] **Step 3: Create `vite.config.ts`**

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  base: '/data_classification_API_blizzard/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

- [ ] **Step 4: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 5: Create `tsconfig.node.json`**

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 6: Create `tailwind.config.ts`**

```typescript
import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        gold: '#C8A84B',
        'gold-light': '#F0D580',
        dark: '#0A0812',
        panel: 'rgba(13, 10, 26, 0.88)',
        border: 'rgba(58, 46, 94, 0.7)',
        'border-gold': 'rgba(107, 84, 32, 0.8)',
        parchment: '#F0E6C8',
        'red-wow': '#8C1414',
        'red-dark': '#5A0A0A',
      },
      fontFamily: {
        display: ['Cinzel', 'serif'],
        body: ['Crimson Text', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
```

- [ ] **Step 7: Create `postcss.config.js`**

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

- [ ] **Step 8: Replace root `index.html`**

```html
<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link
      href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Crimson+Text:ital,wght@0,400;0,600;1,400&display=swap"
      rel="stylesheet"
    />
    <title>Roster WoW — Dashboard</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 9: Delete `styles.css`**

```bash
rm styles.css
```

- [ ] **Step 10: Create `src/index.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  @apply bg-dark text-parchment font-body min-h-screen;
}
```

- [ ] **Step 11: Create `src/main.tsx`**

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

- [ ] **Step 12: Create placeholder `src/App.tsx`**

```tsx
export default function App() {
  return (
    <div className="p-8 font-display text-gold text-2xl">
      Dashboard en construction…
    </div>
  );
}
```

- [ ] **Step 13: Add build scripts to `package.json`**

Merge into the existing `package.json` (keep the existing `shadcn` devDependency):
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  }
}
```

- [ ] **Step 14: Manually verify**

Run: `npm run dev`, open the printed local URL. Expected: page shows "Dashboard en construction…" in gold Cinzel font on a dark background (confirms Tailwind + fonts are wired).

Run: `npm run build`. Expected: succeeds with no TypeScript errors, produces a `dist/` folder.

- [ ] **Step 15: Commit**

```bash
git add .gitignore package.json package-lock.json vite.config.ts tsconfig.json tsconfig.node.json tailwind.config.ts postcss.config.js index.html src/main.tsx src/App.tsx src/index.css
git rm styles.css
git commit -m "feat: scaffold Vite/React/TypeScript/Tailwind dashboard project"
```

---

### Task 2: Set up shadcn/ui components

**Files:**
- Create: `components.json`
- Create: `src/lib/utils.ts`
- Modify: `src/index.css` (shadcn CSS variables)
- Create: `src/components/ui/button.tsx`, `src/components/ui/table.tsx`

**Interfaces:**
- Produces: `cn()` utility from `@/lib/utils`, and shadcn primitives under `@/components/ui/*` used by Task 10 (`Table`) and Task 11 (`Table`). Native `<select>`/`<button>` elements with Tailwind classes are used elsewhere (Tasks 6, 7) rather than shadcn's Radix-based `Select`, which rejects empty-string item values needed for the "Toutes les X" placeholder options — not worth the workaround for a single dropdown.

- [ ] **Step 1: Create `components.json`**

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/index.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

- [ ] **Step 2: Install shadcn components**

```bash
npx shadcn@latest add button table
```

If prompted interactively, accept the defaults (neutral base color, CSS variables enabled). This installs `class-variance-authority`, `clsx`, `tailwind-merge`, `@radix-ui/*` packages as needed, writes `src/lib/utils.ts` (the `cn()` helper), injects CSS variables into `src/index.css`, and creates `src/components/ui/button.tsx` and `table.tsx`.

- [ ] **Step 3: Manually verify**

Open `src/lib/utils.ts` and confirm it exports a `cn` function. Open `src/index.css` and confirm `:root` now has CSS variables (`--background`, `--foreground`, etc.) added by the CLI, alongside the existing `@tailwind` directives.

Run: `npm run build`. Expected: succeeds.

- [ ] **Step 4: Commit**

```bash
git add components.json src/lib/utils.ts src/components/ui src/index.css package.json package-lock.json
git commit -m "feat: install shadcn/ui components (button, select, table)"
```

---

### Task 3: Shared types, WoW constants, CSV parser, data URL helper

**Files:**
- Create: `src/types/character.ts`, `src/types/metiers.ts`
- Create: `src/lib/wow-constants.ts`, `src/lib/csv.ts`, `src/lib/dataUrls.ts`

**Interfaces:**
- Produces:
  - `Character` type (`Nom`, `Classe`, `Race`, `Faction`, `Niveau: number`, `iLvl: number`, `'Métier 1'`, `'Métier 2'`).
  - `MetierEquipement`, `MetiersReference`, `MetiersAssignations`, `BuildEntry`, `BuildsWowhead` types.
  - `CLASS_COLORS: Record<string, string>`, `FACTION_COLORS: Record<string, string>`, `CRAFT: string[]`, `HARVEST: string[]` from `wow-constants.ts`.
  - `parseCSV(text: string): Character[]` from `csv.ts`.
  - `dataUrl(filename: string): string` from `dataUrls.ts`.
- Consumed by: every later task that touches roster or métiers data.

- [ ] **Step 1: Create `src/types/character.ts`**

```typescript
export interface Character {
  Nom: string;
  Classe: string;
  Race: string;
  Faction: string;
  Niveau: number;
  iLvl: number;
  'Métier 1': string;
  'Métier 2': string;
}
```

- [ ] **Step 2: Create `src/types/metiers.ts`**

```typescript
export interface MetierEquipement {
  outil: string;
  accessoire1: string;
  accessoire2: string;
}

export interface MetiersReference {
  equipements: Record<string, MetierEquipement>;
  bonusRaciaux: Record<string, string[]>;
}

export type MetiersAssignations = Record<string, string[]>;

export interface BuildEntry {
  spe: string;
  build: string;
  rotation: string;
  stats: string;
}

export type BuildsWowhead = Record<string, BuildEntry[]>;
```

- [ ] **Step 3: Create `src/lib/wow-constants.ts`**

```typescript
export const CLASS_COLORS: Record<string, string> = {
  Guerrier: '#C79C6E',
  Paladin: '#F58CBA',
  Chasseur: '#ABD473',
  Voleur: '#FFF569',
  Prêtre: '#FFFFFF',
  'Chevalier de la mort': '#C41F3B',
  Chaman: '#0070DE',
  Mage: '#69CCF0',
  Démoniste: '#9482C9',
  Moine: '#00FF96',
  Druide: '#FF7D0A',
  'Chasseur de démons': '#A330C9',
  Évocateur: '#33937F',
};

export const FACTION_COLORS: Record<string, string> = {
  Horde: '#C41F3B',
  Alliance: '#1E6FD9',
  Inconnue: '#666',
};

export const CRAFT = [
  'Couture',
  'Forge',
  'Travail du cuir',
  'Joaillerie',
  'Ingénierie',
  'Calligraphie',
  'Enchantement',
  'Alchimie',
];

export const HARVEST = ['Herboristerie', 'Minage', 'Dépeçage', 'Couture'];
```

- [ ] **Step 4: Create `src/lib/csv.ts`**

```typescript
import type { Character } from '@/types/character';

export function parseCSV(text: string): Character[] {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',').map((h) => h.trim());
  return lines
    .slice(1)
    .map((line) => {
      const vals = line.split(',').map((v) => v.trim());
      const obj: Record<string, string> = {};
      headers.forEach((h, i) => {
        obj[h] = vals[i] || '';
      });
      return {
        Nom: obj['Nom'] || '',
        Classe: obj['Classe'] || '',
        Race: obj['Race'] || '',
        Faction: obj['Faction'] || 'Inconnue',
        Niveau: parseInt(obj['Niveau'], 10) || 0,
        iLvl: parseInt(obj['iLvl'], 10) || 0,
        'Métier 1': obj['Métier 1'] || 'Aucun',
        'Métier 2': obj['Métier 2'] || 'Aucun',
      };
    })
    .filter((c) => c.Nom);
}
```

- [ ] **Step 5: Create `src/lib/dataUrls.ts`**

```typescript
const GITHUB_RAW_BASE =
  'https://raw.githubusercontent.com/halekss/data_classification_API_blizzard/main/data';

export function dataUrl(filename: string): string {
  return import.meta.env.DEV ? `/data/${filename}` : `${GITHUB_RAW_BASE}/${filename}`;
}
```

- [ ] **Step 6: Manually verify**

Run: `npm run build`. Expected: succeeds (these are pure modules with no runtime side effects yet, so a clean TypeScript build is the only check available).

- [ ] **Step 7: Commit**

```bash
git add src/types src/lib/wow-constants.ts src/lib/csv.ts src/lib/dataUrls.ts
git commit -m "feat: add shared types, WoW constants, CSV parser, data URL helper"
```

---

### Task 4: RosterContext + app shell (routing, layout, nav)

**Files:**
- Create: `src/context/RosterContext.tsx`, `src/layout/Layout.tsx`
- Create: `src/pages/Overview.tsx`, `src/pages/Classes.tsx`, `src/pages/Roster.tsx`, `src/pages/Metiers.tsx`, `src/pages/Builds.tsx` (placeholders, filled in later tasks)
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `Character` (Task 3), `parseCSV` (Task 3), `dataUrl` (Task 3).
- Produces: `RosterProvider`, `useRoster(): { data: Character[]; status: 'loading' | 'ok' | 'error'; errorMessage: string | null; reload: () => void }` — consumed by every page from Task 5 onward.

- [ ] **Step 1: Create `src/context/RosterContext.tsx`**

```tsx
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { parseCSV } from '@/lib/csv';
import { dataUrl } from '@/lib/dataUrls';
import type { Character } from '@/types/character';

type Status = 'loading' | 'ok' | 'error';

interface RosterContextValue {
  data: Character[];
  status: Status;
  errorMessage: string | null;
  reload: () => void;
}

const RosterContext = createContext<RosterContextValue | undefined>(undefined);

const REFRESH_INTERVAL_MS = 60 * 60 * 1000;

export function RosterProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Character[]>([]);
  const [status, setStatus] = useState<Status>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function load() {
    setStatus('loading');
    try {
      const res = await fetch(dataUrl('mon_dataset_wow.csv') + '?t=' + Date.now());
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const text = await res.text();
      const parsed = parseCSV(text);
      if (parsed.length === 0) throw new Error('CSV vide');
      setData(parsed);
      setStatus('ok');
      setErrorMessage(null);
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : String(err));
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  return (
    <RosterContext.Provider value={{ data, status, errorMessage, reload: load }}>
      {children}
    </RosterContext.Provider>
  );
}

export function useRoster() {
  const ctx = useContext(RosterContext);
  if (!ctx) throw new Error('useRoster must be used within a RosterProvider');
  return ctx;
}
```

- [ ] **Step 2: Create `src/layout/Layout.tsx`**

```tsx
import { NavLink } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useRoster } from '@/context/RosterContext';

const TABS = [
  { to: '/', label: "Vue d'ensemble" },
  { to: '/classes', label: 'Classes' },
  { to: '/roster', label: 'Roster' },
  { to: '/metiers', label: 'Métiers' },
  { to: '/builds', label: 'Builds' },
];

export function Layout({ children }: { children: ReactNode }) {
  const { status, data, reload } = useRoster();

  const statusText =
    status === 'loading'
      ? 'Chargement...'
      : status === 'ok'
        ? `${data.length} personnages chargés`
        : 'Erreur de chargement';

  return (
    <div className="min-h-screen">
      <header className="border-b border-border-gold px-6 py-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">⚔</span>
          <div>
            <div className="font-display text-gold text-xl">Roster du compte</div>
            <div className="text-sm text-parchment/70">World of Warcraft · Dashboard</div>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span>{statusText}</span>
          <button
            className="border border-gold text-gold px-3 py-1 rounded hover:bg-gold/10 transition-colors"
            onClick={reload}
          >
            ↺ Actualiser
          </button>
        </div>
      </header>
      <nav className="flex flex-wrap gap-2 px-6 py-3 border-b border-border">
        {TABS.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.to === '/'}
            className={({ isActive }) =>
              `px-3 py-1 rounded font-display text-sm transition-colors ${
                isActive ? 'bg-gold text-dark' : 'text-parchment/80 hover:text-gold'
              }`
            }
          >
            {t.label}
          </NavLink>
        ))}
      </nav>
      <main className="p-6 max-w-6xl mx-auto">{children}</main>
    </div>
  );
}
```

- [ ] **Step 3: Create placeholder pages**

`src/pages/Overview.tsx`:
```tsx
export function OverviewPage() {
  return <div>Vue d'ensemble — à venir</div>;
}
```

`src/pages/Classes.tsx`:
```tsx
export function ClassesPage() {
  return <div>Classes — à venir</div>;
}
```

`src/pages/Roster.tsx`:
```tsx
export function RosterPage() {
  return <div>Roster — à venir</div>;
}
```

`src/pages/Metiers.tsx`:
```tsx
export function MetiersPage() {
  return <div>Métiers — à venir</div>;
}
```

`src/pages/Builds.tsx`:
```tsx
export function BuildsPage() {
  return <div>Builds — à venir</div>;
}
```

- [ ] **Step 4: Wire routing in `src/App.tsx`**

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { RosterProvider } from '@/context/RosterContext';
import { Layout } from '@/layout/Layout';
import { OverviewPage } from '@/pages/Overview';
import { ClassesPage } from '@/pages/Classes';
import { RosterPage } from '@/pages/Roster';
import { MetiersPage } from '@/pages/Metiers';
import { BuildsPage } from '@/pages/Builds';

export default function App() {
  return (
    <RosterProvider>
      <BrowserRouter basename="/data_classification_API_blizzard">
        <Layout>
          <Routes>
            <Route path="/" element={<OverviewPage />} />
            <Route path="/classes" element={<ClassesPage />} />
            <Route path="/roster" element={<RosterPage />} />
            <Route path="/metiers" element={<MetiersPage />} />
            <Route path="/builds" element={<BuildsPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </RosterProvider>
  );
}
```

- [ ] **Step 5: Manually verify**

Run: `npm run dev`. Expected: header shows "Roster du compte" and either "Chargement..." then a real character count (if `data/mon_dataset_wow.csv` is reachable at `/data/mon_dataset_wow.csv` in dev) or "Erreur de chargement". Click each nav link (Vue d'ensemble, Classes, Roster, Métiers, Builds) — each shows its placeholder text and the corresponding nav item highlights gold.

Run: `npm run build`. Expected: succeeds.

- [ ] **Step 6: Commit**

```bash
git add src/context src/layout src/pages src/App.tsx
git commit -m "feat: add RosterContext, app shell, and routed page placeholders"
```

---

### Task 5: Overview page

**Files:**
- Create: `src/components/StatCard.tsx`, `src/components/CharRow.tsx`
- Modify: `src/pages/Overview.tsx`

**Interfaces:**
- Consumes: `useRoster()` (Task 4), `CLASS_COLORS` (Task 3), `Character` (Task 3).
- Produces: `StatCard({ value, label, sub })`, `CharRow({ c, rank, highlight? })` — reused by Task 6 (Roster).

- [ ] **Step 1: Create `src/components/StatCard.tsx`**

```tsx
export function StatCard({
  value,
  label,
  sub,
}: {
  value: string | number;
  label: string;
  sub: string;
}) {
  return (
    <div className="border border-border-gold rounded p-4 bg-panel">
      <div className="text-xs uppercase tracking-wide text-gold/80">{label}</div>
      <div className="text-3xl font-display text-parchment">{value}</div>
      <div className="text-xs text-parchment/60">{sub}</div>
    </div>
  );
}
```

- [ ] **Step 2: Create `src/components/CharRow.tsx`**

```tsx
import { CLASS_COLORS } from '@/lib/wow-constants';
import type { Character } from '@/types/character';

export function CharRow({
  c,
  rank,
  highlight,
}: {
  c: Character;
  rank: number;
  highlight?: boolean;
}) {
  const col = CLASS_COLORS[c.Classe] || '#C8A84B';
  return (
    <div
      className={`flex items-center gap-3 py-2 border-b border-border/50 ${highlight ? 'bg-gold/5' : ''}`}
    >
      <div className="w-6 text-right" style={{ color: highlight ? '#C8A84B' : '#555' }}>
        {rank}
      </div>
      <div className="w-2 h-2 rounded-full shrink-0" style={{ background: col }} />
      <div className="flex-1 font-display" style={{ color: col }}>
        {c.Nom}
      </div>
      <div className="text-sm text-parchment/60">
        {c.Classe} · {c.Race}
      </div>
      <div className="font-display text-gold">{c.iLvl}</div>
    </div>
  );
}
```

- [ ] **Step 3: Implement `src/pages/Overview.tsx`**

```tsx
import { useRoster } from '@/context/RosterContext';
import { CLASS_COLORS } from '@/lib/wow-constants';
import { StatCard } from '@/components/StatCard';
import { CharRow } from '@/components/CharRow';

export function OverviewPage() {
  const { data, status } = useRoster();

  if (status === 'loading') return <div>Connexion à l'Explorateur de personnages...</div>;
  if (status === 'error' || data.length === 0)
    return <div>Impossible de charger le roster.</div>;

  const total = data.length;
  const avgIlvl = (data.reduce((s, c) => s + c.iLvl, 0) / total).toFixed(0);
  const lvl90 = data.filter((c) => c.Niveau === 90).length;
  const races = new Set(data.map((c) => c.Race)).size;
  const sorted = [...data].sort((a, b) => b.iLvl - a.iLvl);
  const champion = sorted[0];
  const top5 = sorted.slice(0, 5);
  const levelMap = new Map<number, number>();
  data.forEach((c) => levelMap.set(c.Niveau, (levelMap.get(c.Niveau) || 0) + 1));
  const levels = [...levelMap.entries()].sort((a, b) => b[0] - a[0]);
  const col = CLASS_COLORS[champion.Classe] || '#C8A84B';

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard value={total} label="Personnages" sub="dans le roster" />
        <StatCard value={avgIlvl} label="iLvl moyen" sub="tous personnages" />
        <StatCard value={lvl90} label="Niveau 90" sub="au niveau max" />
        <StatCard value={races} label="Races" sub="représentées" />
      </div>

      <section>
        <h2 className="font-display text-gold mb-2">🏆 Champion de la guilde</h2>
        <div className="border border-border-gold rounded p-4 bg-panel flex items-center gap-4">
          <div className="text-2xl font-display" style={{ color: col }}>
            {champion.Nom.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="font-display text-lg" style={{ color: col }}>
              {champion.Nom}
            </div>
            <div className="text-sm text-parchment/70">
              {champion.Classe} · {champion.Race} · Niv.{champion.Niveau}
            </div>
            <div className="text-xs text-parchment/50 mt-1">
              {champion['Métier 1']}
              {champion['Métier 2'] !== 'Aucun' ? ' / ' + champion['Métier 2'] : ''}
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-display text-gold">{champion.iLvl}</div>
            <div className="text-xs text-parchment/60">iLvl</div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="font-display text-gold mb-2">⚡ Top 5 par iLvl</h2>
        <div>
          {top5.map((c, i) => (
            <CharRow key={c.Nom} c={c} rank={i + 1} highlight />
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-gold mb-2">📊 Distribution par niveau</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {levels.map(([lvl, cnt]) => (
            <div key={lvl} className="border border-border rounded p-3 text-center">
              <div className="text-xl font-display text-gold">{lvl}</div>
              <div className="text-xs text-parchment/60">
                {cnt} perso{cnt > 1 ? 's' : ''}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 4: Manually verify**

Run: `npm run dev`, open `/`. Expected: stat cards show real totals, champion banner shows the highest-iLvl character, top 5 list renders, level distribution grid renders. Compare numbers against the current live dashboard (https://halekss.github.io/data_classification_API_blizzard/) to confirm they match.

- [ ] **Step 5: Commit**

```bash
git add src/components/StatCard.tsx src/components/CharRow.tsx src/pages/Overview.tsx
git commit -m "feat: implement Overview page"
```

---

### Task 6: Roster page

**Files:**
- Modify: `src/pages/Roster.tsx`

**Interfaces:**
- Consumes: `useRoster()` (Task 4), `CLASS_COLORS` (Task 3).

- [ ] **Step 1: Implement `src/pages/Roster.tsx`**

```tsx
import { useState } from 'react';
import { useRoster } from '@/context/RosterContext';
import { CLASS_COLORS } from '@/lib/wow-constants';

export function RosterPage() {
  const { data, status } = useRoster();
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');

  if (status === 'loading') return <div>Chargement...</div>;
  if (status === 'error') return <div>Impossible de charger le roster.</div>;

  const classes = [...new Set(data.map((c) => c.Classe))].sort();
  const s = search.toLowerCase();
  let list = [...data].sort((a, b) => b.iLvl - a.iLvl);
  if (s) {
    list = list.filter(
      (c) =>
        c.Nom.toLowerCase().includes(s) ||
        c.Classe.toLowerCase().includes(s) ||
        c.Race.toLowerCase().includes(s)
    );
  }
  if (classFilter) list = list.filter((c) => c.Classe === classFilter);

  return (
    <div>
      <input
        className="w-full border border-border rounded px-3 py-2 mb-3 bg-panel text-parchment placeholder:text-parchment/40"
        placeholder="Rechercher un personnage, une classe, une race..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          className={`px-3 py-1 rounded border text-sm ${
            classFilter === '' ? 'bg-gold text-dark border-gold' : 'border-border text-parchment/70'
          }`}
          onClick={() => setClassFilter('')}
        >
          Toutes les classes
        </button>
        {classes.map((cl) => (
          <button
            key={cl}
            className={`px-3 py-1 rounded border text-sm ${
              classFilter === cl ? 'bg-gold text-dark border-gold' : 'border-border'
            }`}
            style={{ color: classFilter === cl ? undefined : CLASS_COLORS[cl] || '#888' }}
            onClick={() => setClassFilter(cl)}
          >
            {cl}
          </button>
        ))}
      </div>
      {list.length === 0 ? (
        <div className="text-parchment/50 text-sm p-3">Aucun résultat.</div>
      ) : (
        <div>
          {list.map((c, i) => {
            const col = CLASS_COLORS[c.Classe] || '#C8A84B';
            const hi = i < 3 && !s && !classFilter;
            return (
              <div
                key={c.Nom}
                className={`flex items-center gap-3 py-2 border-b border-border/50 ${hi ? 'bg-gold/5' : ''}`}
              >
                <div className="w-6 text-right" style={{ color: hi ? '#C8A84B' : '#555' }}>
                  {i + 1}
                </div>
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: col }} />
                <div className="flex-1 font-display" style={{ color: col }}>
                  {c.Nom}
                </div>
                <div className="text-sm text-parchment/60">
                  {c.Classe} · {c.Race} · Niv.{c.Niveau}
                </div>
                <div className="font-display text-gold">{c.iLvl}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Manually verify**

Run: `npm run dev`, open `/roster`. Expected: search box filters by name/class/race live; class filter pills toggle correctly; top 3 highlighted gold only when no filter/search active, matching the current dashboard's behavior.

- [ ] **Step 3: Commit**

```bash
git add src/pages/Roster.tsx
git commit -m "feat: implement Roster page"
```

---

### Task 7: FilterBar component + Classes page with faction/race/class filters

**Files:**
- Create: `src/components/FilterBar.tsx`, `src/components/BarRow.tsx`
- Modify: `src/pages/Classes.tsx`

**Interfaces:**
- Consumes: `useRoster()`, `CLASS_COLORS`, `FACTION_COLORS`, `Character`.
- Produces: `FilterBar` props `{ races, classes, faction, race, selectedClasses, onFactionChange, onRaceChange, onToggleClasse }`; `BarRow` props `{ label, pct, color, value, count? }`.

- [ ] **Step 1: Create `src/components/BarRow.tsx`**

```tsx
export function BarRow({
  label,
  pct,
  color,
  value,
  count,
}: {
  label: string;
  pct: number;
  color: string;
  value: string;
  count?: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-1.5 text-sm">
      <div className="w-40 truncate">{label}</div>
      <div className="flex-1 h-3 bg-border/30 rounded overflow-hidden">
        <div
          className="h-full rounded transition-all duration-300"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
      <div className="w-10 text-right text-gold">{value}</div>
      {count && <div className="w-10 text-right text-parchment/50 text-xs">{count}</div>}
    </div>
  );
}
```

- [ ] **Step 2: Create `src/components/FilterBar.tsx`**

```tsx
import { CLASS_COLORS } from '@/lib/wow-constants';

interface FilterBarProps {
  races: string[];
  classes: string[];
  faction: string;
  race: string;
  selectedClasses: Set<string>;
  onFactionChange: (v: string) => void;
  onRaceChange: (v: string) => void;
  onToggleClasse: (classe: string) => void;
}

export function FilterBar({
  races,
  classes,
  faction,
  race,
  selectedClasses,
  onFactionChange,
  onRaceChange,
  onToggleClasse,
}: FilterBarProps) {
  return (
    <div className="mb-6 space-y-3">
      <div className="flex flex-wrap gap-2">
        {['', 'Horde', 'Alliance'].map((f) => (
          <button
            key={f || 'toutes'}
            className={`px-3 py-1 rounded border text-sm ${
              faction === f ? 'bg-gold text-dark border-gold' : 'border-border text-parchment/70'
            }`}
            onClick={() => onFactionChange(f)}
          >
            {f || 'Toutes les factions'}
          </button>
        ))}
      </div>
      <select
        className="border border-border rounded px-3 py-1.5 bg-panel text-parchment text-sm"
        value={race}
        onChange={(e) => onRaceChange(e.target.value)}
      >
        <option value="">Toutes les races</option>
        {races.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
      <div className="flex flex-wrap gap-2">
        {classes.map((cl) => (
          <button
            key={cl}
            className={`px-3 py-1 rounded border text-sm ${
              selectedClasses.has(cl) ? 'bg-gold/20 border-gold' : 'border-border'
            }`}
            style={{ color: CLASS_COLORS[cl] || '#888' }}
            onClick={() => onToggleClasse(cl)}
          >
            {cl}
          </button>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Implement `src/pages/Classes.tsx`**

```tsx
import { useMemo, useState } from 'react';
import { useRoster } from '@/context/RosterContext';
import { CLASS_COLORS, FACTION_COLORS } from '@/lib/wow-constants';
import { FilterBar } from '@/components/FilterBar';
import { BarRow } from '@/components/BarRow';
import type { Character } from '@/types/character';

export function ClassesPage() {
  const { data, status } = useRoster();
  const [faction, setFaction] = useState('');
  const [race, setRace] = useState('');
  const [selectedClasses, setSelectedClasses] = useState<Set<string>>(new Set());

  const allRaces = useMemo(() => [...new Set(data.map((c) => c.Race))].sort(), [data]);
  const allClasses = useMemo(() => [...new Set(data.map((c) => c.Classe))].sort(), [data]);

  function toggleClasse(cl: string) {
    setSelectedClasses((prev) => {
      const next = new Set(prev);
      if (next.has(cl)) next.delete(cl);
      else next.add(cl);
      return next;
    });
  }

  if (status === 'loading') return <div>Chargement...</div>;
  if (status === 'error') return <div>Impossible de charger le roster.</div>;

  const filtered: Character[] = data.filter(
    (c) =>
      (!faction || c.Faction === faction) &&
      (!race || c.Race === race) &&
      (selectedClasses.size === 0 || selectedClasses.has(c.Classe))
  );

  const filterBar = (
    <FilterBar
      races={allRaces}
      classes={allClasses}
      faction={faction}
      race={race}
      selectedClasses={selectedClasses}
      onFactionChange={setFaction}
      onRaceChange={setRace}
      onToggleClasse={toggleClasse}
    />
  );

  if (filtered.length === 0) {
    return (
      <div>
        {filterBar}
        <div className="text-parchment/50 text-sm p-3">
          Aucun personnage ne correspond à ces filtres.
        </div>
      </div>
    );
  }

  const map = new Map<string, number[]>();
  filtered.forEach((c) => {
    const arr = map.get(c.Classe) || [];
    arr.push(c.iLvl);
    map.set(c.Classe, arr);
  });
  const avgs = [...map.entries()]
    .map(([cl, ilvls]) => ({
      cl,
      avg: ilvls.reduce((s, v) => s + v, 0) / ilvls.length,
      count: ilvls.length,
    }))
    .sort((a, b) => b.avg - a.avg);
  const maxAvg = avgs[0].avg;
  const maxCount = Math.max(...avgs.map((x) => x.count));

  const raceMap = new Map<string, number>();
  filtered.forEach((c) => raceMap.set(c.Race, (raceMap.get(c.Race) || 0) + 1));
  const maxRace = Math.max(...raceMap.values());

  const factionMap = new Map<string, number>();
  filtered.forEach((c) => factionMap.set(c.Faction, (factionMap.get(c.Faction) || 0) + 1));
  const factionOrder = ['Alliance', 'Horde']
    .filter((f) => factionMap.has(f))
    .concat([...factionMap.keys()].filter((f) => f !== 'Alliance' && f !== 'Horde'));

  const classFactionMap = new Map<string, Map<string, number>>();
  filtered.forEach((c) => {
    const fm = classFactionMap.get(c.Classe) || new Map<string, number>();
    fm.set(c.Faction, (fm.get(c.Faction) || 0) + 1);
    classFactionMap.set(c.Classe, fm);
  });
  const classFactionTotals = [...classFactionMap.entries()]
    .map(([cl, fm]) => ({ cl, fm, total: [...fm.values()].reduce((s, v) => s + v, 0) }))
    .sort((a, b) => b.total - a.total);
  const hasFactionData =
    (factionMap.get('Horde') || 0) > 0 || (factionMap.get('Alliance') || 0) > 0;
  const maxSingle = Math.max(
    1,
    ...classFactionTotals.flatMap(({ fm }) => [fm.get('Alliance') || 0, fm.get('Horde') || 0])
  );

  return (
    <div className="space-y-6">
      {filterBar}

      <section>
        <h2 className="font-display text-gold mb-2">⚔ iLvl moyen par classe</h2>
        {avgs.map((item) => (
          <BarRow
            key={item.cl}
            label={item.cl}
            pct={(item.avg / maxAvg) * 100}
            color={CLASS_COLORS[item.cl] || '#C8A84B'}
            value={item.avg.toFixed(0)}
            count={`${item.count}p`}
          />
        ))}
      </section>

      <section>
        <h2 className="font-display text-gold mb-2">👥 Effectif par classe</h2>
        {[...avgs]
          .sort((a, b) => b.count - a.count)
          .map((item) => (
            <BarRow
              key={item.cl}
              label={item.cl}
              pct={(item.count / maxCount) * 100}
              color={CLASS_COLORS[item.cl] || '#C8A84B'}
              value={String(item.count)}
            />
          ))}
      </section>

      <section>
        <h2 className="font-display text-gold mb-2">🌍 Effectif par race</h2>
        {[...raceMap.entries()]
          .sort((a, b) => b[1] - a[1])
          .map(([r, cnt]) => (
            <BarRow key={r} label={r} pct={(cnt / maxRace) * 100} color="#7A5A8A" value={String(cnt)} />
          ))}
      </section>

      <section>
        <h2 className="font-display text-gold mb-2">🛡 Effectif par faction</h2>
        <div className="grid grid-cols-2 gap-4">
          {factionOrder.map((f) => {
            const col = FACTION_COLORS[f] || '#888';
            const cnt = factionMap.get(f) || 0;
            return (
              <div
                key={f}
                className="border rounded p-4 bg-panel"
                style={{ borderColor: `${col}55` }}
              >
                <div className="text-xs" style={{ color: col }}>
                  {f}
                </div>
                <div className="text-2xl font-display">{cnt}</div>
                <div className="text-xs text-parchment/60">
                  {((cnt / filtered.length) * 100).toFixed(0)}% du roster
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="font-display text-gold mb-2">🎭 Classes par faction</h2>
        {!hasFactionData ? (
          <div className="text-sm text-parchment/50">
            Données de faction indisponibles pour le moment.
          </div>
        ) : (
          <div className="space-y-1.5">
            {classFactionTotals.map(({ cl, fm }) => {
              const a = fm.get('Alliance') || 0;
              const h = fm.get('Horde') || 0;
              return (
                <div key={cl} className="flex items-center gap-2 text-sm">
                  <div className="w-8 text-right text-parchment/70">{a}</div>
                  <div className="w-32 h-2.5 bg-border/30 rounded overflow-hidden flex justify-end">
                    <div
                      className="h-full rounded"
                      style={{ width: `${(a / maxSingle) * 100}%`, background: FACTION_COLORS.Alliance }}
                    />
                  </div>
                  <div className="w-32 text-center">{cl}</div>
                  <div className="w-32 h-2.5 bg-border/30 rounded overflow-hidden">
                    <div
                      className="h-full rounded"
                      style={{ width: `${(h / maxSingle) * 100}%`, background: FACTION_COLORS.Horde }}
                    />
                  </div>
                  <div className="w-8 text-parchment/70">{h}</div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
```

- [ ] **Step 4: Manually verify**

Run: `npm run dev`, open `/classes`. Expected: with no filters, numbers match the current dashboard's Classes tab. Selecting "Horde" recalculates every section to Horde-only characters. Toggling a class pill on/off adds/removes it from all class-based bars. Selecting a race filters everything to that race. Combining filters down to zero matches shows the empty-state message instead of broken charts.

- [ ] **Step 5: Commit**

```bash
git add src/components/FilterBar.tsx src/components/BarRow.tsx src/pages/Classes.tsx
git commit -m "feat: add faction/race/class filters to Classes page"
```

---

### Task 8: Métiers data files (reference, assignations, builds)

**Files:**
- Create: `data/metiers_reference.json`, `data/metiers_assignations.json`, `data/builds_wowhead.json`

**Interfaces:**
- Produces: the JSON shapes matching `MetiersReference`, `MetiersAssignations`, `BuildsWowhead` (Task 3), fetched by Task 9's hooks.

- [ ] **Step 1: Create `data/metiers_reference.json`**

```json
{
  "equipements": {
    "Calligraphie": { "outil": "Plume / Calligraphie", "accessoire1": "Loupe / Joaillerie", "accessoire2": "Lunettes / Joaillerie" },
    "Couture": { "outil": "Ciseaux / Ingénieur", "accessoire1": "Aiguilles / Forge", "accessoire2": "Robe / Couture" },
    "Dépeçage": { "outil": "Couteau / Forge", "accessoire1": "Coiffe / TDC", "accessoire2": "Sac / TDC" },
    "Enchantement": { "outil": "Bâtonnet / Enchantement", "accessoire1": "Chapeau / Couture", "accessoire2": "Eclat / Joaillerie" },
    "Forge": { "outil": "Marteau / Forge", "accessoire1": "Outils / Forge", "accessoire2": "Tablier / TDC" },
    "Herboriste": { "outil": "Faucille / Forge", "accessoire1": "Chapeau / Couture", "accessoire2": "Sac / TDC" },
    "Minage": { "outil": "Pioche / Forge", "accessoire1": "Casque / Ingénieur", "accessoire2": "Sac / TDC" },
    "TDC": { "outil": "Couteau / Forge", "accessoire1": "Outils / Forge", "accessoire2": "Tablier / TDC" }
  },
  "bonusRaciaux": {
    "Tauren": ["Herboriste"],
    "Elfe de Sang": ["Enchantement"],
    "Worgen": ["Dépeçage"],
    "Tauren Haut-Roc": ["Couture", "Dépeçage", "Herboriste", "Minage"],
    "Kultirassiens": ["Couture", "Dépeçage", "Herboriste", "Minage"],
    "Dracthyrs/Evoker": ["Enchantement", "Minage"],
    "Terrestres": ["Couture", "Dépeçage", "Herboriste", "Minage"]
  }
}
```

> Retranscrit depuis `screens/Capture d'écran 2026-08-16 221953.png`. **À vérifier par l'utilisateur** avant de committer les assignations réelles — l'implémentation fonctionne quelles que soient les valeurs exactes.

- [ ] **Step 2: Create `data/metiers_assignations.json`**

```json
{
  "Daarken": ["Enchantement"]
}
```

This mirrors the `CRAFTEURS` constant hardcoded in the old `index.html`.

- [ ] **Step 3: Create `data/builds_wowhead.json`**

```json
{}
```

Empty on purpose — per the Global Constraints, Wowhead URLs are never fabricated. The user fills this in after implementation (see Task 12's empty-state UI).

- [ ] **Step 4: Manually verify**

Run: `python -m json.tool data/metiers_reference.json`, `python -m json.tool data/metiers_assignations.json`, `python -m json.tool data/builds_wowhead.json`. Expected: all three print without error (valid JSON).

- [ ] **Step 5: Commit**

```bash
git add data/metiers_reference.json data/metiers_assignations.json data/builds_wowhead.json
git commit -m "feat: add métiers reference, assignations, and builds data files"
```

---

### Task 9: Métiers hooks and derivation logic

**Files:**
- Create: `src/hooks/useMetiersReference.ts`, `src/hooks/useMetiersAssignations.ts`
- Create: `src/lib/metiersDerivation.ts`

**Interfaces:**
- Consumes: `dataUrl` (Task 3), `MetiersReference`/`MetiersAssignations` types (Task 3), `CRAFT`/`HARVEST` (Task 3), `Character` (Task 3).
- Produces:
  - `useMetiersReference(): { reference: MetiersReference | null; status: 'loading' | 'ok' | 'error' }`
  - `useMetiersAssignations(): { assignations: MetiersAssignations; status: 'loading' | 'ok' | 'error'; toggleRole: (nom: string, metier: string) => void }`
  - `derivePersonnesMetiers(data: Character[], assignations: MetiersAssignations): PersonneMetier[]`
  - `deriveCompteurs(personnesMetiers: PersonneMetier[]): MetierCompteur[]`
  - `personnesSansMetier(data: Character[]): Character[]`
  - Consumed by Task 10.

- [ ] **Step 1: Create `src/hooks/useMetiersReference.ts`**

```typescript
import { useEffect, useState } from 'react';
import { dataUrl } from '@/lib/dataUrls';
import type { MetiersReference } from '@/types/metiers';

type Status = 'loading' | 'ok' | 'error';

export function useMetiersReference() {
  const [reference, setReference] = useState<MetiersReference | null>(null);
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    fetch(dataUrl('metiers_reference.json'))
      .then((res) => {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json() as Promise<MetiersReference>;
      })
      .then((json) => {
        setReference(json);
        setStatus('ok');
      })
      .catch(() => setStatus('error'));
  }, []);

  return { reference, status };
}
```

- [ ] **Step 2: Create `src/hooks/useMetiersAssignations.ts`**

```typescript
import { useCallback, useEffect, useState } from 'react';
import { dataUrl } from '@/lib/dataUrls';
import type { MetiersAssignations } from '@/types/metiers';

type Status = 'loading' | 'ok' | 'error';

export function useMetiersAssignations() {
  const [assignations, setAssignations] = useState<MetiersAssignations>({});
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    fetch(dataUrl('metiers_assignations.json'))
      .then((res) => {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json() as Promise<MetiersAssignations>;
      })
      .then((json) => {
        setAssignations(json);
        setStatus('ok');
      })
      .catch(() => setStatus('error'));
  }, []);

  const toggleRole = useCallback((nom: string, metier: string) => {
    setAssignations((prev) => {
      const current = prev[nom] || [];
      const isCrafteur = current.includes(metier);
      const nextForNom = isCrafteur ? current.filter((m) => m !== metier) : [...current, metier];
      const next = { ...prev };
      if (nextForNom.length > 0) next[nom] = nextForNom;
      else delete next[nom];
      return next;
    });
  }, []);

  return { assignations, status, toggleRole };
}
```

- [ ] **Step 3: Create `src/lib/metiersDerivation.ts`**

```typescript
import type { Character } from '@/types/character';
import type { MetiersAssignations } from '@/types/metiers';
import { CRAFT, HARVEST } from '@/lib/wow-constants';

export interface PersonneMetier {
  personnage: Character;
  metier: string;
  role: 'crafteur' | 'cueilleur';
}

export interface MetierCompteur {
  metier: string;
  total: number;
  cueilleurs: number;
}

export function derivePersonnesMetiers(
  data: Character[],
  assignations: MetiersAssignations
): PersonneMetier[] {
  const result: PersonneMetier[] = [];
  data.forEach((c) => {
    [c['Métier 1'], c['Métier 2']].forEach((m) => {
      if (!m || m === 'Aucun') return;
      if (!CRAFT.includes(m) && !HARVEST.includes(m)) return;
      const estCrafteur = (assignations[c.Nom] || []).includes(m);
      result.push({ personnage: c, metier: m, role: estCrafteur ? 'crafteur' : 'cueilleur' });
    });
  });
  return result;
}

export function deriveCompteurs(personnesMetiers: PersonneMetier[]): MetierCompteur[] {
  const map = new Map<string, MetierCompteur>();
  personnesMetiers.forEach(({ metier, role }) => {
    const entry = map.get(metier) || { metier, total: 0, cueilleurs: 0 };
    entry.total += 1;
    if (role === 'cueilleur') entry.cueilleurs += 1;
    map.set(metier, entry);
  });
  return [...map.values()].sort((a, b) => b.total - a.total);
}

export function personnesSansMetier(data: Character[]): Character[] {
  return data.filter(
    (c) =>
      (c['Métier 1'] === 'Aucun' || !c['Métier 1']) && (c['Métier 2'] === 'Aucun' || !c['Métier 2'])
  );
}
```

- [ ] **Step 4: Manually verify**

Run: `npm run build`. Expected: succeeds with no type errors. This confirms the hooks and pure functions type-check against `Character`, `MetiersReference`, and `MetiersAssignations` correctly — full behavioral verification happens visually in Task 10 once the page renders these values.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useMetiersReference.ts src/hooks/useMetiersAssignations.ts src/lib/metiersDerivation.ts
git commit -m "feat: add métiers data hooks and derivation logic"
```

---

### Task 10: Métiers page — static tables (Équipements, Raciaux) and Sans métier

**Files:**
- Modify: `src/pages/Metiers.tsx`

**Interfaces:**
- Consumes: `useRoster()` (Task 4), `useMetiersReference()` (Task 9), `personnesSansMetier()` (Task 9), `CLASS_COLORS` (Task 3), `Table`/`TableHeader`/`TableBody`/`TableRow`/`TableHead`/`TableCell` from `@/components/ui/table` (Task 2).

- [ ] **Step 1: Implement the static parts of `src/pages/Metiers.tsx`**

```tsx
import { useRoster } from '@/context/RosterContext';
import { useMetiersReference } from '@/hooks/useMetiersReference';
import { personnesSansMetier } from '@/lib/metiersDerivation';
import { CLASS_COLORS } from '@/lib/wow-constants';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

export function MetiersPage() {
  const { data, status: rosterStatus } = useRoster();
  const { reference, status: refStatus } = useMetiersReference();

  if (rosterStatus === 'loading' || refStatus === 'loading') return <div>Chargement...</div>;
  if (rosterStatus === 'error' || !reference)
    return <div>Impossible de charger les données métiers.</div>;

  const sansMetier = personnesSansMetier(data);

  return (
    <div className="space-y-8">
      <section>
        <h2 className="font-display text-gold mb-2">🛠 Équipements métiers</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Métier</TableHead>
              <TableHead>Outil</TableHead>
              <TableHead>Accessoire 1</TableHead>
              <TableHead>Accessoire 2</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(reference.equipements).map(([metier, eq]) => (
              <TableRow key={metier}>
                <TableCell className="font-display text-gold">{metier}</TableCell>
                <TableCell>{eq.outil}</TableCell>
                <TableCell>{eq.accessoire1}</TableCell>
                <TableCell>{eq.accessoire2}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      <section>
        <h2 className="font-display text-gold mb-2">🧬 Raciaux &amp; Classes</h2>
        <div className="overflow-x-auto">
          <table className="text-sm border-collapse">
            <thead>
              <tr>
                <th className="py-1 pr-3 text-left text-parchment/60">Race</th>
                {Object.keys(reference.equipements).map((m) => (
                  <th key={m} className="py-1 px-2 text-parchment/60 text-xs">
                    {m}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(reference.bonusRaciaux).map(([race, metiers]) => (
                <tr key={race} className="border-t border-border/30">
                  <td className="py-1 pr-3 font-display">{race}</td>
                  {Object.keys(reference.equipements).map((m) => (
                    <td key={m} className="py-1 px-2 text-center">
                      <div
                        className={`w-4 h-4 rounded mx-auto ${
                          metiers.includes(m) ? 'bg-green-500' : 'bg-border/30'
                        }`}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="font-display text-gold mb-2">📋 Sans métier</h2>
        {sansMetier.length === 0 ? (
          <div className="text-sm text-parchment/50">Aucun personnage sans métier.</div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {sansMetier.map((c) => (
              <span
                key={c.Nom}
                className="text-xs border border-border rounded px-2 py-1"
                style={{ color: CLASS_COLORS[c.Classe] || '#C8A84B' }}
              >
                {c.Nom} ({c.Classe})
              </span>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Manually verify**

Run: `npm run dev`, open `/metiers`. Expected: "Équipements métiers" table shows the 8 métiers from `data/metiers_reference.json`; "Raciaux & Classes" grid shows green cells matching `bonusRaciaux`; "Sans métier" lists characters whose both métiers are "Aucun" in the CSV.

- [ ] **Step 3: Commit**

```bash
git add src/pages/Metiers.tsx
git commit -m "feat: add static Équipements/Raciaux/Sans-métier sections to Métiers page"
```

---

### Task 11: Métiers page — Crafteurs/Pickeurs/Compteurs, interactivity, and export

**Files:**
- Create: `src/lib/exportAssignations.ts`
- Modify: `src/pages/Metiers.tsx`

**Interfaces:**
- Consumes: `useMetiersAssignations()` (Task 9), `derivePersonnesMetiers`/`deriveCompteurs` (Task 9).
- Produces: `exportAssignations(assignations: MetiersAssignations): Promise<void>`.

- [ ] **Step 1: Create `src/lib/exportAssignations.ts`**

```typescript
import type { MetiersAssignations } from '@/types/metiers';

export async function exportAssignations(assignations: MetiersAssignations): Promise<void> {
  const json = JSON.stringify(assignations, null, 2) + '\n';

  try {
    await navigator.clipboard.writeText(json);
  } catch {
    // Le presse-papier peut être refusé par le navigateur — le téléchargement reste le filet de sécurité.
  }

  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'metiers_assignations.json';
  a.click();
  URL.revokeObjectURL(url);
}
```

- [ ] **Step 2: Extend `src/pages/Metiers.tsx`** with the interactive sections

Add these imports at the top, alongside the existing ones from Task 10:
```tsx
import { useMetiersAssignations } from '@/hooks/useMetiersAssignations';
import { derivePersonnesMetiers, deriveCompteurs } from '@/lib/metiersDerivation';
import { exportAssignations } from '@/lib/exportAssignations';
```

Update the component body: add `const { assignations, status: assignStatus, toggleRole } = useMetiersAssignations();` next to the existing `useRoster`/`useMetiersReference` calls, include `assignStatus === 'loading'` in the loading guard, then compute:
```tsx
const personnesMetiers = derivePersonnesMetiers(data, assignations);
const crafteurs = personnesMetiers.filter((pm) => pm.role === 'crafteur');
const cueilleurs = personnesMetiers.filter((pm) => pm.role === 'cueilleur');
const compteurs = deriveCompteurs(personnesMetiers);
```

Insert this JSX as the first child of the returned `<div className="space-y-8">`, before the "Équipements métiers" section:
```tsx
<button
  className="border border-gold text-gold px-3 py-1.5 rounded text-sm hover:bg-gold/10 transition-colors"
  onClick={() => exportAssignations(assignations)}
>
  📋 Exporter les assignations
</button>
```

Insert these two sections between "Équipements métiers" and "Raciaux & Classes":
```tsx
<section>
  <h2 className="font-display text-gold mb-2">⭐ Crafteurs</h2>
  <div className="space-y-2">
    {crafteurs.map((pm) => {
      const eq = reference.equipements[pm.metier];
      const col = CLASS_COLORS[pm.personnage.Classe] || '#C8A84B';
      return (
        <div
          key={`${pm.personnage.Nom}-${pm.metier}`}
          className="flex flex-wrap items-center gap-3 border border-border-gold rounded p-2"
        >
          <button
            className="font-display px-2 py-1 rounded"
            style={{ color: col, background: `${col}22` }}
            onClick={() => toggleRole(pm.personnage.Nom, pm.metier)}
            title="Cliquer pour repasser en cueilleur"
          >
            {pm.personnage.Nom}
          </button>
          <div className="text-sm">{pm.metier}</div>
          {eq && (
            <div className="text-xs text-parchment/50">
              {eq.outil} · {eq.accessoire1} · {eq.accessoire2}
            </div>
          )}
        </div>
      );
    })}
    {crafteurs.length === 0 && <div className="text-sm text-parchment/50">Aucun crafteur désigné.</div>}
  </div>
</section>

<section>
  <h2 className="font-display text-gold mb-2">🌿 Pickeurs</h2>
  <div className="space-y-2">
    {cueilleurs.map((pm) => {
      const eq = reference.equipements[pm.metier];
      const col = CLASS_COLORS[pm.personnage.Classe] || '#C8A84B';
      return (
        <div
          key={`${pm.personnage.Nom}-${pm.metier}`}
          className="flex flex-wrap items-center gap-3 border border-border rounded p-2"
        >
          <button
            className="font-display px-2 py-1 rounded"
            style={{ color: col, background: `${col}18` }}
            onClick={() => toggleRole(pm.personnage.Nom, pm.metier)}
            title="Cliquer pour désigner comme crafteur"
          >
            {pm.personnage.Nom}
          </button>
          <div className="text-sm">{pm.metier}</div>
          {eq && (
            <div className="text-xs text-parchment/50">
              {eq.outil} · {eq.accessoire1} · {eq.accessoire2}
            </div>
          )}
        </div>
      );
    })}
    {cueilleurs.length === 0 && <div className="text-sm text-parchment/50">Aucun cueilleur.</div>}
  </div>
</section>

<section>
  <h2 className="font-display text-gold mb-2">📊 Compteur total &amp; cueilleurs</h2>
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Métier</TableHead>
        <TableHead>Total</TableHead>
        <TableHead>Cueilleurs</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {compteurs.map((c) => (
        <TableRow key={c.metier}>
          <TableCell className="font-display text-gold">{c.metier}</TableCell>
          <TableCell>{c.total}</TableCell>
          <TableCell>{c.cueilleurs}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
</section>
```

- [ ] **Step 3: Manually verify**

Run: `npm run dev`, open `/metiers`. Expected: "Crafteurs" shows Daarken under Enchantement (from `data/metiers_assignations.json`); "Pickeurs" shows everyone else practicing a craft/harvest métier; "Compteur total & cueilleurs" totals match `total = crafteurs.length + cueilleurs.length` per métier. Click a name in "Crafteurs" — it moves to "Pickeurs" and the compteur updates live; click it again in "Pickeurs" — it moves back. Click "📋 Exporter les assignations" — a `metiers_assignations.json` file downloads and (if clipboard permission is granted) the JSON is copied; open the downloaded file and confirm it reflects your last click.

- [ ] **Step 4: Commit**

```bash
git add src/lib/exportAssignations.ts src/pages/Metiers.tsx
git commit -m "feat: add Crafteurs/Pickeurs/Compteurs sections with interactive role toggling and export"
```

---

### Task 12: Builds page

**Files:**
- Modify: `src/pages/Builds.tsx`

**Interfaces:**
- Consumes: `dataUrl` (Task 3), `BuildsWowhead` (Task 3), `CLASS_COLORS` (Task 3).

- [ ] **Step 1: Implement `src/pages/Builds.tsx`**

```tsx
import { useEffect, useState } from 'react';
import { dataUrl } from '@/lib/dataUrls';
import { CLASS_COLORS } from '@/lib/wow-constants';
import type { BuildsWowhead } from '@/types/metiers';

type Status = 'loading' | 'ok' | 'error';

export function BuildsPage() {
  const [builds, setBuilds] = useState<BuildsWowhead>({});
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    fetch(dataUrl('builds_wowhead.json'))
      .then((res) => {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json() as Promise<BuildsWowhead>;
      })
      .then((json) => {
        setBuilds(json);
        setStatus('ok');
      })
      .catch(() => setStatus('error'));
  }, []);

  if (status === 'loading') return <div>Chargement...</div>;
  if (status === 'error') return <div>Impossible de charger les liens Wowhead.</div>;

  const classes = Object.keys(builds).sort();
  if (classes.length === 0) {
    return (
      <div className="text-sm text-parchment/50">
        Aucun build renseigné pour le moment — complète{' '}
        <code className="text-gold">data/builds_wowhead.json</code>.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {classes.map((cl) => {
        const col = CLASS_COLORS[cl] || '#C8A84B';
        return (
          <section key={cl}>
            <h2 className="font-display mb-2" style={{ color: col }}>
              {cl}
            </h2>
            <div className="space-y-2">
              {builds[cl].map((entry) => (
                <div
                  key={entry.spe}
                  className="flex flex-wrap items-center gap-3 border border-border rounded p-3"
                >
                  <div className="w-32 font-display">{entry.spe}</div>
                  <a
                    className="text-xs border border-gold text-gold rounded px-2 py-1 hover:bg-gold/10"
                    href={entry.build}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Build
                  </a>
                  <a
                    className="text-xs border border-gold text-gold rounded px-2 py-1 hover:bg-gold/10"
                    href={entry.rotation}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Rotation
                  </a>
                  <a
                    className="text-xs border border-gold text-gold rounded px-2 py-1 hover:bg-gold/10"
                    href={entry.stats}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Stats
                  </a>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Manually verify**

Run: `npm run dev`, open `/builds`. Expected: since `data/builds_wowhead.json` is `{}`, shows the "Aucun build renseigné..." empty state. To confirm the populated rendering path, temporarily edit `data/builds_wowhead.json` locally to
```json
{ "Guerrier": [{ "spe": "Fury", "build": "https://example.com", "rotation": "https://example.com", "stats": "https://example.com" }] }
```
reload, confirm the card and three buttons render and open in a new tab, then revert the file back to `{}` before committing.

- [ ] **Step 3: Commit**

```bash
git add src/pages/Builds.tsx
git commit -m "feat: implement Builds page"
```

---

### Task 13: Framer Motion animations

**Files:**
- Create: `src/layout/PageTransition.tsx`
- Modify: `src/layout/Layout.tsx`, `src/App.tsx`, `src/pages/Roster.tsx`, `src/pages/Classes.tsx`

**Interfaces:**
- Produces: `PageTransition` wrapper component used by `App.tsx` around routed pages.

- [ ] **Step 1: Create `src/layout/PageTransition.tsx`**

```tsx
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 2: Wire page transitions in `src/App.tsx`**

Replace the `<Routes>` block with `AnimatePresence` + `useLocation` so route changes animate:
```tsx
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { RosterProvider } from '@/context/RosterContext';
import { Layout } from '@/layout/Layout';
import { PageTransition } from '@/layout/PageTransition';
import { OverviewPage } from '@/pages/Overview';
import { ClassesPage } from '@/pages/Classes';
import { RosterPage } from '@/pages/Roster';
import { MetiersPage } from '@/pages/Metiers';
import { BuildsPage } from '@/pages/Builds';

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><OverviewPage /></PageTransition>} />
        <Route path="/classes" element={<PageTransition><ClassesPage /></PageTransition>} />
        <Route path="/roster" element={<PageTransition><RosterPage /></PageTransition>} />
        <Route path="/metiers" element={<PageTransition><MetiersPage /></PageTransition>} />
        <Route path="/builds" element={<PageTransition><BuildsPage /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <RosterProvider>
      <BrowserRouter basename="/data_classification_API_blizzard">
        <Layout>
          <AnimatedRoutes />
        </Layout>
      </BrowserRouter>
    </RosterProvider>
  );
}
```

- [ ] **Step 3: Animate filtered list reflow**

In `src/pages/Roster.tsx`, replace the outer character-list `<div>` (the one wrapping `list.map(...)`) with a `motion.div` layout group so rows reorder smoothly on search/filter changes. Import `{ motion, AnimatePresence }` from `framer-motion` at the top, then wrap the mapped rows:
```tsx
<AnimatePresence initial={false}>
  {list.map((c, i) => {
    const col = CLASS_COLORS[c.Classe] || '#C8A84B';
    const hi = i < 3 && !s && !classFilter;
    return (
      <motion.div
        key={c.Nom}
        layout
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className={`flex items-center gap-3 py-2 border-b border-border/50 ${hi ? 'bg-gold/5' : ''}`}
      >
        <div className="w-6 text-right" style={{ color: hi ? '#C8A84B' : '#555' }}>{i + 1}</div>
        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: col }} />
        <div className="flex-1 font-display" style={{ color: col }}>{c.Nom}</div>
        <div className="text-sm text-parchment/60">{c.Classe} · {c.Race} · Niv.{c.Niveau}</div>
        <div className="font-display text-gold">{c.iLvl}</div>
      </motion.div>
    );
  })}
</AnimatePresence>
```
Remove the now-redundant plain `<div>` wrapper this replaces.

Apply the same `motion.div` + `layout` treatment to the `BarRow` root `<div>` in `src/components/BarRow.tsx` (wrap its content in `motion.div` with `layout` prop) so Classes-page bars animate width/position smoothly when filters change.

- [ ] **Step 4: Manually verify**

Run: `npm run dev`. Click between nav tabs — expect a brief fade/slide transition instead of an instant swap. On `/roster`, type in the search box — rows fade out/reorder smoothly rather than snapping. On `/classes`, toggle a class filter — bar widths animate rather than jumping.

- [ ] **Step 5: Commit**

```bash
git add src/layout/PageTransition.tsx src/App.tsx src/pages/Roster.tsx src/components/BarRow.tsx
git commit -m "feat: add Framer Motion page transitions and animated list/bar reflow"
```

---

### Task 14: GitHub Actions build + deploy workflow

**Files:**
- Create: `.github/workflows/deploy.yml`

**Interfaces:**
- None (CI configuration only).

- [ ] **Step 1: Create `.github/workflows/deploy.yml`**

```yaml
name: Deploy Dashboard

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Manual GitHub Pages configuration (cannot be scripted)**

On GitHub: go to **Settings → Pages → Build and deployment → Source**, and switch it from "Deploy from a branch" to **"GitHub Actions"**. Without this change, Pages keeps serving the old branch-based build and ignores the new workflow.

- [ ] **Step 3: Manually verify**

Run: `npm run build` locally to confirm the exact command CI will run succeeds. Push the branch (or open the PR) and confirm in the Actions tab that the `Deploy Dashboard` workflow runs `build` then `deploy` successfully, and that the reported `page_url` serves the new React dashboard.

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: add build + deploy workflow for GitHub Pages"
```

---

### Task 15: README update and final end-to-end walkthrough

**Files:**
- Modify: `README.md`

**Interfaces:**
- None (documentation + final verification).

- [ ] **Step 1: Update `README.md`**

In the "Stack technique" table, change the "Visualisation" row from `Dashboard HTML/CSS/JS vanilla, lecture CSV distante` to `Dashboard React + Vite + Tailwind + shadcn/ui, lecture CSV/JSON distante (raw GitHub)`.

In "Structure du projet", replace the `└── index.html                # Dashboard web` line and surrounding tree with:
```
├── src/                       # Dashboard React (pages, composants, hooks, contexte roster)
├── data/
│   ├── mon_dataset_wow.csv    # Dataset généré automatiquement
│   ├── metiers_reference.json # Équipements métiers + bonus raciaux (référence statique)
│   ├── metiers_assignations.json # Rôles crafteur/cueilleur par personnage
│   └── builds_wowhead.json    # Liens Wowhead par classe + spécialisation
├── index.html                 # Entrée Vite
```

Add a short new subsection under "Dashboard" explaining local dev:
```markdown
### Développement local

\`\`\`bash
npm install
npm run dev
\`\`\`

Le serveur de dev sert `data/*.csv|json` directement depuis la racine du repo — aucune configuration supplémentaire nécessaire.
```

- [ ] **Step 2: Full manual walkthrough**

Run: `npm run dev`. Walk through every page:
- `/` — stats, champion, top 5, level distribution all populated.
- `/classes` — filters change every chart; empty-filter-result state works.
- `/roster` — search + class filter work, animated reflow.
- `/metiers` — all 6 sections render; clicking a name toggles role and updates counts live; export downloads a valid JSON matching current state.
- `/builds` — empty state shown (since `data/builds_wowhead.json` is `{}`).

Run: `npm run build && npm run preview`, repeat the same walkthrough against the production build to confirm nothing regresses (particularly the `dataUrl()` switch to the raw GitHub URL in prod — you should see network requests to `raw.githubusercontent.com`, not to `/data/*`).

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: update README for the React dashboard"
```

---

## Post-implementation follow-ups (not part of this plan — flag to the user)

- Verify `data/metiers_reference.json` content against the actual screenshot/game data (flagged in Task 8).
- Fill in `data/builds_wowhead.json` with real Wowhead URLs per class/spec.
- Switch the GitHub Pages source to "GitHub Actions" in repo settings (Task 14, Step 2) — this is a manual, one-time action outside of git.
- Commit the exported `metiers_assignations.json` after using the interactive UI in production, per the spec's manual-commit workflow.
