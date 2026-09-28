// The shape of one client proposal - the 7-section spec plus the visual
// evidence layer. Stored as one JSONB row per client in Supabase's
// `proposals` table (this interface IS the contract for that column) -
// never a file in the repo.
// Hard rule everywhere: an exhibit whose data failed to pull is null, and the
// section says which number is missing. Never a decorative fake.

/** How much weight a number carries. Four classes, and the difference between
 * them is the whole point: a figure we measured, a figure someone else
 * published, a conclusion we drew, and a hole we could not fill all look
 * identical on a page unless they are marked.
 *
 * "vendor" is the one worth staring at. A company selling into this trade
 * reporting its own conversion rate is marketing, and next to a government
 * statistic it looks exactly as solid. */
export type Belegklasse = "measured" | "researched" | "inference" | "gap";
export type Vertrauen = "official" | "industry-survey" | "vendor" | "estimate";

/** One source, registered once and referenced by id from every figure that
 * rests on it. A central register rather than a source field on every number:
 * the same audit pull feeds a dozen figures, and repeating its URL twelve times
 * is how twelve copies start disagreeing about its date. */
export interface Quelle {
  /** Short, stable, referenced from figures: "gbp-scrape", "semrush-2026-08". */
  id: string;
  klasse: Belegklasse;
  /** What it is, in words an owner reads: "Your Google profile, pulled by us". */
  name: string;
  /** Where it can be checked. Absent for our own pulls, required for anything
   * published by someone else. */
  url?: string;
  /** JJJJ-MM-TT. A figure without a date ages invisibly. */
  stand: string;
  /** How many things it covers, where that makes sense. */
  n?: number;
  /** Only for researched figures. Absent means unclassified, which the checker
   * treats as a defect: an unlabelled vendor number is the failure mode. */
  vertrauen?: Vertrauen;
  /** What this source does NOT prove. Often the most useful line on the page. */
  grenze?: string;
}

/** Attached to any figure that rests on a source. `quelle` names an id from the
 * register; `klasse` may narrow it, e.g. an inference drawn from a measured
 * pull. */
export interface Belegt {
  quelle?: string;
  klasse?: Belegklasse;
  /** Only for an inference: what it was drawn from, in one line. */
  basis?: string;
}

/** One link in the chain a visitor has to pass to become money. */
export interface ChainLink extends Belegt {
  /** "Storefront", "Visibility", "Lead response", "Follow-up", "Reporting". */
  name: string;
  /** What the link does, three or four words. */
  does: string;
  /** 1-100, or null when nothing about it is visible from outside. */
  score: number | null;
  /** What we found. With a null score this carries the whole verdict,
   * e.g. "No CRM found". */
  readout: string;
  /** false = scored from what is verifiable from outside, not measured.
   * The honesty note under the chain says so, and it is what makes the
   * measured numbers above it credible. */
  measured: boolean;
  /** true = we have no data on this link, which is ignorance on our side and
   * not a failure on theirs. Such a link leaves the overall average; an absent
   * thing ("no CRM found") scores zero and stays in it. */
  unknown?: boolean;
  unknownLabel?: string;
}

/** The chain. Replaces the four pillars where it is present: five links in
 * order beats four equal boxes, because it shows that the weakest one makes
 * the rest worthless. */
export interface Chain {
  overall: number;
  links: ChainLink[];
  /** Which links are measured and which are scored from outside. */
  honestyNote: string;
  /** The line that lands it, e.g. "You need all five." */
  verdict: string;
}

export interface ScorePillar extends Belegt {
  name: string;
  /** 1-100. null = honestly not applicable (shown unscored, with the reason). */
  score: number | null;
  reason: string;
}

/** The dials. Raw numbers, never formatted strings - the client turns these on
 * the page and every money figure recomputes, so the estimate becomes theirs
 * instead of ours. Absent = the page falls back to the written MoneyMath. */
export interface Assumptions {
  /** Their visits from Google per month, from the traffic pull. */
  visitsPerMonth: number;
  /** Of those, the share landing on money pages. Informational readers are
   * counted at a tenth of that, same as the audit does it. */
  serviceShare: number;
  /** Visits that turn into an enquiry, 0-1. */
  clickToLead: number;
  /** Enquiries that turn into a job, 0-1. */
  closeRate: number;
  /** What one job is worth to them. Asked on the call, never an industry average. */
  jobValue: number;
  /** The traffic the leading competitor pulls, for the visibility gap. */
  // Kept as the fallback for a client whose money search we could not price.
  competitorVisitsPerMonth: number;
  /** Deprecated input kept for old proposal rows. Country-level volume no
   * longer drives predicted visits or revenue. */
  searchVolume?: number;
  /** That search, so the page can name it beside the number. */
  moneyKeyword?: string;
  /** Where they currently rank for it, if at all. Absent means not in the top 20,
   * which means they get nothing from it. */
  moneyPosition?: number;
  /** Estimated visits earned by the currently ranking service page. Unlike
   * country-level keyword volume, this can drive the opportunity model. */
  rankingPageVisitsPerMonth?: number;
  /** The share of the ranking page's visits this client would realistically
   * take, 0-1. Until 31.08.2026 the model had no such factor, which silently
   * assumed the client captures every one of a competitor's visits and made
   * the headline figure an upper bound presented as an expectation. A visible
   * dial is the honest form: the assumption is on the page and the client can
   * argue with it. Absent on older rows, where CAPTURE_SHARE_DEFAULT applies. */
  captureShare?: number;
  currencySymbol: string;
}

/** One of the 15 conversion elements, as `code/pull_cro.py` measured it. */
export interface CroElement {
  key?: string;
  label: string;
  present: boolean;
  /** What its absence costs. Only shown for the missing ones. */
  consequence: string;
  /** The measured fact that decided the verdict, e.g. "23 of 31 pictures carry
   * a description". Green rows show it so a pass is a measurement, never a
   * compliment. Older rows lack it. */
  evidence?: string | null;
  /** False when the check does not fit how this business wins customers: a
   * café needs no enquiry form or reply-time promise. Rendered grey and kept
   * out of the score. Omitted means true. */
  applies?: boolean;
}

/** The real mobile paint, frame by frame, from PageSpeed Insights. */
export interface CroSpeed {
  lcp: string;
  score: number;
  /** The four official mobile Lighthouse category scores. Older rows may only
   * carry `score`, which is the performance score. */
  scores?: {
    performance?: number;
    accessibility?: number;
    "best-practices"?: number;
    seo?: number;
  };
  /** The three heaviest failed Lighthouse checks per category, raw. The
   * report translates the ids it knows into owner language and drops the
   * rest; a developer title never reaches the page. Older rows lack it. */
  findings?: {
    [category: string]: {
      id: string;
      title: string;
      wert: string;
      gewicht: number;
      betroffen: number;
      einsparung_ms: number;
      /** Which element Lighthouse flagged: a node label or a path. */
      wo?: string;
    }[];
  } | null;
  /** The finished page as one tall phone screenshot, beside the strip. */
  screenshot?: string | null;
  /** A compressed full-page desktop capture used for the current-page versus
   * proposed-structure comparison. The phone capture remains separate. */
  desktopScreenshot?: string | null;
  frames: { ms: number; file: string }[];
  /** The consequence line under the strip, with its source named. */
  note: string;
}

export interface CroExhibit {
  elements: CroElement[];
  have: number;
  total: number;
  /** null when the PageSpeed run failed - the section then says so. */
  speed: CroSpeed | null;
  /** One line: traffic is not the problem, the leak is. */
  read: string;
  sourcesLine: string;
}

export interface MoneyMath extends Belegt {
  /** The arithmetic, one factor per row - value plus a short label. */
  factors: { value: string; label: string }[];
  monthlyLoss: string;
  yearlyLoss: string;
  missedLeadsPerMonth: string;
  monthsToParity: string;
  /** One footnote line naming where every input came from. */
  sourcesLine: string;
}

export interface CompetitorRow extends Belegt {
  domain: string;
  isClient?: boolean;
  /** The row winning the comparison - green ground and a crown. */
  isWinner?: boolean;
  reviews: string;
  monthlyTraffic: string;
  keywords: string;
  referringDomains: string;
}

export interface Finding extends Belegt {
  /** One line: a number and what it costs them. Consequence, not diagnostic. */
  text: string;
  status: "positive" | "caution" | "critical";
  /** Written by looking at their page rather than counted by a pull, via
   * scripts/add-observed.mjs. Marked so a rerun of the generators replaces it
   * instead of stacking a second copy beside it. */
  observed?: boolean;
}

/** The search they're losing - a styled render of the LIVE SERP. Real titles,
 * real domains, real positions. Never invented, never reordered. */
export interface SerpRow {
  position: number;
  title: string;
  domain: string;
  /** Grey URL/breadcrumb line exactly as Google shows it. */
  breadcrumb?: string;
  /** The real snippet from the pull, truncated by Google itself. */
  snippet?: string;
  isClient?: boolean;
}
export interface SerpExhibit {
  keyword: string;
  /** When the live SERP opens with an AI-generated answer, name it. */
  aiOverview?: string;
  rows: SerpRow[];
  /** Shown as a band when the client is absent, e.g. "You are not in the top 20." */
  clientAbsent?: string;
  note?: string;
}

/** The map ranking grid - 25 real Google Maps searches, one per point.
 * ranks is row-major 5x5; null = not found at that point. A null grid means
 * no scan ran, and the note says why. */
export interface GeoGridExhibit {
  keyword: string;
  businessName: string;
  ranks: (number | null)[] | null;
  /** Real map of the scanned city behind the badges (generated from OSM tiles
   * at pull time; the frame spans the grid extent plus 25% margin). */
  mapImage?: string;
  attribution?: string;
  /** Set when the grid is a labelled demo from another market, not the client's. */
  demoLabel?: string;
  note: string;
  /** Distance from the centre to the outer points, in km, and the map zoom
   * each point was searched at (from 05.09.2026; older rows carry neither). */
  radiusKm?: number;
  zoom?: number;
  searchMode?: { searchPlaces: boolean; searchThisArea: boolean };
  centre?: [number, number];
  /** The three non-client listing names returned at each measured point.
   * Older rows use this to reconstruct the complete competitor field. */
  points?: { rank: number | null; top: string[]; topIds?: { cid?: string | number | null; placeId?: string | null; name?: string; rank: number }[]; coordinate?: string | null; status?: number | null }[];
  /** The competitors a customer meets first: how many of the 25 points they
   * hold a top-three spot at, from the same searches as the ranks. */
  winners?: { name: string; cid?: string | number | null; domain?: string | null; topThreePoints: number; bestRank: number | null; rating?: number | null; reviews?: number | null; category?: string | null; distanceKm?: number | null; isChain?: boolean; farLarger?: boolean; callHandlingSigns?: string[] }[];
  /** Every measured non-client Google listing, in the same ranking order as
   * winners. The closed report keeps the first three in the main table and
   * names the rest in an evidence disclosure. */
  competitors?: { name: string; cid?: string | number | null; domain?: string | null; topThreePoints: number; bestRank: number | null; rating?: number | null; reviews?: number | null; category?: string | null; distanceKm?: number | null; isChain?: boolean; farLarger?: boolean; callHandlingSigns?: string[] }[];
  /** The nearest same-trade businesses from the existing market database.
   * This explains the comparison pool; visibility still decides the leaders. */
  nearbyCompetitors?: { name: string; domain?: string | null; distanceKm: number; visibility: "both" | "maps" | "organic" | "nearby"; isChain?: boolean }[];
  nearbyRadiusKm?: number | null;
  /** How many other businesses ever reached the top three across the grid: the depth of the field, not only its leader. */
  rivals?: number | null;
  rivalsNamed?: string[] | null;
  /** Three test searches through OpenAI's web search for the trade in the area.
   *  `named` counts only answers whose cited page is the client's own site or listing. */
  aiVisibility?: {
    checkedAt: string;
    keyword: string;
    city: string;
    runs: number;
    named: number;
    alternatives: { name: string; hostname: string | null; mentions: number }[];
  };
  /** The same measure for the business itself. */
  client?: { topThreePoints: number; averageRank: number | null; rating?: number | null; reviews?: number | null; mapRating?: number | null; mapReviews?: number | null };
}

/** Legacy summary shape. Kept so already-generated proposal rows still render
 * while new proposals use the complete current/prepared profile below. */
export interface GbpPanelData {
  name: string;
  subtitle: string;
  ratingValue: number;
  reviewsCount: number;
  description?: string;
  /** Real map strip of their location, shown at the top like a live panel. */
  mapImage?: string;
  attribution?: string;
  photoLabel?: string;
}
export interface GbpAuditRow {
  label: string;
  value: string;
  /** "open" is a row the cold pull cannot grade from outside, such as reviews,
   *  which the reference audit scores against three named competitors and the last
   *  90 days. It renders as "Check" and stays out of the profile score rather
   *  than being guessed at. */
  status: "good" | "warn" | "bad" | "open";
}

export type GbpFieldStatus = "good" | "warn" | "bad" | "open" | "new";
export type GbpFieldIcon = "address" | "hours" | "phone" | "website" | "booking" | "info";

/** A finding belongs to the exact profile field it explains. A separate audit
 * table makes owners translate between two columns and is intentionally not
 * part of the new shape. */
export interface GbpInlineFinding {
  status: GbpFieldStatus;
  label: string;
  /** What is: one sentence on today's state, in the owner's own language. */
  text: string;
  /** What to do: one sentence, directly below it. `text` used to carry
   *  the instruction while the state was missing, so green rows showed a
   *  finding while amber ones showed a task: two voices in one table.
   *  Holding the two apart replaces the earlier `Fix this now` block, which
   *  repeated the same sentences a second time further down the page. */
  action?: string;
}

export interface GbpProfilePhoto {
  src: string;
  alt: string;
  label?: string;
}

export type GbpProfileActionKind = "website" | "directions" | "save" | "call" | "booking";

export interface GbpProfileAction {
  kind: GbpProfileActionKind;
  label?: string;
  href?: string;
}

export interface GbpProfileField {
  label: string;
  value: string;
  icon?: GbpFieldIcon;
  /** True only when the prepared view changes this value. */
  changed?: boolean;
  detail?: string;
  href?: string;
  finding?: GbpInlineFinding;
}

export interface GbpCategoryBlock {
  headline?: string;
  primary: string;
  primaryFinding?: GbpInlineFinding;
  secondary?: string[];
  secondaryFinding?: GbpInlineFinding;
  /** Trade categories the profile lacks and the website evidences: drafts for
   * the working session, each still to be confirmed in Google's own category
   * list. Never shown on the cold report. */
  candidates?: string[];
}

export interface GbpCopyBlock {
  headline?: string;
  text: string;
  finding?: GbpInlineFinding;
}

export interface GbpServicesBlock {
  headline?: string;
  items: string[];
  finding?: GbpInlineFinding;
}

export interface GbpProfilePost {
  headline?: string;
  date: string;
  text: string;
  href?: string;
  linkLabel?: string;
  finding?: GbpInlineFinding;
}

export interface GbpProfileReview {
  author: string;
  when: string;
  rating: number;
  text: string;
  /** Exact public owner response. null means the pull found none. */
  ownerResponse?: string | null;
  /** What to prepare next; never presented as an already-published response. */
  responseAction?: string;
}

export interface GbpReviewAnalysis {
  checkedAt: string;
  sampleSize: number;
  truncated: boolean;
  total: number;
  rating: number | null;
  /** Whole sentences, measured: newest review, last twelve months, replies. */
  sentences: string[];
  lowStarReviews: number;
  /** Set when no review is below four stars. */
  themeSentence: string | null;
  /** Complaint themes from 1-3 star reviews; count and quote verified in code. */
  themes: { label: string; count: number; quote: string }[];
  comparison: { name: string; reviews: number; rating: number | null }[];
}

/** One faithful profile state. Current and prepared use this exact same field
 * order so every proposed change can be understood without hunting for it. */
export interface GbpProfileView {
  stateLabel?: string;
  draft?: boolean;
  name: string;
  subtitle: string;
  ratingValue: number;
  reviewsCount: number;
  verified?: boolean;
  /** Only actions evidenced for this listing. A booking action is never implied. */
  actions?: GbpProfileAction[];
  photos?: GbpProfilePhoto[];
  photoLabel?: string;
  /** Google's own photo categories (Interior, Exterior, Team ...). They show
   *  WHAT SUBJECTS photos exist for, which is firmer evidence than a handful
   *  of tiles: the catalogue call currently returns only the cover image. */
  photoCategories?: string[];
  fields: GbpProfileField[];
  fieldsHeadline?: string;
  categories?: GbpCategoryBlock;
  description?: GbpCopyBlock;
  services?: GbpServicesBlock;
  photoHeadline?: string;
  plannedPhotos?: string[];
  photoFinding?: GbpInlineFinding;
  post?: GbpProfilePost;
  reviewsHeadline?: string;
  reviewsFinding?: GbpInlineFinding;
  reviews?: GbpProfileReview[];
  /** The client's own reviews read in full (up to 120), next to the rating and
   *  review count of the three map competitors with the most reviews. */
  reviewAnalysis?: GbpReviewAnalysis | null;
  additionalFields?: GbpProfileField[];
  additionalHeadline?: string;
}

export interface GbpExhibit {
  /** English is the default when omitted. */
  locale?: "en" | "de";
  /** New proposal shape. Both views come from one factual source dataset. */
  current?: GbpProfileView;
  prepared?: GbpProfileView;
  /** Legacy fields below remain optional during the data migration. */
  panel?: GbpPanelData | null;
  /** The account audit: what's good and bad on the profile, field by field. */
  auditRows?: GbpAuditRow[];
  auditNote?: string;
  clientName?: string;
  clientGhost?: string;
  note?: string;
}

export interface TimelineRow {
  when: string;
  visible: string;
}

export interface InvestmentOption {
  name: string;
  price: string;
  term: string;
  included: string[];
  recommended?: boolean;
  /** How many weeks the build takes on this package. More layers need more
   * weeks, and showing it next to the price is what justifies the difference. */
  buildWeeks?: number;
  /** What runs on after the build, e.g. "$499/mo, cancel anytime". */
  thenMonthly?: string;
  /** What the monthly fee actually buys, month after month. Without this the
   * monthly reads as rent on something already built, which is the single
   * commonest reason a client cancels in month three. */
  monthlyIncludes?: string[];
  /** The way out of the monthly: a one-off fee, set to the same figure as the
   * build, and they run the whole thing themselves. The promise is
   * that you can fire us, so the price of doing that belongs on the page next
   * to the price of keeping us. */
  handoverFee?: string;
}

export interface InvestmentBenefit {
  icon: "go-live" | "cancel" | "guarantee" | "training" | "ownership" | "handover";
  title: string;
  detail: string;
}

export interface ProofItem {
  name: string;
  business: string;
  result: string;
  detail: string;
  /** Verbatim words from the review file - never paraphrased. */
  quote?: string;
  photoUrl?: string;
  videoUrl?: string;
  videoThumbUrl?: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface ProposalCopySection {
  kicker?: string;
  title?: string;
  lead?: string;
}

export type ProposalCopy = Partial<Record<
  "intro" | "findings" | "cro" | "cost" | "timeline" | "actions" | "reviews" | "faq" | "call",
  ProposalCopySection
>>;

/** A deliberately bounded opportunity estimate for the cold report. Traffic
 * comes from the same provider for every site. The conversion range is an
 * external sanity scenario, never inferred from the website score. Monetary
 * output exists with a business-supplied customer value and close rate, or with
 * a sourced trade floor for the niche and country (verified: false, labelled on
 * the page). Rendered in live reports since 23.09.2026. */
export interface OpportunityEstimate {
  currentVisits: number;
  benchmarkVisits: number;
  benchmarkKind: "top20" | "local";
  benchmarkLabel: string;
  benchmarkSampleSize: number;
  benchmarkContext: string;
  additionalVisits: number;
  enquiryRateLow: number;
  enquiryRateHigh: number;
  additionalEnquiriesLow: number;
  additionalEnquiriesHigh: number;
  currencySymbol?: string;
  customerValueScenario?: {
    assumedCustomerValue: number;
    assumedCloseRate: number;
    sourceName: string;
    sourceUrl: string;
    /** Set for a sourced trade floor (verified: false). */
    sourceDate?: string;
    sourceValue: string;
    limitation: string;
    verified: boolean;
  };
  conversionScenario: {
    label: string;
    sourceName: string;
    sourceUrl: string;
    sourceDate: string;
    sourceValue: string;
    limitation: string;
  };
  websiteReadiness?: { have: number; total: number } | null;
  value?: {
    closeRate: number;
    averageCustomerValue: number;
    currencySymbol: string;
    monthlyLow: number;
    monthlyHigh: number;
    label: string;
  } | null;
}

export interface ProposalData {
  slug: string;
  /** Fixed public-report contract. Lead-specific builders may fill slots, but
   * must not select a different layout or silently omit required sections. */
  templateVersion?: "lead-magnet-v1";
  /** Lead magnets default to English. German remains a first-class render
   * option for DACH campaigns without maintaining a second template. */
  language?: "en" | "de";
  copy?: ProposalCopy;
  /** Every source this proposal rests on, registered once. Figures point at an
   * id from here; the ledger at the end of the page prints the list.
   *
   * Why this exists: "bitte die Quellen auch immer dort
   * reinpacken." Until then the proposal marked what was measured and what was
   * not, but never where anything came from. That holds until the first person
   * asks, and the first person asks in the room where the deal is decided. */
  quellen?: Quelle[];
  clientName: string;
  clientDomain: string;
  clientFaviconUrl: string;
  preparedBy: string;
  preparedByCompany: string;
  dateLabel: string;
  expiryLabel: string;
  heroLead: string;
  /** A short founder video above the fold - the fastest trust builder there is,
   * and the first thing the conversion checklist asks for. Absent renders a
   * marked placeholder rather than a broken player. */
  // Who is sending this. Never hardcoded in a component: the template ships to
  // other members, and their proposals must not carry someone else's faces.
  team?: { name: string; where?: string; photo?: string }[];
  teamNote?: string;
  // placeholder: show the empty frame anyway, for laying the page out locally.
  // Never on a row that gets sent - see the note in HeroVideo.tsx.
  heroVideo?: { url?: string; posterUrl?: string; label?: string; placeholder?: boolean; portrait?: boolean };
  /** The one-page summary image, generated after the build; absent until it exists. */
  onePager?: { url: string; generatedAt?: string; model?: string } | null;

  /** `overall` is null when nothing could be measured. A zero would read as a
   *  verdict instead of a gap. */
  scorecard: { overall: number | null; overallReason: string; pillars: ScorePillar[]; note?: string };
  /** Present = the chain renders instead of the four pillars. */
  chain?: Chain;
  money: MoneyMath;
  /** Present = the money figures become live and the dial bar renders. */
  assumptions?: Assumptions;
  /** Present = the conversion section renders between 02 and 03. */
  cro?: CroExhibit;
  /** Present = the report translates its measured traffic gap into a clearly
   * labelled enquiry scenario after the three evidence chapters. */
  opportunity?: OpportunityEstimate;
  findings: {
    rows: CompetitorRow[];
    /** One warning per metric where the client trails the competitors -
     * rendered as design-kit warning boxes directly under the table. */
    tableWarnings?: string[];
    tableNote?: string;
    items: Finding[];
    serp: SerpExhibit | null;
    /** Local companies only - null for remote/international businesses. */
    geoGrid: GeoGridExhibit | null;
    gbp: GbpExhibit | null;
    /** Named when an exhibit is null: which number is missing, what would get it. */
    missing?: string[];
  };
  timeline: { rows: TimelineRow[]; expectation: string };
  /** Set after the call: which package was discussed, where each executable
   * contract lives, and what was actually said. The client may still switch
   * packages until signature; the selected roadmap and contract must move as one. */
  agreement?: {
    packageName?: string;
    /** High-entropy path segment for the public agreement route. It is an
     * access field and must be removed before data reaches a client component. */
    token?: string;
    /** The GHL document that combines contract, signature and setup payment. */
    signUrl?: string;
    /** Package-specific GHL document forms. A missing entry disables signing
     * for that package rather than falling back to a different agreement. */
    signUrls?: Record<string, string>;
    /** Opened after successful signature/payment and repeated in the welcome email. */
    onboardingCalendarUrl?: string;
    /** Generic app login entry; the client requests their own magic link there. */
    appUrl?: string;
    /** First name, for the one line that has to sound like it was written by a
     * person who was on the call. */
    firstName?: string;
    /** What we agreed, taken from the recording rather than from memory. Each
     * entry pairs what they said with what changed because of it - a document
     * that only lists our own conclusions proves nothing about listening.
     * Written by `add-call-notes.mjs` from a transcript. */
    callNotes?: {
      /** e.g. "Recorded 30 August, 42 minutes". Naming the source is what makes
       * the section worth reading rather than worth doubting. */
      source?: string;
      items: { said: string; means: string }[];
    };
    /** Anything raised on the call that is NOT in the build. Written down here
     * on purpose: an unrecorded "we might also do X" is the single most common
     * way a fixed scope turns into an argument in month two. */
    outOfScope?: string[];
  };
  /** Five things the client can do this week without us. Derived from their
   * own measured findings, never a generic checklist. */
  actions?: {
    title?: string;
    lead?: string;
    note?: string;
    items: {
      title: string;
      /** Backwards-compatible combined explanation for older proposal rows. */
      what: string;
      /** The measured observation that makes this action relevant. */
      evidence?: string;
      /** The defect behind the evidence, when the evidence doubles as the hero line. */
      finding?: string;
      /** The concrete change to make. */
      change?: string;
      /** The plain-language business benefit of completing it. */
      benefit?: string;
      /** How long it takes and who does it, e.g. "10 minutes, you". */
      effort: string;
      /** Which drawing: profile, reviews, speed, video, gauge, form. */
      art: string;
    }[];
  };
  /** Real reviews at the foot of the proposal. They stand in for case studies
   * while there is no approved SEO result - weaker, and honest. */
  reviews?: {
    title?: string;
    lead?: string;
    note?: string;
    /** Where the reader can check them. A quote nobody can verify is a quote
     * nobody believes, so the section carries the link to the live profile. */
    profileUrl?: string;
    profileLabel?: string;
    items: { quote: string; stars: string; job: string }[];
  };
  investment: { options: InvestmentOption[]; terms: string; benefits?: InvestmentBenefit[] };
  proof: { items: ProofItem[]; credentials: string[] };
  faq: FaqItem[];
  close: {
    costReminder: string;
    ctaLabel: string;
    ctaUrl: string;
    /** The booking widget, embedded at the foot of the page. Present = the
     * calendar renders instead of a button, because the times are the ask. */
    bookingUrl?: string;
  };
}
