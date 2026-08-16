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
