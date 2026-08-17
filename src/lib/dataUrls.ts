const GITHUB_RAW_BASE =
  'https://raw.githubusercontent.com/halekss/data_classification_API_blizzard/main/data';

export function dataUrl(filename: string): string {
  return import.meta.env.DEV ? `/data/${filename}` : `${GITHUB_RAW_BASE}/${filename}`;
}
