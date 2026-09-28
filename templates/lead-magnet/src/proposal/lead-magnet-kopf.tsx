/* # multilingual-data: the locale tables below are what a client reads,
   so a German value there is the German report and not a German comment. */
"use client";

/* The section head of the cold report: one badge, five chapters.
 *
 * WHY: "the sections all carry different headings, the flow of the
 * lead magnet is not really readable any more." Measured the same day, what he
 * saw held up: of five sections exactly one carried a badge ("The path"), the rest
 * opened with a bare heading. Anyone scrolling sees a run of statements, not a
 * report with chapters.
 *
 * The number carries real information here, it is not decoration: the order is the
 * report's argument. The industry first, so that our own finding reads as an
 * opportunity and not as an accusation. Then the finding. Then the path. Then the
 * appointment. Reorder them and the arc is gone, so the reader may see it.
 *
 * The hero is excluded: it is the entry, not a chapter, and a "00" above it
 * would be exactly the decorative number this file sets out to avoid.
 */

import { useEffect, useState } from "react";

type Locale = "en" | "de";
type Text = { en: string; de: string };

export type Kapitel = {
  schluessel: string;
  nummer: string;
  kicker: Text;
  title: Text;
};

/** The five chapters, in one place, so that number and order cannot drift apart.
 *  Move a section and you change its number here in the same go. */
export const KAPITEL: Record<"branche" | "befund" | "termin", Kapitel> = {
  branche: {
    schluessel: "branche",
    nummer: "01",
    kicker: { en: "The industry", de: "Die Branche" },
    /* TWO LINES, NOT THREE. At `max-w-[19ch]`, 51 characters
       break into three lines and push the three numbers off the bottom of the
       screen. The word "three" was there twice anyway: the three numbers sit
       directly below and count themselves. */
    title: {
      en: "Where almost everyone loses money",
      de: "Wo fast jeder Geld verliert",
    },
  },
  befund: {
    schluessel: "befund",
    nummer: "01",
    kicker: { en: "Your business", de: "Ihr Betrieb" },
    title: { en: "Where you stand today", de: "Wo Sie heute stehen" },
  },
  termin: {
    schluessel: "termin",
    nummer: "02",
    kicker: { en: "Your next step", de: "Ihr nächster Schritt" },
    /* Cut to two lines as well, same reason as chapter 01:
       at 19ch, 44 characters are three lines, and the calendar sits directly
       below them. */
    title: {
      en: "One reply, then we plan it",
      de: "Eine Antwort, dann planen wir",
    },
  },
};

/** Number, chapter name, statement. Always in this form, always at this size.
 *  `hell` inverts the colours for the dark closing section. */
export function SektionsKopf({ kapitel, locale, hell = false, className = "" }: {
  kapitel: Kapitel;
  locale: Locale;
  hell?: boolean;
  className?: string;
}) {
  return (
    /* The id is the anchor the chapter bar in the header watches and jumps to.
       scroll-mt keeps the heading clear of the sticky header after a jump. */
    <div id={`kapitel-${kapitel.schluessel}`} className={`lm-kopf scroll-mt-[84px] ${className}`}>
      <p className={`m-0 flex items-center gap-2.5 lm-kapitelmarke ${hell ? "text-white/55" : "text-pewter"}`}>
        <span className={`tnum ${hell ? "text-white/80" : "text-navy"}`}>{kapitel.nummer}</span>
        <span aria-hidden className={`h-px w-6 ${hell ? "bg-white/30" : "bg-hairline"}`} />
        {kapitel.kicker[locale]}
      </p>
      <h2 className={`lm-h-aussage m-0 mt-3 max-w-[19ch] font-black ${hell ? "text-white" : ""}`}>
        {kapitel.title[locale]}
      </h2>
    </div>
  );
}

/* ------------------------------------------------ Where am I right now? ---
 * WHY: "it would be cool if we have a roadmap in the header bar
 * that shows which section of the report we are in right now, that runs along as we
 * scroll down the page. That gives a clear orientation."
 *
 * The report is long, and whoever arrives at chapter 03 has lost sight of the
 * beginning. The bar answers two questions at once: where am I, and how much is
 * still to come. Both without scrolling, and a click jumps there.
 *
 * Only the active chapter shows its name. Four names side by side would be a
 * second navigation in the header and would compete with the two buttons on the
 * right; the other three stay as a digit, which is enough to count by.
 */

// "branche" was taken out of the report on 21.09.2026, because three industry
// numbers were the same for every business. The entry stays in KAPITEL so that an
// old reference does not break; the bar does not know about it.
export const KAPITEL_FOLGE = ["befund", "termin"] as const;

/** The topmost chapter currently sitting in the upper third of the window. `null` as
 *  long as the reader is still in the hero -- the bar then shows nothing, because there
 *  is nothing to orient by. */
export function useAktivesKapitel(): string | null {
  const [aktiv, setAktiv] = useState<string | null>(null);
  useEffect(() => {
    /* BUILT WITH IntersectionObserver FIRST, THEN MEASURED AND DROPPED (06.09.2026):
       the observer hangs on the chapter head, and once that has scrolled off the top
       it reports nothing any more. Measured, the bar showed no chapter at all at two
       of four scroll positions.

       What counts is not "which head is visible" but "which head did I last scroll
       past". A scroll counter answers that in one line. Four measurements per frame
       are cheap, and throttling them to one frame keeps them out of the scroll
       path. */
    let angefordert = false;
    const marke = 96; // just below the sticky header
    const messen = () => {
      angefordert = false;
      let letztes: string | null = null;
      for (const s of KAPITEL_FOLGE) {
        const el = document.getElementById(`kapitel-${s}`);
        if (el && el.getBoundingClientRect().top <= marke) letztes = s;
      }
      setAktiv(letztes);
    };
    const beiScroll = () => {
      if (angefordert) return;
      angefordert = true;
      requestAnimationFrame(messen);
    };
    messen();
    window.addEventListener("scroll", beiScroll, { passive: true });
    window.addEventListener("resize", beiScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", beiScroll);
      window.removeEventListener("resize", beiScroll);
    };
  }, []);
  return aktiv;
}

/** Four digits in the header, the active one carries its name. A click jumps to the chapter. */
export function ChapterBar({ aktiv, locale }: { aktiv: string | null; locale: Locale }) {
  const de = locale === "de";
  return (
    <nav aria-label={de ? "Kapitel des Berichts" : "Report chapters"} className="lm-leiste hidden items-center gap-1 lg:flex">
      {KAPITEL_FOLGE.map((s) => {
        const k = KAPITEL[s];
        const an = aktiv === s;
        return (
          <a
            key={s}
            href={`#kapitel-${s}`}
            aria-current={an ? "true" : undefined}
            className={`lm-leiste-glied flex items-center gap-2 rounded-full px-2.5 py-1.5 no-underline ${
              an ? "bg-navy-soft text-navy" : "text-pewter hover:text-graphite"
            }`}
          >
            <span className="tnum text-[11.5px] sm:text-[10.5px] font-black">{k.nummer}</span>
            {an ? <span className="whitespace-nowrap text-[11px] font-bold">{k.kicker[locale]}</span> : null}
          </a>
        );
      })}
    </nav>
  );
}
