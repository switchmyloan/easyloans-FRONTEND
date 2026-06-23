"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import VanillaTilt from "vanilla-tilt";

type TiltElement = HTMLDivElement & {
  vanillaTilt?: {
    destroy: () => void;
  };
};

function useTiltCard() {
  const tiltRef = useRef<TiltElement | null>(null);

  useEffect(() => {
    const node = tiltRef.current;
    if (!node) return;

    VanillaTilt.init(node, {
      max: 15,
      startX: 0,
      startY: 0,
      perspective: 500,
      easing: "cubic-bezier(.03,.98,.52,.99)",
      scale: 1.08,
      speed: 400,
      transition: true,
      glare: true,
      "max-glare": 0.5,
      reset: true,
      "reset-to-start": true,
      gyroscope: true,
      gyroscopeMinAngleX: -45,
      gyroscopeMaxAngleX: 45,
      gyroscopeMinAngleY: -45,
      gyroscopeMaxAngleY: 45,
      gyroscopeSamples: 10,
    });

    return () => {
      node.vanillaTilt?.destroy();
    };
  }, []);

  return tiltRef;
}

function CardBack({
  accentClassName,
  bankName,
  variantLabel,
}: {
  accentClassName: string;
  bankName: string;
  variantLabel: string;
}) {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,#1a1630_0%,#261f46_48%,#1a1630_100%)] text-white shadow-[0_20px_45px_rgba(0,0,0,0.28)] [backface-visibility:hidden] [transform:rotateY(180deg)]">
      <div className={`absolute inset-x-0 top-8 h-12 ${accentClassName}`} />
      <div className="absolute left-[5%] top-[126px] h-10 w-[90%] rounded-md bg-white/95">
        <span className="absolute right-4 top-[10px] font-mono text-sm tracking-[0.18em] text-black">
          123
        </span>
      </div>
      <div className="absolute left-[5%] top-[108px] text-[10px] uppercase tracking-[0.22em] text-white/75">
        CVV
      </div>
      <div className="absolute bottom-16 left-5 right-5 text-[10px] uppercase tracking-[0.22em] text-white/50">
        {bankName}
      </div>
      <div className="absolute bottom-7 left-5 right-5 text-[11px] leading-relaxed text-white/70">
        Tap again to flip back. This {variantLabel} card now uses the same
        vanilla tilt interaction as the FD-backed section.
      </div>
    </div>
  );
}

export function ZetFront() {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_18%_92%,rgba(170,0,155,0.5),transparent_28%),radial-gradient(circle_at_70%_18%,rgba(178,68,255,0.18),transparent_25%),linear-gradient(145deg,#2d0051_0%,#3d006f_36%,#4d007a_62%,#25013f_100%)] shadow-[0_22px_45px_rgba(26,7,49,0.34)] [backface-visibility:hidden]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_52%_58%,rgba(83,12,125,0.2),transparent_32%),radial-gradient(circle_at_44%_78%,rgba(20,0,36,0.38),transparent_42%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent_18%,transparent_82%,rgba(0,0,0,0.12))]" />

      <div
        className="absolute left-5 top-6 text-white"
        style={{ transform: "translateZ(45px)" }}
      >
        <p className="text-[15px] italic tracking-[0.04em] text-white/90">
          CREDIT
        </p>
        <div className="mt-2 flex items-center gap-2">
          <div className="flex items-center gap-[3px]">
            <span className="h-3 w-[2px] rounded-full bg-white/90" />
            <span className="h-5 w-[2px] rounded-full bg-white/90" />
            <span className="h-7 w-[2px] rounded-full bg-white/90" />
            <span className="h-4 w-[2px] rounded-full bg-white/90" />
          </div>
          <div className="leading-none">
            <span className="text-[18px] font-semibold tracking-[-0.02em]">
              SBM
            </span>
            <span className="ml-1 text-[12px] font-medium text-white/90">
              bank
            </span>
          </div>
        </div>
      </div>

      <div
        className="absolute left-[178px] top-10 h-[55px] w-[42px] overflow-hidden rounded-[7px] bg-[linear-gradient(180deg,#f7f7f7_0%,#d8d8d8_48%,#b8b8b8_100%)] shadow-[inset_0_0_0_1px_rgba(115,115,115,0.45)]"
        style={{ transform: "translateZ(62px)" }}
      >
        <div className="absolute left-0 top-[17px] h-px w-full bg-[#777]" />
        <div className="absolute left-0 top-[35px] h-px w-full bg-[#777]" />
        <div className="absolute left-[13px] top-0 h-full w-px bg-[#777]" />
        <div className="absolute left-[28px] top-0 h-full w-px bg-[#777]" />
        <div className="absolute left-[13px] top-[17px] h-[18px] w-[15px] rounded-[10px] border border-[#777]" />
        <div className="absolute left-[-1px] top-[17px] h-[18px] w-[15px] rounded-[10px] border border-[#777]" />
        <div className="absolute left-[27px] top-[17px] h-[18px] w-[15px] rounded-[10px] border border-[#777]" />
      </div>

      <div
        className="absolute right-4 top-[53px] flex items-center gap-[7px] text-white/90"
        style={{ transform: "translateZ(55px)" }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
          <path
            d="M2 2.5 10.5 8 2 13.5V2.5Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
        <svg width="34" height="24" viewBox="0 0 34 24" aria-hidden="true">
          <path
            d="M4 12a10 10 0 0 1 0-7.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M10 12a16 16 0 0 1 0-12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M16 12a22 22 0 0 1 0-16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div
        className="absolute bottom-5 left-5"
        style={{ transform: "translateZ(45px)" }}
      >
        <div className="text-[34px] font-black italic leading-none tracking-[-0.08em] text-white">
          ZET
        </div>
      </div>

      <div
        className="absolute bottom-5 right-5 text-right text-white"
        style={{ transform: "translateZ(54px)" }}
      >
        <div className="flex items-center justify-end gap-1">
          <span className="text-[20px] font-black italic leading-none tracking-[-0.04em]">
            RuPay
          </span>
          <span className="relative inline-block h-5 w-4">
            <span className="absolute left-0 top-0 block h-0 w-0 border-b-[10px] border-l-[5px] border-r-[5px] border-b-[#1a74ff] border-l-transparent border-r-transparent" />
            <span className="absolute bottom-0 left-0 block h-0 w-0 border-l-[5px] border-r-[5px] border-t-[10px] border-l-transparent border-r-transparent border-t-[#35c759]" />
            <span className="absolute left-[6px] top-[3px] block h-0 w-0 border-b-[7px] border-l-[4px] border-r-[4px] border-b-[#ff9f0a] border-l-transparent border-r-transparent" />
          </span>
        </div>
        <div className="mt-1 text-[13px] font-semibold tracking-[0.12em] text-white/95">
          SELECT
        </div>
      </div>
    </div>
  );
}

export function NovioFront() {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-[28px] border border-white/10 shadow-[0_22px_45px_rgba(22,14,48,0.3)] [backface-visibility:hidden]">
      <Image
        src="/Rectangle.svg"
        alt="Novio SBM Bank RuPay Select card"
        fill
        priority={false}
        className="object-cover"
        sizes="(max-width: 640px) 255px, 275px"
      />
    </div>
  );
}

export function IobFront() {
  return (
    <div className="absolute inset-0 overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(115deg,#250038_0%,#2b0a49_34%,#3b1960_68%,#4a2671_100%)] shadow-[0_22px_45px_rgba(26,7,49,0.34)] [backface-visibility:hidden]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_92%,rgba(145,71,180,0.22),transparent_32%),radial-gradient(circle_at_88%_28%,rgba(162,95,224,0.18),transparent_26%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),transparent_18%,transparent_82%,rgba(0,0,0,0.12))]" />
      <div className="absolute -left-16 top-[160px] h-[140px] w-[250px] rotate-[12deg] rounded-[999px] bg-[linear-gradient(180deg,rgba(162,120,219,0.22),rgba(77,35,123,0.04))] blur-[6px]" />
      <div className="absolute left-[120px] top-[230px] h-[220px] w-[240px] rotate-[36deg] rounded-[999px] bg-[linear-gradient(180deg,rgba(134,94,200,0.18),rgba(80,38,122,0.04))] blur-[10px]" />
      <div className="absolute right-[-36px] top-[150px] h-[240px] w-[180px] -rotate-[18deg] rounded-[999px] bg-[linear-gradient(180deg,rgba(168,122,235,0.2),rgba(84,42,128,0.03))] blur-[8px]" />

      <div
        className="absolute left-6 right-6 top-7 flex items-start gap-3 text-white"
        style={{ transform: "translateZ(48px)" }}
      >
        <div className="mt-1 grid shrink-0 grid-cols-2 gap-1">
          <div className="h-6 w-6 rotate-45 border-[2.5px] border-white/95" />
          <div className="h-6 w-6 rotate-45 border-[2.5px] border-white/95" />
          <div className="h-6 w-6 rotate-45 border-[2.5px] border-white/95" />
          <div className="h-6 w-6 rotate-45 border-[2.5px] border-white/95" />
        </div>
        <div className="max-w-[190px] leading-none">
          <div className="text-[11px] font-bold tracking-tight text-white/95">
            इंडियन ओवरसीज़ बैंक
          </div>
          <div className="mt-1 text-[11px] font-black tracking-tight text-white">
            Indian Overseas Bank
          </div>
          <div className="mt-1.5 text-[7px] font-semibold leading-tight text-white/80">
            आपकी प्रगति का सच्चा साथी Good people to grow with
          </div>
        </div>
      </div>

      <div
        className="absolute left-[178px] top-[160px] h-[92px] w-[62px] overflow-hidden rounded-[14px] bg-[linear-gradient(180deg,#fefefe_0%,#d0d0d0_38%,#f5f5f5_60%,#bababa_100%)] shadow-[inset_0_0_0_1px_rgba(112,112,112,0.35)]"
        style={{ transform: "translateZ(62px)" }}
      >
        <div className="absolute left-0 top-[30px] h-px w-full bg-[#7b7b7b]" />
        <div className="absolute left-0 top-[57px] h-px w-full bg-[#7b7b7b]" />
        <div className="absolute left-[19px] top-0 h-full w-px bg-[#7b7b7b]" />
        <div className="absolute left-[42px] top-0 h-full w-px bg-[#7b7b7b]" />
        <div className="absolute left-[19px] top-[30px] h-[27px] w-[23px] rounded-[14px] border border-[#7b7b7b]" />
        <div className="absolute left-[-1px] top-[30px] h-[27px] w-[22px] rounded-[14px] border border-[#7b7b7b]" />
        <div className="absolute left-[41px] top-[30px] h-[27px] w-[22px] rounded-[14px] border border-[#7b7b7b]" />
      </div>

      <div
        className="absolute right-5 top-[196px] flex items-center gap-[8px] text-white"
        style={{ transform: "translateZ(56px)" }}
      >
        <svg width="18" height="18" viewBox="0 0 16 16" aria-hidden="true">
          <path
            d="M2 2.5 10.5 8 2 13.5V2.5Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
        <svg width="40" height="28" viewBox="0 0 34 24" aria-hidden="true">
          <path
            d="M4 12a10 10 0 0 1 0-7.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d="M10 12a16 16 0 0 1 0-12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d="M16 12a22 22 0 0 1 0-16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
        </svg>
      </div>

      <div
        className="absolute bottom-7 left-8"
        style={{ transform: "translateZ(48px)" }}
      >
        <div className="text-[38px] font-black italic leading-none tracking-[-0.09em] text-white">
          ZET
        </div>
      </div>

      <div
        className="absolute bottom-8 right-7 text-right text-white"
        style={{ transform: "translateZ(56px)" }}
      >
        <div className="flex items-center justify-end gap-1">
          <span className="text-[23px] font-black italic leading-none tracking-[-0.05em]">
            RuPay
          </span>
          <span className="relative inline-block h-6 w-5">
            <span className="absolute left-0 top-0 block h-0 w-0 border-b-[13px] border-l-[6px] border-r-[6px] border-b-[#1a74ff] border-l-transparent border-r-transparent" />
            <span className="absolute bottom-0 left-0 block h-0 w-0 border-l-[6px] border-r-[6px] border-t-[13px] border-l-transparent border-r-transparent border-t-[#35c759]" />
            <span className="absolute left-[7px] top-[4px] block h-0 w-0 border-b-[8px] border-l-[4px] border-r-[4px] border-b-[#ff9f0a] border-l-transparent border-r-transparent" />
          </span>
        </div>
      </div>
    </div>
  );
}

export function ZetCard() {
  const tiltRef = useTiltCard();
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="relative flex items-center justify-center overflow-visible px-2 py-0">
      <div
        ref={tiltRef}
        className="relative h-[400px] w-[255px] shrink-0 will-change-transform [transform-style:preserve-3d] sm:h-[430px] sm:w-[275px]"
      >
        <button
          type="button"
          onClick={() => setIsFlipped((prev) => !prev)}
          className="absolute inset-0 block cursor-pointer [transform-style:preserve-3d]"
          aria-label="Flip ZET SBM credit card"
        >
          <div
            className={`relative h-full w-full transition-transform duration-700 [transform-style:preserve-3d] ${isFlipped ? "[transform:rotateY(180deg)]" : ""}`}
          >
            <ZetFront />
            <CardBack
              accentClassName="bg-black"
              bankName="SBM BANK"
              variantLabel="ZET RuPay Select"
            />
          </div>
        </button>
      </div>
    </div>
  );
}

export function NovioCard() {
  const tiltRef = useTiltCard();
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="relative flex items-center justify-center overflow-visible px-2 py-0">
      <div
        ref={tiltRef}
        className="relative h-[400px] w-[255px] shrink-0 will-change-transform [transform-style:preserve-3d] sm:h-[430px] sm:w-[275px]"
      >
        <button
          type="button"
          onClick={() => setIsFlipped((prev) => !prev)}
          className="absolute inset-0 block cursor-pointer [transform-style:preserve-3d]"
          aria-label="Flip Novio SBM credit card"
        >
          <div
            className={`relative h-full w-full transition-transform duration-700 [transform-style:preserve-3d] ${isFlipped ? "[transform:rotateY(180deg)]" : ""}`}
          >
            <NovioFront />
            <CardBack
              accentClassName="bg-[linear-gradient(90deg,#1f1f1f,#6f5320)]"
              bankName="NOVIO X SBM BANK"
              variantLabel="Novio RuPay Select"
            />
          </div>
        </button>
      </div>
    </div>
  );
}

export function IobCard() {
  const tiltRef = useTiltCard();
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="relative flex items-center justify-center overflow-visible px-2 py-0">
      <div
        ref={tiltRef}
        className="relative h-[400px] w-[255px] shrink-0 will-change-transform [transform-style:preserve-3d] sm:h-[430px] sm:w-[275px]"
      >
        <button
          type="button"
          onClick={() => setIsFlipped((prev) => !prev)}
          className="absolute inset-0 block cursor-pointer [transform-style:preserve-3d]"
          aria-label="Flip Indian Overseas Bank credit card"
        >
          <div
            className={`relative h-full w-full transition-transform duration-700 [transform-style:preserve-3d] ${isFlipped ? "[transform:rotateY(180deg)]" : ""}`}
          >
            <IobFront />
            <CardBack
              accentClassName="bg-[linear-gradient(90deg,#111,#4d2674)]"
              bankName="INDIAN OVERSEAS BANK"
              variantLabel="IOB ZET RuPay"
            />
          </div>
        </button>
      </div>
    </div>
  );
}

// Tata Neu Card
export function TataNeuExactFront() {
  return (
    <div className="absolute inset-0 rounded-[26px] overflow-hidden bg-[#351c57] text-white shadow-[0_20px_60px_rgba(0,0,0,0.5)] [backface-visibility:hidden]">
      {/* Subtle center N */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[180px] font-black text-white/10">N</span>
      </div>

      {/* Top Left Logo */}
      <div className="absolute top-5 left-5 flex items-center gap-2">
        <div className="h-5 w-5 rounded-sm bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500" />
        <div className="leading-tight">
          <p className="text-[13px] font-semibold tracking-wide">TATA</p>
          <p className="text-[16px] font-bold tracking-wide">NEUCARD</p>
        </div>
        <span className="text-[10px] ml-1">∞</span>
      </div>

      {/* Chip */}
      <div className="absolute top-16 left-[150px] h-[42px] w-[34px] rounded-md bg-gradient-to-b from-yellow-200 via-yellow-400 to-yellow-600 shadow-inner" />

      {/* RuPay + Contactless */}
      <div className="absolute top-16 right-5 flex items-center gap-2">
        {/* RuPay mini */}
        <div className="h-5 w-5 bg-gradient-to-r from-orange-400 via-blue-500 to-green-400 rounded-sm" />

        {/* Contactless */}
        <svg width="28" height="20" viewBox="0 0 28 20">
          <path
            d="M2 10a6 6 0 0 1 0-6"
            stroke="white"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M8 10a10 10 0 0 1 0-10"
            stroke="white"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M14 10a14 14 0 0 1 0-14"
            stroke="white"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Bottom Left - HDFC */}
      <div className="absolute bottom-6 left-5 border border-white/40 px-3 py-1 rounded-sm text-[11px] font-semibold tracking-wide">
        HDFC BANK
      </div>

      {/* Bottom Right - RuPay */}
      <div className="absolute bottom-6 right-5 text-right">
        <p className="text-[20px] font-bold italic">RuPay</p>
        <p className="text-[11px] tracking-[0.2em] text-white/80">SELECT</p>
      </div>
    </div>
  );
}

function TataNeuBack() {
  return (
    <div className="absolute inset-0 rounded-[28px] overflow-hidden bg-[#1a1630] text-white [transform:rotateY(180deg)] [backface-visibility:hidden]">
      <div className="absolute top-8 w-full h-12 bg-black" />

      <div className="absolute top-[120px] left-[5%] w-[90%] h-10 bg-white rounded">
        <span className="absolute right-4 top-2 text-black font-mono">123</span>
      </div>

      <div className="absolute top-[100px] left-[5%] text-xs text-white/70">
        CVV
      </div>

      <div className="absolute bottom-6 left-5 text-xs text-white/60">
        Tap to flip back
      </div>
    </div>
  );
}

export function TataNeuCard() {
  const tiltRef = useTiltCard();
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="flex items-center justify-center [perspective:1200px]">
      <div
        ref={tiltRef}
        className="relative h-[400px] w-[255px] [transform-style:preserve-3d]"
      >
        <button
          onClick={() => setIsFlipped((p) => !p)}
          className="absolute inset-0 [transform-style:preserve-3d]"
        >
          <div
            className={`relative h-full w-full transition-transform duration-700 [transform-style:preserve-3d] ${
              isFlipped ? "[transform:rotateY(180deg)]" : ""
            }`}
          >
            <TataNeuExactFront />
            <TataNeuBack />
          </div>
        </button>
      </div>
    </div>
  );
}

const CARD_COUNT = 3;
const AUTO_SCROLL_INTERVAL = 3000;
const RESUME_DELAY = 5000;

const HoriCreadit = () => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const currentIndex = useRef(0);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!isMobile || userInteracted) return;

    const interval = setInterval(() => {
      const container = scrollRef.current;
      if (!container) return;

      currentIndex.current = (currentIndex.current + 1) % CARD_COUNT;
      const cardWidth = container.scrollWidth / CARD_COUNT;
      container.scrollTo({
        left: currentIndex.current * cardWidth,
        behavior: "smooth",
      });
    }, AUTO_SCROLL_INTERVAL);

    return () => clearInterval(interval);
  }, [isMobile, userInteracted]);

  const handleUserInteraction = () => {
    setUserInteracted(true);
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => {
      const container = scrollRef.current;
      if (container) {
        const cardWidth = container.scrollWidth / CARD_COUNT;
        currentIndex.current = Math.round(container.scrollLeft / cardWidth);
      }
      setUserInteracted(false);
    }, RESUME_DELAY);
  };

  return (
    <section className="rounded-[28px] border border-[#ece8ff] bg-[linear-gradient(180deg,#faf8ff_0%,#f4f0ff_100%)] p-4 shadow-[0_24px_60px_rgba(98,50,255,0.08)] sm:p-5">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <p className="mt-1 text-sm text-[#5f5a72]">
            Tilt on hover and tap any card to preview the back.
          </p>
        </div>
      </div>

      <div
        ref={scrollRef}
        onTouchStart={handleUserInteraction}
        onScroll={handleUserInteraction}
        className="overflow-x-auto overflow-y-visible pb-20 pt-20 px-2 hide-scrollbar scroll-smooth"
      >
        <div className="flex align-middle sm:justify-center snap-x snap-mandatory gap-5">
          <div className="snap-center shrink-0">
            <ZetCard />
          </div>
          <div className="snap-center shrink-0">
            <NovioCard />
          </div>
          <div className="snap-center shrink-0">
            <IobCard />
          </div>
        </div>
      </div>

      <div className="flex justify-center -mt-14 mb-4">
        <Link
          href="/dashboard/credit-cards?card=4"
          className="inline-flex items-center gap-2 bg-[#6232FF] hover:bg-[#4f1fdb] text-white font-bold text-sm px-8 py-3 rounded-full shadow-[0_8px_24px_rgba(98,50,255,0.35)] hover:shadow-[0_12px_32px_rgba(98,50,255,0.45)] active:scale-[0.96] transition-all"
        >
          Apply FD Credit Card
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className="ml-1"
          >
            <path
              d="M3 8h10M9 4l4 4-4 4"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>
      </div>
    </section>
  );
};

export default HoriCreadit;
