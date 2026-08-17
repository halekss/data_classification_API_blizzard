import { NavLink } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useRoster } from '@/context/RosterContext';
import bgWow from '@/assets/bg-wow.webp';

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
    <div className="min-h-screen relative">
      <div
        className="fixed inset-0 bg-cover bg-top bg-fixed z-0 pointer-events-none"
        style={{ backgroundImage: `url(${bgWow})` }}
      />
      <div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{
          background:
            'linear-gradient(180deg, rgba(10,8,18,0.55) 0%, rgba(10,8,18,0.82) 60%, rgba(10,8,18,0.97) 100%)',
        }}
      />
      <div className="relative z-10">
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
    </div>
  );
}
