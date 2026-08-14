// ============================================================
// Seasonal campaign switch for the landing pages.
//
// ONE place decides whether a festive skin is active. Every campaign visual is
// additive and wrapped in this flag, so turning it off restores the original
// design exactly — nothing else needs editing.
//
// TO TURN THE INDEPENDENCE DAY THEME OFF:
//   set NEXT_PUBLIC_CAMPAIGN=none in .env (then restart / rebuild)
//   — or change the fallback below from "independence" to "none".
// ============================================================

export type Campaign = "independence" | "none";

// NEXT_PUBLIC_* values are inlined at build time, so a change here needs a
// rebuild (dev server restart) to take effect.
export const ACTIVE_CAMPAIGN: Campaign =
  (process.env.NEXT_PUBLIC_CAMPAIGN as Campaign | undefined) || "independence";

export const isIndependenceCampaign = ACTIVE_CAMPAIGN === "independence";

/**
 * Centre-column hero illustration (the India Gate / flag / doves artwork).
 *
 * Save the artwork to `public/independence-hero.png` (PNG keeps the
 * transparent background; a .webp export works too — just update the path).
 *
 * If the file is missing the hero column falls back to a built-in SVG scene,
 * so a wrong path degrades gracefully instead of showing a broken image.
 */
export const INDEPENDENCE_HERO_SRC = "/independence-hero.png";

// Tricolour tokens — kept here so every campaign component uses the same values.
export const TRICOLOUR = {
  saffron: "#FF9933",
  white: "#FFFFFF",
  green: "#138808",
  chakra: "#0A3D91",
} as const;
