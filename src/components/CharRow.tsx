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
