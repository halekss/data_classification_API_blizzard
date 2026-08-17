import type { MetiersAssignations } from '@/types/metiers';

export async function exportAssignations(assignations: MetiersAssignations): Promise<void> {
  const json = JSON.stringify(assignations, null, 2) + '\n';

  try {
    await navigator.clipboard.writeText(json);
  } catch {
    // Le presse-papier peut être refusé par le navigateur — le téléchargement reste le filet de sécurité.
  }

  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'metiers_assignations.json';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
