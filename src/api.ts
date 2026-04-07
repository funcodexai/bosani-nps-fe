/** Base URL API backend. Kosongkan string untuk path relatif (mis. nginx proxy /api). */
export function getApiBase(): string {
  const raw = import.meta.env.VITE_API_BASE;
  if (raw === undefined || raw === '') return '';
  return raw.replace(/\/$/, '');
}

export type NpsRow = {
  id?: number;
  instagram_account: string;
  score: number;
  [key: string]: unknown;
};

export async function fetchNpsByAccount(account: string): Promise<NpsRow[]> {
  const base = getApiBase();
  const path = `${base}/api/nps/${encodeURIComponent(account)}`;
  const res = await fetch(path);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? res.statusText);
  }
  return res.json();
}

export async function submitNps(
  instagram_account: string,
  score: number
): Promise<{ message: string; id: number }> {
  const base = getApiBase();
  const res = await fetch(`${base}/api/nps`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ instagram_account, score })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error ?? 'Gagal menyimpan');
  }
  return data as { message: string; id: number };
}
