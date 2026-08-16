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
