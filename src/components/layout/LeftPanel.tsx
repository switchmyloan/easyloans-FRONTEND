"use client";

import Image from "next/image";
import Link from "next/link";

const STATS = [
  { value: "5 min", label: "Approval" },
  { value: "15L", label: "Upto Amount" },
  { value: "0.83%", label: "Starting Rate" },
];

const PARTNERS = [
  { src: "/hero.webp", alt: "Hero Fincorp" },
  { src: "/poonawalla.svg", alt: "Poonawalla" },
  { src: "/true.webp", alt: "Truebalance" },
  { src: "/olyv.png", alt: "Olyv" },
  { src: "/zype.png", alt: "Zype" },
  { src: "/kreditbee-logo.svg", alt: "KreditBee" },
  { src: "/moneyview-logo.svg", alt: "MoneyView" },
];

export default function LeftPanel() {
  const marqueePartners = [...PARTNERS, ...PARTNERS];

  return (
    <div className="hidden lg:flex lg:w-[52%] flex-col relative overflow-hidden sticky top-0 h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40">
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-[#6232FF]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-10 right-10 w-56 h-56 bg-[#A6FF00]/10 rounded-full blur-3xl" />

      <div className="relative z-10 flex flex-col h-full px-10 xl:px-16 py-10">
        <div className="mb-8">
          <Link href="https://www.cready.in/" target="_blank">
            <Image
              src="/cready.png"
              alt="Cready"
              width={128}
              height={36}
              className="h-9 w-auto"
            />
          </Link>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl xl:text-[28px] font-medium leading-snug text-gray-800 mb-2">
            Loans for <span className="text-[#6232FF] font-semibold">every Indian</span>,
            tailored to your journey.
          </h2>
          <p className="text-base text-gray-600 leading-snug">
            From gig workers to shop owners  we have got you covered.
          </p>
        </div>

        <div className="relative rounded-2xl overflow-hidden shadow-xl shadow-gray-200/60 border border-gray-100/80 mb-6 aspect-[3/2]">
          <Image
            src="/ttpublic.png"
            alt="Loans for gig workers, salaried, shop owners, self-employed and drivers"
            fill
            sizes="(min-width: 1280px) 42vw, 52vw"
            className="object-cover"
            priority
          />
          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur px-3 py-1.5 rounded-full shadow-md border border-gray-100 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-gray-800">10L+ approvals</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-gray-100/80 p-4 mb-5">
          <div className="grid grid-cols-3 gap-3">
            {STATS.map((s, i) => (
              <div
                key={s.label}
                className={`text-center ${i === 1 ? "border-x border-gray-100" : ""}`}
              >
                <div className="text-xl xl:text-2xl font-bold text-[#6232FF]">
                  {s.value}
                </div>
                <div className="text-[11px] text-gray-500 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-auto">
          <p className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold mb-3">
            Our lending partners
          </p>
          <div className="partner-marquee-mask">
            <div className="partner-marquee-track">
              {marqueePartners.map((logo, index) => (
                <div
                  key={`${logo.alt}-${index}`}
                  className="flex h-8 shrink-0 items-center justify-center rounded-full border border-gray-100 bg-white px-3 shadow-sm"
                  aria-hidden={index >= PARTNERS.length}
                >
                  <Image
                    src={logo.src}
                    alt={index < PARTNERS.length ? logo.alt : ""}
                    width={70}
                    height={20}
                    className="h-5 w-auto max-w-[70px] object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
