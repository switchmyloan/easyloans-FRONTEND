"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  GANPATI_HERO_SRC,
  isGanpatiCampaign,
} from "@/lib/campaign";

// ============================================================
// Ganesh Chaturthi minimal skin for the landing pages.
// Corner flowers, Ganesha image, and falling petals.
// ============================================================

const FEATHER_MASK =
  "radial-gradient(ellipse closest-side at 50% 50%, #000 56%, rgba(0,0,0,0.88) 72%, rgba(0,0,0,0.5) 86%, transparent 99%)";

const MOBILE_FEATHER_MASK =
  "radial-gradient(ellipse 80% 70% at 50% 40%, #000 40%, rgba(0,0,0,0.7) 60%, rgba(0,0,0,0.3) 80%, transparent 100%)";

/** Single falling rose petal */
function FallingPetal({
  left,
  delay,
  duration,
  size = 16,
}: {
  left: string;
  delay: number;
  duration: number;
  size?: number;
}) {
  return (
    <motion.div
      className="absolute top-0"
      style={{ left }}
      initial={{ y: -20, opacity: 0, rotate: 0 }}
      animate={{
        y: ["0vh", "105vh"],
        opacity: [0, 0.8, 0.8, 0.6, 0],
        rotate: [0, 45, -30, 60, 20],
        x: [0, 15, -20, 25, -10, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        delay,
        ease: "linear",
      }}
    >
      <svg
        width={size}
        height={size * 1.2}
        viewBox="0 0 20 24"
        fill="none"
        aria-hidden="true"
      >
        <ellipse
          cx="10"
          cy="12"
          rx="8"
          ry="11"
          fill="url(#petal-gradient)"
          opacity="0.75"
        />
        <defs>
          <linearGradient id="petal-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFB6C1" />
            <stop offset="50%" stopColor="#FF69B4" />
            <stop offset="100%" stopColor="#DB7093" />
          </linearGradient>
        </defs>
      </svg>
    </motion.div>
  );
}

/**
 * Corner flower decorations + falling petals (desktop only)
 */
export function GanpatiDecor() {
  if (!isGanpatiCampaign) return null;

  // Generate petals with varied positions and timing
  const petals = [
    { left: "5%", delay: 0, duration: 12, size: 14 },
    { left: "15%", delay: 2, duration: 14, size: 16 },
    { left: "25%", delay: 4, duration: 11, size: 12 },
    { left: "35%", delay: 1, duration: 13, size: 15 },
    { left: "45%", delay: 3, duration: 12, size: 14 },
    { left: "55%", delay: 5, duration: 14, size: 13 },
    { left: "65%", delay: 2.5, duration: 11, size: 16 },
    { left: "75%", delay: 0.5, duration: 13, size: 12 },
    { left: "85%", delay: 4.5, duration: 12, size: 15 },
    { left: "92%", delay: 1.5, duration: 14, size: 14 },
    { left: "10%", delay: 6, duration: 13, size: 11 },
    { left: "50%", delay: 7, duration: 12, size: 13 },
    { left: "70%", delay: 8, duration: 11, size: 12 },
  ];

  // Fewer petals for mobile (performance)
  const mobilePetals = [
    { left: "10%", delay: 0, duration: 10, size: 12 },
    { left: "30%", delay: 2, duration: 12, size: 10 },
    { left: "50%", delay: 1, duration: 11, size: 11 },
    { left: "70%", delay: 3, duration: 10, size: 12 },
    { left: "90%", delay: 1.5, duration: 12, size: 10 },
  ];

  return (
    <>
      {/* Mobile falling petals */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden lg:hidden" aria-hidden="true">
        {mobilePetals.map((petal, i) => (
          <FallingPetal key={i} {...petal} />
        ))}
      </div>

      {/* Desktop: corner flowers + falling petals */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden hidden lg:block" aria-hidden="true">
        {/* Left corner flower - desktop only */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/flowers/left-flower.svg"
          alt=""
          className="absolute left-0 top-0 h-auto w-28"
        />
        {/* Right corner flower - desktop only */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/flowers/right-flower.svg"
          alt=""
          className="absolute right-0 top-0 h-auto w-28"
        />

        {/* Bottom left lotus - desktop only */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/flowers/left-lotus.svg"
          alt=""
          className="absolute -left-9 -bottom-5 h-auto w-32"
        />
        {/* Bottom right lotus - desktop only */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/flowers/right-lotus.svg"
          alt=""
          className="absolute -right-9 -bottom-5 h-auto w-32"
        />

        {/* Falling rose petals - desktop */}
        {petals.map((petal, i) => (
          <FallingPetal key={i} {...petal} />
        ))}
      </div>
    </>
  );
}

/**
 * Backdrop with just the Ganesha image centered (desktop).
 */
export function GanpatiBackdrop() {
  const [artworkFailed, setArtworkFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) setArtworkFailed(true);
  }, []);

  if (!isGanpatiCampaign) return null;

  const useArtwork = !!GANPATI_HERO_SRC && !artworkFailed;

  if (!useArtwork) return null;

  return (
    <div
      className="pointer-events-none absolute inset-y-0 left-[20%] right-[30%] hidden lg:flex lg:flex-col lg:items-center lg:justify-center"
      aria-hidden="true"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative h-[45%] ml-28 flex items-end justify-center"
      >

        <img
          src={GANPATI_HERO_SRC}
          alt=""
          ref={imgRef}
          onError={() => setArtworkFailed(true)}
          className="h-full w-auto max-w-none select-none object-contain"
          style={{
            maskImage: FEATHER_MASK,
            WebkitMaskImage: FEATHER_MASK,
          }}
        />
      </motion.div>
    </div>
  );
}

/**
 * Mobile top flower decoration.
 */
export function GanpatiMobileBackdrop() {
  if (!isGanpatiCampaign) return null;

  return (
    <div
      className="pointer-events-none absolute left-0 right-0 top-0 lg:hidden z-10"
      aria-hidden="true"
    >
      {/* Mobile flower at top - absolutely positioned, scrolls with page */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/flowers/mobile-flower.png"
        alt=""
        className="w-full h-auto block absolute left-0 right-0 -top-21 "
      />
    </div>
  );
}

/**
 * Ganesha image for mobile - to be placed after form.
 */
export function GanpatiMobileFooter() {
  if (!isGanpatiCampaign) return null;

  return (
    <div className="flex justify-center py-8 lg:hidden">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={GANPATI_HERO_SRC}
        alt="Ganpati"
        className="h-52 w-auto object-contain"
      />
    </div>
  );
}

/**
 * Small Ganpati image on form corner (mobile only)
 */
export function GanpatiCornerRibbon() {
  if (!isGanpatiCampaign) return null;

  return (
    <div
      className="pointer-events-none absolute -right-4 top-1 w-30 h-30 z-20 lg:hidden"
      aria-hidden="true"
    >
      <img
        src={GANPATI_HERO_SRC}
        alt=""
        className="w-full h-full object-contain drop-shadow-lg"
      />
    </div>
  );
}

// No badge on mobile - returns null
export function GanpatiBadge() {
  return null;
}

export function GanpatiHeadline() {
  if (!isGanpatiCampaign) return null;

  return (
    <div className="space-y-2 text-left 2xl:space-y-3">
      <motion.p
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8560ff] 2xl:text-xs"
      >
        Cready wishes you a
      </motion.p>

      <h2 className="text-2xl font-extrabold leading-[0.95] tracking-[-0.05em] text-[#161a6d] sm:text-[1.75rem] lg:max-w-104 lg:text-[3rem] xl:text-[3.5rem] 2xl:text-[4rem] 3xl:text-[5rem] [@media(max-height:900px)]:text-[1.85rem]">
        <span className="block text-4xl">Happy</span>
        <span className="block text-4xl bg-gradient-to-r from-[#FF6B35] via-[#F7931E] to-[#FFD700] bg-clip-text text-transparent">
          Ganesh Chaturthi
        </span>
      </h2>

      <p className="max-w-80 text-gray-500 text-xs mb-4 2xl:text-sm 2xl:max-w-96 3xl:text-base 3xl:max-w-[420px]">
        May Lord Ganesha remove all obstacles from your path and fill your life with happiness, prosperity and success.
      </p>
    </div>
  );
}

export function GanpatiMobileIntro() {
  return null;
}

export function GanpatiNote() {
  return null;
}
