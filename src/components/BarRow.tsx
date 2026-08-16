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
