import type { ProposalData } from "./types";

/* Die zwei Kaesten neben dem 25-Punkte-Raster.
 *
 * WARUM NEU: die Lesung war ein dreizeiliger Satz, in dem
 * die einzige Zahl, auf die es ankommt, in der Mitte stand -- "…mit den meisten
 * Top-3-Plaetzen: 13 von 25 geprueften Orten, hinter Lockshire mit 14." Wer
 * ueberfliegt, findet sie nicht. Und die Gewinnertabelle presste Name, Anteil,
 * Bewertung und Anzahl in eine Zeile mit Mittelpunkten dazwischen, ohne
 * Spaltenkopf: "13/25 · 5.0★ · 87" muss der Leser erst entschluesseln.
 *
 * Jetzt: die Zahl ist eine Zahl, und die Tabelle hat Spalten, Luft und einen
 * Balken, damit der Abstand sichtbar ist statt nachgerechnet. */

/* DIE ZWEI NACHSAETZE SIND RAUS: "Die schwaecheren Stellen
 * liegen im Norden" und "Ueber alle 25 Suchen erreichten 23 andere Betriebe
 * die Top drei". Beides stimmt und beides erklaert die Karte, statt den Befund
 * zu sagen. Der Kasten traegt jetzt die Zahl und einen Satz, sonst nichts. */
type Zeile = {
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

/* "Anzeichen", nie "Fake": der Satz nennt, was wir sehen,
   und laesst den Schluss beim Leser. Nur gesetzt, wenn winner-locations.mjs
   mindestens drei Merkmale zaehlt. */
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

/** "601 Google reviews, 5.0 stars" -- ein ganzer Ausdruck mit Nomen, nicht
 *  "601 · 5.0★" (owner-language.md). Steht in der zweiten Zeile unter dem
 *  Namen, nicht in der Hauptzeile: die Hauptzeile bleibt Name und Anteil
 *. Ohne beide Werte bleibt die Zeile leer statt halb. */
function bewertungText(de: boolean, reviews: number | null | undefined, rating: number | null | undefined): string | null {
  if (reviews == null) return null;
  const anzahl = de
    ? `${reviews.toLocaleString("de-DE")} Google-Bewertung${reviews === 1 ? "" : "en"}`
    : `${reviews.toLocaleString("en-GB")} Google review${reviews === 1 ? "" : "s"}`;
  if (!reviews || rating == null) return anzahl;
  return de ? `${anzahl}, ${rating.toFixed(1).replace(".", ",")} Sterne` : `${anzahl}, ${rating.toFixed(1)} stars`;
}

/* EIN KASTEN, NICHT ZWEI. Zahl, Satz und Tabelle gehoeren
 * zur selben Aussage: wie oft tauche ich auf, und gegen wen. Auf zwei Karten
 * verteilt liest man sie als zwei Themen und vergleicht die Zahl oben nicht mit
 * der Zeile unten, obwohl es dieselbe ist. */
/** Der Satz, der die Zahl einordnet: wie gross das Feld ist, und wo er darin steht.
 *
 *  Ohne ihn ist "25 von 25" nicht lesbar -- es kann Marktfuehrerschaft heissen
 *  oder "es gibt nur drei Firmen". Unter vier Betrieben im Raster ist die Karte
 *  kein Urteil, und das steht dann auch so da.
 */
function einordnung(de: boolean, punkte: number, gesamt: number, alleGegner: Zeile[], ranks: (number | null)[]): string {
  const gegner = [...alleGegner].sort((a, b) => b.points - a.points);
  const fuehrend = gegner[0];
  const platzierungen = punkte + gegner.reduce((summe, zeile) => summe + zeile.points, 0);
  const listings = gegner.length + 1;
  if (punkte === 0) {
    const sichtbar = ranks.filter((rank): rank is number => rank != null).sort((a, b) => a - b);
    if (sichtbar.length) {
      // Ein einzelner Ausreisser soll die typische Position nicht verschleiern:
      // East Coast Mechanics lag an 14 von 15 sichtbaren Punkten auf 6–11,
      // an einem weiteren auf 17 (22.09.2026).
      const typischeObergrenze = sichtbar[Math.ceil(sichtbar.length * 0.9) - 1];
      const bereich = sichtbar[0] === typischeObergrenze
        ? (de ? `meist auf Platz ${sichtbar[0]}` : `usually at position ${sichtbar[0]}`)
        : (de ? `meist auf den Plätzen ${sichtbar[0]}–${typischeObergrenze}` : `usually at positions ${sichtbar[0]}–${typischeObergrenze}`);
      return de
        ? `Sie erscheinen an ${sichtbar.length} von ${gesamt} Suchpunkten, ${bereich}, erreichen aber nirgends die Top 3.`
        : `You appear at ${sichtbar.length} of ${gesamt} search points, ${bereich}, but never reach the top three.`;
    }
    return de
      ? `Sie erreichen an keinem der ${gesamt} Suchpunkte die Top 3${fuehrend ? `; das stärkste einzelne Listing ist an ${fuehrend.points} Punkten sichtbar` : ""}.`
      : `You do not reach the top three at any of the ${gesamt} search points${fuehrend ? `; the strongest single listing is visible at ${fuehrend.points}` : ""}.`;
  }
  if (!fuehrend) {
    return de
      ? `Sie erreichen die Top 3 an ${punkte} von ${gesamt} Suchpunkten; es wurde kein belastbarer Wettbewerber gemessen.`
      : `You reach the top three at ${punkte} of ${gesamt} search points; no reliable competitor was measured.`;
  }
  if (fuehrend.points <= punkte) {
    const ausserhalb = Math.max(0, gesamt - punkte);
    if (fuehrend.points === punkte) {
      const gleichauf = gegner.filter((zeile) => zeile.points === punkte).length;
      const gesamtGleichauf = gleichauf + 1;
      if (punkte === gesamt && gesamtGleichauf === 3) return de
        ? `Dieselben drei Listings belegen alle ${gesamt * 3} gemessenen Top-3-Plätze. Andere Betriebe können darunter erscheinen, erreichen hier aber nirgends die Top 3.`
        : `The same three listings occupy all ${gesamt * 3} measured top-three places. Other businesses can appear below them, but none enters the top three here.`;
      return de
        ? `Sie teilen sich die größte gemessene Maps-Abdeckung mit ${gleichauf === 1 ? "einem weiteren Listing" : `${gleichauf} weiteren Listings`}: ${gesamtGleichauf === 2 ? "beide" : `alle ${gesamtGleichauf}`} erreichen ${punkte} von ${gesamt} Suchpunkten die Top 3. Die Namen stehen direkt darunter.`
        : `You share the widest measured Maps coverage with ${gleichauf === 1 ? "one other listing" : `${gleichauf} other listings`}: ${gesamtGleichauf === 2 ? "both" : `all ${gesamtGleichauf}`} reach the top three at ${punkte} of ${gesamt} search points. The names are directly below.`;
    }
    if (ausserhalb === 0) return de
      ? `Sie erreichen die Top 3 an allen ${gesamt} Suchpunkten; das nächststärkste Listing folgt mit ${fuehrend.points}. Das ist die größte Maps-Abdeckung in diesem Raster, kein Urteil über den besten Betrieb insgesamt.`
      : `You reach the top three at all ${gesamt} search points; the next-strongest listing follows at ${fuehrend.points}. That is the widest Maps coverage in this grid, not a verdict on the best business overall.`;
    return de
      ? `Sie haben mit ${punkte} von ${gesamt} Punkten die größte gemessene Maps-Abdeckung; das nächststärkste Listing liegt ${punkte - fuehrend.points} Punkt${punkte - fuehrend.points === 1 ? "" : "e"} dahinter. Sie fehlen trotzdem noch an ${ausserhalb} Punkten in den Top 3.`
      : `You have the widest measured Maps coverage at ${punkte} of ${gesamt} points; the next-strongest listing is ${punkte - fuehrend.points} point${punkte - fuehrend.points === 1 ? "" : "s"} behind. You still miss the top three at ${ausserhalb}.`;
  }
  const schwelle = Math.max(punkte + 2, Math.ceil(fuehrend.points * 0.6));
  const deutlich = gegner.filter((z, index) => index === 0 || (z.points > punkte && z.points >= schwelle));
  const sichtbareNamen = new Set(gegner.slice(0, 3).map((z) => z.label));
  const verdeckt = deutlich.filter((z) => !sichtbareNamen.has(z.label));
  const grund = fuehrend.points < Math.ceil(gesamt * 0.4)
    ? (de
        ? `Sie erreichen ${punkte} von ${gesamt} Punkten. Im Raster verteilen sich ${platzierungen} Top-3-Platzierungen auf ${listings} Listings; niemand dominiert.`
        : `You reach ${punkte} of ${gesamt} points. Across the grid, ${platzierungen} top-three places are split between ${listings} listings, so no one dominates.`)
    : (de
        ? `Sie erreichen ${punkte} von ${gesamt} Punkten; das führende Listing liegt bei ${fuehrend.points}. Die Tabelle darunter zeigt die drei stärksten gemessenen Listings.`
        : `You reach ${punkte} of ${gesamt} points; the leading listing reaches ${fuehrend.points}. The table below shows the three strongest measured listings.`);
  if (!verdeckt.length) return grund;
  const namen = new Intl.ListFormat(de ? "de" : "en", { style: "long", type: "conjunction" })
    .format(verdeckt.map((z) => `${z.label} (${z.points}/${gesamt})`));
  const plural = verdeckt.length > 1;
  return de
    ? `${grund} ${namen} ${plural ? "liegen" : "liegt"} ebenfalls vor Ihnen, ${plural ? "fehlen" : "fehlt"} aber, weil die Tabelle nur drei Wettbewerber zeigt.`
    : `${grund} ${namen} also ${plural ? "sit" : "sits"} ahead of you but ${plural ? "miss" : "misses"} the table because it shows only three competitors.`;
}

export function KartenGewinner({ zeilen, alleGegner, gesamt, titel, locale, punkte, ranks = [] }: {
  zeilen: Zeile[];
  alleGegner: Zeile[];
  gesamt: number;
  titel: string;
  locale: "en" | "de";
  punkte?: number | null;
  ranks?: (number | null)[];
}) {
  const de = locale === "de";
  const max = Math.max(1, ...zeilen.map((z) => z.points));
  return (
    <div>
      {punkte != null ? (
        /* EINE ZAHL, EINE ZEILE DARUNTER. Vorher standen
           Zahl, Nenner und eine zweizeilige Versalien-Zeile nebeneinander --
           drei Groessen in einer Reihe, die auf dem Telefon wie ein Unfall
           aussahen. Jetzt: der Bruch gross, die Erklaerung als normaler Satz. */
        <div>
          <b className="tnum block text-[30px] font-black leading-none tracking-[-.03em] text-navy sm:text-[38px]">
            {punkte}<span className="text-graphite">/{gesamt}</span>
          </b>
          <span className="mt-1.5 block text-[13px] leading-[1.4] text-graphite sm:text-[13.5px]">
            {de ? "Suchpunkte mit einer Top-3-Platzierung" : "search points where you reach the top three"}
          </span>
          {/* EINE ZAHL OHNE FELD IST KEIN BEFUND. Mattie Griffin hatte 25 von 25 --
              und ausser ihm standen nur zwei Betriebe im Raster, also waren
              alle drei ueberall in den Top 3. Als Sieg gelesen ist das eine
              Fangfrage; der Inhaber faehrt jeden Tag durch seine Stadt und
              weiss, wie viele Abschleppdienste es gibt. Deshalb sagt der Satz
              zuerst, wie gross das Feld ist, und erst dann, wo er darin steht. */}
          <p className="mb-0 mt-3 text-[13.5px] font-semibold leading-[1.45] text-ink sm:text-[14px]">
            {einordnung(de, punkte, gesamt, alleGegner, ranks)}
          </p>
        </div>
      ) : null}
      {/* DER SATZ IST RAUS. "Im Umkreis von 5 km sind Sie
          einer der drei Betriebe mit den meisten Top-3-Plaetzen: 13 von 25
          geprueften Orten, hinter Lockshire mit 15" sagte dreimal dasselbe
          wie die Zahl darueber und die Tabelle darunter. */}
      <h3 className="m-0 mt-5 text-[17px] font-black sm:mt-6 sm:text-lg">{titel}</h3>
      <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-4 border-b border-hairline pb-2 text-[11px] sm:text-[10px] font-bold uppercase tracking-[.06em] text-graphite">
        <span>{de ? "Betrieb" : "Business"}</span>
        <span className="text-right">{de ? "Top 3" : "Top three"}</span>
      </div>
      <ul className="m-0 list-none p-0">
        {zeilen.map((z) => (
          <li key={z.label}
              className={`grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 border-b border-slate-100 py-3 last:border-b-0 ${
                z.mine ? "-mx-3 rounded-xl bg-navy-soft/60 px-3" : ""}`}>
            <span className={`flex min-w-0 items-start gap-2 text-[13.5px] leading-[1.35] ${z.mine ? "font-black text-navy" : "text-slate-800"}`}>
              {z.marker ? <span className="mt-px grid size-[19px] shrink-0 place-items-center rounded-full bg-slate-700 text-[9px] font-black text-white">{z.marker}</span> : null}
              <span className="min-w-0">
              {/* Zwei Zeilen statt Abschneiden: der lange Name gehoert dem
                  Betrieb, nicht unserer Spaltenbreite. */}
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
              <span className="text-[11.5px] text-graphite">/{gesamt}</span>
            </span>
            {/* Der Balken laeuft ueber die volle Breite unter der Zeile: so
                liest sich der Abstand als Laenge, nicht als Subtraktion. */}
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
): Zeile[] {
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
                             duLabel: string, gesamt: number): Zeile[] {
  const gegner = (geoGrid.winners ?? []).slice(0, 3).map((w, index) => ({
    label: w.name, points: w.topThreePoints, mine: false, distanceKm: w.distanceKm ?? null,
    isChain: w.isChain ?? false, marker: index + 1, rating: w.rating ?? null, reviews: w.reviews ?? null,
    callHandlingSigns: w.callHandlingSigns,
  }));
  const eigen = geoGrid.client
    ? [{
        label: duLabel, points: geoGrid.client.topThreePoints,
        mine: true, distanceKm: null, isChain: false,
        // Die Zahl aus den heutigen Kartenabfragen vor der aus dem Profil-Cache:
        // sonst zeigt die Seite 23 hier und 24 im Bewertungsblock (23.09.2026).
        rating: geoGrid.client.mapRating ?? geoGrid.client.rating ?? null,
        reviews: geoGrid.client.mapReviews ?? geoGrid.client.reviews ?? null,
      }]
    : [];
  void gesamt;
  return [...gegner, ...eigen].sort((a, b) => b.points - a.points);
}

/* DIE KI-SUCHE. Gemessen ist genau das, was der Satz sagt:
 * drei Testsuchen ueber OpenAIs Websuche, die hinter der ChatGPT-Suche steht.
 * Nie "ChatGPT empfiehlt Sie nicht" -- das waere eine Behauptung ueber ein
 * Produkt, das wir nicht abgefragt haben. Gezaehlt wird er nur, wenn die Quelle
 * des genannten Eintrags seine eigene Seite oder sein Eintrag ist. */
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
