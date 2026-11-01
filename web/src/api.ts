// Alt hjemmesiden henter og sender, samlet ét sted. Den rigtige udgave taler med Supabase;
// `npm run dev:mock` bruger i stedet mock.ts (samme schema.sql i en Postgres i browseren).
import { createClient } from '@supabase/supabase-js';

export type Week = { id: number; topic: string; title: string; opens_at: string };
export type Problem = { id: string; week_id: number; nr: number; source: string; text: string; opts: string[]; figure: string | null };
export type Attempt = { problem_id: string; letter: string; correct: boolean; points: number; created_at: string };
export type SubmitResult = { correct: boolean; points: number; wrong_left: number };
export type ScoreRow = { name: string; points: number; rank: number; pos: number; me: boolean; series: { t: string; p: number }[] };
export type Scoreboard = { participants: number; rows: ScoreRow[] };
export type AdminCell = { letters: string; points: number; solved: boolean };
export type AdminUser = {
  email: string; name: string | null; joined: string; last_login: string | null;
  points: number; total: number; last_activity: string | null; cells: Record<string, AdminCell>;
};
export type AdminProgress = { problems: { id: string; nr: number; source: string; answer: string }[]; users: AdminUser[] };
export type User = { id: string; email: string };

export interface Api {
  mock: boolean;
  currentUser(): Promise<User | null>;
  onAuthChange(cb: (u: User | null) => void): () => void;
  sendCode(email: string): Promise<void>;
  verifyCode(email: string, code: string): Promise<void>;
  signOut(): Promise<void>;
  getProfile(): Promise<string | null>;
  saveProfile(name: string): Promise<void>;
  weeks(): Promise<Week[]>;
  problems(week: number): Promise<Problem[]>;
  attempts(): Promise<Attempt[]>; // alle deltagerens egne forsøg, på tværs af uger
  submit(problem: string, letter: string): Promise<SubmitResult>;
  scoreboard(week: number | null): Promise<Scoreboard>;
  isAdmin(): Promise<boolean>;
  adminProgress(week: number): Promise<AdminProgress>;
}

function fail(error: { message: string; code?: string } | null): void {
  if (!error) return;
  if (error.code === '23505') throw new Error('Det navn er taget. Vælg et andet.');
  throw new Error(error.message);
}

export function supabaseApi(url: string, key: string): Api {
  const sb = createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
  const toUser = (u: { id: string; email?: string } | null | undefined): User | null => (u ? { id: u.id, email: u.email ?? '' } : null);
  return {
    mock: false,
    async currentUser() {
      const { data } = await sb.auth.getSession();
      return toUser(data.session?.user);
    },
    onAuthChange(cb) {
      const { data } = sb.auth.onAuthStateChange((_e, s) => cb(toUser(s?.user)));
      return () => data.subscription.unsubscribe();
    },
    async sendCode(email) {
      const { error } = await sb.auth.signInWithOtp({ email, options: { shouldCreateUser: true, emailRedirectTo: location.origin + location.pathname } });
      fail(error);
    },
    async verifyCode(email, code) {
      const { error } = await sb.auth.verifyOtp({ email, token: code, type: 'email' });
      fail(error);
    },
    async signOut() {
      await sb.auth.signOut();
    },
    async getProfile() {
      const { data, error } = await sb.from('profiles').select('display_name').maybeSingle();
      fail(error);
      return data?.display_name ?? null;
    },
    async saveProfile(name) {
      const { data: s } = await sb.auth.getSession();
      const { error } = await sb.from('profiles').upsert({ user_id: s.session!.user.id, display_name: name.trim() });
      fail(error);
    },
    async weeks() {
      const { data, error } = await sb.from('weeks').select('*').order('id');
      fail(error);
      return data ?? [];
    },
    async problems(week) {
      const { data, error } = await sb.from('problems').select('*').eq('week_id', week).order('nr');
      fail(error);
      return data ?? [];
    },
    async attempts() {
      const { data, error } = await sb.from('attempts').select('problem_id, letter, correct, points, created_at').order('created_at');
      fail(error);
      return data ?? [];
    },
    async submit(problem, letter) {
      const { data, error } = await sb.rpc('submit_answer', { p_problem: problem, p_letter: letter });
      fail(error);
      return data as SubmitResult;
    },
    async scoreboard(week) {
      const { data, error } = await sb.rpc('scoreboard', { p_week: week });
      fail(error);
      return (data as Scoreboard) ?? { participants: 0, rows: [] };
    },
    async isAdmin() {
      const { data } = await sb.rpc('is_admin');
      return data === true;
    },
    async adminProgress(week) {
      const { data, error } = await sb.rpc('admin_progress', { p_week: week });
      fail(error);
      return data as AdminProgress;
    },
  };
}

// Kun én forbindelse pr. side (React StrictMode kører effekter to gange i udvikling).
let made: Promise<Api> | null = null;
export function makeApi(): Promise<Api> {
  return (made ??= create());
}

async function create(): Promise<Api> {
  if (import.meta.env.VITE_MOCK === '1') {
    const { mockApi } = await import('./mock');
    return mockApi();
  }
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  if (!url || !key) throw new Error('VITE_SUPABASE_URL og VITE_SUPABASE_ANON_KEY mangler (se .env.example).');
  return supabaseApi(url, key);
}
