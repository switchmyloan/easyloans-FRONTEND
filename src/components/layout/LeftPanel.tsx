"use client";

import Link from "next/dist/client/link";

export default function LeftPanel() {
  return (
    <div className="hidden lg:flex lg:w-[52%] flex-col justify-center relative overflow-hidden sticky top-0 h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40">
      {/* Decorative blobs */}
      <div className="absolute -top-20 -left-20 w-72 h-72 bg-[#6232FF]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-56 h-56 bg-[#A6FF00]/8 rounded-full blur-3xl" />
      <div className="absolute top-1/3 right-0 w-40 h-40 bg-[#1fe1e9]/8 rounded-full blur-2xl" />

      <div className="relative z-10 max-w-lg ml-auto mr-12 xl:mr-20 px-6">
        {/* Logo */}
        <div className="mb-12">
          <Link href="https://www.cready.in/" target="_blank" >
            <img src="/cready.png" alt="Cready" className="h-9 w-auto" />
          </Link>
        </div>

        {/* Text content */}
        <div className="mb-10">
          <h2 className="text-2xl xl:text-[28px] font-medium leading-snug text-gray-800 mb-3">
            <span className="text-[#6232FF] font-semibold">cready</span>, with personal
            loans that actually feel personal.
          </h2>
          <p className="font-bold text-lg xl:text-xl text-gray-900 leading-snug">
            Made for your life. Built around your moments.
          </p>
        </div>

        {/* Hero card */}
        <div className="relative">
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/60 border border-gray-100/80 p-6 relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, #6232FF 1px, transparent 0)`,
              backgroundSize: "24px 24px",
            }} />

            <div className="relative z-10">
              {/* Stats row */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#6232FF]">5 min</div>
                  <div className="text-xs text-gray-500 mt-0.5">Approval Time</div>
                </div>
                <div className="text-center border-x border-gray-100">
                  <div className="text-2xl font-bold text-[#6232FF]">2L</div>
                  <div className="text-xs text-gray-500 mt-0.5">Upto Loan Amount</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#6232FF]">0.83%</div>
                  <div className="text-xs text-gray-500 mt-0.5">Starting Rate</div>
                </div>
              </div>

              {/* Features */}
              <div className="space-y-3">
                {[
                  { icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", label: "RBI Registered & 100% Secure", color: "bg-emerald-50 text-emerald-600" },
                  { icon: "M13 10V3L4 14h7v7l9-11h-7z", label: "Instant Digital Process", color: "bg-amber-50 text-amber-600" },
                  { icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", label: "Best Rates from Top Lenders", color: "bg-blue-50 text-blue-600" },
                ].map((f) => (
                  <div key={f.label} className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl ${f.color} flex items-center justify-center flex-shrink-0`}>
                      <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={f.icon} />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-700">{f.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Floating badge */}
          <div className="absolute -top-4 -left-3 animate-float">
            <div className="bg-white px-4 py-2.5 rounded-2xl shadow-lg shadow-gray-200/80 border border-gray-100 flex items-center gap-2.5">
              <span className="text-sm font-semibold text-gray-800">Loan approved in 5 min!</span>
              <span className="bg-[#1fe1e9] rounded-full p-1 flex items-center justify-center">
                <svg width="14" height="14" fill="none" viewBox="0 0 16 16">
                  <path d="M6.5 11.5L3.5 8.5L4.56 7.44L6.5 9.38L11.44 4.44L12.5 5.5L6.5 11.5Z" fill="#fff" />
                </svg>
              </span>
            </div>
          </div>
          {/* Partner pills */}
          <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-full max-w-2xl animate-float-delayed">
            <div className="flex items-center justify-center gap-2 px-4">
              {[
                { src: "/hero.webp", alt: "Hero Fincorp" },
                { src: "/poonawalla.svg", alt: "Poonawalla" },
                { src: "/true.webp", alt: "Truebalance" },
                { src: "/olyv.png", alt: "Olyv" },
                { src: "/zype.png", alt: "Zype" },
                { src: "/kreditbee-logo.svg", alt: "KreditBee" },
                { src: "/moneyview-logo.svg", alt: "MoneyView" },
              ].map((logo, index) => (
                <div
                  key={index}
                  className="flex items-center justify-center bg-white h-9 px-4 rounded-full shadow-sm border border-gray-100 flex-shrink-0"
                >
                  <img
                    src={logo.src}
                    alt={logo.alt}
                    className="h-3.5 w-auto object-contain max-w-[80px]"
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
