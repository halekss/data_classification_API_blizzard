import { useEffect, useState } from 'react';
import { dataUrl } from '@/lib/dataUrls';
import type { MetiersReference } from '@/types/metiers';

type Status = 'loading' | 'ok' | 'error';

export function useMetiersReference() {
  const [reference, setReference] = useState<MetiersReference | null>(null);
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    fetch(dataUrl('metiers_reference.json'))
      .then((res) => {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json() as Promise<MetiersReference>;
      })
      .then((json) => {
        setReference(json);
        setStatus('ok');
      })
      .catch(() => setStatus('error'));
  }, []);

  return { reference, status };
}
