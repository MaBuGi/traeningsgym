-- Træningsgym: tabeller, adgangsregler og funktioner.
-- Køres én gang i Supabase → SQL Editor (kan køres igen; den sletter ingen data). Kør derefter seed.sql.
--
-- Sikkerhedsmodellen:
--   * Svarene (answers) og andres forsøg forlader aldrig serveren. Deltagerne kan kun læse ugens opgaver,
--     deres egen profil og deres egne forsøg.
--   * Et forsøg kan kun indsendes gennem submit_answer(), som tjekker svaret og giver point (30/15/5).
--   * scoreboard() viser kun visningsnavne, aldrig e-mails. admin_progress() virker kun for e-mails i admins.

create table if not exists public.weeks (
  id        int primary key,
  topic     text not null,
  title     text not null,
  opens_at  timestamptz not null,
  closes_at timestamptz not null
);

create table if not exists public.problems (
  id      text primary key,                 -- fx 'algebra/2005-1'
  week_id int not null references public.weeks(id) on delete cascade,
  nr      int not null,                     -- 1–30 inden for ugen
  source  text not null,                    -- fx 'Abel 2005/06, opg. 1'
  text    text not null,                    -- HTML med KaTeX-matematik i \( \)
  opts    jsonb not null,                   -- fem svarmuligheder A–E
  figure  text,                             -- filnavn i web/public/fig
  unique (week_id, nr)
);

create table if not exists public.answers (
  problem_id text primary key references public.problems(id) on delete cascade,
  letter     text not null check (letter in ('A', 'B', 'C', 'D', 'E'))
);

create table if not exists public.profiles (
  user_id      uuid primary key references auth.users(id) on delete cascade,
  display_name text not null check (char_length(btrim(display_name)) between 2 and 24),
  created_at   timestamptz not null default now()
);
create unique index if not exists profiles_name_idx on public.profiles (lower(btrim(display_name)));

create table if not exists public.attempts (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  problem_id text not null references public.problems(id) on delete cascade,
  letter     text not null check (letter in ('A', 'B', 'C', 'D', 'E')),
  correct    boolean not null,
  points     int not null,
  created_at timestamptz not null default now(),
  unique (user_id, problem_id, letter)
);
create index if not exists attempts_problem_idx on public.attempts (problem_id);

create table if not exists public.admins (
  email text primary key
);
insert into public.admins (email) values ('mathiasbuhlgilje@gmail.com'), ('nc@talentcamp.dk'), ('alexanderbilleandersen@outlook.dk') on conflict do nothing;

-- ------------------------------------------------------------------ adgang

alter table public.weeks    enable row level security;
alter table public.problems enable row level security;
alter table public.answers  enable row level security;
alter table public.profiles enable row level security;
alter table public.attempts enable row level security;
alter table public.admins   enable row level security;

-- Supabase giver som standard anon/authenticated fulde rettigheder på nye tabeller; vi giver kun det nødvendige.
revoke all on public.weeks, public.problems, public.answers, public.profiles, public.attempts, public.admins
  from anon, authenticated;
grant select on public.weeks, public.problems, public.attempts to authenticated;
grant select, insert, update on public.profiles to authenticated;

drop policy if exists weeks_read on public.weeks;
create policy weeks_read on public.weeks for select to authenticated using (true);

drop policy if exists problems_read on public.problems;
create policy problems_read on public.problems for select to authenticated
  using (exists (select 1 from public.weeks w where w.id = week_id and w.opens_at <= now()));

drop policy if exists profiles_own on public.profiles;
create policy profiles_own on public.profiles for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists attempts_own on public.attempts;
create policy attempts_own on public.attempts for select to authenticated using (user_id = auth.uid());

-- answers og admins har ingen policies: kun funktionerne nedenfor (security definer) kan læse dem.

-- ------------------------------------------------------------------ funktioner

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins a where lower(a.email) = lower(auth.jwt() ->> 'email'));
$$;

-- Indsend et svar. Returnerer {correct, points, wrong_left}, aldrig det rigtige bogstav.
create or replace function public.submit_answer(p_problem text, p_letter text) returns json
language plpgsql volatile security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  w public.weeks;
  n_wrong int;
  solved boolean;
  right_letter text;
  ok boolean;
  pts int;
begin
  if uid is null then
    raise exception 'Du er ikke logget ind.';
  end if;
  if not exists (select 1 from public.profiles where user_id = uid) then
    raise exception 'Vælg et navn, før du svarer.';
  end if;
  p_letter := upper(btrim(p_letter));
  if p_letter is null or p_letter not in ('A', 'B', 'C', 'D', 'E') then
    raise exception 'Ugyldigt svar.';
  end if;

  select w2.* into w from public.problems p join public.weeks w2 on w2.id = p.week_id where p.id = p_problem;
  if not found or now() < w.opens_at then
    raise exception 'Ukendt opgave.';
  end if;
  if now() >= w.closes_at then
    raise exception 'Ugen er lukket.';
  end if;

  -- To hurtige klik på samme opgave må ikke begge blive talt som "første forsøg".
  perform pg_advisory_xact_lock(hashtext(uid::text || p_problem));

  select count(*) filter (where not a.correct), coalesce(bool_or(a.correct), false)
    into n_wrong, solved
    from public.attempts a where a.user_id = uid and a.problem_id = p_problem;
  if solved then
    raise exception 'Du har allerede løst opgaven.';
  end if;
  if n_wrong >= 3 then
    raise exception 'Du har ikke flere forsøg på denne opgave.';
  end if;
  if exists (select 1 from public.attempts a where a.user_id = uid and a.problem_id = p_problem and a.letter = p_letter) then
    raise exception 'Du har allerede prøvet %.', p_letter;
  end if;

  select letter into right_letter from public.answers where problem_id = p_problem;
  ok := p_letter = right_letter;
  pts := case when ok then (array[30, 15, 5])[n_wrong + 1] else 0 end;
  insert into public.attempts (user_id, problem_id, letter, correct, points) values (uid, p_problem, p_letter, ok, pts);
  return json_build_object('correct', ok, 'points', pts, 'wrong_left', 3 - n_wrong - (case when ok then 0 else 1 end));
end;
$$;

-- De rigtige svar, men kun for uger der er lukket.
create or replace function public.week_answers(p_week int)
returns table (problem_id text, letter text)
language sql stable security definer set search_path = public as $$
  select a.problem_id, a.letter
  from public.answers a join public.problems p on p.id = a.problem_id join public.weeks w on w.id = p.week_id
  where p.week_id = p_week and w.closes_at <= now() and auth.uid() is not null;
$$;

-- Top 3 og den indloggede deltager, med kumulerede point over tid til grafen. p_week null = alle uger.
-- Administratorer tæller ikke med (de må gerne prøve opgaverne uden at ligge på listen).
create or replace function public.scoreboard(p_week int default null) returns json
language sql stable security definer set search_path = public as $$
  with players as (
    select pr.user_id, pr.display_name
    from public.profiles pr join auth.users au on au.id = pr.user_id
    where not exists (select 1 from public.admins a where lower(a.email) = lower(au.email))
  ),
  scored as (
    select a.user_id, a.points, a.created_at
    from public.attempts a join public.problems p on p.id = a.problem_id
    where a.points > 0 and (p_week is null or p.week_id = p_week)
  ),
  totals as (
    select pr.user_id, pr.display_name,
           coalesce(sum(s.points), 0)::int as points,
           max(s.created_at) as reached_at
    from players pr left join scored s on s.user_id = pr.user_id
    group by pr.user_id, pr.display_name
  ),
  ranked as (
    select t.*,
           rank() over (order by t.points desc) as rank,
           row_number() over (order by t.points desc, t.reached_at asc nulls last, t.display_name) as pos
    from totals t
  ),
  shown as (
    select * from ranked where pos <= 3 or user_id = auth.uid()
  )
  select json_build_object(
    'participants', (select count(*) from players),
    'rows', coalesce((
      select json_agg(json_build_object(
        'name', sh.display_name,
        'points', sh.points,
        'rank', sh.rank,
        'pos', sh.pos,
        'me', sh.user_id = auth.uid(),
        'series', coalesce((
          select json_agg(json_build_object('t', s.created_at, 'p', s.cum) order by s.created_at)
          from (select s2.created_at, sum(s2.points) over (order by s2.created_at, s2.points) as cum
                from scored s2 where s2.user_id = sh.user_id) s), '[]'::json)
      ) order by sh.pos)
      from shown sh), '[]'::json)
  )
  where auth.uid() is not null;
$$;

-- Alt om alle deltagere for én uge. Kun for administratorer.
create or replace function public.admin_progress(p_week int) returns json
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_admin() then
    raise exception 'Kun for administratorer.';
  end if;
  return json_build_object(
    'problems', coalesce((
      select json_agg(json_build_object('id', p.id, 'nr', p.nr, 'source', p.source, 'answer', a.letter) order by p.nr)
      from public.problems p left join public.answers a on a.problem_id = p.id where p.week_id = p_week), '[]'::json),
    'users', coalesce((
      select json_agg(u order by u.points desc, u.name nulls last, u.email)
      from (
        select au.email, pr.display_name as name, au.created_at as joined, au.last_sign_in_at as last_login,
               coalesce((select sum(a.points) from public.attempts a join public.problems p on p.id = a.problem_id
                         where a.user_id = au.id and p.week_id = p_week), 0)::int as points,
               coalesce((select sum(a.points) from public.attempts a where a.user_id = au.id), 0)::int as total,
               (select max(a.created_at) from public.attempts a join public.problems p on p.id = a.problem_id
                 where a.user_id = au.id and p.week_id = p_week) as last_activity,
               coalesce((
                 select json_object_agg(x.problem_id, json_build_object('letters', x.letters, 'points', x.points, 'solved', x.solved))
                 from (select a.problem_id, string_agg(a.letter, '' order by a.created_at) as letters,
                              sum(a.points)::int as points, bool_or(a.correct) as solved
                       from public.attempts a join public.problems p on p.id = a.problem_id
                       where a.user_id = au.id and p.week_id = p_week group by a.problem_id) x
               ), '{}'::json) as cells
        from auth.users au left join public.profiles pr on pr.user_id = au.id
      ) u), '[]'::json)
  );
end;
$$;

revoke all on function public.is_admin(), public.submit_answer(text, text), public.week_answers(int),
  public.scoreboard(int), public.admin_progress(int) from public, anon;
grant execute on function public.is_admin(), public.submit_answer(text, text), public.week_answers(int),
  public.scoreboard(int), public.admin_progress(int) to authenticated;
