// "use client";

// import Link from "next/dist/client/link";

// export default function LeftPanel() {
//   return (
//     <div className="hidden lg:flex lg:w-[52%] flex-col justify-center relative overflow-hidden sticky top-0 h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40">
//       {/* Decorative blobs */}
//       <div className="absolute -top-20 -left-20 w-72 h-72 bg-[#6232FF]/5 rounded-full blur-3xl" />
//       <div className="absolute bottom-20 right-10 w-56 h-56 bg-[#A6FF00]/8 rounded-full blur-3xl" />
//       <div className="absolute top-1/3 right-0 w-40 h-40 bg-[#1fe1e9]/8 rounded-full blur-2xl" />

//       <div className="relative z-10 max-w-lg ml-auto mr-12 xl:mr-20 px-6">
//         {/* Logo */}
//         <div className="mb-12">
//           <Link href="https://www.cready.in/" target="_blank" >
//             <img src="/cready.png" alt="Cready" className="h-9 w-auto" />
//           </Link>
//         </div>

//         {/* Text content */}
//         <div className="mb-10">
//           <h2 className="text-2xl xl:text-[28px] font-medium leading-snug text-gray-800 mb-3">
//             <span className="text-[#6232FF] font-semibold">cready</span>, small loans for your everyday needs.
//           </h2>
//           <p className="font-bold text-lg xl:text-xl text-gray-900 leading-snug">
//             Fast approval. Easy process. Instatnt disbursal
//           </p>
//         </div>

//         {/* Hero card */}
//         <div className="relative">
//           <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/60 border border-gray-100/80 p-6 relative overflow-hidden">
//             {/* Background pattern */}
//             <div className="absolute inset-0 opacity-[0.03]" style={{
//               backgroundImage: `radial-gradient(circle at 1px 1px, #6232FF 1px, transparent 0)`,
//               backgroundSize: "24px 24px",
//             }} />

//             <div className="relative z-10">
//               {/* Stats row */}
//               <div className="grid grid-cols-3 gap-4 mb-6">
//                 <div className="text-center">
//                   <div className="text-2xl font-bold text-[#6232FF]">5 min</div>
//                   <div className="text-xs text-gray-500 mt-0.5">Approval Time</div>
//                 </div>
//                 <div className="text-center border-x border-gray-100">
//                   <div className="text-2xl font-bold text-[#6232FF]">2L</div>
//                   <div className="text-xs text-gray-500 mt-0.5">Upto Loan Amount</div>
//                 </div>
//                 <div className="text-center">
//                   <div className="text-2xl font-bold text-[#6232FF]">0.83%</div>
//                   <div className="text-xs text-gray-500 mt-0.5">Starting Rate</div>
//                 </div>
//               </div>

//               {/* Features */}
//               <div className="space-y-3">
//                 {[
//                   { icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z", label: "RBI Registered & 100% Secure", color: "bg-emerald-50 text-emerald-600" },
//                   { icon: "M13 10V3L4 14h7v7l9-11h-7z", label: "Instant Digital Process", color: "bg-amber-50 text-amber-600" },
//                   { icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", label: "Best Rates from Top Lenders", color: "bg-blue-50 text-blue-600" },
//                 ].map((f) => (
//                   <div key={f.label} className="flex items-center gap-3">
//                     <div className={`w-9 h-9 rounded-xl ${f.color} flex items-center justify-center flex-shrink-0`}>
//                       <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
//                         <path strokeLinecap="round" strokeLinejoin="round" d={f.icon} />
//                       </svg>
//                     </div>
//                     <span className="text-sm font-medium text-gray-700">{f.label}</span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* Floating badge */}
//           <div className="absolute -top-4 -left-3 animate-float">
//             <div className="bg-white px-4 py-2.5 rounded-2xl shadow-lg shadow-gray-200/80 border border-gray-100 flex items-center gap-2.5">
//               <span className="text-sm font-semibold text-gray-800">Loan approved in 5 min!</span>
//               <span className="bg-[#1fe1e9] rounded-full p-1 flex items-center justify-center">
//                 <svg width="14" height="14" fill="none" viewBox="0 0 16 16">
//                   <path d="M6.5 11.5L3.5 8.5L4.56 7.44L6.5 9.38L11.44 4.44L12.5 5.5L6.5 11.5Z" fill="#fff" />
//                 </svg>
//               </span>
//             </div>
//           </div>
//           {/* Partner pills */}
//           <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-full max-w-2xl animate-float-delayed">
//             <div className="flex items-center justify-center gap-2 px-4 ">
//               {[
//                 { src: "/ramfinCorp.png", alt: "RamfinCorp" },
//                 { src: "/rapid-black.webp", alt: "RapidMoney" },
//                 { src: "/kreditbee-logo.svg", alt: "KreditBee" },
//                 { src: "/true.webp", alt: "Truebalance" },
//                 { src: "/mpoket.svg", alt: "Mpoket" },
//                 { src: "/credit.svg", alt: "Credit" },
//                 { src: "/logo_Loan112.svg", alt: "Loan112" },

//               ].map((logo, index) => (
//                 <div
//                   key={index}
//                   className="flex items-center justify-center bg-white h-9 px-4 rounded-full shadow-sm border border-gray-100 flex-shrink-0"
//                 >
//                   <img
//                     src={logo.src}
//                     alt={logo.alt}
//                     className="h-3.5 w-auto object-contain max-w-[80px]"
//                   />
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  Clock3,
  IndianRupee,
  TrendingUp,
} from "lucide-react";
import TrustedPartners from "./TrustedPartners";




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
  return (
    <aside className="relative w-full font-sans text-[#1b1e6b] lg:w-[50%] 2xl:w-[55%]">

      <div className="relative z-10 flex w-full items-center justify-center px-0 py-4 lg:px-4 xl:px-6 xl:py-6 2xl:px-10 2xl:py-8 3xl:px-14 3xl:py-10">
        <div className="w-full max-w-104 2xl:max-w-120 3xl:max-w-140">
          {/* Logo - hidden on mobile since Form has its own header */}
          <Link
            className="mb-3 hidden lg:inline-flex xl:mb-4 2xl:mb-5"
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
            {/* Headline - visible on all screens */}
            <div className="space-y-2 text-center lg:text-left 2xl:space-y-3">
           <h2 className="text-2xl font-extrabold leading-[0.95] tracking-[-0.05em] text-[#161a6d] sm:text-[1.75rem] lg:max-w-104 lg:text-[3rem] xl:text-[3.5rem] 2xl:text-[4rem] 3xl:text-[5rem] [@media(max-height:900px)]:text-[1.85rem]">
                <span className="block text-4xl">Small Loans</span>
                <span className="block text-4xl bg-gradient-to-r from-[#8560ff] via-[#664cff] to-[#4d3cff] bg-clip-text text-transparent">
                  when you need them.
                </span>
              </h2>
              <p className="hidden lg:block max-w-72 text-gray-500 text-xs mb-4 2xl:text-sm 2xl:max-w-80 3xl:text-base 3xl:max-w-96">
                Built around your moments.
                <br />
                Backed by trust. Driven by technology.
              </p>
            </div>



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

            <div className="hidden lg:block">
            <TrustedPartners/>
            </div>




            {/* Data safety notice - centered on mobile */}
            <div className="flex flex-col items-center text-center text-[#717aa2] lg:flex-row lg:items-start lg:gap-2 lg:pl-1 lg:text-left 2xl:gap-3 2xl:pl-2">
              <div className="mb-1 text-[#6e4dff] lg:mb-0 lg:mt-0.5">
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

