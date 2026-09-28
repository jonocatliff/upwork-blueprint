"use client";

import { useState } from "react";
import type { CroElement, CroSpeed, ProposalData } from "./types";
import { ChevronDown } from "./service-icons";

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

const FINDING_TEXTS: Record<string, { where: Reader; text: string }> = {
  "document-title": { where: "google", text: "The page has no title" },
  "meta-description": { where: "google", text: "No preview text for the Google result" },
  "image-alt": { where: "google", text: "{n} pictures carry no description" },
  "link-text": { where: "google", text: "{n} links just say \"click here\"" },
  "link-name": { where: "google", text: "{n} links have no readable name" },
  "crawlable-anchors": { where: "google", text: "{n} links Google cannot follow" },
  "is-crawlable": { where: "google", text: "The page tells Google not to index it" },
  "robots-txt": { where: "google", text: "The robots file is broken" },
  "hreflang": { where: "google", text: "Language links are set wrong" },
  "canonical": { where: "google", text: "The page's official address is wrong" },
  "html-has-lang": { where: "google", text: "The page does not say its language" },
  "heading-order": { where: "google", text: "Headings skip levels, so the structure is unclear" },
  "http-status-code": { where: "google", text: "The page answers with an error code" },
  "font-size": { where: "google", text: "Text too small to read on a phone" },
  "render-blocking-resources": { where: "besucher", text: "Design files load before any text can appear · {s} s to gain" },
  "unused-css-rules": { where: "besucher", text: "Style code this page never uses · {s} s to gain" },
  "unused-javascript": { where: "besucher", text: "Script code this page never uses · {s} s to gain" },
  "modern-image-formats": { where: "besucher", text: "Pictures in an old, heavy format · {s} s to gain" },
  "uses-optimized-images": { where: "besucher", text: "Pictures saved larger than needed · {s} s to gain" },
  "uses-responsive-images": { where: "besucher", text: "Desktop-size pictures sent to phones · {s} s to gain" },
  "offscreen-images": { where: "besucher", text: "Pictures load before anyone scrolls to them · {s} s to gain" },
  "prioritize-lcp-image": { where: "besucher", text: "The main picture is not loaded first" },
  "server-response-time": { where: "besucher", text: "The server itself is slow to answer" },
  "total-byte-weight": { where: "besucher", text: "The page is very heavy to download" },
  "uses-text-compression": { where: "besucher", text: "Text is sent uncompressed · {s} s to gain" },
  "uses-long-cache-ttl": { where: "besucher", text: "Returning visitors download everything again" },
  "font-display": { where: "besucher", text: "Text stays invisible until the font arrives" },
  "third-party-summary": { where: "besucher", text: "Outside scripts slow the page down" },
  "mainthread-work-breakdown": { where: "besucher", text: "The phone works hard before it can react" },
  "bootup-time": { where: "besucher", text: "Scripts keep the phone busy for seconds" },
  "dom-size": { where: "besucher", text: "The page is built from too many parts" },
  "redirects": { where: "besucher", text: "The address forwards before the page loads" },
  "cumulative-layout-shift": { where: "besucher", text: "Things jump around while the page loads" },
  "layout-shift-elements": { where: "besucher", text: "Things jump around while the page loads" },
  "largest-contentful-paint": { where: "besucher", text: "The main content appears late" },
  "largest-contentful-paint-element": { where: "besucher", text: "The main content appears late" },
  "first-contentful-paint": { where: "besucher", text: "Nothing shows for a long moment" },
  "speed-index": { where: "besucher", text: "The page fills in slowly" },
  "total-blocking-time": { where: "besucher", text: "The page ignores taps while it loads" },
  "interactive": { where: "besucher", text: "It takes long before anything can be tapped" },
  "color-contrast": { where: "besucher", text: "{n} texts with too little contrast" },
  "tap-targets": { where: "besucher", text: "Buttons too small or too close to tap" },
  "target-size": { where: "besucher", text: "Buttons too small or too close to tap" },
  "label": { where: "besucher", text: "{n} form fields without a label" },
  "button-name": { where: "besucher", text: "{n} buttons with no readable name" },
  "meta-viewport": { where: "besucher", text: "Not built for a phone screen" },
  "is-on-https": { where: "besucher", text: "Parts of the page load insecurely" },
  "errors-in-console": { where: "besucher", text: "The page throws errors while running" },
  "no-vulnerable-libraries": { where: "besucher", text: "Outdated code with known security holes" },
  "deprecations": { where: "besucher", text: "Uses features browsers are switching off" },
  "third-party-cookies": { where: "besucher", text: "Sets tracking cookies browsers are starting to block" },
  "image-aspect-ratio": { where: "besucher", text: "Pictures shown squashed or stretched" },
  "image-size-responsive": { where: "besucher", text: "Pictures shown blurry on sharp screens" },
};

type Finding = { text: string; gewicht: number };

function findingsFor(speed: CroSpeed | null | undefined, where: Reader): Finding[] {
  const alle = Object.values(speed?.findings ?? {}).flat();
  const gesehen = new Set<string>();
  const rows: Finding[] = [];
  for (const b of alle) {
    const template = FINDING_TEXTS[b.id];
    if (!template || template.where !== where) continue;
    const s = Math.round((b.einsparung_ms || 0) / 100) / 10;
    let text = template.text.replace("{n}", String(b.betroffen || ""));
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

const LESER: Record<Reader, LeserSpec> = {
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
};

/* Four numbers from 0 to 100 with no scale say nothing.
 * Each now carries what it measures, and a word for how it stands -- Google's
 * own thresholds: good from 90, middling from 50, weak below that. */
/* ONE LINE PER TILE. Title plus explanation were two
 * lines that together said less than one good one. */
const LIGHTHOUSE_KENNWORT: Record<string, string> = {
  seo: "SEO", accessibility: "Accessibility", performance: "Performance", "best-practices": "Best Practices",
};

const LIGHTHOUSE_NAMEN: Record<string, string> = {
  seo: "How clearly Google can read your site",
  accessibility: "How easily people can use it",
  performance: "How quickly it loads",
  "best-practices": "How solidly it is built",
};


const ZEILEN_NAMEN: Record<string, string> = {
  cta_above_fold: "Clear contact button before scrolling",
  cta_repeated: "Contact button repeated on long pages",
  click_to_call: "Phone number starts a call on mobile",
  lead_form: "A contact form",
  form_short: "A form short enough to finish",
  form_button_says_outcome: "A button that names what happens next",
  online_booking: "Online booking",
  response_time: "A promise of how fast you reply",
  testimonials: "Written customer reviews on the site",
  social_proof_numbers: "Real numbers: years, jobs or customers",
  review_badges: "Your Google or Trustpilot rating on the site",
  video_top: "Short introduction video near the top",
  video_testimonials: "A customer video review",
  logo_wall: "Customer or partner logos",
  faq: "Answers to common customer questions",
  lead_magnet: "Something free worth leaving an email for",
  email_capture: "A way to collect an email address",
  opening_hours: "Opening hours on the page",
  emergency_cover: "Out-of-hours cover named",
  second_channel: "A second way to reach you",
  analytics_live: "Visitors are counted",
  search_console: "Search Console connected",
  blog_alive: "A blog with something recent on it",
  onpage_title: "A page title that names the job and the town",
  onpage_h1: "A first headline that says who this is for",
  onpage_meta_description: "Your own preview text under the Google result",
  onpage_alt_text: "Pictures that describe themselves",
  onpage_lang: "The page says which language it is in",
  onpage_canonical: "One official address per page",
  onpage_schema_reviews: "Your rating marked up for the results page",
  onpage_unique_titles: "Every page with its own title",
  onpage_thin_pages: "Every page with something on it",
  onpage_depth: "Enough text on the home page to match a search",
  onpage_map_embed: "A map on the page",
  onpage_viewport: "Built for a phone screen",
  crawl_robots: "Google is allowed in",
  crawl_sitemap: "A sitemap that tells Google every page",
  crawl_ai_bots: "AI crawlers are allowed in",
  aeo_entity_facts: "Name, address and phone machine-readable",
  aeo_faq_schema: "Answers marked up for quoting",
  aeo_question_headings: "Headings written as questions",
};


/* Google's own findings as a short phrase, so that they can stand next to
 * ours. What is absent here does not arrive as a tile, it does not arrive. */
/* Three words per finding, in his language. "3 things
 * are holding this back" says nothing; "a slow server, unused code, unused
 * design" says enough without being a how-to. */
const BEFUND_WORT: Record<string, string> = {
  "server-response-time": "a slow server",
  "unused-javascript": "unused code",
  "unused-css-rules": "unused styling",
  "render-blocking-resources": "design files loading first",
  "modern-image-formats": "pictures in an old format",
  "uses-optimized-images": "oversized pictures",
  "uses-responsive-images": "desktop pictures on phones",
  "offscreen-images": "pictures loading too early",
  "uses-text-compression": "uncompressed text",
  "redirects": "a redirect before the page",
  "font-display": "text waiting for the font",
  "prioritize-lcp-image": "the main picture loading late",
  "total-byte-weight": "a heavy page",
  "uses-long-cache-ttl": "nothing kept for return visits",
  "third-party-summary": "outside scripts",
  "mainthread-work-breakdown": "too much for the phone to do",
  "bootup-time": "scripts keeping the phone busy",
  "dom-size": "too many parts on the page",
  "largest-contentful-paint-element": "the main content arriving last",
  "layout-shift-elements": "things jumping while it loads",
  "crawlable-anchors": "a link Google cannot follow",
  "link-name": "a link with no name",
  "link-text": "links that say \"click here\"",
  "heading-order": "headings out of order",
  "image-alt": "pictures without a description",
  "document-title": "a page with no title",
  "meta-description": "no preview text",
  "html-has-lang": "no language set",
  "is-crawlable": "a page hidden from Google",
  "robots-txt": "a broken robots file",
  "canonical": "a wrong official address",
  "hreflang": "wrong language links",
  "font-size": "text too small on phones",
  "color-contrast": "text with too little contrast",
  "target-size": "buttons too close together",
  "tap-targets": "buttons too close together",
  "label": "form fields without labels",
  "button-name": "buttons without names",
  "third-party-cookies": "cookies browsers now block",
  "errors-in-console": "errors while it runs",
  "inspector-issues": "problems the browser reports",
  "no-vulnerable-libraries": "code with known security holes",
  "deprecations": "features browsers are dropping",
  "is-on-https": "parts loading unsecured",
  "image-aspect-ratio": "squashed pictures",
  "image-size-responsive": "blurry pictures",
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
  gepr: string;
  ja: string;
  nein: string;
  tun: [string, string];
}> = {
  aeo_no_js: {
    gepr: "Does ChatGPT see your text or an empty page?",
    ja: "Almost all of your words are in the page before a browser builds it.",
    nein: "The text only appears once a browser builds the page, and AI crawlers do not run one.",
    tun: ["Have your web person render the text on the server, not in the browser", "2 h"],
  },
  aeo_llms_txt: {
    gepr: "Do you tell the AI engines what you do?",
    ja: "A summary file for the AI engines is published.",
    nein: "Nothing sums you up for them, so each one works it out from your pages alone. Ten minutes to write, and the engines have started asking for it.",
    tun: ["Put a file called llms.txt at yoursite.com/llms.txt: what you do, where, and your main pages", "10 min"],
  },
  crawl_ai_bots: {
    gepr: "Is ChatGPT allowed to read you at all?",
    ja: "Your robots file blocks none of them.",
    nein: "Your robots file locks them out, so no AI answer can name you.",
    tun: ["Delete the Disallow lines for GPTBot, ClaudeBot and PerplexityBot from robots.txt", "10 min"],
  },
  aeo_entity_facts: {
    gepr: "Does ChatGPT know where you are and how to call you?",
    ja: "Name, address and phone are labelled in the page code.",
    nein: "They are only text on the page, so an AI has to guess them.",
    tun: ["Have your web person add LocalBusiness details with your exact name, address and phone", "30 min"],
  },
  aeo_faq_schema: {
    gepr: "Can ChatGPT recommend your answer word for word?",
    ja: "Your questions and answers are labelled as such.",
    nein: "Your answers carry no label saying they are answers, so an AI quotes a competitor instead.",
    tun: ["Have your web person mark the FAQ block as questions and answers, 40 to 60 words each", "30 min"],
  },
  aeo_question_headings: {
    gepr: "Does ChatGPT find your answer to the customer's question?",
    ja: "Three or more of your headings are real questions.",
    nein: "Not one heading is a question, so an AI finds nothing to match.",
    tun: ["Rewrite three headings as questions customers ask, with the answer right underneath", "20 min"],
  },
};

/* A VERDICT INSTEAD OF A LABEL. "First heading ✕"
 * is the name of the check, not its result -- the reader has to guess what is
 * wrong with it. Every red line now carries a whole sentence with "your", and
 * below it the measurement that proves it. If a key is missing here, the line
 * falls back on its name and its `consequence`. */
const ROT_URTEIL: Record<string, string> = {
  onpage_title: "Your page title does not say what you do or where",
  onpage_h1: "Your first headline does not name both your job and your town",
  onpage_meta_description: "Google writes your preview text itself",
  onpage_alt_text: "Google cannot read most of your pictures",
  onpage_lang: "Your page does not say which language it is in",
  onpage_canonical: "The same page competes with itself under two links",
  onpage_schema_reviews: "Your stars do not show in the Google result",
  onpage_unique_titles: "Several of your pages share one title",
  onpage_thin_pages: "Some of your pages are near-empty",
  onpage_depth: "Your home page carries too little text to match a search",
  onpage_map_embed: "There is no map showing the area you cover",
  onpage_viewport: "Your site is not built for a phone screen",
  opening_hours: "Your opening hours are not on the site",
  emergency_cover: "Nothing says whether you come out at night",
  second_channel: "The phone is the only way to reach you",
  crawl_ai_bots: "Your robots file locks the AI engines out",
  aeo_no_js: "ChatGPT sees an empty page where your text should be",
  aeo_llms_txt: "Nothing sums your business up for the AI engines",
  aeo_entity_facts: "An AI has to guess who you are and where",
  aeo_faq_schema: "An AI quotes a competitor instead of you",
  aeo_question_headings: "No heading matches what a customer types",
  crawl_robots: "Your robots file blocks Google",
  crawl_sitemap: "Google has no list of your pages",
  blog_alive: "Your blog has been standing still",
};

/* WHAT TO DO. Verdict, proof, action -- without the third level every red
 * line is a data point instead of a job. The effort stands with it, because
 * "half an hour" is the difference between something he does today and
 * something he puts off indefinitely. */
const TUN: Record<string, [string, string]> = {
  onpage_title: ["Rewrite the title as what you do plus the town, under 60 characters", "10 minutes"],
  onpage_h1: ["Make the first line name the job and the town, keep your own voice underneath", "15 minutes"],
  onpage_meta_description: ["Write one sentence per page for the Google preview", "20 minutes"],
  onpage_alt_text: ["Describe each picture in a few words where it is uploaded", "30 minutes"],
  onpage_lang: ["Set the site language in your website settings", "5 minutes"],
  onpage_canonical: ["Point each page at its one official address", "20 minutes"],
  onpage_schema_reviews: ["Have your web person add the hidden rating labels, then Google can show your stars", "30 minutes"],
  onpage_unique_titles: ["Give every page its own title, and delete pages you never meant to publish", "20 minutes"],
  onpage_thin_pages: ["Fill the empty pages with a real answer, or point them at a page that has one", "1 hour"],
  onpage_depth: ["Answer the three questions people ask before they call, on the home page", "1 hour"],
  onpage_map_embed: ["Show the area you cover on the page", "15 minutes"],
  onpage_viewport: ["Switch on the mobile view in your website settings", "10 minutes"],
  crawl_robots: ["Remove the block from your robots file", "10 minutes"],
  crawl_sitemap: ["Publish a sitemap and submit it in Search Console", "20 minutes"],
  blog_alive: ["Publish one piece that answers a question a customer actually asked", "2 hours"],
  crawl_ai_bots: ["Remove the AI crawlers from the block list in your robots file", "10 minutes"],
  aeo_entity_facts: ["Have your web person add the hidden labels for name, address and phone", "30 minutes"],
  aeo_faq_schema: ["Have your web person label each question and answer in the page code", "30 minutes"],
  aeo_question_headings: ["Turn three headings into the questions customers actually ask", "20 minutes"],
  online_booking: ["Put a booking link on the page, for people who would rather not phone", "1 hour"],
  opening_hours: ["Put your opening hours on the page, next to the phone number", "10 minutes"],
  emergency_cover: ["Say plainly whether you come out at night and at weekends", "10 minutes"],
  second_channel: ["Add WhatsApp or a chat, for people who cannot talk right now", "30 minutes"],
  response_time: ["Promise a reply time you can keep, next to every contact option", "15 minutes"],
  form_short: ["Cut the form to name, phone and what they need", "20 minutes"],
  form_button_says_outcome: ["Change the button to what happens next, e.g. \"Get my quote\"", "5 minutes"],
  cta_above_fold: ["Put a call button in the first screen", "15 minutes"],
  cta_repeated: ["Repeat the call button further down the page", "15 minutes"],
  click_to_call: ["Make the phone number tappable", "10 minutes"],
  lead_form: ["Add a short form for people who will not phone", "1 hour"],
  testimonials: ["Put three customer quotes on the page, with names", "30 minutes"],
  social_proof_numbers: ["Show your years, jobs or customers as a number", "20 minutes"],
  review_badges: ["Show your Google rating on the page", "20 minutes"],
  video_top: ["Record a 30-second introduction on your phone", "1 hour"],
  video_testimonials: ["Ask one happy customer for 30 seconds on camera", "1 hour"],
  logo_wall: ["Show the names or memberships people recognise", "30 minutes"],
  faq: ["Answer the five questions you get on every call", "1 hour"],
  lead_magnet: ["Offer one useful thing for free in exchange for an email", "2 hours"],
  email_capture: ["Add a way to collect an email from people who are not ready", "30 minutes"],
  analytics_live: ["Install Google Analytics so you can see who comes", "30 minutes"],
  search_console: ["Verify the site in Search Console, it is free", "10 minutes"],
  aeo_llms_txt: ["Put a file called llms.txt at yoursite.com/llms.txt: what you do, where, and your main pages", "10 minutes"],
  aeo_no_js: ["Render the text on the server, not in the browser", "2 hours"],
};

/* For every Lighthouse finding, what to do. Without this line the number is
 * a grade, with it a job. */
/* ONE LINE PER TO-DO, IN HIS WORDS. Before, finding and
 * action stood one under the other and said the same thing twice -- "A link
 * Google can't follow" plus "Make the link a normal href". Now one
 * instruction, with no href, no 48 px, no H1. And what is missing here is NOT
 * shown: Google's raw title ("Reduce unused JavaScript") in a client document
 * is exactly what this table exists to prevent. */
const LH_TUN: Record<string, [string, string]> = {
  "crawlable-anchors": ["A link leads Google nowhere: the destination is only in the script, so the page behind it is invisible to search", "10 minutes"],
  "link-name": ["One link is just an icon, so nobody can tell what it opens", "10 minutes"],
  "link-text": ["Some links say \"click here\" instead of where they lead", "15 minutes"],
  "heading-order": ["The headings jump around, so the page has no clear outline", "20 minutes"],
  "image-alt": ["Pictures have no description, so Google cannot read them", "30 minutes"],
  "color-contrast": ["Some text has too little contrast to read easily in sunlight", "20 minutes"],
  "target-size": ["Buttons sit too close together to tap reliably", "20 minutes"],
  "tap-targets": ["Buttons sit too close together to tap reliably", "20 minutes"],
  "label": ["Form fields lose their label as soon as you type", "15 minutes"],
  "button-name": ["Some buttons have no name a phone can read out", "15 minutes"],
  "third-party-cookies": ["The site sets tracking cookies browsers are switching off", "30 minutes"],
  "errors-in-console": ["The page throws errors while it runs", "1 hour"],
  "no-vulnerable-libraries": ["The site runs old code with known security holes", "1 hour"],
  "deprecations": ["The site uses features browsers are dropping", "1 hour"],
  "is-on-https": ["Parts of the page load unsecured", "30 minutes"],
  "inspector-issues": ["The browser reports problems with the page", "1 hour"],
  "server-response-time": ["Your host is slow to answer before the page even starts", "1 hour"],
  "unused-javascript": ["The page downloads program code it never uses", "1 hour"],
  "unused-css-rules": ["The page downloads design code it never uses", "1 hour"],
  "render-blocking-resources": ["Design files load first, so the text waits behind them", "1 hour"],
  "modern-image-formats": ["Pictures are saved in an old, heavy format", "30 minutes"],
  "uses-optimized-images": ["Pictures are bigger than they need to be", "30 minutes"],
  "uses-responsive-images": ["Phones get the full desktop-size pictures", "30 minutes"],
  "offscreen-images": ["Pictures load before anyone scrolls down to them", "30 minutes"],
  "uses-text-compression": ["Text is sent uncompressed, so it takes longer than it needs", "20 minutes"],
  "redirects": ["The address forwards once before the page even starts", "20 minutes"],
  "font-display": ["Text stays invisible until the font has finished loading", "15 minutes"],
  "prioritize-lcp-image": ["The main picture is not loaded first", "20 minutes"],
  "total-byte-weight": ["The page is heavy to download on a phone", "1 hour"],
  "uses-long-cache-ttl": ["Returning visitors download everything all over again", "30 minutes"],
  "third-party-summary": ["Scripts from other companies slow the page down", "1 hour"],
  "mainthread-work-breakdown": ["The phone works hard for seconds before it reacts", "1 hour"],
  "bootup-time": ["Scripts keep the phone busy before anything can be tapped", "1 hour"],
  "dom-size": ["The page is built from far too many parts", "1 hour"],
  "largest-contentful-paint-element": ["The main content is the last thing to appear", "1 hour"],
  "layout-shift-elements": ["Things jump around while the page is still loading", "1 hour"],
  "font-size": ["Text is too small to read on a phone", "20 minutes"],
  "meta-description": ["Google writes your search preview itself", "20 minutes"],
  "document-title": ["A page has no title for the search results", "10 minutes"],
  "html-has-lang": ["The page does not say which language it is in", "5 minutes"],
  "is-crawlable": ["The page tells Google not to list it", "10 minutes"],
  "robots-txt": ["The file that guides Google has errors in it", "20 minutes"],
  "canonical": ["The page names the wrong address as its official one", "20 minutes"],
  "hreflang": ["The language links are set wrong", "20 minutes"],
  "image-aspect-ratio": ["Pictures show up squashed or stretched", "20 minutes"],
  "image-size-responsive": ["Pictures look blurry on sharp screens", "20 minutes"],
};

/* THE READER IS THE WEBSITE PERSON. "Have your web
 * person..." pushes the job away; whoever opens this disclosure does it
 * themselves. So the instruction in the imperative, technically precise enough
 * to carry out. If an entry is missing here, the finding stands alone. */
const LH_FIX: Record<string, string> = {
  "crawlable-anchors": "give it a real href instead of a click handler",
  "link-name": "add link text or an aria-label",
  "link-text": "name the destination in the link text",
  "heading-order": "one H1, then H2s under it, no skipped levels",
  "image-alt": "write alt text on every content image",
  "color-contrast": "darken the text to at least 4.5:1",
  "target-size": "make tap targets 48 px with space between",
  "tap-targets": "make tap targets 48 px with space between",
  "label": "bind a label to every input",
  "button-name": "give every button accessible text",
  "third-party-cookies": "drop the third-party cookies or move to first-party",
  "errors-in-console": "clear the console errors",
  "inspector-issues": "work through the issues the browser reports",
  "no-vulnerable-libraries": "update the flagged libraries",
  "deprecations": "replace the deprecated APIs",
  "is-on-https": "serve every asset over https",
  "server-response-time": "cache at the server or move host",
  "unused-javascript": "split the bundles and defer what this page does not need",
  "unused-css-rules": "strip the unused rules from the stylesheet",
  "render-blocking-resources": "inline the critical CSS and defer the rest",
  "modern-image-formats": "serve WebP or AVIF",
  "uses-optimized-images": "compress the images before upload",
  "uses-responsive-images": "add srcset so phones get a phone-sized file",
  "offscreen-images": "lazy-load everything below the fold",
  "uses-text-compression": "switch on gzip or brotli",
  "redirects": "link straight to the final URL",
  "font-display": "set font-display: swap",
  "prioritize-lcp-image": "preload the hero image and drop its lazy attribute",
  "total-byte-weight": "cut the payload: images first, then scripts",
  "uses-long-cache-ttl": "set long cache headers on static files",
  "third-party-summary": "defer or drop the third-party scripts",
  "mainthread-work-breakdown": "break up the long tasks on the main thread",
  "bootup-time": "ship less JavaScript on this route",
  "dom-size": "cut the node count on the page",
  "largest-contentful-paint-element": "preload whatever paints last",
  "layout-shift-elements": "reserve width and height for images and embeds",
  "font-size": "set body text to at least 16 px on mobile",
  "meta-description": "write a description per page",
  "document-title": "add a title tag",
  "html-has-lang": "set lang on the html element",
  "is-crawlable": "remove the noindex",
  "robots-txt": "fix the syntax in robots.txt",
  "canonical": "point the canonical at the live URL",
  "hreflang": "correct the hreflang pairs",
  "image-aspect-ratio": "match the width and height to the file",
  "image-size-responsive": "serve files at twice the display size",
};

const T = {
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
};

/** The cards of a panel, always visible. A disclosure
 *  around the whole group hid four questions behind one line; only each single
 *  card is closed, and its question plus its counter is enough to decide
 *  where to look inside. */
function Pruefungen({ gruppen, elemente, extra, hinterZeile }: {
  gruppen: Gruppe[]; elemente: CroElement[]; extra?: React.ReactNode;
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
          <Karte g={g} elemente={elemente} />
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
          {T.geprueft}
        </span>
        <span className="tnum font-bold" style={{ color: da < von ? ROT : GRUEN }}>{da}<span className="text-graphite">/{von}</span></span>
      </summary>
      <div className="mt-3">{karten}</div>
    </details>
  );
}

const GRUEN = "#1a6b45";
const ROT = "#9c2c2c";

function name(e: CroElement): string {
  return (e.key && ZEILEN_NAMEN[e.key]) || e.label;
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
function gemessenesUrteil(key: string, e: CroElement): string | null {
  const beleg = String(e.evidence ?? "");
  const folge = String(e.consequence ?? "");
  if (key === "onpage_alt_text") {
    const m = beleg.match(/(\d+) of (\d+) pictures/);
    if (!m) return null;
    const undescribed = Number(m[2]) - Number(m[1]);
    return `${undescribed} of your ${m[2]} pictures have no description`;
  }
  if (key === "onpage_title") {
    const was = /what you do/.test(folge);
    const where = /\bwhere\b/.test(folge);
    if (was && !where) return "Your page title does not say what you do";
    if (where && !was) return "Your page title does not say where you work";
    return null;
  }
  if (key === "blog_alive" && /no blog link/.test(beleg)) return "You have no blog";
  if (key === "onpage_unique_titles") {
    const m = beleg.match(/(\d+) of (\d+) pages share a title/);
    if (m) return `${m[1]} of your pages share one title`;
  }
  if (key === "onpage_thin_pages") {
    const m = beleg.match(/(\d+) of (\d+) pages carry under 200 words/);
    if (m) return `${m[1]} of ${m[2]} pages carry fewer than 200 words`;
  }
  return null;
}

function Row({ e }: { e: CroElement }) {
  const missing = e.applies !== false && !e.present;
  const nichtNoetig = e.applies === false;
  const schluessel = (e.key ?? "").replace(/^lh:/, "");
  const urteil = missing ? (gemessenesUrteil(schluessel, e) ?? ROT_URTEIL[schluessel] ?? name(e)) : name(e);
  const tun = missing ? TUN[schluessel] : undefined;
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
          {urteil}{nichtNoetig ? ` · ${T.notNeeded}` : ""}
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
function Karte({ g, elemente }: { g: Gruppe; elemente: CroElement[] }) {
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
        {rows.map((e) => <Row key={e.key ?? e.label} e={e} />)}
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


export function WebsiteDetail({ data }: { data: ProposalData }) {
  const t = T;
  const leser = LESER;
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
      <TafelGoogle spec={leser.google} elemente={elemente} speed={speed} />
      <TafelKi spec={leser.ki} elemente={elemente} />
      <TafelBesucher spec={leser.besucher} elemente={elemente} />

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
function TafelGoogle({ spec, elemente, speed }: { spec: LeserSpec; elemente: CroElement[]; speed: CroSpeed | null | undefined }) {
  const t = T;
  const werte = (["seo", "accessibility", "performance", "best-practices"] as const)
    .map((k) => ({ k, v: k === "performance" ? (speed?.scores?.performance ?? speed?.score) : speed?.scores?.[k] }))
    .filter((z) => z.v != null);
  const chancen = findingsFor(speed, "besucher").filter((b) => /\d s( |$)/.test(b.text));
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
              const title = LIGHTHOUSE_NAMEN[z.k];
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
                    const minuten = todos.reduce((s, b) => s + (parseInt(LH_TUN[b.id][1], 10) || 0) * (LH_TUN[b.id][1].includes("h") ? 60 : 1), 0);
                    const sek = todos.reduce((s, b) => s + (b.einsparung_ms || 0), 0) / 1000;
                    // "0.3 s faster" next to a 24.9 s load time reads as mockery
                    // (24.09.2026): name the gain only when it reaches a tenth
                    // of the measured load time.
                    const ladezeit = parseFloat(String(speed?.lcp ?? "").replace(",", "."));
                    const zeigeGewinn = sek >= 0.2 && (!Number.isFinite(ladezeit) || sek >= ladezeit * 0.1);
                    const namen = todos.map((b) => BEFUND_WORT[b.id]).filter(Boolean);
                    const liste = namen.length > 1
                      ? `${namen.slice(0, -1).join(", ")} and ${namen.at(-1)}`
                      : (namen[0] ?? "");
                    const stunden = Math.round(minuten / 60 * 2) / 2;
                    // A tiny fix next to a very long load time reads as "an hour of
                    // work against 25 seconds" (24.09.2026): then no line at all.
                    if (!zeigeGewinn && Number.isFinite(ladezeit) && ladezeit > 4) return null;
                    const aufwand = minuten >= 60
                      ? `${stunden} ${stunden === 1 ? "hour" : "hours"}`
                      : `${minuten} minutes`;
                    return (
                      <div className="border-t border-hairline px-4 py-3.5">
                        <p className="m-0 text-[13px] leading-[1.5] text-ink">
                          <b className="font-semibold">{liste.charAt(0).toUpperCase() + liste.slice(1)}.</b>{" "}
                          <span className="text-graphite">
                            <>About {aufwand} of work{zeigeGewinn ? <>, roughly {sek.toFixed(1)} s faster</> : null}.</>
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
      <Pruefungen gruppen={spec.gruppen} elemente={elemente} hinterZeile />
    </section>
  );
}


/** AI: four large tiles, nothing else. */
function TafelKi({ spec, elemente }: { spec: LeserSpec; elemente: CroElement[] }) {
  /* TWO CARDS INSTEAD OF SIX ROWS. Six questions one
     under the other, each with ChatGPT in its name, read as a list of the same
     sentence. Two cards ask what matters: can it read you, and can it
     recommend you. */
  return (
    <section className="rounded-2xl border border-hairline bg-white p-5 sm:p-6">
      <TafelKopf where="ki" spec={spec} />
      <Pruefungen gruppen={spec.gruppen} elemente={elemente} />
    </section>
  );
}


/** Visitor: the four cards with question, points, sentence and the checklist. */
function TafelBesucher({ spec, elemente }: { spec: LeserSpec; elemente: CroElement[] }) {
  const alle = zeilenFuer(elemente, spec.gruppen.flatMap((g) => g.keys));
  const { da, von } = stand(alle);
  return (
    <section className="rounded-2xl border border-hairline bg-white p-5 sm:p-6">
      <TafelKopf where="besucher" spec={spec} da={da} von={von} />
      {/* The cards stand visible, but each one is closed:
          five open cards with six rows each are thirty rows in one go. The
          question and the counter are enough to decide by. */}
      <Pruefungen gruppen={spec.gruppen} elemente={elemente} />
    </section>
  );
}
