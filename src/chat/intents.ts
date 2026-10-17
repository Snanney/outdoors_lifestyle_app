import type { Difficulty, Spot } from "../lib/types";

export interface ChatContext {
  spots: Spot[];
}

export interface BotReply {
  text: string;
  /** Optional spot ids the UI can render as quick "jump to" chips. */
  spotIds?: string[];
}

export interface Intent {
  name: string;
  test: (msg: string) => boolean;
  respond: (msg: string, ctx: ChatContext) => BotReply;
}

/* ----------------------------- helpers ----------------------------- */

function formatSpot(s: Spot): string {
  const bits: string[] = [s.region];
  if (s.length_mi != null) bits.push(`${s.length_mi} mi`);
  if (s.difficulty) bits.push(s.difficulty);
  return `\u2022 ${s.name} (${bits.join(", ")})`;
}

function listReply(intro: string, spots: Spot[]): BotReply {
  if (spots.length === 0) {
    return { text: `${intro}\n\nHmm, I don't have any matches in my data yet.` };
  }
  return {
    text: `${intro}\n\n${spots.map(formatSpot).join("\n")}`,
    spotIds: spots.map((s) => s.id),
  };
}

const PARK_KEYWORDS: { key: string; match: RegExp }[] = [
  { key: "Zion", match: /\bzion\b/ },
  { key: "Bryce", match: /\bbryce\b/ },
  { key: "Arches", match: /\barch(es)?\b/ },
  { key: "Canyonlands", match: /\bcanyonlands\b/ },
  { key: "Capitol Reef", match: /\bcapitol\s*reef\b|\bcapitol\b/ },
];

function spotsInRegion(ctx: ChatContext, keyword: string): Spot[] {
  const k = keyword.toLowerCase();
  return ctx.spots.filter(
    (s) => s.type === "trail" && s.region.toLowerCase().includes(k)
  );
}

function byDifficulty(ctx: ChatContext, d: Difficulty): Spot[] {
  return ctx.spots.filter((s) => s.difficulty === d);
}

/* ------------------------------ intents ----------------------------- */

export const intents: Intent[] = [
  {
    name: "help",
    test: (m) =>
      /(how.*(use|work|start))|what can you do|help|guide me|instructions/.test(
        m
      ),
    respond: () => ({
      text: [
        "Here's how to get around:",
        "\u2022 Tap any dot on the map (or an item in the list) to see details.",
        "\u2022 Use the search box and the Type/Difficulty filters to narrow things down.",
        "\u2022 Tap the star to save a favorite - it's stored on your device.",
        "\u2022 Ask me things like \u201ceasy trails\u201d, \u201cwhat's in Zion?\u201d, or \u201cshow me the parks\u201d.",
      ].join("\n"),
    }),
  },
  {
    name: "difficulty",
    test: (m) =>
      /\beasy\b|\bbeginner\b|\bfamily\b|\bmoderate\b|\bhard\b|\bdifficult\b|\bstrenuous\b|\bchallenging\b/.test(
        m
      ),
    respond: (m, ctx) => {
      let d: Difficulty = "easy";
      if (/\bmoderate\b/.test(m)) d = "moderate";
      else if (/\bhard\b|\bdifficult\b|\bstrenuous\b|\bchallenging\b/.test(m))
        d = "hard";
      else d = "easy";
      return listReply(`Here are the ${d} trails I know about:`, byDifficulty(ctx, d));
    },
  },
  {
    name: "park-name",
    test: (m) => PARK_KEYWORDS.some((p) => p.match.test(m)),
    respond: (m, ctx) => {
      const park = PARK_KEYWORDS.find((p) => p.match.test(m))!;
      const parkSpot = ctx.spots.find(
        (s) => s.type === "park" && s.name.toLowerCase().includes(park.key.toLowerCase())
      );
      const trails = spotsInRegion(ctx, park.key);
      const intro = parkSpot
        ? `${parkSpot.name} \u2014 ${parkSpot.description}\n\nPopular trails there:`
        : `Trails near ${park.key}:`;
      return listReply(intro, trails);
    },
  },
  {
    name: "parks-list",
    test: (m) => /\bparks?\b|national park|mighty\s*5|mighty\s*five/.test(m),
    respond: (_m, ctx) =>
      listReply(
        "Utah's national parks in my data:",
        ctx.spots.filter((s) => s.type === "park")
      ),
  },
  {
    name: "favorites",
    test: (m) => /favorite|favourite|save|bookmark|star/.test(m),
    respond: () => ({
      text: "Tap the \u2606 star on any trail or park to save it. Saved spots show a golden ring on the map, and you can flip on \u201cFavorites only\u201d in the filters. They're kept on your device - no account needed.",
    }),
  },
  {
    name: "offline-install",
    test: (m) =>
      /offline|install|pwa|add to home|download|phone|tablet|app store/.test(m),
    respond: () => ({
      text: "This is an installable web app (PWA). On your phone or tablet, use your browser's \u201cAdd to Home Screen\u201d; on desktop Chrome/Edge, click the install icon in the address bar. Once installed, the map shell and saved tiles work offline.",
    }),
  },
  {
    name: "data-coverage",
    test: (m) =>
      /\bdata\b|coverage|where.*(work|cover)|how many|what.*(have|know)|utah/.test(
        m
      ),
    respond: (_m, ctx) => ({
      text: `Right now I'm focused on Utah with a small hand-picked sample: ${
        ctx.spots.filter((s) => s.type === "park").length
      } parks and ${
        ctx.spots.filter((s) => s.type === "trail").length
      } trails. It's just enough to show the idea working - more can be added later.`,
    }),
  },
  {
    name: "trails-recommend",
    test: (m) => /trail|hike|hiking|walk|recommend|suggest|where.*go|ideas?/.test(m),
    respond: (_m, ctx) =>
      listReply(
        "A few trails to get you started:",
        ctx.spots.filter((s) => s.type === "trail").slice(0, 6)
      ),
  },
  {
    name: "thanks",
    test: (m) => /\bthank|thx|cheers|appreciate/.test(m),
    respond: () => ({ text: "Anytime - happy trails! \u26F0" }),
  },
  {
    name: "greeting",
    test: (m) => /\b(hi|hello|hey|howdy|yo|hiya|greetings)\b/.test(m),
    respond: () => ({
      text: "Hey there! I'm your trail guide for Utah's outdoors. Ask me about the parks, easy/moderate/hard trails, how to use the map, or saving favorites.",
    }),
  },
];

export const FALLBACK_REPLY: BotReply = {
  text: "I'm a little offline guide, so I keep it simple. Try asking about \u201cparks\u201d, \u201ceasy trails\u201d, \u201cwhat's in Zion?\u201d, \u201cfavorites\u201d, or \u201chow do I use the map?\u201d",
};
