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
