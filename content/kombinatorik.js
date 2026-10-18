/* Træningsgym · Kombinatorik: opgave 16–45 i ../../kombinatorik/opgaver.pdf (1–15 er brugt i breakout), oversat til dansk.
   q(id, tekst, [A–E], figur) — svaret hentes fra ../../kombinatorik/loesninger.txt af tools/build_weeks.py.
   figur = [side, x, y, bredde, højde] i PDF-punkter fra øverste venstre hjørne af siden i opgaver.pdf.
   Brug \( \) til matematik (KaTeX). */
(function () {
  const T = String.raw;
  const P = [];
  const q = (id, text, opts, fig) => P.push({ id, text, opts, fig: fig || null });

  q('2008-20', T`Kari og Per spiller et spil. Efter hver runde får vinderen af runden ét point, mens den anden får nul point. Hvis runden er uafgjort, får de ét point hver. Efter et stykke tid har Kari fire point, mens Per har to point. På hvor mange forskellige måder kan det være gået til, når vi tager hensyn til rækkefølgen af resultaterne?`,
    ['15', '17', '37', '41', '43']);
  q('2009-1', T`Fire huse står på række. Hvert hus skal males hvidt, rødt eller gult. På hvor mange måder kan det gøres, hvis nabohuse ikke må have samme farve?`,
    ['16', '24', '36', '81', '108']);
  q('2009-6', T`Hvor mange firecifrede pinkoder kan man lave, hvis første ciffer skal være 1 eller 2, sidste ciffer skal være 8 eller 9, og summen af alle cifrene skal være et lige tal?`,
    ['126', '162', '180', '200', 'Ingen af disse tal']);
  q('2009-16', T`I en æske ligger der ti kugler. Hver kugle er blå, rød eller gul, og der er flest gule kugler. Hvis man trækker tre kugler tilfældigt (så syv bliver liggende), er sandsynligheden \(3/10\) for at få én kugle af hver farve. Hvor mange af de ti kugler er gule?`,
    ['4', '5', '6', '7', '8']);
  q('2009-18', T`Marte og Ole spiller et spil, hvor de begge har lige stor chance for at vinde hver runde. Ole vinder første runde. Hvad er sandsynligheden for, at han bliver den første, der vinder tre runder?`,
    [T`\(\frac35\)`, T`\(\frac58\)`, T`\(\frac{11}{16}\)`, T`\(\frac{23}{32}\)`, T`\(\frac34\)`]);
  q('2010-2', T`Til en fest mødes ti ægtepar. Alle giver hånd til hinanden én gang, undtagen dem der er gift med hinanden. Hvor mange håndtryk bliver der udvekslet til festen?`,
    ['45', '90', '180', '190', '360']);
  q('2010-5', T`Der ligger seks grønne og fire røde æbler i en sæk. Berit trækker tre æbler op af sækken. Hvad er sandsynligheden for, at de alle er grønne?`,
    [T`\(\frac1{30}\)`, T`\(\frac4{27}\)`, T`\(\frac16\)`, T`\(\frac14\)`, T`\(\frac13\)`]);
  q('2010-13', T`Der skal vælges et udvalg på tre personer blandt Suppeforeningens ti medlemmer. Suppeforeningens bestyrelse, som har tre medlemmer, skal være repræsenteret i udvalget. På hvor mange måder kan udvalget sammensættes?`,
    ['36', '63', '72', '85', '108']);
  q('2010-15', T`Vi har en regulær 16-kant. Hvor mange firkanter med hjørner i 16-kantens hjørner har præcis én side, som også er en side i 16-kanten?`,
    ['160', '320', '640', '800', '880']);
  q('2010-16', T`Hvor mange forskellige »ord« kan man lave ved at bytte rundt på bogstaverne i det norske ord <i>matematikk</i> (med to k'er), hvis a'erne skal komme før k'erne, og k'erne før t'erne?`,
    [T`\(2\cdot7\cdot9\cdot10\)`, T`\(7^4\)`, T`\(35\cdot72\)`, T`\(56\cdot90\)`, T`\(2\cdot3\cdot4\cdot5\cdot7\cdot9\cdot10\)`]);
  q('2011-2', T`Der sidder 15 børn rundt om et bord – både piger og drenge. Hver pige sidder mellem en pige og en dreng, mens hver dreng sidder enten mellem to drenge eller mellem to piger. Hvor mange drenge sidder ved bordet?`,
    ['5', '6', '7', '8', '9']);
  q('2011-5', T`Ida og Kari går begge i 1.A. Klassen består af 20 elever. Ida har 13 venner i klassen, og Kari har 14 venner i klassen. Hvad er det mindst mulige antal venner, de kan have til fælles i klassen?`,
    ['5', '7', '8', '9', '11']);
  q('2011-9', T`Anne, Berit og Cecilie skal dele 2011 glaskugler mellem sig, så Cecilie får dobbelt så mange som Anne, mens Berit får flere end Anne, men færre end Cecilie. På hvor mange måder kan de gøre det?`,
    ['96 eller færre', '97', '98', '99', '100 eller flere']);
  q('2011-13', T`Hvor mange trekanter er der i alt på figuren?`,
    ['44', '50', '60', '72', '120'], [6, 432, 174, 65, 65]);
  q('2011-18', T`Lad os sige, at et ord er <i>godt</i>, hvis det ikke indeholder bogstavkombinationen BB. Hvor mange gode ord på otte bogstaver kan man lave af bogstaverne A og B?`,
    ['34', '49', '55', '89', '120']);
  q('2012-3', T`Hvor mange trecifrede tal har den egenskab, at første ciffer er lig med summen af de to sidste?`,
    ['45', '48', '50', '54', '55']);
  q('2012-8', T`Du kaster tre almindelige sekssidede terninger. Hvad er sandsynligheden for, at du får ét ulige tal og to lige tal?`,
    ['1/4', '3/8', '4/27', '1/2', '1/3']);
  q('2012-14', T`Nils' sokkeskuffe indeholder 9 hvide, 20 blå og \(k\) sorte sokker. Sandsynligheden for at ende med to sorte sokker, hvis han tager to tilfældige sokker op, er \(1/30\). Hvad er \(k\)?`,
    ['5', '6', '7', '8', '9']);
  q('2013-5', T`I en gade står syv huse på række. Tre af husene er røde, tre er blå, og ét hus er hvidt. Hvilket af følgende udsagn er korrekt?`,
    ['Der må findes to røde huse ved siden af hinanden.',
     'Der må findes et blåt hus med et rødt hus ved siden af sig.',
     'Hvis det hvide hus ikke står ved siden af et blåt hus, så må der findes to blå huse ved siden af hinanden.',
     'Hvis det hvide hus males blåt, så må der bagefter findes to blå huse ved siden af hinanden.',
     'Ingen af de øvrige udsagn er korrekte.']);
  q('2013-10', T`Gro skal lave en sekscifret pinkode, men hun kan kun bruge cifrene 1, 2 og 3. Hvor mange koder er mulige, hvis hvert ciffer skal bruges mindst én gang?`,
    ['534', '537', '540', '726', '729']);
  q('2013-15', T`På figuren må man bevæge sig fra et felt til et nabofelt i rækken nedenunder. To felter er nabofelter, hvis de har en kant eller et hjørne fælles. Hvis man starter i det sorte felt, hvor mange veje er der i alt ned til den nederste række? (Fx er der tre veje fra det sorte felt til næste række.)`,
    ['81', '153', '215', '375', '945'], [7, 374, 484, 121, 104]);
  q('2013-19', T`Trine skal male en samling terninger, så hver side bliver ensfarvet, og ingen nabosider på nogen af dem får samme farve. Hun har kun rød, blå, grøn og gul maling. To terninger regnes for malet ens, hvis de kan drejes, så sider der vender samme vej, har samme farve. Hvor mange indbyrdes forskellige terninger kan hun male?`,
    ['10', '14', '16', '20', '30']);
  q('2014-10', T`Arne har en æske med 100 brikker i de fire farver rød, hvid, blå og sort. Han fortæller Berit, at hun skal trække mindst 81 brikker fra æsken for at være sikker på at få mindst én af hver farve, hvis hun trækker dem i blinde. Efter at have tænkt sig om konkluderer Berit helt korrekt, at æsken indeholder mindst \(N\) brikker af hver farve, men højst \(M\) af hver. Hvad er den mindst mulige værdi af \(M-N\)?`,
    ['0', '5', '20', '40', '60']);
  q('2014-12', T`Anne og Bente spiller et spil, hvor de skiftes til at slå plat eller krone med en mønt. Hver gang er plat og krone lige sandsynlige. Den første, der får krone, vinder. Anne starter. Hvad er sandsynligheden for, at hun vinder?`,
    [T`\(\frac12\)`, T`\(\frac23\)`, T`\(\frac34\)`, T`\(\frac35\)`, T`\(\frac45\)`]);
  q('2014-15', T`Lars skal bygge et tårn ved at stable legolignende klodser oven på hinanden. Tårnet skal være 20 enheder højt. Lars har klodser, der er 2 enheder høje, og klodser, der er 5 enheder høje. På hvor mange forskellige måder kan han bygge tårnet?`,
    ['23', '28', '56', '68', '134']);
  q('2014-18', T`I gitteret på figuren må man kun gå langs linjerne, og kun opad eller mod højre. Hvor mange mulige veje er der fra nederste venstre hjørne til diagonalen?`,
    ['15', '21', '25', '32', '36'], [8, 414, 572, 83, 79]);
  q('2014-20', T`Peter har tre æsker med ti kugler i hver. Han spiller et spil, hvor målet er at ende med så få kugler som muligt i æskerne i alt. Æskerne er mærket med hver sit tal: 4, 7 og 10. Man må fjerne \(N\) kugler fra æsken mærket \(N\), lægge tre af dem til side og lægge resten i en anden æske. Hvad er det mindste antal kugler, æskerne kan indeholde til sidst?`,
    ['0', '2', '3', '5', '6']);
  q('2015-4', T`Tallene \(a_1, a_2, a_3\) og \(a_4\) trækkes tilfældigt fra mængden \(\{0, 1, 2, \dots, 9\}\). Det samme tal må gerne trækkes flere gange. Hvad er sandsynligheden for, at \(a_1a_4 - a_2a_3\) er et lige tal?`,
    [T`\(\frac12\)`, T`\(\frac14\)`, T`\(\frac38\)`, T`\(\frac34\)`, T`\(\frac58\)`]);
  q('2015-7', T`Idun kaster fire almindelige sekssidede terninger med siderne mærket 1 til 6. Hvad er sandsynligheden for, at summen af øjnene er delelig med 3?`,
    [T`\(\frac{71}{6^3}\)`, T`\(\frac{11}{36}\)`, T`\(\frac13\)`, T`\(\frac17\)`, T`\(\frac16\)`]);
  q('2015-12', T`Du har to ens kortspil. Du tager de fire 8'ere fra det ene kortspil og lægger dem i det andet. Så trækker du ét tilfældigt kort fra hvert af kortspillene. Hvad er sandsynligheden for, at de to kort er et par? (Et par er to kort med samme værdi, ikke nødvendigvis samme kulør. De 52 kort i et kortspil har alle kombinationer af 4 kulører og 13 værdier.)`,
    [T`\(\frac1{12}\)`, T`\(\frac1{13}\)`, T`\(\frac1{14}\)`, T`\(\frac3{56}\)`, T`\(\frac7{56}\)`]);

  window.UGE = P;
})();
