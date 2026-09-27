import { ohneKommentare } from "./ui";

/** The cold report's finish is isolated from the shared contract styles.
 *
 *  The commentary below stays in this file and never reaches the prospect:
 *  `ohneKommentare` strips it on the way out. See its note in `ui.tsx` for what
 *  was measured in a live report on 20.09.2026. */
export function LeadMagnetStyles() {
  return <style>{ohneKommentare(`
/* ---------------------------------------------------------- Schriftskala ---
 * VIER ROLLEN, NICHT SIEBEN GROESSEN. Vorher trug jede Sektion ihre eigene
 * clamp-Formel: 76, 58, 48, 44, 36, 30, 26 Pixel, keine zwei gleich und keine
 * aus einer Reihe. Deshalb las sich eine Ueberschrift ueber einer Liste so
 * gross wie die Aussage im Hero.
 *
 * Die Rolle entscheidet, nicht das Gefuehl beim Bauen:
 *   hero     einmal je Seite, der Satz auf den alles zulaeuft
 *   aussage  eine Sektion behauptet etwas (Verlust, Loesung, Plan, Abschluss)
 *   sektion  ordnet einen Block, behauptet nichts (Scorecard, Saeulen)
 *   block    fuehrt eine Liste an (Jetzt beheben, ein Schritt der Loesung)
 *
 * Je groesser die Schrift, desto enger laeuft sie: was bei 20px richtig sitzt,
 * faellt bei 68px auseinander. Deshalb gehoert die Laufweite an die Stufe und
 * wird nicht je Stelle geraten. */
.lm-report{
 --lm-hero:clamp(42px,5vw,68px);      --lm-hero-lw:-.055em; --lm-hero-zh:1.0;
 --lm-aussage:clamp(28px,3.2vw,44px); --lm-aussage-lw:-.042em; --lm-aussage-zh:1.06;
 --lm-sektion:clamp(21px,2.1vw,28px); --lm-sektion-lw:-.032em; --lm-sektion-zh:1.15;
 --lm-block:clamp(18px,1.6vw,22px);   --lm-block-lw:-.025em; --lm-block-zh:1.2;
 /* ARCHIVO, WIE DER REST DER MARKE. Der Bericht lief auf Inter, das Verkaufsdokument und der Vertrag
    auf Archivo: derselbe Interessent sah zwei Schriften auf dem Weg vom
    Kaltkontakt zur Unterschrift. Dazu ist Inter die Schrift, an der man
    erzeugte Seiten erkennt, und ein Kaltreport lebt davon, echt zu wirken.
    Archivo ist bereits im Layout eingebettet (app/fonts.css, alle Schnitte
    von 400 bis 900, font-display: swap), kostet also keinen neuen Request. */
 background:var(--color-canvas);font-family:var(--font-core),var(--font-sans),sans-serif}
.lm-report h1,.lm-report h2,.lm-report h3{text-wrap:balance;font-weight:700}
/* ------------------------------------------------ Kapitel und Bloecke ---
 * Jedes Kapitel traegt denselben Kopf (Nummer, Name, Aussage), jeder Block
 * darin dieselbe kleine Marke. Vorher hatte von fuenf Abschnitten genau einer
 * eine Marke, und die Ueberschriften standen sonst nackt da — man sah eine
 * Folge von Aussagen statt einen Bericht mit Kapiteln. */
.lm-kopf+*{margin-top:32px}

/* VIER ROLLEN FUER KLEINSCHRIFT, NICHT NEUN VARIANTEN. Gemessen am 06.09.2026
   trugen die Marken im Bericht 9, 9.5, 10 und 10.5 Pixel, die Gewichte 600, 700
   und 900 und Laufweiten von 0.2 bis 1.4 Pixel — jede Stelle hatte ihre eigenen
   Werte, weil sie einzeln getippt wurden. Vier Rollen reichen, und welche gilt,
   entscheidet die Aufgabe:
     kapitelmarke  Nummer und Kapitelname, einmal je Kapitel
     blockmarke    fuehrt einen Block innerhalb eines Kapitels an
     spaltenkopf   benennt eine Tabellenspalte
     datenlabel    beschriftet einen Wert (Score, Paket, Dauer) */
/* AUF DEM TELEFON EINE STUFE GROESSER. Gemessen an 24
   Stellen: 9,5 bis 10,5 px in Grossbuchstaben mit weitem Sperrsatz sind am
   Bildschirm noch lesbar und in der Hand nicht mehr. Am Desktop bleiben die
   alten Werte, dort traegt die Groesse die Hierarchie. */
.lm-report .lm-kapitelmarke{font-size:11.5px;font-weight:900;text-transform:uppercase;letter-spacing:.13em}
.lm-report .lm-blockmarke{font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:.11em;color:var(--color-navy)}
@media (min-width:640px){
 .lm-report .lm-kapitelmarke{font-size:10.5px}
 .lm-report .lm-blockmarke{font-size:10px}
 .lm-report .lm-datenlabel{font-size:9.5px}
 .lm-report .lm-spaltenkopf{font-size:9.5px}
 .lm-pillar [data-onepager=pillar]{font-size:9.5px}
 .lm-score>small{font-size:9.5px}
 .lm-actions summary{font-size:10px;min-height:26px}
}
.lm-report .lm-spaltenkopf{font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:.08em;color:var(--color-graphite)}
.lm-report .lm-datenlabel{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:var(--color-pewter)}
.lm-blockmarke+*{margin-top:14px}

/* Fuer Ueberschriften, die im JSX statt hier stehen: dieselbe Stufe, eine Klasse. */
.lm-report .lm-h-aussage{font-size:var(--lm-aussage);line-height:var(--lm-aussage-zh);letter-spacing:var(--lm-aussage-lw)}
.lm-report .lm-h-sektion{font-size:var(--lm-sektion);line-height:var(--lm-sektion-zh);letter-spacing:var(--lm-sektion-lw)}
.lm-report .lm-h-block{font-size:var(--lm-block);line-height:var(--lm-block-zh);letter-spacing:var(--lm-block-lw)}

/* ------------------------------------ Bewegung in der Verlust-Sektion ---
 * Dieselbe Machart wie unten im Loesungsteil: nur transform, opacity und stroke-dashoffset, damit
 * der Browser nichts neu berechnen muss. Jede beginnt in ihrem Endzustand, so
 * dass ein stehendes Bild vollstaendig ist — wer Bewegung abgestellt hat, sieht
 * dieselbe Zeichnung, nur still. */
.lm-losses .laeuft{stroke-dasharray:3 9;animation:lm-l-laeuft 2.4s linear infinite}
@keyframes lm-l-laeuft{to{stroke-dashoffset:-24}}
.lm-losses .fuellt{stroke-dasharray:230;stroke-dashoffset:0;animation:lm-l-fuellt 5.5s cubic-bezier(.45,0,.25,1) infinite}
@keyframes lm-l-fuellt{0%{stroke-dashoffset:230}35%,100%{stroke-dashoffset:0}}
.lm-losses .tickt{transform-origin:164px 66px;animation:lm-l-tickt 5.5s cubic-bezier(.5,0,.2,1) infinite}
@keyframes lm-l-tickt{0%,6%{transform:rotate(0)}94%,100%{transform:rotate(360deg)}}
.lm-losses .pocht{animation:lm-l-pocht 3s ease-in-out infinite}
@keyframes lm-l-pocht{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.65;transform:scale(.88)}}
.lm-losses .rutscht{animation:lm-l-rutscht 4.5s ease-in-out infinite}
@keyframes lm-l-rutscht{0%,100%{transform:translateX(0)}50%{transform:translateX(5px)}}
@media (prefers-reduced-motion: reduce){
 .lm-losses .laeuft,.lm-losses .fuellt,.lm-losses .tickt,
 .lm-losses .pocht,.lm-losses .rutscht{animation:none}
}
.lm-report :is(button,a,[role=button],summary):focus-visible{outline:3px solid var(--color-navy);outline-offset:4px}
.lm-report header nav{min-height:88px;border-color:var(--color-hairline)}
.lm-hero{padding-top:64px;padding-bottom:64px;background:linear-gradient(150deg,var(--color-surface),var(--color-canvas) 72%)}
.lm-hero>div[aria-hidden]{display:none}
.lm-hero>div.relative{row-gap:40px}
.lm-hero h1{max-width:12ch;font-size:var(--lm-hero);line-height:var(--lm-hero-zh);letter-spacing:var(--lm-hero-lw);margin-top:28px}
.lm-hero [data-onepager=hook]{font-weight:500;line-height:1.55;margin-top:24px;max-width:44ch;color:var(--color-graphite)}
/* Gilt dem Videorahmen im Hero, nicht jedem figure darin: der Belegstreifen
   nutzt ebenfalls figure, und seine Sternezeile bekam dadurch einen Rahmen
   quer durch die Karte (07.09.2026). */
.lm-hero figure:not(.lm-beleg-karte)>div{border:1px solid color-mix(in srgb,var(--color-navy-deep) 20%,transparent);border-radius:24px;box-shadow:var(--shadow-raised)}
.lm-hero article{padding:22px 24px;border-color:var(--color-hairline)}
.lm-hero article>span{width:44px;height:44px;border-radius:13px;background:var(--color-navy-soft);box-shadow:inset 0 1px 0 #ffffffb3}
.lm-hero article svg{width:25px;height:25px;stroke-width:1.65}
.lm-hero article strong{font-size:14px;font-weight:600;line-height:1.4}
.lm-analysis{background:var(--color-surface-2);padding-top:72px;padding-bottom:80px;border-color:var(--color-hairline)}
.lm-actions{margin-top:0}
/* Die Ueberschrift fuehrt eine Liste an, sie behauptet nichts. Vorher stand sie mit 42px so gross da wie die Aussagen
   im Hero und in der Verlust-Sektion. */
.lm-actions h2{font-size:var(--lm-block);line-height:var(--lm-block-zh);letter-spacing:var(--lm-block-lw)}
.lm-actions>div{margin-top:18px;border-radius:20px;border-color:var(--color-hairline);box-shadow:var(--shadow-card)}
.lm-actions>div>div:first-child{padding:11px 26px;background:var(--color-canvas);column-gap:20px}
/* Die Zeilen waren fuer zwei Textzeilen 25px hoch gepolstert und standen damit
   halb leer. Enger gesetzt liest sich die Liste als Liste. */
.lm-actions article{padding:16px 26px;column-gap:20px;border-color:var(--color-hairline)}
.lm-actions article:hover{background:#fbfaf7}
.lm-actions article>b{background:var(--color-canvas);color:var(--color-graphite);border:1px solid #0000001a;width:24px;height:24px;font-size:11px}
.lm-actions article p{font-size:15px;font-weight:500;line-height:1.5}
.lm-actions article>div:last-child>p{font-weight:600}
.lm-actions summary{font-size:11px;min-height:44px;letter-spacing:.06em}
/* Der Pfeil rueckt beim Ueberfahren der Zeile ein Stueck in Richtung Loesung und
   wird dabei kraeftiger: dieselbe Bewegung, die der Satz beschreibt. Nur transform
   und color, damit nichts neu umbricht. */
.lm-actions .lm-pfeil{transition:color 200ms cubic-bezier(.23,1,.32,1),transform 200ms cubic-bezier(.23,1,.32,1)}
@media (hover:hover) and (pointer:fine){
 .lm-actions article:hover .lm-pfeil{color:var(--color-navy);transform:translateX(3px)}
}
@media (prefers-reduced-motion:reduce){
 .lm-actions .lm-pfeil{transition:none}
 .lm-actions article:hover .lm-pfeil{transform:none}
}
/* Bleistift auf Papier: der Rahmen liegt in der Tintenfarbe, aber schwach, und
   zieht beim Ueberfahren an. Kein Schatten - eine Zeichnung wirft keinen. */
.lm-beleg-karte{color:rgba(28,22,14,.82)}
.lm-beleg-karte svg,.lm-beleg .lm-marke{transition:color 200ms cubic-bezier(.23,1,.32,1),border-color 200ms cubic-bezier(.23,1,.32,1)}
@media (hover:hover) and (pointer:fine){
 .lm-beleg-karte:hover{color:rgba(28,22,14,1)}
 .lm-beleg .lm-marke:hover{border-color:var(--color-hairline-strong)}
}
/* Das Laufband der Bewertungen.
   Die Liste steht zweimal im DOM, das Band laeuft genau um die halbe Strecke
   und springt dann zurueck: an diesem Punkt steht die Kopie exakt dort, wo das
   Original begann, deshalb ist die Naht unsichtbar. Die Dauer haengt an der
   Zahl der Karten, nicht an einer festen Sekundenzahl, sonst rasen acht
   Bewertungen und vier schleichen. Ueber den Raendern liegt eine Maske, damit
   die Karten aus dem Papier heraus- und hineinlaufen statt an einer Kante
   abgeschnitten zu werden. */
.lm-beleg-fenster{
 overflow:hidden;
 -webkit-mask-image:linear-gradient(90deg,transparent,#000 48px,#000 calc(100% - 48px),transparent);
 mask-image:linear-gradient(90deg,transparent,#000 48px,#000 calc(100% - 48px),transparent);
}
.lm-beleg-band{
 display:flex;gap:12px;width:max-content;
 animation:lm-beleg-zug var(--lm-beleg-dauer,64s) linear infinite;
}
@keyframes lm-beleg-zug{to{transform:translate3d(-50%,0,0)}}
@media (hover:hover) and (pointer:fine){
 .lm-beleg-fenster:hover .lm-beleg-band{animation-play-state:paused}
}
@media (prefers-reduced-motion:reduce){
 .lm-beleg-karte svg,.lm-beleg .lm-marke{transition:none}
 /* Kein Band: zurueck auf ein ruhendes Raster, und die zweite Haelfte der
    Liste ist die aria-hidden-Kopie, die hier nichts zu suchen hat.
    ACHTUNG: dieses Stylesheet ist ein Template-Literal. Ein Backtick in einem
    Kommentar beendet den String und bricht die Datei (gemessen 20.09.2026). */
 .lm-beleg-fenster{-webkit-mask-image:none;mask-image:none}
 .lm-beleg-band{animation:none;display:grid;width:auto;grid-template-columns:repeat(auto-fit,minmax(260px,1fr))}
 .lm-beleg-band>[aria-hidden="true"]{display:none}
 .lm-beleg-band>figure{width:auto}
}
.lm-analysis section[aria-label]{margin-bottom:64px}
.lm-scorecard{border-color:color-mix(in srgb,var(--color-navy) 70%,white);border-radius:26px;box-shadow:var(--shadow-raised)}
.lm-score-overview{--lm-journey-light:color-mix(in srgb,var(--color-navy-soft) 70%,white);--lm-journey-action-light:color-mix(in srgb,var(--color-orange) 66%,white);padding:22px 30px 24px;background:linear-gradient(120deg,var(--color-navy-deep),var(--color-navy));color:white}
.lm-score-overall{display:flex;align-items:center;justify-content:space-between;gap:16px;padding-bottom:16px}
.lm-score-overall h2{font-size:var(--lm-sektion);line-height:var(--lm-sektion-zh);letter-spacing:var(--lm-sektion-lw)}
.lm-score-total{display:grid;justify-items:end;gap:4px}
.lm-score-total>small{font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--color-on-navy-muted)}
.lm-score-total>strong{color:var(--color-surface);font-weight:600}
.lm-score-total>strong small{color:var(--color-on-navy-muted)}
.lm-report-journey{position:relative;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));border-top:1px solid rgba(255,255,255,.16);padding-top:18px}
.lm-report-journey::before{content:"";position:absolute;top:46px;left:16.5%;right:16.5%;height:2px;background:linear-gradient(90deg,rgba(255,255,255,.14),rgba(198,212,255,.72),rgba(255,255,255,.14))}
.lm-report-journey>a{position:relative;z-index:1;display:grid;justify-items:center;gap:10px;min-width:0;min-height:100px;padding:0 14px;color:white;text-align:center;text-decoration:none}
.lm-journey-mark{position:relative;display:grid;width:56px;height:56px;place-items:center;border:1px solid rgba(255,255,255,.24);border-radius:17px;background:linear-gradient(145deg,color-mix(in srgb,var(--color-navy) 72%,white),var(--color-navy-deep));color:#fff;box-shadow:inset 0 1px 0 rgba(255,255,255,.2),0 10px 22px rgba(7,24,82,.28)}
.lm-journey-mark svg{width:32px;height:32px}
.lm-journey-copy{display:grid;justify-items:center;gap:4px}
.lm-journey-copy>small{font-size:9px;font-weight:900;letter-spacing:.12em;color:var(--lm-journey-action-light)}
.lm-journey-copy>strong{font-size:16px;font-weight:850;line-height:1.16;letter-spacing:-.02em}
.lm-report-journey>a:not(:last-child)::after{content:"→";position:absolute;top:14px;right:-13px;color:var(--lm-journey-action-light);font-size:22px;font-weight:700;line-height:1}
.lm-report-journey>a:focus-visible{outline:none}
.lm-report-journey>a:focus-visible .lm-journey-mark{outline:3px solid #fff;outline-offset:4px}
@media (hover:hover) and (pointer:fine){.lm-report-journey>a:hover .lm-journey-mark{transform:translateY(-2px);background:linear-gradient(145deg,color-mix(in srgb,var(--color-navy) 62%,white),var(--color-navy-deep));box-shadow:inset 0 1px 0 rgba(255,255,255,.24),0 16px 30px rgba(7,24,82,.34)}}
/* ------------------------------------------ Die messbare Opportunity ---
 * Eine Matrix zeigt zuerst den Vergleich. Eine einzige Rechenzeile darunter
 * trennt Annahmen von Messwerten; das Ergebnis bekommt die einzige dunkle Flaeche. */
.lm-opportunity-compare{display:grid;grid-template-columns:minmax(150px,.9fr) repeat(2,minmax(170px,1fr));background:#fff}
.lm-opportunity-cell{min-width:0;border-bottom:1px solid var(--color-hairline);padding:16px 22px}
.lm-opportunity-cell:nth-child(3n+2),.lm-opportunity-cell:nth-child(3n+3){border-left:1px solid var(--color-hairline)}
.lm-opportunity-cell[data-target=true]{background:color-mix(in srgb,var(--color-navy-soft) 48%,white)}
.lm-opportunity-corner{display:flex;align-items:end;font-size:10px;font-weight:850;letter-spacing:.1em;text-transform:uppercase;color:var(--color-pewter)}
.lm-opportunity-column-head{display:grid;gap:3px}
.lm-opportunity-column-head strong{font-size:14px;font-weight:850;color:var(--color-ink)}
.lm-opportunity-column-head small{font-size:10.5px;font-weight:650;color:var(--color-pewter)}
.lm-opportunity-row-head{display:flex;align-items:center;font-size:11.5px;font-weight:750;color:var(--color-graphite)}
.lm-opportunity-value{display:flex;align-items:center;font-size:29px;font-weight:850;line-height:1;letter-spacing:-.04em;color:var(--color-ink)}
.lm-opportunity-enquiries{color:var(--color-navy)}
.lm-opportunity-edit{display:flex;align-items:center}
.lm-opportunity-input{display:grid;gap:7px;min-width:0}
.lm-opportunity-input>span:first-child{font-size:10.5px;font-weight:750;line-height:1.3;color:var(--color-graphite)}
.lm-opportunity-field{display:flex;min-height:46px;align-items:center;overflow:hidden;border:1px solid color-mix(in srgb,var(--color-navy) 22%,white);border-radius:11px;background:#fff;box-shadow:inset 0 1px 1px rgba(12,26,72,.03)}
.lm-opportunity-field:focus-within{border-color:var(--color-navy);box-shadow:0 0 0 3px color-mix(in srgb,var(--color-navy) 14%,transparent)}
.lm-opportunity-field input{min-width:0;width:100%;height:44px;border:0;background:transparent;padding:0 8px 0 11px;color:var(--color-ink);font:800 17px/1 var(--font-core),var(--font-sans),sans-serif;font-variant-numeric:tabular-nums;outline:0}
.lm-opportunity-field b{padding:0 13px;color:var(--color-pewter);font-size:14px}
.lm-opportunity-assumptions{display:grid;grid-template-columns:minmax(190px,.9fr) repeat(2,minmax(190px,1fr));align-items:end;gap:16px;padding:18px 22px;background:var(--color-surface-2)}
.lm-opportunity-assumption-title{display:grid;gap:3px;align-self:center}
.lm-opportunity-assumption-title strong{font-size:13px;font-weight:850;color:var(--color-ink)}
.lm-opportunity-assumption-title span{font-size:10.5px;font-weight:650;color:var(--color-pewter)}
.lm-opportunity-input-money .lm-opportunity-field input{padding-left:0}
.lm-opportunity-input-money .lm-opportunity-field b{padding-right:9px;color:var(--color-navy);font-size:18px}
.lm-opportunity-result-band{display:grid;grid-template-columns:minmax(190px,1fr) repeat(2,minmax(140px,.7fr));align-items:center;gap:24px;padding:20px 24px}
.lm-opportunity-result-label{display:grid;gap:4px}
.lm-opportunity-result-label>span{font-size:11px;font-weight:850;letter-spacing:.08em;text-transform:uppercase;color:color-mix(in srgb,var(--color-orange) 68%,white)}
.lm-opportunity-result-label small{font-size:10.5px;font-weight:650;color:var(--color-on-navy-muted)}
.lm-opportunity-result-metric{display:grid;gap:3px;border-left:1px solid rgba(255,255,255,.16);padding-left:22px}
.lm-opportunity-result-metric strong{font-size:27px;font-weight:850;line-height:1;letter-spacing:-.04em;color:#fff}
.lm-opportunity-result-metric span{font-size:10.5px;font-weight:650;color:var(--color-on-navy-muted)}
.lm-solution-steps{position:relative;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));border-top:1px solid var(--color-hairline);border-bottom:1px solid var(--color-hairline)}
.lm-solution-steps>article{position:relative;min-width:0;padding:30px 30px 32px}
.lm-solution-steps>article:first-child{padding-left:0}
.lm-solution-steps>article:last-child{padding-right:0}
.lm-solution-steps>article+article{border-left:1px solid var(--color-hairline)}
.lm-solution-steps>article:not(:last-child)::after{content:"→";position:absolute;z-index:3;top:74px;right:-17px;display:grid;width:34px;height:34px;place-items:center;border:4px solid var(--color-surface);border-radius:999px;background:linear-gradient(135deg,var(--lm-action-light),var(--lm-action));color:#fff;font-size:17px;font-weight:900;line-height:1;box-shadow:0 7px 16px color-mix(in srgb,var(--lm-action) 24%,transparent)}
.lm-solution{--lm-visual-light:color-mix(in srgb,var(--color-navy-soft) 70%,white);--lm-visual-mid:color-mix(in srgb,var(--color-navy) 72%,white);--lm-action:var(--color-orange);--lm-action-light:color-mix(in srgb,var(--color-orange) 68%,white)}
.lm-solution-visual{display:flex;width:min(100%,210px);height:130px;align-items:center;color:var(--color-navy)}
.lm-roadmap-art{display:block;width:200px;height:130px;overflow:visible}
.lm-solution-carousel-controls{display:none}
@media (max-width:639px){
 .lm-opportunity{padding-top:28px!important;padding-bottom:28px!important}
 .lm-opportunity-compare{grid-template-columns:minmax(94px,.85fr) repeat(2,minmax(0,1fr))}
 .lm-opportunity-cell{padding:12px 10px}
 .lm-opportunity-corner{font-size:8.5px}
 .lm-opportunity-column-head strong{font-size:12px}
 .lm-opportunity-column-head small{font-size:9px}
 .lm-opportunity-row-head{font-size:10px}
 .lm-opportunity-value{font-size:24px}
 .lm-opportunity-edit{padding:9px 8px}
 .lm-opportunity-field{min-height:42px}
 .lm-opportunity-field input{height:40px;padding-left:9px;font-size:16px}
 .lm-opportunity-field b{padding:0 8px;font-size:12px}
 .lm-opportunity-assumptions{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;padding:14px}
 .lm-opportunity-assumption-title{grid-column:1/-1}
 .lm-opportunity-assumptions .lm-opportunity-input>span:first-child{min-height:24px;font-size:9px}
 .lm-opportunity-result-band{grid-template-columns:minmax(0,1.15fr) minmax(74px,.65fr) minmax(104px,.9fr);gap:10px;padding:15px 14px}
 .lm-opportunity-result-label>span{font-size:9px;line-height:1.25}
 .lm-opportunity-result-label small{font-size:8.5px}
 .lm-opportunity-result-metric{padding-left:10px;border-left:1px solid rgba(255,255,255,.16)}
 .lm-opportunity-result-metric strong{font-size:20px}
 .lm-opportunity-result-metric span{font-size:9px}
}
/* Die Scorecard ist die Karte des Berichts; die drei eigenstaendigen Flaechen
   darunter sind seine Etappen. Der Abstand trennt, die Linie haelt die Reise
   zusammen. So bleibt die Reihenfolge sichtbar, ohne wieder einen langen
   gemeinsamen Container um alle Inhalte zu ziehen. */
.lm-chapters{position:relative;display:grid;gap:54px;margin-top:54px}
.lm-chapters::before{content:"";position:absolute;z-index:0;top:-54px;bottom:0;left:48px;width:1px;background:linear-gradient(var(--lm-accent),color-mix(in srgb,var(--color-navy) 18%,transparent) 18%,color-mix(in srgb,var(--color-navy) 18%,transparent) 82%,transparent)}
.lm-pillar{z-index:1;border-color:var(--color-hairline);box-shadow:var(--shadow-card)}
.lm-pillar[data-pillar=maps]{background:var(--color-surface)}
.lm-pillar[data-pillar=profile]{background:color-mix(in srgb,var(--color-navy-soft) 72%,white)}
.lm-pillar[data-pillar=website]{background:color-mix(in srgb,var(--lm-accent-soft) 42%,white)}
.lm-pillar>div:first-child{min-height:132px;padding:28px 32px;border-left:4px solid var(--lm-accent);column-gap:24px;background:transparent}
.lm-pillar>div:first-child>span:first-child{font-weight:500;color:var(--color-pewter)}
.lm-pillar h2{font-size:var(--lm-sektion);line-height:var(--lm-sektion-zh);letter-spacing:var(--lm-sektion-lw)}
.lm-pillar [data-onepager=pillar]{font-size:11px;font-weight:700;letter-spacing:.08em;line-height:1.5}
.lm-pillar>div[id]{padding:32px;border-top:1px solid var(--color-hairline);border-left-width:0;background:rgba(255,255,255,.72);border-color:var(--color-hairline)}
.lm-pillar li{line-height:1.6}
.lm-score{min-width:116px;padding:14px 18px;border-radius:16px;border-color:transparent;font-weight:600;box-shadow:inset 0 1px 0 #ffffffb3}
.lm-score>small{font-size:11px;opacity:.8;font-weight:700;letter-spacing:.08em}
.lm-score>span{font-size:38px;font-weight:600}
.lm-close{border-top:0;padding-top:64px;padding-bottom:64px;background:linear-gradient(135deg,var(--color-navy-deep),var(--color-navy) 180%)}
.lm-close h2{font-size:var(--lm-aussage);line-height:var(--lm-aussage-zh);letter-spacing:var(--lm-aussage-lw)}
.lm-close>div>div:first-child{margin-bottom:32px}
.lm-close aside{border-radius:22px;box-shadow:var(--shadow-raised)}
.lm-close aside>div:first-child{padding:24px}
.lm-report>footer{background:var(--color-canvas);padding-top:32px;padding-bottom:32px}
@media(max-width:639px){
 .lm-report header nav{min-height:70px;gap:12px}
 .lm-hero{padding-top:28px;padding-bottom:36px}
 /* 49 px waren die Schreibtisch-Geste auf einem 390-px-Geraet: vier Zeilen,
    die den ersten Bildschirm auffressen. */
 .lm-hero h1{font-size:33px;max-width:14ch;margin-top:18px;letter-spacing:-.04em}
 .lm-hero [data-onepager=hook]{font-size:15.5px;line-height:1.5;margin-top:16px}
 .lm-hero>div.relative{gap:28px}
 .lm-hero article{padding:15px 18px}
 .lm-hero article>span{width:36px;height:36px;border-radius:10px}
 .lm-hero article svg{width:22px;height:22px}
 .lm-analysis{padding-top:44px;padding-bottom:44px}
 .lm-actions>div{margin-top:22px;border-radius:18px}
 .lm-actions article{padding:15px 16px;column-gap:12px;row-gap:8px}
 .lm-actions article p{font-size:14px;line-height:1.6}
 .lm-analysis section[aria-label]{margin-bottom:40px}
 .lm-scorecard{border-radius:20px}
 .lm-score-overview{padding:18px 16px 14px}
 .lm-score-overall{padding:0 4px 14px}
 .lm-score-total>strong{font-size:46px}
 .lm-report-journey{grid-template-columns:1fr;gap:6px;padding-top:13px}
 .lm-report-journey::before{top:38px;bottom:38px;left:23px;right:auto;width:2px;height:auto;background:linear-gradient(rgba(255,255,255,.14),rgba(198,212,255,.72),rgba(255,255,255,.14))}
 .lm-report-journey>a{grid-template-columns:46px minmax(0,1fr);justify-items:start;align-items:center;gap:13px;min-height:58px;padding:3px 0;text-align:left}
 .lm-journey-mark{width:46px;height:46px;border-radius:14px}
 .lm-journey-mark svg{width:28px;height:28px}
 .lm-journey-copy{justify-items:start;gap:3px}
 .lm-journey-copy>strong{font-size:16px}
 .lm-report-journey>a:not(:last-child)::after{display:none}
 .lm-solution a.lm-cta{width:100%;justify-content:center}
 .lm-solution-steps{display:flex;gap:12px;margin-right:-20px;margin-left:-20px;padding:0 20px 8px;overflow-x:auto;scroll-snap-type:x mandatory;scroll-padding-left:20px;overscroll-behavior-inline:contain;border:0;scrollbar-width:none}
 .lm-solution-steps::-webkit-scrollbar{display:none}
 .lm-solution-steps>article,.lm-solution-steps>article:first-child,.lm-solution-steps>article:last-child{flex:0 0 calc(100% - 28px);scroll-snap-align:start;scroll-snap-stop:always;min-height:440px;padding:20px;border:1px solid var(--color-hairline);border-radius:20px;background:linear-gradient(180deg,color-mix(in srgb,var(--color-navy-soft) 38%,white) 0 150px,#fff 150px);box-shadow:var(--shadow-card)}
 .lm-solution-steps>article+article{border-left:1px solid var(--color-hairline)}
 .lm-solution-steps>article:not(:last-child)::after{display:none}
 .lm-solution-visual{width:100%;height:126px;justify-content:center}
 .lm-solution-carousel-controls{display:grid;grid-template-columns:44px auto 1fr 44px;align-items:center;gap:12px;margin-top:12px}
 .lm-solution-carousel-controls>button{display:grid;width:44px;height:44px;place-items:center;border:1px solid color-mix(in srgb,var(--color-navy) 20%,white);border-radius:999px;background:var(--color-navy);color:#fff;font-size:20px;font-weight:800;box-shadow:var(--shadow-card)}
 .lm-solution-carousel-controls>button:disabled{background:var(--color-surface-2);color:var(--color-pewter);box-shadow:none}
 .lm-solution-carousel-controls>button:focus-visible{outline:3px solid var(--lm-action);outline-offset:3px}
 .lm-solution-carousel-controls>span.tnum{font-size:12px;font-weight:700;color:var(--color-graphite)}
 .lm-solution-carousel-controls>span.tnum b{color:var(--color-navy);font-size:15px}
 .lm-solution-dots{display:flex;justify-content:center;gap:6px}
 .lm-solution-dots i{display:block;width:6px;height:6px;border-radius:999px;background:color-mix(in srgb,var(--color-navy) 22%,white);transition:width .2s ease,background-color .2s ease}
 .lm-solution-dots i[data-active=true]{width:20px;background:var(--lm-action)}
 .lm-chapters{gap:34px;margin-top:34px}
 .lm-chapters::before{top:-34px;left:24px}
 /* ZWEI GLEICHE HAELFTEN STATT EINER LUECKE. Auf dem Telefon standen Score und Knopf als zwei
    verschieden grosse Kloetze mit einem Loch dazwischen, und weil die Frage
    mal ein- und mal zweizeilig laeuft, sass die Zeile bei jedem Kapitel
    woanders. Jetzt: Frage oben ueber die ganze Breite, darunter zwei
    gleich breite, gleich hohe Haelften -- links die Zahl, rechts der Knopf. */
 /* SCHLANKER AUF DEM TELEFON. Die Glaskachel ist Schmuck: am Schreibtisch traegt sie den
    Absatz, in der Hand frisst sie die Spalte, in der der Satz stehen soll.
    Also eine Stufe kleiner, und der Fliesstext verliert sein Fettgewicht. */
 /* Der Kopf traegt Marke und Knopf in einer Zeile -- der Knopf bricht nie um. */
 .lm-report header nav{min-height:60px}
 .lm-report header nav .lm-cta{white-space:nowrap;font-size:12px;padding:0 13px;min-height:44px}
 .lm-pillar{border-radius:20px}
 .lm-pillar>div:first-child{min-height:0;padding:18px 16px 18px 14px;row-gap:12px;grid-template-columns:minmax(0,1fr);border-left-width:3px}
 .lm-pillar h2{font-size:18px;line-height:1.15}
 .lm-kapitelzahl{font-size:96px;top:-14px;right:4px}
 .lm-pillar>div:first-child>div:nth-child(2){grid-column:1;grid-row:1}
 .lm-pillar>div:first-child>div[data-onepager=score]{grid-column:1;grid-row:2}
 .lm-score{display:flex;flex-direction:row;align-items:center;justify-content:space-between;gap:8px;width:100%;min-width:0;min-height:46px;padding:0 14px;border-radius:13px}
 .lm-score>small{margin:0}
 .lm-score>span{font-size:22px}
 .lm-pillar>div[id]{padding:20px 12px}
 .lm-close{padding-top:44px;padding-bottom:100px}
}
@media(prefers-reduced-motion:reduce){.lm-report *,.lm-report *::before,.lm-report *::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}}

/* FARBE HAT GENAU EINEN JOB.
   Navy ordnet Inhalt, Linien und aktive Zustände. Orange ist ausschließlich Handlung
   und bleibt deshalb den CTAs vorbehalten. Grün, Amber und Rot kommen nur aus Befunden.
   So lässt sich jede Farbe erklären, statt jeden Abschnitt neu einzufärben. */
.lm-report{
 --lm-accent:var(--color-navy);
 --lm-accent-soft:var(--color-navy-soft);
 --lm-action:var(--color-orange);
 --lm-action-soft:var(--color-orange-soft)
}
.lm-report [class*="text-navy"]:is(p,span,b):not(button *):not(a *){}
.lm-hero{background:
  radial-gradient(120% 90% at 88% -10%,color-mix(in srgb,var(--lm-accent) 12%,transparent),transparent 60%),
  linear-gradient(150deg,var(--color-surface),var(--color-canvas) 72%)}
.lm-hero>div.relative>div:first-child>span:first-child{border-color:color-mix(in srgb,var(--lm-accent) 35%,transparent)}
/* Der Kicker bekommt einen kurzen Strich in Orange: er führt das Auge in den Abschnitt,
   ohne dass eine ganze Fläche die Farbe trägt. */
/* Der Strich stand ueber "Jetzt beheben", als das noch eine Sektion anfuehrte.
   Seit dem Kapitel-Umbau ist es eine Ueberschrift INNERHALB von Kapitel 02, und
   der Strich doppelte dort die Kapitelmarke ein paar Zeilen darueber. Er bleibt
   nur, wo er eine Sektion anfuehrt. */
.lm-actions article>b{background:linear-gradient(140deg,var(--lm-accent),color-mix(in srgb,var(--lm-accent) 72%,#7a2d00));color:#fff;
  box-shadow:0 1px 2px color-mix(in srgb,var(--lm-accent) 45%,transparent)}
/* KORREKTUR 06.09.2026: hier stand Orange, und damit widersprach diese Zeile dem
   Kommentar drei Zeilen darueber („Navy bleibt fuer alles, was man anklickt").
   „Details" und „2 weitere anzeigen" sind Aufklapper, also Navy. Orange bleibt bei
   den Ziffern und dem Kicker-Strich, die nur markieren, und beim Handlungsknopf. */
.lm-actions summary{color:var(--color-navy)}
.lm-scorecard>div:first-child{background:
  radial-gradient(90% 200% at 100% 0,rgba(188,205,255,.18),transparent 55%),
  linear-gradient(120deg,var(--color-navy-deep),var(--color-navy))}
.lm-pillar>div:first-child>span:first-child{color:color-mix(in srgb,var(--lm-accent) 70%,var(--color-pewter))}
.lm-close{background:
  radial-gradient(80% 120% at 12% 0,color-mix(in srgb,var(--lm-accent) 26%,transparent),transparent 58%),
  linear-gradient(135deg,var(--color-navy-deep),var(--color-navy) 180%)}
.lm-report>footer>div>span:first-child>b{background:linear-gradient(140deg,var(--color-navy),var(--color-navy-deep))}
.lm-report header nav>span:first-child>b{background:linear-gradient(140deg,var(--color-navy),var(--color-navy-deep));
  box-shadow:0 1px 0 color-mix(in srgb,var(--lm-accent) 40%,transparent)}
/* Der Knopf antwortet auf den Druck: 160 ms, ease-out, ein Hauch kleiner. Ohne das fühlt
   sich ein Klick an, als hätte die Seite ihn nicht gehört. */
/* DER KNOPF IST DAS EINZIGE ORANGE AUF DER SEITE. Der ganze Bericht
   laeuft in Navy und Sand; wenn genau eine Flaeche die Signalfarbe traegt, findet das Auge
   sie ohne Suchen. Wuerde Orange auch anderswo stehen, waere es Dekoration statt Wegweiser.

   Drei Schichten, jede mit einem Zweck: der Verlauf gibt Tiefe (eine flache Flaeche wirkt
   gedruckt), der Schimmer laeuft alle fuenf Sekunden einmal durch und holt den Blick zurueck,
   ohne zu blinken, und der Schatten traegt dieselbe Farbe wie der Knopf statt Grau -- ein
   grauer Schatten unter einer warmen Flaeche sieht schmutzig aus.

   Der Schimmer ist bewusst langsam und weit auseinander. Ein pulsierender Knopf wirkt wie
   ein Werbebanner, und der Bericht lebt davon, dass er nicht nach Werbung aussieht. */
.lm-report .lm-cta{position:relative;overflow:hidden;
  background:linear-gradient(135deg,
    color-mix(in oklab,var(--color-orange) 88%,white) 0%,
    var(--color-orange) 46%,
    color-mix(in oklab,var(--color-orange) 86%,black) 100%) !important;
  color:#fff !important;
  transition:transform 160ms cubic-bezier(.23,1,.32,1),box-shadow 160ms cubic-bezier(.23,1,.32,1),filter 160ms;
  box-shadow:0 1px 2px color-mix(in srgb,var(--color-orange) 30%,transparent),
             0 8px 20px -6px color-mix(in srgb,var(--color-orange) 55%,transparent)}
.lm-report .lm-cta::after{content:"";position:absolute;inset:0;pointer-events:none;
  background:linear-gradient(105deg,transparent 38%,rgba(255,255,255,.42) 50%,transparent 62%);
  transform:translateX(-130%);animation:lm-schimmer 5s ease-in-out 1.5s infinite}
@keyframes lm-schimmer{0%,72%{transform:translateX(-130%)}100%{transform:translateX(130%)}}
.lm-report .lm-cta:active{transform:scale(.97)}
@media (hover:hover) and (pointer:fine){
  .lm-report .lm-cta:hover{filter:brightness(1.06);
    box-shadow:0 2px 6px color-mix(in srgb,var(--color-orange) 34%,transparent),
               0 14px 30px -8px color-mix(in srgb,var(--color-orange) 62%,transparent)}
}
@media (prefers-reduced-motion: reduce){
  .lm-report .lm-cta{transition:none}
  .lm-report .lm-cta::after{animation:none;opacity:0}
}

/* Nur auf echten Zeigegeräten, sonst löst eine Berührung den Zustand aus und er bleibt
   hängen. Kurz und ease-out, damit es antwortet statt zu schweben. */
@media (hover:hover) and (pointer:fine){
  .lm-report .lm-hero article{transition:transform 160ms cubic-bezier(.23,1,.32,1),box-shadow 160ms cubic-bezier(.23,1,.32,1)}
  .lm-report .lm-hero article:hover{transform:translateY(-1px)}
}
@media (prefers-reduced-motion: reduce){
  .lm-report .lm-hero article{transition:none}
  .lm-report .lm-hero article:hover{transform:none}
}
@media(max-width:639px){
 .lm-actions h2::before{width:28px;margin-bottom:11px}
}
`)}</style>;
}
