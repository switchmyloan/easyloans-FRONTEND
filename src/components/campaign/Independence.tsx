"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  INDEPENDENCE_HERO_SRC,
  isIndependenceCampaign,
  TRICOLOUR,
} from "@/lib/campaign";

// ============================================================
// Independence Day skin for the landing pages.
//
// Every export here returns null when the campaign is off, so callers can drop
// them in unconditionally and the base design comes back untouched.
//
// Deliberately asset-free — the whole scene (India Gate, flag, doves,
// fireworks, chakra) is inline SVG, so there is nothing to upload, optimise or
// clean up when the campaign ends, and it costs no extra network request.
// ============================================================

// Soft elliptical feather used to blend the artwork into the page. Without it
// the artwork's off-white background reads as a pasted rectangle.
const FEATHER_MASK =
  "radial-gradient(ellipse 76% 80% at 50% 52%, #000 46%, rgba(0,0,0,0.82) 68%, rgba(0,0,0,0.32) 86%, transparent 100%)";

// Mobile header uses a wider solid core — the header band is short, so an
// aggressive feather eats the monument before it is even visible.
const MOBILE_FEATHER_MASK =
  "radial-gradient(ellipse 92% 96% at 50% 46%, #000 62%, rgba(0,0,0,0.7) 82%, transparent 100%)";

// How long the mobile splash stays up before it lifts away.
const INTRO_TOTAL_MS = 3200;

/** Ashoka Chakra — 24 spokes, drawn rather than shipped as an image. */
function AshokaChakra({
  className = "",
  color = TRICOLOUR.chakra,
}: {
  className?: string;
  color?: string;
}) {
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden="true">
      <circle cx="50" cy="50" r="46" fill="none" stroke={color} strokeWidth="3" />
      <circle cx="50" cy="50" r="6" fill={color} />
      {Array.from({ length: 24 }).map((_, i) => (
        <line
          key={i}
          x1="50"
          y1="50"
          x2="50"
          y2="6"
          stroke={color}
          strokeWidth="1.6"
          transform={`rotate(${i * 15} 50 50)`}
        />
      ))}
    </svg>
  );
}

/** A single firework: radiating spokes that burst, then fade. */
function Firework({
  x,
  y,
  scale = 1,
  delay = 0,
  color,
}: {
  x: string;
  y: string;
  scale?: number;
  delay?: number;
  color: string;
}) {
  return (
    <motion.svg
      viewBox="0 0 100 100"
      className="absolute h-24 w-24"
      style={{ left: x, top: y, transform: `scale(${scale})` }}
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 0.9, 0.55, 0], scale: [0.35, 1, 1.15, 1.25] }}
      transition={{ duration: 2.6, repeat: Infinity, repeatDelay: 3.4, delay, ease: "easeOut" }}
      aria-hidden="true"
    >
      {Array.from({ length: 12 }).map((_, i) => (
        <g key={i} transform={`rotate(${i * 30} 50 50)`}>
          <line x1="50" y1="34" x2="50" y2="12" stroke={color} strokeWidth="2.4" strokeLinecap="round" />
          <circle cx="50" cy="10" r="2.6" fill={color} />
        </g>
      ))}
      <circle cx="50" cy="50" r="3.5" fill={color} />
    </motion.svg>
  );
}

/** A dove: two arcs for wings, drifting across and gently bobbing. */
function Dove({
  top,
  delay = 0,
  duration = 26,
  size = 26,
  flip = false,
}: {
  top: string;
  delay?: number;
  duration?: number;
  size?: number;
  flip?: boolean;
}) {
  return (
    <motion.svg
      viewBox="0 0 40 24"
      className="absolute"
      style={{ top, width: size, height: size * 0.6 }}
      initial={{ x: flip ? "110vw" : "-12vw", opacity: 0 }}
      animate={{
        x: flip ? "-15vw" : "115vw",
        y: [0, -14, 6, -8, 0],
        opacity: [0, 0.85, 0.85, 0],
      }}
      transition={{ duration, repeat: Infinity, delay, ease: "linear" }}
      aria-hidden="true"
    >
      <g transform={flip ? "scale(-1,1) translate(-40,0)" : undefined}>
        {/* upper wing */}
        <path d="M4 14 Q 14 2 24 12" fill="none" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" />
        {/* lower wing */}
        <path d="M8 15 Q 18 24 28 14" fill="none" stroke="#ffffff" strokeWidth="2.1" strokeLinecap="round" />
        {/* body + beak */}
        <path d="M24 12 Q 31 11 36 13" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" />
      </g>
    </motion.svg>
  );
}

/**
 * The full Independence Day illustration, drawn as one composed SVG:
 * dawn sky → sun → distant monuments → India Gate (light streaming through the
 * archway) → flowing tricolour → fireworks → doves.
 *
 * Kept as a single <svg> so the layering, shading and proportions stay locked
 * together at any size.
 */
function IndiaGateScene({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 520" className={className} aria-hidden="true">
      <defs>
        {/* Dawn sky */}
        <linearGradient id="ind-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFF3DF" />
          <stop offset="45%" stopColor="#FDF7FF" />
          <stop offset="100%" stopColor="#EDFBEB" />
        </linearGradient>

        {/* Sandstone for the monument */}
        <linearGradient id="ind-stone" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E3B589" />
          <stop offset="45%" stopColor="#CE9463" />
          <stop offset="100%" stopColor="#A9743F" />
        </linearGradient>
        <linearGradient id="ind-stone-lit" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#F0CFA9" />
          <stop offset="100%" stopColor="#C98F5C" />
        </linearGradient>

        {/* Sun glow behind the arch */}
        <radialGradient id="ind-sun" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFF6D8" />
          <stop offset="35%" stopColor="#FFD37A" />
          <stop offset="100%" stopColor="#FFB347" stopOpacity="0" />
        </radialGradient>

        {/* Ribbon shading */}
        <linearGradient id="ind-saffron" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#FFB35C" />
          <stop offset="50%" stopColor="#FF9933" />
          <stop offset="100%" stopColor="#E87C1E" />
        </linearGradient>
        <linearGradient id="ind-white" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="50%" stopColor="#F7F7FA" />
          <stop offset="100%" stopColor="#E6E6EF" />
        </linearGradient>
        <linearGradient id="ind-green" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#2FA33A" />
          <stop offset="50%" stopColor="#138808" />
          <stop offset="100%" stopColor="#0C6606" />
        </linearGradient>

        {/* The archway opening, so sunlight shows through the gate */}
        <mask id="ind-arch-mask">
          <rect width="400" height="520" fill="white" />
          <path d="M168 432 L168 296 Q200 240 232 296 L232 432 Z" fill="black" />
        </mask>
      </defs>

      {/* ── Sky ────────────────────────────────────────────────── */}
      <rect width="400" height="520" rx="28" fill="url(#ind-sky)" />

      {/* Sun, positioned to sit inside the archway */}
      <circle cx="200" cy="372" r="118" fill="url(#ind-sun)" opacity="0.95" />

      {/* Rotating rays */}
      <g opacity="0.35">
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 200 372"
          to="360 200 372"
          dur="150s"
          repeatCount="indefinite"
        />
        {Array.from({ length: 18 }).map((_, i) => (
          <polygon
            key={i}
            points="200,372 194,206 206,206"
            fill={i % 2 === 0 ? "#FFC46B" : "#FFE0A8"}
            transform={`rotate(${i * 20} 200 372)`}
          />
        ))}
      </g>

      {/* Soft clouds */}
      <g fill="#ffffff" opacity="0.75">
        <ellipse cx="78" cy="150" rx="46" ry="17" />
        <ellipse cx="108" cy="141" rx="30" ry="14" />
        <ellipse cx="322" cy="196" rx="42" ry="15" />
        <ellipse cx="296" cy="188" rx="26" ry="12" />
      </g>

      {/* ── Distant skyline: Taj dome (left), Qutub Minar (right) ── */}
      <g opacity="0.22" fill="#8B6C4F">
        {/* Taj-style dome + minarets */}
        <path d="M56 430 L56 372 Q56 336 80 330 Q104 336 104 372 L104 430 Z" />
        <path d="M80 322 q -16 10 -16 26 q 16 -12 16 -12 q 0 0 16 12 q 0 -16 -16 -26 Z" />
        <rect x="40" y="356" width="8" height="74" rx="3" />
        <rect x="112" y="356" width="8" height="74" rx="3" />
        {/* Qutub Minar */}
        <path d="M330 430 L336 320 L352 320 L358 430 Z" />
        <rect x="332" y="356" width="24" height="5" />
        <rect x="334" y="386" width="20" height="5" />
      </g>

      {/* ── India Gate ─────────────────────────────────────────── */}
      <g mask="url(#ind-arch-mask)">
        {/* steps */}
        <rect x="96" y="446" width="208" height="12" rx="3" fill="#B98A57" />
        <rect x="108" y="432" width="184" height="16" rx="3" fill="url(#ind-stone)" />

        {/* main mass */}
        <rect x="128" y="212" width="144" height="222" rx="4" fill="url(#ind-stone)" />
        {/* lit left face */}
        <rect x="128" y="212" width="26" height="222" fill="url(#ind-stone-lit)" opacity="0.75" />

        {/* pilaster grooves */}
        <g fill="#9A6B3C" opacity="0.35">
          <rect x="146" y="230" width="5" height="196" rx="2" />
          <rect x="249" y="230" width="5" height="196" rx="2" />
        </g>

        {/* inscription band */}
        <rect x="140" y="244" width="120" height="22" rx="3" fill="#B07E4C" opacity="0.55" />
        <text
          x="200"
          y="260"
          textAnchor="middle"
          fontSize="14"
          fontWeight="700"
          letterSpacing="3"
          fill="#5E3A18"
          opacity="0.75"
        >
          INDIA
        </text>

        {/* arch trim */}
        <path
          d="M160 432 L160 292 Q200 230 240 292 L240 432"
          fill="none"
          stroke="#A9743F"
          strokeWidth="8"
          opacity="0.55"
        />

        {/* cornice */}
        <rect x="116" y="192" width="168" height="22" rx="3" fill="#D9A472" />
        <rect x="116" y="192" width="168" height="7" rx="3" fill="#F0CFA9" />

        {/* upper tier */}
        <rect x="150" y="150" width="100" height="44" rx="3" fill="url(#ind-stone)" />
        <rect x="150" y="150" width="18" height="44" fill="url(#ind-stone-lit)" opacity="0.7" />

        {/* second cornice */}
        <rect x="140" y="138" width="120" height="14" rx="3" fill="#D9A472" />

        {/* crown block */}
        <rect x="170" y="108" width="60" height="32" rx="3" fill="url(#ind-stone)" />

        {/* shallow dome + finial */}
        <path d="M172 110 Q200 78 228 110 Z" fill="#D9A472" />
        <circle cx="200" cy="76" r="7" fill="#C98F5C" />
        <rect x="197" y="58" width="6" height="20" rx="3" fill="#C98F5C" />
      </g>

      {/* Light spilling out of the archway */}
      <path
        d="M168 432 L168 296 Q200 240 232 296 L232 432 Z"
        fill="url(#ind-sun)"
        opacity="0.9"
      />

      {/* ── Flowing tricolour ──────────────────────────────────── */}
      {/* Lifted clear of the archway — the sunlit arch is the focal point and
          the ribbon was cutting straight across it. */}
      <g opacity="0.95" transform="translate(0,-84)">
        <path
          d="M-20 214 C 80 168, 150 262, 250 214 C 320 180, 370 208, 420 192 L420 226 C 370 242, 320 214, 250 248 C 150 296, 80 202, -20 248 Z"
          fill="url(#ind-saffron)"
        >
          <animate
            attributeName="d"
            dur="9s"
            repeatCount="indefinite"
            values="
              M-20 214 C 80 168, 150 262, 250 214 C 320 180, 370 208, 420 192 L420 226 C 370 242, 320 214, 250 248 C 150 296, 80 202, -20 248 Z;
              M-20 214 C 80 254, 150 172, 250 226 C 320 256, 370 190, 420 206 L420 240 C 370 224, 320 290, 250 260 C 150 206, 80 288, -20 248 Z;
              M-20 214 C 80 168, 150 262, 250 214 C 320 180, 370 208, 420 192 L420 226 C 370 242, 320 214, 250 248 C 150 296, 80 202, -20 248 Z"
          />
        </path>

        <path
          d="M-20 248 C 80 202, 150 296, 250 248 C 320 214, 370 242, 420 226 L420 260 C 370 276, 320 248, 250 282 C 150 330, 80 236, -20 282 Z"
          fill="url(#ind-white)"
        >
          <animate
            attributeName="d"
            dur="9s"
            begin="0.35s"
            repeatCount="indefinite"
            values="
              M-20 248 C 80 202, 150 296, 250 248 C 320 214, 370 242, 420 226 L420 260 C 370 276, 320 248, 250 282 C 150 330, 80 236, -20 282 Z;
              M-20 248 C 80 288, 150 206, 250 260 C 320 290, 370 224, 420 240 L420 274 C 370 258, 320 324, 250 294 C 150 240, 80 322, -20 282 Z;
              M-20 248 C 80 202, 150 296, 250 248 C 320 214, 370 242, 420 226 L420 260 C 370 276, 320 248, 250 282 C 150 330, 80 236, -20 282 Z"
          />
        </path>

        <path
          d="M-20 282 C 80 236, 150 330, 250 282 C 320 248, 370 276, 420 260 L420 294 C 370 310, 320 282, 250 316 C 150 364, 80 270, -20 316 Z"
          fill="url(#ind-green)"
        >
          <animate
            attributeName="d"
            dur="9s"
            begin="0.7s"
            repeatCount="indefinite"
            values="
              M-20 282 C 80 236, 150 330, 250 282 C 320 248, 370 276, 420 260 L420 294 C 370 310, 320 282, 250 316 C 150 364, 80 270, -20 316 Z;
              M-20 282 C 80 322, 150 240, 250 294 C 320 324, 370 258, 420 274 L420 308 C 370 292, 320 358, 250 328 C 150 274, 80 356, -20 316 Z;
              M-20 282 C 80 236, 150 330, 250 282 C 320 248, 370 276, 420 260 L420 294 C 370 310, 320 282, 250 316 C 150 364, 80 270, -20 316 Z"
          />
        </path>

        {/* Chakra riding the white band */}
        <g opacity="0.9">
          <circle cx="118" cy="272" r="15" fill="none" stroke={TRICOLOUR.chakra} strokeWidth="2.4" />
          <circle cx="118" cy="272" r="2.4" fill={TRICOLOUR.chakra} />
          {Array.from({ length: 24 }).map((_, i) => (
            <line
              key={i}
              x1="118"
              y1="272"
              x2="118"
              y2="259"
              stroke={TRICOLOUR.chakra}
              strokeWidth="1"
              transform={`rotate(${i * 15} 118 272)`}
            />
          ))}
        </g>
      </g>

      {/* ── Fireworks ──────────────────────────────────────────── */}
      {[
        { cx: 64, cy: 74, c: "#FF9933", d: "0s" },
        { cx: 318, cy: 58, c: "#138808", d: "1.6s" },
        { cx: 196, cy: 40, c: "#FFC94D", d: "3.1s" },
      ].map((fw, i) => (
        <g key={i} opacity="0">
          <animate
            attributeName="opacity"
            values="0;0.95;0.6;0"
            dur="2.8s"
            begin={fw.d}
            repeatCount="indefinite"
          />
          <animateTransform
            attributeName="transform"
            type="scale"
            values="0.4;1;1.2"
            additive="sum"
            dur="2.8s"
            begin={fw.d}
            repeatCount="indefinite"
          />
          {Array.from({ length: 12 }).map((_, k) => (
            <g key={k} transform={`rotate(${k * 30} ${fw.cx} ${fw.cy})`}>
              <line
                x1={fw.cx}
                y1={fw.cy - 8}
                x2={fw.cx}
                y2={fw.cy - 26}
                stroke={fw.c}
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx={fw.cx} cy={fw.cy - 29} r="2.2" fill={fw.c} />
            </g>
          ))}
        </g>
      ))}

      {/* ── Doves ──────────────────────────────────────────────── */}
      {[
        { x: 96, y: 112, s: 1.1, dur: "5.5s", d: "0s" },
        { x: 300, y: 140, s: 0.85, dur: "6.5s", d: "1.2s" },
      ].map((dv, i) => (
        <g key={i} transform={`translate(${dv.x} ${dv.y}) scale(${dv.s})`}>
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0,0; 6,-10; 0,0"
            additive="sum"
            dur={dv.dur}
            begin={dv.d}
            repeatCount="indefinite"
          />
          <path d="M0 8 Q 12 -6 26 6" fill="none" stroke="#fff" strokeWidth="3.4" strokeLinecap="round" />
          <path d="M4 10 Q 16 22 30 8" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
          <path d="M26 6 Q 36 5 44 8" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
        </g>
      ))}
    </svg>
  );
}

/**
 * The festive scene: dawn glow, sun rays, India Gate, a waving tricolour,
 * fireworks, doves and a turning chakra.
 *
 * Absolutely positioned inside its (relative) parent and pointer-events-none,
 * so it sits behind the content and can never intercept a tap on the form.
 */
export function IndependenceDecor() {
  if (!isIndependenceCampaign) return null;

  return (
    // NO overflow-hidden. This sits inside the 50%-wide left panel, so clipping
    // chopped the blurred glows dead at the panel's right edge and left a hard
    // vertical seam down the middle of the page. Unclipped, they just fade out.
    <div className="pointer-events-none absolute inset-0" aria-hidden="true">
      {/* Soft tricolour wash only — the monument, flag and doves live in the
          backdrop artwork, so this stays quiet behind the headline and cards
          instead of competing with them. */}
      <div className="absolute -left-24 -top-16 h-96 w-96 rounded-full bg-[#FF9933]/25 blur-3xl" />
      <div className="absolute -right-24 bottom-[-10%] h-96 w-96 rounded-full bg-[#138808]/20 blur-3xl" />

      {/* Drifting tricolour motes */}
      {[
        { left: "14%", top: "44%", color: TRICOLOUR.saffron, delay: 0, size: 6 },
        { left: "70%", top: "38%", color: TRICOLOUR.green, delay: 1.5, size: 5 },
        { left: "30%", top: "66%", color: TRICOLOUR.saffron, delay: 3, size: 4 },
        { left: "56%", top: "56%", color: TRICOLOUR.chakra, delay: 4, size: 4 },
      ].map((mote, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{
            left: mote.left,
            top: mote.top,
            width: mote.size,
            height: mote.size,
            backgroundColor: mote.color,
          }}
          animate={{ y: [0, -18, 0], opacity: [0.15, 0.5, 0.15] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: mote.delay }}
        />
      ))}
    </div>
  );
}

/**
 * Full-bleed festive backdrop.
 *
 * The page layout is NOT changed: the left panel and the form stay exactly
 * where they were. This just paints the India Gate artwork, the greeting and
 * the Jai Hind note BEHIND them, in the gap between the two columns.
 *
 * Absolutely positioned, pointer-events-none and un-stacked (the content sits
 * on `z-10`), so it can never cover or intercept the form.
 */
export function IndependenceBackdrop() {
  // Falls back to the drawn scene if the artwork file isn't there, so a missing
  // or renamed asset never leaves a broken image on the landing page.
  const [artworkFailed, setArtworkFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // The <img> is server-rendered, so a 404 can land BEFORE hydration — in that
  // case the onError prop never fires. Re-check the decoded size on mount:
  // complete + zero naturalWidth means the request failed.
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setArtworkFailed(true);
  }, []);

  if (!isIndependenceCampaign) return null;

  const useArtwork = !!INDEPENDENCE_HERO_SRC && !artworkFailed;

  return (
    /* Clipped to the band LEFT of the form so the artwork never slides under
       the card and muddies it. Everything festive lives inside this band. */
    <div
      className="pointer-events-none absolute inset-y-0 left-0 right-[42%] hidden overflow-hidden lg:block"
      aria-hidden="true"
    >
      {/* Warm dawn wash so the artwork sits in the page, not on top of it */}
      <div className="absolute right-0 top-1/2 h-[70%] w-[70%] -translate-y-1/2 rounded-full bg-[#FFC46B]/20 blur-3xl" />

      {/* Artwork — right-aligned inside the band, bottom-anchored so the
          monument's base lines up with the page. */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="absolute bottom-[6%] right-[-10%] h-[70%]"
      >
        {useArtwork ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={INDEPENDENCE_HERO_SRC}
            alt=""
            ref={imgRef}
            onError={() => setArtworkFailed(true)}
            // The artwork ships on a WHITE background, which would otherwise read
            // as a pasted white box. multiply drops the white into the page and
            // keeps the monument, flag and doves — no re-export needed.
            className="h-full w-auto max-w-none select-none object-contain mix-blend-multiply"
          />
        ) : (
          <IndiaGateScene className="h-full w-auto" />
        )}
      </motion.div>

      {/* Greeting, sitting above the monument */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.15 }}
        className="absolute right-[2%] top-[4%] text-center"
      >
        <p className="text-[26px] font-extrabold leading-[1.05] tracking-[-0.03em] 2xl:text-[34px]">
          <span className="block text-[#1b1e6b]">Happy</span>
          <span className="block text-[#FF9933]">Independence</span>
          <span className="block text-[#138808]">Day!</span>
        </p>

        <div className="mt-2.5 flex items-center justify-center gap-2">
          <span className="h-px w-12 bg-gradient-to-r from-transparent to-[#c9c3f0]" />
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            className="inline-flex"
          >
            <AshokaChakra className="h-4 w-4" />
          </motion.span>
          <span className="h-px w-12 bg-gradient-to-l from-transparent to-[#c9c3f0]" />
        </div>
      </motion.div>

      {/* Jai Hind note, floating over the base of the artwork */}
      <div className="absolute bottom-[6%] right-[6%] w-60 2xl:w-64">
        <IndependenceNote />
      </div>
    </div>
  );
}

/**
 * Wrapper around the built-in illustration, used until INDEPENDENCE_HERO_SRC
 * points at a designed asset.
 */
function IndependenceSvgScene() {
  return <IndiaGateScene className="w-full h-auto" />;
}

/**
 * India Gate behind the MOBILE header (logo → badge → trust card).
 *
 * On phones there is no room for a side column, so the artwork becomes a
 * washed-back header image instead. Opacity is kept low and the edges are
 * feathered so the logo, badge and trust copy stay fully legible on top.
 *
 * Renders nothing when the campaign is off, and falls back to the drawn scene
 * if the artwork file is missing.
 */
export function IndependenceMobileBackdrop() {
  const [artworkFailed, setArtworkFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // The <img> is server-rendered, so a 404 can land BEFORE hydration and the
  // onError prop never fires — re-check the decoded size on mount.
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setArtworkFailed(true);
  }, []);

  if (!isIndependenceCampaign) return null;

  const useArtwork = !!INDEPENDENCE_HERO_SRC && !artworkFailed;

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden lg:hidden"
      aria-hidden="true"
    >
      {/* Warm wash so the header doesn't read as a pasted photo */}
      <div className="absolute inset-x-0 top-0 h-2/3 bg-gradient-to-b from-[#FFC46B]/15 to-transparent" />

      {useArtwork ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={INDEPENDENCE_HERO_SRC}
          alt=""
          ref={imgRef}
          onError={() => setArtworkFailed(true)}
          className="absolute left-1/2 top-0 h-full w-auto min-w-full -translate-x-1/2 select-none object-cover opacity-70 mix-blend-multiply"
          style={{ maskImage: MOBILE_FEATHER_MASK, WebkitMaskImage: MOBILE_FEATHER_MASK }}
        />
      ) : (
        <div
          className="absolute left-1/2 top-0 h-full -translate-x-1/2 opacity-70"
          style={{ maskImage: MOBILE_FEATHER_MASK, WebkitMaskImage: MOBILE_FEATHER_MASK }}
        >
          <IndiaGateScene className="h-full w-auto" />
        </div>
      )}
    </div>
  );
}

/**
 * Mobile intro splash: the India Gate fades up, "Happy Independence Day!"
 * writes itself in, then the whole thing lifts away to reveal the page.
 *
 * Mobile only — on desktop the artwork is already visible in the layout, so an
 * interstitial would just delay the form.
 *
 * Rules it follows:
 *  - Mounted client-side only, so it never blocks the server render or the SEO
 *    content, and there is no hydration mismatch.
 *  - Unmounts completely when finished — it can never intercept a tap on the
 *    form afterwards.
 *  - Tap anywhere to skip.
 *  - Skipped entirely when the user asks for reduced motion.
 */
export function IndependenceMobileIntro() {
  const [phase, setPhase] = useState<"hidden" | "playing" | "done">("hidden");
  const [artworkFailed, setArtworkFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    if (!isIndependenceCampaign) return;

    // Respect the OS "reduce motion" setting — a full-screen animated splash is
    // exactly what that setting exists to suppress.
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    // Desktop already shows the artwork in the layout; don't gate the form.
    if (window.matchMedia("(min-width: 1024px)").matches) return;

    setPhase("playing");
    const t = setTimeout(() => setPhase("done"), INTRO_TOTAL_MS);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setArtworkFailed(true);
  }, [phase]);

  if (!isIndependenceCampaign) return null;

  const useArtwork = !!INDEPENDENCE_HERO_SRC && !artworkFailed;

  return (
    <AnimatePresence>
      {phase === "playing" && (
        <motion.div
          key="independence-intro"
          onClick={() => setPhase("done")}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -24 }}
          transition={{ duration: 0.55, ease: "easeInOut" }}
          className="fixed inset-0 z-[70] flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#FFF3DF] via-[#FBF7FF] to-[#EAF9E8] lg:hidden"
        >
          {/* Artwork */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.85, ease: "easeOut" }}
            className="relative w-[112%] max-w-none"
          >
            {useArtwork ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={INDEPENDENCE_HERO_SRC}
                alt=""
                aria-hidden="true"
                ref={imgRef}
                onError={() => setArtworkFailed(true)}
                className="h-auto w-full select-none mix-blend-multiply"
                style={{ maskImage: MOBILE_FEATHER_MASK, WebkitMaskImage: MOBILE_FEATHER_MASK }}
              />
            ) : (
              <IndiaGateScene className="h-auto w-full" />
            )}
          </motion.div>

          {/* Greeting — one word at a time, in the tricolour */}
          <div className="-mt-4 text-center">
            {[
              { text: "Happy", color: "#1b1e6b" },
              { text: "Independence", color: TRICOLOUR.saffron },
              { text: "Day!", color: TRICOLOUR.green },
            ].map((word, i) => (
              <motion.span
                key={word.text}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.75 + i * 0.22, ease: "easeOut" }}
                className="block text-[30px] font-extrabold leading-[1.08] tracking-[-0.03em]"
                style={{ color: word.color }}
              >
                {word.text}
              </motion.span>
            ))}

            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.5, delay: 1.5 }}
              className="mt-3 flex items-center justify-center gap-2"
            >
              <span className="h-px w-12 bg-[#c9c3f0]" />
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                className="inline-flex"
              >
                <AshokaChakra className="h-5 w-5" />
              </motion.span>
              <span className="h-px w-12 bg-[#c9c3f0]" />
            </motion.div>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.9 }}
            className="absolute bottom-8 text-[11px] font-medium text-[#8791b5]"
          >
            Tap to continue
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** "15th August" pill shown above the headline. */
export function IndependenceBadge({ className = "" }: { className?: string }) {
  if (!isIndependenceCampaign) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/70 px-3 py-1 shadow-[0_6px_20px_rgba(116,82,255,0.12)] backdrop-blur-xl ${className}`}
    >
      <span
        className="h-3.5 w-3.5 shrink-0 rounded-[3px]"
        style={{
          background: `linear-gradient(180deg, ${TRICOLOUR.saffron} 0 33%, ${TRICOLOUR.white} 33% 66%, ${TRICOLOUR.green} 66% 100%)`,
          boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.06)",
        }}
      />
      <span className="text-[11px] font-bold tracking-wide text-[#1b1e6b]">
        15<sup>TH</sup> AUGUST
      </span>
      <AshokaChakra className="h-3.5 w-3.5" />
    </motion.div>
  );
}

/** Festive headline. Returns null when off so the caller renders its own. */
export function IndependenceHeadline() {
  if (!isIndependenceCampaign) return null;

  return (
    <div className="space-y-2 text-left 2xl:space-y-3">
      <IndependenceBadge className="mb-1" />

      {/* The "Happy Independence Day!" greeting lives in the centre hero column
          (IndependenceHero), matching the reference layout. */}
      <h2 className="text-2xl font-extrabold leading-[0.95] tracking-[-0.05em] text-[#161a6d] sm:text-[1.75rem] lg:max-w-104 lg:text-[3rem] xl:text-[3.5rem] 2xl:text-[4rem] 3xl:text-[5rem] [@media(max-height:900px)]:text-[1.85rem]">
        <span className="block text-4xl">Proud to be Indian.</span>
        <span className="block bg-gradient-to-r from-[#FF9933] via-[#8560ff] to-[#138808] bg-clip-text text-4xl text-transparent">
          Here to Empower You.
        </span>
      </h2>

      <p className="mb-4 max-w-72 text-xs text-gray-500 2xl:max-w-80 2xl:text-sm 3xl:max-w-96 3xl:text-base">
        This Independence Day, we celebrate{" "}
        <span className="font-semibold text-[#FF9933]">freedom</span>,{" "}
        <span className="font-semibold text-[#6b4cff]">unity</span> and the dreams
        that drive a <span className="font-semibold text-[#138808]">New India</span>{" "}
        forward.
      </p>
    </div>
  );
}

/** Small "Jai Hind" note that sits under the trust badges. */
export function IndependenceNote() {
  if (!isIndependenceCampaign) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      // No panel at all — border, shadow, fill and blur each drew a visible
      // rectangle edge over the artwork. Legibility comes from a white halo on
      // the text itself instead, so nothing frames it.
      className="relative px-3 py-2.5"
    >
      {/* Tricolour edge */}
      <span
        className="absolute inset-y-0 left-0 w-1"
        style={{
          background: `linear-gradient(180deg, ${TRICOLOUR.saffron} 0 33%, ${TRICOLOUR.white} 33% 66%, ${TRICOLOUR.green} 66% 100%)`,
        }}
      />

      <p className="pl-2 text-[11px] leading-relaxed text-[#5d648f] [text-shadow:0_1px_3px_rgba(255,255,255,0.95),0_0_10px_rgba(255,255,255,0.85)] 2xl:text-xs">
        This Independence Day,{" "}
        <span className="font-semibold text-[#1b1e6b]">
          let&apos;s build a stronger tomorrow, together.
        </span>
        <br />
        <span className="font-bold text-[#138808]">Jai Hind! 🇮🇳</span>
      </p>
    </motion.div>
  );
}
