#!/usr/bin/env python3
"""Bygger ugernes opgavesæt til Træningsgym.

Kør fra GM_TC/traeningsgym:  python3 tools/build_weeks.py
- algebra: de første 30 i ../algebra/arcade/content.js (kronologisk), som ikke er i breakout_algebra.tex
- øvrige emner: content/<emne>.js, som skal være opgave 16–45 i ../<emne>/opgaver.txt
- tjekker at ingen opgave er brugt i breakout, og at hvert svar = den officielle løsning i loesninger.txt
- klipper figurer ud af opgaver.pdf -> web/public/fig/<emne>-<id>.png
- skriver supabase/seed.sql (uger, opgaver og svar; .gitignore'd, fordi den indeholder svarene)
"""
import json, re, subprocess, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent.parent
GM = HERE.parent
FIG = HERE / 'web' / 'public' / 'fig'

# Ugerne i rækkefølge. Datoerne kan rettes her eller direkte i tabellen weeks i Supabase.
WEEKS = [
    (1, 'algebra', 'Algebra', '2026-10-18 00:00', '2026-10-26 00:00'),
    (2, 'kombinatorik', 'Kombinatorik', '2026-10-26 00:00', '2026-11-02 00:00'),
    (3, 'talteori', 'Talteori', '2026-11-02 00:00', '2026-11-09 00:00'),
    (4, 'geometri', 'Geometri', '2026-11-09 00:00', '2026-11-16 00:00'),
]
PER_WEEK = 30
BREAKOUT = 15

# Figurer hvor andet end figuren ligger inden for udsnittet: hvide rektangler [x, y, b, h] i PDF-punkter på siden.
MASKS = {'geometri/2011-12': [[100, 515, 243, 55]], 'geometri/2012-16': [[300, 355, 23, 14]]}
# pdftotext blander layoutet sammen her; tjekket i løsnings-PDF'en (som i tools/check_content.py)
OVERRIDES = {'algebra': {'2007-4': 'C'}}


def load_js(path, var):
    js = path.read_text(encoding='utf-8')
    out = subprocess.run(['node', '-e', 'const window={};' + js + f';console.log(JSON.stringify(window.{var}))'],
                         capture_output=True, text=True, check=True).stdout
    return json.loads(out)


def key(pid):
    return [int(x) for x in pid.split('-')]


def official(topic):
    """Svarbogstav pr. opgave fra loesninger.txt (samme regex som tools/check_content.py)."""
    txt = (GM / topic / 'loesninger.txt').read_text(encoding='utf-8')
    res = {}
    for c in re.split(r'\(\d+\)\s+Oppgave\s+', txt)[1:]:
        m = re.match(r'(\d+)\s+(\d{4})/\d{4}\.', c)
        if not m:
            continue
        body = re.sub(r'Abelkonkurransen.*?Side \d+ av \d+', '', c, flags=re.S)
        letters = re.findall(r'(?:\.\s?){3,}\s*([A-E])\b|[.)]\s?([A-E])\s*$', body, flags=re.M)
        flat = [a or b for a, b in letters]
        if flat:
            res[f'{m.group(2)}-{m.group(1)}'] = flat[-1]
    return res | OVERRIDES.get(topic, {})


def order(topic):
    """Opgavernes rækkefølge i opgaver.txt."""
    txt = (GM / topic / 'opgaver.txt').read_text(encoding='utf-8')
    return [f'{y}-{n}' for n, y in re.findall(r'(?m)^Oppgave (\d+) (\d{4})/\d{4}', txt)]


def breakout(topic):
    tex = (GM / topic / f'breakout_{topic}.tex').read_text(encoding='utf-8')
    return {f'{y}-{n}' for y, n in re.findall(r'\\opg(?:\[(?:[^\[\]]|\[[^\]]*\])*\])?\{(\d{4})\}\{(\d+)\}', tex)}


def season(pid):
    y, n = key(pid)
    return f'Abel {y}/{str(y + 1)[2:]}, opg. {n}'


def crop(topic, p):
    page, x, y, w, h = p['fig']
    name = f"{topic}-{p['id']}.png"
    out = FIG / name
    s = 300 / 72
    subprocess.run(['pdftocairo', '-png', '-singlefile', '-r', '300', '-f', str(page), '-l', str(page),
                    '-x', str(round(x * s)), '-y', str(round(y * s)), '-W', str(round(w * s)), '-H', str(round(h * s)),
                    str(GM / topic / 'opgaver.pdf'), str(out.with_suffix(''))], check=True)
    cmd = ['magick', str(out)]
    for mx, my, mw, mh in MASKS.get(f"{topic}/{p['id']}", []):
        x0, y0 = (mx - x) * s, (my - y) * s
        cmd += ['-fill', 'white', '-draw', f'rectangle {x0:.0f},{y0:.0f} {x0 + mw * s:.0f},{y0 + mh * s:.0f}']
    cmd += ['-trim', '+repage', '-bordercolor', 'white', '-border', '12', str(out)]
    subprocess.run(cmd, check=True)
    return name


def main():
    errors = []
    FIG.mkdir(parents=True, exist_ok=True)
    weeks = []
    for wid, topic, title, opens, closes in WEEKS:
        off, used = official(topic), breakout(topic)
        if len(used) != BREAKOUT:
            errors.append(f'{topic}: fandt {len(used)} breakout-opgaver, ventede {BREAKOUT}')
        if topic == 'algebra':
            src = load_js(GM / 'algebra' / 'arcade' / 'content.js', 'ABEL')
            probs = sorted((p for p in src if p['id'] not in used), key=lambda p: key(p['id']))[:PER_WEEK]
            for p in probs:
                p['fig'] = None
                if p['ans'] != off.get(p['id']):
                    errors.append(f"algebra/{p['id']}: content.js siger {p['ans']}, løsningen {off.get(p['id'])}")
        else:
            probs = load_js(HERE / 'content' / f'{topic}.js', 'UGE')
            want = order(topic)[BREAKOUT:BREAKOUT + PER_WEEK]
            got = [p['id'] for p in probs]
            if got != want:
                errors.append(f'{topic}: content-filen har {got}, ventede {want}')
            for p in probs:
                p['ans'] = off.get(p['id'])
                if p['ans'] is None:
                    errors.append(f"{topic}/{p['id']}: intet svar i loesninger.txt")
        for p in probs:
            if p['id'] in used:
                errors.append(f"{topic}/{p['id']}: er brugt i breakout")
            if len(p['opts']) != 5:
                errors.append(f"{topic}/{p['id']}: {len(p['opts'])} svarmuligheder")
            p['figure'] = crop(topic, p) if p['fig'] else None
        if len(probs) != PER_WEEK:
            errors.append(f'{topic}: {len(probs)} opgaver')
        weeks.append((wid, topic, title, opens, closes, probs))
        print(f'uge {wid} {topic}: {len(probs)} opgaver, {sum(1 for p in probs if p["figure"])} figurer, '
              f'{probs[0]["id"]} … {probs[-1]["id"]}')

    if errors:
        print('\n'.join('FEJL: ' + e for e in errors))
        sys.exit(1)

    def lit(s):
        return '$q$' + s + '$q$' if s is not None else 'null'

    sql = ['-- GENERERET af tools/build_weeks.py. Indeholder svarene: må ikke committes eller lægges på hjemmesiden.',
           '-- Kør efter schema.sql. Kan køres igen: opgaver og svar opdateres, forsøg bevares.', 'begin;']
    for wid, topic, title, opens, closes, probs in weeks:
        sql.append(f"insert into weeks (id, topic, title, opens_at, closes_at) values ({wid}, '{topic}', '{title}', "
                   f"timestamptz '{opens} Europe/Copenhagen', timestamptz '{closes} Europe/Copenhagen')\n"
                   f"  on conflict (id) do update set topic = excluded.topic, title = excluded.title, "
                   f"opens_at = excluded.opens_at, closes_at = excluded.closes_at;")
        for nr, p in enumerate(probs, 1):
            pid = f"{topic}/{p['id']}"
            sql.append(f"insert into problems (id, week_id, nr, source, text, opts, figure) values ('{pid}', {wid}, {nr}, "
                       f"'{season(p['id'])}', {lit(p['text'])}, {lit(json.dumps(p['opts'], ensure_ascii=False))}::jsonb, "
                       f"{lit(p['figure'])})\n  on conflict (id) do update set week_id = excluded.week_id, nr = excluded.nr, "
                       f"source = excluded.source, text = excluded.text, opts = excluded.opts, figure = excluded.figure;")
            sql.append(f"insert into answers (problem_id, letter) values ('{pid}', '{p['ans']}') "
                       f"on conflict (problem_id) do update set letter = excluded.letter;")
    sql.append('commit;')
    (HERE / 'supabase' / 'seed.sql').write_text('\n'.join(sql) + '\n', encoding='utf-8')
    print('skrev supabase/seed.sql og', len(list(FIG.glob('*.png'))), 'figurer')


if __name__ == '__main__':
    main()
