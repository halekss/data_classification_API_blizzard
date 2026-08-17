import type { Character } from '@/types/character';
import type { MetiersAssignations } from '@/types/metiers';
import { CRAFT, HARVEST } from '@/lib/wow-constants';

export interface PersonneMetier {
  personnage: Character;
  metier: string;
  role: 'crafteur' | 'cueilleur';
  actif: boolean;
}

export interface PickeurGroupe {
  personnage: Character;
  metiers: string[];
  actif: boolean;
}

export interface MetierCompteur {
  metier: string;
  cueilleursActifs: number;
  total: number;
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
      const estCrafteur = (assignations.crafteurs[c.Nom] || []).includes(m);
      const actif = !assignations.pickeursInactifs.includes(c.Nom);
      result.push({ personnage: c, metier: m, role: estCrafteur ? 'crafteur' : 'cueilleur', actif });
    });
  });
  return result;
}

export function groupPickeursByPersonnage(personnesMetiers: PersonneMetier[]): PickeurGroupe[] {
  const map = new Map<string, PickeurGroupe>();
  personnesMetiers
    .filter((pm) => pm.role === 'cueilleur')
    .forEach((pm) => {
      const entry = map.get(pm.personnage.Nom) || {
        personnage: pm.personnage,
        metiers: [],
        actif: pm.actif,
      };
      entry.metiers.push(pm.metier);
      map.set(pm.personnage.Nom, entry);
    });
  return [...map.values()].sort((a, b) => a.personnage.Nom.localeCompare(b.personnage.Nom, 'fr'));
}

export function deriveCompteurs(personnesMetiers: PersonneMetier[]): MetierCompteur[] {
  const map = new Map<string, MetierCompteur>();
  personnesMetiers.forEach(({ metier, role, actif }) => {
    const entry = map.get(metier) || { metier, cueilleursActifs: 0, total: 0 };
    if (role === 'crafteur') {
      entry.total += 1;
    } else if (actif) {
      entry.cueilleursActifs += 1;
      entry.total += 1;
    }
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
