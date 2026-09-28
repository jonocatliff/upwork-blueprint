"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { KAPITEL, ChapterBar, SektionsKopf, useAktivesKapitel } from "./lead-magnet-kopf";
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

type SectionKey = "maps" | "profile" | "website";
type ExecutiveAction = NonNullable<ProposalData["actions"]>["items"][number];

const copy = {
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
} as const;

function scoreTone(score: number | null) {
  if (score == null) return "border-slate-300 bg-slate-100 text-slate-700";
  if (score >= 80) return "border-emerald-200 bg-emerald-50 text-emerald-800";
  if (score >= 55) return "border-amber-200 bg-amber-50 text-amber-800";
  return "border-red-200 bg-red-50 text-red-800";
}

function profileEvidence(row: GbpAuditRow | undefined) {
  if (!row?.value) return null;
  const value = row.value.trim().replace(/[.]$/, "");
  if (row.label.toLowerCase() === "reviews") {
    const numbers = value.match(/[\d.,]+/g) ?? [];
    if (numbers.length >= 2) {
      return `The profile has ${numbers[0]} Google reviews with an average rating of ${numbers[1]} stars.`;
    }
  }
  return `The checked profile currently shows this for ${row.label.toLowerCase()}: ${value}.`;
}

function websiteGapEvidence(element: CroElement | undefined) {
  const key = element?.key;
  const messages: Record<string, string> = {
    lead_form: "The website has no form a customer can complete.",
    form_short: "The enquiry form asks for more than four things, and every extra field loses submissions.",
    form_button_says_outcome: "The form's button does not say what happens next, so the last click is the vaguest one.",
    phone_speed: "The page takes longer than two seconds on a phone, and most of the visit is spent waiting.",
    click_to_call: "The phone number cannot be called with one tap on a mobile.",
    online_booking: "The website offers no way to book online.",
    response_time: "The website does not tell customers when they will hear back.",
    social_proof_numbers: "The website gives no concrete proof of how much work the business has completed.",
    video_top: "Customers do not see a personal introduction near the top of the website.",
    video_testimonials: "The website shows no customer experience in a video.",
    logo_wall: "The website shows no recognised customers, partners or memberships.",
    email_capture: "Visitors who are not ready to call have no email follow-up option.",
  };
  if (key && messages[key]) return messages[key];
  if (!element?.label) return "The website does not make the next step to an enquiry clear.";
  return `The website does not currently show ${element.label.toLowerCase()}.`;
}

function Score({ value, compact = false, label = "Score", id }: { id: string; value: number | null; compact?: boolean; label?: string }) {
  return (
    <span className={`lm-score tnum inline-flex shrink-0 flex-col justify-center rounded-[10px] border font-black tracking-[-0.04em] ${scoreTone(value)} ${compact ? "min-w-[84px] px-3 py-2" : "min-w-[96px] px-3.5 py-2.5 sm:min-w-[124px] sm:px-5 sm:py-4"}`}>
      <small className="mb-1 text-[7px] font-black uppercase tracking-[.08em] opacity-60">{label}</small>
      <span className={compact ? "text-[20px] leading-none" : "text-[26px] leading-none sm:text-4xl"}><CountUp value={value} id={id} /><small className="ml-0.5 text-[.42em] font-bold opacity-60">/100</small></span>
    </span>
  );
}

/** The mark of the business: its logo, or its first letter when the logo fails to load.
 *
 *  THIS IS NOT A COSMETIC FLAW (measured 06.09.2026). A third-party service looks the
 *  logos up by domain, and for some businesses it holds none: it answered 404 and the
 *  report showed three empty boxes right beside the recipient's name, in the header, in
 *  the hero and above the closing block. One report in three checked was affected. */
function ClientMark({
  url, name, imageClass, fallbackClass, domain,
}: { url?: string; name: string; imageClass: string; fallbackClass: string; domain?: string }) {
  /* TWO SOURCES, THEN THE LETTER. Every data row written so
     far carries `icons.duckduckgo.com`, which returns 404 for accessasap.com:
     the report showed a grey placeholder instead of his logo, on the "Prepared
     for" line. Rather than repair 36 data rows, the component falls back to
     Google's service; that heals all the older reports too. */
  const [level, setLevel] = useState(0);
  // NO SECOND HOST. The original fell back to Google's favicon service, which
  // told Google which client had opened the report and which company it was
  // about, from the client's own browser. This report loads nothing from
  // anywhere: a missing icon shows the initial instead.
  const sources = [url].filter((q): q is string => typeof q === "string" && q.startsWith("data:"));
  const missing = level >= sources.length;
  const setMissing = () => setLevel((s) => s + 1);
  // LOOK, DO NOT JUST LISTEN. The image often fails before React has attached its
  // handlers: by then the `error` event is long past, so the empty box simply stays
  // there (measured 06.09.2026 on the live page, after `onError` alone changed nothing).
  const watch = (bild: HTMLImageElement | null) => {
    if (bild && bild.complete && bild.naturalWidth === 0) setMissing();
  };
  if (missing) {
    return <b className={fallbackClass}>{name.slice(0, 1)}</b>;
  }
  return <img key={sources[level]} ref={watch} src={sources[level]} alt={name} onError={setMissing} className={imageClass} />;
}


/* WHY THIS SECTION COUNTS AT ALL.
 *
 * One sentence, one icon, nothing else. Open the section and what follows is a list of
 * findings; without this line the reader has no idea why that list should concern him. A
 * paragraph in the same spot would go unread, because the finding sits right below it.
 *
 * The figures from chapter 01 are deliberately NOT repeated here. That chapter says what
 * the trade loses; this one says why this section is what decides it. */
/* NO MORE DISCLOSURE. The report is now a hero, three open chapters,
   the price, the calendar: one page you scroll through. That retires the
   expand button, the chevron and the whole anchor mechanism that used to
   compensate for the jump on toggling: what never closes never jumps. */
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
        {/* NO COLUMN OF ITS OWN ON THE PHONE: 28 px for two
            digits made the headline wrap at half width. There the number sits
            in front of the label, and from `sm` up it is back on the far left. */}
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
      {/* THE CHAPTER NUMBER AS A WATERMARK. It sits behind the
          content in the DOM so that `div:first-child` still matches the header
          row, and `z-0` puts it visually underneath. */}
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

/** Everything after the first sentence: the rest, which belongs in the expanded row. */
function restSentences(text: string): string {
  const rest = text.trim().slice(firstSentence(text).length).trim();
  return rest;
}

/** A frame that comes into being only once it nears the screen.
 *
 *  The booking calendar is a third-party service, and loading it pulls in more than half a
 *  million characters of JavaScript plus a Facebook tracker: measured 06.09.2026 as the
 *  cause of half a second of blocked screen, although it sits right at the bottom.
 *  `loading="lazy"` alone did not help: the browser judged it close enough. */
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

function CloseSection({ data, onPoster }: { data: ProposalData; onPoster: () => void }) {
  const t = copy;
  // THE SAME ROLE FOR BOTH, no division of labour. The first draft
  // gave each of them a remit of his own, and the first thing a reader then wonders is
  // which of the two he will get. "Co-founder" on both says the opposite: it is these
  // two people, and it makes no difference who picks up.
  // The title now sits in the section header (KAPITEL.termin); only the roles stay here.
  const closeCopy: { roles: Record<string, string> } = { roles: {} };
  // NO SUBHEADING. It listed what happens on the call, but anyone
  // who gets this far has the whole report behind him and knows that. The headline says
  // what he walks away with, and the calendar sits below it; anything in between only
  // pushes the appointment further down.
  return (
    <section id="book" className="lm-close relative overflow-hidden border-t border-white/15 bg-navy-deep px-5 py-8 text-white sm:px-8 sm:py-10">
      <div className="relative mx-auto max-w-[1160px]">
        <div className="mb-5 max-w-[720px] sm:mb-6">
          {/* NO MORE LOGO PAIRING. The same line sits up in the
              header, where it stays with the reader down the whole page; a second time
              above the close it says nothing new and only pushes the appointment down. */}
          <SektionsKopf kapitel={KAPITEL.termin} hell />
        </div>
        <div className="mx-auto grid max-w-[760px] gap-5">
          {/* THE SUMMARY NOW SITS HERE. Between two large sections it interrupted for no reason; in the
              close it is the second action beside the appointment: the sheet he shows
              his partner before he books. */}
          {data.onePager?.url ? (
            <button type="button" onClick={onPoster} className="flex w-full items-center gap-4 rounded-2xl border border-white/25 bg-white/10 p-3 text-left backdrop-blur-sm transition-colors hover:bg-white/15">
              <img src={`/_next/image?url=${encodeURIComponent(data.onePager.url)}&w=256&q=75`} alt="" aria-hidden loading="lazy" decoding="async" className="h-[62px] w-[84px] shrink-0 rounded-lg bg-white object-cover object-top" />
              <span className="min-w-0 flex-1">
                <span className="lm-blockmarke block !text-[var(--color-on-navy-muted)]">To pass on</span>
                <span className="mt-1 block text-[17px] font-black leading-[1.15] tracking-[-.02em] text-white">Your full report in one page</span>
              </span>
              <span className="shrink-0 rounded-full bg-white px-4 py-2 text-[12.5px] font-black text-navy-deep">Open</span>
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
              {/* NO TEAM NOTE. The sentence from that row sat above
                  the two faces and explained that there are two of us, which is what the
                  two faces already show. */}
            </div>

          </div>

          <aside className="overflow-hidden rounded-2xl border border-white/70 bg-white text-ink"><div className="border-b border-slate-200 px-5 py-4"><span className="lm-datenlabel rounded-full bg-emerald-50 px-2 py-1 !text-emerald-800">Free · answer in the thread</span><div className="mt-2 flex items-center justify-between gap-3"><h3 className="m-0 text-xl font-black">{t.book}.</h3><CalendarCheck2 size={20} className="shrink-0 text-navy" /></div><p className="mb-0 mt-2 max-w-[62ch] text-[12.5px] leading-[1.45] text-graphite">Reply to this message on Upwork. Then we map the next 12 weeks: what to fix first, what to build and how to compete for the top spot.</p></div>{data.close.bookingUrl ? <SpaeterRahmen src={data.close.bookingUrl} title={t.book} className="h-[560px] w-full sm:h-[820px] lg:h-[790px]" /> : /^https?:/.test(data.close.ctaUrl) ? <a href={data.close.ctaUrl} target="_blank" rel="noreferrer" className="m-5 inline-flex min-h-12 items-center justify-center rounded-xl bg-navy px-5 font-black text-white no-underline">{data.close.ctaLabel}</a> : <p className="m-5 rounded-xl bg-navy px-5 py-3.5 text-center text-[15px] font-black text-white">{data.close.ctaLabel}</p>}</aside>
        </div>
      </div>
    </section>
  );
}

// The sender's own profiles. They live here rather than in the report data: they
// belong to him, not to a client, and never change from report to report.
// Four hand-drawn borders. They are deliberately not identical: a rectangle
// that repeats exactly looks like a CSS border again.
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
  const t = copy;
  // Google's own address for a profile, built from the place ID: it opens the
  // exact listing we measured, rather than a search for it.
  const gbpPlaceId = String((data.findings.gbp as { profile?: { place_id?: string } } | undefined)?.profile?.place_id ?? "");
  const gbpUrl = gbpPlaceId ? `https://www.google.com/maps/place/?q=place_id:${encodeURIComponent(gbpPlaceId)}` : "";
  const activeChapter = useAktivesKapitel();
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
  const profileAction = firstProfileGap?.label === "Description" ? "Add a clear profile description"
    : firstProfileGap ? `Fix ${firstProfileGap.label.toLowerCase()} in the profile`
      : "Upload one recent photo this week";
  const websiteActions: Record<string, string> = {
    social_proof_numbers: "Show proof in numbers on the website",
    online_booking: "Add an online booking route",
    video_top: "Add a short introduction video",
    video_testimonials: "Add one customer video",
    logo_wall: "Show recognised clients or partners",
    response_time: "Promise a clear response time",
    email_capture: "Add an email follow-up route",
  };
  const websiteAction = performance != null && performance < 50
    ? `Improve mobile performance (${performance}/100)`
    : firstWebsiteGap
      ? ((firstWebsiteGap.key ? websiteActions[firstWebsiteGap.key] : undefined) ?? `Add ${firstWebsiteGap.label.toLowerCase()}`)
      : "Keep testing the enquiry path";
  const websiteEvidence = performance != null && performance < 50
    ? "The most important content on the mobile page loads too slowly."
    : websiteGapEvidence(firstWebsiteGap);
  const currentProfileEvidence = profileEvidence(firstProfileGap);
  const currentReviewEvidence = profileEvidence(reviewRow);
  const fallbackActions: ExecutiveAction[] = [
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
      // Short, readable in one breath. This used to be two
      // sentences reading "ranks outside the top three at ... checked locations within
      // 5 km": the same statement, only too long for anyone to finish.
      if (mapWinnerLeads) evidence = `Outside the top three at ${mapWinnerLeads[1]} of ${mapWinnerLeads[2]} nearby searches. ${mapWinnerLeads[4]} leads.`;
      if (mapClientLeads) evidence = `You lead overall, but sit outside the top three at ${mapClientLeads[1]} of ${mapClientLeads[2]} nearby searches.`;
      const mapAbsence = evidence.match(/^The profile is absent from (\d+) of (\d+) map checks(?: for .+)?\.$/i);
      if (mapAbsence) evidence = `You do not show up at all in ${mapAbsence[1]} of ${mapAbsence[2]} nearby searches.`;
      evidence = evidence
        .replace(/^The profile combines/i, "Your Google profile combines")
        .replace(/^The profile mixes/i, "Your Google profile mixes")
        .replace(/^The website does not/i, "Your website does not")
        .replace(/^The website gives no expected reply time\.?$/i, "Your website does not tell customers when they will hear back.");
      if (/\benquiry[ -]?signals?\b/i.test(evidence)) evidence = websiteEvidence;
      const reviewFragment = evidence.match(/^\s*([\d.,]+)\s*,?\s*rated\s*([\d.,]+)/i);
      if (reviewFragment) evidence = `The profile has ${reviewFragment[1]} Google reviews with an average rating of ${reviewFragment[2]} stars.`;
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
  const mapsVerdict = mapClient?.topThreePoints === 0 ? "Your listing does not reach the top three anywhere in this grid."
    : mapAhead === 0 && tiedLeaders > 0 ? "Your listing shares the widest measured Maps coverage in this grid."
      : mapAhead === 0 ? "Your listing has the widest measured Maps coverage in this grid."
        : "Other listings reach the top three more often across this grid.";
  // The verdict beside a score follows the score. Until 05.09.2026 every row that
  // was not "good" counted as a gap, including "warn" (only checkable inside the
  // account), so a green 92 sat beside "Customers are missing key details".
  const categoryGap = data.findings.gbp?.auditRows?.find((row) => row.label === "Categories" && row.status === "bad");
  const profileStrong = scores.profile != null && scores.profile >= 80;
  const profileFinding = categoryGap ? "Some categories may give customers the wrong idea about the service."
    : profileStrong ? "The profile answers the main questions customers have." : "The profile has gaps; the rows below show which ones.";
  const websiteStrong = scores.website != null && scores.website >= 80;
  const lcpSeconds = Number.parseFloat(String(data.cro?.speed?.lcp ?? "").replace(",", "."));
  const loadMeasured = Number.isFinite(lcpSeconds);
  const loadsQuickly = loadMeasured && lcpSeconds <= 2.5;
  const websiteFinding = websiteStrong && loadsQuickly ? "The website loads quickly and makes the next step easy."
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
      {/* THE HEADER STAYS PUT AND CARRIES THE APPOINTMENT. The report
          is long; a reader convinced halfway down should not have to scroll to the end
          first. Frosted glass, so the text below shows through instead of looking cut off. */}
      <header className="sticky top-0 z-40 bg-canvas/80 px-5 backdrop-blur-md sm:px-8"><nav className="mx-auto flex min-h-[68px] max-w-[1160px] items-center justify-between gap-5 border-b border-black/15"><span className="inline-flex items-center gap-2.5 sm:gap-3">{data.clientFaviconUrl || data.clientName ? <>{/* Dark ground with white type in the header: `bg-navy-soft` comes out dark here, so
    the letter was barely readable on screen (checked 06.09.2026). */}
<ClientMark url={data.clientFaviconUrl} domain={data.clientDomain} name={data.clientName} imageClass="hidden h-6 w-auto max-w-[96px] rounded-md object-contain sm:block" fallbackClass="hidden size-7 place-items-center rounded-md bg-navy text-[11px] font-black text-white sm:grid" /><span className="hidden max-w-[220px] truncate text-[13px] font-bold text-ink sm:inline">{data.clientName}</span></> : null}</span><ChapterBar aktiv={activeChapter} /><span className="flex items-center gap-3 sm:gap-4">{data.onePager?.url ? (<button type="button" onClick={() => setPosterOpen(true)} className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-black/15 px-3 text-[12.5px] font-bold text-graphite hover:border-navy/35 hover:bg-navy-soft/50 hover:text-navy sm:min-h-9 sm:px-3.5"><svg viewBox="0 0 16 16" fill="none" aria-hidden className="size-3.5"><rect x="2.5" y="2" width="11" height="12" rx="1.6" stroke="currentColor" strokeWidth="1.6" /><path d="M5.5 6h5M5.5 9h5M5.5 12h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg><span className="hidden sm:inline">Report in one page</span></button>) : null}<a href="#book" className="lm-cta inline-flex min-h-11 items-center gap-1.5 rounded-full bg-navy px-4 text-[12.5px] font-black text-white no-underline sm:min-h-9 sm:px-5 sm:text-[13px]">Plan for #1<svg viewBox="0 0 16 16" fill="none" aria-hidden className="size-3.5"><path d="M3 8h9M8.5 4.5L12 8l-3.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></a></span></nav></header>

      <section className="lm-hero relative px-5 py-8 sm:px-8 sm:py-11"><div aria-hidden className="pointer-events-none absolute -right-16 top-8 text-[clamp(80px,13vw,190px)] font-black tracking-[-.08em] text-navy/[.035] [writing-mode:vertical-rl]">PRIVATE</div><div className={`relative mx-auto grid w-full min-w-0 max-w-[1160px] items-center gap-7 [&>*]:min-w-0`}><div className="max-w-[760px]"><span className="inline-flex max-w-full items-center gap-3 rounded-full border border-black/10 bg-white/85 py-2 pl-2 pr-5 shadow-xs"><ClientMark url={data.clientFaviconUrl} domain={data.clientDomain} name={data.clientName} imageClass="h-11 w-auto max-w-[150px] rounded-lg object-contain" fallbackClass="grid size-11 place-items-center rounded-full bg-navy-soft text-[15px] text-navy" /><span className="min-w-0"><span className="lm-datenlabel block">{t.preparedFor}</span><span className="block truncate text-[17px] font-black leading-tight tracking-[-.02em] sm:text-[19px]">{data.clientName}</span>{/* THE TWO ADDRESSES WE ARE TALKING ABOUT. The whole report is about his profile and his site, yet neither of them was clickable: anyone wanting to check whether we are right had to go searching. Checking is exactly what he should do. */}<span className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11.5px] font-bold text-navy">{gbpUrl ? <a href={gbpUrl} target="_blank" rel="noreferrer" className="no-underline hover:underline">Google profile ↗</a> : null}{data.clientDomain ? <a href={`https://${data.clientDomain}`} target="_blank" rel="noreferrer" className="truncate no-underline hover:underline">{data.clientDomain} ↗</a> : null}</span></span></span><h1 className="mt-5 max-w-[15ch] text-[clamp(38px,4.4vw,60px)] font-black leading-[.98] tracking-[-.055em]">{t.title}</h1>{/* NO SECOND LINE IN THE HERO: the headline says what the report is, and the first finding sits in chapter one. */}{/* THE APPOINTMENT IS ALREADY HERE. A reader convinced by the
                    first sentence should not have to scroll eight screens to book. */}
                <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2"><a href="#book" className="lm-cta inline-flex min-h-12 items-center gap-2 rounded-xl bg-navy px-6 text-[15px] font-black text-white no-underline">Build my plan to reach #1<svg viewBox="0 0 16 16" fill="none" aria-hidden className="size-4"><path d="M3 8h9M8.5 4.5L12 8l-3.5 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg></a></div></div>
        {/* WHAT WE LOOKED AT. The three tiles stood there with no
            headline and had to explain themselves; the line above them turns three
            terms into a statement: this is the scope of the audit. */}
        <div>
        {/* The proof of who wrote this. The border is drawn, not
          computed: four slightly different paths, so the cards do not look
          stamped out. The two brand marks are the only foreign colours in the
          document, so the reader takes them as evidence rather than as a
          footnote. */}
        {/* THE SCOPE STRIP IS GONE. "Whole website, Google
            profile, Google visibility" said the same thing as the three chapter
            headings right below it, only without a result. */}
        </div>
      </div></section>

      {/* CHAPTER 01 IS GONE. Three trade
          figures (42 hours to respond, 31 percent, half of the clicks) applied
          to every business alike. Open a report about YOUR company and the first
          thing you read is a statistic about everybody else. The three figures
          live on in `lead-magnet-losses.tsx` in case they are ever wanted
          somewhere else. */}

      <section className="lm-analysis border-y border-hairline px-5 py-10 sm:px-8 sm:py-12"><div className="mx-auto max-w-[1160px]"><SektionsKopf kapitel={KAPITEL.befund} className="mb-8 sm:mb-10" />

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
        <Saeule sectionKey="maps" kicker={`01 · ${t.mapsSection}`} title={t.maps} score={scores.maps} compactScore finding={mapsVerdict}><div className="grid gap-6 rounded-2xl border border-hairline bg-white p-5 lg:grid-cols-[minmax(320px,.95fr)_minmax(0,1.05fr)]">{data.findings.geoGrid ? <GeoGrid data={data.findings.geoGrid} showNote={false} nackt /> : null}<div className="grid content-start gap-4">{data.findings.geoGrid?.winners?.length ? <KartenGewinner points={data.findings.geoGrid?.client?.topThreePoints ?? null} ranks={ranks} rows={kartenZeilen(data.findings.geoGrid, t.you, ranks.length || 25)} allRivals={kartenKontextZeilen(data.findings.geoGrid)} total={ranks.length || 25} title={t.mapWinners} /> : null}{data.findings.geoGrid?.aiVisibility ? <KiSuche data={data.findings.geoGrid.aiVisibility} /> : null}</div></div></Saeule>
        <Saeule sectionKey="profile" kicker={`02 · ${t.profileSection}`} title={t.profile} score={scores.profile} finding={profileFinding}>{data.findings.gbp ? <GbpPanel icons={reportProfileIcons} data={data.findings.gbp} requireComplete={data.templateVersion === "lead-magnet-v1"} /> : null}</Saeule>
        <Saeule sectionKey="website" kicker={`03 · ${t.websiteSection}`} title={t.website} score={scores.website} finding={websiteFinding}><WebsiteDetail data={data} /></Saeule>
      </div>
      </div></section>

      <WhatWeDoSection />

      {data.onePager?.url && posterOpen ? (
        <div role="dialog" aria-modal="true" aria-label="Your full report in one page" onClick={() => setPosterOpen(false)} className="fixed inset-0 z-[80] flex flex-col items-center gap-3 overflow-auto bg-ink/85 p-4 backdrop-blur-sm sm:p-8">
          <div className="sticky top-0 z-10 flex w-full max-w-[860px] items-center justify-between gap-4 text-white">
            <a href={data.onePager.url} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()} className="text-[13px] font-bold text-white underline underline-offset-4">Open in a new tab ↗</a>
            <button type="button" onClick={() => setPosterOpen(false)} className="rounded-full bg-white/15 px-4 py-2 text-[13px] font-bold text-white">Close</button>
          </div>
          <img src={data.onePager.url} alt={`One-page summary for ${data.clientName}`} onClick={(event) => event.stopPropagation()} className="w-full max-w-[860px] rounded-xl bg-white shadow-[0_24px_80px_rgba(0,0,0,.45)]" />
        </div>
      ) : null}
      <TermsSection />
      <CloseSection data={data} onPoster={() => setPosterOpen(true)} />
      {/* The six questions that come up on every call, below the calendar:
          whoever books stops reading here, and whoever does not book has his
          objections at exactly this point. The answers have been in the data
          all along and were simply never shown. */}
      {(data.faq?.length ?? 0) > 0 ? (
        <section aria-label="Common questions" className="border-t border-hairline bg-canvas px-5 py-10 sm:px-8 sm:py-12">
          <div className="mx-auto max-w-[880px]">
            <p className="lm-datenlabel m-0">Before you ask</p>
            <h2 className="mt-2 text-[clamp(26px,3vw,36px)] font-black leading-[1.05] tracking-[-.04em]">
              What everyone asks at this point.
            </h2>
            <dl className="mt-6 grid gap-3">
              {(data.faq ?? []).slice(0, 10).map((eintrag, index) => (
                /* CLOSED ON THE PHONE. Six open answers
                   run to a good 2,000 px, two screens of text ahead of the
                   calendar, and a reader without that question does not read
                   its answer. From `sm` up everything is open again, where
                   length costs nothing. One template, two behaviours. */
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
