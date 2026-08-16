import { useRoster } from '@/context/RosterContext';
import { useMetiersReference } from '@/hooks/useMetiersReference';
import { useMetiersAssignations } from '@/hooks/useMetiersAssignations';
import { personnesSansMetier, derivePersonnesMetiers, deriveCompteurs } from '@/lib/metiersDerivation';
import { exportAssignations } from '@/lib/exportAssignations';
import { CLASS_COLORS } from '@/lib/wow-constants';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

export function MetiersPage() {
  const { data, status: rosterStatus } = useRoster();
  const { reference, status: refStatus } = useMetiersReference();
  const { assignations, status: assignStatus, toggleRole } = useMetiersAssignations();

  if (rosterStatus === 'loading' || refStatus === 'loading' || assignStatus === 'loading')
    return <div>Chargement...</div>;
  if (rosterStatus === 'error' || !reference)
    return <div>Impossible de charger les données métiers.</div>;

  const sansMetier = personnesSansMetier(data);
  const personnesMetiers = derivePersonnesMetiers(data, assignations);
  const crafteurs = personnesMetiers.filter((pm) => pm.role === 'crafteur');
  const cueilleurs = personnesMetiers.filter((pm) => pm.role === 'cueilleur');
  const compteurs = deriveCompteurs(personnesMetiers);

  return (
    <div className="space-y-8">
      <button
        className="border border-gold text-gold px-3 py-1.5 rounded text-sm hover:bg-gold/10 transition-colors"
        onClick={() => exportAssignations(assignations)}
      >
        📋 Exporter les assignations
      </button>

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
