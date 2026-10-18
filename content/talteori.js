/* Træningsgym · Talteori: opgave 16–45 i ../../talteori/opgaver.pdf (1–15 er brugt i breakout), oversat til dansk.
   q(id, tekst, [A–E], figur) — svaret hentes fra ../../talteori/loesninger.txt af tools/build_weeks.py.
   Brug \( \) til matematik (KaTeX). */
(function () {
  const T = String.raw;
  const P = [];
  const q = (id, text, opts, fig) => P.push({ id, text, opts, fig: fig || null });

  q('2009-10', T`To tal har summen 10 og produktet 13. Hvad er summen af kvadraterne på de to tal?`,
    ['58', '68', '74', '82', 'Umuligt at afgøre']);
  q('2009-11', T`Tallene, der er delelige med 3 eller 11, skrives efter hinanden sådan: 3, 6, 9, 11, 12, 15, …. Hvad er det 25. tal?`,
    ['60', '63', '66', '69', '72']);
  q('2009-15', T`Lad \(a_1 = 1\) og \(a_n = 9002\,a_{n-1} + 1\) for alle heltal \(n > 1\). Hvad er sidste ciffer i \(a_{2009}\)?`,
    ['1', '2', '3', '5', '7']);
  q('2009-20', T`Niels Henrik besluttede at træne efter nytår. Han ville træne styrke hver femte dag, smidighed hver syvende dag og kondition hver ellevte dag. Niels Henrik er let at begejstre og startede træningsprogrammet allerede nytårsaften, så de første træningsdage blev 5. januar (styrke), 7. januar (smidighed) og 11. januar (kondition). En dag, da Niels Henrik vågner, er batteriet i hans digitale ur løbet tørt, og han kan ikke huske, hvilken dato det er. Træningen er steget ham til hovedet, og det eneste, han husker, er, at han trænede kondition i går, styrke i forgårs og smidighed for tre dage siden. Det er ikke skudår, og han har fulgt træningsprogrammet i mindre end et år. Hvilken dato er det?`,
    ['31. januar', '15. marts', '1. april', '2. maj', '31. juni']);
  q('2010-6', T`For hvor mange heltal \(n\) er \(n^2 + 9\) et kvadrattal?`,
    ['0', '1', '2', '3', '5']);
  q('2010-11', T`I et land findes der kun 3-kronemønter og 5-kronemønter. For hvor mange positive heltal \(n\) under 1000 er det umuligt at betale præcis \(n\) kroner med mønter?`,
    ['3', '4', '66', '199', '333']);
  q('2010-12', T`Hvad er \(mn\), hvis \(m\) og \(n\) er heltal større end 1, og \(m^2 = 329 - mn\)?`,
    ['210', '216', '259', '280', '294']);
  q('2010-14', T`Hvad er tværsummen af \(n\), hvis \(n\) er det mindste positive heltal, så \(n(n-1)/2010\) er et positivt heltal?`,
    ['3', '4', '8', '9', '13']);
  q('2010-18', T`Børge, Geir og Magnus dividerer 2010 med hvert sit heltal, og de får alle heltal som svar. Summen af svarene er 1273. Hvad er summen af de tal, de dividerer med?`,
    ['10', '16', '18', '42', 'Umuligt at afgøre']);
  q('2011-1', T`Hvor mange heltal fra og med 1 til og med 100 har den egenskab, at man får et heltal, når man dividerer dem med 3, men ikke et heltal, når man dividerer dem med 2?`,
    ['16', '17', '33', '34', '50']);
  q('2011-6', T`Nils har fået til opgave at vælge nogle af tallene fra og med 1 til og med 200, så summen af hvilke som helst to af dem er delelig med 12. Hvor mange tal kan han højst vælge?`,
    ['16', '17', '18', '33', '34']);
  q('2011-10', T`Hvad er de to sidste cifre i \(2011^{2012}\)?`,
    ['11', '21', '41', '51', '01']);
  q('2011-15', T`Hvad bliver resten, når man dividerer \(1007^4 - 1005^4\) med 2011?`,
    ['2', '5', '11', '21', '1006']);
  q('2011-20', T`Hvor mange nuller er der i slutningen af \(1^1 \cdot 2^2 \cdot 3^3 \cdots 98^{98} \cdot 99^{99}\)?`,
    ['450', '500', '600', '950', '1100']);
  q('2012-4', T`Hvor mange forskellige primfaktorer har 360?`,
    ['2', '3', '4', '5', '6']);
  q('2012-6', T`Hvor mange positive heltal \(n\) har den egenskab, at \(784/n\) er et heltal?`,
    ['7', '8', '14', '15', '20']);
  q('2012-12', T`Summen af tre på hinanden følgende heltal er et primtal \(p\). Hvad er \(p\)?`,
    ['2', '3', '11', '13', 'Umuligt at afgøre']);
  q('2012-17', T`Hvad er tværsummen af det største heltal \(n \le 2013\), hvor tværsummen af \(n\) er lig med produktet af cifrene i \(n\)?`,
    ['2', '3', '4', '6', '8']);
  q('2012-19', T`Hvad er sidste ciffer i tallet \(1^1 + 2^2 + 4^4 + 503^{503} + 1006^{1006} + 2012^{2012}\)?`,
    ['0', '2', '4', '6', '8']);
  q('2013-1', T`Hvor mange positive heltal går op i \(2^{10}\)?`,
    ['2', '9', '10', '11', '512']);
  q('2013-8', T`Alle tal kan skrives i tretalssystemet, på samme måde som i titalssystemet, med ét eller flere cifre efter hinanden. Forskellen er, at man i tretalssystemet kun må bruge cifrene 0, 1 og 2. Tallene, vi i titalssystemet skriver som 1, 2, 3, 4, 5 osv., skrives i tretalssystemet som 1, 2, 10, 11, 12 osv. Hvilket tal i titalssystemet svarer til tallet 1021 i tretalssystemet?`,
    ['16', '31', '34', '40', '51']);
  q('2013-13', T`Hvad er summen af de to sidste cifre i det mindste tal, der er deleligt med både \(1 + 2 + 3 + \dots + 10\) og \(1 \cdot 2 \cdot 3 \cdots 10\)?`,
    ['0', '1', '2', '5', '9']);
  q('2013-16', T`Hvad er det mindste heltal \(n\) større end 1, så sidste ciffer i \(a^n\) er det samme som sidste ciffer i \(a\) for alle positive heltal \(a\)?`,
    ['4', '5', '9', '10', T`Der findes ikke noget sådant tal \(n\).`]);
  q('2013-20', T`Hvor mange kvadrattal er der blandt tallene 2013, 2020, 2027, …, 3595, 3602?`,
    ['0', '1', '2', '3', '4']);
  q('2014-6', T`Hvilken af svarmulighederne herunder kan skrives på formen \(3^x \cdot 5^y\), hvor \(x\) og \(y\) er heltal?`,
    ['30', '336', '453', '585', '625']);
  q('2014-11', T`Hvilket af disse tal har den største primfaktor?`,
    ['91', '391', '891', '1001', '1881']);
  q('2014-14', T`Den største fælles divisor for to tal \(a\) og \(b\) er 22. Det mindste fælles multiplum af \(a\) og \(b\) er 2002. Hvis \(a\) har færre divisorer end \(b\), hvad er så \(a + b\)?`,
    ['506', '2024', '2222', '4048', '4400']);
  q('2014-19', T`Emmy leger med en lommeregner. Hun taster et heltal ind og tager kvadratroden af det. Så gentager hun processen med heltalsdelen af svaret. Efter at hun har gjort det tre gange, er heltalsdelen for første gang lig med 1. Hvad er forskellen mellem det største og det mindste tal, Emmy kan være startet med?`,
    ['229', '231', '239', '241', '254']);
  q('2015-3', T`Hvilken af svarmulighederne er \(4^7 \cdot 2^4\) lig med?`,
    [T`\(8^3\)`, T`\(8^6\)`, T`\(8^{11}\)`, T`\(8^{14}\)`, T`\(8^{28}\)`]);
  q('2015-8', T`Hvor mange af heltallene 0, 1, 2, …, 999 er hverken delelige med 9 eller indeholder cifferet 9?`,
    ['486', '487', '512', '648', '649']);

  window.UGE = P;
})();
