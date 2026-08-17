import { useCallback, useEffect, useState } from 'react';
import { dataUrl } from '@/lib/dataUrls';
import type { MetiersAssignations } from '@/types/metiers';

type Status = 'loading' | 'ok' | 'error';

const EMPTY: MetiersAssignations = { crafteurs: {}, pickeursInactifs: [] };

export function useMetiersAssignations() {
  const [assignations, setAssignations] = useState<MetiersAssignations>(EMPTY);
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    fetch(dataUrl('metiers_assignations.json'))
      .then((res) => {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json() as Promise<MetiersAssignations>;
      })
      .then((json) => {
        setAssignations(json);
        setStatus('ok');
      })
      .catch(() => setStatus('error'));
  }, []);

  const toggleRole = useCallback((nom: string, metier: string) => {
    setAssignations((prev) => {
      const current = prev.crafteurs[nom] || [];
      const isCrafteur = current.includes(metier);
      const nextForNom = isCrafteur ? current.filter((m) => m !== metier) : [...current, metier];
      const nextCrafteurs = { ...prev.crafteurs };
      if (nextForNom.length > 0) nextCrafteurs[nom] = nextForNom;
      else delete nextCrafteurs[nom];
      return { ...prev, crafteurs: nextCrafteurs };
    });
  }, []);

  const toggleActif = useCallback((nom: string) => {
    setAssignations((prev) => {
      const isInactif = prev.pickeursInactifs.includes(nom);
      const nextInactifs = isInactif
        ? prev.pickeursInactifs.filter((n) => n !== nom)
        : [...prev.pickeursInactifs, nom];
      return { ...prev, pickeursInactifs: nextInactifs };
    });
  }, []);

  return { assignations, status, toggleRole, toggleActif };
}
