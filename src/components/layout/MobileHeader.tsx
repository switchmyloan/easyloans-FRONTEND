"use client";

import Image from "next/image";

export default function MobileHeader() {
  const lenders = [
    { src: "/hero.webp", alt: "Hero Fincorp" },
    { src: "/poonawalla.svg", alt: "Poonawalla" },
    { src: "/true.webp", alt: "Truebalance" },
    { src: "/olyv.png", alt: "Olyv" },
    { src: "/zype.png", alt: "Zype" },
    { src: "/kreditbee-logo.svg", alt: "KreditBee" },
    { src: "/moneyview-logo.svg", alt: "MoneyView" },
  ];

  return (
    <div className="lg:hidden mb-6">
      <div className="relative overflow-hidden rounded-[28px] border border-[#6232FF]/10 bg-[linear-gradient(135deg,#ffffff_0%,#f8f4ff_42%,#eef8da_100%)] p-4 shadow-[0_18px_50px_rgba(98,50,255,0.10)]">
        <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-[#6232FF]/10 blur-3xl" />
        <div className="absolute -left-8 bottom-0 h-24 w-24 rounded-full bg-[#a6ff00]/20 blur-3xl" />

        <div className="relative z-10">
          <div className="mb-4 flex items-center justify-center">
            <Image
              src="/cready.png"
              alt="Cready"
              width={108}
              height={32}
              className="h-8 w-auto"
              priority
            />
          </div>

          <div className="grid gap-4">
            <div className="rounded-[24px] border border-white/70 bg-white/80 p-3 shadow-[0_14px_30px_rgba(15,23,42,0.06)] backdrop-blur">
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6232FF]/70">
                    Instant personal loans
                  </p>
                  <h2 className="mt-1 max-w-[16rem] text-lg font-semibold leading-tight text-slate-900">
                    Fast approvals designed for everyday earners.
                  </h2>
                </div>
                <div className="rounded-full bg-[#6232FF]/8 px-2.5 py-1 text-[10px] font-semibold text-[#6232FF]">
                  Up to 15L
                </div>
              </div>

              <div className="relative overflow-hidden rounded-[18px] aspect-[4/3]">
                <Image
                  src="/ttpublic.png"
                  alt="Loan offers for gig workers, salaried users, shop owners and self-employed customers"
                  fill
                  sizes="100vw"
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/65 via-slate-950/25 to-transparent p-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
                    <span className="text-xs font-semibold text-white">
                      10L+ approvals across trusted lenders
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { value: "5 min", label: "Approval" },
                { value: "15L", label: "Upto Amount" },
                { value: "0.83%", label: "Starting Rate" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/70 bg-white/85 px-3 py-2.5 text-center shadow-[0_10px_24px_rgba(15,23,42,0.05)] backdrop-blur"
                >
                  <p className="text-sm font-bold text-[#6232FF]">{item.value}</p>
                  <p className="mt-0.5 text-[10px] text-slate-500">{item.label}</p>
                </div>
              ))}
            </div>
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
