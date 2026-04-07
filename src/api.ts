export type NpsRow = {
  id?: number;
  instagram_account: string;
  score: number;
  [key: string]: unknown;
};

export async function fetchNpsByAccount(account: string): Promise<NpsRow[]> {
  const res = await fetch(`/api/nps/${encodeURIComponent(account)}`);
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
  const res = await fetch('/api/nps', {
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
