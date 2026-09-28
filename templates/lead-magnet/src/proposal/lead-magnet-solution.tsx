/* # multilingual-data: the locale tables below are what a client reads,
   so a German value there is the German report and not a German comment. */
"use client";

/* Shared report illustrations and the terms block. The former three-phase
 * solution section was removed on 21.09.2026; what the service does will be
 * explained once, after the report, instead of inside every finding. */

import { useRef, useState } from "react";

type Locale = "en" | "de";

/** Miniature scenes for the three-step solution path. They deliberately carry more
 * information than the small service glyphs: each drawing shows the actual hand-off
 * in that step, while the restrained navy/orange palette keeps the strip quiet. */
function RoadmapPaint({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={`${id}-paper`} x1="0" y1="0" x2=".75" y2="1">
        <stop stopColor="var(--color-surface)" />
        <stop offset="1" stopColor="var(--lm-visual-light)" />
      </linearGradient>
      <linearGradient id={`${id}-navy`} x1="0" y1="0" x2="1" y2="1">
        <stop stopColor="var(--lm-visual-mid)" />
        <stop offset="1" stopColor="var(--color-navy-deep)" />
      </linearGradient>
      <linearGradient id={`${id}-action`} x1="0" y1="0" x2="1" y2="1">
        <stop stopColor="var(--lm-action-light)" />
        <stop offset="1" stopColor="var(--lm-action)" />
      </linearGradient>
      <filter id={`${id}-shadow`} x="-35%" y="-30%" width="170%" height="190%">
        <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="var(--color-navy-deep)" floodOpacity=".14" />
      </filter>
    </defs>
  );
}

function RoadmapIllustration({ step }: { step: "visibility" | "website" | "followup" }) {
  const id = `roadmap-${step}`;
  if (step === "visibility") {
    return (
      <svg viewBox="0 0 160 104" fill="none" aria-hidden className="lm-roadmap-art">
        <RoadmapPaint id={id} />
        <g filter={`url(#${id}-shadow)`}>
          <rect x="25" y="13" width="110" height="78" rx="20" fill={`url(#${id}-paper)`} stroke="currentColor" strokeOpacity=".18" />
          <rect x="39" y="26" width="82" height="16" rx="8" fill="var(--lm-visual-light)" />
          <circle cx="50" cy="34" r="4" stroke="currentColor" strokeWidth="2" />
          <path d="m53 37 3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M42 70c18-12 34 8 52-5 10-7 18-4 24-1" stroke="currentColor" strokeOpacity=".14" strokeWidth="2" strokeLinecap="round" />
          <circle cx="80" cy="63" r="24" fill="var(--lm-visual-light)" />
          <path d="M80 43c10.5 0 19 8.3 19 18.5C99 75 80 92 80 92S61 75 61 61.5C61 51.3 69.5 43 80 43Z" fill={`url(#${id}-navy)`} />
          <circle cx="80" cy="61" r="7" fill={`url(#${id}-action)`} />
        </g>
      </svg>
    );
  }

  if (step === "website") {
    return (
      <svg viewBox="0 0 160 104" fill="none" aria-hidden className="lm-roadmap-art">
        <RoadmapPaint id={id} />
        <g filter={`url(#${id}-shadow)`}>
          <rect x="19" y="13" width="122" height="78" rx="16" fill={`url(#${id}-paper)`} stroke="currentColor" strokeOpacity=".18" />
          <path d="M19 32h122" stroke="currentColor" strokeOpacity=".16" />
          <circle cx="31" cy="23" r="2.3" fill="currentColor" fillOpacity=".2" />
          <circle cx="39" cy="23" r="2.3" fill="currentColor" fillOpacity=".14" />
          <circle cx="47" cy="23" r="2.3" fill="var(--lm-action)" />
          <path d="M34 47h47M34 57h36" stroke="currentColor" strokeOpacity=".6" strokeWidth="4" strokeLinecap="round" />
          <rect x="34" y="68" width="54" height="13" rx="6.5" fill={`url(#${id}-action)`} />
          <path d="M48 74.5h26" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" />
          <path d="m89 60 17 29 5-12 12-5-34-12Z" fill={`url(#${id}-navy)`} stroke="#fff" strokeWidth="2.3" strokeLinejoin="round" />
        </g>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 160 104" fill="none" aria-hidden className="lm-roadmap-art">
      <RoadmapPaint id={id} />
      <g filter={`url(#${id}-shadow)`}>
        <rect x="19" y="13" width="122" height="78" rx="16" fill={`url(#${id}-paper)`} stroke="currentColor" strokeOpacity=".18" />
        <path d="M32 38a9 9 0 0 1 9-9h26a9 9 0 0 1 9 9v15a9 9 0 0 1-9 9H53L41 71v-9a9 9 0 0 1-9-9V38Z" fill="var(--lm-visual-light)" stroke="currentColor" strokeOpacity=".18" />
        <circle cx="76" cy="64" r="17" fill={`url(#${id}-navy)`} />
        <path d="M76 55v9l6 4" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M103 70V44M118 70V56M133 70V35" stroke="currentColor" strokeOpacity=".22" strokeWidth="8" strokeLinecap="round" />
        <path d="m101 55 16-12 10 5 10-14" stroke="var(--lm-action)" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="m132 34h5v5" stroke="var(--lm-action)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------- Tile copy ---
 * Short enough to survive a skim, long enough that the thing is clear without
 * any prior knowledge. None of our own jargon.
 */

export function WhatWeDoSection({ locale }: { locale: Locale }) {
  const de = locale === "de";
  const carousel = useRef<HTMLDivElement>(null);
  const [activeStep, setActiveStep] = useState(0);
  const steps = de ? [
    {
      visual: "visibility" as const,
      label: "Gefunden werden",
      title: "SEO + Google-Profil",
      text: "Wir verbessern, wo Sie erscheinen und was Kunden sehen, wenn sie Sie finden.",
    },
    {
      visual: "website" as const,
      label: "Anfragen bekommen",
      title: "Eine Website, die Anfragen bringt",
      text: "Klare Seiten, bessere Belege und ein offensichtlicher nächster Schritt: anrufen, buchen oder ein kurzes Formular senden.",
    },
    {
      visual: "followup" as const,
      label: "Aufträge gewinnen",
      title: "Schnelle Reaktion + klare Zahlen",
      text: "Speed-to-Lead übernimmt die erste Antwort. Die Auswertung zeigt, welche Anfragen zu Aufträgen werden.",
    },
  ] : [
    {
      visual: "visibility" as const,
      label: "Get found",
      title: "SEO + Google profile",
      text: "We improve where you appear and what customers see when they find you.",
    },
    {
      visual: "website" as const,
      label: "Get the enquiry",
      title: "A website built to convert",
      text: "Clear pages, stronger proof and an obvious next step: call, book or send a short form.",
    },
    {
      visual: "followup" as const,
      label: "Win the job",
      title: "Fast follow-up + clear numbers",
      text: "Speed-to-lead handles the first response. The reporting shows which enquiries turn into work.",
    },
  ];

  const moveTo = (next: number) => {
    const index = Math.max(0, Math.min(steps.length - 1, next));
    const track = carousel.current;
    const card = track?.children[index] as HTMLElement | undefined;
    if (track && card) track.scrollTo({ left: card.offsetLeft - track.offsetLeft, behavior: "smooth" });
    setActiveStep(index);
  };

  const followScroll = () => {
    const track = carousel.current;
    if (!track) return;
    const cards = Array.from(track.children) as HTMLElement[];
    const closest = cards.reduce((best, card, index) => (
      Math.abs(card.offsetLeft - track.offsetLeft - track.scrollLeft)
        < Math.abs(cards[best].offsetLeft - track.offsetLeft - track.scrollLeft) ? index : best
    ), 0);
    setActiveStep(closest);
  };

  return (
    <section aria-labelledby="what-we-do-title" className="lm-solution border-b border-black/10 bg-white px-5 py-14 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-[1160px]">
        <p className="lm-blockmarke m-0">{de ? "Was wir machen" : "What we do"}</p>
        <div className="mt-3 flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-end">
          <h2 id="what-we-do-title" className="m-0 max-w-[720px] text-[clamp(30px,4vw,48px)] font-black leading-[1.02] tracking-[-.045em]">
            {de ? "Wir bauen den Weg von der Google-Suche bis zum Auftrag." : "We build the path from Google search to booked work."}
          </h2>
          <a href="#book" className="lm-cta inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full bg-navy px-5 text-[13px] font-black text-white no-underline">
            {de ? "Meinen Plan für Platz 1 bauen" : "Build my plan to reach #1"}
            <svg viewBox="0 0 16 16" fill="none" aria-hidden className="size-3.5"><path d="M3 8h9M8.5 4.5L12 8l-3.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </a>
        </div>

        <div ref={carousel} onScroll={followScroll} className="lm-solution-steps mt-10 sm:mt-12">
          {steps.map((step, index) => (
            <article key={step.label} aria-label={`${index + 1} / ${steps.length}: ${step.label}`}>
              <div className="lm-solution-visual"><RoadmapIllustration step={step.visual} /></div>
              <p className="lm-blockmarke m-0 mt-5"><span className="mr-2 text-navy/55">0{index + 1}</span>{step.label}</p>
              <h3 className="m-0 mt-2 text-[20px] font-black leading-[1.12] tracking-[-.025em] text-ink">{step.title}</h3>
              <p className="m-0 mt-3 max-w-[35ch] text-[14px] leading-[1.55] text-graphite">{step.text}</p>
            </article>
          ))}
        </div>
        <div className="lm-solution-carousel-controls" aria-label={de ? "Schritte auswählen" : "Choose a step"}>
          <button type="button" onClick={() => moveTo(activeStep - 1)} disabled={activeStep === 0} aria-label={de ? "Vorheriger Schritt" : "Previous step"}>←</button>
          <span className="tnum" aria-live="polite"><b>{activeStep + 1}</b> / {steps.length}</span>
          <span className="lm-solution-dots" aria-hidden>
            {steps.map((step, index) => <i key={step.label} data-active={index === activeStep} />)}
          </span>
          <button type="button" onClick={() => moveTo(activeStep + 1)} disabled={activeStep === steps.length - 1} aria-label={de ? "Nächster Schritt" : "Next step"}>→</button>
        </div>
      </div>
    </section>
  );
}

export function TermsSection({ locale }: { locale: Locale }) {
  const de = locale === "de";
  return (
    <section aria-label={de ? "Die Konditionen" : "The terms"} className="lm-terms mb-10 mt-10 sm:mb-14 sm:mt-14">
      <div className="mx-auto max-w-[1160px] px-5 sm:px-8">
        {/* WHAT YOU RISK: NOTHING.
            The order is the sales logic: first what it costs, then why saying no later
            costs nothing, and last what we do NOT promise. That last point is what makes
            the others believable: say openly where you give no guarantee and you are
            trusted on the rest. That is exactly where the providers tradespeople
            complain about in their reviews fall down. */}
        <div>
          {/* NO HEADLINE. The price on the left and the four promises on the
              right say the same as the old line "you can leave whenever you like", only
              evidenced rather than asserted. A headline that repeats what sits below it
              costs height and pushes the price under the fold. */}
          <p className="lm-blockmarke m-0">{de ? "Die Konditionen" : "The terms"}</p>

          <div className="mt-4 grid gap-3.5 lg:grid-cols-[minmax(0,.72fr)_minmax(0,1.28fr)]">
            <div className="flex flex-col justify-center rounded-[18px] border border-hairline bg-white p-6 shadow-[0_1px_2px_rgba(28,23,18,.03),0_10px_30px_rgba(28,23,18,.045)] sm:p-7">
              {/* "Starts at" rather than "Where it starts": the first says the
                  prices begin here, the second sounds like the only price there is. */}
              <p className="lm-blockmarke m-0">{de ? "Ab" : "Starts at"}</p>
              <p className="m-0 mt-1.5 flex items-baseline gap-1.5">
                <span className="tnum text-[40px] font-black leading-none tracking-[-.045em] sm:text-[46px]">$199</span>
                <span className="text-[14px] font-bold text-graphite">{de ? "im Monat" : "a month"}</span>
              </p>
              <p className="m-0 mt-1 text-[13px] leading-[1.4] text-graphite">
                {de ? "nach einem Aufbau ab $499" : "after a build from $499"}
              </p>
              {/* IT HAS TO SAY THAT THIS IS THE ENTRY POINT. "$199 a month"
                  on its own reads like our price when it is the lower edge. Learning that
                  only on the call feels like a setup, and clearing that feeling away is
                  what this section is for, not producing it. The other prices are left
                  out on purpose: what fits depends on the findings, and a price table in
                  a cold report invites comparison before anyone knows what they are
                  comparing. */}
              <p className="m-0 mt-2.5 inline-flex w-fit rounded-full bg-navy-soft/60 px-2.5 py-1 text-[11.5px] font-bold leading-[1.3] text-navy">
                {de ? "mehrere Modelle, je nach Bedarf" : "different plans for what you need"}
              </p>
            </div>

            <ul className="m-0 grid list-none gap-px overflow-hidden rounded-[18px] border border-hairline bg-hairline p-0 shadow-[0_1px_2px_rgba(28,23,18,.03),0_10px_30px_rgba(28,23,18,.045)] sm:grid-cols-2">
              {[
                /* THE LINE ALONE, NO SECOND SENTENCE.
                   A promise with two lines of explanation under it is two lines nobody
                   reads, so every line now carries what used to sit below it.

                   EVERY LINE HERE NEEDS A SOURCE in `context/business.md` or in the three
                   agreements under `projects/sales/vertrag/`. Until 20.09.2026 this list
                   said "no competitor of yours in your area", an exclusivity promise that
                   appears in none of the four documents; the only thing to be found on it
                   was the expressly NON-exclusive licence in clause 07. Struck on
                   20.09.2026 rather than written into the contracts. Whoever adds a line
                   here changes business.md and the agreements first. */
                { en: "Thirty days money back", de: "Dreißig Tage Geld zurück" },
                { en: "No minimum term", de: "Keine Mindestlaufzeit" },
                { en: "Accounts in your name", de: "Konten auf Ihren Namen" },
                { en: "One setup, then it runs", de: "Einmal einrichten, dann läuft es" },
                { en: "The same person every time", de: "Immer dieselbe Ansprechperson" },
                { en: "A five-minute report every month", de: "Jeden Monat ein Report" },
              ].map((z, k, alle) => (
                /* AN ODD COUNT LEAVES THE LAST TILE ON ITS OWN, with a grey block gaping
                   beside it. So the last one spans both columns instead of inventing an
                   argument just to make the grid come out even. */
                <li key={z.en} className={`bg-white px-5 py-3 sm:px-6 sm:py-[18px] ${
                  alle.length % 2 === 1 && k === alle.length - 1 ? "sm:max-lg:col-span-2" : ""}`}>
                  <b className="flex items-center gap-2.5 text-[14.5px] font-black leading-[1.3] tracking-[-.018em] sm:text-[15.5px] sm:leading-[1.32]">
                    <span className="grid size-[20px] shrink-0 place-items-center rounded-full bg-[#2c7048] text-white">
                      <svg viewBox="0 0 16 16" fill="none" aria-hidden className="size-[12px]"><path d="M3.5 8.4l3 3L12.5 5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </span>
                    <span className="min-w-0">{z[locale]}</span>
                  </b>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>
    </section>
  );
}
