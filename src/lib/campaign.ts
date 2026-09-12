// ============================================================
// Seasonal campaign switch for the landing pages.
//
// ONE place decides whether a festive skin is active. Every campaign visual is
// additive and wrapped in this flag, so turning it off restores the original
// design exactly — nothing else needs editing.
//
// TO SWITCH CAMPAIGNS:
//   set NEXT_PUBLIC_CAMPAIGN=ganpati|independence|none in .env (then restart / rebuild)
//   — or change the fallback below.
// ============================================================

export type Campaign = "independence" | "ganpati" | "none";

// NEXT_PUBLIC_* values are inlined at build time, so a change here needs a
// rebuild (dev server restart) to take effect.
export const ACTIVE_CAMPAIGN: Campaign =
  (process.env.NEXT_PUBLIC_CAMPAIGN as Campaign | undefined) || "ganpati";

export const isIndependenceCampaign = ACTIVE_CAMPAIGN === "independence";
export const isGanpatiCampaign = ACTIVE_CAMPAIGN === "ganpati";

/**
 * Centre-column hero illustration (the India Gate / flag / doves artwork).
 */
export const INDEPENDENCE_HERO_SRC = "/independence-hero.png";

/**
 * Ganpati hero illustration.
 */
export const GANPATI_HERO_SRC = "/flowers/ganeshji1.png";

// Tricolour tokens — kept here so every campaign component uses the same values.
export const TRICOLOUR = {
  saffron: "#FF9933",
  white: "#FFFFFF",
  green: "#138808",
  chakra: "#0A3D91",
} as const;
