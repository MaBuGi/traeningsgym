/* Træningsgym · Geometri: opgave 16–45 i ../../geometri/opgaver.pdf (1–15 er brugt i breakout), oversat til dansk.
   q(id, tekst, [A–E], figur) — svaret hentes fra ../../geometri/loesninger.txt af tools/build_weeks.py.
   figur = [side, x, y, bredde, højde] i PDF-punkter fra øverste venstre hjørne af siden i opgaver.pdf.
   Brug \( \) til matematik (KaTeX). */
(function () {
  const T = String.raw;
  const P = [];
  const q = (id, text, opts, fig) => P.push({ id, text, opts, fig: fig || null });

  q('2007-11', T`Alf står tre skridt fra en lygtepæl og kaster en 1,5 m lang skygge. Lygten sidder på toppen af den lodrette pæl. Alf flytter sig seks skridt længere væk. Så bliver skyggen`,
    ['1,5 m', '3 m', '4 m', '4,5 m', '6 m']);
  q('2007-14', T`I den ligebenede trekant \(ABC\) er siderne \(AB\) og \(AC\) lige lange. Punktet \(D\) ligger på siden \(AB\), \(E\) på \(AC\) og \(F\) på \(CB\). Trekanten \(DEF\) er ligesidet, vinkel \(EDA\) er \(52^\circ\), og vinkel \(FEC\) er \(64^\circ\). Vinkel \(BFD\) er`,
    [T`\(40^\circ\)`, T`\(58^\circ\)`, T`\(60^\circ\)`, T`\(64^\circ\)`, T`\(76^\circ\)`], [4, 353, 502, 140, 137]);
  q('2007-20', T`Et kvadrat er delt op i trekanter (som ikke overlapper hinanden). Alle trekanternes hjørner farves røde. Kvadratets fire hjørner og 2007 punkter inde i kvadratet bliver røde. Ingen linje går gennem tre af de røde punkter. Hvor mange trekanter er kvadratet delt op i?`,
    ['2008', '2010', '3012', '4016', '4020']);
  q('2008-3', T`Tallene på figuren angiver omkredsen af hver af de fire små trekanter. Hvad er omkredsen af den store trekant?`,
    ['43', '59', '55', '67', '91'], [5, 396, 167, 99, 68]);
  q('2008-5', T`Fra en ligesidet trekant med sidelængde 2 fjernes alle punkter med afstand mindre end 1 til et af hjørnerne, så vi står tilbage med det farvede område. Hvad er arealet af området?`,
    [T`\(\sqrt3 - \frac\pi2\)`, T`\(\sqrt3 - \pi\)`, T`\(3 - \sqrt\pi\)`, T`\(3 - \pi\)`, T`\(2 - \frac\pi2\)`], [5, 430, 284, 63, 54]);
  q('2008-8', T`Vinklerne \(BAC\), \(BED\) og \(DFC\) på figuren er rette. Arealet af trekant \(EBD\) er 9, og arealet af trekant \(FDC\) er 4. Hvad er arealet af trekant \(AEF\)?`,
    ['3', '5', '6', T`\(\frac{13}2\)`, '7'], [5, 385, 407, 108, 88]);
  q('2008-10', T`I en retvinklet trekant findes der et punkt, som har afstanden 1 til alle siderne. Den længste side er dobbelt så lang som den korteste side. Hvad er trekantens areal?`,
    [T`\(3 + 2\sqrt3\)`, T`\(\frac{3+\sqrt5}2\)`, T`\(1 + \sqrt3\)`, T`\(2 + 2\sqrt5\)`, T`\(1 + 3\sqrt3\)`]);
  q('2008-11', T`På figuren er vinklerne \(CAB\) og \(ADC\) rette, længden af \(AB\) er 12, og længden af \(BC\) er 13. Hvad er arealet af trekant \(ADC\)?`,
    [T`\(\frac{750}{169}\)`, T`\(\frac{850}{169}\)`, T`\(\frac{750}{144}\)`, T`\(\frac{1920}{169}\)`, T`\(\frac{75}6\)`], [5, 364, 639, 130, 72]);
  q('2009-4', T`To cirkler har radius 1 og centrum i to modstående hjørner af et kvadrat med sidelængde 1. Hvad er arealet af det område, der ligger inden for begge cirkler (det farvede område på figuren)?`,
    [T`\(\frac\pi2\)`, T`\(\pi - 1\)`, T`\(\frac\pi2 - 1\)`, T`\(\frac12\)`, T`\(\frac1\pi\)`], [6, 403, 182, 92, 90]);
  q('2009-9', T`En ligesidet trekant og et kvadrat er indskrevet i en cirkel med radius 1, så en af kvadratets sider og en af trekantens sider er parallelle. Hvad er afstanden mellem de to parallelle sider?`,
    [T`\(\frac16\)`, T`\(\frac{\sqrt2-1}2\)`, T`\(\frac{\sqrt3-1}3\)`, T`\(\frac{\sqrt2}6\)`, T`\(\frac14\)`], [6, 403, 311, 92, 100]);
  q('2009-12', T`Ti cirkler med radius 1 danner en figur som vist på tegningen. Hvad er figurens omkreds (længden af den sorte kurve)?`,
    [T`\(8\pi\)`, T`\(9\pi\)`, T`\(10\pi\)`, T`\(11\pi\)`, T`\(12\pi\)`], [6, 376, 432, 119, 106]);
  q('2009-14', T`I en firkant \(ABCD\) er siderne \(AD\) og \(BC\) parallelle. Siderne \(AB\), \(BC\) og \(CD\) er lige lange, og summen af vinklerne \(BAD\) og \(ADC\) er \(80^\circ\). Diagonalerne \(AC\) og \(BD\) skærer hinanden i punktet \(O\). Hvor stor er vinkel \(AOD\)?`,
    [T`\(100^\circ\)`, T`\(120^\circ\)`, T`\(130^\circ\)`, T`\(140^\circ\)`, T`\(150^\circ\)`]);
  q('2009-17', T`En trekant ligger inde i et kvadrat som vist på figuren. Trekanten er retvinklet, og dens toppunkt er kvadratets centrum. En cirkel med radius 1 er indskrevet i trekanten. Hvad er kvadratets areal?`,
    [T`\(6 + \sqrt2 + 4\sqrt{2+\sqrt2}\)`, T`\(16 + 8\sqrt3\)`, T`\(24 + 16\sqrt2\)`, '36', T`\(15\sqrt5\)`], [6, 414, 662, 81, 89]);
  q('2010-3', T`To regulære sekskanter med sidelængde 1 har en side fælles. Hvad er afstanden mellem sekskanternes centre?`,
    [T`\(\frac{\sqrt2}2\)`, '1', T`\(\sqrt2\)`, T`\(\frac{\sqrt{10}}2\)`, T`\(\sqrt3\)`], [7, 391, 166, 104, 63]);
  q('2010-8', T`Afstanden mellem centrene i to cirkler med radius 1 er \(\sqrt2\). Hvad er arealet af det område, der ligger inden for begge cirkler?`,
    [T`\(\frac\pi4 - \frac12\)`, T`\(\frac\pi2 - 1\)`, T`\(\frac{2\pi}3 - 1\)`, T`\(\frac\pi2 - \frac{\sqrt2}2\)`, T`\(\frac{2\pi}3 - \frac{\sqrt2}2\)`], [7, 443, 264, 52, 81]);
  q('2010-9', T`En ottetakket stjerne er lavet ved at lægge to kvadrater med sidelængde 1 oven på hinanden. De to kvadrater har fælles centrum og er drejet \(45^\circ\) i forhold til hinanden. Hvad er stjernens areal?`,
    [T`\(4 - 2\sqrt2\)`, T`\(\frac34\sqrt2\)`, '1,25', T`\(7 - 4\sqrt2\)`, T`\(13 - 8\sqrt2\)`], [7, 409, 369, 86, 86]);
  q('2010-17', T`To cirkler med radius 1 og \(\sqrt2\) har samme centrum. Hvad er arealet af et kvadrat, der ligger mellem cirklerne, så den ene af kvadratets sider tangerer den inderste cirkel, og hjørnerne på den modsatte side ligger på den yderste cirkel?`,
    [T`\(\frac15\)`, T`\(\frac4{25}\)`, T`\(3 - 2\sqrt2\)`, T`\(\frac{12-8\sqrt2}5\)`, T`\(\frac{4\sqrt2-5}2\)`], [7, 423, 508, 72, 127]);
  q('2010-19', T`Lad \(S\) være midtpunktet mellem to nabohjørner \(F\) og \(F'\) i topfladen af en terning med sidelængde 1. Tegn linjer mellem \(S\) og hvert af de fire hjørner i bundfladen. Hvad er overfladearealet af den skæve pyramide, der dannes?`,
    ['3', T`\(\frac12(3 + \sqrt2 + \sqrt5)\)`, T`\(1 + \sqrt2 + \frac12\sqrt5\)`, T`\(\frac12(3 + 2\sqrt2 + \sqrt5)\)`, T`\(1 + 2\sqrt2 + \frac12\sqrt5\)`], [7, 405, 655, 90, 102]);
  q('2011-3', T`\(ABCD\) er et kvadrat, og \(ABE\) er en ligesidet trekant, så \(E\) ligger inde i \(ABCD\). Hvor stor er vinkel \(CDE\)?`,
    [T`\(10^\circ\)`, T`\(12^\circ\)`, T`\(15^\circ\)`, T`\(18^\circ\)`, T`\(20^\circ\)`]);
  q('2011-7', T`Centrene i de tre cirkler på figuren ligger på en ret linje. Den mellemstore cirkel har dobbelt så stort areal som den mindste. Hvad er forholdet mellem arealet af den største og arealet af den mindste cirkel?`,
    ['4', '5', T`\(2 + 2\sqrt2\)`, T`\(3 + 2\sqrt3\)`, T`\(3 + 2\sqrt2\)`], [8, 419, 275, 76, 72]);
  q('2011-12', T`På figuren er alle de markerede vinkler lige store. Hvor store er vinklerne, afrundet til nærmeste hele antal grader?`,
    [T`\(22^\circ\)`, T`\(23^\circ\)`, T`\(24^\circ\)`, T`\(25^\circ\)`, T`\(26^\circ\)`], [8, 164, 414, 328, 162]);
  q('2011-17', T`Den lille prins bor på en kugleformet planet med radius \(2/\pi\) km. En dag går han en tur. Han begynder ved sit hus og går 1 km ligeud. Derefter drejer han \(90^\circ\) til højre og går yderligere 3 km ligeud. Herfra går han den korteste vej hjem til sit hus. Hvor langt går den lille prins i alt på turen?`,
    ['4 km', T`\((4 + \sqrt2)\) km`, T`\((4 + \sqrt{10})\) km`, '5 km', 'Ingen af disse']);
  q('2011-19', T`Den ligesidede trekant på figuren har sidelængde 2. Cirklen på figuren går gennem et hjørne og tangerer den modstående side på midten. Hvad er arealet af området inden for trekanten, men uden for cirklen?`,
    [T`\(\frac58\sqrt3 - \frac\pi4\)`, T`\(\frac58\sqrt3 - \frac\pi3\)`, T`\(\frac34\sqrt3 - \frac\pi3\)`, T`\(\sqrt3 - \frac\pi2\)`, T`\(\frac34\sqrt3 - \frac{\sqrt3\,\pi}8\)`], [9, 405, 167, 90, 81]);
  q('2012-2', T`Per, Ragnar og Lars bor i samme kvarter. De har fundet ud af, at der er 250 m i fugleflugt fra Per til Ragnar og 300 m fra Ragnar til Lars. Hvad er det bedste, man kan sige om afstanden fra Per til Lars ud fra disse oplysninger?`,
    ['Afstanden er præcis 550 m.', 'Afstanden kan være alt mellem 0 m og 550 m.', 'Afstanden kan være alt mellem 50 m og 550 m.',
     'Afstanden kan være alt mellem 250 m og 300 m.', 'Afstanden kan være hvad som helst.']);
  q('2012-7', T`\(ABC\) er en ligesidet trekant. En cirkel med radius 1 tangerer linjen \(AB\) i punktet \(B\) og linjen \(AC\) i punktet \(C\). Hvad er sidelængden i \(ABC\)?`,
    [T`\(\frac{\sqrt3}2 + 1\)`, T`\(\sqrt3\)`, T`\(\frac{\sqrt3}2\)`, T`\(\frac{2\sqrt3}3\)`, '2']);
  q('2012-10', T`Et kvadrat placeres inde i en ligebenet retvinklet trekant med kateter af længde 1, som vist på tegningen. Hvad er kvadratets areal?`,
    ['2/9', '2/10', T`\(\sqrt3/9\)`, '3/10', T`\(\sqrt2/5\)`], [9, 405, 617, 90, 90]);
  q('2012-13', T`Karl Erik skal cykle hjem fra skole. Han cykler fra A til B som vist på figuren. Først cykler han på en cykelsti, der har form som en kvartcirkel, derefter cykler han over en 20 m lang bro, før han cykler videre på resten af cykelstien, som også har form som en kvartcirkel. Han cykler lige langt før og efter broen. Hvis afstanden i fugleflugt fra A til B er 100 m, hvor mange meter cykler Karl Erik?`,
    [T`\(40\pi + 20\)`, T`\(30\pi + 20\)`, '210', T`\(60\pi + 20\)`, T`\(40\pi\)`], [10, 365, 169, 130, 122]);
  q('2012-16', T`Arealet af rektanglet \(ABCD\) er 1. Antag, at \(E\) ligger på diagonalen \(AC\), og at linjen gennem \(E\) parallel med \(AD\) og \(BC\) møder \(AB\) i \(F\) og \(CD\) i \(G\). Lad \(x = AE/EC\). Hvor stor er summen af arealerne af \(AFE\) og \(ECG\)?`,
    [T`\(\frac{1+x^2}{2(1+x)^2}\)`, T`\(\frac{2(1+x^2)}{(1+x)^2}\)`, T`\(\frac{2(1+x)^2}{1+x^2}\)`, T`\(\frac{(1+x)^2}{2(1+x^2)}\)`, T`Umuligt at bestemme ud fra \(x\) alene.`], [10, 311, 358, 184, 110]);
  q('2012-18', T`I en trekant \(ABC\) er \(AB = 5\), \(BC = 4\) og \(CA > 3\). Trekantens areal er 6. Hvad er sidelængden \(CA\)?`,
    [T`\(\sqrt{77}\)`, T`\(\frac{\sqrt{1901}}5\)`, T`\(\frac{\sqrt{2012}}5\)`, T`\(\sqrt{73}\)`, T`\(\frac{3\sqrt{197}}5\)`]);
  q('2013-4', T`På figuren er en halvcirkel indskrevet i et kvadrat, som er indskrevet i en ligebenet trekant, som er indskrevet i en halvcirkel. Hvad er forholdet mellem arealet af den store halvcirkel og arealet af den lille halvcirkel?`,
    ['9', T`\(6\sqrt2\)`, T`\(5\sqrt3\)`, '10', 'Det afhænger af radius i den lille halvcirkel.'], [11, 353, 182, 142, 74]);

  window.UGE = P;
})();
