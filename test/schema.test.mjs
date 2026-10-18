// Tester supabase/schema.sql + seed.sql i PGlite (Postgres i WASM) med en efterligning af Supabase-auth.
// Kør fra GM_TC/traeningsgym/test:  node schema.test.mjs
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const read = (p) => readFileSync(new URL(p, import.meta.url), 'utf8');
const db = new PGlite();
await db.exec(read('./auth_shim.sql'));
await db.exec(read('../supabase/schema.sql'));
await db.exec(read('../supabase/schema.sql')); // kan køres igen
await db.exec(read('../supabase/seed.sql'));
await db.exec(read('../supabase/seed.sql'));

// Uge 1 åben, uge 2 i fremtiden, uanset hvornår testen køres.
await db.exec(`update weeks set opens_at = now() - interval '1 day', closes_at = now() + interval '6 days' where id = 1;
               update weeks set opens_at = now() + interval '6 days', closes_at = now() + interval '13 days' where id = 2;`);

let passed = 0;
const ok = (name) => { passed++; console.log('  ✓', name); };

const users = {};
for (const name of ['u1', 'u2', 'u3', 'u4', 'u5', 'admin']) {
  const email = name === 'admin' ? 'MathiasBuhlGilje@gmail.com' : `${name}@example.dk`;
  users[name] = (await db.query(`insert into auth.users (email) values ($1) returning id`, [email])).rows[0].id;
}

// Kør SQL som en indlogget bruger (rollen authenticated, med JWT-claims som i Supabase).
async function as(user, sql, params = []) {
  return db.transaction(async (tx) => {
    const claims = user ? { sub: users[user], email: user === 'admin' ? 'mathiasbuhlgilje@gmail.com' : `${user}@example.dk`, role: 'authenticated' } : {};
    await tx.query(`select set_config('request.jwt.claims', $1, true)`, [JSON.stringify(claims)]);
    await tx.exec(`set local role ${user ? 'authenticated' : 'anon'}`);
    return (await tx.query(sql, params)).rows;
  });
}
async function fails(user, sql, params, pattern) {
  await assert.rejects(() => as(user, sql, params), pattern);
}
const submit = (u, pid, letter) => as(u, `select submit_answer($1, $2) as r`, [pid, letter]).then((r) => r[0].r);

const answer = Object.fromEntries((await db.query(`select problem_id, letter from answers`)).rows.map((r) => [r.problem_id, r.letter]));
const wrong = (pid, i = 0) => 'ABCDE'.split('').filter((l) => l !== answer[pid])[i];
const P1 = 'algebra/2005-1', P2 = 'algebra/2005-3';

console.log('seed');
assert.equal((await db.query(`select count(*)::int n from problems`)).rows[0].n, 120);
assert.equal((await db.query(`select count(*)::int n from answers`)).rows[0].n, 120);
assert.deepEqual((await db.query(`select week_id, count(*)::int n from problems group by 1 order by 1`)).rows.map((r) => r.n), [30, 30, 30, 30]);
ok('4 uger × 30 opgaver med svar');

console.log('profiler');
await fails('u1', `select submit_answer($1, 'A')`, [P1], /Vælg et navn/);
ok('kan ikke svare uden navn');
for (const u of ['u1', 'u2', 'u3', 'u4', 'u5', 'admin']) {
  await as(u, `insert into profiles (user_id, display_name) values (auth.uid(), $1)`, [`Navn ${u}`]);
}
await fails('u1', `insert into profiles (user_id, display_name) values ($1, 'Fup')`, [users.u2], /row-level security|duplicate/);
ok('kan ikke oprette profil for en anden');
await db.exec(`insert into auth.users (email) values ('u6@example.dk')`);
users.u6 = (await db.query(`select id from auth.users where email = 'u6@example.dk'`)).rows[0].id;
await fails('u6', `insert into profiles (user_id, display_name) values (auth.uid(), ' navn U1 ')`, [], /duplicate|unique/);
ok('navne er unikke uden hensyn til store/små bogstaver');
await fails('u6', `insert into profiles (user_id, display_name) values (auth.uid(), 'x')`, [], /check/);
ok('navn skal være 2–24 tegn');
assert.equal((await as('u1', `select * from profiles`)).length, 1);
ok('ser kun sin egen profil');

console.log('hemmeligheder');
await fails('u1', `select * from answers`, [], /permission denied/);
await fails('u1', `select * from admins`, [], /permission denied/);
await fails(null, `select * from problems`, [], /permission denied/);
await fails(null, `select submit_answer('x', 'A')`, [], /permission denied/);
ok('answers, admins og anonym adgang er lukket');
await fails('u1', `insert into attempts (user_id, problem_id, letter, correct, points) values (auth.uid(), $1, 'A', true, 30)`, [P1], /permission denied/);
await fails('u1', `update attempts set points = 30`, [], /permission denied/);
ok('kan ikke skrive forsøg direkte');
assert.equal((await as('u1', `select * from problems where week_id = 2`)).length, 0);
assert.equal((await as('u1', `select * from problems where week_id = 1`)).length, 30);
ok('kun åbne ugers opgaver er synlige');
await fails('u1', `select submit_answer($1, 'A')`, ['kombinatorik/2008-20'], /Ukendt opgave/);
ok('kan ikke svare på en uåbnet uge');

console.log('point');
let r = await submit('u1', P1, answer[P1]);
assert.deepEqual(r, { correct: true, points: 30, wrong_left: 3 });
await fails('u1', `select submit_answer($1, $2)`, [P1, wrong(P1)], /allerede løst/);
ok('rigtigt i 1. forsøg = 30, derefter låst');

r = await submit('u2', P1, wrong(P1, 0));
assert.deepEqual(r, { correct: false, points: 0, wrong_left: 2 });
assert.ok(!JSON.stringify(r).includes(`"${answer[P1]}"`));
await fails('u2', `select submit_answer($1, $2)`, [P1, wrong(P1, 0).toLowerCase()], /allerede prøvet/);
r = await submit('u2', P1, answer[P1].toLowerCase());
assert.deepEqual(r, { correct: true, points: 15, wrong_left: 2 });
ok('rigtigt i 2. forsøg = 15, samme bogstav to gange afvises, små bogstaver ok');

await submit('u3', P1, wrong(P1, 0));
await submit('u3', P1, wrong(P1, 1));
r = await submit('u3', P1, answer[P1]);
assert.deepEqual(r, { correct: true, points: 5, wrong_left: 1 });
ok('rigtigt i 3. forsøg = 5');

for (let i = 0; i < 3; i++) r = await submit('u4', P1, wrong(P1, i));
assert.deepEqual(r, { correct: false, points: 0, wrong_left: 0 });
await fails('u4', `select submit_answer($1, $2)`, [P1, answer[P1]], /ikke flere forsøg/);
ok('låst efter 3 forkerte, også for det rigtige svar');
await fails('u4', `select submit_answer($1, 'F')`, [P2], /Ugyldigt/);

await submit('u3', P2, answer[P2]);
assert.equal((await as('u1', `select * from attempts`)).length, 1);
assert.equal((await as('u3', `select * from attempts`)).length, 4);
ok('ser kun sine egne forsøg');

console.log('svar efter ugen');
assert.equal((await as('u4', `select * from week_answers(1)`)).length, 0);
ok('svar skjult mens ugen er åben');

console.log('scoreboard');
// u1: 30, u3: 5 + 30 = 35, u2: 15, u4: 0, u5: 0, admin: 0
let sb = (await as('u5', `select scoreboard() as s`))[0].s;
assert.equal(sb.participants, 5);
assert.deepEqual(sb.rows.map((x) => [x.name, x.points, x.rank, x.me]), [
  ['Navn u3', 35, 1, false], ['Navn u1', 30, 2, false], ['Navn u2', 15, 3, false], ['Navn u5', 0, 4, true]]);
assert.deepEqual(sb.rows[0].series.map((s) => s.p), [5, 35]);
assert.ok(!JSON.stringify(sb).includes('example.dk'));
ok('top 3 + mig, kumuleret graf, ingen e-mails');
await submit('admin', P2, answer[P2]);
sb = (await as('admin', `select scoreboard() as s`))[0].s;
assert.equal(sb.participants, 5);
assert.ok(!sb.rows.some((x) => x.me || x.name === 'Navn admin'));
ok('administratoren er ikke med på scoreboardet');
sb = (await as('u1', `select scoreboard(1) as s`))[0].s;
assert.equal(sb.rows.length, 3);
assert.equal(sb.rows.find((x) => x.me).points, 30);
sb = (await as('u1', `select scoreboard(2) as s`))[0].s;
assert.ok(sb.rows.every((x) => x.points === 0));
ok('filter pr. uge');

console.log('admin');
await fails('u1', `select admin_progress(1)`, [], /Kun for administratorer/);
ok('almindelige deltagere får ikke adgang');
const ad = (await as('admin', `select admin_progress(1) as a`))[0].a;
assert.equal(ad.problems.length, 30);
assert.equal(ad.problems[0].answer, answer[P1]);
const u4 = ad.users.find((u) => u.email === 'u4@example.dk');
assert.deepEqual(u4.cells[P1], { letters: [0, 1, 2].map((i) => wrong(P1, i)).join(''), points: 0, solved: false });
assert.equal(ad.users.find((u) => u.email === 'u3@example.dk').points, 35);
assert.ok(ad.users.some((u) => u.email === 'u6@example.dk' && u.name === null));
ok('admin ser alle (også dem uden navn) med forsøg pr. opgave');

console.log('lukket uge');
await db.exec(`update weeks set opens_at = now() - interval '8 days', closes_at = now() - interval '1 day' where id = 1`);
assert.equal((await as('u4', `select * from week_answers(1)`)).length, 30);
await fails('u5', `select submit_answer($1, $2)`, [P2, answer[P2]], /lukket/);
ok('svarene vises og der kan ikke svares, når ugen er lukket');

console.log(`\n${passed} tests bestået`);
