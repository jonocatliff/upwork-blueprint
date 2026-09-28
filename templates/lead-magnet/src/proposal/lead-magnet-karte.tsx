/* # multilingual-data: the locale tables below are what a client reads,
   so a German value there is the German report and not a German comment. */
import type { ProposalData } from "./types";

/* The two boxes beside the 25-point grid.
 *
 * WHY THE REWRITE: the reading was a three-line sentence in which
 * the one number that matters sat in the middle -- "…with the most top-three
 * places: 13 of 25 checked locations, behind Lockshire with 14." Anyone
 * skimming misses it. And the winners table crammed name, share, rating and
 * count into a single line with middots between them and no column heads:
 * "13/25 · 5.0★ · 87" has to be decoded before it can be read.
 *
 * Now: the number is a number, and the table has columns, air and a bar, so
 * the gap is visible instead of worked out. */

/* THE TWO TRAILING SENTENCES ARE OUT: "The weaker spots
 * are in the north" and "Across all 25 searches, 23 other businesses reached
 * the top three". Both are true and both explain the map instead of stating
 * the finding. The box now carries the number and one sentence, nothing else. */
type Row = {
  label: string;
  points: number;
  mine: boolean;
  marker?: number;
  distanceKm: number | null;
  isChain: boolean;
  rating?: number | null;
  reviews?: number | null;
  callHandlingSigns?: string[];
};

/* "Signs", never "fake": the sentence names what we see
   and leaves the conclusion to the reader. Only set when winner-locations.mjs
   counts at least three markers. */
function vermittlungText(de: boolean, signs: string[] | undefined, reviews: number | null | undefined): string | null {
  if (!signs?.length) return null;
  const teile = signs.map((sign) => ({
    reviews: de ? `${reviews ?? 0} Google-Bewertung${reviews === 1 ? "" : "en"}` : `${reviews ?? 0} Google review${reviews === 1 ? "" : "s"}`,
    name: de ? "ein Name aus dem Suchbegriff" : "a name built from the search term",
    shared: de ? "dieselbe Website wie Einträge an anderen Orten" : "the same website as listings elsewhere",
    domain: de ? "eine Allerwelts-Webadresse" : "a generic web address",
  } as Record<string, string>)[sign]).filter(Boolean);
  return de
    ? `Anzeichen eines Vermittlungseintrags: ${teile.join(", ")}.`
    : `Signs of a call-handling listing: ${teile.join(", ")}.`;
}

/** "601 Google reviews, 5.0 stars" -- a whole phrase with a noun, not
 *  "601 · 5.0★" (owner-language.md). It sits on the second line under the
 *  name, not in the main line: the main line stays name and share.
 *  Without both values the line stays empty rather than half full. */
function bewertungText(de: boolean, reviews: number | null | undefined, rating: number | null | undefined): string | null {
  if (reviews == null) return null;
  const anzahl = de
    ? `${reviews.toLocaleString("de-DE")} Google-Bewertung${reviews === 1 ? "" : "en"}`
    : `${reviews.toLocaleString("en-GB")} Google review${reviews === 1 ? "" : "s"}`;
  if (!reviews || rating == null) return anzahl;
  return de ? `${anzahl}, ${rating.toFixed(1).replace(".", ",")} Sterne` : `${anzahl}, ${rating.toFixed(1)} stars`;
}

/* ONE BOX, NOT TWO. Number, sentence and table belong to
 * the same statement: how often do I show up, and against whom. Split across
 * two cards they read as two topics, and nobody compares the number at the top
 * with the row below, although it is the same one. */
/** The sentence that puts the number in context: how big the field is, and where
 *  he stands in it.
 *
 *  Without it, "25 of 25" cannot be read -- it can mean market leadership or
 *  "there are only three firms". Below four businesses in the grid the map is
 *  no verdict, and it then says so.
 */
function einordnung(de: boolean, points: number, total: number, allRivals: Row[], ranks: (number | null)[]): string {
  const rivals = [...allRivals].sort((a, b) => b.points - a.points);
  const leader = rivals[0];
  const placements = points + rivals.reduce((sum, row) => sum + row.points, 0);
  const listings = rivals.length + 1;
  if (points === 0) {
    const sichtbar = ranks.filter((rank): rank is number => rank != null).sort((a, b) => a - b);
    if (sichtbar.length) {
      // A single outlier should not hide the typical position:
      // East Coast Mechanics sat at 6–11 at 14 of 15 visible points,
      // and at 17 at one more (22.09.2026).
      const typischeObergrenze = sichtbar[Math.ceil(sichtbar.length * 0.9) - 1];
      const bereich = sichtbar[0] === typischeObergrenze
        ? (de ? `meist auf Platz ${sichtbar[0]}` : `usually at position ${sichtbar[0]}`)
        : (de ? `meist auf den Plätzen ${sichtbar[0]}–${typischeObergrenze}` : `usually at positions ${sichtbar[0]}–${typischeObergrenze}`);
      return de
        ? `Sie erscheinen an ${sichtbar.length} von ${total} Suchpunkten, ${bereich}, erreichen aber nirgends die Top 3.`
        : `You appear at ${sichtbar.length} of ${total} search points, ${bereich}, but never reach the top three.`;
    }
    return de
      ? `Sie erreichen an keinem der ${total} Suchpunkte die Top 3${leader ? `; das stärkste einzelne Listing ist an ${leader.points} Punkten sichtbar` : ""}.`
      : `You do not reach the top three at any of the ${total} search points${leader ? `; the strongest single listing is visible at ${leader.points}` : ""}.`;
  }
  if (!leader) {
    return de
      ? `Sie erreichen die Top 3 an ${points} von ${total} Suchpunkten; es wurde kein belastbarer Wettbewerber gemessen.`
      : `You reach the top three at ${points} of ${total} search points; no reliable competitor was measured.`;
  }
  if (leader.points <= points) {
    const ausserhalb = Math.max(0, total - points);
    if (leader.points === points) {
      const tied = rivals.filter((row) => row.points === points).length;
      const gesamtGleichauf = tied + 1;
      if (points === total && gesamtGleichauf === 3) return de
        ? `Dieselben drei Listings belegen alle ${total * 3} gemessenen Top-3-Plätze. Andere Betriebe können darunter erscheinen, erreichen hier aber nirgends die Top 3.`
        : `The same three listings occupy all ${total * 3} measured top-three places. Other businesses can appear below them, but none enters the top three here.`;
      return de
        ? `Sie teilen sich die größte gemessene Maps-Abdeckung mit ${tied === 1 ? "einem weiteren Listing" : `${tied} weiteren Listings`}: ${gesamtGleichauf === 2 ? "beide" : `alle ${gesamtGleichauf}`} erreichen ${points} von ${total} Suchpunkten die Top 3. Die Namen stehen direkt darunter.`
        : `You share the widest measured Maps coverage with ${tied === 1 ? "one other listing" : `${tied} other listings`}: ${gesamtGleichauf === 2 ? "both" : `all ${gesamtGleichauf}`} reach the top three at ${points} of ${total} search points. The names are directly below.`;
    }
    if (ausserhalb === 0) return de
      ? `Sie erreichen die Top 3 an allen ${total} Suchpunkten; das nächststärkste Listing folgt mit ${leader.points}. Das ist die größte Maps-Abdeckung in diesem Raster, kein Urteil über den besten Betrieb insgesamt.`
      : `You reach the top three at all ${total} search points; the next-strongest listing follows at ${leader.points}. That is the widest Maps coverage in this grid, not a verdict on the best business overall.`;
    return de
      ? `Sie haben mit ${points} von ${total} Punkten die größte gemessene Maps-Abdeckung; das nächststärkste Listing liegt ${points - leader.points} Punkt${points - leader.points === 1 ? "" : "e"} dahinter. Sie fehlen trotzdem noch an ${ausserhalb} Punkten in den Top 3.`
      : `You have the widest measured Maps coverage at ${points} of ${total} points; the next-strongest listing is ${points - leader.points} point${points - leader.points === 1 ? "" : "s"} behind. You still miss the top three at ${ausserhalb}.`;
  }
  const schwelle = Math.max(points + 2, Math.ceil(leader.points * 0.6));
  const deutlich = rivals.filter((z, index) => index === 0 || (z.points > points && z.points >= schwelle));
  const sichtbareNamen = new Set(rivals.slice(0, 3).map((z) => z.label));
  const verdeckt = deutlich.filter((z) => !sichtbareNamen.has(z.label));
  const grund = leader.points < Math.ceil(total * 0.4)
    ? (de
        ? `Sie erreichen ${points} von ${total} Punkten. Im Raster verteilen sich ${placements} Top-3-Platzierungen auf ${listings} Listings; niemand dominiert.`
        : `You reach ${points} of ${total} points. Across the grid, ${placements} top-three places are split between ${listings} listings, so no one dominates.`)
    : (de
        ? `Sie erreichen ${points} von ${total} Punkten; das führende Listing liegt bei ${leader.points}. Die Tabelle darunter zeigt die drei stärksten gemessenen Listings.`
        : `You reach ${points} of ${total} points; the leading listing reaches ${leader.points}. The table below shows the three strongest measured listings.`);
  if (!verdeckt.length) return grund;
  const namen = new Intl.ListFormat(de ? "de" : "en", { style: "long", type: "conjunction" })
    .format(verdeckt.map((z) => `${z.label} (${z.points}/${total})`));
  const plural = verdeckt.length > 1;
  return de
    ? `${grund} ${namen} ${plural ? "liegen" : "liegt"} ebenfalls vor Ihnen, ${plural ? "fehlen" : "fehlt"} aber, weil die Tabelle nur drei Wettbewerber zeigt.`
    : `${grund} ${namen} also ${plural ? "sit" : "sits"} ahead of you but ${plural ? "miss" : "misses"} the table because it shows only three competitors.`;
}

export function KartenGewinner({ rows, allRivals, total, title, locale, points, ranks = [] }: {
  rows: Row[];
  allRivals: Row[];
  total: number;
  title: string;
  locale: "en" | "de";
  points?: number | null;
  ranks?: (number | null)[];
}) {
  const de = locale === "de";
  const max = Math.max(1, ...rows.map((z) => z.points));
  return (
    <div>
      {points != null ? (
        /* ONE NUMBER, ONE LINE BELOW IT. Before, the number,
           the denominator and a two-line all-caps line stood side by side --
           three sizes in one row, which looked like an accident on a phone.
           Now: the fraction large, the explanation as a normal sentence. */
        <div>
          <b className="tnum block text-[30px] font-black leading-none tracking-[-.03em] text-navy sm:text-[38px]">
            {points}<span className="text-graphite">/{total}</span>
          </b>
          <span className="mt-1.5 block text-[13px] leading-[1.4] text-graphite sm:text-[13.5px]">
            {de ? "Suchpunkte mit einer Top-3-Platzierung" : "search points where you reach the top three"}
          </span>
          {/* A NUMBER WITHOUT ITS FIELD IS NOT A FINDING. Mattie Griffin had 25 of 25 --
              and apart from him only two businesses stood in the grid, so all
              three were in the top three everywhere. Read as a win, that is a
              trick question; the owner drives through his town every day and
              knows how many towing firms there are. So the sentence says first
              how big the field is, and only then where he stands in it. */}
          <p className="mb-0 mt-3 text-[13.5px] font-semibold leading-[1.45] text-ink sm:text-[14px]">
            {einordnung(de, points, total, allRivals, ranks)}
          </p>
        </div>
      ) : null}
      {/* THE SENTENCE IS OUT. "Within 5 km you are one of
          the three businesses with the most top-three places: 13 of 25 checked
          locations, behind Lockshire with 15" said the same thing a third time,
          after the number above it and the table below it. */}
      <h3 className="m-0 mt-5 text-[17px] font-black sm:mt-6 sm:text-lg">{title}</h3>
      <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4 border-b border-hairline pb-2 text-[11px] sm:text-[10px] font-bold uppercase tracking-[.06em] text-graphite">
        <span>{de ? "Betrieb" : "Business"}</span>
        <span className="text-right">{de ? "Top 3" : "Top three"}</span>
      </div>
      <ul className="m-0 list-none p-0">
        {rows.map((z) => (
          <li key={z.label}
              className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 border-b border-slate-100 py-3 last:border-b-0 ${
                z.mine ? "-mx-3 rounded-xl bg-navy-soft/60 px-3" : ""}`}>
            <span className={`flex min-w-0 items-start gap-2 text-[13.5px] leading-[1.35] ${z.mine ? "font-black text-navy" : "text-slate-800"}`}>
              {z.marker ? <span className="mt-px grid size-[19px] shrink-0 place-items-center rounded-full bg-slate-700 text-[9px] font-black text-white">{z.marker}</span> : null}
              <span className="min-w-0">
              {/* Two lines instead of truncation: the long name belongs to the
                  business, not to our column width. */}
              <span className="line-clamp-2">{z.label}</span>
              {!z.mine && vermittlungText(de, z.callHandlingSigns, z.reviews) ? (
                <span className="mt-1 block text-[10.5px] font-semibold leading-[1.35] text-amber-800">{vermittlungText(de, z.callHandlingSigns, z.reviews)}</span>
              ) : null}
              {(!z.mine && (z.distanceKm != null || z.isChain)) || bewertungText(de, z.reviews, z.rating) ? (
                <span className="mt-1 flex flex-wrap items-center gap-1.5 text-[10.5px] font-semibold text-graphite">
                  {bewertungText(de, z.reviews, z.rating) ? <span>{bewertungText(de, z.reviews, z.rating)}</span> : null}
                  {!z.mine && z.distanceKm != null ? <span>{z.distanceKm < 0.1 ? "<0.1" : z.distanceKm.toFixed(1)} km {de ? "entfernt" : "away"}</span> : null}
                  {!z.mine && z.isChain ? <span className="rounded-full border border-navy/15 bg-navy-soft px-1.5 py-0.5 text-[9px] font-black uppercase tracking-[.08em] text-navy">{de ? "Kette" : "Chain"}</span> : null}
                </span>
              ) : null}
              </span>
            </span>
            <span className="tnum whitespace-nowrap text-right text-[13.5px]">
              <b className={z.mine ? "text-navy" : "text-slate-900"}>{z.points}</b>
              <span className="text-[11.5px] text-graphite">/{total}</span>
            </span>
            {/* The bar runs the full width under the row: that way the gap
                reads as a length, not as a subtraction. */}
            <span className="col-span-2 block h-1.5 overflow-hidden rounded-full bg-slate-100">
              <span data-grow data-lm-motion={`mapwinner-${z.label}`}
                    className={`block h-full rounded-full ${z.mine ? "bg-navy" : "bg-slate-300"}`}
                    style={{ width: `${Math.max(3, Math.round((z.points / max) * 100))}%` }} />
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function kartenKontextZeilen(
  geoGrid: NonNullable<ProposalData["findings"]["geoGrid"]>,
): Row[] {
  return (geoGrid.competitors?.length ? geoGrid.competitors : geoGrid.winners ?? []).map((row) => ({
    label: row.name,
    points: row.topThreePoints,
    mine: false,
    distanceKm: row.distanceKm ?? null,
    isChain: row.isChain ?? false,
    rating: row.rating ?? null,
    reviews: row.reviews ?? null,
    callHandlingSigns: row.callHandlingSigns,
  }));
}

export function kartenZeilen(geoGrid: NonNullable<ProposalData["findings"]["geoGrid"]>,
                             duLabel: string, total: number): Row[] {
  const rivals = (geoGrid.winners ?? []).slice(0, 3).map((w, index) => ({
    label: w.name, points: w.topThreePoints, mine: false, distanceKm: w.distanceKm ?? null,
    isChain: w.isChain ?? false, marker: index + 1, rating: w.rating ?? null, reviews: w.reviews ?? null,
    callHandlingSigns: w.callHandlingSigns,
  }));
  const eigen = geoGrid.client
    ? [{
        label: duLabel, points: geoGrid.client.topThreePoints,
        mine: true, distanceKm: null, isChain: false,
        // The number from today's map queries beats the one from the profile cache:
        // otherwise the page shows 23 here and 24 in the ratings block (23.09.2026).
        rating: geoGrid.client.mapRating ?? geoGrid.client.rating ?? null,
        reviews: geoGrid.client.mapReviews ?? geoGrid.client.reviews ?? null,
      }]
    : [];
  void total;
  return [...rivals, ...eigen].sort((a, b) => b.points - a.points);
}

/* THE AI SEARCH. What is measured is exactly what the sentence
 * says: three test searches through OpenAI's web search, the engine behind
 * ChatGPT search. Never "ChatGPT does not recommend you" -- that would be a
 * claim about a product we never queried. He only counts when the source behind
 * the named entry is his own page or his own listing. */
export function KiSuche({ data, locale }: {
  data: NonNullable<NonNullable<ProposalData["findings"]["geoGrid"]>["aiVisibility"]>;
  locale: "en" | "de";
}) {
  const de = locale === "de";
  const datum = new Date(data.checkedAt).toLocaleDateString(de ? "de-DE" : "en-GB", { day: "numeric", month: "long", year: "numeric" });
  const andere = data.alternatives.slice(0, 5);
  return (
    <div className="rounded-xl border border-hairline bg-canvas p-4">
      <h3 className="m-0 text-[15px] font-black sm:text-base">{de ? "Wen nennt die KI-Suche?" : "Who does AI search name?"}</h3>
      <p className="mb-0 mt-2 text-[13.5px] leading-[1.45] text-ink">
        {de
          ? `Wir haben am ${datum} ${data.runs} Testsuchen über die Websuche von OpenAI gestellt, die Technik hinter der ChatGPT-Suche, und nach „${data.keyword}“ in ${data.city} gefragt. Ihr Betrieb kam in ${data.named} von ${data.runs} Antworten vor.`
          : `On ${datum} we ran ${data.runs} test searches through OpenAI's web search, the technology behind ChatGPT search, asking for a ${data.keyword} in ${data.city}. Your business came up in ${data.named} of ${data.runs} answers.`}
      </p>
      {andere.length ? (
        <>
          <p className="mb-0 mt-3 text-[12px] font-bold uppercase tracking-[.06em] text-graphite">{de ? "Stattdessen genannt" : "Named instead"}</p>
          <ul className="m-0 mt-1.5 list-none p-0 text-[13px]">
            {andere.map((row) => (
              <li key={row.name} className="flex items-baseline justify-between gap-3 border-b border-slate-100 py-1.5 last:border-b-0">
                <span className="min-w-0 truncate text-slate-800">{row.name}</span>
                <span className="tnum shrink-0 text-graphite">{de ? `${row.mentions} von ${data.runs}` : `${row.mentions} of ${data.runs}`}</span>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}
