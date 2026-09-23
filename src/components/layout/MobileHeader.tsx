"use client";

import Image from "next/image";

export default function MobileHeader() {
  const lenders = [
    // { src: "/ramfinCorp.png", alt: "RamfinCorp" },
    { src: "/rapid-black.webp", alt: "RapidMoney" },
    { src: "/kreditbee-logo.svg", alt: "KreditBee" },
    { src: "/true.webp", alt: "Truebalance" },
    { src: "/mpoket.svg", alt: "Mpoket" },
    { src: "/credit.svg", alt: "Credit" },
    // { src: "/logo_Loan112.svg", alt: "Loan112" },

  ];

  return (
    <div className="lg:hidden mb-6">
      <div className="relative overflow-hidden rounded-[28px] border border-[#6232FF]/10 bg-[linear-gradient(135deg,#ffffff_0%,#f8f4ff_42%,#eef8da_100%)] p-4 shadow-[0_18px_50px_rgba(98,50,255,0.10)]">
        <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#6232FF]/10 blur-3xl" />
        <div className="absolute -left-8 bottom-0 h-24 w-24 rounded-full bg-[#a6ff00]/20 blur-3xl" />

        <div className="relative z-10">
          <div className="mb-0 flex items-center justify-center">
            <Image
              src="/cready.png"
              alt="Cready"
              width={108}
              height={32}
              className="h-8 w-auto"
              priority
            />
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-[#6232FF]/10 bg-gradient-to-r from-white via-[#f7f4ff] to-[#f1ffde] px-4 py-3 shadow-[0_10px_30px_rgba(98,50,255,0.08)]">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6232FF]/70">
              Partner lenders
            </p>
            <p className="mt-1 text-sm font-medium text-gray-700">
              Offers from trusted lenders
            </p>
          </div>
        </div>

        <div className="overflow-hidden">
          <div className="flex w-max items-center gap-2 animate-[mobile-lender-marquee_18s_linear_infinite]">
            {[...lenders, ...lenders].map((lender, index) => (
              <div
                key={`${lender.alt}-${index}`}
                className="flex h-10 min-w-fit items-center justify-center rounded-full border border-gray-100 bg-white px-4 shadow-sm"
              >
                <Image
                  src={lender.src}
                  alt={lender.alt}
                  width={70}
                  height={16}
                  className="max-h-4 w-auto object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes mobile-lender-marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}
