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
