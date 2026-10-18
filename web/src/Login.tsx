import { useState } from 'react';
import type { Api } from './api';
import { Card } from './App';

// Supabase sender en mail med en 6-cifret kode (og et link, der også logger ind).
export default function Login({ api }: { api: Api }) {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(f: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try { await f(); } catch (e) { setError(danish((e as Error).message)); } finally { setBusy(false); }
  }

  return (
    <div className="mx-auto max-w-md pt-6">
      <Card className="p-7">
        <img src="./logo.jpg" alt="" className="mx-auto mb-4 h-24" />
        <h1 className="text-center text-2xl font-bold text-tc">Træningsgym</h1>
        <p className="mt-2 text-center text-sm text-slate-600">
          Rigtigt i første forsøg giver 30 point, andet forsøg 15 og tredje 5.
        </p>
        {!sent ? (
          <form className="mt-6 space-y-3" onSubmit={(e) => { e.preventDefault(); void run(async () => { await api.sendCode(email.trim()); setSent(true); }); }}>
            <label className="block text-sm font-medium" htmlFor="email">Din e-mail</label>
            <input id="email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 outline-none focus:border-tc focus:ring-2 focus:ring-tc/20" placeholder="navn@eksempel.dk" />
            <button disabled={busy} className="w-full rounded-lg bg-tc py-2.5 font-semibold text-white hover:bg-tc-dark disabled:opacity-60">
              {busy ? 'Sender …' : 'Send mig en kode'}
            </button>
          </form>
        ) : (
          <form className="mt-6 space-y-3" onSubmit={(e) => { e.preventDefault(); void run(() => api.verifyCode(email.trim(), code.trim())); }}>
            <p className="rounded-lg bg-tc-light p-3 text-sm">
              Vi har sendt en kode til <b>{email}</b>. Tjek også spam. Du kan også bare trykke på linket i mailen.
            </p>
            <label className="block text-sm font-medium" htmlFor="code">Kode fra mailen</label>
            <input id="code" inputMode="numeric" autoComplete="one-time-code" required value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-center font-mono text-2xl tracking-[0.4em] outline-none focus:border-tc focus:ring-2 focus:ring-tc/20" placeholder="••••••" />
            <button disabled={busy || code.length < 6} className="w-full rounded-lg bg-tc py-2.5 font-semibold text-white hover:bg-tc-dark disabled:opacity-60">
              {busy ? 'Logger ind …' : 'Log ind'}
            </button>
            <button type="button" className="w-full text-sm text-slate-500 hover:text-tc" onClick={() => { setSent(false); setCode(''); setError(null); }}>
              Brug en anden e-mail
            </button>
          </form>
        )}
        {error && <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      </Card>
    </div>
  );
}

function danish(msg: string): string {
  if (/expired|invalid/i.test(msg)) return 'Koden er forkert eller udløbet. Prøv igen, eller få en ny kode.';
  if (/rate limit|security purposes|too many/i.test(msg)) return 'Der er sendt for mange koder lige nu. Vent et minut og prøv igen.';
  if (/invalid.*email|valid email|Ugyldig e-mail/i.test(msg)) return 'Det ligner ikke en gyldig e-mailadresse.';
  return msg;
}
