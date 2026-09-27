"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { KAPITEL, KapitelLeiste, SektionsKopf, useAktivesKapitel } from "./lead-magnet-kopf";
import {
  reportProfileIcons,
  CalendarCheck2,
  ChevronDown,
} from "./service-icons";
import type {
  CroElement,
  GbpAuditRow,
  ProposalData,
} from "./types";
import { GbpPanel } from "./exhibits/GbpPanel";
import { GeoGrid } from "./exhibits/GeoGrid";
import { KartenGewinner, KiSuche, kartenKontextZeilen, kartenZeilen } from "./lead-magnet-karte";
import { WebsiteDetail } from "./lead-magnet-website";
import { ProposalStyles } from "./ui";
import { LeadMagnetStyles } from "./lead-magnet-styles";
import { CountUp, ReportMotion } from "./lead-magnet-motion";
import {
  TermsSection,
  WhatWeDoSection,
} from "./lead-magnet-solution";

type Locale = "en" | "de";
type SectionKey = "maps" | "profile" | "website";
type ExecutiveAction = NonNullable<ProposalData["actions"]>["items"][number];

const copy = {
  en: {
    preparedFor: "Prepared for",
    title: "Your full online performance in one page.",
    checkedTitle: "What we looked at",
    checkedWebsite: "Entire website",
    checkedProfile: "Google Business Profile",
    checkedVisibility: "Google visibility",
    summary: "Fix this now",
    stand: "This report follows your customer",
    overall: "Overall score",
    journeyMaps: "How they find you",
    journeyProfile: "How they choose you",
    journeyWebsite: "How they contact you",
    maps: "Google visibility",
    mapsSection: "Competitors",
    profile: "Google Business Profile",
    profileSection: "Your profile",
    website: "Website",
    websiteSection: "Your website",
    test: "What we checked",
    evidence: "What the map shows",
    next: "What to change",
    testValue: "25 Google Maps searches across the service area",
    nextMaps: "Complete the profile, strengthen the page for the main service and repeat the same scan in 8–12 weeks.",
    seo: "Search checked",
    seoEmpty: "No reliable local search term was available.",
    lighthouse: "Official Google Lighthouse report",
    lighthouseNote: "Google's Lighthouse test of the homepage on a phone: lab data from one run, so two runs can differ by a few points.",
    conversion: "Website essentials",
    // No count in this sentence: the badge beside the list already prints the
    // live one, and a hardcoded number here went on saying 15 while the engine
    // had grown to 18 (20.09.2026).
    conversionNote: "The things that help a visitor understand, trust and contact the business.",
    present: "present",
    missing: "missing",
    notNeeded: "not needed here",
    mapWinners: "Who customers see most often in Google Maps",
    spots: "of 25 spots in the top 3",
    you: "You",
    reviewsWord: "reviews",
    currentPage: "Current mobile page",
    noScreenshot: "The website was checked, but no reliable page screenshot was returned in this run.",
    leave: "Prepared for your call",
    book: "Send one message and we start",
    footer: "Private audit · not indexed by search engines",
  },
  de: {
    preparedFor: "Erstellt für",
    title: "Ihre gesamte Online-Leistung auf einer Seite.",
    checkedTitle: "Was wir angesehen haben",
    checkedWebsite: "Gesamte Website",
    checkedProfile: "Google-Unternehmensprofil",
    checkedVisibility: "Google-Sichtbarkeit",
    summary: "Jetzt korrigieren",
    stand: "Dieser Report folgt Ihrem Kunden",
    overall: "Gesamtwert",
    journeyMaps: "Wie Kunden Sie finden",
    journeyProfile: "Wie Kunden Sie auswählen",
    journeyWebsite: "Wie Kunden Sie kontaktieren",
    maps: "Google-Sichtbarkeit",
    mapsSection: "Wettbewerber",
    profile: "Google-Unternehmensprofil",
    profileSection: "Ihr Profil",
    website: "Website",
    websiteSection: "Ihre Website",
    test: "Was wir geprüft haben",
    evidence: "Was die Karte zeigt",
    next: "Was zu ändern ist",
    testValue: "25 Google-Maps-Suchen im Einzugsgebiet",
    nextMaps: "Profil vervollständigen, die Seite für die Hauptleistung stärken und denselben Test in 8–12 Wochen wiederholen.",
    seo: "Geprüfte Suche",
    seoEmpty: "Es war kein belastbarer lokaler Suchbegriff verfügbar.",
    lighthouse: "Offizieller Google-Lighthouse-Bericht",
    lighthouseNote: "Googles Lighthouse-Test der Startseite auf dem Handy: Labordaten aus einem Lauf, zwei Läufe können um ein paar Punkte abweichen.",
    conversion: "Was die Website braucht",
    conversionNote: "Die Elemente, die Besuchern helfen, Angebot, Vertrauen und Kontaktweg zu verstehen.",
    present: "vorhanden",
    missing: "fehlen",
    notNeeded: "hier nicht nötig",
    mapWinners: "Wen Kunden in Google Maps am häufigsten sehen",
    spots: "von 25 Punkten in den Top 3",
    you: "Sie",
    reviewsWord: "Bewertungen",
    currentPage: "Aktuelle mobile Seite",
    noScreenshot: "Die Website wurde geprüft, aber in diesem Lauf kam kein belastbarer Screenshot zurück.",
    leave: "Für Ihren Termin vorbereitet",
    book: "Eine Nachricht, und wir starten",
    footer: "Private Analyse · nicht von Suchmaschinen indexiert",
  },
} as const;

function scoreTone(score: number | null) {
  if (score == null) return "border-slate-300 bg-slate-100 text-slate-700";
  if (score >= 80) return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (score >= 55) return "border-amber-200 bg-amber-50 text-amber-800";
  return "border-red-200 bg-red-50 text-red-800";
}

function profileEvidence(row: GbpAuditRow | undefined, locale: Locale) {
  if (!row?.value) return null;
  const value = row.value.trim().replace(/[.]$/, "");
  if (row.label.toLowerCase() === "reviews") {
    const numbers = value.match(/[\d.,]+/g) ?? [];
    if (numbers.length >= 2) {
      return locale === "de"
        ? `Das Profil hat ${numbers[0]} Google-Bewertungen mit durchschnittlich ${numbers[1]} Sternen.`
        : `The profile has ${numbers[0]} Google reviews with an average rating of ${numbers[1]} stars.`;
    }
  }
  return locale === "de"
    ? `Im geprüften Profil steht bei „${row.label}“: ${value}.`
    : `The checked profile currently shows this for ${row.label.toLowerCase()}: ${value}.`;
}

function websiteGapEvidence(element: CroElement | undefined, locale: Locale) {
  const key = element?.key;
  const messages: Record<string, { en: string; de: string }> = {
    lead_form: { en: "The website has no form a customer can complete.", de: "Auf der Website gibt es kein Formular, das ein Kunde ausfüllen kann." },
    form_short: { en: "The enquiry form asks for more than four things, and every extra field loses submissions.", de: "Das Anfrageformular fragt mehr als vier Dinge ab, und jedes weitere Feld kostet Anfragen." },
    form_button_says_outcome: { en: "The form's button does not say what happens next, so the last click is the vaguest one.", de: "Der Button sagt nicht, was danach passiert, also ist der letzte Klick der unklarste." },
    phone_speed: { en: "The page takes longer than two seconds on a phone, and most of the visit is spent waiting.", de: "Die Seite braucht auf dem Handy länger als zwei Sekunden, und der Besuch besteht großteils aus Warten." },
    click_to_call: { en: "The phone number cannot be called with one tap on a mobile.", de: "Die Telefonnummer lässt sich auf dem Smartphone nicht mit einem Tipp anrufen." },
    online_booking: { en: "The website offers no way to book online.", de: "Auf der Website kann derzeit kein Termin online gebucht werden." },
    response_time: { en: "The website does not tell customers when they will hear back.", de: "Die Website sagt Kunden nicht, wann sie eine Antwort erhalten." },
    social_proof_numbers: { en: "The website gives no concrete proof of how much work the business has completed.", de: "Die Website zeigt keine konkreten Zahlen zu bereits erledigten Aufträgen." },
    video_top: { en: "Customers do not see a personal introduction near the top of the website.", de: "Kunden sehen oben auf der Website keine persönliche Vorstellung." },
    video_testimonials: { en: "The website shows no customer experience in a video.", de: "Die Website zeigt keine Kundenerfahrung als Video." },
    logo_wall: { en: "The website shows no recognised customers, partners or memberships.", de: "Die Website zeigt keine bekannten Kunden, Partner oder Mitgliedschaften." },
    email_capture: { en: "Visitors who are not ready to call have no email follow-up option.", de: "Besucher, die noch nicht anrufen möchten, haben keine E-Mail-Option." },
  };
  if (key && messages[key]) return messages[key][locale];
  if (!element?.label) return locale === "de" ? "Der nächste Schritt zur Anfrage ist auf der Website nicht klar." : "The website does not make the next step to an enquiry clear.";
  return locale === "de" ? `Auf der Website fehlt: ${element.label}.` : `The website does not currently show ${element.label.toLowerCase()}.`;
}

function Score({ value, compact = false, label = "Score", id }: { id: string; value: number | null; compact?: boolean; label?: string }) {
  return (
    <span className={`lm-score tnum inline-flex shrink-0 flex-col justify-center rounded-[10px] border font-black tracking-[-0.04em] ${scoreTone(value)} ${compact ? "min-w-[84px] px-3 py-2" : "min-w-[96px] px-3.5 py-2.5 sm:min-w-[124px] sm:px-5 sm:py-4"}`}>
      <small className="mb-1 text-[7px] font-black uppercase tracking-[.08em] opacity-60">{label}</small>
      <span className={compact ? "text-[20px] leading-none" : "text-[26px] leading-none sm:text-4xl"}><CountUp value={value} id={id} /><small className="ml-0.5 text-[.42em] font-bold opacity-60">/100</small></span>
    </span>
  );
}

/** Das Zeichen des Betriebs: sein Logo, und wenn das nicht kommt, sein Anfangsbuchstabe.
 *
 *  DAS IST KEIN SCHOENHEITSFEHLER (gemessen 06.09.2026). Die Logos holt ein fremder Dienst
 *  ueber die Domain, und fuer manche Betriebe hat er keines -- dann antwortete er 404 und im
 *  Bericht standen drei leere Kaesten, genau neben dem Namen des Empfaengers: im Kopf, im
 *  Hero und ueber dem Abschluss. Betroffen war jeder dritte der geprueften Berichte. */
function KundenZeichen({
  url, name, klasseBild, klasseErsatz, domain,
}: { url?: string; name: string; klasseBild: string; klasseErsatz: string; domain?: string }) {
  /* ZWEI QUELLEN, DANN DER BUCHSTABE. Die Zeilen bis heute
     tragen `icons.duckduckgo.com`, das fuer accessasap.com 404 liefert -- der
     Bericht zeigte einen grauen Platzhalter statt seines Logos, in der Zeile
     "Prepared for". Statt 36 Datenzeilen zu reparieren faellt die Komponente
     auf Googles Dienst zurueck; damit heilen auch alle alten Berichte. */
  const [stufe, setStufe] = useState(0);
  // NO SECOND HOST. The original fell back to Google's favicon service, which
  // told Google which client had opened the report and which company it was
  // about, from the client's own browser. This report loads nothing from
  // anywhere: a missing icon shows the initial instead.
  const quellen = [url].filter((q): q is string => typeof q === "string" && q.startsWith("data:"));
  const fehlt = stufe >= quellen.length;
  const setFehlt = () => setStufe((s) => s + 1);
  // NACHSEHEN, NICHT NUR ZUHOEREN. Das Bild scheitert oft, bevor React seine Handler
  // angehaengt hat -- das `error`-Ereignis ist dann schon vorbei und der leere Kasten bleibt
  // stehen (gemessen 06.09.2026 an der Live-Seite, nachdem `onError` allein nichts aenderte).
  const pruefen = (bild: HTMLImageElement | null) => {
    if (bild && bild.complete && bild.naturalWidth === 0) setFehlt();
  };
  if (fehlt) {
    return <b className={klasseErsatz}>{name.slice(0, 1)}</b>;
  }
  return <img key={quellen[stufe]} ref={pruefen} src={quellen[stufe]} alt={name} onError={setFehlt} className={klasseBild} />;
}


/* WARUM DIESER ABSCHNITT UEBERHAUPT ZAEHLT.
 *
 * Ein Satz, ein Zeichen, sonst nichts. Wer den Abschnitt aufklappt, sieht danach eine Liste
 * von Befunden; ohne diese Zeile weiss er nicht, warum ihn diese Liste kuemmern sollte. Ein
 * Absatz an derselben Stelle wuerde niemand lesen, weil der Befund direkt darunter steht.
 *
 * Die Zahlen aus Kapitel 01 werden hier bewusst NICHT wiederholt. Dort steht, was die Branche
 * kostet; hier steht, warum genau dieser Abschnitt darueber entscheidet. */
/* KEIN AUFKLAPPER MEHR. Der Bericht ist jetzt Hero, drei offene Kapitel,
   Preis, Kalender -- eine Seite, durch die man scrollt. Damit fallen der
   Aufklapp-Knopf, der Chevron und die ganze Anker-Mechanik weg, die das
   Wegspringen beim Umschalten ausglich: was nie zuklappt, springt nie. */
function Saeule({
  sectionKey,
  kicker,
  title,
  score,
  secondaryScore,
  finding,
  compactScore = false,
  children,
}: {
  sectionKey: SectionKey;
  kicker: string;
  title: string;
  score: number | null;
  secondaryScore?: { label: string; value: number | null };
  finding: string;
  compactScore?: boolean;
  children: ReactNode;
}) {
  const [index = "", purpose = kicker] = kicker.split(" · ");
  return (
    <section id={`report-${sectionKey}`} data-pillar={sectionKey} className="lm-pillar relative scroll-mt-[76px] overflow-hidden rounded-[24px] border border-hairline bg-white">
      <div className="relative z-[1] grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-3 px-4 py-3.5 text-left sm:grid-cols-[28px_minmax(0,1fr)_auto] sm:px-7 lg:grid-cols-[34px_minmax(0,1fr)_auto] lg:gap-5">
        {/* AUF DEM TELEFON KEINE EIGENE SPALTE: 28 px fuer
            zwei Ziffern liessen die Ueberschrift auf halber Breite umbrechen.
            Die Nummer steht dort vor der Marke, ab `sm` wieder links aussen. */}
        <span aria-hidden className="hidden text-xs font-black tracking-[.09em] text-navy sm:block">{index}</span>
        <div className="min-w-0">
          <span data-onepager="pillar" className="block text-[11px] font-black uppercase tracking-[.09em] text-navy sm:text-[12px] sm:tracking-[.1em]"><span className="sm:hidden">{index} · </span>{purpose}</span>
          <h2 className="m-0 mt-1 text-[19px] font-black leading-[1.12] tracking-[-.03em] text-ink sm:text-[21px]">{title}</h2>
        </div>
        <div data-onepager="score" data-score={score} className="col-start-1 row-start-2 flex flex-wrap gap-2 sm:col-start-2 lg:col-start-3 lg:row-start-1 lg:justify-end"><Score value={score} compact={compactScore} id={`score-${sectionKey}`} />{secondaryScore ? <span className={`tnum inline-flex min-w-[92px] flex-col justify-center rounded-[10px] border px-3 py-2 ${scoreTone(secondaryScore.value)}`}><small className="mb-1 text-[7px] font-black uppercase tracking-wide opacity-70">{secondaryScore.label}</small><b className="text-xl leading-none">{secondaryScore.value ?? "—"}<small className="text-[11px] sm:text-[10px] opacity-60">/100</small></b></span> : null}</div>
        {/* The verdict sentence stays in the markup for the one-pager only;
            the row itself is name and number. */}
        <span data-onepager="finding" className="sr-only">{finding}</span>
      </div>
      <div data-lm-motion={`panel-${sectionKey}`} id={`analysis-${sectionKey}`} className="relative z-[1] px-4 py-5 sm:px-7 sm:py-7">{children}</div>
      {/* DIE KAPITELZIFFER ALS WASSERZEICHEN. Sie steht im
          DOM hinter dem Inhalt, damit `div:first-child` weiter die Kopfzeile
          trifft, und liegt durch `z-0` optisch darunter. */}
      <span aria-hidden className="lm-kapitelzahl pointer-events-none absolute -top-8 right-2 z-0 select-none text-[150px] font-black leading-none tracking-[-.06em] text-navy/[.06] sm:-top-12 sm:right-6 sm:text-[210px]">{index}</span>
    </section>
  );
}

/** The first sentence of a longer instruction: the fix table shows one clear
 *  sentence per row, the rest stays in the evidence section. */
function firstSentence(text: string): string {
  const match = text.trim().match(/^.*?[.!?](?=\s|$)/);
  return (match ? match[0] : text).trim();
}

/** Alles nach dem ersten Satz — der Rest, der in die Ausklapp-Zeile gehört. */
function restSentences(text: string): string {
  const rest = text.trim().slice(firstSentence(text).length).trim();
  return rest;
}

/** Ein Rahmen, der erst entsteht, wenn er in die Naehe des Bildschirms kommt.
 *
 *  Der Buchungskalender ist ein fremder Dienst und bringt beim Laden ueber eine halbe Million
 *  Zeichen JavaScript samt Facebook-Zaehler mit -- gemessen 06.09.2026 der Grund fuer eine
 *  halbe Sekunde blockierten Bildschirm, obwohl er ganz unten steht. `loading="lazy"` allein
 *  half nicht: der Browser hielt ihn fuer nah genug. */
function SpaeterRahmen({ src, title, className }: { src: string; title: string; className?: string }) {
  const [zeigen, setZeigen] = useState(false);
  const [huelle, setHuelle] = useState<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!huelle || zeigen) return;
    if (typeof IntersectionObserver === "undefined") {
      const frame = requestAnimationFrame(() => setZeigen(true));
      return () => cancelAnimationFrame(frame);
    }
    const beobachter = new IntersectionObserver(
      (eintraege) => { if (eintraege.some((e) => e.isIntersecting)) { setZeigen(true); beobachter.disconnect(); } },
      { rootMargin: "600px" },
    );
    beobachter.observe(huelle);
    return () => beobachter.disconnect();
  }, [huelle, zeigen]);
  return (
    <div ref={setHuelle} className={className}>
      {zeigen ? <iframe src={src} title={title} className="h-full w-full border-0" /> : <div className="h-full w-full bg-slate-50" aria-hidden />}
    </div>
  );
}

function CloseSection({ data, locale, onPoster }: { data: ProposalData; locale: Locale; onPoster: () => void }) {
  const t = copy[locale];
  // DIESELBE ROLLE FUER BEIDE, keine Arbeitsteilung. Der erste Entwurf
  // gab jedem eine eigene Zustaendigkeit, und wer das liest, fragt sich als Erstes, an wen
  // er denn nun geraet. "Co-founder" bei beiden sagt das Gegenteil: es sind genau diese
  // zwei, und es ist egal, wer abnimmt.
  // Der Titel steht jetzt im Sektionskopf (KAPITEL.termin), hier bleiben nur die Rollen.
  const closeCopy: { roles: Record<string, string> } = { roles: {} };
  // OHNE UNTERZEILE. Sie zaehlte auf, was im Gespraech passiert --
  // aber wer hier ankommt, hat den ganzen Bericht hinter sich und weiss das. Die
  // Ueberschrift sagt, was er danach hat, und darunter steht der Kalender; alles
  // dazwischen schiebt nur den Termin nach unten.
  return (
    <section id="book" className="lm-close relative overflow-hidden border-t border-white/15 bg-navy-deep px-5 py-8 text-white sm:px-8 sm:py-10">
      <div className="relative mx-auto max-w-[1160px]">
        <div className="mb-5 max-w-[720px] sm:mb-6">
          {/* KEINE LOGO-PAARUNG MEHR. Dieselbe Zeile steht oben im
              Kopf und begleitet den Leser die ganze Seite; ein zweites Mal ueber dem
              Abschluss sagt sie nichts Neues und schiebt nur den Termin nach unten. */}
          <SektionsKopf kapitel={KAPITEL.termin} locale={locale} hell />
        </div>
        <div className="mx-auto grid max-w-[760px] gap-5">
          {/* DIE ZUSAMMENFASSUNG STEHT JETZT HIER. Zwischen zwei grossen Abschnitten unterbrach sie ohne Grund; im
              Abschluss ist sie die zweite Handlung neben dem Termin — das Blatt, das er
              seinem Partner zeigt, bevor er bucht. */}
          {data.onePager?.url ? (
            <button type="button" onClick={onPoster} className="flex w-full items-center gap-4 rounded-2xl border border-white/25 bg-white/10 p-3 text-left backdrop-blur-sm transition-colors hover:bg-white/15">
              <img src={`/_next/image?url=${encodeURIComponent(data.onePager.url)}&w=256&q=75`} alt="" aria-hidden loading="lazy" decoding="async" className="h-[62px] w-[84px] shrink-0 rounded-lg bg-white object-cover object-top" />
              <span className="min-w-0 flex-1">
                <span className="lm-blockmarke block !text-[var(--color-on-navy-muted)]">{locale === "de" ? "Zum Weitergeben" : "To pass on"}</span>
                <span className="mt-1 block text-[17px] font-black leading-[1.15] tracking-[-.02em] text-white">{locale === "de" ? "Ihr ganzer Report auf einer Seite" : "Your full report in one page"}</span>
              </span>
              <span className="shrink-0 rounded-full bg-white px-4 py-2 text-[12.5px] font-black text-navy-deep">{locale === "de" ? "Ansehen" : "Open"}</span>
            </button>
          ) : null}
          <div className="overflow-hidden rounded-2xl border border-white/20 bg-black/10">
            <div className="grid gap-4 px-4 py-4 sm:grid-cols-2 sm:px-5">
              {(data.team ?? []).slice(0, 2).map((person) => (
                <div key={person.name} className="flex items-center gap-3">
                  {person.photo ? <img src={person.photo} alt={person.name} className="size-12 shrink-0 rounded-full border-2 border-white/20 object-cover" /> : <span className="grid size-12 shrink-0 place-items-center rounded-full border-2 border-white/20 bg-white text-[12px] font-black text-navy-deep">{person.name.slice(0, 1)}</span>}
                  <p className="m-0 min-w-0 text-[13px] leading-[1.35]"><strong className="block text-[14px] text-white">{person.name}</strong>{closeCopy.roles[person.name] ? <span className="text-white/80">{closeCopy.roles[person.name]}</span> : null}</p>
                </div>
              ))}
              {/* KEINE TEAM-NOTIZ. Der Satz aus der
                  Zeile stand ueber den beiden Gesichtern und erklaerte, dass wir zu zweit sind —
                  das sieht man an den beiden Gesichtern. */}
            </div>

          </div>

          <aside className="overflow-hidden rounded-2xl border border-white/70 bg-white text-ink"><div className="border-b border-slate-200 px-5 py-4"><span className="lm-datenlabel rounded-full bg-emerald-50 px-2 py-1 !text-emerald-800">{locale === "de" ? "Kostenlos · Antwort im Chat" : "Free · answer in the thread"}</span><div className="mt-2 flex items-center justify-between gap-3"><h3 className="m-0 text-xl font-black">{t.book}.</h3><CalendarCheck2 size={20} className="shrink-0 text-navy" /></div><p className="mb-0 mt-2 max-w-[62ch] text-[12.5px] leading-[1.45] text-graphite">{locale === "de" ? "Antworten Sie auf diese Nachricht auf Upwork. Dann planen wir die nächsten 12 Wochen: was zuerst zu ändern ist, was gebaut wird und wie Sie um den Spitzenplatz konkurrieren." : "Reply to this message on Upwork. Then we map the next 12 weeks: what to fix first, what to build and how to compete for the top spot."}</p></div>{data.close.bookingUrl ? <SpaeterRahmen src={data.close.bookingUrl} title={t.book} className="h-[560px] w-full sm:h-[820px] lg:h-[790px]" /> : /^https?:/.test(data.close.ctaUrl) ? <a href={data.close.ctaUrl} target="_blank" rel="noreferrer" className="m-5 inline-flex min-h-12 items-center justify-center rounded-xl bg-navy px-5 font-black text-white no-underline">{data.close.ctaLabel}</a> : <p className="m-5 rounded-xl bg-navy px-5 py-3.5 text-center text-[15px] font-black text-white">{data.close.ctaLabel}</p>}</aside>
        </div>
      </div>
    </section>
  );
}

// Lukas eigene Profile. Sie stehen hier und nicht in den Berichtsdaten: sie
// gehoeren zu ihm, nicht zu einem Kunden, und aendern sich pro Bericht nie.
// Vier von Hand gezogene Raender. Sie sind bewusst nicht identisch: ein
// Rechteck, das sich exakt wiederholt, sieht wieder aus wie ein CSS-Rahmen.
const SKIZZEN_RAND = [
  "M9 8 C80 4, 200 6, 292 9 C295 70, 294 140, 291 192 C210 195, 90 194, 8 191 C5 130, 6 70, 9 8 Z",
  "M7 11 C90 6, 195 9, 293 6 C296 65, 292 135, 294 189 C200 193, 95 190, 6 194 C9 130, 4 68, 7 11 Z",
  "M10 6 C85 10, 205 4, 290 11 C293 72, 296 138, 292 190 C205 187, 88 192, 9 189 C6 128, 7 66, 10 6 Z",
  "M6 9 C95 5, 190 11, 294 7 C291 68, 295 142, 290 193 C195 189, 100 195, 8 190 C11 132, 3 70, 6 9 Z",
];

function JourneyIcon({ stage }: { stage: SectionKey }) {
  const actionId = `journey-${stage}-action`;
  const paint = (
    <defs>
      <linearGradient id={actionId} x1="0" y1="0" x2="1" y2="1">
        <stop stopColor="var(--lm-journey-action-light)" />
        <stop offset="1" stopColor="var(--color-orange)" />
      </linearGradient>
    </defs>
  );
  if (stage === "maps") {
    return (
      <svg viewBox="0 0 40 40" fill="none" aria-hidden>
        {paint}
        <circle cx="17" cy="17" r="11" fill="currentColor" fillOpacity=".08" stroke="currentColor" strokeWidth="2.2" />
        <path d="m25 25 8 8" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
        <path d="M17 10.5a6 6 0 0 1 6 6c0 4.5-6 9.5-6 9.5s-6-5-6-9.5a6 6 0 0 1 6-6Z" stroke="currentColor" strokeWidth="1.9" />
        <circle cx="17" cy="16.5" r="2.2" fill={`url(#${actionId})`} />
      </svg>
    );
  }
  if (stage === "profile") {
    return (
      <svg viewBox="0 0 40 40" fill="none" aria-hidden>
        {paint}
        <rect x="5" y="7" width="30" height="26" rx="7" fill="currentColor" fillOpacity=".08" stroke="currentColor" strokeWidth="2.2" />
        <circle cx="15" cy="17" r="4" stroke="currentColor" strokeWidth="2" />
        <path d="M9.5 27c.8-3.4 2.7-5 5.5-5s4.7 1.6 5.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="m28 13 1.7 3.4 3.8.6-2.8 2.7.7 3.8-3.4-1.8-3.4 1.8.7-3.8-2.8-2.7 3.8-.6L28 13Z" fill={`url(#${actionId})`} />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 40 40" fill="none" aria-hidden>
      {paint}
      <rect x="4.5" y="6" width="31" height="27" rx="6" fill="currentColor" fillOpacity=".08" stroke="currentColor" strokeWidth="2.2" />
      <path d="M4.5 13h31" stroke="currentColor" strokeWidth="2" />
      <circle cx="9.5" cy="9.5" r="1.2" fill="currentColor" />
      <circle cx="13.5" cy="9.5" r="1.2" fill={`url(#${actionId})`} />
      <path d="M12 20a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3h-6l-4.5 3v-3H15a3 3 0 0 1-3-3v-5Z" fill={`url(#${actionId})`} />
      <path d="M17 22.5h8" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function LeadMagnet({ data }: { data: ProposalData }) {
  const locale: Locale = data.language ?? data.findings.gbp?.locale ?? "en";
  const t = copy[locale];
  // Googles eigene Adresse fuer ein Profil, aus der Place-ID gebaut: sie
  // oeffnet genau den Eintrag, den wir gemessen haben, nicht die Suche danach.
  const gbpPlaceId = String((data.findings.gbp as { profile?: { place_id?: string } } | undefined)?.profile?.place_id ?? "");
  const gbpUrl = gbpPlaceId ? `https://www.google.com/maps/place/?q=place_id:${encodeURIComponent(gbpPlaceId)}` : "";
  const aktivesKapitel = useAktivesKapitel();
  const [posterOpen, setPosterOpen] = useState(false);
  useEffect(() => {
    if (!posterOpen) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setPosterOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [posterOpen]);
  // Read, never recompute. The three section scores and the total are measured
  // once, in the script that pulled the evidence, and this page shows exactly
  // those numbers. It used to derive its own from the same data with different
  // formulas, so the number under the client's eyes was not the number the
  // report's rules describe, and an unmeasured grid point scored a zero.
  const scores = useMemo(() => {
    const pillar = (name: string) => data.scorecard.pillars.find((entry) => entry.name === name)?.score ?? null;
    return { maps: pillar("Maps"), profile: pillar("Profile"), website: pillar("Website"), overall: data.scorecard.overall };
  }, [data]);
  const ranks = data.findings.geoGrid?.ranks ?? [];
  const missingMap = ranks.filter((rank) => rank == null).length;
  // An "open" row is one we could not grade, so it never becomes a "Fix this
  // now" action: we would be telling an owner to repair something we did not
  // measure.
  const firstProfileGap = data.findings.gbp?.auditRows?.find((row) => row.status !== "good" && row.status !== "open");
  const firstWebsiteGap = data.cro?.elements.find((element) => !element.present && !["video_top", "video_testimonials"].includes(element.key ?? ""));
  const reviewRow = data.findings.gbp?.auditRows?.find((row) => row.label.toLowerCase() === "reviews");
  const performance = data.cro?.speed?.scores?.performance ?? data.cro?.speed?.score ?? null;
  const mapTerm = data.findings.geoGrid?.keyword;
  const currentPhotoCount = data.findings.gbp?.current?.photos?.length;
  const profileAction = locale === "de"
    ? firstProfileGap?.label === "Description" ? "Profilbeschreibung ergänzen"
      : firstProfileGap ? `${firstProfileGap.label} im Google-Profil korrigieren`
        : "Diese Woche ein aktuelles Foto hochladen"
    : firstProfileGap?.label === "Description" ? "Add a clear profile description"
      : firstProfileGap ? `Fix ${firstProfileGap.label.toLowerCase()} in the profile`
        : "Upload one recent photo this week";
  const websiteActions: Record<string, { en: string; de: string }> = {
    social_proof_numbers: { en: "Show proof in numbers on the website", de: "Vertrauen mit konkreten Zahlen belegen" },
    online_booking: { en: "Add an online booking route", de: "Online-Buchung ergänzen" },
    video_top: { en: "Add a short introduction video", de: "Kurzes Vorstellungsvideo ergänzen" },
    video_testimonials: { en: "Add one customer video", de: "Ein Kundenvideo ergänzen" },
    logo_wall: { en: "Show recognised clients or partners", de: "Bekannte Kunden oder Partner zeigen" },
    response_time: { en: "Promise a clear response time", de: "Klare Antwortzeit versprechen" },
    email_capture: { en: "Add an email follow-up route", de: "E-Mail-Follow-up ergänzen" },
  };
  const websiteAction = performance != null && performance < 50
    ? (locale === "de" ? `Mobile Performance verbessern (${performance}/100)` : `Improve mobile performance (${performance}/100)`)
    : firstWebsiteGap
      ? ((firstWebsiteGap.key ? websiteActions[firstWebsiteGap.key]?.[locale] : undefined) ?? (locale === "de" ? `${firstWebsiteGap.label} ergänzen` : `Add ${firstWebsiteGap.label.toLowerCase()}`))
      : (locale === "de" ? "Anfrageweg regelmäßig testen" : "Keep testing the enquiry path");
  const websiteEvidence = performance != null && performance < 50
    ? (locale === "de" ? "Die wichtigsten Inhalte der mobilen Seite laden zu langsam." : "The most important content on the mobile page loads too slowly.")
    : websiteGapEvidence(firstWebsiteGap, locale);
  const currentProfileEvidence = profileEvidence(firstProfileGap, locale);
  const currentReviewEvidence = profileEvidence(reviewRow, locale);
  const fallbackActions: ExecutiveAction[] = locale === "de" ? [
    { art: "profile", title: missingMap ? "Einen Hauptservice überall gleich benennen" : "Hauptservice monatlich abgleichen", evidence: missingMap ? `An ${missingMap} von ${ranks.length || 25} geprüften Orten sehen Kunden das Profil nicht in den lokalen Google-Ergebnissen.` : "Kunden sehen das Profil im gesamten geprüften Gebiet.", change: `Im Profil und auf der passenden Website-Seite dieselbe Bezeichnung für ${mapTerm || "den Hauptservice"} verwenden.`, benefit: "Google kann den Betrieb der richtigen Suche zuordnen, und Kunden erkennen sofort, dass die Leistung zu ihrem Problem passt.", what: "Hauptservice in Profil und Website abgleichen.", effort: "30 Minuten · Sie + Webperson" },
    { art: "profile", title: profileAction, evidence: currentProfileEvidence || (currentPhotoCount != null ? `Im geprüften Profil sind ${currentPhotoCount} öffentliche Fotos sichtbar.` : "Die öffentlichen Profilangaben sind vollständig, aber neue Fotos halten den Eindruck aktuell."), change: firstProfileGap ? profileAction : "Ein echtes, aktuelles Foto der Arbeit oder des Teams im Google-Profil hochladen.", benefit: firstProfileGap ? "Kunden verstehen schneller, ob der Betrieb ihr Anliegen löst und wie sie Kontakt aufnehmen." : "Ein aktuelles Foto zeigt, dass der Betrieb aktiv ist, und macht den ersten Anruf weniger riskant.", what: profileAction, effort: firstProfileGap ? "45 Minuten · wir nach Freigabe" : "10 Minuten · Sie" },
    { art: "form", title: websiteAction, evidence: websiteEvidence, change: websiteAction, benefit: "Kunden, die gerade nicht anrufen können, können ihr Anliegen trotzdem senden. So gehen weniger Anfragen verloren.", what: websiteAction, effort: "1–2 Stunden · wir" },
    { art: "reviews", title: "Zehn Kunden den Bewertungslink senden", evidence: currentReviewEvidence || "Auf dem geprüften Profil sind noch keine aktuellen Kundenerfahrungen sichtbar.", change: "Zehn zufriedenen Kunden heute den direkten Google-Link senden und danach jede neue Bewertung beantworten.", benefit: "Aktuelle Erfahrungen nehmen neuen Kunden Unsicherheit und erhöhen die Chance, dass sie anrufen.", what: "Bewertungslink versenden.", effort: "30 Minuten · Sie" },
  ] : [
    { art: "profile", title: missingMap ? "Use one main service name everywhere" : "Check the main service monthly", evidence: missingMap ? `At ${missingMap} of ${ranks.length || 25} checked locations, customers do not see the profile in Google's local results.` : "Customers can see the profile across the entire checked area.", change: `Use the same wording for ${mapTerm || "the main service"} in the profile and matching website page.`, benefit: "Google can match the business to the right search, and customers can immediately see that the service fits their problem.", what: "Match the main service across Google and the website.", effort: "30 minutes · you + web person" },
    { art: "profile", title: profileAction, evidence: currentProfileEvidence || (currentPhotoCount != null ? `${currentPhotoCount} public photos are visible on the checked profile.` : "The public profile details are complete, but recent photos keep it current."), change: firstProfileGap ? profileAction : "Upload one genuine, recent photo of the work or team to the Google profile.", benefit: firstProfileGap ? "Customers understand sooner whether the business can solve their problem and how to get help." : "A recent photo proves the business is active and makes the first call feel less risky.", what: profileAction, effort: firstProfileGap ? "45 minutes · us after approval" : "10 minutes · you" },
    { art: "form", title: websiteAction, evidence: websiteEvidence, change: websiteAction, benefit: "Customers who cannot call immediately can still ask for help, so fewer enquiries are lost.", what: websiteAction, effort: "1–2 hours · us" },
    { art: "reviews", title: "Text the review link to ten customers", evidence: currentReviewEvidence || "The checked profile does not show recent customer experiences.", change: "Send ten happy customers the direct Google link today, then answer every new review.", benefit: "Recent experiences remove doubt for new customers and make them more likely to call.", what: "Send the review link.", effort: "30 minutes · you" },
  ];
  const suppliedActions = (data.actions?.items ?? [])
    .filter((action) => [action.evidence, action.change, action.benefit, action.effort].every((value) => Boolean(value?.trim())))
    .map((action) => {
      let evidence = action.evidence ?? "";
      let benefit = action.benefit ?? "";
      const mapWinnerLeads = evidence.match(/^At (\d+) of (\d+) spots(.*), customers see (.+) before you\.$/i);
      const mapClientLeads = evidence.match(/^At (\d+) of (\d+) spots(.*), customers still see another business first, most often (.+)\.$/i);
      // Kurz und in einem Atemzug lesbar. Vorher stand hier ein
      // Zweisatz mit „ranks outside the top three at ... checked locations within 5 km";
      // dieselbe Aussage, nur so lang, dass niemand sie zu Ende liest.
      if (mapWinnerLeads) evidence = `Outside the top three at ${mapWinnerLeads[1]} of ${mapWinnerLeads[2]} nearby searches. ${mapWinnerLeads[4]} leads.`;
      if (mapClientLeads) evidence = `You lead overall, but sit outside the top three at ${mapClientLeads[1]} of ${mapClientLeads[2]} nearby searches.`;
      const mapAbsence = evidence.match(/^The profile is absent from (\d+) of (\d+) map checks(?: for .+)?\.$/i);
      if (mapAbsence) evidence = `You do not show up at all in ${mapAbsence[1]} of ${mapAbsence[2]} nearby searches.`;
      evidence = evidence
        .replace(/^The profile combines/i, "Your Google profile combines")
        .replace(/^The profile mixes/i, "Your Google profile mixes")
        .replace(/^The website does not/i, "Your website does not")
        .replace(/^The website gives no expected reply time\.?$/i, "Your website does not tell customers when they will hear back.");
      if (/\b(enquiry|anfrage)[ -]?(signals?|signale?)\b/i.test(evidence)) evidence = websiteEvidence;
      const reviewFragment = evidence.match(/^\s*([\d.,]+)\s*,?\s*(?:rated|bewertet mit)\s*([\d.,]+)/i);
      if (reviewFragment) evidence = locale === "de"
        ? `Das Profil hat ${reviewFragment[1]} Google-Bewertungen mit durchschnittlich ${reviewFragment[2]} Sternen.`
        : `The profile has ${reviewFragment[1]} Google reviews with an average rating of ${reviewFragment[2]} stars.`;
      if (/^More visitors reach the phone, calendar or form\.?$/i.test(benefit)) benefit = "Customers who cannot call immediately can still ask for help, so fewer enquiries are lost.";
      return { ...action, evidence, benefit };
    });
  // Three to five real rows. The fallbacks only top up to three, never to five:
  // padded rows were what made the report look like a template.
  const executiveActions = [...suppliedActions, ...(suppliedActions.length >= 2 ? [] : fallbackActions)]
    .filter((action, index, values) => values.findIndex((candidate) => candidate.title === action.title) === index)
    .slice(0, suppliedActions.length >= 2 ? 5 : 2);
  // The strongest evidenced finding is the hook under the headline.
  const heroHook = executiveActions[0]?.evidence ?? null;
  // Where the business stands in this market, measured against the same
  // yardstick as the winners (top-three points): the leader, one of the three
  // with the most positions, or behind them. Do not turn 19/25 into "about
  // half": the same 22.09.2026 refresh exposed that false verdict.
  const mapWinnersList = data.findings.geoGrid?.winners ?? [];
  const mapClient = data.findings.geoGrid?.client;
  const mapAhead = mapClient ? mapWinnersList.filter((winner) => winner.topThreePoints > mapClient.topThreePoints).length : null;
  // The side the gaps sit on. The grid is five by five, row by row from the
  // north-west; a missing rank counts as far down. Named only when one side
  // is clearly weaker than its opposite, otherwise the gaps are spread.
  const tiedLeaders = mapClient ? mapWinnersList.filter((winner) => winner.topThreePoints === mapClient.topThreePoints).length : 0;
  const mapsVerdict = locale === "de"
    ? mapClient?.topThreePoints === 0 ? "Ihr Listing erreicht in diesem Raster nirgends die Top 3."
      : mapAhead === 0 && tiedLeaders > 0 ? "Ihr Listing teilt sich die größte gemessene Maps-Abdeckung in diesem Raster."
        : mapAhead === 0 ? "Ihr Listing hat die größte gemessene Maps-Abdeckung in diesem Raster."
          : "Andere Listings erreichen in diesem Raster häufiger die Top 3."
    : mapClient?.topThreePoints === 0 ? "Your listing does not reach the top three anywhere in this grid."
      : mapAhead === 0 && tiedLeaders > 0 ? "Your listing shares the widest measured Maps coverage in this grid."
        : mapAhead === 0 ? "Your listing has the widest measured Maps coverage in this grid."
          : "Other listings reach the top three more often across this grid.";
  // The verdict beside a score follows the score. Until 05.09.2026 every row that
  // was not "good" counted as a gap, including "warn" (only checkable inside the
  // account), so a green 92 sat beside "Customers are missing key details".
  const categoryGap = data.findings.gbp?.auditRows?.find((row) => row.label === "Categories" && row.status === "bad");
  const profileStrong = scores.profile != null && scores.profile >= 80;
  const profileFinding = locale === "de"
    ? categoryGap ? "Einige Kategorien könnten Kunden ein falsches Bild vom Angebot geben."
      : profileStrong ? "Das Profil beantwortet die wichtigsten Fragen der Kunden." : "Das Profil hat Lücken; die Zeilen darunter zeigen welche."
    : categoryGap ? "Some categories may give customers the wrong idea about the service."
      : profileStrong ? "The profile answers the main questions customers have." : "The profile has gaps; the rows below show which ones.";
  const websiteStrong = scores.website != null && scores.website >= 80;
  const lcpSeconds = Number.parseFloat(String(data.cro?.speed?.lcp ?? "").replace(",", "."));
  const loadMeasured = Number.isFinite(lcpSeconds);
  const loadsQuickly = loadMeasured && lcpSeconds <= 2.5;
  const websiteFinding = locale === "de"
    ? websiteStrong && loadsQuickly ? "Die Seite lädt schnell und macht den nächsten Schritt leicht."
      : websiteStrong && loadMeasured ? "Die Seite macht den nächsten Schritt leicht, lädt aber zu langsam."
        : !websiteStrong && loadsQuickly ? "Die Seite lädt schnell, aber Kunden finden zu wenig Beleg und keinen klaren nächsten Schritt."
          : loadMeasured ? "Die Seite lädt zu langsam und gibt Kunden zu wenig Grund für eine Anfrage."
            : websiteStrong ? "Die Seite macht Kunden den nächsten Schritt leicht." : "Die Seite gibt Kunden zu wenig Grund für eine Anfrage."
    : websiteStrong && loadsQuickly ? "The website loads quickly and makes the next step easy."
      : websiteStrong && loadMeasured ? "The website makes the next step easy, but it loads too slowly."
        : !websiteStrong && loadsQuickly ? "The site loads quickly, but customers find too little proof and no clear next step."
          : loadMeasured ? "The site loads too slowly and gives customers too little reason to enquire."
            : websiteStrong ? "The website makes the next step easy for customers." : "The website gives customers too little reason to enquire.";
  // NO VIDEO IN THE HERO. The shell fell back to a recording of its author, fetched
  // from his own storage on the client's connection, and this report loads nothing
  // from anywhere: its own policy allows media only as data or blob.

  return (
    <ReportMotion><main className="lm-report relative min-h-screen overflow-x-clip bg-canvas text-ink">
      <ProposalStyles /><LeadMagnetStyles />
      {/* DIE KOPFZEILE BLEIBT STEHEN UND TRAEGT DEN TERMIN. Der Bericht
          ist lang; wer auf halber Strecke ueberzeugt ist, soll nicht erst ans Ende scrollen
          muessen. Milchglas, damit der Text darunter durchscheint statt abgeschnitten zu wirken. */}
      <header className="sticky top-0 z-40 bg-canvas/80 px-5 backdrop-blur-md sm:px-8"><nav className="mx-auto flex min-h-[68px] max-w-[1160px] items-center justify-between gap-5 border-b border-black/15"><span className="inline-flex items-center gap-2.5 sm:gap-3">{data.clientFaviconUrl || data.clientName ? <>{/* Im Kopf dunkler Grund mit weisser Schrift: `bg-navy-soft` faellt hier dunkel aus, und
    der Buchstabe war auf dem Bildschirm kaum zu lesen (nachgesehen 06.09.2026). */}
<KundenZeichen url={data.clientFaviconUrl} domain={data.clientDomain} name={data.clientName} klasseBild="hidden h-6 w-auto max-w-[96px] rounded-md object-contain sm:block" klasseErsatz="hidden size-7 place-items-center rounded-md bg-navy text-[11px] font-black text-white sm:grid" /><span className="hidden max-w-[220px] truncate text-[13px] font-bold text-ink sm:inline">{data.clientName}</span></> : null}</span><KapitelLeiste aktiv={aktivesKapitel} locale={locale} /><span className="flex items-center gap-3 sm:gap-4">{data.onePager?.url ? (<button type="button" onClick={() => setPosterOpen(true)} className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-black/15 px-3 text-[12.5px] font-bold text-graphite hover:border-navy/35 hover:bg-navy-soft/50 hover:text-navy sm:min-h-9 sm:px-3.5"><svg viewBox="0 0 16 16" fill="none" aria-hidden className="size-3.5"><rect x="2.5" y="2" width="11" height="12" rx="1.6" stroke="currentColor" strokeWidth="1.6" /><path d="M5.5 6h5M5.5 9h5M5.5 12h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg><span className="hidden sm:inline">{locale === "de" ? "Report auf einer Seite" : "Report in one page"}</span></button>) : null}<a href="#book" className="lm-cta inline-flex min-h-11 items-center gap-1.5 rounded-full bg-navy px-4 text-[12.5px] font-black text-white no-underline sm:min-h-9 sm:px-5 sm:text-[13px]">{locale === "de" ? "Plan für Platz 1" : "Plan for #1"}<svg viewBox="0 0 16 16" fill="none" aria-hidden className="size-3.5"><path d="M3 8h9M8.5 4.5L12 8l-3.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></a></span></nav></header>

      <section className="lm-hero relative px-5 py-8 sm:px-8 sm:py-11"><div aria-hidden className="pointer-events-none absolute -right-16 top-8 text-[clamp(80px,13vw,190px)] font-black tracking-[-.08em] text-navy/[.035] [writing-mode:vertical-rl]">PRIVATE</div><div className={`relative mx-auto grid w-full min-w-0 max-w-[1160px] items-center gap-7 [&>*]:min-w-0`}><div className="max-w-[760px]"><span className="inline-flex max-w-full items-center gap-3 rounded-full border border-black/10 bg-white/85 py-2 pl-2 pr-5 shadow-xs"><KundenZeichen url={data.clientFaviconUrl} domain={data.clientDomain} name={data.clientName} klasseBild="h-11 w-auto max-w-[150px] rounded-lg object-contain" klasseErsatz="grid size-11 place-items-center rounded-full bg-navy-soft text-[15px] text-navy" /><span className="min-w-0"><span className="lm-datenlabel block">{t.preparedFor}</span><span className="block truncate text-[17px] font-black leading-tight tracking-[-.02em] sm:text-[19px]">{data.clientName}</span>{/* DIE ZWEI ADRESSEN, UEBER DIE WIR REDEN. Der ganze Bericht handelt von seinem Profil und seiner Seite, und keine der beiden war anklickbar -- wer nachsehen will, ob wir recht haben, musste selbst suchen. Genau das soll er tun. */}<span className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11.5px] font-bold text-navy">{gbpUrl ? <a href={gbpUrl} target="_blank" rel="noreferrer" className="no-underline hover:underline">{locale === "de" ? "Google-Profil ↗" : "Google profile ↗"}</a> : null}{data.clientDomain ? <a href={`https://${data.clientDomain}`} target="_blank" rel="noreferrer" className="truncate no-underline hover:underline">{data.clientDomain} ↗</a> : null}</span></span></span><h1 className="mt-5 max-w-[15ch] text-[clamp(38px,4.4vw,60px)] font-black leading-[.98] tracking-[-.055em]">{t.title}</h1>{/* KEINE ZWEITE ZEILE IM KOPF: die Ueberschrift sagt, was der Report ist, und der erste Befund steht im ersten Kapitel. */}{/* DER TERMIN STEHT SCHON HIER. Wer nach dem ersten Satz ueberzeugt
                    ist, soll nicht acht Bildschirme weit scrollen muessen, um zu buchen. */}
                <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2"><a href="#book" className="lm-cta inline-flex min-h-12 items-center gap-2 rounded-xl bg-navy px-6 text-[15px] font-black text-white no-underline">{locale === "de" ? "Meinen Plan für Platz 1 bauen" : "Build my plan to reach #1"}<svg viewBox="0 0 16 16" fill="none" aria-hidden className="size-4"><path d="M3 8h9M8.5 4.5L12 8l-3.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></a></div></div>
        {/* WAS WIR ANGESEHEN HABEN. Die drei Kacheln standen ohne
            Ueberschrift da und mussten selbst erklaeren, was sie sind — die Zeile darueber
            macht aus drei Begriffen eine Aussage: das ist der Umfang der Pruefung. */}
        <div>
        {/* Der Beleg, wer das geschrieben hat. Der Rand ist gezeichnet und nicht
          gerechnet: vier leicht unterschiedliche Pfade, damit die Karten nicht
          gestempelt wirken. Die beiden Marken sind die einzigen fremden Farben
          im Dokument, damit der Leser sie als Beleg liest und nicht als
          Fussnote. */}
        {/* DER UMFANGS-STREIFEN IST RAUS. "Ganze Website,
            Google-Profil, Google-Sichtbarkeit" sagte dasselbe wie die drei
            Kapitelueberschriften direkt darunter, nur ohne Ergebnis. */}
        </div>
      </div></section>

      {/* KAPITEL 01 IST RAUS. Drei
          Branchenzahlen -- 42 Stunden Antwortzeit, 31 Prozent, die Haelfte der
          Klicks -- galten fuer jeden Betrieb gleich. Wer einen Bericht ueber
          SEINE Firma oeffnet, liest zuerst eine Statistik ueber alle anderen.
          Die drei Zahlen leben weiter in `lead-magnet-losses.tsx`, falls sie
          je woanders gebraucht werden. */}

      <section className="lm-analysis border-y border-hairline px-5 py-10 sm:px-8 sm:py-12"><div className="mx-auto max-w-[1160px]"><SektionsKopf kapitel={KAPITEL.befund} locale={locale} className="mb-8 sm:mb-10" />

      <div className="lm-scorecard overflow-hidden rounded-[24px] border border-hairline bg-navy-deep shadow-[0_18px_52px_rgba(28,23,18,.08)]">
        <div className="lm-score-overview">
          <div className="lm-score-overall">
            <h2 className="m-0 text-[20px] font-black leading-none tracking-[-.025em] sm:text-[23px]">{t.stand}</h2>
            <div className="lm-score-total"><small>{t.overall}</small><strong className="tnum text-[46px] font-black leading-none tracking-[-.06em] sm:text-[58px]"><CountUp value={scores.overall} id="overall" /><small className="ml-1 text-[15px]">/100</small></strong></div>
          </div>
          <nav aria-label={t.stand} className="lm-report-journey">
            {[
              { key: "maps" as const, index: "01", title: t.journeyMaps },
              { key: "profile" as const, index: "02", title: t.journeyProfile },
              { key: "website" as const, index: "03", title: t.journeyWebsite },
            ].map((step) => (
                <a key={step.key} href={`#report-${step.key}`}>
                  <span className="lm-journey-mark"><JourneyIcon stage={step.key} /></span>
                  <span className="lm-journey-copy"><small>{step.index}</small><strong>{step.title}</strong></span>
                </a>
            ))}
          </nav>
        </div>
      </div>
      <div className="lm-chapters">
        <Saeule sectionKey="maps" kicker={`01 · ${t.mapsSection}`} title={t.maps} score={scores.maps} compactScore finding={mapsVerdict}><div className="grid gap-6 rounded-2xl border border-hairline bg-white p-5 lg:grid-cols-[minmax(320px,.95fr)_minmax(0,1.05fr)]">{data.findings.geoGrid ? <GeoGrid data={data.findings.geoGrid} locale={locale} showNote={false} nackt /> : null}<div className="grid content-start gap-4">{data.findings.geoGrid?.winners?.length ? <KartenGewinner punkte={data.findings.geoGrid?.client?.topThreePoints ?? null} ranks={ranks} zeilen={kartenZeilen(data.findings.geoGrid, t.you, ranks.length || 25)} alleGegner={kartenKontextZeilen(data.findings.geoGrid)} gesamt={ranks.length || 25} titel={t.mapWinners} locale={locale} /> : null}{data.findings.geoGrid?.aiVisibility ? <KiSuche data={data.findings.geoGrid.aiVisibility} locale={locale} /> : null}</div></div></Saeule>
        <Saeule sectionKey="profile" kicker={`02 · ${t.profileSection}`} title={t.profile} score={scores.profile} finding={profileFinding}>{data.findings.gbp ? <GbpPanel icons={reportProfileIcons} data={{ ...data.findings.gbp, locale }} requireComplete={data.templateVersion === "lead-magnet-v1"} /> : null}</Saeule>
        <Saeule sectionKey="website" kicker={`03 · ${t.websiteSection}`} title={t.website} score={scores.website} finding={websiteFinding}><WebsiteDetail data={data} locale={locale} /></Saeule>
      </div>
      </div></section>

      <WhatWeDoSection locale={locale} />

      {data.onePager?.url && posterOpen ? (
        <div role="dialog" aria-modal="true" aria-label={locale === "de" ? "Ihr ganzer Report auf einer Seite" : "Your full report in one page"} onClick={() => setPosterOpen(false)} className="fixed inset-0 z-[80] flex flex-col items-center gap-3 overflow-auto bg-ink/85 p-4 backdrop-blur-sm sm:p-8">
          <div className="sticky top-0 z-10 flex w-full max-w-[860px] items-center justify-between gap-4 text-white">
            <a href={data.onePager.url} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()} className="text-[13px] font-bold text-white underline underline-offset-4">{locale === "de" ? "In neuem Tab öffnen ↗" : "Open in a new tab ↗"}</a>
            <button type="button" onClick={() => setPosterOpen(false)} className="rounded-full bg-white/15 px-4 py-2 text-[13px] font-bold text-white">{locale === "de" ? "Schließen" : "Close"}</button>
          </div>
          <img src={data.onePager.url} alt={locale === "de" ? `Zusammenfassung für ${data.clientName}` : `One-page summary for ${data.clientName}`} onClick={(event) => event.stopPropagation()} className="w-full max-w-[860px] rounded-xl bg-white shadow-[0_24px_80px_rgba(0,0,0,.45)]" />
        </div>
      ) : null}
      <TermsSection locale={locale} />
      <CloseSection data={data} locale={locale} onPoster={() => setPosterOpen(true)} />
      {/* Die sechs Fragen, die auf jedem Gespraech kommen, unter dem Kalender:
          wer bucht, liest sie nicht mehr, und wer nicht bucht, hat genau
          dort seine Einwaende. Die
          Antworten liegen laengst in den Daten und wurden nur nie gezeigt. */}
      {(data.faq?.length ?? 0) > 0 ? (
        <section aria-label={locale === "de" ? "Häufige Fragen" : "Common questions"} className="border-t border-hairline bg-canvas px-5 py-10 sm:px-8 sm:py-12">
          <div className="mx-auto max-w-[880px]">
            <p className="lm-datenlabel m-0">{locale === "de" ? "Bevor Sie fragen" : "Before you ask"}</p>
            <h2 className="mt-2 text-[clamp(26px,3vw,36px)] font-black leading-[1.05] tracking-[-.04em]">
              {locale === "de" ? "Was an dieser Stelle immer gefragt wird." : "What everyone asks at this point."}
            </h2>
            <dl className="mt-6 grid gap-3">
              {(data.faq ?? []).slice(0, 10).map((eintrag, index) => (
                /* AUF DEM TELEFON ZUGEKLAPPT. Sechs offene
                   Antworten sind gut 2.000 px, also zwei Bildschirme Text vor
                   dem Kalender -- und wer eine Frage nicht hat, liest ihre
                   Antwort nicht. Ab `sm` steht wieder alles offen, dort kostet
                   Laenge nichts. Ein Template, zwei Verhalten. */
                <details key={index} open className="group rounded-2xl border border-hairline bg-white p-5 max-sm:open:pb-5 [&:not([open])]:max-sm:pb-4" ref={(el) => { if (el && typeof window !== "undefined" && window.innerWidth < 640) el.open = false; }}>
                  <summary className="-my-3 flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 py-3 [&::-webkit-details-marker]:hidden sm:my-0 sm:min-h-0 sm:items-start sm:py-0 sm:pointer-events-none">
                    <dt className="m-0 text-[15px] font-black text-slate-950">{eintrag.q}</dt>
                    <ChevronDown className="mt-0.5 size-4 shrink-0 text-navy transition-transform group-open:rotate-180 sm:hidden" />
                  </summary>
                  <dd className="m-0 mt-2 text-[14px] leading-[1.55] text-graphite">{eintrag.a}</dd>
                </details>
              ))}
            </dl>
          </div>
        </section>
      ) : null}

      <footer className="bg-canvas px-5 py-7"><div className="mx-auto flex max-w-[1160px] items-center justify-between gap-4 text-[11px] sm:text-[9px] text-pewter"><span className="inline-flex items-center gap-2"></span><span>{t.footer} · {data.dateLabel}</span></div></footer>
    </main></ReportMotion>
  );
}
