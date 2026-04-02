"use client";

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
      <div className="flex items-center justify-center mb-4">
        <img src="/cready.png" alt="Cready" className="h-8 w-auto" />
      </div>

      <div className="rounded-2xl border border-[#6232FF]/10 bg-gradient-to-r from-white via-[#f7f4ff] to-[#f1ffde] px-4 py-3 shadow-[0_10px_30px_rgba(98,50,255,0.08)]">
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
                <img
                  src={lender.src}
                  alt={lender.alt}
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
