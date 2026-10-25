import { useCallback, useEffect, useMemo, useState } from 'react';
import type { AdminCell, AdminProgress, AdminUser, Api, Week } from './api';
import { Card, Spinner } from './App';
import { WeekTabs, defaultWeek } from './Problems';
import { fmtDateTime } from './format';
import ScoreboardView from './Scoreboard';

type Sort = 'point' | 'navn' | 'aktivitet';

export default function Admin({ api, weeks }: { api: Api; weeks: Week[] }) {
  const [weekId, setWeekId] = useState<number | null>(() => defaultWeek(weeks) ?? weeks[0]?.id ?? null);
  const [data, setData] = useState<AdminProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sort, setSort] = useState<Sort>('point');

  const load = useCallback(async () => {
    if (weekId == null) return;
    try {
      setData(await api.adminProgress(weekId));
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  }, [api, weekId]);
  useEffect(() => {
    setData(null);
    void load();
    const t = setInterval(load, 60_000);
    return () => clearInterval(t);
  }, [load]);

  const users = useMemo(() => {
    const u = [...(data?.users ?? [])];
    if (sort === 'navn') u.sort((a, b) => (a.name ?? a.email).localeCompare(b.name ?? b.email, 'da'));
    if (sort === 'aktivitet') u.sort((a, b) => (b.last_activity ?? '').localeCompare(a.last_activity ?? ''));
    return u;
  }, [data, sort]);

  const started = users.filter((u) => Object.keys(u.cells).length > 0);
  const idle = users.filter((u) => Object.keys(u.cells).length === 0);

  return (
    <div className="space-y-5">
      <WeekTabs weeks={weeks} value={weekId} onChange={(id) => id != null && setWeekId(id)} />
      {error && <Card className="text-sm text-red-700">{error}</Card>}
      {!data && !error && <Spinner />}
      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-4">
            <Box label="Tilmeldte" value={users.length} />
            <Box label="I gang denne uge" value={started.length} />
            <Box label="Ikke startet" value={idle.length} />
            <Box label="Gns. point (i gang)" value={started.length ? Math.round(started.reduce((s, u) => s + u.points, 0) / started.length) : 0} />
          </div>

          {weekId != null && <ScoreboardView api={api} weeks={weeks} weekId={weekId} />}

          <Card className="p-0">
            <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 px-4 py-3">
              <h2 className="font-semibold text-tc">Fremskridt</h2>
              <Legend />
              <div className="ml-auto flex items-center gap-2 text-sm">
                <label htmlFor="sort" className="text-slate-500">Sortér</label>
                <select id="sort" value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="rounded-md border border-slate-300 px-2 py-1">
                  <option value="point">point</option><option value="navn">navn</option><option value="aktivitet">seneste aktivitet</option>
                </select>
                <button onClick={() => downloadCsv(data, users, weekId!)} className="rounded-md bg-tc px-3 py-1 font-medium text-white hover:bg-tc-dark">CSV</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500">
                    <th className="sticky left-0 z-10 bg-slate-50 px-3 py-2 text-left font-semibold">Deltager</th>
                    <th className="px-2 py-2 text-right font-semibold">Uge</th>
                    <th className="px-2 py-2 text-right font-semibold">Total</th>
                    {data.problems.map((p) => (
                      <th key={p.id} className="w-7 px-0.5 py-2 text-center font-semibold" title={`${p.source} · svar ${p.answer}`}>{p.nr}</th>
                    ))}
                    <th className="px-3 py-2 text-left font-semibold">Seneste svar</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.email} className="border-t border-slate-100 hover:bg-slate-50/60">
                      <td className="sticky left-0 z-10 max-w-56 bg-white px-3 py-1.5">
                        <div className="truncate font-medium">{u.name ?? <i className="text-slate-400">intet navn</i>}</div>
                        <div className="truncate text-[11px] text-slate-500">{u.email}</div>
                      </td>
                      <td className="px-2 text-right text-sm font-bold tabular-nums text-tc">{u.points}</td>
                      <td className="px-2 text-right tabular-nums text-slate-600">{u.total}</td>
                      {data.problems.map((p) => <Cell key={p.id} cell={u.cells[p.id]} answer={p.answer} />)}
                      <td className="whitespace-nowrap px-3 text-slate-500">{fmtDateTime(u.last_activity)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-slate-200 bg-slate-50 text-slate-500">
                    <td className="sticky left-0 bg-slate-50 px-3 py-2 font-semibold">Løst af</td><td /><td />
                    {data.problems.map((p) => {
                      const n = started.filter((u) => u.cells[p.id]?.solved).length;
                      return <td key={p.id} className="text-center tabular-nums" title={`${n} af ${started.length}`}>{started.length ? Math.round((100 * n) / started.length) : 0}%</td>;
                    })}
                    <td />
                  </tr>
                  <tr className="bg-slate-50 text-slate-500">
                    <td className="sticky left-0 bg-slate-50 px-3 pb-2 font-semibold">Svar</td><td /><td />
                    {data.problems.map((p) => <td key={p.id} className="pb-2 text-center font-mono font-semibold text-tc">{p.answer}</td>)}
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>

          {idle.length > 0 && (
            <Card>
              <h2 className="font-semibold text-tc">Ikke startet på uge {weekId}</h2>
              <ul className="mt-2 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2 lg:grid-cols-3">
                {idle.map((u) => (
                  <li key={u.email} className="truncate">
                    {u.name ?? <i className="text-slate-400">intet navn</i>} <span className="text-slate-500">· {u.email}</span>
                    <span className="text-xs text-slate-400"> · sidst logget ind {fmtDateTime(u.last_login)}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

const SOLVED: Record<number, string> = { 30: 'bg-emerald-600 text-white', 15: 'bg-emerald-400 text-white', 5: 'bg-emerald-200 text-emerald-900' };

function Cell({ cell, answer }: { cell?: AdminCell; answer: string }) {
  if (!cell) return <td className="p-0.5"><div className="h-6 rounded bg-slate-100" /></td>;
  const locked = !cell.solved && cell.letters.length >= 3;
  const cls = cell.solved ? SOLVED[cell.points] : locked ? 'bg-rose-500 text-white' : 'bg-amber-200 text-amber-900';
  const label = cell.solved ? cell.points : locked ? '✗' : cell.letters.length;
  return (
    <td className="p-0.5" title={`Svar: ${cell.letters.split('').join(', ')} (rigtigt: ${answer})`}>
      <div className={'flex h-6 items-center justify-center rounded text-[11px] font-semibold ' + cls}>{label}</div>
    </td>
  );
}

function Legend() {
  const items: [string, string][] = [['bg-emerald-600', '30'], ['bg-emerald-400', '15'], ['bg-emerald-200', '5'], ['bg-amber-200', 'i gang'], ['bg-rose-500', 'låst'], ['bg-slate-100', 'ikke set']];
  return (
    <div className="flex flex-wrap gap-3 text-xs text-slate-500">
      {items.map(([c, l]) => <span key={l} className="flex items-center gap-1"><span className={'inline-block h-3 w-3 rounded-sm ' + c} />{l}</span>)}
    </div>
  );
}

function Box({ label, value }: { label: string; value: number }) {
  return (
    <Card className="py-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div className="text-3xl font-bold tabular-nums text-tc">{value}</div>
    </Card>
  );
}

function downloadCsv(data: AdminProgress, users: AdminUser[], week: number) {
  const head = ['navn', 'email', 'point_uge', 'point_total', 'seneste_svar', ...data.problems.map((p) => `opg${p.nr}`)];
  const rows = users.map((u) => [u.name ?? '', u.email, u.points, u.total, u.last_activity ?? '',
    ...data.problems.map((p) => { const c = u.cells[p.id]; return c ? `${c.letters}:${c.points}` : ''; })]);
  const csv = [head, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(';')).join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
  a.download = `traeningsgym-uge${week}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
}
