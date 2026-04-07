function apiBaseFromRuntime(): string | null {
  if (typeof window === 'undefined') return null;
  const v = (window as Window & { __BOSANI_API_BASE__?: string }).__BOSANI_API_BASE__;
  if (typeof v !== 'string') return null;
  const t = v.trim();
  if (t === '') return null;
  return t.replace(/\/$/, '');
}

/**
 * Prioritas: `public/api-config.js` (window.__BOSANI_API_BASE__) → VITE_API_BASE → '' (relatif).
 */
export function getApiBase(): string {
  const rt = apiBaseFromRuntime();
  if (rt !== null) return rt;
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
