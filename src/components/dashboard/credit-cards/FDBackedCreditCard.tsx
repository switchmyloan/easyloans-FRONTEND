"use client";

import Link from "next/link";
import { type TouchEvent, useEffect, useRef, useState } from "react";
import VanillaTilt from "vanilla-tilt";

type TiltElement = HTMLDivElement & {
  vanillaTilt?: {
    destroy: () => void;
  };
};

type FDBackedCreditCardProps = {
  cardholderName?: string;
};

function getDisplayCardholderName(cardholderName?: string) {
  const normalizedName = cardholderName?.replace(/\s+/g, " ").trim();
  return normalizedName ? normalizedName.toUpperCase() : "CARD HOLDER";
}

export function useTiltCard() {
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

export function LegacyPurpleCard({ cardholderName }: FDBackedCreditCardProps) {
  const tiltRef = useTiltCard();
  const [isFlipped, setIsFlipped] = useState(false);
  const cardNumberSections = ["5453", "2000", "0000", "0000"];
  const displayCardholderName = getDisplayCardholderName(cardholderName);

  return (
    <div className="relative flex items-center justify-center overflow-visible px-2 py-0">
      <div
        ref={tiltRef}
        className="relative z-10 aspect-[468/292] w-full max-w-[468px] will-change-transform [transform-style:preserve-3d]"
      >
        <button
          type="button"
          onClick={() => setIsFlipped((prev) => !prev)}
          className="absolute inset-0 block cursor-pointer [transform-style:preserve-3d]"
        >
          <div
            className={`relative h-full w-full transition-transform duration-700 [transform-style:preserve-3d] ${
              isFlipped ? "[transform:rotateY(180deg)]" : ""
            }`}
          >
            {/* FRONT */}
            <div className="absolute inset-0 overflow-hidden rounded-[18px] bg-[linear-gradient(90deg,#111,#555)] text-white shadow-[0_20px_60px_rgba(0,0,0,0.3)] [backface-visibility:hidden] after:absolute after:inset-0 after:-z-10 after:rounded-[18px] after:bg-[#23194a] after:shadow-[0_20px_70px_-10px_rgba(35,25,74,0.7),0_50px_100px_0_rgba(35,25,74,0.2)] after:[transform:translateZ(-50px)]">
              {/* Right purple shapes */}
              <div className="absolute right-[-58px] top-0 h-full w-[200px] -skew-x-[15deg] bg-[linear-gradient(180deg,#7a55ff,#4f22e8)] shadow-[0_0_12px_rgba(98,50,255,0.35)]" />
              <div className="absolute right-[-48px] top-0 h-full w-[180px] skew-x-[20deg] bg-[linear-gradient(180deg,#8c6bff,#6232ff)] shadow-[0_0_12px_rgba(98,50,255,0.28)]" />

              {/* HDFC LOGO BADGE */}
              <div
                className="absolute left-6 top-6"
                style={{ transform: "translateZ(50px)" }}
              >
                <div className="flex h-10 items-center gap-2 rounded-[2px] border border-white bg-[#0f3d88] px-2 shadow-[0_4px_10px_rgba(0,0,0,0.15)]">
                  <div className="relative h-6 w-6 bg-white">
                    <div className="absolute left-[2px] top-[2px] h-[6px] w-[6px] bg-[#e0292d]" />
                    <div className="absolute bottom-[2px] left-[2px] h-[6px] w-[6px] bg-[#e0292d]" />
                    <div className="absolute left-[8px] top-[2px] h-[8px] w-[8px] border-[2px] border-[#0f3d88]" />
                    <div className="absolute left-[8px] top-[8px] h-[8px] w-[8px] border-[2px] border-[#0f3d88]" />
                  </div>
                  <span className="text-[11px] font-bold tracking-[0.08em] text-white">
                    HDFC BANK
                  </span>
                </div>
              </div>

              {/* Chip */}
              <div
                className="absolute left-6 top-[82px] flex h-10 w-[52px] items-center justify-center overflow-hidden rounded-md bg-[linear-gradient(135deg,#ffecc7,#d0b978)]"
                style={{ transform: "translateZ(70px)" }}
              >
                <span className="absolute left-0 top-[13px] h-px w-full bg-[#333]" />
                <span className="absolute left-0 top-[20px] h-px w-full bg-[#333]" />
                <span className="absolute left-0 top-[28px] h-px w-full bg-[#333]" />
                <span className="absolute left-[25px] top-0 h-[50px] w-px bg-[#333]" />
                <span className="relative z-10 h-[25px] w-5 rounded-[3px] border border-[#333] bg-[linear-gradient(135deg,#efdbab,#e1cb94)]" />
              </div>

              {/* Contactless */}
              <svg
                className="absolute left-[102px] top-[58px]"
                width="27"
                height="39"
                viewBox="0 3.71 26.959 38.787"
                fill="white"
                style={{ transform: "translateZ(52px)" }}
              >
                <path d="M19.709 3.719c.266.043.5.187.656.406 4.125 5.207 6.594 11.781 6.594 18.938 0 7.156-2.469 13.73-6.594 18.937-.195.336-.57.531-.957.492a.9946.9946 0 0 1-.851-.66c-.129-.367-.035-.777.246-1.051 3.855-4.867 6.156-11.023 6.156-17.718 0-6.696-2.301-12.852-6.156-17.719-.262-.317-.301-.762-.102-1.121.204-.36.602-.559 1.008-.504z" />
                <path d="M13.74 7.563c.231.039.442.164.594.343 3.508 4.059 5.625 9.371 5.625 15.157 0 5.785-2.113 11.097-5.625 15.156-.363.422-1 .472-1.422.109-.422-.363-.472-1-.109-1.422 3.211-3.711 5.156-8.551 5.156-13.843 0-5.293-1.949-10.133-5.156-13.844-.27-.309-.324-.75-.141-1.114.188-.367.578-.582.985-.542h.093z" />
              </svg>

              {/* Card Number */}
              <div
                className="absolute left-6 right-6 top-[150px] flex justify-between text-[24px] tracking-[0.18em]"
                style={{ transform: "translateZ(54px) scale(0.88)" }}
              >
                {cardNumberSections.map((section, index) => (
                  <span key={index} className="font-mono">
                    {section}
                  </span>
                ))}
              </div>

              {/* Expiry */}
              <div
                className="absolute left-6 top-[190px] font-mono uppercase"
                style={{ transform: "translateZ(50px)" }}
              >
                <span className="text-[9px] text-white/75">exp. end:</span>
                <div className="text-base">11/22</div>
              </div>

              {/* Name */}
              <div
                className="absolute bottom-3 left-6 font-mono text-[13px] uppercase tracking-[0.14em]"
                style={{ transform: "translateZ(50px)" }}
              >
                {displayCardholderName}
              </div>

              {/* Mastercard */}
              <div
                className="absolute bottom-5 right-5 flex"
                style={{ transform: "translateZ(72px)" }}
              >
                <span className="h-7 w-7 rounded-full bg-[#eb001b]" />
                <span className="-ml-2.5 h-7 w-7 rounded-full bg-[rgba(255,209,0,0.72)]" />
              </div>
            </div>

            {/* BACK */}
            <div className="absolute inset-0 overflow-hidden rounded-[18px] bg-[linear-gradient(180deg,#1a1a1d,#3a3a42)] text-white [backface-visibility:hidden] [transform:rotateY(180deg)]">
              <div className="absolute left-0 top-8 h-12 w-full bg-black" />
              <div className="absolute left-[5%] top-[106px] h-9 w-[90%] rounded bg-white">
                <span className="absolute right-3 top-[9px] font-mono text-black">
                  123
                </span>
              </div>
              <div className="absolute left-[5%] top-[90px] text-[10px] uppercase text-white/80">
                CVV
              </div>
              <div className="absolute bottom-6 left-5 right-5 text-[10px] text-white/70">
                Tap again to return to the front.
              </div>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}

export function BizFirstCard() {
  const tiltRef = useTiltCard();
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="flex items-center justify-center overflow-visible px-2 py-0">
      <div
        ref={tiltRef}
        className="relative aspect-[468/292] w-full max-w-[468px] will-change-transform [transform-style:preserve-3d]"
      >
        <button
          type="button"
          onClick={() => setIsFlipped((prev) => !prev)}
          className="absolute inset-0 block cursor-pointer [transform-style:preserve-3d]"
          aria-label="Flip HDFC BizFirst credit card"
        >
          <div
            className={`relative h-full w-full transition-transform duration-700 [transform-style:preserve-3d] ${isFlipped ? "[transform:rotateY(180deg)]" : ""}`}
          >
            <div className="absolute inset-0 overflow-hidden rounded-[22px] bg-[linear-gradient(180deg,#22a1d6_0%,#66bbea_36%,#a9daf7_100%)] shadow-[0_16px_34px_rgba(0,0,0,0.26)] [backface-visibility:hidden]">
              <div className="absolute left-0 top-[112px] h-[92px] w-[92px] rotate-45 bg-[linear-gradient(180deg,#0b74b6,#075688)]" />
              <div className="absolute left-[44px] top-[38px] h-[40px] w-[40px] rotate-45 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.04))]" />
              <div className="absolute left-[92px] top-[36px] h-[160px] w-[160px] rotate-45 bg-[linear-gradient(180deg,rgba(120,211,255,0.9),rgba(61,153,221,0.38))]" />
              <div className="absolute left-[126px] top-[76px] h-[214px] w-[214px] rotate-45 bg-[linear-gradient(180deg,rgba(117,213,255,0.06),#0076b8_76%)]" />
              <div className="absolute left-[34px] top-[144px] h-[160px] w-[160px] rotate-45 border-l-[26px] border-t-[26px] border-l-[#d8f0ff] border-t-[#d8f0ff] opacity-95" />

              <div
                className="absolute left-4 top-4"
                style={{ transform: "translateZ(44px)" }}
              >
                <div className="flex h-11 items-center gap-2 rounded-[2px] border-2 border-white bg-[#0f3d88] px-2 shadow-[0_4px_10px_rgba(0,0,0,0.12)]">
                  <div className="relative h-7 w-7 bg-white">
                    <div className="absolute left-[3px] top-[3px] h-[9px] w-[9px] bg-[#e0292d]" />
                    <div className="absolute bottom-[3px] left-[3px] h-[9px] w-[9px] bg-[#e0292d]" />
                    <div className="absolute left-[14px] top-[3px] h-[10px] w-[10px] border-[3px] border-[#0f3d88]" />
                    <div className="absolute left-[14px] top-[14px] h-[10px] w-[10px] border-[3px] border-[#0f3d88]" />
                  </div>
                  <span className="text-[11px] font-bold tracking-[0.08em] text-white sm:text-[16px]">
                    HDFC BANK
                  </span>
                </div>
              </div>

              <div
                className="absolute right-5 top-4 text-white"
                style={{ transform: "translateZ(44px)" }}
              >
                <span className="text-[33px] font-extrabold leading-none tracking-[-0.06em]">
                  Biz
                </span>
                <span className="ml-1 text-[33px] font-light leading-none tracking-[-0.02em]">
                  First
                </span>
              </div>

              <div
                className="absolute left-[42px] top-[97px]"
                style={{ transform: "translateZ(56px)" }}
              >
                <div className="relative h-[52px] w-[72px] rounded-[11px] bg-[linear-gradient(180deg,#f5de9a,#bb9843)] shadow-[inset_0_1px_3px_rgba(255,255,255,0.55),0_4px_8px_rgba(0,0,0,0.12)]">
                  <span className="absolute left-[7px] top-[12px] h-[2px] w-[18px] rounded bg-[#b28721]" />
                  <span className="absolute left-[7px] top-[25px] h-[2px] w-[18px] rounded bg-[#b28721]" />
                  <span className="absolute left-[7px] top-[38px] h-[2px] w-[18px] rounded bg-[#b28721]" />
                  <span className="absolute left-[24px] top-[3px] h-[46px] w-[26px] rounded-[7px] border-2 border-[#b28721]" />
                  <span className="absolute right-[7px] top-[12px] h-[2px] w-[15px] rounded bg-[#b28721]" />
                  <span className="absolute right-[7px] top-[25px] h-[2px] w-[15px] rounded bg-[#b28721]" />
                  <span className="absolute right-[7px] top-[38px] h-[2px] w-[15px] rounded bg-[#b28721]" />
                </div>
              </div>

              <div
                className="absolute right-5 top-[122px] flex items-center gap-2"
                style={{ transform: "translateZ(56px)" }}
              >
                <div className="relative h-5 w-7">
                  <span className="absolute left-0 top-[2px] h-0 w-0 border-b-[8px] border-l-0 border-r-[12px] border-t-[8px] border-b-transparent border-r-[#f19a1c] border-t-transparent" />
                  <span className="absolute left-[10px] top-[2px] h-0 w-0 border-b-[8px] border-l-[12px] border-r-0 border-t-[8px] border-b-transparent border-l-[#1a9b5b] border-t-transparent" />
                </div>
                <div className="flex items-center gap-[4px]">
                  <span className="h-4 w-4 rotate-45 rounded-full border-[3px] border-b-transparent border-l-transparent border-[#fbfdff]" />
                  <span className="h-6 w-6 rotate-45 rounded-full border-[3px] border-b-transparent border-l-transparent border-[#fbfdff]" />
                  <span className="h-8 w-8 rotate-45 rounded-full border-[3px] border-b-transparent border-l-transparent border-[#fbfdff]" />
                </div>
              </div>

              <div
                className="absolute bottom-[16px] right-4 flex flex-col items-end text-white"
                style={{ transform: "translateZ(48px)" }}
              >
                <div className="flex items-end gap-1">
                  <span className="text-[33px] font-extrabold italic leading-none tracking-[-0.06em]">
                    RuPay
                  </span>
                  <div className="relative mb-[5px] h-6 w-6">
                    <span className="absolute left-0 top-[2px] h-0 w-0 border-b-[10px] border-l-0 border-r-[14px] border-t-[10px] border-b-transparent border-r-[#f19a1c] border-t-transparent" />
                    <span className="absolute left-[10px] top-[2px] h-0 w-0 border-b-[10px] border-l-[14px] border-r-0 border-t-[10px] border-b-transparent border-l-[#1a9b5b] border-t-transparent" />
                  </div>
                </div>
                <span className="-mt-0.5 text-[20px] font-light italic leading-none tracking-[-0.02em]">
                  CREDIT
                </span>
              </div>
            </div>

            <div className="absolute inset-0 overflow-hidden rounded-[22px] bg-[linear-gradient(180deg,#4ba6db,#96d4f6)] text-white shadow-[0_16px_34px_rgba(0,0,0,0.2)] [backface-visibility:hidden] [transform:rotateY(180deg)]">
              <div className="absolute left-0 top-8 h-12 w-full bg-[#17436d]" />
              <div className="absolute right-5 top-[94px] text-[10px] uppercase tracking-[0.18em] text-white/85">
                CVV
              </div>
              <div className="absolute left-[8%] top-[108px] h-9 w-[84%] rounded bg-white/95">
                <span className="absolute right-3 top-[9px] font-mono text-sm tracking-[0.18em] text-[#17436d]">
                  421
                </span>
              </div>
              <div className="absolute bottom-6 left-5 right-5 text-[10px] leading-relaxed text-[#11476f]/80">
                Tap again to return to the front.
              </div>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}

export function IndianOilVisaCard({ cardholderName }: FDBackedCreditCardProps) {
  const tiltRef = useTiltCard();
  const [isFlipped, setIsFlipped] = useState(false);
  const cardNumberSections = ["4341", "6834", "5678", "9010"];
  const displayCardholderName = getDisplayCardholderName(cardholderName);

  return (
    <div className="flex items-center justify-center overflow-visible px-2 py-0">
      <div
        ref={tiltRef}
        className="relative aspect-[468/292] w-full max-w-[468px] will-change-transform [transform-style:preserve-3d]"
      >
        <button
          type="button"
          onClick={() => setIsFlipped((prev) => !prev)}
          className="absolute inset-0 block cursor-pointer [transform-style:preserve-3d]"
          aria-label="Flip IndianOil HDFC Visa credit card"
        >
          <div
            className={`relative h-full w-full transition-transform duration-700 [transform-style:preserve-3d] ${isFlipped ? "[transform:rotateY(180deg)]" : ""}`}
          >
            <div className="absolute inset-0 overflow-hidden rounded-[18px] bg-[linear-gradient(90deg,#be7522_0%,#edb565_38%,#f7dfbf_64%,#efb462_100%)] shadow-[0_16px_34px_rgba(0,0,0,0.24)] [backface-visibility:hidden]">
              <div className="absolute right-[86px] top-[-22px] h-[310px] w-[94px] rounded-[50%] bg-[linear-gradient(180deg,rgba(255,255,255,0.94),#f7e5a5_18%,#a96509_38%,#f4d076_54%,#fff7d6_72%,#a56209_100%)] blur-[0.2px]" />
              <div className="absolute right-[110px] top-[-34px] h-[330px] w-[42px] rounded-[50%] bg-[linear-gradient(180deg,#fff8dc,#ad6609_28%,#f4d076_52%,#fff3cb_70%,#a45f0a_100%)]" />
              <div className="absolute right-[138px] top-[-22px] h-[304px] w-[18px] rounded-[50%] bg-[linear-gradient(180deg,#fef6d9,#b06d0f_40%,#f2cd72_72%,#fff7df_100%)]" />

              <div
                className="absolute left-5 top-4"
                style={{ transform: "translateZ(42px)" }}
              >
                <div className="flex h-9 items-center gap-1.5 rounded-[2px] border border-[#8e9ec7] bg-[#112f78] px-2">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[linear-gradient(180deg,#f6901e,#f26522)]">
                    <div className="h-2.5 w-2.5 rounded-full border border-white bg-[#1b4fa3]" />
                  </div>
                  <span className="text-[11px] font-bold tracking-[0.02em] text-white">
                    IndianOil
                  </span>
                </div>
              </div>

              <div
                className="absolute right-5 top-4"
                style={{ transform: "translateZ(42px)" }}
              >
                <div className="flex h-9 items-center gap-1.5 rounded-[2px] border border-[#8e9ec7] bg-[#0f68b4] px-2">
                  <div className="relative h-5 w-5 bg-white">
                    <div className="absolute left-[2px] top-[2px] h-[6px] w-[6px] bg-[#e0292d]" />
                    <div className="absolute bottom-[2px] left-[2px] h-[6px] w-[6px] bg-[#e0292d]" />
                    <div className="absolute left-[9px] top-[2px] h-[8px] w-[8px] border-[2px] border-[#0f68b4]" />
                    <div className="absolute left-[9px] top-[10px] h-[8px] w-[8px] border-[2px] border-[#0f68b4]" />
                  </div>
                  <span className="text-[11px] font-bold tracking-[0.04em] text-white">
                    HDFC BANK
                  </span>
                </div>
              </div>

              <div
                className="absolute left-[42px] top-[92px]"
                style={{ transform: "translateZ(52px)" }}
              >
                <div className="relative h-[56px] w-[78px] rounded-[8px] bg-[linear-gradient(180deg,#f8e2a2,#e1a71b)] shadow-[inset_0_1px_4px_rgba(255,255,255,0.65),0_4px_8px_rgba(0,0,0,0.12)]">
                  <span className="absolute left-[6px] top-[14px] h-[2px] w-[16px] rounded bg-[#c78b15]" />
                  <span className="absolute left-[6px] top-[27px] h-[2px] w-[16px] rounded bg-[#c78b15]" />
                  <span className="absolute left-[6px] top-[40px] h-[2px] w-[16px] rounded bg-[#c78b15]" />
                  <span className="absolute left-[22px] top-[4px] h-[48px] w-[34px] rounded-[6px] border-2 border-[#c78b15]" />
                  <span className="absolute right-[6px] top-[14px] h-[2px] w-[14px] rounded bg-[#c78b15]" />
                  <span className="absolute right-[6px] top-[27px] h-[2px] w-[14px] rounded bg-[#c78b15]" />
                  <span className="absolute right-[6px] top-[40px] h-[2px] w-[14px] rounded bg-[#c78b15]" />
                </div>
              </div>

              <div
                className="absolute right-8 top-[102px] flex items-center gap-[5px]"
                style={{ transform: "translateZ(48px)" }}
              >
                <span className="h-4 w-4 rotate-45 rounded-full border-[3px] border-b-transparent border-l-transparent border-[#111827]" />
                <span className="h-6 w-6 rotate-45 rounded-full border-[3px] border-b-transparent border-l-transparent border-[#111827]" />
                <span className="h-8 w-8 rotate-45 rounded-full border-[3px] border-b-transparent border-l-transparent border-[#111827]" />
              </div>

              <div
                className="absolute left-10 right-8 top-[165px] flex items-center justify-between font-mono text-[18px] tracking-[0.14em] text-[#141414]"
                style={{ transform: "translateZ(54px)" }}
              >
                {cardNumberSections.map((section) => (
                  <span key={section}>{section}</span>
                ))}
              </div>

              <div
                className="absolute left-10 top-[208px] flex gap-12 text-[#191919]"
                style={{ transform: "translateZ(42px)" }}
              >
                <div className="font-mono">
                  <div className="text-[8px] uppercase leading-none tracking-[0.08em]">
                    valid
                  </div>
                  <div className="mt-1 text-[9px] uppercase leading-none tracking-[0.08em]">
                    thru
                  </div>
                  <div className="mt-1 text-[12px] font-semibold leading-none">
                    08/22
                  </div>
                </div>
              </div>

              <div
                className="absolute bottom-6 left-10 text-[12px] font-semibold uppercase tracking-[0.04em] text-[#191919]"
                style={{ transform: "translateZ(42px)" }}
              >
                {displayCardholderName}
              </div>

              <div
                className="absolute bottom-[28px] right-5 flex flex-col items-end text-[#1351b4]"
                style={{ transform: "translateZ(50px)" }}
              >
                <span className="text-[44px] font-black italic leading-none tracking-[-0.08em]">
                  VISA
                </span>
                <span className="-mt-1 text-[18px] font-medium leading-none tracking-[-0.04em]">
                  Platinum
                </span>
              </div>
            </div>

            <div className="absolute inset-0 overflow-hidden rounded-[18px] bg-[linear-gradient(180deg,#b06b21,#f0bb73)] text-white shadow-[0_16px_34px_rgba(0,0,0,0.2)] [backface-visibility:hidden] [transform:rotateY(180deg)]">
              <div className="absolute left-0 top-8 h-12 w-full bg-[#4b2a0b]" />
              <div className="absolute left-[8%] top-[108px] h-9 w-[84%] rounded bg-white/95">
                <span className="absolute right-3 top-[9px] font-mono text-sm tracking-[0.18em] text-[#4b2a0b]">
                  874
                </span>
              </div>
              <div className="absolute right-8 top-[92px] text-[10px] uppercase tracking-[0.18em] text-white/85">
                CVV
              </div>
              <div className="absolute bottom-6 left-5 right-5 text-[10px] leading-relaxed text-[#4b2a0b]/80">
                Tap again to return to the front.
              </div>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}

export function SwiggyHdfcCard({ cardholderName }: FDBackedCreditCardProps) {
  const tiltRef = useTiltCard();
  const [isFlipped, setIsFlipped] = useState(false);
  const displayCardholderName = getDisplayCardholderName(cardholderName);

  return (
    <div className="flex items-center justify-center overflow-visible px-2 py-0">
      <div
        ref={tiltRef}
        className="relative aspect-[468/292] w-full max-w-[468px] will-change-transform [transform-style:preserve-3d]"
      >
        <button
          type="button"
          onClick={() => setIsFlipped((prev) => !prev)}
          className="absolute inset-0 block cursor-pointer [transform-style:preserve-3d]"
          aria-label="Flip Swiggy HDFC credit card"
        >
          <div
            className={`relative h-full w-full transition-transform duration-700 [transform-style:preserve-3d] ${isFlipped ? "[transform:rotateY(180deg)]" : ""}`}
          >
            <div className="absolute inset-0 overflow-hidden rounded-[18px] bg-[radial-gradient(circle_at_18%_42%,#ffcc42_0%,#ff8f1f_21%,#ff6e26_36%,#9c2a8b_68%,#0f55a4_100%)] shadow-[0_16px_34px_rgba(0,0,0,0.22)] [backface-visibility:hidden]">
              <div
                className="absolute left-6 top-5 flex items-center gap-2 text-white"
                style={{ transform: "translateZ(42px)" }}
              >
                <div className="relative h-7 w-7">
                  <div className="absolute left-0 top-0 h-7 w-7 rounded-full bg-white" />
                  <div className="absolute left-[9px] top-[5px] h-5 w-2 rounded-full bg-[#f97316]" />
                  <div className="absolute left-[6px] top-[4px] h-2 w-4 rounded-t-full border-t-[4px] border-[#f97316]" />
                </div>
                <span className="text-[18px] font-bold tracking-[0.12em]">
                  SWIGGY
                </span>
              </div>

              <div
                className="absolute right-5 top-5"
                style={{ transform: "translateZ(42px)" }}
              >
                <div className="flex h-9 items-center gap-1.5 rounded-[2px] border border-[#8e9ec7] bg-[#0f68b4] px-2">
                  <div className="relative h-5 w-5 bg-white">
                    <div className="absolute left-[2px] top-[2px] h-[6px] w-[6px] bg-[#e0292d]" />
                    <div className="absolute bottom-[2px] left-[2px] h-[6px] w-[6px] bg-[#e0292d]" />
                    <div className="absolute left-[9px] top-[2px] h-[8px] w-[8px] border-[2px] border-[#0f68b4]" />
                    <div className="absolute left-[9px] top-[10px] h-[8px] w-[8px] border-[2px] border-[#0f68b4]" />
                  </div>
                  <span className="text-[11px] font-bold tracking-[0.04em] text-white">
                    HDFC BANK
                  </span>
                </div>
              </div>

              <div
                className="absolute left-[52px] top-[96px]"
                style={{ transform: "translateZ(52px)" }}
              >
                <div className="relative h-[48px] w-[74px] rounded-[8px] bg-[linear-gradient(180deg,#f7d987,#e5a92a)] shadow-[inset_0_1px_4px_rgba(255,255,255,0.55),0_4px_8px_rgba(0,0,0,0.1)]">
                  <span className="absolute left-[6px] top-[12px] h-[2px] w-[14px] rounded bg-[#bf8a18]" />
                  <span className="absolute left-[6px] top-[23px] h-[2px] w-[14px] rounded bg-[#bf8a18]" />
                  <span className="absolute left-[6px] top-[34px] h-[2px] w-[14px] rounded bg-[#bf8a18]" />
                  <span className="absolute left-[20px] top-[4px] h-[40px] w-[34px] rounded-[6px] border-2 border-[#bf8a18]" />
                  <span className="absolute right-[6px] top-[12px] h-[2px] w-[14px] rounded bg-[#bf8a18]" />
                  <span className="absolute right-[6px] top-[23px] h-[2px] w-[14px] rounded bg-[#bf8a18]" />
                  <span className="absolute right-[6px] top-[34px] h-[2px] w-[14px] rounded bg-[#bf8a18]" />
                </div>
              </div>

              <div
                className="absolute left-[138px] top-[102px] flex items-center gap-[4px]"
                style={{ transform: "translateZ(48px)" }}
              >
                <span className="h-4 w-4 rotate-45 rounded-full border-[3px] border-b-transparent border-l-transparent border-white" />
                <span className="h-5 w-5 rotate-45 rounded-full border-[3px] border-b-transparent border-l-transparent border-white" />
                <span className="h-6 w-6 rotate-45 rounded-full border-[3px] border-b-transparent border-l-transparent border-white" />
              </div>

              <div
                className="absolute bottom-10 left-6 text-[20px] font-semibold uppercase tracking-[0.05em] text-white"
                style={{ transform: "translateZ(42px)" }}
              >
                {displayCardholderName}
              </div>

              <div
                className="absolute bottom-6 right-6 flex"
                style={{ transform: "translateZ(52px)" }}
              >
                <span className="h-14 w-14 rounded-full bg-[#eb2a3c]/95" />
                <span className="-ml-5 h-14 w-14 rounded-full bg-[#ffad38]/95" />
              </div>
            </div>

            <div className="absolute inset-0 overflow-hidden rounded-[18px] bg-[linear-gradient(180deg,#fb7b23,#8d2b8d_70%,#124f9e)] text-white shadow-[0_16px_34px_rgba(0,0,0,0.2)] [backface-visibility:hidden] [transform:rotateY(180deg)]">
              <div className="absolute left-0 top-8 h-12 w-full bg-[#1b1b1b]" />
              <div className="absolute right-8 top-[92px] text-[10px] uppercase tracking-[0.18em] text-white/85">
                CVV
              </div>
              <div className="absolute left-[8%] top-[108px] h-9 w-[84%] rounded bg-white/95">
                <span className="absolute right-3 top-[9px] font-mono text-sm tracking-[0.18em] text-[#23194a]">
                  552
                </span>
              </div>
              <div className="absolute bottom-6 left-5 right-5 text-[10px] leading-relaxed text-white/80">
                Tap again to return to the front.
              </div>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}

export function MarriottHdfcCard() {
  const tiltRef = useTiltCard();
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="flex items-center justify-center overflow-visible px-2 py-0">
      <div
        ref={tiltRef}
        className="relative aspect-[468/292] w-full max-w-[468px] [transform-style:preserve-3d]"
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
            {/* FRONT */}
            <div className="absolute inset-0 overflow-hidden rounded-[18px] bg-black text-[#d4af37] shadow-[0_16px_34px_rgba(0,0,0,0.4)] [backface-visibility:hidden]">
              <div className="absolute left-0 top-0 h-[6px] w-full bg-[#f4a261]" />

              <div
                className="absolute left-6 top-6"
                style={{ transform: "translateZ(40px)" }}
              >
                <p className="text-[12px] tracking-[0.25em] text-[#d4af37]/80">
                  MARRIOTT
                </p>
                <p className="text-[20px] font-semibold">BONVOY</p>
              </div>

              <div
                className="absolute right-6 top-6 border border-[#d4af37] px-3 py-1 text-[12px]"
                style={{ transform: "translateZ(40px)" }}
              >
                HDFC BANK
              </div>

              <div
                className="absolute left-[52px] top-[110px]"
                style={{ transform: "translateZ(50px)" }}
              >
                <div className="h-[48px] w-[74px] rounded-[8px] bg-[linear-gradient(180deg,#f7d987,#e5a92a)] shadow-inner" />
              </div>

              <div
                className="absolute right-[60px] top-[120px]"
                style={{ transform: "translateZ(50px)" }}
              >
                <svg width="30" height="20">
                  <path
                    d="M2 10a7 7 0 0 1 0-7"
                    stroke="#d4af37"
                    strokeWidth="2"
                    fill="none"
                  />
                  <path
                    d="M10 10a11 11 0 0 1 0-11"
                    stroke="#d4af37"
                    strokeWidth="2"
                    fill="none"
                  />
                  <path
                    d="M18 10a15 15 0 0 1 0-15"
                    stroke="#d4af37"
                    strokeWidth="2"
                    fill="none"
                  />
                </svg>
              </div>

              <div
                className="absolute bottom-8 right-8 flex items-center gap-3"
                style={{ transform: "translateZ(50px)" }}
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#d4af37]">
                  <div className="h-5 w-[3px] bg-[#d4af37]" />
                </div>
                <div>
                  <p className="text-[16px]">Diners Club</p>
                  <p className="text-[10px] text-[#d4af37]/70">INTERNATIONAL</p>
                </div>
              </div>
            </div>

            {/* BACK */}
            <div className="absolute inset-0 overflow-hidden rounded-[18px] bg-black text-[#d4af37] shadow-[0_16px_34px_rgba(0,0,0,0.3)] [backface-visibility:hidden] [transform:rotateY(180deg)]">
              <div className="absolute left-0 top-0 h-[6px] w-full bg-[#f4a261]" />
              <div className="absolute left-0 top-10 h-12 w-full bg-[#111]" />
              <div className="absolute right-8 top-[90px] text-[10px] uppercase tracking-widest">
                CVV
              </div>
              <div className="absolute left-[8%] top-[110px] h-9 w-[84%] rounded bg-white">
                <span className="absolute right-3 top-[8px] font-mono text-black">
                  123
                </span>
              </div>
              <div className="absolute bottom-6 left-6 right-6 text-[10px] text-[#d4af37]/70">
                Tap again to flip.
              </div>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}

export default function FDBackedCreditCard({
  cardholderName,
}: FDBackedCreditCardProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const touchStartXRef = useRef<number | null>(null);
  const [userInteracted, setUserInteracted] = useState(false);
  const resumeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cards = [
    { id: "bizfirst", element: <BizFirstCard /> },
    {
      id: "legacy",
      element: <LegacyPurpleCard cardholderName={cardholderName} />,
    },
    {
      id: "indianoil",
      element: <IndianOilVisaCard cardholderName={cardholderName} />,
    },
    {
      id: "swiggy",
      element: <SwiggyHdfcCard cardholderName={cardholderName} />,
    },
    { id: "marriott", element: <MarriottHdfcCard /> },
  ];

  const totalCards = cards.length;

  const pauseAutoScroll = () => {
    setUserInteracted(true);
    if (resumeTimer.current) clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => setUserInteracted(false), 5000);
  };

  const goToCard = (index: number) => {
    pauseAutoScroll();
    setActiveIndex((index + totalCards) % totalCards);
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 639px)");
    const syncViewport = () => setIsMobile(mediaQuery.matches);
    syncViewport();
    mediaQuery.addEventListener("change", syncViewport);
    return () => mediaQuery.removeEventListener("change", syncViewport);
  }, []);

  useEffect(() => {
    if (userInteracted) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % totalCards);
    }, 3000);
    return () => clearInterval(interval);
  }, [userInteracted, totalCards]);

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStartXRef.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const startX = touchStartXRef.current;
    const endX = event.changedTouches[0]?.clientX ?? null;
    touchStartXRef.current = null;

    if (startX === null || endX === null) return;
    const deltaX = endX - startX;
    if (Math.abs(deltaX) < 40) return;

    pauseAutoScroll();
    if (deltaX < 0) {
      goToCard(activeIndex + 1);
    } else {
      goToCard(activeIndex - 1);
    }
  };

  return (
    <div className="mt-4 overflow-hidden rounded-[36px] border border-gray-100 bg-[linear-gradient(180deg,#ffffff_0%,#f5f7ff_100%)] px-4 py-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] sm:px-6 sm:py-8">
      <div className="mb-4 text-center">
        <p className="text-sm font-medium text-gray-700">
          Cards for every occasion
        </p>
        <p className="mt-1 text-xs text-gray-500 sm:text-sm">
          Tap the focused card to flip it. Swipe or use the arrows to move
          between options.
        </p>
      </div>

      <div
        className="relative h-[245px] overflow-hidden sm:h-[390px] lg:h-[420px]"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="pointer-events-none absolute inset-x-[8%] top-[18%] h-[56%] rounded-full bg-[radial-gradient(circle,rgba(98,50,255,0.14)_0%,rgba(98,50,255,0.04)_45%,transparent_75%)] blur-3xl" />

        {cards.map((card, index) => {
          const offset = index - activeIndex;
          const distance = Math.abs(offset);
          const scale = offset === 0 ? 1 : distance === 1 ? 0.84 : 0.72;
          const opacity = offset === 0 ? 1 : distance === 1 ? 0.68 : 0.32;
          const zIndex = 30 - distance;
          const translateX = isMobile ? 0 : offset * 120;

          return (
            <div
              key={card.id}
              className="absolute left-1/2 top-1/2 w-[90%] max-w-[468px] transition-all duration-500 ease-out sm:w-[70%]"
              style={{
                transform: `translate(-50%, -50%) translateX(${translateX}px) scale(${scale})`,
                opacity,
                zIndex,
                pointerEvents: offset === 0 ? "auto" : "none",
              }}
            >
              {card.element}
            </div>
          );
        })}
      </div>

      {/* Navigation Dots */}
      <div className="mt-4 flex justify-center gap-2">
        {cards.map((_, index) => (
          <button
            key={index}
            onClick={() => goToCard(index)}
            className={`h-2 w-2 rounded-full transition-all ${
              index === activeIndex
                ? "w-6 bg-violet-600"
                : "bg-gray-300 hover:bg-gray-400"
            }`}
          />
        ))}
      </div>

      {/* Navigation Arrows */}
      <div className="mt-4 flex justify-center gap-4">
        <button
          onClick={() => goToCard(activeIndex - 1)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm transition-all hover:bg-gray-50"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
        <button
          onClick={() => goToCard(activeIndex + 1)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm transition-all hover:bg-gray-50"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
