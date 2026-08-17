import type { Character } from '@/types/character';

export function parseCSV(text: string): Character[] {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',').map((h) => h.trim());
  return lines
    .slice(1)
    .map((line) => {
      const vals = line.split(',').map((v) => v.trim());
      const obj: Record<string, string> = {};
      headers.forEach((h, i) => {
        obj[h] = vals[i] || '';
      });
      return {
        Nom: obj['Nom'] || '',
        Classe: obj['Classe'] || '',
        Race: obj['Race'] || '',
        Faction: obj['Faction'] || 'Inconnue',
        Niveau: parseInt(obj['Niveau'], 10) || 0,
        iLvl: parseInt(obj['iLvl'], 10) || 0,
        'Métier 1': obj['Métier 1'] || 'Aucun',
        'Métier 2': obj['Métier 2'] || 'Aucun',
      };
    })
    .filter((c) => c.Nom);
}
