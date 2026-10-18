import { useState } from 'react';
import type { Api } from './api';
import { Card } from './App';

export default function NameSetup({ api, email, onDone }: { api: Api; email: string; onDone: (name: string) => void }) {
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const valid = name.trim().length >= 2 && name.trim().length <= 24;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api.saveProfile(name);
      onDone(name.trim());
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md pt-6">
      <Card className="p-7">
        <h1 className="text-xl font-bold text-tc">Velkommen!</h1>
        <p className="mt-2 text-sm text-slate-600">
          Du er logget ind som <b>{email}</b>. Vælg det navn, de andre ser på scoreboardet. Din e-mail bliver ikke vist.
        </p>
        <form className="mt-5 space-y-3" onSubmit={save}>
          <label className="block text-sm font-medium" htmlFor="name">Navn på scoreboardet</label>
          <input id="name" maxLength={24} required value={name} onChange={(e) => setName(e.target.value)} autoFocus
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-tc focus:ring-2 focus:ring-tc/20" placeholder="Fx dit fornavn" />
          <button disabled={busy || !valid} className="w-full rounded-lg bg-tc py-2.5 font-semibold text-white hover:bg-tc-dark disabled:opacity-60">
            {busy ? 'Gemmer …' : 'Kom i gang'}
          </button>
        </form>
        {error && <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      </Card>
    </div>
  );
}
