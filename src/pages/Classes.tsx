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
