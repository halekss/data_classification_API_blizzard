import { useEffect, useState } from 'react';
import { dataUrl } from '@/lib/dataUrls';
import { CLASS_COLORS } from '@/lib/wow-constants';
import type { BuildsWowhead } from '@/types/metiers';

type Status = 'loading' | 'ok' | 'error';

export function BuildsPage() {
  const [builds, setBuilds] = useState<BuildsWowhead>({});
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    fetch(dataUrl('builds_wowhead.json'))
      .then((res) => {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json() as Promise<BuildsWowhead>;
      })
      .then((json) => {
        setBuilds(json);
        setStatus('ok');
      })
      .catch(() => setStatus('error'));
  }, []);

  if (status === 'loading') return <div>Chargement...</div>;
  if (status === 'error') return <div>Impossible de charger les liens Wowhead.</div>;

  const classes = Object.keys(builds).sort();
  if (classes.length === 0) {
    return (
      <div className="text-sm text-parchment/50">
        Aucun build renseigné pour le moment — complète{' '}
        <code className="text-gold">data/builds_wowhead.json</code>.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {classes.map((cl) => {
        const col = CLASS_COLORS[cl] || '#C8A84B';
        return (
          <section key={cl}>
            <h2 className="font-display text-lg mb-3" style={{ color: col }}>
              {cl}
            </h2>
            <div className="space-y-3">
              {builds[cl].map((entry) => (
                <div
                  key={entry.spe}
                  className="flex flex-wrap items-center justify-between gap-4 border border-border rounded p-4"
                >
                  <div className="font-display text-base">{entry.spe}</div>
                  <div className="flex flex-wrap gap-3">
                    <a
                      className="text-sm border border-gold text-gold rounded px-4 py-2 hover:bg-gold/10 transition-colors"
                      href={entry.build}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Build
                    </a>
                    <a
                      className="text-sm border border-gold text-gold rounded px-4 py-2 hover:bg-gold/10 transition-colors"
                      href={entry.rotation}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Rotation
                    </a>
                    <a
                      className="text-sm border border-gold text-gold rounded px-4 py-2 hover:bg-gold/10 transition-colors"
                      href={entry.stats}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Stats
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
