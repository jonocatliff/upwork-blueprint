/* # multilingual-data: the locale tables below are what a client reads,
   so a German value there is the German report and not a German comment. */
"use client";

import { useState } from "react";
import type { CroElement, CroSpeed, ProposalData } from "./types";
import { ChevronDown } from "./service-icons";

type Locale = "en" | "de";
type Reader = "google" | "ki" | "besucher";

/* PART 3 HAS THREE READERS. Before, four Lighthouse
 * numbers stood at the top with no content and 21 checks in six groups below
 * them -- the numbers said nothing, the groups said everything, and the weight
 * sat the wrong way round. Then it all stood there at once, and that was a wall.
 *
 * Now the same mechanic as the report's three chapters, one level down: three
 * tiles side by side, one open, its contents below at full width. Every step
 * has a budget. With no click: one sentence per tile. One tile open: four cards
 * with one sentence each. One card open: only then ticks and crosses. The
 * Lighthouse numbers do not lead, they sit collapsed at the foot of the panel
 * under "Google's own test" -- a 92 next to six red lines read as a
 * contradiction, and the reader believed the green number. */

const FINDING_TEXTS: Record<string, { where: Reader; en: string; de: string }> = {
  "document-title": { where: "google", en: "The page has no title", de: "Die Seite hat keinen Titel" },
  "meta-description": { where: "google", en: "No preview text for the Google result", de: "Kein Vorschautext für das Google-Ergebnis" },
  "image-alt": { where: "google", en: "{n} pictures carry no description", de: "{n} Bilder tragen keine Beschreibung" },
  "link-text": { where: "google", en: "{n} links just say \"click here\"", de: "{n} Links sagen nur „hier klicken“" },
  "link-name": { where: "google", en: "{n} links have no readable name", de: "{n} Links haben keinen lesbaren Namen" },
  "crawlable-anchors": { where: "google", en: "{n} links Google cannot follow", de: "{n} Links, denen Google nicht folgen kann" },
  "is-crawlable": { where: "google", en: "The page tells Google not to index it", de: "Die Seite sagt Google, sie nicht aufzunehmen" },
  "robots-txt": { where: "google", en: "The robots file is broken", de: "Die robots-Datei ist fehlerhaft" },
  "hreflang": { where: "google", en: "Language links are set wrong", de: "Sprachverweise sind falsch gesetzt" },
  "canonical": { where: "google", en: "The page's official address is wrong", de: "Die offizielle Adresse der Seite ist falsch" },
  "html-has-lang": { where: "google", en: "The page does not say its language", de: "Die Seite nennt ihre Sprache nicht" },
  "heading-order": { where: "google", en: "Headings skip levels, so the structure is unclear", de: "Überschriften springen, die Struktur ist unklar" },
  "http-status-code": { where: "google", en: "The page answers with an error code", de: "Die Seite antwortet mit einem Fehlercode" },
  "font-size": { where: "google", en: "Text too small to read on a phone", de: "Text auf dem Handy zu klein zum Lesen" },
  "render-blocking-resources": { where: "besucher", en: "Design files load before any text can appear · {s} s to gain", de: "Designdateien laden, bevor Text erscheinen kann · {s} s zu gewinnen" },
  "unused-css-rules": { where: "besucher", en: "Style code this page never uses · {s} s to gain", de: "Stilcode, den die Seite nie braucht · {s} s zu gewinnen" },
  "unused-javascript": { where: "besucher", en: "Script code this page never uses · {s} s to gain", de: "Skriptcode, den die Seite nie braucht · {s} s zu gewinnen" },
  "modern-image-formats": { where: "besucher", en: "Pictures in an old, heavy format · {s} s to gain", de: "Bilder in einem alten, schweren Format · {s} s zu gewinnen" },
  "uses-optimized-images": { where: "besucher", en: "Pictures saved larger than needed · {s} s to gain", de: "Bilder größer gespeichert als nötig · {s} s zu gewinnen" },
  "uses-responsive-images": { where: "besucher", en: "Desktop-size pictures sent to phones · {s} s to gain", de: "Desktop-Bilder werden ans Handy geschickt · {s} s zu gewinnen" },
  "offscreen-images": { where: "besucher", en: "Pictures load before anyone scrolls to them · {s} s to gain", de: "Bilder laden, bevor jemand zu ihnen scrollt · {s} s zu gewinnen" },
  "prioritize-lcp-image": { where: "besucher", en: "The main picture is not loaded first", de: "Das Hauptbild wird nicht zuerst geladen" },
  "server-response-time": { where: "besucher", en: "The server itself is slow to answer", de: "Der Server selbst antwortet langsam" },
  "total-byte-weight": { where: "besucher", en: "The page is very heavy to download", de: "Die Seite ist sehr schwer zu laden" },
  "uses-text-compression": { where: "besucher", en: "Text is sent uncompressed · {s} s to gain", de: "Text wird unkomprimiert gesendet · {s} s zu gewinnen" },
  "uses-long-cache-ttl": { where: "besucher", en: "Returning visitors download everything again", de: "Wiederkehrende Besucher laden alles neu" },
  "font-display": { where: "besucher", en: "Text stays invisible until the font arrives", de: "Text bleibt unsichtbar, bis die Schrift da ist" },
  "third-party-summary": { where: "besucher", en: "Outside scripts slow the page down", de: "Fremde Skripte bremsen die Seite" },
  "mainthread-work-breakdown": { where: "besucher", en: "The phone works hard before it can react", de: "Das Handy rechnet lange, bevor es reagiert" },
  "bootup-time": { where: "besucher", en: "Scripts keep the phone busy for seconds", de: "Skripte beschäftigen das Handy sekundenlang" },
  "dom-size": { where: "besucher", en: "The page is built from too many parts", de: "Die Seite besteht aus zu vielen Teilen" },
  "redirects": { where: "besucher", en: "The address forwards before the page loads", de: "Die Adresse leitet weiter, bevor die Seite lädt" },
  "cumulative-layout-shift": { where: "besucher", en: "Things jump around while the page loads", de: "Elemente springen, während die Seite lädt" },
  "layout-shift-elements": { where: "besucher", en: "Things jump around while the page loads", de: "Elemente springen, während die Seite lädt" },
  "largest-contentful-paint": { where: "besucher", en: "The main content appears late", de: "Der Hauptinhalt erscheint spät" },
  "largest-contentful-paint-element": { where: "besucher", en: "The main content appears late", de: "Der Hauptinhalt erscheint spät" },
  "first-contentful-paint": { where: "besucher", en: "Nothing shows for a long moment", de: "Lange ist gar nichts zu sehen" },
  "speed-index": { where: "besucher", en: "The page fills in slowly", de: "Die Seite baut sich langsam auf" },
  "total-blocking-time": { where: "besucher", en: "The page ignores taps while it loads", de: "Die Seite ignoriert Tipper, während sie lädt" },
  "interactive": { where: "besucher", en: "It takes long before anything can be tapped", de: "Es dauert, bis man etwas antippen kann" },
  "color-contrast": { where: "besucher", en: "{n} texts with too little contrast", de: "{n} Texte mit zu wenig Kontrast" },
  "tap-targets": { where: "besucher", en: "Buttons too small or too close to tap", de: "Knöpfe zu klein oder zu eng zum Tippen" },
  "target-size": { where: "besucher", en: "Buttons too small or too close to tap", de: "Knöpfe zu klein oder zu eng zum Tippen" },
  "label": { where: "besucher", en: "{n} form fields without a label", de: "{n} Formularfelder ohne Beschriftung" },
  "button-name": { where: "besucher", en: "{n} buttons with no readable name", de: "{n} Knöpfe ohne lesbaren Namen" },
  "meta-viewport": { where: "besucher", en: "Not built for a phone screen", de: "Nicht für den Handybildschirm gebaut" },
  "is-on-https": { where: "besucher", en: "Parts of the page load insecurely", de: "Teile der Seite laden unsicher" },
  "errors-in-console": { where: "besucher", en: "The page throws errors while running", de: "Die Seite wirft Fehler im Betrieb" },
  "no-vulnerable-libraries": { where: "besucher", en: "Outdated code with known security holes", de: "Veralteter Code mit bekannten Sicherheitslücken" },
  "deprecations": { where: "besucher", en: "Uses features browsers are switching off", de: "Nutzt Funktionen, die Browser abschalten" },
  "third-party-cookies": { where: "besucher", en: "Sets tracking cookies browsers are starting to block", de: "Setzt Tracking-Cookies, die Browser zu blocken beginnen" },
  "image-aspect-ratio": { where: "besucher", en: "Pictures shown squashed or stretched", de: "Bilder werden gestaucht oder gezerrt" },
  "image-size-responsive": { where: "besucher", en: "Pictures shown blurry on sharp screens", de: "Bilder wirken auf scharfen Bildschirmen unscharf" },
};

type Finding = { text: string; gewicht: number };

function findingsFor(speed: CroSpeed | null | undefined, where: Reader, locale: Locale): Finding[] {
  const alle = Object.values(speed?.findings ?? {}).flat();
  const gesehen = new Set<string>();
  const rows: Finding[] = [];
  for (const b of alle) {
    const template = FINDING_TEXTS[b.id];
    if (!template || template.where !== where) continue;
    const s = Math.round((b.einsparung_ms || 0) / 100) / 10;
    let text = template[locale].replace("{n}", String(b.betroffen || ""));
    // With no saving the trailing clause drops, never "0.0 s to gain".
    text = s >= 0.1 ? text.replace("{s}", s.toFixed(1)) : text.replace(/ · \{s\}[^·]*$/, "");
    if (/^0 /.test(text) || gesehen.has(text)) continue;
    gesehen.add(text);
    rows.push({ text, gewicht: b.gewicht });
  }
  return rows.sort((a, b) => b.gewicht - a.gewicht).slice(0, 3);
}

/* The groups per reader. `was` is the question the owner would ask himself.
 * The keys are the ones from `ELEMENTS` in pull_cro.py, ordered by weight:
 * the first red one in the list is the sentence on the card. */
type Gruppe = { title: string; was: string; keys: string[]; ok?: string; icon?: string };
type LeserSpec = { title: string; wer: string; gruppen: Gruppe[]; lighthouse: ("seo" | "accessibility" | "performance" | "best-practices")[] };

const LESER: Record<Locale, Record<Reader, LeserSpec>> = {
  en: {
    google: {
      title: "How Google reads and rates your website", wer: "It decides whether to show you at all.",
      lighthouse: ["seo", "accessibility"],
      gruppen: [
        { icon: "tuer", title: "Google’s access to your site", was: "", keys: ["crawl_robots", "crawl_sitemap", "onpage_viewport"], ok: "Robots file, sitemap and phone view are all fine." },
        { icon: "lesen", title: "How clearly your site names the service and area", was: "", keys: ["onpage_title", "onpage_h1", "onpage_meta_description", "onpage_depth", "onpage_alt_text", "onpage_lang"], ok: "Title, headline, preview and pictures all say it." },
        { icon: "stern", title: "Your area on the page", was: "", keys: ["onpage_schema_reviews", "onpage_map_embed"], ok: "Your area is shown on the page." },
        { icon: "besen", title: "The pages contributing to your visibility", was: "", keys: ["onpage_unique_titles", "onpage_thin_pages", "onpage_canonical", "blog_alive"], ok: "Own titles, real text and something recent." },
      ],
    },
    ki: {
      title: "How AI search reads and recommends your business", wer: "ChatGPT and Perplexity only name what they can read.",
      lighthouse: [],
      gruppen: [
        { icon: "tuer", title: "Your visibility to AI crawlers", was: "", keys: ["crawl_ai_bots", "aeo_no_js", "aeo_llms_txt"], ok: "Crawlers welcome, text readable, and a summary for them." },
        { icon: "stern", title: "The facts AI can use to recommend you", was: "", keys: ["aeo_entity_facts", "aeo_faq_schema", "aeo_question_headings"], ok: "Facts, answers and questions are all in place." },
      ],
    },
    besucher: {
      title: "How easily visitors can contact you", wer: "From here the site has one job: make getting in touch the easiest thing on the screen.",
      lighthouse: ["performance", "best-practices"],
      gruppen: [
        { icon: "kontakt", title: "Can they call you in one tap?", was: "", keys: ["cta_above_fold", "cta_repeated", "click_to_call", "opening_hours", "emergency_cover", "second_channel"], ok: "Button, tap-to-call, hours and out-of-hours cover are all there." },
        { icon: "termin", title: "Can they get in touch without calling?", was: "", keys: ["lead_form", "form_short", "form_button_says_outcome", "online_booking", "response_time"], ok: "A short form, online booking and a reply promise are all there." },
        { icon: "vertrauen", title: "Do you show enough proof?", was: "", keys: ["review_badges", "testimonials", "social_proof_numbers", "video_top", "video_testimonials", "logo_wall"], ok: "Rating, reviews, numbers, video and logos are all there." },
        { icon: "entscheiden", title: "Do you answer their doubts?", was: "", keys: ["faq", "lead_magnet", "email_capture"], ok: "Answers, something free and a way to stay in touch are all there." },
        { icon: "messen", title: "Do you see any of this happening?", was: "", keys: ["analytics_live", "search_console"], ok: "Both Analytics and Search Console are connected." },
      ],
    },
  },
  de: {
    google: {
      title: "Wie Google Ihre Website liest und bewertet", wer: "Es entscheidet, ob Sie überhaupt gezeigt werden.",
      lighthouse: ["seo", "accessibility"],
      gruppen: [
        { icon: "tuer", title: "Googles Zugriff auf Ihre Website", was: "", keys: ["crawl_robots", "crawl_sitemap", "onpage_viewport"], ok: "Robots-Datei, Sitemap und Handy-Ansicht sind in Ordnung." },
        { icon: "lesen", title: "Wie klar Ihre Website Leistung und Ort nennt", was: "", keys: ["onpage_title", "onpage_h1", "onpage_meta_description", "onpage_depth", "onpage_alt_text", "onpage_lang"], ok: "Titel, Überschrift, Vorschau und Bilder sagen es." },
        { icon: "stern", title: "Ihr Gebiet auf der Seite", was: "", keys: ["onpage_schema_reviews", "onpage_map_embed"], ok: "Ihr Gebiet ist auf der Seite zu sehen." },
        { icon: "besen", title: "Die Seiten, die zu Ihrer Sichtbarkeit beitragen", was: "", keys: ["onpage_unique_titles", "onpage_thin_pages", "onpage_canonical", "blog_alive"], ok: "Eigene Titel, echter Text und etwas Aktuelles." },
      ],
    },
    ki: {
      title: "Wie KI-Suchen Ihren Betrieb lesen und empfehlen", wer: "ChatGPT und Perplexity nennen nur, was sie lesen können.",
      lighthouse: [],
      gruppen: [
        { icon: "tuer", title: "Ihre Sichtbarkeit für KI-Crawler", was: "", keys: ["crawl_ai_bots", "aeo_no_js", "aeo_llms_txt"], ok: "Crawler willkommen, Text lesbar, Zusammenfassung da." },
        { icon: "stern", title: "Die Fakten, mit denen KI Sie empfehlen kann", was: "", keys: ["aeo_entity_facts", "aeo_faq_schema", "aeo_question_headings"], ok: "Fakten, Antworten und Fragen sind alle da." },
      ],
    },
    besucher: {
      title: "Wie leicht Besucher Sie kontaktieren können", wer: "Ab hier hat die Seite eine Aufgabe: den Kontakt zur einfachsten Sache auf dem Bildschirm machen.",
      lighthouse: ["performance", "best-practices"],
      gruppen: [
        { icon: "kontakt", title: "Kann man Sie mit einem Tipp anrufen?", was: "", keys: ["cta_above_fold", "cta_repeated", "click_to_call", "opening_hours", "emergency_cover", "second_channel"], ok: "Button, Anruf per Tipp, Zeiten und Notdienst sind da." },
        { icon: "termin", title: "Erreicht man Sie auch ohne Anruf?", was: "", keys: ["lead_form", "form_short", "form_button_says_outcome", "online_booking", "response_time"], ok: "Kurzes Formular, Online-Buchung und Antwortversprechen sind da." },
        { icon: "vertrauen", title: "Zeigen Sie genug Belege?", was: "", keys: ["review_badges", "testimonials", "social_proof_numbers", "video_top", "video_testimonials", "logo_wall"], ok: "Bewertung, Kundenstimmen, Zahlen, Video und Logos sind alle da." },
        { icon: "entscheiden", title: "Beantworten Sie ihre Zweifel?", was: "", keys: ["faq", "lead_magnet", "email_capture"], ok: "Antworten, etwas Kostenloses und ein Weg zum Dranbleiben sind da." },
        { icon: "messen", title: "Sehen Sie überhaupt, dass das passiert?", was: "", keys: ["analytics_live", "search_console"], ok: "Analytics und Search Console sind beide angeschlossen." },
      ],
    },
  },
};

/* Four numbers from 0 to 100 with no scale say nothing.
 * Each now carries what it measures, and a word for how it stands -- Google's
 * own thresholds: good from 90, middling from 50, weak below that. */
/* ONE LINE PER TILE. Title plus explanation were two
 * lines that together said less than one good one. */
const LIGHTHOUSE_KENNWORT: Record<string, string> = {
  seo: "SEO", accessibility: "Accessibility", performance: "Performance", "best-practices": "Best Practices",
};

const LIGHTHOUSE_NAMEN: Record<string, { en: string; de: string }> = {
  seo: { en: "How clearly Google can read your site", de: "Wie klar Google Ihre Seite lesen kann" },
  accessibility: { en: "How easily people can use it", de: "Wie leicht Menschen sie bedienen können" },
  performance: { en: "How quickly it loads", de: "Wie schnell sie lädt" },
  "best-practices": { en: "How solidly it is built", de: "Wie solide sie gebaut ist" },
};


const ZEILEN_NAMEN: Record<string, { en: string; de: string }> = {
  cta_above_fold: { en: "Clear contact button before scrolling", de: "Klarer Kontaktbutton vor dem Scrollen" },
  cta_repeated: { en: "Contact button repeated on long pages", de: "Kontaktbutton auf langen Seiten wiederholt" },
  click_to_call: { en: "Phone number starts a call on mobile", de: "Telefonnummer startet mobil direkt einen Anruf" },
  lead_form: { en: "A contact form", de: "Ein Kontaktformular" },
  form_short: { en: "A form short enough to finish", de: "Ein Formular, das man zu Ende ausfüllt" },
  form_button_says_outcome: { en: "A button that names what happens next", de: "Ein Button, der sagt, was danach passiert" },
  online_booking: { en: "Online booking", de: "Online-Terminbuchung" },
  response_time: { en: "A promise of how fast you reply", de: "Ein Versprechen, wie schnell Sie antworten" },
  testimonials: { en: "Written customer reviews on the site", de: "Schriftliche Kundenbewertungen auf der Seite" },
  social_proof_numbers: { en: "Real numbers: years, jobs or customers", de: "Konkrete Zahlen: Jahre, Aufträge oder Kunden" },
  review_badges: { en: "Your Google or Trustpilot rating on the site", de: "Ihre Google- oder Trustpilot-Bewertung auf der Seite" },
  video_top: { en: "Short introduction video near the top", de: "Kurzes Vorstellungsvideo weit oben" },
  video_testimonials: { en: "A customer video review", de: "Eine Kundenbewertung als Video" },
  logo_wall: { en: "Customer or partner logos", de: "Logos von Kunden oder Partnern" },
  faq: { en: "Answers to common customer questions", de: "Antworten auf häufige Kundenfragen" },
  lead_magnet: { en: "Something free worth leaving an email for", de: "Etwas Kostenloses, das eine E-Mail wert ist" },
  email_capture: { en: "A way to collect an email address", de: "Ein Weg, eine E-Mail-Adresse zu bekommen" },
  opening_hours: { en: "Opening hours on the page", de: "Öffnungszeiten auf der Seite" },
  emergency_cover: { en: "Out-of-hours cover named", de: "Notdienst ausgewiesen" },
  second_channel: { en: "A second way to reach you", de: "Ein zweiter Draht zu Ihnen" },
  analytics_live: { en: "Visitors are counted", de: "Besucher werden gezählt" },
  search_console: { en: "Search Console connected", de: "Search Console angeschlossen" },
  blog_alive: { en: "A blog with something recent on it", de: "Ein Blog mit etwas Aktuellem darauf" },
  onpage_title: { en: "A page title that names the job and the town", de: "Ein Seitentitel, der Leistung und Ort nennt" },
  onpage_h1: { en: "A first headline that says who this is for", de: "Eine erste Überschrift, die sagt, für wen das ist" },
  onpage_meta_description: { en: "Your own preview text under the Google result", de: "Ihr eigener Vorschautext unter dem Google-Ergebnis" },
  onpage_alt_text: { en: "Pictures that describe themselves", de: "Bilder, die sich selbst beschreiben" },
  onpage_lang: { en: "The page says which language it is in", de: "Die Seite nennt ihre Sprache" },
  onpage_canonical: { en: "One official address per page", de: "Eine offizielle Adresse je Seite" },
  onpage_schema_reviews: { en: "Your rating marked up for the results page", de: "Ihre Bewertung für die Ergebnisseite markiert" },
  onpage_unique_titles: { en: "Every page with its own title", de: "Jede Seite mit eigenem Titel" },
  onpage_thin_pages: { en: "Every page with something on it", de: "Jede Seite mit Inhalt" },
  onpage_depth: { en: "Enough text on the home page to match a search", de: "Genug Text auf der Startseite für eine Suche" },
  onpage_map_embed: { en: "A map on the page", de: "Eine Karte auf der Seite" },
  onpage_viewport: { en: "Built for a phone screen", de: "Für den Handybildschirm gebaut" },
  crawl_robots: { en: "Google is allowed in", de: "Google darf rein" },
  crawl_sitemap: { en: "A sitemap that tells Google every page", de: "Eine Sitemap, die Google jede Seite nennt" },
  crawl_ai_bots: { en: "AI crawlers are allowed in", de: "KI-Crawler dürfen rein" },
  aeo_entity_facts: { en: "Name, address and phone machine-readable", de: "Name, Adresse und Telefon maschinenlesbar" },
  aeo_faq_schema: { en: "Answers marked up for quoting", de: "Antworten zum Zitieren markiert" },
  aeo_question_headings: { en: "Headings written as questions", de: "Überschriften als Fragen geschrieben" },
};


/* Google's own findings as a short phrase, so that they can stand next to
 * ours. What is absent here does not arrive as a tile, it does not arrive. */
/* Three words per finding, in his language. "3 things
 * are holding this back" says nothing; "a slow server, unused code, unused
 * design" says enough without being a how-to. */
const BEFUND_WORT: Record<string, { en: string; de: string }> = {
  "server-response-time": { en: "a slow server", de: "ein langsamer Server" },
  "unused-javascript": { en: "unused code", de: "ungenutzter Code" },
  "unused-css-rules": { en: "unused styling", de: "ungenutztes Design" },
  "render-blocking-resources": { en: "design files loading first", de: "Designdateien, die zuerst laden" },
  "modern-image-formats": { en: "pictures in an old format", de: "Bilder in einem alten Format" },
  "uses-optimized-images": { en: "oversized pictures", de: "zu große Bilder" },
  "uses-responsive-images": { en: "desktop pictures on phones", de: "Desktop-Bilder auf dem Handy" },
  "offscreen-images": { en: "pictures loading too early", de: "Bilder, die zu früh laden" },
  "uses-text-compression": { en: "uncompressed text", de: "unkomprimierter Text" },
  "redirects": { en: "a redirect before the page", de: "eine Umleitung vor der Seite" },
  "font-display": { en: "text waiting for the font", de: "Text, der auf die Schrift wartet" },
  "prioritize-lcp-image": { en: "the main picture loading late", de: "ein spät geladenes Hauptbild" },
  "total-byte-weight": { en: "a heavy page", de: "eine schwere Seite" },
  "uses-long-cache-ttl": { en: "nothing kept for return visits", de: "nichts für den zweiten Besuch gespeichert" },
  "third-party-summary": { en: "outside scripts", de: "fremde Skripte" },
  "mainthread-work-breakdown": { en: "too much for the phone to do", de: "zu viel Rechnerei fürs Handy" },
  "bootup-time": { en: "scripts keeping the phone busy", de: "Skripte, die das Handy beschäftigen" },
  "dom-size": { en: "too many parts on the page", de: "zu viele Teile auf der Seite" },
  "largest-contentful-paint-element": { en: "the main content arriving last", de: "der Hauptinhalt kommt zuletzt" },
  "layout-shift-elements": { en: "things jumping while it loads", de: "springende Elemente beim Laden" },
  "crawlable-anchors": { en: "a link Google cannot follow", de: "ein Link, dem Google nicht folgen kann" },
  "link-name": { en: "a link with no name", de: "ein Link ohne Namen" },
  "link-text": { en: "links that say \"click here\"", de: "Links, die „hier klicken“ sagen" },
  "heading-order": { en: "headings out of order", de: "Überschriften in falscher Reihenfolge" },
  "image-alt": { en: "pictures without a description", de: "Bilder ohne Beschreibung" },
  "document-title": { en: "a page with no title", de: "eine Seite ohne Titel" },
  "meta-description": { en: "no preview text", de: "kein Vorschautext" },
  "html-has-lang": { en: "no language set", de: "keine Sprache gesetzt" },
  "is-crawlable": { en: "a page hidden from Google", de: "eine vor Google versteckte Seite" },
  "robots-txt": { en: "a broken robots file", de: "eine fehlerhafte robots-Datei" },
  "canonical": { en: "a wrong official address", de: "eine falsche offizielle Adresse" },
  "hreflang": { en: "wrong language links", de: "falsche Sprachverweise" },
  "font-size": { en: "text too small on phones", de: "zu kleiner Text am Handy" },
  "color-contrast": { en: "text with too little contrast", de: "Text mit zu wenig Kontrast" },
  "target-size": { en: "buttons too close together", de: "zu eng stehende Knöpfe" },
  "tap-targets": { en: "buttons too close together", de: "zu eng stehende Knöpfe" },
  "label": { en: "form fields without labels", de: "Felder ohne Beschriftung" },
  "button-name": { en: "buttons without names", de: "Knöpfe ohne Namen" },
  "third-party-cookies": { en: "cookies browsers now block", de: "Cookies, die Browser blocken" },
  "errors-in-console": { en: "errors while it runs", de: "Fehler im Betrieb" },
  "inspector-issues": { en: "problems the browser reports", de: "vom Browser gemeldete Probleme" },
  "no-vulnerable-libraries": { en: "code with known security holes", de: "Code mit bekannten Lücken" },
  "deprecations": { en: "features browsers are dropping", de: "Funktionen, die Browser abschaffen" },
  "is-on-https": { en: "parts loading unsecured", de: "ungesichert ladende Teile" },
  "image-aspect-ratio": { en: "squashed pictures", de: "gestauchte Bilder" },
  "image-size-responsive": { en: "blurry pictures", de: "unscharfe Bilder" },
};

/* The AI tiles carry their sentence in the open: four tiles can afford a
 * line, and nobody understands "answers quotable ✕" on its own.
 * Only the sentence says what it means for him. */
/* ONE VERDICT, ONE ACTION, NOTHING ELSE. The explaining
 * line in the middle turned four tiles into four paragraphs. Green says what is
 * there; red says what to do -- the explanation sat between them and goes. */
/* THREE LINES, THREE QUESTIONS. First it was a paragraph,
 * then it was too terse. Every tile now answers: what did we check, what came
 * out of it, and what is to be done. The first line is the check, the second
 * the finding IN ITS CONSEQUENCES, the third the action. */
const KI_KACHEL: Record<string, {
  gepr: { en: string; de: string };
  ja: { en: string; de: string };
  nein: { en: string; de: string };
  tun: { en: [string, string]; de: [string, string] };
}> = {
  aeo_no_js: {
    gepr: { en: "Does ChatGPT see your text or an empty page?", de: "Sieht ChatGPT Ihren Text oder eine leere Seite?" },
    ja: { en: "Almost all of your words are in the page before a browser builds it.", de: "Fast alle Ihrer Wörter stehen in der Seite, bevor ein Browser sie baut." },
    nein: { en: "The text only appears once a browser builds the page, and AI crawlers do not run one.", de: "Der Text entsteht erst im Browser, und KI-Crawler starten keinen." },
    tun: { en: ["Have your web person render the text on the server, not in the browser", "2 h"], de: ["Den Text vom Server ausliefern lassen statt im Browser aufbauen", "2 Std."] },
  },
  aeo_llms_txt: {
    gepr: { en: "Do you tell the AI engines what you do?", de: "Sagen Sie den KI-Diensten, was Sie tun?" },
    ja: { en: "A summary file for the AI engines is published.", de: "Eine Zusammenfassung für die KI-Dienste ist hinterlegt." },
    nein: { en: "Nothing sums you up for them, so each one works it out from your pages alone. Ten minutes to write, and the engines have started asking for it.", de: "Nichts fasst Sie für sie zusammen, jeder Dienst muss es sich aus Ihren Seiten zusammenreimen. Zehn Minuten Arbeit, und die Dienste fangen an, danach zu fragen." },
    tun: { en: ["Put a file called llms.txt at yoursite.com/llms.txt: what you do, where, and your main pages", "10 min"], de: ["Eine Datei llms.txt unter ihreseite.de/llms.txt anlegen: was Sie tun, where, und Ihre wichtigsten Seiten", "10 Min."] },
  },
  crawl_ai_bots: {
    gepr: { en: "Is ChatGPT allowed to read you at all?", de: "Darf ChatGPT Sie überhaupt lesen?" },
    ja: { en: "Your robots file blocks none of them.", de: "Ihre robots-Datei sperrt keinen von ihnen aus." },
    nein: { en: "Your robots file locks them out, so no AI answer can name you.", de: "Ihre robots-Datei sperrt sie aus, keine KI-Antwort kann Sie nennen." },
    tun: { en: ["Delete the Disallow lines for GPTBot, ClaudeBot and PerplexityBot from robots.txt", "10 min"], de: ["Die Disallow-Zeilen für GPTBot, ClaudeBot und PerplexityBot aus robots.txt löschen", "10 Min."] },
  },
  aeo_entity_facts: {
    gepr: { en: "Does ChatGPT know where you are and how to call you?", de: "Weiß ChatGPT, where Sie sind und wie man Sie anruft?" },
    ja: { en: "Name, address and phone are labelled in the page code.", de: "Name, Adresse und Telefon sind im Seitencode ausgezeichnet." },
    nein: { en: "They are only text on the page, so an AI has to guess them.", de: "Sie stehen nur als Text da, eine KI muss sie erraten." },
    tun: { en: ["Have your web person add LocalBusiness details with your exact name, address and phone", "30 min"], de: ["LocalBusiness-Angaben mit Ihrem genauen Namen, Adresse und Telefon einbauen lassen", "30 Min."] },
  },
  aeo_faq_schema: {
    gepr: { en: "Can ChatGPT recommend your answer word for word?", de: "Kann ChatGPT Ihre Antwort wörtlich empfehlen?" },
    ja: { en: "Your questions and answers are labelled as such.", de: "Ihre Fragen und Antworten sind als solche ausgezeichnet." },
    nein: { en: "Your answers carry no label saying they are answers, so an AI quotes a competitor instead.", de: "Ihre Antworten tragen kein Etikett, das sie als Antwort ausweist, eine KI zitiert stattdessen einen Wettbewerber." },
    tun: { en: ["Have your web person mark the FAQ block as questions and answers, 40 to 60 words each", "30 min"], de: ["Den FAQ-Block als Fragen und Antworten auszeichnen lassen, je 40 bis 60 Wörter", "30 Min."] },
  },
  aeo_question_headings: {
    gepr: { en: "Does ChatGPT find your answer to the customer's question?", de: "Findet ChatGPT Ihre Antwort auf die Kundenfrage?" },
    ja: { en: "Three or more of your headings are real questions.", de: "Drei oder mehr Ihrer Überschriften sind echte Fragen." },
    nein: { en: "Not one heading is a question, so an AI finds nothing to match.", de: "Keine Überschrift ist eine Frage, eine KI findet keinen Treffer." },
    tun: { en: ["Rewrite three headings as questions customers ask, with the answer right underneath", "20 min"], de: ["Drei Überschriften als Kundenfragen schreiben, die Antwort direkt darunter", "20 Min."] },
  },
};

/* A VERDICT INSTEAD OF A LABEL. "First heading ✕"
 * is the name of the check, not its result -- the reader has to guess what is
 * wrong with it. Every red line now carries a whole sentence with "your", and
 * below it the measurement that proves it. If a key is missing here, the line
 * falls back on its name and its `consequence`. */
const ROT_URTEIL: Record<string, { en: string; de: string }> = {
  onpage_title: { en: "Your page title does not say what you do or where", de: "Ihr Seitentitel sagt nicht, was Sie tun und where" },
  onpage_h1: { en: "Your first headline does not name both your job and your town", de: "Ihre erste Überschrift nennt nicht Leistung und Ort zugleich" },
  onpage_meta_description: { en: "Google writes your preview text itself", de: "Google schreibt Ihren Vorschautext selbst" },
  onpage_alt_text: { en: "Google cannot read most of your pictures", de: "Google kann die meisten Ihrer Bilder nicht lesen" },
  onpage_lang: { en: "Your page does not say which language it is in", de: "Ihre Seite sagt nicht, in welcher Sprache sie ist" },
  onpage_canonical: { en: "The same page competes with itself under two links", de: "Dieselbe Seite konkurriert unter zwei Links mit sich selbst" },
  onpage_schema_reviews: { en: "Your stars do not show in the Google result", de: "Ihre Sterne erscheinen nicht im Google-Ergebnis" },
  onpage_unique_titles: { en: "Several of your pages share one title", de: "Mehrere Ihrer Seiten teilen sich einen Titel" },
  onpage_thin_pages: { en: "Some of your pages are near-empty", de: "Einige Ihrer Seiten sind fast leer" },
  onpage_depth: { en: "Your home page carries too little text to match a search", de: "Ihre Startseite trägt zu wenig Text für eine Suche" },
  onpage_map_embed: { en: "There is no map showing the area you cover", de: "Es gibt keine Karte, die Ihr Gebiet zeigt" },
  onpage_viewport: { en: "Your site is not built for a phone screen", de: "Ihre Seite ist nicht für den Handybildschirm gebaut" },
  opening_hours: { en: "Your opening hours are not on the site", de: "Ihre Öffnungszeiten stehen nicht auf der Seite" },
  emergency_cover: { en: "Nothing says whether you come out at night", de: "Nichts sagt, ob Sie nachts kommen" },
  second_channel: { en: "The phone is the only way to reach you", de: "Das Telefon ist der einzige Weg zu Ihnen" },
  crawl_ai_bots: { en: "Your robots file locks the AI engines out", de: "Ihre robots-Datei sperrt die KI-Dienste aus" },
  aeo_no_js: { en: "ChatGPT sees an empty page where your text should be", de: "ChatGPT sieht eine leere Seite, where Ihr Text stehen sollte" },
  aeo_llms_txt: { en: "Nothing sums your business up for the AI engines", de: "Nichts fasst Ihren Betrieb für die KI-Dienste zusammen" },
  aeo_entity_facts: { en: "An AI has to guess who you are and where", de: "Eine KI muss raten, wer Sie sind und where" },
  aeo_faq_schema: { en: "An AI quotes a competitor instead of you", de: "Eine KI zitiert einen Wettbewerber statt Sie" },
  aeo_question_headings: { en: "No heading matches what a customer types", de: "Keine Überschrift trifft, was ein Kunde tippt" },
  crawl_robots: { en: "Your robots file blocks Google", de: "Ihre robots-Datei sperrt Google aus" },
  crawl_sitemap: { en: "Google has no list of your pages", de: "Google hat keine Liste Ihrer Seiten" },
  blog_alive: { en: "Your blog has been standing still", de: "Ihr Blog steht seit Längerem still" },
};

/* WHAT TO DO. Verdict, proof, action -- without the third level every red
 * line is a data point instead of a job. The effort stands with it, because
 * "half an hour" is the difference between something he does today and
 * something he puts off indefinitely. */
const TUN: Record<string, { en: [string, string]; de: [string, string] }> = {
  onpage_title: { en: ["Rewrite the title as what you do plus the town, under 60 characters", "10 minutes"], de: ["Den Titel neu schreiben: Leistung plus Ort, unter 60 Zeichen", "10 Minuten"] },
  onpage_h1: { en: ["Make the first line name the job and the town, keep your own voice underneath", "15 minutes"], de: ["Die erste Row Leistung und Ort nennen lassen, Ihr Ton bleibt darunter", "15 Minuten"] },
  onpage_meta_description: { en: ["Write one sentence per page for the Google preview", "20 minutes"], de: ["Je Seite einen Satz für die Google-Vorschau schreiben", "20 Minuten"] },
  onpage_alt_text: { en: ["Describe each picture in a few words where it is uploaded", "30 minutes"], de: ["Jedes Bild dort, where es hochgeladen ist, in wenigen Worten beschreiben", "30 Minuten"] },
  onpage_lang: { en: ["Set the site language in your website settings", "5 minutes"], de: ["Die Seitensprache in den Website-Einstellungen setzen", "5 Minuten"] },
  onpage_canonical: { en: ["Point each page at its one official address", "20 minutes"], de: ["Jede Seite auf ihre eine offizielle Adresse zeigen lassen", "20 Minuten"] },
  onpage_schema_reviews: { en: ["Have your web person add the hidden rating labels, then Google can show your stars", "30 minutes"], de: ["Die Bewertung als unsichtbare Angabe hinterlegen lassen, dann zeigt Google Ihre Sterne", "30 Minuten"] },
  onpage_unique_titles: { en: ["Give every page its own title, and delete pages you never meant to publish", "20 minutes"], de: ["Jeder Seite einen eigenen Titel geben und Seiten löschen, die nie online sein sollten", "20 Minuten"] },
  onpage_thin_pages: { en: ["Fill the empty pages with a real answer, or point them at a page that has one", "1 hour"], de: ["Die leeren Seiten mit einer echten Antwort füllen oder auf eine verweisen, die eine hat", "1 Stunde"] },
  onpage_depth: { en: ["Answer the three questions people ask before they call, on the home page", "1 hour"], de: ["Die drei Fragen, die Leute vor dem Anruf stellen, auf der Startseite beantworten", "1 Stunde"] },
  onpage_map_embed: { en: ["Show the area you cover on the page", "15 minutes"], de: ["Das Gebiet, das Sie abdecken, auf der Seite zeigen", "15 Minuten"] },
  onpage_viewport: { en: ["Switch on the mobile view in your website settings", "10 minutes"], de: ["Die mobile Ansicht in den Website-Einstellungen einschalten", "10 Minuten"] },
  crawl_robots: { en: ["Remove the block from your robots file", "10 minutes"], de: ["Die Sperre aus der robots-Datei entfernen", "10 Minuten"] },
  crawl_sitemap: { en: ["Publish a sitemap and submit it in Search Console", "20 minutes"], de: ["Eine Sitemap veröffentlichen und in der Search Console einreichen", "20 Minuten"] },
  blog_alive: { en: ["Publish one piece that answers a question a customer actually asked", "2 hours"], de: ["Einen Beitrag veröffentlichen, der eine echte Kundenfrage beantwortet", "2 Stunden"] },
  crawl_ai_bots: { en: ["Remove the AI crawlers from the block list in your robots file", "10 minutes"], de: ["Die KI-Crawler aus der Sperrliste der robots-Datei nehmen", "10 Minuten"] },
  aeo_entity_facts: { en: ["Have your web person add the hidden labels for name, address and phone", "30 minutes"], de: ["Name, Adresse und Telefon als unsichtbare Angaben hinterlegen lassen", "30 Minuten"] },
  aeo_faq_schema: { en: ["Have your web person label each question and answer in the page code", "30 minutes"], de: ["Jede Frage und Antwort im Seitencode auszeichnen lassen", "30 Minuten"] },
  aeo_question_headings: { en: ["Turn three headings into the questions customers actually ask", "20 minutes"], de: ["Drei Überschriften in die Fragen umschreiben, die Kunden wirklich stellen", "20 Minuten"] },
  online_booking: { en: ["Put a booking link on the page, for people who would rather not phone", "1 hour"], de: ["Einen Buchungslink auf die Seite legen, für alle, die lieber nicht anrufen", "1 Stunde"] },
  opening_hours: { en: ["Put your opening hours on the page, next to the phone number", "10 minutes"], de: ["Die Öffnungszeiten neben die Telefonnummer auf die Seite", "10 Minuten"] },
  emergency_cover: { en: ["Say plainly whether you come out at night and at weekends", "10 minutes"], de: ["Klar sagen, ob Sie nachts und am Wochenende kommen", "10 Minuten"] },
  second_channel: { en: ["Add WhatsApp or a chat, for people who cannot talk right now", "30 minutes"], de: ["WhatsApp oder einen Chat anbieten, für alle, die gerade nicht reden können", "30 Minuten"] },
  response_time: { en: ["Promise a reply time you can keep, next to every contact option", "15 minutes"], de: ["Eine Antwortzeit versprechen, die Sie halten können, neben jeder Kontaktmöglichkeit", "15 Minuten"] },
  form_short: { en: ["Cut the form to name, phone and what they need", "20 minutes"], de: ["Das Formular auf Name, Telefon und Anliegen kürzen", "20 Minuten"] },
  form_button_says_outcome: { en: ["Change the button to what happens next, e.g. \"Get my quote\"", "5 minutes"], de: ["Den Button auf das Ergebnis ändern, z. B. „Angebot anfordern“", "5 Minuten"] },
  cta_above_fold: { en: ["Put a call button in the first screen", "15 minutes"], de: ["Einen Anrufbutton in den ersten Bildschirm legen", "15 Minuten"] },
  cta_repeated: { en: ["Repeat the call button further down the page", "15 minutes"], de: ["Den Anrufbutton weiter unten wiederholen", "15 Minuten"] },
  click_to_call: { en: ["Make the phone number tappable", "10 minutes"], de: ["Die Telefonnummer antippbar machen", "10 Minuten"] },
  lead_form: { en: ["Add a short form for people who will not phone", "1 hour"], de: ["Ein kurzes Formular für alle, die nicht anrufen", "1 Stunde"] },
  testimonials: { en: ["Put three customer quotes on the page, with names", "30 minutes"], de: ["Drei Kundenstimmen mit Namen auf die Seite", "30 Minuten"] },
  social_proof_numbers: { en: ["Show your years, jobs or customers as a number", "20 minutes"], de: ["Ihre Jahre, Aufträge oder Kunden als Zahl zeigen", "20 Minuten"] },
  review_badges: { en: ["Show your Google rating on the page", "20 minutes"], de: ["Ihre Google-Bewertung auf der Seite zeigen", "20 Minuten"] },
  video_top: { en: ["Record a 30-second introduction on your phone", "1 hour"], de: ["Eine 30-Sekunden-Vorstellung mit dem Handy aufnehmen", "1 Stunde"] },
  video_testimonials: { en: ["Ask one happy customer for 30 seconds on camera", "1 hour"], de: ["Einen zufriedenen Kunden um 30 Sekunden vor der Kamera bitten", "1 Stunde"] },
  logo_wall: { en: ["Show the names or memberships people recognise", "30 minutes"], de: ["Die Namen oder Mitgliedschaften zeigen, die Leute kennen", "30 Minuten"] },
  faq: { en: ["Answer the five questions you get on every call", "1 hour"], de: ["Die fünf Fragen beantworten, die bei jedem Anruf kommen", "1 Stunde"] },
  lead_magnet: { en: ["Offer one useful thing for free in exchange for an email", "2 hours"], de: ["Etwas Nützliches kostenlos gegen eine E-Mail anbieten", "2 Stunden"] },
  email_capture: { en: ["Add a way to collect an email from people who are not ready", "30 minutes"], de: ["Einen Weg schaffen, E-Mails von Unentschlossenen zu sammeln", "30 Minuten"] },
  analytics_live: { en: ["Install Google Analytics so you can see who comes", "30 minutes"], de: ["Google Analytics einrichten, damit Sie sehen, wer kommt", "30 Minuten"] },
  search_console: { en: ["Verify the site in Search Console, it is free", "10 minutes"], de: ["Die Seite in der Search Console verifizieren, sie ist kostenlos", "10 Minuten"] },
  aeo_llms_txt: { en: ["Put a file called llms.txt at yoursite.com/llms.txt: what you do, where, and your main pages", "10 minutes"], de: ["Eine Datei llms.txt unter ihreseite.de/llms.txt anlegen: was Sie tun, where, und Ihre wichtigsten Seiten", "10 Minuten"] },
  aeo_no_js: { en: ["Render the text on the server, not in the browser", "2 hours"], de: ["Den Text vom Server ausliefern statt im Browser aufbauen", "2 Stunden"] },
};

/* For every Lighthouse finding, what to do. Without this line the number is
 * a grade, with it a job. */
/* ONE LINE PER TO-DO, IN HIS WORDS. Before, finding and
 * action stood one under the other and said the same thing twice -- "A link
 * Google can't follow" plus "Make the link a normal href". Now one
 * instruction, with no href, no 48 px, no H1. And what is missing here is NOT
 * shown: Google's raw title ("Reduce unused JavaScript") in a client document
 * is exactly what this table exists to prevent. */
const LH_TUN: Record<string, { en: [string, string]; de: [string, string] }> = {
  "crawlable-anchors": { en: ["A link leads Google nowhere: the destination is only in the script, so the page behind it is invisible to search", "10 minutes"], de: ["Ein Link führt Google nirgendwohin: das Ziel steht nur im Skript, die Seite dahinter ist für die Suche unsichtbar", "10 Minuten"] },
  "link-name": { en: ["One link is just an icon, so nobody can tell what it opens", "10 minutes"], de: ["Ein Link ist nur ein Symbol, niemand sieht, was er öffnet", "10 Minuten"] },
  "link-text": { en: ["Some links say \"click here\" instead of where they lead", "15 minutes"], de: ["Manche Links sagen „hier klicken“ statt wohin sie führen", "15 Minuten"] },
  "heading-order": { en: ["The headings jump around, so the page has no clear outline", "20 minutes"], de: ["Die Überschriften springen, die Seite hat keine klare Gliederung", "20 Minuten"] },
  "image-alt": { en: ["Pictures have no description, so Google cannot read them", "30 minutes"], de: ["Bilder haben keine Beschreibung, Google kann sie nicht lesen", "30 Minuten"] },
  "color-contrast": { en: ["Some text has too little contrast to read easily in sunlight", "20 minutes"], de: ["Etwas Text hat zu wenig Kontrast, um ihn in der Sonne leicht zu lesen", "20 Minuten"] },
  "target-size": { en: ["Buttons sit too close together to tap reliably", "20 minutes"], de: ["Knöpfe liegen zu eng, um sicher zu treffen", "20 Minuten"] },
  "tap-targets": { en: ["Buttons sit too close together to tap reliably", "20 minutes"], de: ["Knöpfe liegen zu eng, um sicher zu treffen", "20 Minuten"] },
  "label": { en: ["Form fields lose their label as soon as you type", "15 minutes"], de: ["Formularfelder verlieren ihre Beschriftung, sobald man tippt", "15 Minuten"] },
  "button-name": { en: ["Some buttons have no name a phone can read out", "15 minutes"], de: ["Manche Knöpfe haben keinen Namen, den ein Handy vorlesen kann", "15 Minuten"] },
  "third-party-cookies": { en: ["The site sets tracking cookies browsers are switching off", "30 minutes"], de: ["Die Seite setzt Tracking-Cookies, die Browser abschalten", "30 Minuten"] },
  "errors-in-console": { en: ["The page throws errors while it runs", "1 hour"], de: ["Die Seite wirft im Betrieb Fehler", "1 Stunde"] },
  "no-vulnerable-libraries": { en: ["The site runs old code with known security holes", "1 hour"], de: ["Die Seite läuft mit altem Code und bekannten Sicherheitslücken", "1 Stunde"] },
  "deprecations": { en: ["The site uses features browsers are dropping", "1 hour"], de: ["Die Seite nutzt Funktionen, die Browser abschaffen", "1 Stunde"] },
  "is-on-https": { en: ["Parts of the page load unsecured", "30 minutes"], de: ["Teile der Seite laden ungesichert", "30 Minuten"] },
  "inspector-issues": { en: ["The browser reports problems with the page", "1 hour"], de: ["Der Browser meldet Probleme mit der Seite", "1 Stunde"] },
  "server-response-time": { en: ["Your host is slow to answer before the page even starts", "1 hour"], de: ["Ihr Hoster antwortet langsam, bevor die Seite überhaupt startet", "1 Stunde"] },
  "unused-javascript": { en: ["The page downloads program code it never uses", "1 hour"], de: ["Die Seite lädt Programmcode, den sie nie braucht", "1 Stunde"] },
  "unused-css-rules": { en: ["The page downloads design code it never uses", "1 hour"], de: ["Die Seite lädt Designcode, den sie nie braucht", "1 Stunde"] },
  "render-blocking-resources": { en: ["Design files load first, so the text waits behind them", "1 hour"], de: ["Designdateien laden zuerst, der Text wartet dahinter", "1 Stunde"] },
  "modern-image-formats": { en: ["Pictures are saved in an old, heavy format", "30 minutes"], de: ["Bilder liegen in einem alten, schweren Format", "30 Minuten"] },
  "uses-optimized-images": { en: ["Pictures are bigger than they need to be", "30 minutes"], de: ["Bilder sind größer als nötig", "30 Minuten"] },
  "uses-responsive-images": { en: ["Phones get the full desktop-size pictures", "30 minutes"], de: ["Handys bekommen die Bilder in Desktop-Größe", "30 Minuten"] },
  "offscreen-images": { en: ["Pictures load before anyone scrolls down to them", "30 minutes"], de: ["Bilder laden, bevor jemand zu ihnen scrollt", "30 Minuten"] },
  "uses-text-compression": { en: ["Text is sent uncompressed, so it takes longer than it needs", "20 minutes"], de: ["Text wird unkomprimiert gesendet und braucht länger als nötig", "20 Minuten"] },
  "redirects": { en: ["The address forwards once before the page even starts", "20 minutes"], de: ["Die Adresse leitet einmal um, bevor die Seite startet", "20 Minuten"] },
  "font-display": { en: ["Text stays invisible until the font has finished loading", "15 minutes"], de: ["Text bleibt unsichtbar, bis die Schrift geladen ist", "15 Minuten"] },
  "prioritize-lcp-image": { en: ["The main picture is not loaded first", "20 minutes"], de: ["Das Hauptbild wird nicht zuerst geladen", "20 Minuten"] },
  "total-byte-weight": { en: ["The page is heavy to download on a phone", "1 hour"], de: ["Die Seite ist am Handy schwer zu laden", "1 Stunde"] },
  "uses-long-cache-ttl": { en: ["Returning visitors download everything all over again", "30 minutes"], de: ["Wiederkehrende Besucher laden alles noch einmal", "30 Minuten"] },
  "third-party-summary": { en: ["Scripts from other companies slow the page down", "1 hour"], de: ["Skripte anderer Firmen bremsen die Seite", "1 Stunde"] },
  "mainthread-work-breakdown": { en: ["The phone works hard for seconds before it reacts", "1 hour"], de: ["Das Handy rechnet sekundenlang, bevor es reagiert", "1 Stunde"] },
  "bootup-time": { en: ["Scripts keep the phone busy before anything can be tapped", "1 hour"], de: ["Skripte halten das Handy beschäftigt, bevor man tippen kann", "1 Stunde"] },
  "dom-size": { en: ["The page is built from far too many parts", "1 hour"], de: ["Die Seite besteht aus viel zu vielen Teilen", "1 Stunde"] },
  "largest-contentful-paint-element": { en: ["The main content is the last thing to appear", "1 hour"], de: ["Der Hauptinhalt erscheint als Letztes", "1 Stunde"] },
  "layout-shift-elements": { en: ["Things jump around while the page is still loading", "1 hour"], de: ["Elemente springen, während die Seite noch lädt", "1 Stunde"] },
  "font-size": { en: ["Text is too small to read on a phone", "20 minutes"], de: ["Text ist auf dem Handy zu klein", "20 Minuten"] },
  "meta-description": { en: ["Google writes your search preview itself", "20 minutes"], de: ["Google schreibt Ihre Suchvorschau selbst", "20 Minuten"] },
  "document-title": { en: ["A page has no title for the search results", "10 minutes"], de: ["Eine Seite hat keinen Titel für die Suchergebnisse", "10 Minuten"] },
  "html-has-lang": { en: ["The page does not say which language it is in", "5 minutes"], de: ["Die Seite sagt nicht, in welcher Sprache sie ist", "5 Minuten"] },
  "is-crawlable": { en: ["The page tells Google not to list it", "10 minutes"], de: ["Die Seite sagt Google, sie nicht zu listen", "10 Minuten"] },
  "robots-txt": { en: ["The file that guides Google has errors in it", "20 minutes"], de: ["Die Datei, die Google leitet, hat Fehler", "20 Minuten"] },
  "canonical": { en: ["The page names the wrong address as its official one", "20 minutes"], de: ["Die Seite nennt die falsche Adresse als ihre offizielle", "20 Minuten"] },
  "hreflang": { en: ["The language links are set wrong", "20 minutes"], de: ["Die Sprachverweise sind falsch gesetzt", "20 Minuten"] },
  "image-aspect-ratio": { en: ["Pictures show up squashed or stretched", "20 minutes"], de: ["Bilder werden gestaucht oder gezerrt gezeigt", "20 Minuten"] },
  "image-size-responsive": { en: ["Pictures look blurry on sharp screens", "20 minutes"], de: ["Bilder wirken auf scharfen Bildschirmen unscharf", "20 Minuten"] },
};

/* THE READER IS THE WEBSITE PERSON. "Have your web
 * person..." pushes the job away; whoever opens this disclosure does it
 * themselves. So the instruction in the imperative, technically precise enough
 * to carry out. If an entry is missing here, the finding stands alone. */
const LH_FIX: Record<string, { en: string; de: string }> = {
  "crawlable-anchors": { en: "give it a real href instead of a click handler", de: "ihm ein echtes href geben statt eines Klick-Handlers" },
  "link-name": { en: "add link text or an aria-label", de: "Linktext oder ein aria-label ergänzen" },
  "link-text": { en: "name the destination in the link text", de: "das Ziel im Linktext benennen" },
  "heading-order": { en: "one H1, then H2s under it, no skipped levels", de: "eine H1, darunter H2, keine übersprungenen Ebenen" },
  "image-alt": { en: "write alt text on every content image", de: "Alt-Text auf jedes Inhaltsbild" },
  "color-contrast": { en: "darken the text to at least 4.5:1", de: "den Text auf mindestens 4,5:1 abdunkeln" },
  "target-size": { en: "make tap targets 48 px with space between", de: "Tippziele auf 48 px mit Abstand" },
  "tap-targets": { en: "make tap targets 48 px with space between", de: "Tippziele auf 48 px mit Abstand" },
  "label": { en: "bind a label to every input", de: "jedem Feld ein Label zuordnen" },
  "button-name": { en: "give every button accessible text", de: "jedem Knopf zugänglichen Text geben" },
  "third-party-cookies": { en: "drop the third-party cookies or move to first-party", de: "die Drittanbieter-Cookies entfernen oder auf First-Party umstellen" },
  "errors-in-console": { en: "clear the console errors", de: "die Konsolenfehler beheben" },
  "inspector-issues": { en: "work through the issues the browser reports", de: "die vom Browser gemeldeten Probleme abarbeiten" },
  "no-vulnerable-libraries": { en: "update the flagged libraries", de: "die gemeldeten Bibliotheken aktualisieren" },
  "deprecations": { en: "replace the deprecated APIs", de: "die veralteten Schnittstellen ersetzen" },
  "is-on-https": { en: "serve every asset over https", de: "jede Ressource über https ausliefern" },
  "server-response-time": { en: "cache at the server or move host", de: "serverseitig cachen oder den Hoster wechseln" },
  "unused-javascript": { en: "split the bundles and defer what this page does not need", de: "die Bundles aufteilen und laden, was diese Seite braucht" },
  "unused-css-rules": { en: "strip the unused rules from the stylesheet", de: "die ungenutzten Regeln aus dem Stylesheet entfernen" },
  "render-blocking-resources": { en: "inline the critical CSS and defer the rest", de: "das kritische CSS inline setzen, den Rest nachladen" },
  "modern-image-formats": { en: "serve WebP or AVIF", de: "WebP oder AVIF ausliefern" },
  "uses-optimized-images": { en: "compress the images before upload", de: "die Bilder vor dem Hochladen komprimieren" },
  "uses-responsive-images": { en: "add srcset so phones get a phone-sized file", de: "srcset ergänzen, damit Handys eine passende Datei bekommen" },
  "offscreen-images": { en: "lazy-load everything below the fold", de: "alles unterhalb des Falzes lazy laden" },
  "uses-text-compression": { en: "switch on gzip or brotli", de: "gzip oder brotli einschalten" },
  "redirects": { en: "link straight to the final URL", de: "direkt auf die Ziel-URL verlinken" },
  "font-display": { en: "set font-display: swap", de: "font-display: swap setzen" },
  "prioritize-lcp-image": { en: "preload the hero image and drop its lazy attribute", de: "das Hero-Bild vorladen und sein lazy-Attribut entfernen" },
  "total-byte-weight": { en: "cut the payload: images first, then scripts", de: "die Datenmenge senken: erst Bilder, dann Skripte" },
  "uses-long-cache-ttl": { en: "set long cache headers on static files", de: "lange Cache-Header auf statische Dateien" },
  "third-party-summary": { en: "defer or drop the third-party scripts", de: "die Drittanbieter-Skripte nachladen oder entfernen" },
  "mainthread-work-breakdown": { en: "break up the long tasks on the main thread", de: "die langen Aufgaben im Main Thread aufteilen" },
  "bootup-time": { en: "ship less JavaScript on this route", de: "weniger JavaScript auf dieser Route ausliefern" },
  "dom-size": { en: "cut the node count on the page", de: "die Zahl der Knoten auf der Seite senken" },
  "largest-contentful-paint-element": { en: "preload whatever paints last", de: "vorladen, was zuletzt erscheint" },
  "layout-shift-elements": { en: "reserve width and height for images and embeds", de: "Breite und Höhe für Bilder und Einbettungen reservieren" },
  "font-size": { en: "set body text to at least 16 px on mobile", de: "Fließtext mobil auf mindestens 16 px" },
  "meta-description": { en: "write a description per page", de: "je Seite eine Description schreiben" },
  "document-title": { en: "add a title tag", de: "ein Title-Tag ergänzen" },
  "html-has-lang": { en: "set lang on the html element", de: "lang am html-Element setzen" },
  "is-crawlable": { en: "remove the noindex", de: "das noindex entfernen" },
  "robots-txt": { en: "fix the syntax in robots.txt", de: "die Syntax in robots.txt korrigieren" },
  "canonical": { en: "point the canonical at the live URL", de: "das Canonical auf die Live-URL zeigen lassen" },
  "hreflang": { en: "correct the hreflang pairs", de: "die hreflang-Paare korrigieren" },
  "image-aspect-ratio": { en: "match the width and height to the file", de: "Breite und Höhe an die Datei angleichen" },
  "image-size-responsive": { en: "serve files at twice the display size", de: "Dateien in doppelter Anzeigegröße ausliefern" },
};

const T = {
  en: {
    intro: "Three read this page: Google, the AI search, and the person who clicked.",
    kopf: "Three read your site",
    leserNamen: { google: "Google", ki: "AI search", besucher: "Visitor" } as Record<Reader, string>,
    checks: "checks pass",
    notNeeded: "not needed here",
    inPlace: "all in place",
    lighthouse: "Google's own measurement",
    lhKarte: "What else Google flagged",
    geprueft: "The page details shaping your Google visibility",
    passt: "Good",
    warum: "Why it matters",
    fehlend: "Missing",
    missing: "What is missing",
    inOrdnung: "in order",
    // What is measured: Google's test on a throttled phone, until the largest
    // content is there. "to load on a phone" read as his own phone (24.09.2026).
    tempoZeile: "until the main content shows in Google's slow-phone test.",
    tempoGut: "Google's mark: 2.5 s.",
    // A sourced number instead of a rule of thumb (23.09.2026): Google/SOASTA
    // 2017, 53% of mobile visits are abandoned when a page takes longer than 3 s.
    tempoSchlecht: "Google's mark: 2.5 s. Google's own research: 53% of mobile visits are abandoned after 3 s.",
    tempoQuelle: "Google, 2017",
    messenSub: "You cannot fix what nothing is counting.",
    tempoChancen: "What would make it faster:",
    messen: "And whether you notice any of it",
    current: "The page customers see today",
    noScreenshot: "The website was checked, but no reliable page screenshot was returned in this run.",
    lcp: "before anything shows on a phone",
  },
  de: {
    intro: "Drei lesen diese Seite: Google, die KI-Suche, und der Mensch, der geklickt hat.",
    kopf: "Drei lesen Ihre Seite",
    leserNamen: { google: "Google", ki: "KI-Suche", besucher: "Besucher" } as Record<Reader, string>,
    checks: "Prüfungen bestanden",
    notNeeded: "hier nicht nötig",
    inPlace: "alles da",
    lighthouse: "Googles eigene Messung",
    lhKarte: "Was Google sonst noch bemängelt",
    geprueft: "Die Seitendetails, die Ihre Google-Sichtbarkeit prägen",
    passt: "Passt",
    warum: "Warum das zählt",
    fehlend: "Fehlt",
    missing: "Was missing",
    inOrdnung: "in Ordnung",
    tempoZeile: "bis der Hauptinhalt steht, in Googles Test mit langsamem Handy.",
    tempoGut: "Googles Marke: 2,5 s.",
    tempoSchlecht: "Googles Marke: 2,5 s. Laut Google brechen 53 % der mobilen Besuche nach 3 s ab.",
    tempoQuelle: "Google, 2017",
    messenSub: "Was nichts mitzählt, kann man nicht verbessern.",
    tempoChancen: "Was sie schneller machen würde:",
    messen: "Und ob Sie davon etwas mitbekommen",
    current: "Die Seite, die Kunden heute sehen",
    noScreenshot: "Die Website wurde geprüft, aber in diesem Lauf kam kein belastbarer Screenshot zurück.",
    lcp: "bis auf dem Handy etwas zu sehen ist",
  },
};

/** The cards of a panel, always visible. A disclosure
 *  around the whole group hid four questions behind one line; only each single
 *  card is closed, and its question plus its counter is enough to decide
 *  where to look inside. */
function Pruefungen({ gruppen, elemente, locale, extra, hinterZeile }: {
  gruppen: Gruppe[]; elemente: CroElement[]; locale: Locale; extra?: React.ReactNode;
  /** Google: the on-page part sits behind a small line and stays closed. */
  hinterZeile?: boolean;
}) {
  const alle = zeilenFuer(elemente, gruppen.flatMap((g) => g.keys));
  const { da, von } = stand(alle);
  if (!von) return null;
  /* An odd card at the end runs across both columns, otherwise it stands
     alone next to a gap. */
  const ungerade = gruppen.length % 2 === 1;
  const karten = (
    <div className="grid gap-3 sm:grid-cols-2">
      {gruppen.map((g, i) => (
        <div key={g.title} className={ungerade && i === gruppen.length - 1 ? "sm:col-span-2" : undefined}>
          <Karte g={g} elemente={elemente} locale={locale} />
        </div>
      ))}
      {extra}
    </div>
  );
  if (!hinterZeile) return <div className="mt-5">{karten}</div>;
  return (
    <details className="group mt-4">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 text-[12px] font-semibold text-graphite hover:text-navy sm:min-h-0 [&::-webkit-details-marker]:hidden">
        <span className="inline-flex items-center gap-2">
          <ChevronDown className="size-3.5 transition-transform group-open:rotate-180" />
          {T[locale].geprueft}
        </span>
        <span className="tnum font-bold" style={{ color: da < von ? ROT : GRUEN }}>{da}<span className="text-graphite">/{von}</span></span>
      </summary>
      <div className="mt-3">{karten}</div>
    </details>
  );
}

const GRUEN = "#1a6b45";
const ROT = "#9c2c2c";

function name(e: CroElement, locale: Locale): string {
  return (e.key && ZEILEN_NAMEN[e.key]?.[locale]) || e.label;
}

/** The rows of a group, in the order of their keys. */
function zeilenFuer(elemente: CroElement[], keys: string[]): CroElement[] {
  return keys.map((k) => elemente.find((e) => e.key === k)).filter((e): e is CroElement => !!e);
}

function stand(rows: CroElement[]) {
  const zaehlbar = rows.filter((e) => e.applies !== false);
  return { da: zaehlbar.filter((e) => e.present).length, von: zaehlbar.length };
}



/* THE VERDICT OUT OF THE MEASUREMENT (24.09.2026). The fixed sentence "Google
 * cannot read most of your pictures" stood over 8 of 19, "your title does not
 * say what you do" over a title that named the trade. Where the evidence is
 * more precise, the evidence speaks. */
function gemessenesUrteil(key: string, e: CroElement, locale: Locale): string | null {
  const de = locale === "de";
  const beleg = String(e.evidence ?? "");
  const folge = String(e.consequence ?? "");
  if (key === "onpage_alt_text") {
    const m = beleg.match(/(\d+) of (\d+) pictures/);
    if (!m) return null;
    const ohne = Number(m[2]) - Number(m[1]);
    return de ? `${ohne} von ${m[2]} Bildern haben keine Beschreibung` : `${ohne} of your ${m[2]} pictures have no description`;
  }
  if (key === "onpage_title") {
    const was = /what you do/.test(folge);
    const where = /\bwhere\b/.test(folge);
    if (was && !where) return de ? "Ihr Seitentitel sagt nicht, was Sie tun" : "Your page title does not say what you do";
    if (where && !was) return de ? "Ihr Seitentitel sagt nicht, where Sie arbeiten" : "Your page title does not say where you work";
    return null;
  }
  if (key === "blog_alive" && /no blog link/.test(beleg)) return de ? "Sie haben keinen Blog" : "You have no blog";
  if (key === "onpage_unique_titles") {
    const m = beleg.match(/(\d+) of (\d+) pages share a title/);
    if (m) return de ? `${m[1]} Ihrer Seiten teilen sich einen Titel` : `${m[1]} of your pages share one title`;
  }
  if (key === "onpage_thin_pages") {
    const m = beleg.match(/(\d+) of (\d+) pages carry under 200 words/);
    if (m) return de ? `${m[1]} von ${m[2]} Seiten haben weniger als 200 Wörter` : `${m[1]} of ${m[2]} pages carry fewer than 200 words`;
  }
  return null;
}

function Row({ e, locale }: { e: CroElement; locale: Locale }) {
  const missing = e.applies !== false && !e.present;
  const nichtNoetig = e.applies === false;
  const schluessel = (e.key ?? "").replace(/^lh:/, "");
  const urteil = missing ? (gemessenesUrteil(schluessel, e, locale) ?? ROT_URTEIL[schluessel]?.[locale] ?? name(e, locale)) : name(e, locale);
  const tun = missing ? TUN[schluessel]?.[locale] : undefined;
  return (
    <div className="grid grid-cols-[18px_minmax(0,1fr)] items-start gap-x-3 border-b border-slate-100 py-3 last:border-b-0">
      <span aria-hidden className="mt-[1px] text-center text-[13px] font-black leading-[1.5]"
            style={{ color: nichtNoetig ? "#cbd5e1" : e.present ? GRUEN : ROT }}>
        {nichtNoetig ? "–" : e.present ? "✓" : "✕"}
      </span>
      <div className="min-w-0">
        {/* Verdict, proof, action. Without the third level the row is a data
            point; with it, it is a job. */}
        <span style={{ color: nichtNoetig ? "#a8a49b" : missing ? "#1c170e" : "#4a463d" }}
              className={`block text-[13.5px] leading-[1.4] ${missing ? "font-bold" : "font-medium"}`}>
          {urteil}{nichtNoetig ? ` · ${T[locale].notNeeded}` : ""}
        </span>
        {missing && e.consequence ? <span style={{ color: "#6b6559" }} className="mt-0.5 block text-[12.5px] leading-[1.45]">{e.consequence}</span> : null}
        {tun ? (
          <span className="mt-1.5 flex items-start gap-1.5 text-[12.5px] leading-[1.45]" style={{ color: "#1f3f8f" }}>
            <span aria-hidden className="mt-[1px]">→</span>
            {/* The one-page summary reads exactly this marker
                (`onepager.py:98`). Before, the deleted fix-this-now block
                carried it; now every action sits at its own finding. */}
            <span data-onepager="fix"><b className="font-semibold">{tun[0]}</b><span className="text-graphite"> · {tun[1]}</span></span>
          </span>
        ) : null}
        {!missing && !nichtNoetig && e.evidence && e.evidence.length <= 48 ? <span className="mt-0.5 block text-[12px] leading-[1.4] text-graphite">{e.evidence}</span> : null}
      </div>
    </div>
  );
}

/** One card: title, score row, one sentence. Open, the rows. */
function Karte({ g, elemente, locale }: { g: Gruppe; elemente: CroElement[]; locale: Locale }) {
  const rows = zeilenFuer(elemente, g.keys);
  if (!rows.length) return null;
  const { da, von } = stand(rows);
  return (
    /* GOOGLE FOLDS OPEN, THE VISITOR STANDS OPEN. The
       on-page part is the technical part and may be closed; what a visitor
       experiences is the panel's main statement and stays visible. */
    /* A HINT OF GRADIENT. White cards on a white ground
       disappear; a gradient from the status colour into white lifts them off
       without the card itself looking coloured. Green when all green, else
       red -- the same traffic light as the mark on the left. */
    <details className="group rounded-xl border shadow-[0_1px_2px_rgba(28,23,18,.04)] open:border-navy/40"
             style={{
               borderColor: da === von ? "rgba(26,107,69,.14)" : "rgba(156,44,44,.14)",
               backgroundImage: da === von
                 ? "linear-gradient(160deg, #f4fbf7 0%, #ffffff 58%)"
                 : "linear-gradient(160deg, #fdf5f5 0%, #ffffff 58%)",
             }}>
      <summary className="cursor-pointer list-none p-4 [&::-webkit-details-marker]:hidden">
        <span className="flex items-center gap-3">
          {/* The mark carries the colour of the state: all green means done,
              red means there is work here. */}
          {g.icon && KARTEN_ICON[g.icon] ? (
            <span className="grid size-12 shrink-0 place-items-center rounded-[14px] border"
                  style={{ background: da === von ? "#eff8f3" : "#fdf2f2", borderColor: da === von ? "rgba(26,107,69,.16)" : "rgba(156,44,44,.16)", color: da === von ? GRUEN : ROT }}>
              <svg viewBox="0 0 24 24" fill="none" className="size-[26px]" aria-hidden>{KARTEN_ICON[g.icon]}</svg>
            </span>
          ) : null}
          <strong className="min-w-0 flex-1 text-[14px] text-ink">{g.title}</strong>
          <span className="flex shrink-0 items-center gap-2">
            <span className="tnum text-[13px] font-black" style={{ color: da === von ? GRUEN : ROT }}>{da}<span className="text-graphite"> / {von}</span></span>
            <ChevronDown className="size-4 text-navy transition-transform group-open:rotate-180" />
          </span>
        </span>
        {/* NO MORE SENTENCE UNDER THE QUESTION. The title is
            the question, and mark, colour and counter are the answer. One extra
            sentence turned four cards into four blocks of text. */}
      </summary>
      <div className="border-t border-hairline bg-[#fbfaf7] px-4 pb-2 pt-1">
        {rows.map((e) => <Row key={e.key ?? e.label} e={e} locale={locale} />)}
      </div>
    </details>
  );
}

/* A MARK THAT LEADS. Four cards with title, points and
 * sentence were four blocks of text; the eye had no anchor. Every group now
 * carries its own picture, large and in the colour of its state
 * -- filled when all green, hollow while something is missing. */
/* Fine line drawings instead of filled areas. 1.5 stroke, round caps, a
 * single accent per mark -- the same language as the reader marks in the
 * panel head, only set larger. */
const KARTEN_ICON: Record<string, React.ReactNode> = {
  tuer: <><path d="M6.25 3.75h8.5a1.5 1.5 0 0 1 1.5 1.5v15H6.25a1.5 1.5 0 0 1-1.5-1.5V5.25a1.5 1.5 0 0 1 1.5-1.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><path d="M12.9 12.15v.7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><path d="M19.25 20.25h-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></>,
  lesen: <><path d="M12 6.75c-2-1.4-4.2-1.95-6.75-1.45v11.4c2.55-.5 4.75.05 6.75 1.45m0-11.4c2-1.4 4.2-1.95 6.75-1.45v11.4c-2.55-.5-4.75.05-6.75 1.45m0-11.4v11.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></>,
  stern: <><path d="m12 4.25 2.32 4.7 5.18.76-3.75 3.65.89 5.16L12 16.08l-4.64 2.44.89-5.16-3.75-3.65 5.18-.76L12 4.25Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></>,
  besen: <><path d="M14.9 3.6 9.7 12.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><path d="M6.15 12.6h8.7l1.55 7.8H4.6l1.55-7.8Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><path d="M8.6 15.4v2.6M12.4 15.4v2.6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></>,
  kontakt: <><path d="M5.75 7.3a2.55 2.55 0 0 1 2.55-2.55h.95c.62 0 1.15.44 1.26 1.05l.5 2.8c.1.53-.13 1.07-.57 1.37l-1.02.7a11.9 11.9 0 0 0 4.16 4.16l.7-1.02c.3-.44.84-.67 1.37-.57l2.8.5c.61.11 1.05.64 1.05 1.26v.95a2.55 2.55 0 0 1-2.55 2.55C10.62 18.5 5.75 13.63 5.75 7.3Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></>,
  termin: <><rect x="3.75" y="5.75" width="16.5" height="14.5" rx="2.5" stroke="currentColor" strokeWidth="1.5" /><path d="M3.75 10.25h16.5" stroke="currentColor" strokeWidth="1.5" /><path d="M8.25 3.75v3.5M15.75 3.75v3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><path d="m9.2 15.1 1.9 1.9 3.7-3.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></>,
  vertrauen: <><path d="M12 3.9 5.4 6.2v5.1c0 3.7 2.6 7.1 6.6 8.8 4-1.7 6.6-5.1 6.6-8.8V6.2L12 3.9Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /><path d="m9.3 11.9 1.9 1.9 3.6-3.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></>,
  entscheiden: <><circle cx="12" cy="12" r="8.25" stroke="currentColor" strokeWidth="1.5" /><path d="M9.7 9.5a2.35 2.35 0 1 1 3.25 2.3c-.6.26-.95.86-.95 1.5v.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><circle cx="12" cy="16.6" r=".95" fill="currentColor" /></>,
  messen: <><path d="M4 20.25h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><path d="M5.6 17.2v-4.5M10.5 17.2V8.6M15.4 17.2v-6.3M20 17.2V5.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></>,
  lupe: <><circle cx="10.7" cy="10.7" r="6.45" stroke="currentColor" strokeWidth="1.5" /><path d="m15.4 15.4 4.35 4.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></>,
};


const GLYPH: Record<Reader, React.ReactNode> = {
  google: <svg viewBox="0 0 24 24" fill="none" className="size-6" aria-hidden><circle cx="10.5" cy="10.5" r="6.8" fill="currentColor" fillOpacity=".15" stroke="currentColor" strokeWidth="2.4" /><path d="M15.6 15.6 21 21" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" /></svg>,
  ki: <svg viewBox="0 0 24 24" fill="none" className="size-6" aria-hidden><path d="M11 2.6 13 8.4 18.8 10.4 13 12.4 11 18.2 9 12.4 3.2 10.4 9 8.4 11 2.6z" fill="currentColor" /><path d="M18.4 14.4 19.4 17.2 22.2 18.2 19.4 19.2 18.4 22 17.4 19.2 14.6 18.2 17.4 17.2 18.4 14.4z" fill="currentColor" /></svg>,
  besucher: <svg viewBox="0 0 24 24" fill="none" className="size-6" aria-hidden><circle cx="12" cy="7.8" r="4.2" fill="currentColor" fillOpacity=".15" stroke="currentColor" strokeWidth="2.4" /><path d="M3.8 21c0-4.2 3.7-7.2 8.2-7.2s8.2 3 8.2 7.2" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" /></svg>,
};


export function WebsiteDetail({ data, locale }: { data: ProposalData; locale: Locale }) {
  const t = T[locale];
  const leser = LESER[locale];
  const speed = data.cro?.speed;
  /* THE LOAD TIME STOOD THERE THREE TIMES (inventory 20.09.2026). The yes/no
     check drops out; the seconds stand once, in Google's measurement. */
  const elemente = (data.cro?.elements ?? []).filter((e) => e.key !== "phone_speed");

  return (
    <div className="grid gap-5">
      {/* THE HEAD IS GONE ENTIRELY. First an empty line
          with a number, then three bars -- both were a preview of something
          that stands directly below anyway. The chapter starts with Google,
          as reality does too. */}

      {/* ONE UNDER THE OTHER, NOT SIDE BY SIDE. Three
          senders in reading order: Google, the AI, the human. */}
      <TafelGoogle spec={leser.google} elemente={elemente} speed={speed} locale={locale} />
      <TafelKi spec={leser.ki} elemente={elemente} locale={locale} />
      <TafelBesucher spec={leser.besucher} elemente={elemente} locale={locale} />

      {/* THE MEASUREMENT BOX IS NOW THE FIFTH CARD.
          As its own strip below everything it stood there with no context;
          it is the same question as the four before it, only from his side. */}

      <article className="overflow-hidden rounded-2xl border border-hairline bg-slate-100">
        <header className="flex items-center justify-between gap-3 bg-white px-4 py-3">
          <strong className="block text-[13px] text-slate-950">{t.current}</strong>
          <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] sm:text-[9px] font-black uppercase text-slate-600">Live</span>
        </header>
        <div className="grid h-[360px] place-items-start overflow-hidden bg-[#ebeef2] p-3 sm:h-[420px] sm:p-4">
          <div className="mx-auto h-full w-full overflow-y-auto rounded-xl border border-slate-300 bg-white shadow-sm">
            {speed?.desktopScreenshot
              ? <img src={speed.desktopScreenshot} alt={`${data.clientName} current desktop website`} loading="lazy" decoding="async" className="h-auto w-full" />
              : <p className="p-4 text-sm text-graphite">{t.noScreenshot}</p>}
          </div>
        </div>
      </article>
    </div>
  );
}

/** Head of a panel: mark, name, who the reader is, counter on the right. */
function TafelKopf({ where, spec, da, von }: { where: Reader; spec: LeserSpec; da?: number; von?: number }) {
  return (
    <div className="flex items-center justify-between gap-3 sm:gap-4">
      <div className="min-w-0 max-w-[56ch]">
        <h3 className="m-0 flex items-start gap-2 text-navy sm:items-center"><span className="mt-[3px] shrink-0 sm:mt-0">{GLYPH[where]}</span><span className="text-[19px] font-black leading-[1.15] tracking-[-.02em] text-ink">{spec.title}</span></h3>
        {/* NO SUBTITLE: the chapter storyline above
            already says who the three readers are. */}
      </div>
      {/* ONLY THE VISITOR CARRIES THE TOTAL COUNTER: with
          Google there are four Lighthouse numbers, with the AI six ticks -- a
          fraction above them would be the seventh number in the frame. */}
      {von != null && da != null ? (
        <span className="flex shrink-0 items-baseline gap-1.5">
          <b className="tnum text-[24px] sm:text-[30px] font-black leading-none tracking-[-.03em]" style={{ color: da < von ? ROT : GRUEN }}>{da}</b>
          <span className="tnum text-[15px] font-bold leading-none text-graphite">/ {von}</span>
        </span>
      ) : null}
    </div>
  );
}


/** Google: four values under Google's names, the seconds with the chances, then
 *  what is missing -- Google's red findings and ours, on one line. The green
 *  only counts. */
function TafelGoogle({ spec, elemente, speed, locale }: { spec: LeserSpec; elemente: CroElement[]; speed: CroSpeed | null | undefined; locale: Locale }) {
  const t = T[locale];
  const werte = (["seo", "accessibility", "performance", "best-practices"] as const)
    .map((k) => ({ k, v: k === "performance" ? (speed?.scores?.performance ?? speed?.score) : speed?.scores?.[k] }))
    .filter((z) => z.v != null);
  const chancen = findingsFor(speed, "besucher", locale).filter((b) => /\d s( |$)/.test(b.text));
  /* GOOGLE'S OWN RED FINDINGS BECOME ONE CARD. As a
     word cloud next to ours they stood there with no sender and no action. */
  const unsere = zeilenFuer(elemente, spec.gruppen.flatMap((g) => g.keys));
  return (
    <section className="rounded-2xl border border-hairline bg-white p-5 sm:p-6">
      <TafelKopf where="google" spec={spec} />
      {werte.length ? (
        <div className="mt-5">
          {/* NO LINE ABOVE THE NUMBERS: Google's names sit on the tiles themselves. */}
          <div className="mt-2 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-hairline bg-hairline sm:grid-cols-4">
            {werte.map((z) => {
              const wert = z.v as number;
              const farbe = wert >= 90 ? GRUEN : wert >= 50 ? "#b45309" : ROT;
              const title = LIGHTHOUSE_NAMEN[z.k][locale];
              /* Every number folds open its own to-dos: Google's findings from
                 EXACTLY that category, translated, with action and effort. */
              const todos = (speed?.findings?.[z.k] ?? []).filter((b) => LH_TUN[b.id]);
              return (
                <details key={z.k} className="group bg-white open:bg-[#fbfaf7]">
                  <summary className={`list-none px-4 py-3.5 [&::-webkit-details-marker]:hidden ${todos.length ? "cursor-pointer" : ""}`}>
                    {/* Google's own word small above it: he finds the
                        number again in his Lighthouse report, and the
                        question below it tells him what it means. */}
                    <span className="mb-1 block text-[11px] sm:text-[9.5px] font-bold uppercase tracking-[.08em] text-pewter">{LIGHTHOUSE_KENNWORT[z.k]}</span>
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="flex items-baseline gap-2">
                        <b className="tnum text-[30px] font-black leading-none tracking-[-.03em]" style={{ color: farbe }}>{wert}</b>
                        {/* NO GRADE WORD: the colour of the
                            number says the same thing. */}
                      </span>
                      {todos.length ? <ChevronDown className="size-4 shrink-0 text-navy transition-transform group-open:rotate-180" /> : null}
                    </span>
                    <span className="mt-1.5 block text-[12.5px] font-semibold leading-[1.35] text-ink">{title}</span>
                  </summary>
                  {todos.length ? (() => {
                    /* NOTHING BUT POSITION AND EFFORT. Even in
                       plain owner's German, "the page downloads program code it
                       never uses" stayed a sentence he cannot judge. The number
                       says how it stands; the time says what it costs; the
                       details belong on his web person's invoice, not in this
                       document. */
                    const minuten = todos.reduce((s, b) => s + (parseInt(LH_TUN[b.id].en[1], 10) || 0) * (LH_TUN[b.id].en[1].includes("h") ? 60 : 1), 0);
                    const sek = todos.reduce((s, b) => s + (b.einsparung_ms || 0), 0) / 1000;
                    // "0.3 s faster" next to a 24.9 s load time reads as mockery
                    // (24.09.2026): name the gain only when it reaches a tenth
                    // of the measured load time.
                    const ladezeit = parseFloat(String(speed?.lcp ?? "").replace(",", "."));
                    const zeigeGewinn = sek >= 0.2 && (!Number.isFinite(ladezeit) || sek >= ladezeit * 0.1);
                    const namen = todos.map((b) => BEFUND_WORT[b.id]?.[locale]).filter(Boolean);
                    const liste = namen.length > 1
                      ? `${namen.slice(0, -1).join(", ")} ${locale === "de" ? "und" : "and"} ${namen.at(-1)}`
                      : (namen[0] ?? "");
                    const stunden = Math.round(minuten / 60 * 2) / 2;
                    // A tiny fix next to a very long load time reads as "an hour of
                    // work against 25 seconds" (24.09.2026): then no line at all.
                    if (!zeigeGewinn && Number.isFinite(ladezeit) && ladezeit > 4) return null;
                    const aufwand = minuten >= 60
                      ? `${stunden} ${locale === "de" ? (stunden === 1 ? "Stunde" : "Stunden") : (stunden === 1 ? "hour" : "hours")}`
                      : `${minuten} ${locale === "de" ? "Minuten" : "minutes"}`;
                    return (
                      <div className="border-t border-hairline px-4 py-3.5">
                        <p className="m-0 text-[13px] leading-[1.5] text-ink">
                          <b className="font-semibold">{liste.charAt(0).toUpperCase() + liste.slice(1)}.</b>{" "}
                          <span className="text-graphite">
                            {locale === "de"
                              ? <>Rund {aufwand} Arbeit{zeigeGewinn ? <>, etwa {sek.toFixed(1)} s schneller</> : null}.</>
                              : <>About {aufwand} of work{zeigeGewinn ? <>, roughly {sek.toFixed(1)} s faster</> : null}.</>}
                          </span>
                        </p>
                      </div>
                    );
                  })() : null}
                </details>
              );
            })}
          </div>
          {speed?.lcp ? (() => {
            const sek = parseFloat(String(speed.lcp).replace(",", "."));
            const stufe = isNaN(sek) ? "rot" : sek <= 2.5 ? "gruen" : sek <= 4 ? "gelb" : "rot";
            const farbe = stufe === "gruen" ? GRUEN : stufe === "gelb" ? "#b45309" : ROT;
            const hintergrund = stufe === "gruen" ? "#e9f5ee" : stufe === "gelb" ? "#fdf3e1" : "#fbeaea";
            return (
              <div className="mt-3 grid gap-x-5 gap-y-2 rounded-xl px-4 py-4 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center" style={{ background: hintergrund }}>
                <b className="tnum text-[32px] font-black leading-none tracking-[-.04em] sm:text-[44px]" style={{ color: farbe }}>{speed.lcp}</b>
                <div className="min-w-0">
                  <p className="m-0 text-[14px] font-bold leading-[1.4] text-ink">
                    {t.tempoZeile} <span className="font-normal">{stufe === "gruen" ? t.tempoGut : t.tempoSchlecht}</span>
                  </p>
                  {chancen.length ? (
                    <p className="mb-0 mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-[12.5px] leading-[1.45] text-graphite">
                      <span className="font-semibold" style={{ color: farbe }}>{t.tempoChancen}</span>
                      {chancen.map((c) => <span key={c.text}>{c.text}</span>)}
                    </p>
                  ) : null}
                </div>
              </div>
            );
          })() : null}
        </div>
      ) : null}
      <Pruefungen gruppen={spec.gruppen} elemente={elemente} locale={locale} hinterZeile />
    </section>
  );
}


/** AI: four large tiles, nothing else. */
function TafelKi({ spec, elemente, locale }: { spec: LeserSpec; elemente: CroElement[]; locale: Locale }) {
  /* TWO CARDS INSTEAD OF SIX ROWS. Six questions one
     under the other, each with ChatGPT in its name, read as a list of the same
     sentence. Two cards ask what matters: can it read you, and can it
     recommend you. */
  return (
    <section className="rounded-2xl border border-hairline bg-white p-5 sm:p-6">
      <TafelKopf where="ki" spec={spec} />
      <Pruefungen gruppen={spec.gruppen} elemente={elemente} locale={locale} />
    </section>
  );
}


/** Visitor: the four cards with question, points, sentence and the checklist. */
function TafelBesucher({ spec, elemente, locale }: { spec: LeserSpec; elemente: CroElement[]; locale: Locale }) {
  const alle = zeilenFuer(elemente, spec.gruppen.flatMap((g) => g.keys));
  const { da, von } = stand(alle);
  return (
    <section className="rounded-2xl border border-hairline bg-white p-5 sm:p-6">
      <TafelKopf where="besucher" spec={spec} da={da} von={von} />
      {/* The cards stand visible, but each one is closed:
          five open cards with six rows each are thirty rows in one go. The
          question and the counter are enough to decide by. */}
      <Pruefungen gruppen={spec.gruppen} elemente={elemente} locale={locale} />
    </section>
  );
}
