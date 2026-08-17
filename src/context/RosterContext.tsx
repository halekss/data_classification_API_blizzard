import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { parseCSV } from '@/lib/csv';
import { dataUrl } from '@/lib/dataUrls';
import type { Character } from '@/types/character';

type Status = 'loading' | 'ok' | 'error';

interface RosterContextValue {
  data: Character[];
  status: Status;
  errorMessage: string | null;
  reload: () => void;
}

const RosterContext = createContext<RosterContextValue | undefined>(undefined);

const REFRESH_INTERVAL_MS = 60 * 60 * 1000;

export function RosterProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Character[]>([]);
  const [status, setStatus] = useState<Status>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function load() {
    setStatus('loading');
    try {
      const res = await fetch(dataUrl('mon_dataset_wow.csv') + '?t=' + Date.now());
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const text = await res.text();
      const parsed = parseCSV(text);
      if (parsed.length === 0) throw new Error('CSV vide');
      setData(parsed);
      setStatus('ok');
      setErrorMessage(null);
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : String(err));
    }
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  return (
    <RosterContext.Provider value={{ data, status, errorMessage, reload: load }}>
      {children}
    </RosterContext.Provider>
  );
}

export function useRoster() {
  const ctx = useContext(RosterContext);
  if (!ctx) throw new Error('useRoster must be used within a RosterProvider');
  return ctx;
}
