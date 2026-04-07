import { useCallback, useState } from 'react';
import { fetchNpsByAccount, getApiBase, submitNps, type NpsRow } from './api';
import './App.css';

const MIN_SCORE = 0;
const MAX_SCORE = 10;

function normalizeAccount(raw: string): string {
  return raw.trim().replace(/^@/, '');
}

export default function App() {
  const [account, setAccount] = useState('');
  const [score, setScore] = useState<number>(10);
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [lookupAccount, setLookupAccount] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState<string | null>(null);
  const [rows, setRows] = useState<NpsRow[] | null>(null);

  const onSubmitScore = async (e: React.FormEvent) => {
    e.preventDefault();
    const ig = normalizeAccount(account);
    if (!ig) {
      setSubmitError('Isi akun Instagram.');
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    setSubmitMessage(null);
    try {
      const r = await submitNps(ig, score);
      setSubmitMessage(`Tersimpan (id: ${r.id}).`);
      setAccount('');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Terjadi kesalahan');
    } finally {
      setSubmitting(false);
    }
  };

  const onLookup = useCallback(async () => {
    const ig = normalizeAccount(lookupAccount);
    if (!ig) {
      setLookupError('Isi akun untuk pencarian.');
      setRows(null);
      return;
    }
    setLookupLoading(true);
    setLookupError(null);
    setRows(null);
    try {
      const data = await fetchNpsByAccount(ig);
      setRows(data);
    } catch (err) {
      setLookupError(err instanceof Error ? err.message : 'Gagal memuat data');
    } finally {
      setLookupLoading(false);
    }
  }, [lookupAccount]);

  return (
    <div className="layout">
      <header className="hero">
        <p className="eyebrow">Bosani · Net Promoter Score</p>
        <h1>Beri skor kepuasan</h1>
        <p className="lede">
          Backend mengikuti API di <code>bosani-nps</code>: kirim skor 0–10 per akun
          Instagram, atau lihat riwayat skor untuk satu akun.
        </p>
        {import.meta.env.PROD && (
          <p className="api-base-hint" role="status">
            API: <code>{getApiBase() || '(origin ini — set di api-config.js)'}</code>
          </p>
        )}
      </header>

      <main className="grid">
        <section className="card" aria-labelledby="form-title">
          <h2 id="form-title">Kirim skor NPS</h2>
          <form className="form" onSubmit={onSubmitScore}>
            <label className="field">
              <span>Akun Instagram</span>
              <input
                type="text"
                name="instagram_account"
                autoComplete="username"
                placeholder="@username atau username"
                value={account}
                onChange={(e) => setAccount(e.target.value)}
              />
            </label>
            <label className="field">
              <span>
                Skor ({MIN_SCORE}–{MAX_SCORE})
              </span>
              <div className="score-row">
                <input
                  type="range"
                  min={MIN_SCORE}
                  max={MAX_SCORE}
                  value={score}
                  onChange={(e) => setScore(Number(e.target.value))}
                />
                <output className="score-badge">{score}</output>
              </div>
            </label>
            <button type="submit" className="btn primary" disabled={submitting}>
              {submitting ? 'Menyimpan…' : 'Kirim'}
            </button>
            {submitMessage && <p className="msg success">{submitMessage}</p>}
            {submitError && <p className="msg error">{submitError}</p>}
          </form>
        </section>

        <section className="card" aria-labelledby="lookup-title">
          <h2 id="lookup-title">Lihat skor per akun</h2>
          <div className="lookup">
            <label className="field">
              <span>Akun Instagram</span>
              <input
                type="text"
                placeholder="@username"
                value={lookupAccount}
                onChange={(e) => setLookupAccount(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    void onLookup();
                  }
                }}
              />
            </label>
            <button type="button" className="btn secondary" onClick={() => void onLookup()} disabled={lookupLoading}>
              {lookupLoading ? 'Memuat…' : 'Cari'}
            </button>
          </div>
          {lookupError && <p className="msg error">{lookupError}</p>}
          {rows && (
            <div className="table-wrap">
              {rows.length === 0 ? (
                <p className="empty">Belum ada skor untuk akun ini.</p>
              ) : (
                <table className="data">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Akun</th>
                      <th>Skor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, i) => (
                      <tr key={row.id ?? i}>
                        <td>{String(row.id ?? '—')}</td>
                        <td>{String(row.instagram_account)}</td>
                        <td>{String(row.score)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </section>
      </main>

      <footer className="foot">
        <p>
          Beda VM: isi <code>public/api-config.js</code> (URL backend), deploy <code>dist</code>, lalu
          di backend set <code>FRONTEND_ORIGIN</code> ke URL frontend atau{' '}
          <code>CORS_REFLECT_ORIGIN=true</code> (hanya lab).
        </p>
      </footer>
    </div>
  );
}
