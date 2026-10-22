import type { CSSProperties } from "react";
import { getOccasion, isOccasionId, type OccasionId } from "./gifts";
import { getTheme, isThemeId, THEMES } from "./themes";

/*
 * Everything the sender can customise lives in a Design. The API only stores a
 * single `theme` string per gift, so a Design is serialised into it as
 * `<themeId>?<short query params>`. Gifts created before customisation existed
 * store a bare theme id, which parses to the defaults below.
 */

export type LayoutId = "classic" | "letter" | "postcard" | "minimal" | "keepsake";
export type FontId = "elegant" | "script" | "classic" | "hand" | "modern";
export type EffectId = "hearts" | "petals" | "sparkles" | "confetti" | "stars" | "bubbles" | "none";
export type RevealId = "seal" | "envelope" | "giftbox" | "rose" | "none";
export type RoseId = "red" | "pink" | "white" | "peach" | "midnight" | "velvet";
export type SealId = "heart" | "initial" | "icon" | "star";
export type Align = "start" | "center";

export interface Design {
  occasion: OccasionId;
  theme: string;
  layout: LayoutId;
  font: FontId;
  effect: EffectId;
  reveal: RevealId;
  seal: SealId;
  /** Petal colour for the 3D rose reveal. */
  rose: RoseId;
  align: Align;
  /** Celebration burst when the gift is opened. */
  burst: boolean;
  /** Custom accent colour (#rrggbb); overrides the theme's accent and seal. */
  accent: string;
  /** Custom headline; empty uses the occasion's default. */
  heading: string;
  /** Custom sign-off; empty uses the occasion's default. */
  signoff: string;
  /** A date or short note shown on the card. */
  date: string;
  postscript: string;
}

export const TEXT_LIMITS = { heading: 60, signoff: 32, date: 40, postscript: 140 } as const;

export const LAYOUTS: { id: LayoutId; name: string; description: string; align: Align }[] = [
  { id: "classic", name: "Classic card", description: "Framed and timeless", align: "start" },
  { id: "letter", name: "Letter", description: "Ruled notepaper", align: "start" },
  { id: "postcard", name: "Postcard", description: "Stamped and posted", align: "start" },
  { id: "minimal", name: "Minimal", description: "Quiet and modern", align: "center" },
  { id: "keepsake", name: "Keepsake", description: "Ornate double frame", align: "center" },
];

export interface FontOption {
  id: FontId;
  name: string;
  heading: string;
  body: string;
  italic: boolean;
  weight: number;
  /** Multipliers that even out the optical size of each typeface. */
  headingScale: number;
  bodyScale: number;
}

export const FONTS: FontOption[] = [
  { id: "elegant", name: "Elegant", heading: "var(--font-cormorant)", body: "var(--font-cormorant)", italic: true, weight: 500, headingScale: 1, bodyScale: 1 },
  { id: "script", name: "Romantic", heading: "var(--font-great-vibes)", body: "var(--font-cormorant)", italic: false, weight: 400, headingScale: 1.22, bodyScale: 1 },
  { id: "classic", name: "Classic", heading: "var(--font-playfair)", body: "var(--font-playfair)", italic: true, weight: 500, headingScale: 0.88, bodyScale: 0.84 },
  { id: "hand", name: "Handwritten", heading: "var(--font-caveat)", body: "var(--font-caveat)", italic: false, weight: 600, headingScale: 1.1, bodyScale: 1.18 },
  { id: "modern", name: "Modern", heading: "var(--font-inter)", body: "var(--font-inter)", italic: false, weight: 600, headingScale: 0.8, bodyScale: 0.8 },
];

export const EFFECTS: { id: EffectId; name: string }[] = [
  { id: "hearts", name: "Hearts" },
  { id: "petals", name: "Petals" },
  { id: "sparkles", name: "Sparkles" },
  { id: "confetti", name: "Confetti" },
  { id: "stars", name: "Stars" },
  { id: "bubbles", name: "Bubbles" },
  { id: "none", name: "None" },
];

export const REVEALS: { id: RevealId; name: string; description: string; badge?: string }[] = [
  { id: "rose", name: "Digital Rose", description: "A 3D rose blooms, your words float around it", badge: "Popular" },
  { id: "seal", name: "Wax seal", description: "Tap the seal to open" },
  { id: "envelope", name: "Envelope", description: "The flap lifts, the letter rises" },
  { id: "giftbox", name: "Gift box", description: "Untie the ribbon, lift the lid" },
  { id: "none", name: "Instant", description: "Opens straight to the message" },
];

export interface RoseOption {
  id: RoseId;
  name: string;
  /** Mid-petal colour. */
  petal: string;
  /** Shadowed petal edges and the heart of the bloom. */
  deep: string;
  /** Pale tint where the petal meets the stem. */
  base: string;
  /** Velvet highlight. */
  sheen: string;
  /** Colour of the light around the scene. */
  glow: string;
}

export const ROSES: RoseOption[] = [
  { id: "red", name: "Classic red", petal: "#9c0a22", deep: "#36020a", base: "#d9944f", sheen: "#c8304a", glow: "#ff4d6d" },
  { id: "pink", name: "Blush pink", petal: "#e98aa2", deep: "#9c3553", base: "#fbe6c0", sheen: "#f2b6c6", glow: "#ff9ab5" },
  { id: "white", name: "Pearl white", petal: "#f4eee4", deep: "#b9a690", base: "#f2e3a8", sheen: "#e8e2da", glow: "#fff1d6" },
  { id: "peach", name: "Peach", petal: "#f5a47c", deep: "#b85634", base: "#fbe3a4", sheen: "#f0b896", glow: "#ffb38a" },
  { id: "midnight", name: "Midnight blue", petal: "#2f47b8", deep: "#0c1240", base: "#9fb3ff", sheen: "#6f86e0", glow: "#6f8cff" },
  { id: "velvet", name: "Black velvet", petal: "#3d0a16", deep: "#0d0204", base: "#7a2a33", sheen: "#a8344c", glow: "#c2304f" },
];

export function getRose(id: RoseId): RoseOption {
  return ROSES.find((r) => r.id === id) ?? ROSES[0];
}

export const SEALS: { id: SealId; name: string }[] = [
  { id: "heart", name: "Heart" },
  { id: "initial", name: "Your initial" },
  { id: "icon", name: "Occasion" },
  { id: "star", name: "Star" },
];

export const SIGNOFF_PRESETS = [
  "With all my love,",
  "Forever yours,",
  "Love always,",
  "Yours, always,",
  "Hugs and kisses,",
  "Thinking of you,",
];

export interface Look {
  id: string;
  name: string;
  description: string;
  design: Pick<Design, "theme" | "layout" | "font" | "effect" | "reveal" | "seal" | "align">;
}


export const LOOKS: Look[] = [
  {
    id: "parisian",
    name: "Parisian Romance",
    description: "Script on ruled paper, sealed in an envelope",
    design: { theme: "blush", layout: "letter", font: "script", effect: "petals", reveal: "envelope", seal: "heart", align: "start" },
  },
  {
    id: "golden-birthday",
    name: "Golden Birthday",
    description: "Champagne keepsake inside a gift box",
    design: { theme: "champagne", layout: "keepsake", font: "classic", effect: "confetti", reveal: "giftbox", seal: "initial", align: "center" },
  },
  {
    id: "midnight-promise",
    name: "Midnight Promise",
    description: "Starlit, quiet and deeply romantic",
    design: { theme: "starlight", layout: "minimal", font: "elegant", effect: "stars", reveal: "seal", seal: "star", align: "center" },
  },
  {
    id: "black-tie",
    name: "Black Tie",
    description: "Noir and gold for big milestones",
    design: { theme: "noir", layout: "keepsake", font: "classic", effect: "sparkles", reveal: "seal", seal: "initial", align: "center" },
  },
  {
    id: "garden-party",
    name: "Garden Party",
    description: "A handwritten postcard among the petals",
    design: { theme: "sage", layout: "postcard", font: "hand", effect: "petals", reveal: "envelope", seal: "icon", align: "start" },
  },
  {
    id: "candy-celebration",
    name: "Candy Celebration",
    description: "Bright, bold and full of confetti",
    design: { theme: "candy", layout: "classic", font: "modern", effect: "confetti", reveal: "giftbox", seal: "icon", align: "center" },
  },
  {
    id: "old-hollywood",
    name: "Old Hollywood",
    description: "Bordeaux velvet with a wax seal",
    design: { theme: "bordeaux", layout: "classic", font: "script", effect: "hearts", reveal: "seal", seal: "heart", align: "start" },
  },
  {
    id: "daydream",
    name: "Daydream",
    description: "Soft aurora hues and floating bubbles",
    design: { theme: "aurora", layout: "minimal", font: "hand", effect: "bubbles", reveal: "envelope", seal: "heart", align: "center" },
  },
  {
    id: "sunny-morning",
    name: "Sunny Morning",
    description: "Warm and cheerful, like a good morning text",
    design: { theme: "sunshine", layout: "postcard", font: "hand", effect: "sparkles", reveal: "none", seal: "star", align: "start" },
  },
];

export function getLook(id: string | null | undefined): Look | undefined {
  return LOOKS.find((l) => l.id === id);
}

export function defaultDesign(occasionId: OccasionId = "birthday"): Design {
  return {
    occasion: occasionId,
    theme: THEMES[0].id,
    layout: "classic",
    font: "elegant",
    effect: "hearts",
    reveal: "seal",
    seal: "heart",
    rose: "red",
    align: "start",
    burst: true,
    accent: "",
    heading: "",
    signoff: "",
    date: "",
    postscript: "",
  };
}

/** A fresh design for an occasion, styled with its signature look. */
export function designForOccasion(occasionId: OccasionId): Design {
  const look = getLook(getOccasion(occasionId).look);
  return { ...defaultDesign(occasionId), ...look?.design };
}

/** Gifts created before the API accepted every occasion stored it here (`o`). */
const LEGACY_OCCASION_KEY = "o";

const KEYS = {
  layout: "l",
  font: "f",
  effect: "e",
  reveal: "r",
  seal: "s",
  rose: "rc",
  align: "a",
  accent: "c",
  heading: "h",
  signoff: "so",
  date: "d",
  postscript: "ps",
} as const;

const HEX = /^#[0-9a-f]{6}$/i;

function pick<T extends string>(value: string | null, options: readonly { id: T }[], fallback: T): T {
  return options.find((o) => o.id === value)?.id ?? fallback;
}

export function serializeDesign(design: Design): string {
  const params = new URLSearchParams();
  const defaults = defaultDesign();
  for (const [field, key] of Object.entries(KEYS) as [keyof typeof KEYS, string][]) {
    const value = design[field].trim();
    if (value && value !== defaults[field]) params.set(key, value);
  }
  if (!design.burst) params.set("b", "0");
  const query = params.toString();
  return query ? `${design.theme}?${query}` : design.theme;
}

export function parseDesign(raw: string | null | undefined, giftType: string): Design {
  const value = raw ?? "";
  const split = value.indexOf("?");
  const themeId = split === -1 ? value : value.slice(0, split);
  const p = new URLSearchParams(split === -1 ? "" : value.slice(split + 1));
  const base = defaultDesign();
  const text = (key: string, limit: number) => (p.get(key) ?? "").trim().slice(0, limit);
  const legacyOccasion = p.get(LEGACY_OCCASION_KEY);
  const accent = p.get(KEYS.accent) ?? "";

  return {
    occasion: isOccasionId(legacyOccasion) ? legacyOccasion : getOccasion(giftType).id,
    theme: isThemeId(themeId) ? themeId : base.theme,
    layout: pick(p.get(KEYS.layout), LAYOUTS, base.layout),
    font: pick(p.get(KEYS.font), FONTS, base.font),
    effect: pick(p.get(KEYS.effect), EFFECTS, base.effect),
    reveal: pick(p.get(KEYS.reveal), REVEALS, base.reveal),
    seal: pick(p.get(KEYS.seal), SEALS, base.seal),
    rose: pick(p.get(KEYS.rose), ROSES, base.rose),
    align: p.get(KEYS.align) === "center" ? "center" : "start",
    burst: p.get("b") !== "0",
    accent: HEX.test(accent) ? accent : "",
    heading: text(KEYS.heading, TEXT_LIMITS.heading),
    signoff: text(KEYS.signoff, TEXT_LIMITS.signoff),
    date: text(KEYS.date, TEXT_LIMITS.date),
    postscript: text(KEYS.postscript, TEXT_LIMITS.postscript),
  };
}

/** "Surprise me": a random rose colour, seal and typeface. */
export function randomDesign(current: Design): Design {
  const any = <T,>(items: readonly T[]) => items[Math.floor(Math.random() * items.length)];
  return {
    ...current,
    rose: any(ROSES).id,
    font: any(FONTS).id,
    seal: any(SEALS).id,
    accent: "",
  };
}

export function getFont(id: FontId): FontOption {
  return FONTS.find((f) => f.id === id) ?? FONTS[0];
}

/** Picks readable text for a custom accent colour. */
function contrastInk(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [n >> 16, (n >> 8) & 255, n & 255];
  return 0.299 * r + 0.587 * g + 0.114 * b > 160 ? "#1E1B18" : "#FFFFFF";
}

/** The resolved palette for a design, honouring a custom accent. */
export function designColors(design: Design) {
  const theme = getTheme(design.theme);
  const accent = design.accent || theme.accent;
  return {
    theme,
    accent,
    seal: design.accent || theme.seal,
    sealInk: design.accent ? contrastInk(design.accent) : theme.sealInk,
    line: design.accent ? `color-mix(in srgb, ${design.accent} 26%, transparent)` : theme.line,
  };
}

/** Exposes a design as CSS variables so Tailwind classes like `text-(--g-accent)` can use it. */
export function designStyle(design: Design): CSSProperties {
  const { theme, accent, seal, sealInk, line } = designColors(design);
  const font = getFont(design.font);
  return {
    background: theme.background,
    color: theme.ink,
    "--g-ink": theme.ink,
    "--g-muted": theme.muted,
    "--g-accent": accent,
    "--g-line": line,
    "--g-seal": seal,
    "--g-seal-ink": sealInk,
    "--g-font-heading": font.heading,
    "--g-font-body": font.body,
    "--g-heading-style": font.italic ? "italic" : "normal",
    "--g-heading-weight": font.weight,
  } as CSSProperties;
}

/** Background for the full page a gift is opened on. */
export function pageBackdrop(design: Design): string {
  const { page } = getTheme(design.theme);
  return `radial-gradient(70% 60% at 50% 0%, ${page.glow}, transparent 70%), radial-gradient(50% 50% at 50% 100%, ${page.glow}, transparent 70%), ${page.base}`;
}
