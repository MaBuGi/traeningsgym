// Kun til lokal afprøvning (`npm run dev:mock`): den rigtige schema.sql + seed.sql kører i PGlite (Postgres i
// browseren) bag en efterligning af Supabase-auth. Login: en vilkårlig e-mail og koden 123456.
// Kommer aldrig med i `npm run build`, fordi makeApi kun importerer filen, når VITE_MOCK=1.
import { PGlite } from '@electric-sql/pglite';
import shim from '../../test/auth_shim.sql?raw';
import schema from '../../supabase/schema.sql?raw';
import seed from '../../supabase/seed.sql?raw';
import type { Api, User } from './api';

const KEY = 'traeningsgym-mock-user';
const DEMO = ['Asger', 'Freja', 'Malthe', 'Ida', 'Viktor', 'Clara', 'Oskar', 'Alma'];

export async function mockApi(): Promise<Api> {
  const db = new PGlite('idb://traeningsgym-mock');
  const fresh = !(await db.query(`select 1 from pg_tables where tablename = 'attempts'`)).rows.length;
  if (fresh) {
    await db.exec(shim);
    await db.exec(schema);
    await db.exec(seed);
    // Datoerne fra seed.sql bevares, bortset fra at uge 1 altid er åben, når mocken oprettes.
    await db.exec(`update weeks set opens_at = now() - interval '2 days' where id = 1`);
    await demoData(db);
  }

  (window as unknown as { mockDb: PGlite }).mockDb = db; // til fejlsøgning i konsollen
  let user: User | null = JSON.parse(localStorage.getItem(KEY) ?? 'null');
  const listeners = new Set<(u: User | null) => void>();
  const setUser = (u: User | null) => {
    user = u;
    localStorage.setItem(KEY, JSON.stringify(u));
    listeners.forEach((cb) => cb(u));
  };

  async function q<T>(sql: string, params: unknown[] = []): Promise<T[]> {
    try {
      return await db.transaction(async (tx) => {
        await tx.query(`select set_config('request.jwt.claims', $1, true)`,
          [JSON.stringify(user ? { sub: user.id, email: user.email, role: 'authenticated' } : {})]);
        await tx.exec(`set local role ${user ? 'authenticated' : 'anon'}`);
        return (await tx.query<T>(sql, params)).rows;
      });
    } catch (e) {
      const err = e as { message: string; code?: string };
      if (err.code === '23505') throw new Error('Det navn er taget. Vælg et andet.');
      throw new Error(err.message);
    }
  }
  const one = async <T>(sql: string, params: unknown[] = []) => (await q<{ r: T }>(sql, params))[0]?.r;

  return {
    mock: true,
    async currentUser() { return user; },
    onAuthChange(cb) { listeners.add(cb); return () => listeners.delete(cb); },
    async sendCode(email) {
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error('Ugyldig e-mail');
    },
    async verifyCode(email, code) {
      if (code !== '123456') throw new Error('Token has expired or is invalid');
      const e = email.trim().toLowerCase();
      await db.query(`insert into auth.users (email) values ($1) on conflict (email) do nothing`, [e]);
      await db.query(`update auth.users set last_sign_in_at = now() where email = $1`, [e]);
      const id = (await db.query<{ id: string }>(`select id from auth.users where email = $1`, [e])).rows[0].id;
      setUser({ id, email: e });
    },
    async signOut() { setUser(null); },
    async getProfile() {
      return (await q<{ display_name: string }>(`select display_name from profiles`))[0]?.display_name ?? null;
    },
    async saveProfile(name) {
      await q(`insert into profiles (user_id, display_name) values (auth.uid(), $1)
               on conflict (user_id) do update set display_name = excluded.display_name`, [name.trim()]);
    },
    weeks: () => q(`select * from weeks order by id`),
    problems: (week) => q(`select * from problems where week_id = $1 order by nr`, [week]),
    attempts: () => q(`select problem_id, letter, correct, points, created_at from attempts order by created_at`),
    submit: (problem, letter) => one(`select submit_answer($1, $2) as r`, [problem, letter]),
    scoreboard: (week) => one(`select scoreboard($1) as r`, [week]),
    isAdmin: () => one(`select is_admin() as r`),
    adminProgress: (week) => one(`select admin_progress($1) as r`, [week]),
  };
}

// Otte opdigtede deltagere, der har løst noget af uge 1 i løbet af de sidste to dage.
async function demoData(db: PGlite) {
  const probs = (await db.query<{ id: string; letter: string }>(
    `select p.id, a.letter from problems p join answers a on a.problem_id = p.id where p.week_id = 1 order by p.nr`)).rows;
  let seedN = 7;
  const rnd = () => ((seedN = (seedN * 16807) % 2147483647) / 2147483647);
  for (const [i, name] of DEMO.entries()) {
    const id = (await db.query<{ id: string }>(`insert into auth.users (email, last_sign_in_at) values ($1, now()) returning id`,
      [`${name.toLowerCase()}@example.dk`])).rows[0].id;
    await db.query(`insert into profiles (user_id, display_name) values ($1, $2)`, [id, name]);
    const skill = 0.35 + 0.08 * i;
    const n = Math.floor(probs.length * (0.2 + 0.6 * rnd()));
    let t = Date.now() - 48 * 3600e3 * (0.4 + 0.6 * rnd());
    for (const p of probs.slice(0, n)) {
      const wrong = 'ABCDE'.split('').filter((l) => l !== p.letter);
      for (let k = 0; k < 3; k++) {
        t += 4 * 60e3 * (1 + 5 * rnd());
        const right = rnd() < skill;
        const letter = right ? p.letter : wrong[k];
        const pts = right ? [30, 15, 5][k] : 0;
        await db.query(`insert into attempts (user_id, problem_id, letter, correct, points, created_at) values ($1, $2, $3, $4, $5, $6)`,
          [id, p.id, letter, right, pts, new Date(Math.min(t, Date.now() - 60e3)).toISOString()]);
        if (right) break;
      }
    }
  }
}
