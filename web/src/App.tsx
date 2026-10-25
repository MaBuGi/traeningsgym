import { useCallback, useEffect, useState } from 'react';
import { makeApi, type Api, type User, type Week } from './api';
import Login from './Login';
import NameSetup from './NameSetup';
import Problems from './Problems';
import Admin from './Admin';

type Tab = 'opgaver' | 'admin';
const tabFromHash = (): Tab => {
  const h = location.hash.replace('#', '');
  return h === 'admin' ? h : 'opgaver';
};

export default function App() {
  const [api, setApi] = useState<Api | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [name, setName] = useState<string | null | undefined>(undefined);
  const [admin, setAdmin] = useState(false);
  const [weeks, setWeeks] = useState<Week[]>([]);
  const [tab, setTab] = useState<Tab>(tabFromHash());

  useEffect(() => {
    makeApi().then(setApi).catch((e) => setError(String(e.message ?? e)));
    const onHash = () => setTab(tabFromHash());
    addEventListener('hashchange', onHash);
    return () => removeEventListener('hashchange', onHash);
  }, []);

  useEffect(() => {
    if (!api) return;
    api.currentUser().then(setUser);
    return api.onAuthChange((u) => setUser((old) => (old?.id === u?.id ? old : u)));
  }, [api]);

  const loadUser = useCallback(async () => {
    if (!api || !user) return;
    setName(undefined);
    try {
      const [n, a, w] = await Promise.all([api.getProfile(), api.isAdmin(), api.weeks()]);
      setName(n);
      setAdmin(a);
      setWeeks(w);
    } catch (e) {
      setError((e as Error).message);
    }
  }, [api, user]);
  useEffect(() => { void loadUser(); }, [loadUser]);

  const go = (t: Tab) => { location.hash = t; setTab(t); };

  if (error) return <Shell><Card><h2 className="text-lg font-semibold text-red-700">Noget gik galt</h2><p className="mt-2 text-sm">{error}</p></Card></Shell>;
  if (!api || user === undefined || (user && name === undefined)) return <Shell><Spinner /></Shell>;
  if (!user) return <Shell><Login api={api} /></Shell>;
  if (!name) return <Shell><NameSetup api={api} email={user.email} onDone={(n) => setName(n)} /></Shell>;

  const shown: Tab = tab === 'admin' && !admin ? 'opgaver' : tab;
  return (
    <Shell
      nav={
        <>
          <NavButton active={shown === 'opgaver'} onClick={() => go('opgaver')}>Opgaver</NavButton>
          {admin && <NavButton active={shown === 'admin'} onClick={() => go('admin')}>Admin</NavButton>}
        </>
      }
      right={
        <div className="flex items-center gap-3 text-sm">
          <span className="hidden font-medium sm:inline">{name}</span>
          <button className="rounded-md px-2 py-1 text-white/80 hover:bg-white/10 hover:text-white" onClick={() => api.signOut()}>Log ud</button>
        </div>
      }
      mock={api.mock}
    >
      {shown === 'opgaver' && <Problems api={api} weeks={weeks} />}
      {shown === 'admin' && <Admin api={api} weeks={weeks} />}
    </Shell>
  );
}

function Shell({ children, nav, right, mock }: { children: React.ReactNode; nav?: React.ReactNode; right?: React.ReactNode; mock?: boolean }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-tc text-white shadow">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <a href="#opgaver" className="flex items-center gap-3">
            <img src="./logo.jpg" alt="TalentCamp" className="h-10 w-10 rounded-full bg-white object-cover object-top p-0.5" />
            <div className="leading-tight">
              <div className="text-lg font-bold tracking-tight">Træningsgym</div>
              <div className="text-xs text-white/70">TalentCamp · Mentorgruppen</div>
            </div>
          </a>
          <nav className="order-3 flex w-full gap-1 sm:order-none sm:w-auto">{nav}</nav>
          <div className="ml-auto">{right}</div>
        </div>
        {mock && <div className="bg-amber-400 px-4 py-1 text-center text-xs font-semibold text-amber-950">Testtilstand: data ligger kun i denne browser. Login-kode: 123456</div>}
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
      <footer className="py-6 text-center text-xs text-slate-500">
        Opgaverne er fra Abelkonkurrencens første runde, oversat til dansk. · <a className="underline" href="https://talentcamp.dk" target="_blank" rel="noreferrer">talentcamp.dk</a>
      </footer>
    </div>
  );
}

function NavButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className={'rounded-md px-3 py-1.5 text-sm font-medium transition ' + (active ? 'bg-white text-tc' : 'text-white/85 hover:bg-white/10')}>
      {children}
    </button>
  );
}

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={'rounded-xl border border-slate-200 bg-white p-5 shadow-sm ' + (className ?? '')}>{children}</div>;
}

export function Spinner() {
  return <div className="flex justify-center py-16"><div className="h-8 w-8 animate-spin rounded-full border-4 border-tc-light border-t-tc" /></div>;
}
