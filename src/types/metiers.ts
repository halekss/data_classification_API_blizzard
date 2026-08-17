export interface MetierEquipement {
  outil: string;
  accessoire1: string;
  accessoire2: string;
}

export interface MetiersReference {
  equipements: Record<string, MetierEquipement>;
  bonusRaciaux: Record<string, string[]>;
}

export interface MetiersAssignations {
  crafteurs: Record<string, string[]>;
  pickeursInactifs: string[];
}

export interface BuildEntry {
  spe: string;
  build: string;
  rotation: string;
  stats: string;
}

export type BuildsWowhead = Record<string, BuildEntry[]>;
