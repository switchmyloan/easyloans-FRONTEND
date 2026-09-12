"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  Clock3,
  IndianRupee,
  TrendingUp,
} from "lucide-react";
import TrustedPartners from "./TrustedPartners";
import {
  GanpatiBadge,
  GanpatiHeadline,
  GanpatiMobileIntro,
} from "@/components/campaign/Ganpati";
import { isGanpatiCampaign } from "@/lib/campaign";




type Metric = {
  value: string;
  label: string;
  eyebrow?: string;
  icon: ReactNode;
};


const METRICS: Metric[] = [
  {
    value: "5 min",
    label: "Approval Time*",
    icon: <Clock3 className="h-6 w-6 stroke-2" />,
  },
  {
   
  eyebrow: "Up to",
  value: "₹2 Lakh",
  label: "Loan Amount",
  icon: <IndianRupee className="h-6 w-6 stroke-2" />,
  },
  {
    value: "0.83%",
    label: "Starting Rate*",
    icon: <TrendingUp className="h-6 w-6 stroke-2" />,
  },
];


const CARD_CLASS_NAME =
  "relative overflow-hidden rounded-xl border border-white/80 bg-white/20 backdrop-blur-xl shadow-[0_24px_80px_rgba(116,82,255,0.16)]";

export default function LeftPanel() {
  const [isHindi, setIsHindi] = useState(false);

  return (
    <aside className="relative w-full font-sans text-[#1b1e6b] lg:w-[50%] 2xl:w-[55%]">
      {/* Seasonal skin — renders nothing when the campaign is off. */}
      <GanpatiMobileIntro />
      {/* GanpatiDecor moved to page level for full-width positioning */}

      {/* Mobile Header Section */}
      <div className="relative lg:hidden px-4 pt-16 pb-2">
        {/* GanpatiMobileBackdrop is absolutely positioned at page top */}

        {/* Logo + Language Toggle Row */}
        <div className="relative flex items-center justify-center mb-4">
          <Link href="https://www.cready.in/" rel="noreferrer" target="_blank">
            <Image
              alt="Cready"
              className="h-8 w-auto"
              height={32}
              src="/cready.png"
              width={108}
            />
          </Link>
          <button
            onClick={() => setIsHindi(!isHindi)}
            className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center justify-center w-9 h-9 rounded-lg bg-white border border-gray-200 shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <span className="flex flex-col items-center leading-none">
              <span className="text-[10px]">अ</span>
              <span className="text-[10px]">A</span>
            </span>
          </button>
        </div>

        {/* Campaign badge — mobile has no headline, so the pill carries the theme */}
        {isGanpatiCampaign && (
          <div className="relative mb-3 flex justify-center">
            <GanpatiBadge />
          </div>
        )}

        {/* Trusted Partners for mobile */}
        <div className="relative">
          <TrustedPartners />
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="relative z-10 hidden lg:flex w-full items-center justify-center px-4 xl:px-6 xl:py-6 2xl:px-10 2xl:py-8 3xl:px-14 3xl:py-10">
        <div className="w-full max-w-104 2xl:max-w-120 3xl:max-w-140">
          {/* Logo - desktop only */}
          <Link
            className="mb-3 inline-flex xl:mb-4 2xl:mb-5"
            href="https://www.cready.in/"
            rel="noreferrer"
            target="_blank"
          >
            <Image
              alt="Cready"
              className="h-auto w-32 2xl:w-40 3xl:w-44"
              height={36}
              src="/cready.png"
              width={128}
            />
          </Link>

        <div className="space-y-3 2xl:space-y-4 3xl:space-y-5 [@media(max-height:900px)]:space-y-2">
            {/* Headline - desktop only. The campaign headline replaces it while
                the skin is on; with the campaign off this is the original. */}
            {isGanpatiCampaign ? (
              <GanpatiHeadline />
            ) : (
              <div className="space-y-2 text-left 2xl:space-y-3">
             <h2 className="text-2xl font-extrabold leading-[0.95] tracking-[-0.05em] text-[#161a6d] sm:text-[1.75rem] lg:max-w-104 lg:text-[3rem] xl:text-[3.5rem] 2xl:text-[4rem] 3xl:text-[5rem] [@media(max-height:900px)]:text-[1.85rem]">
                  <span className="block text-4xl">Small Loans</span>
                  <span className="block text-4xl bg-gradient-to-r from-[#8560ff] via-[#664cff] to-[#4d3cff] bg-clip-text text-transparent">
                    when you need them.
                  </span>
                </h2>
                <p className="max-w-72 text-gray-500 text-xs mb-4 2xl:text-sm 2xl:max-w-80 3xl:text-base 3xl:max-w-96">
                  Built around your moments.
                  <br />
                  Backed by trust. Driven by technology.
                </p>
              </div>
            )}



            <section className={CARD_CLASS_NAME}>
              <div className="relative grid grid-cols-3">
                {METRICS.map((metric, index) => (
                  <div
                    key={metric.label}
                    className="relative flex min-h-20 flex-col items-center px-3 py-3 text-center 2xl:min-h-24 2xl:px-4 2xl:py-4 3xl:min-h-28 3xl:px-5 3xl:py-5"
                  >
                    {/* Short Divider */}
                    {index !== METRICS.length - 1 && (
                      <div className="absolute right-0 top-1/2 h-14 w-px -translate-y-1/2 bg-[#e7defd] 2xl:h-16 3xl:h-20" />
                    )}

                    {/* Fixed Icon Area */}
                    <div className="flex h-6 w-6 items-center justify-center text-[#6b4cff] 2xl:h-7 2xl:w-7 3xl:h-8 3xl:w-8 [&_svg]:2xl:h-7 [&_svg]:2xl:w-7 [&_svg]:3xl:h-8 [&_svg]:3xl:w-8">
                      {metric.icon}
                    </div>

                    {/* Fixed Content Alignment */}
                    <div className="mt-2 flex flex-1 flex-col items-center justify-start 2xl:mt-3">
                      {metric.eyebrow ? (
                        <p className="mb-0.5 min-h-3.5 text-[10px] font-medium text-[#868eb0] 2xl:text-xs 3xl:text-sm">
                          {metric.eyebrow}
                        </p>
                      ) : (
                        <div className="mb-0.5 min-h-3.5" />
                      )}

                      <p className="text-sm lg:text-base font-semibold leading-none tracking-[-0.04em] text-[#4e35d3] 2xl:text-lg 3xl:text-xl">
                        {metric.value}
                      </p>

                      <p className="mt-1.5 text-[10px] font-medium text-[#8088ad] 2xl:text-xs 3xl:text-sm">
                        {metric.label}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <TrustedPartners />

            {/* Data safety notice - desktop only */}
            <div className="flex flex-row items-start gap-2 pl-1 text-left text-[#717aa2] 2xl:gap-3 2xl:pl-2">
              <div className="mt-0.5 text-[#6e4dff]">
                <ShieldCheck className="h-4 w-4 2xl:h-5 2xl:w-5 3xl:h-6 3xl:w-6" strokeWidth={2} />
              </div>
              <div className="text-[0.75rem] leading-[1.4] 2xl:text-sm 3xl:text-base">
                <p className="font-medium text-[#5d648f]">
                  Your data is safe with us.
                </p>
                <p>We never share your information.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

