# Træningsgym: opsætning

Hver uge åbner 30 Abel-opgaver (runde 1) i ét emne:

| Uge | Emne | Åbner | Lukker |
|---|---|---|---|
| 1 | algebra | 18/10 | 26/10 |
| 2 | kombinatorik | 26/10 | 2/11 |
| 3 | talteori | 2/11 | 9/11 |
| 4 | geometri | 9/11 | 16/11 |

Ugen lukker kl. 00:00 dansk tid den nævnte dag.

Pointene er 30 / 15 / 5 for rigtigt svar i 1./2./3. forsøg. Efter tre forkerte svar er opgaven låst. Det rigtige svar vises først, når ugen er lukket.

```
content/<emne>.js        danske opgaver (kombinatorik, talteori, geometri); algebra kommer fra ../algebra/arcade/content.js
tools/build_weeks.py     vælger opgaverne, tjekker svarene mod loesninger.txt, klipper figurer, skriver supabase/seed.sql
supabase/schema.sql      tabeller, adgangsregler og funktioner (ingen svar)
supabase/seed.sql        GENERERET: uger, opgaver og SVAR. .gitignore'd, må ikke deles.
test/                    tests af schema.sql i PGlite:  cd test && npm i && node schema.test.mjs
web/                     selve hjemmesiden (Vite + React)
web/public/fig/          figurer klippet ud af opgaver.pdf
.github/workflows/pages.yml  bygger og udgiver web/ på GitHub Pages ved push til main
```

## 1. Supabase-projekt (≈ 5 min)

1. Opret et gratis projekt på https://supabase.com (region: Frankfurt eller Stockholm).
2. Gå til **SQL Editor**. Indsæt og kør først `supabase/schema.sql`, derefter `supabase/seed.sql`. Lav `seed.sql` med `python3 tools/build_weeks.py`, hvis den mangler.
3. Gå til **Project Settings → API**. Kopiér *Project URL* og *anon public key*.

## 2. Login med kode på mail

1. Gå til **Authentication → Sign In / Providers → Email**. Slå *Enable Email provider* til.
   - *Confirm email* må gerne være slået til. Koden bekræfter mailen.
   - Lad *Email OTP Length* stå på 6.
2. Gå til **Authentication → Emails → Templates**. Ret både **Magic Link** og **Confirm signup**. Nye elever får *Confirm signup*, og dem der har været logget ind før, får *Magic Link*. Brug fx:

   Emne:
   ```
   Din kode til Træningsgym
   ```

   Indhold:
   ```html
   <h2>Din kode: {{ .Token }}</h2>
   <p>Skriv koden på siden for at logge ind. Du kan også bare trykke her: <a href="{{ .ConfirmationURL }}">log ind</a>.</p>
   ```
3. **SMTP (vigtigt).** Supabases indbyggede mail sender kun til projektets egne medlemmer og kun et par mails i timen. Opsæt derfor egen SMTP under **Authentication → Emails → SMTP Settings**. Den nemmeste løsning er en Gmail-konto med en app-adgangskode (https://myaccount.google.com/apppasswords):

   | Felt | Værdi |
   |---|---|
   | Host | `smtp.gmail.com` |
   | Port | `465` |
   | User | gmail-adressen |
   | Password | app-adgangskoden |
   | Sender name | `TalentCamp Træningsgym` |

   Gmail kan sende ca. 500 mails om dagen. Resend, Brevo og lignende virker også.
4. Gå til **Authentication → Rate Limits** og hæv *emails per hour*, hvis mange elever logger ind samtidig.
5. Gå til **Authentication → URL Configuration**. Sæt *Site URL* til sidens adresse (fx `https://mabugi.github.io/traeningsgym/`), og tilføj den samme adresse under *Redirect URLs*.

## 3. Hjemmesiden

Lokalt:
```
cd web
cp .env.example .env.local      # indsæt URL og anon key
npm install
npm run dev                     # mod det rigtige Supabase
npm run dev:mock                # helt uden Supabase: database i browseren, demo-elever, login-kode 123456
```

Udgivelse: repoet MaBuGi/traeningsgym bygger automatisk ved push til `main` (`.github/workflows/pages.yml`).
Supabase-adressen og den offentlige nøgle ligger som repo-variablerne `SUPABASE_URL` og `SUPABASE_ANON_KEY`.
Det byggede site indeholder hverken svar eller testdatabase (mock-delen fjernes ved build).

`supabase/seed.sql` (med svarene) er .gitignore'd og findes kun lokalt. `tools/build_weeks.py` og algebra-opgaverne
kræver resten af GM_TC-mappen (../algebra, ../geometri osv.), så kør den fra ~/TC/GM_TC/traeningsgym.

## Drift

- **Du som admin.** `mathiasbuhlgilje@gmail.com` står i tabellen `admins`. Når du logger ind med den mail, får du fanen **Admin**: et heatmap over alle elever × opgaver, hvem der ikke er startet, % løst pr. opgave og CSV-eksport. Admins vises ikke på scoreboardet. Tilføj flere admins i SQL Editor:
  ```sql
  insert into admins values ('mail@eksempel.dk');
  ```
- **Flyt en uge.** Ret datoerne i Table Editor → `weeks`, eller ret `WEEKS` i `tools/build_weeks.py` og kør `seed.sql` igen. Det kan gøres når som helst, og elevernes forsøg bevares.
- **Ret en opgave.** Ret i `content/<emne>.js`, kør `python3 tools/build_weeks.py`, og kør `seed.sql` igen.
- **Nye uger.** Tilføj en linje i `WEEKS`. For et nyt emne skal der også oprettes en `content/<emne>.js`. Kør derefter build og seed.
- **En elev vil skifte navn eller slettes.** Brug Table Editor → `profiles`, eller Authentication → Users → Delete.
