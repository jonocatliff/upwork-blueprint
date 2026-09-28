import { ohneKommentare } from "./ui";

/** The cold report's finish is isolated from the shared contract styles.
 *
 *  The commentary below stays in this file and never reaches the prospect:
 *  `ohneKommentare` strips it on the way out. See its note in `ui.tsx` for what
 *  was measured in a live report on 20.09.2026. */
export function LeadMagnetStyles() {
  return <style>{ohneKommentare(`
/* ------------------------------------------------------------ Type scale ---
 * FOUR ROLES, NOT SEVEN SIZES. Before, every section carried its own
 * clamp formula: 76, 58, 48, 44, 36, 30, 26 pixels, no two alike and none
 * out of one series. That is why a heading above a list read as large as
 * the statement in the hero.
 *
 * The role decides, not how it felt while building:
 *   hero     once per page, the sentence everything runs towards
 *   aussage  a section claims something (loss, solution, plan, close)
 *   sektion  orders a block, claims nothing (scorecard, pillars)
 *   block    heads a list (fix this now, one step of the solution)
 *
 * The bigger the type, the tighter it runs: what sits right at 20px falls
 * apart at 68px. So tracking belongs to the step and is not guessed at
 * every single place. */
.lm-report{
 --lm-hero:clamp(42px,5vw,68px);      --lm-hero-lw:-.055em; --lm-hero-zh:1.0;
 --lm-aussage:clamp(28px,3.2vw,44px); --lm-aussage-lw:-.042em; --lm-aussage-zh:1.06;
 --lm-sektion:clamp(21px,2.1vw,28px); --lm-sektion-lw:-.032em; --lm-sektion-zh:1.15;
 --lm-block:clamp(18px,1.6vw,22px);   --lm-block-lw:-.025em; --lm-block-zh:1.2;
 /* ARCHIVO, LIKE THE REST OF THE BRAND. The report ran on Inter, the sales document and the contract
    on Archivo: the same prospect saw two typefaces on the way from cold
    contact to signature. On top of that, Inter is the typeface that gives a
    generated page away, and a cold report lives on looking real.
    Archivo is already embedded in the layout (app/fonts.css, every weight
    from 400 to 900, font-display: swap), so it costs no new request. */
 background:var(--color-canvas);font-family:var(--font-core),var(--font-sans),sans-serif}
.lm-report h1,.lm-report h2,.lm-report h3{text-wrap:balance;font-weight:700}
/* ---------------------------------------------- Chapters and blocks ---
 * Every chapter carries the same head (number, name, statement), every block
 * inside it the same small badge. Before, exactly one of five sections had a
 * badge and the other headings stood bare: you saw a run of statements
 * instead of a report with chapters. */
.lm-kopf+*{margin-top:32px}

/* FOUR ROLES FOR SMALL TYPE, NOT NINE VARIANTS. Measured on 06.09.2026,
   the badges in the report ran at 9, 9.5, 10 and 10.5 pixels, at weights 600, 700
   and 900, with tracking from 0.2 to 1.4 pixels: every place had its own
   values, because they were typed one at a time. Four roles are enough, and the
   job decides which one applies:
     kapitelmarke  number and chapter name, once per chapter
     blockmarke    heads a block inside a chapter
     spaltenkopf   names a table column
     datenlabel    labels a value (score, package, duration) */
/* ONE STEP BIGGER ON A PHONE. Measured at 24
   places: 9.5 to 10.5 px in capitals with wide tracking is still legible on a
   screen and no longer legible in the hand. The desktop keeps the old
   values, where size carries the hierarchy. */
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

/* For headings that live in the JSX instead of here: same step, one class. */
.lm-report .lm-h-aussage{font-size:var(--lm-aussage);line-height:var(--lm-aussage-zh);letter-spacing:var(--lm-aussage-lw)}
.lm-report .lm-h-sektion{font-size:var(--lm-sektion);line-height:var(--lm-sektion-zh);letter-spacing:var(--lm-sektion-lw)}
.lm-report .lm-h-block{font-size:var(--lm-block);line-height:var(--lm-block-zh);letter-spacing:var(--lm-block-lw)}

/* ------------------------------------ Motion in the loss section ---
 * Same make as the solution part below: only transform, opacity and stroke-dashoffset, so
 * the browser has nothing to recalculate. Each one starts in its end state, so
 * that a still frame is complete: anyone who has switched motion off sees the
 * same drawing, only quiet. */
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
/* Applies to the video frame in the hero, not to every figure in it: the proof
   strip uses figure as well, which gave its star row a border running right
   across the card (07.09.2026). */
.lm-hero figure:not(.lm-beleg-karte)>div{border:1px solid color-mix(in srgb,var(--color-navy-deep) 20%,transparent);border-radius:24px;box-shadow:var(--shadow-raised)}
.lm-hero article{padding:22px 24px;border-color:var(--color-hairline)}
.lm-hero article>span{width:44px;height:44px;border-radius:13px;background:var(--color-navy-soft);box-shadow:inset 0 1px 0 #ffffffb3}
.lm-hero article svg{width:25px;height:25px;stroke-width:1.65}
.lm-hero article strong{font-size:14px;font-weight:600;line-height:1.4}
.lm-analysis{background:var(--color-surface-2);padding-top:72px;padding-bottom:80px;border-color:var(--color-hairline)}
.lm-actions{margin-top:0}
/* The heading heads a list, it claims nothing. Before, it stood at 42px, as large as the statements
   in the hero and in the loss section. */
.lm-actions h2{font-size:var(--lm-block);line-height:var(--lm-block-zh);letter-spacing:var(--lm-block-lw)}
.lm-actions>div{margin-top:18px;border-radius:20px;border-color:var(--color-hairline);box-shadow:var(--shadow-card)}
.lm-actions>div>div:first-child{padding:11px 26px;background:var(--color-canvas);column-gap:20px}
/* The rows were padded 25px high for two lines of text and stood half empty
   as a result. Set tighter, the list reads as a list. */
.lm-actions article{padding:16px 26px;column-gap:20px;border-color:var(--color-hairline)}
.lm-actions article:hover{background:#fbfaf7}
.lm-actions article>b{background:var(--color-canvas);color:var(--color-graphite);border:1px solid #0000001a;width:24px;height:24px;font-size:11px}
.lm-actions article p{font-size:15px;font-weight:500;line-height:1.5}
.lm-actions article>div:last-child>p{font-weight:600}
.lm-actions summary{font-size:11px;min-height:44px;letter-spacing:.06em}
/* On hover the arrow moves a little way towards the solution and grows stronger
   as it goes: the same movement the sentence describes. Only transform and
   color, so that nothing re-wraps. */
.lm-actions .lm-pfeil{transition:color 200ms cubic-bezier(.23,1,.32,1),transform 200ms cubic-bezier(.23,1,.32,1)}
@media (hover:hover) and (pointer:fine){
 .lm-actions article:hover .lm-pfeil{color:var(--color-navy);transform:translateX(3px)}
}
@media (prefers-reduced-motion:reduce){
 .lm-actions .lm-pfeil{transition:none}
 .lm-actions article:hover .lm-pfeil{transform:none}
}
/* Pencil on paper: the border sits in the ink colour, but faint, and
   strengthens on hover. No shadow - a drawing does not cast one. */
.lm-beleg-karte{color:rgba(28,22,14,.82)}
.lm-beleg-karte svg,.lm-beleg .lm-marke{transition:color 200ms cubic-bezier(.23,1,.32,1),border-color 200ms cubic-bezier(.23,1,.32,1)}
@media (hover:hover) and (pointer:fine){
 .lm-beleg-karte:hover{color:rgba(28,22,14,1)}
 .lm-beleg .lm-marke:hover{border-color:var(--color-hairline-strong)}
}
/* The review ticker.
   The list sits in the DOM twice, the band travels exactly half the distance
   and then jumps back: at that point the copy stands exactly where the
   original began, which is why the seam is invisible. The duration hangs on
   the number of cards, not on a fixed number of seconds, or else eight
   reviews race and four crawl. A mask lies over the edges so the cards run
   out of the paper and into it instead of being cut off at a line. */
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
 /* No band: back to a still grid, and the second half of the list is the
    aria-hidden copy, which has no business here.
    CAREFUL: this stylesheet is a template literal. A backtick in a comment
    ends the string and breaks the file (measured 20.09.2026). */
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
/* ------------------------------------- The measurable opportunity ---
 * A matrix shows the comparison first. A single line of arithmetic below it
 * separates assumptions from measurements; the result gets the only dark area. */
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
/* The scorecard is the report's map; the three standalone areas below it are
   its stages. The gap separates, the line holds the journey together. That
   keeps the order visible without drawing one long shared container around all
   the content again. */
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
 /* 49 px was the desktop gesture on a 390 px device: four lines that eat
    the whole first screen. */
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
 /* TWO EQUAL HALVES INSTEAD OF A GAP. On a phone, score and button stood as two
    blocks of different sizes with a hole between them, and because the question
    runs on one line or on two, the row sat somewhere else in every
    chapter. Now: question on top across the full width, below it two halves of
    equal width and equal height -- the number left, the button right. */
 /* LEANER ON A PHONE. The glass tile is ornament: at a desk it carries the
    paragraph, in the hand it eats the column the sentence should stand in.
    So one step smaller, and the body text loses its bold weight. */
 /* The header carries badge and button on one line -- the button never wraps. */
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

/* COLOUR HAS EXACTLY ONE JOB.
   Navy orders content, lines and active states. Orange is action and nothing else,
   which is why it stays reserved for the CTAs. Green, amber and red come only from findings.
   That way every colour can be explained, instead of recolouring every section. */
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
/* The kicker gets a short rule in orange: it leads the eye into the section
   without a whole area carrying the colour. */
/* The rule stood above "fix this now" while that still headed a section.
   Since the chapter rebuild it is a heading INSIDE chapter 02, and there the
   rule doubled the chapter badge a few lines above it. It stays only where it
   heads a section. */
.lm-actions article>b{background:linear-gradient(140deg,var(--lm-accent),color-mix(in srgb,var(--lm-accent) 72%,#7a2d00));color:#fff;
  box-shadow:0 1px 2px color-mix(in srgb,var(--lm-accent) 45%,transparent)}
/* CORRECTION 06.09.2026: orange stood here, which made this line contradict the
   comment three lines above it ("navy stays for everything you click").
   "Details" and "show 2 more" are disclosure toggles, so navy. Orange stays with
   the digits and the kicker rule, which only mark, and with the action button. */
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
/* The button answers the press: 160 ms, ease-out, a shade smaller. Without that a click
   feels as if the page had not heard it. */
/* THE BUTTON IS THE ONLY ORANGE ON THE PAGE. The whole report
   runs in navy and sand; when exactly one area carries the signal colour, the eye finds
   it without searching. Were orange to sit elsewhere too, it would be decoration, not a signpost.

   Three layers, each with a purpose: the gradient gives depth (a flat area looks
   printed), the shimmer passes through once every five seconds and pulls the eye back
   without blinking, and the shadow carries the same colour as the button instead of grey -- a
   grey shadow under a warm area looks dirty.

   The shimmer is deliberately slow and far apart. A pulsing button reads like an ad
   banner, and the report lives on not looking like advertising. */
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

/* Only on real pointing devices, or else a touch triggers the state and it stays
   stuck. Short and ease-out, so it answers instead of floating. */
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
