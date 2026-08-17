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
