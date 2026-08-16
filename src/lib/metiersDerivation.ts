import type { Character } from '@/types/character';
import type { MetiersAssignations } from '@/types/metiers';
import { CRAFT, HARVEST } from '@/lib/wow-constants';

export interface PersonneMetier {
  personnage: Character;
  metier: string;
  role: 'crafteur' | 'cueilleur';
}

export interface MetierCompteur {
  metier: string;
  total: number;
  cueilleurs: number;
}

export function derivePersonnesMetiers(
  data: Character[],
  assignations: MetiersAssignations
): PersonneMetier[] {
  const result: PersonneMetier[] = [];
  data.forEach((c) => {
    [c['Métier 1'], c['Métier 2']].forEach((m) => {
      if (!m || m === 'Aucun') return;
      if (!CRAFT.includes(m) && !HARVEST.includes(m)) return;
      const estCrafteur = (assignations[c.Nom] || []).includes(m);
      result.push({ personnage: c, metier: m, role: estCrafteur ? 'crafteur' : 'cueilleur' });
    });
  });
  return result;
}

export function deriveCompteurs(personnesMetiers: PersonneMetier[]): MetierCompteur[] {
  const map = new Map<string, MetierCompteur>();
  personnesMetiers.forEach(({ metier, role }) => {
    const entry = map.get(metier) || { metier, total: 0, cueilleurs: 0 };
    entry.total += 1;
    if (role === 'cueilleur') entry.cueilleurs += 1;
    map.set(metier, entry);
  });
  return [...map.values()].sort((a, b) => b.total - a.total);
}

export function personnesSansMetier(data: Character[]): Character[] {
  return data.filter(
    (c) =>
      (c['Métier 1'] === 'Aucun' || !c['Métier 1']) && (c['Métier 2'] === 'Aucun' || !c['Métier 2'])
  );
}
