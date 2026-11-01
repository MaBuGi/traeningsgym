import { useCallback, useEffect, useState } from 'react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { Api, Scoreboard, ScoreRow, Week } from './api';
import { Card, Spinner } from './App';

const MEDAL = ['#e0a526', '#9aa6ad', '#b8743c'];
const day = new Intl.DateTimeFormat('da-DK', { day: 'numeric', month: 'short', timeZone: 'Europe/Copenhagen' });
const dayTime = new Intl.DateTimeFormat('da-DK', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Copenhagen' });

// Top 3 over alle uger. Vises kun på admin-siden.
export default function ScoreboardView({ api, weeks }: { api: Api; weeks: Week[] }) {
  const [data, setData] = useState<Scoreboard | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setData(await api.scoreboard(null));
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  }, [api]);
  useEffect(() => {
    setData(null);
    void load();
    const t = setInterval(load, 30_000);
    return () => clearInterval(t);
  }, [load]);

  const end = Date.now();
  const start = Math.min(end, ...weeks.map((w) => new Date(w.opens_at).getTime()));

  const top = data?.rows.filter((r) => r.pos <= 3) ?? [];

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-tc">Scoreboard</h2>
      {error && <Card className="text-sm text-red-700">{error}</Card>}
      {!data && !error && <Spinner />}
      {data && (
        <>
          <div className="grid items-end gap-4 sm:grid-cols-3">
            {[0, 1, 2].map((i) => <Podium key={i} row={top[i]} place={i + 1} />)}
          </div>

          <Card>
            <h2 className="mb-1 font-semibold text-tc">Point over tid</h2>
            <p className="mb-4 text-xs text-slate-500">Top 3 over alle uger. Opdateres automatisk.</p>
            <div className="h-80 w-full">
              <ResponsiveContainer>
                <LineChart data={merged(chartRows(data.rows), start, end)} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                  <XAxis dataKey="t" type="number" scale="time" domain={[start, end]} ticks={dayTicks(start, end)} tickFormatter={(t) => day.format(t)} tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} width={44} />
                  <Tooltip labelFormatter={(t) => dayTime.format(t as number)} formatter={(v, n) => [`${v} point`, n]} />
                  <Legend />
                  {chartRows(data.rows).map((r, i) => (
                    <Line key={r.name} name={r.name} dataKey={`k${i}`} type="stepAfter"
                      stroke={MEDAL[r.pos - 1]} strokeWidth={2.5} dot={false} isAnimationActive={false} />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

function chartRows(rows: ScoreRow[]) {
  return rows.filter((r) => r.pos <= 3 && r.points > 0);
}

// Kumulerede point som trapper på én fælles tidsakse (så tooltippen viser alles point på samme tidspunkt):
// 0 ved start, et trin pr. rigtigt svar, vandret ud til nu.
function merged(rows: ScoreRow[], start: number, end: number) {
  const ser = rows.map((r) => r.series.map((s) => ({ t: new Date(s.t).getTime(), p: s.p })));
  const times = [...new Set([start, ...ser.flat().map((s) => s.t), end])].sort((a, b) => a - b);
  return times.map((t) => {
    const point: Record<string, number> = { t };
    ser.forEach((s, i) => { point[`k${i}`] = s.filter((x) => x.t <= t).at(-1)?.p ?? 0; });
    return point;
  });
}

// Én akse-mærkat pr. døgn (lokal midnat), højst ca. 8 stk.
function dayTicks(start: number, end: number) {
  const d = new Date(start);
  d.setHours(0, 0, 0, 0);
  const ticks: number[] = [];
  for (d.setDate(d.getDate() + 1); d.getTime() <= end; d.setDate(d.getDate() + 1)) ticks.push(d.getTime());
  const step = Math.ceil(ticks.length / 8);
  return ticks.filter((_, i) => i % step === 0);
}

function Podium({ row, place }: { row?: ScoreRow; place: number }) {
  // Podiet: 2 – 1 – 3 på bred skærm, 1 – 2 – 3 under hinanden på mobil.
  const height = ['sm:pt-10', 'sm:pt-6', 'sm:pt-4'][place - 1];
  return (
    <div className={['order-1 sm:order-2', 'order-2 sm:order-1', 'order-3'][place - 1]}>
      <Card className={'text-center ' + height}>
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full text-xl font-black text-white shadow"
          style={{ background: MEDAL[place - 1] }}>{place}</div>
        <div className="mt-3 truncate text-lg font-bold">{row ? row.name : '–'}</div>
        <div className="text-2xl font-bold tabular-nums text-tc">{row ? row.points : 0}</div>
        <div className="text-xs text-slate-500">point</div>
      </Card>
    </div>
  );
}
