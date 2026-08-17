import { useCallback, useEffect, useState } from 'react';
import { dataUrl } from '@/lib/dataUrls';
import type { MetiersAssignations } from '@/types/metiers';

type Status = 'loading' | 'ok' | 'error';

export function useMetiersAssignations() {
  const [assignations, setAssignations] = useState<MetiersAssignations>({});
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
      const current = prev[nom] || [];
      const isCrafteur = current.includes(metier);
      const nextForNom = isCrafteur ? current.filter((m) => m !== metier) : [...current, metier];
      const next = { ...prev };
      if (nextForNom.length > 0) next[nom] = nextForNom;
      else delete next[nom];
      return next;
    });
  }, []);

  return { assignations, status, toggleRole };
}
