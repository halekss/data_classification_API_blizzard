import { useRoster } from '@/context/RosterContext';
import { useMetiersReference } from '@/hooks/useMetiersReference';
import { useMetiersAssignations } from '@/hooks/useMetiersAssignations';
import {
  personnesSansMetier,
  derivePersonnesMetiers,
  groupPickeursByPersonnage,
  deriveCompteurs,
} from '@/lib/metiersDerivation';
import { exportAssignations } from '@/lib/exportAssignations';
import { CLASS_COLORS } from '@/lib/wow-constants';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

export function MetiersPage() {
  const { data, status: rosterStatus } = useRoster();
  const { reference, status: refStatus } = useMetiersReference();
  const { assignations, status: assignStatus, toggleRole, toggleActif } = useMetiersAssignations();

  if (rosterStatus === 'loading' || refStatus === 'loading' || assignStatus === 'loading')
    return <div>Chargement...</div>;
  if (rosterStatus === 'error' || assignStatus === 'error' || !reference)
    return <div>Impossible de charger les données métiers.</div>;

  const sansMetier = personnesSansMetier(data);
  const personnesMetiers = derivePersonnesMetiers(data, assignations);
  const crafteurs = personnesMetiers.filter((pm) => pm.role === 'crafteur');
  const pickeurs = groupPickeursByPersonnage(personnesMetiers);
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
        <p className="text-sm text-parchment/50 mb-2">Métier de craft fixe — toujours comptés, pas de saisonnalité.</p>
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
                  <div className="text-sm text-parchment/50">
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
        <p className="text-sm text-parchment/50 mb-2">
          Décoche un personnage que tu ne joues plus cette saison pour le retirer du compteur de cueilleurs actifs.
        </p>
        <div className="space-y-2">
          {pickeurs.map((pg) => {
            const col = CLASS_COLORS[pg.personnage.Classe] || '#C8A84B';
            return (
              <div
                key={pg.personnage.Nom}
                className={`flex flex-wrap items-center gap-3 border rounded p-2 ${
                  pg.actif ? 'border-border' : 'border-border/30 opacity-50'
                }`}
              >
                <label className="flex items-center gap-2 cursor-pointer" title="Actif cette saison">
                  <input
                    type="checkbox"
                    checked={pg.actif}
                    onChange={() => toggleActif(pg.personnage.Nom)}
                    className="accent-gold w-4 h-4"
                  />
                  <span className="font-display" style={{ color: col }}>
                    {pg.personnage.Nom}
                  </span>
                </label>
                <div className="text-sm">{pg.metiers.join(' · ')}</div>
                {pg.metiers.map((m) => {
                  const eq = reference.equipements[m];
                  if (!eq) return null;
                  return (
                    <div key={m} className="text-sm text-parchment/50">
                      {m} : {eq.outil} · {eq.accessoire1} · {eq.accessoire2}
                    </div>
                  );
                })}
              </div>
            );
          })}
          {pickeurs.length === 0 && <div className="text-sm text-parchment/50">Aucun cueilleur.</div>}
        </div>
      </section>

      <section>
        <h2 className="font-display text-gold mb-2">📊 Compteur cueilleurs actifs &amp; total</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Métier</TableHead>
              <TableHead>Cueilleurs actifs</TableHead>
              <TableHead>Total (actifs + crafteurs)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {compteurs.map((c) => (
              <TableRow key={c.metier}>
                <TableCell className="font-display text-gold">{c.metier}</TableCell>
                <TableCell>{c.cueilleursActifs}</TableCell>
                <TableCell>{c.total}</TableCell>
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
                  <th key={m} className="py-1 px-2 text-parchment/60 text-sm">
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
                className="text-sm border border-border rounded px-2 py-1"
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
