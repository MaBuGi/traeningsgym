import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Api, Attempt, Problem, Week } from './api';
import { Card, Spinner } from './App';
import MathHtml from './MathHtml';
import { fmtDate } from './format';

export const POINTS = [30, 15, 5];
const LETTERS = ['A', 'B', 'C', 'D', 'E'];

export function hasOpened(w: Week, now = Date.now()) {
  return new Date(w.opens_at).getTime() <= now;
}
// Den uge, man lander på: den senest åbnede.
export function defaultWeek(weeks: Week[]): number | null {
  return weeks.filter((w) => hasOpened(w)).at(-1)?.id ?? null;
}

type Filter = 'alle' | 'mangler' | 'loest';

export default function Problems({ api, weeks }: { api: Api; weeks: Week[] }) {
  const [weekId, setWeekId] = useState<number | null>(() => defaultWeek(weeks));
  const [problems, setProblems] = useState<Problem[] | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [filter, setFilter] = useState<Filter>('alle');
  const [error, setError] = useState<string | null>(null);
  const week = weeks.find((w) => w.id === weekId) ?? null;

  const load = useCallback(async () => {
    if (weekId == null) return;
    setProblems(null);
    setError(null);
    try {
      const [p, a] = await Promise.all([api.problems(weekId), api.attempts()]);
      setProblems(p);
      setAttempts(a);
    } catch (e) {
      setError((e as Error).message);
    }
  }, [api, weekId]);
  useEffect(() => { void load(); }, [load]);

  const byProblem = useMemo(() => {
    const m: Record<string, Attempt[]> = {};
    for (const a of attempts) (m[a.problem_id] ??= []).push(a);
    return m;
  }, [attempts]);

  const stats = useMemo(() => {
    // Point tælles over alle uger; løst og låst gælder kun den valgte uge.
    const points = attempts.reduce((s, a) => s + a.points, 0);
    let solved = 0, locked = 0;
    for (const p of problems ?? []) {
      const list = byProblem[p.id] ?? [];
      if (list.some((a) => a.correct)) solved++;
      else if (list.length >= 3) locked++;
    }
    return { points, solved, locked };
  }, [attempts, byProblem, problems]);

  if (weekId == null || !week) {
    const next = weeks[0];
    return (
      <Card className="text-center">
        <h2 className="text-lg font-semibold text-tc">Ingen opgaver endnu</h2>
        {next && <p className="mt-2 text-sm text-slate-600">Første uge ({next.title}) åbner {fmtDate(next.opens_at)}.</p>}
      </Card>
    );
  }

  const total = problems?.length ?? 30;
  const shown = (problems ?? []).filter((p) => {
    const list = byProblem[p.id] ?? [];
    const done = list.some((a) => a.correct) || list.length >= 3;
    return filter === 'alle' || (filter === 'loest' ? done : !done);
  });

  return (
    <div className="space-y-5">
      <WeekTabs weeks={weeks} value={weekId} onChange={(id) => { setWeekId(id); setFilter('alle'); }} />

      <Card className="flex flex-wrap items-center gap-x-8 gap-y-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">Uge {week.id} · {week.title}</div>
          <div className="mt-0.5 text-sm text-slate-600">
            Åben. Opgaverne kan løses når som helst.
          </div>
        </div>
        <Stat label="Point i alt" value={stats.points} big />
        <Stat label="Løst" value={`${stats.solved}/${total}`} />
        <Stat label="Låst" value={stats.locked} />
        <div className="min-w-40 flex-1">
          <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-tc transition-all" style={{ width: `${(100 * stats.solved) / total}%` }} />
          </div>
          <div className="mt-1 text-right text-xs text-slate-500">{Math.round((100 * stats.solved) / total)} % løst</div>
        </div>
      </Card>

      <div className="flex gap-1 text-sm">
        {([['alle', 'Alle'], ['mangler', 'Mangler'], ['loest', 'Færdige']] as [Filter, string][]).map(([k, label]) => (
          <button key={k} onClick={() => setFilter(k)}
            className={'rounded-full px-3 py-1 ' + (filter === k ? 'bg-tc text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-tc')}>
            {label}
          </button>
        ))}
      </div>

      {error && <Card className="text-sm text-red-700">{error}</Card>}
      {!problems && !error && <Spinner />}
      <div className="grid gap-4 lg:grid-cols-2">
        {shown.map((p) => (
          <ProblemCard key={p.id} api={api} problem={p} attempts={byProblem[p.id] ?? []}
            onAttempt={(a) => setAttempts((old) => [...old, a])} />
        ))}
      </div>
      {problems && shown.length === 0 && <p className="py-8 text-center text-sm text-slate-500">Ingen opgaver her.</p>}
    </div>
  );
}

export function WeekTabs({ weeks, value, onChange, all }: { weeks: Week[]; value: number | null; onChange: (id: number | null) => void; all?: boolean }) {
  return (
    <div className="flex flex-wrap gap-2">
      {all && (
        <button onClick={() => onChange(null)}
          className={'rounded-lg px-3 py-2 text-sm font-medium ' + (value === null ? 'bg-tc text-white shadow' : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:ring-tc')}>
          Alle uger
        </button>
      )}
      {weeks.map((w) => {
        const opened = hasOpened(w);
        return (
          <button key={w.id} disabled={!opened} onClick={() => onChange(w.id)}
            className={'rounded-lg px-3 py-2 text-left text-sm ' + (value === w.id ? 'bg-tc text-white shadow' : opened ? 'bg-white text-slate-700 ring-1 ring-slate-200 hover:ring-tc' : 'cursor-not-allowed bg-slate-100 text-slate-400')}>
            <div className="font-medium">Uge {w.id} · {w.title}</div>
            <div className="text-xs opacity-75">{opened ? 'åben' : `åbner ${fmtDate(w.opens_at)}`}</div>
          </button>
        );
      })}
    </div>
  );
}

function Stat({ label, value, big }: { label: string; value: number | string; big?: boolean }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div className={(big ? 'text-3xl text-tc' : 'text-2xl') + ' font-bold tabular-nums'}>{value}</div>
    </div>
  );
}

function ProblemCard({ api, problem, attempts, onAttempt }: {
  api: Api; problem: Problem; attempts: Attempt[]; onAttempt: (a: Attempt) => void;
}) {
  const [choice, setChoice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const solvedBy = attempts.find((a) => a.correct);
  const wrong = attempts.filter((a) => !a.correct).map((a) => a.letter);
  const locked = !solvedBy && wrong.length >= 3;
  const canAnswer = !solvedBy && !locked;
  const worth = POINTS[wrong.length] ?? 0;

  async function send() {
    if (!choice) return;
    setBusy(true);
    setMsg(null);
    try {
      const r = await api.submit(problem.id, choice);
      onAttempt({ problem_id: problem.id, letter: choice, correct: r.correct, points: r.points, created_at: new Date().toISOString() });
      setMsg(r.correct
        ? { ok: true, text: `Rigtigt! +${r.points} point` }
        : { ok: false, text: r.wrong_left > 0 ? `Desværre forkert. ${r.wrong_left} forsøg tilbage.` : 'Desværre forkert. Opgaven er nu låst.' });
      setChoice(null);
    } catch (e) {
      setMsg({ ok: false, text: (e as Error).message });
    } finally {
      setBusy(false);
    }
  }

  const ring = solvedBy ? 'ring-2 ring-emerald-500/60' : locked ? 'ring-2 ring-rose-400/50' : '';
  return (
    <Card className={'flex flex-col ' + ring}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="text-lg font-bold text-tc">Opgave {problem.nr}</div>
          <div className="text-xs text-slate-500">{problem.source}</div>
        </div>
        {solvedBy ? <Badge color="emerald">✓ +{solvedBy.points} point</Badge>
          : locked ? <Badge color="rose">Låst · 0 point</Badge>
          : <Badge color="slate">{3 - wrong.length} forsøg · {worth} point</Badge>}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <MathHtml html={problem.text} className="flex-1 leading-relaxed" />
        {problem.figure && <img src={`./fig/${problem.figure}`} alt="Figur" className="mx-auto max-h-48 self-start sm:max-w-[42%]" loading="lazy" />}
      </div>

      <div className="mt-4 grid gap-2">
        {problem.opts.map((o, i) => {
          const L = LETTERS[i];
          const tried = wrong.includes(L);
          const isRight = solvedBy?.letter === L; // kun deltagerens eget rigtige svar
          const selected = choice === L;
          const cls = isRight ? 'border-emerald-500 bg-emerald-50'
            : tried ? 'border-rose-200 bg-rose-50 text-slate-400 line-through decoration-rose-300'
            : selected ? 'border-tc bg-tc-light ring-2 ring-tc/30'
            : canAnswer ? 'border-slate-200 hover:border-tc hover:bg-slate-50' : 'border-slate-200';
          return (
            <button key={L} disabled={!canAnswer || tried || busy} onClick={() => setChoice(selected ? null : L)}
              className={'flex items-center gap-3 rounded-lg border px-3 py-2 text-left transition disabled:cursor-default ' + cls}>
              <span className={'flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-sm font-bold '
                + (isRight ? 'bg-emerald-500 text-white' : selected ? 'bg-tc text-white' : tried ? 'bg-rose-200 text-rose-700' : 'bg-slate-100 text-tc')}>
                {L}
              </span>
              <MathHtml html={o} inline className="no-underline" />
            </button>
          );
        })}
      </div>

      {canAnswer && (
        <div className="mt-3 flex items-center gap-3">
          <button disabled={!choice || busy} onClick={send}
            className="rounded-lg bg-tc px-4 py-2 text-sm font-semibold text-white hover:bg-tc-dark disabled:opacity-40">
            {busy ? 'Tjekker …' : choice ? `Indsend ${choice}` : 'Vælg et svar'}
          </button>
          <span className="text-xs text-slate-500">Rigtigt nu giver {worth} point</span>
        </div>
      )}
      {msg && <p className={'mt-3 rounded-lg px-3 py-2 text-sm font-medium ' + (msg.ok ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800')}>{msg.text}</p>}
    </Card>
  );
}

function Badge({ color, children }: { color: 'emerald' | 'rose' | 'slate'; children: React.ReactNode }) {
  const c = { emerald: 'bg-emerald-100 text-emerald-800', rose: 'bg-rose-100 text-rose-700', slate: 'bg-slate-100 text-slate-600' }[color];
  return <span className={'shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ' + c}>{children}</span>;
}
