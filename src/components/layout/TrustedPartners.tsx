import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

type TrustBadge = {
  title: string;
  subtitle: string;
  icon: ReactNode;
};

const TRUST_BADGES: TrustBadge[] = [
  {
    title: "RBI Registered",
    subtitle: "NBFC Partner",
    icon: (
      <Image
        src="/reservebank.png"
        alt="RBI"
        width={24}
        height={24}
        className="h-6 w-6 object-contain"
      />
    ),
  },
  {
    title: "256-bit",
    subtitle: "Encryption",
    icon: <ShieldCheck className="h-5 w-5" strokeWidth={2} />,
  },
  {
    title: "ISO",
    subtitle: "27001 Certified",
    icon: (
      <Image
        src="/iso.png"
        alt="ISO"
        width={24}
        height={24}
        className="h-6 w-6 object-contain"
      />
    ),
  },
];

const PARTNER_LOGOS = [
   // "/ramfinCorp.png",
   "/rapid-black.webp",
   "/kreditbee-logo.svg",
    "/truebalance.webp",
    "/mpoket.svg",
    "/credit.svg",
    // "/logo_Loan112.svg",

];

const CARD_CLASS_NAME =
  "relative overflow-hidden rounded-xl border border-white/80 bg-white/20 backdrop-blur-xl shadow-[0_24px_80px_rgba(116,82,255,0.16)]";

export default function TrustedPartners() {
  return (
    <section className={CARD_CLASS_NAME}>
      <div aria-hidden="true" className="absolute inset-0" />
      <div className="relative">
        <div className="flex items-center justify-between gap-3 px-4 py-2.5 2xl:px-5 2xl:py-3 3xl:px-6 3xl:py-4">
          <p className="text-[0.8rem] font-semibold text-[#2c3474] 2xl:text-sm 3xl:text-base">
            Trusted by thousands
          </p>
          <div className="flex items-center gap-2 text-[0.7rem] text-[#69749d] 2xl:text-xs 2xl:gap-2.5 3xl:text-sm 3xl:gap-3">
            <div className="flex items-center gap-0.5 2xl:gap-1">
              {/* 4 Full Stars */}
              {Array.from({ length: 4 }).map((_, index) => (
                <span
                  key={index}
                  className="flex h-3.5 w-3.5 items-center justify-center rounded-[0.2rem] bg-[#22c55e] text-[0.5rem] text-white 2xl:h-4 2xl:w-4 2xl:text-[0.55rem] 3xl:h-5 3xl:w-5 3xl:text-[0.65rem]"
                >
                  ★
                </span>
              ))}

              {/* Half Filled Star (4.9 Rating) */}
              <span className="relative inline-block h-3.5 w-3.5 text-[0.5rem] 2xl:h-4 2xl:w-4 2xl:text-[0.55rem] 3xl:h-5 3xl:w-5 3xl:text-[0.65rem]">
                {/* Base Empty/Light Star Background */}
                <span className="absolute inset-0 flex items-center justify-center rounded-[0.2rem] bg-[#d7f5df] text-[#a2e9b8]">
                  ★
                </span>

                {/* 90% Filled Foreground Star Wrapper */}
                <span className="absolute inset-y-0 left-0 block w-[90%] overflow-hidden rounded-l-[0.2rem] bg-[#22c55e]">
                  {/* Inside wrapper: A full star forced to match the parent container's width */}
                  <span className="absolute inset-y-0 left-0 flex h-3.5 w-3.5 items-center justify-center text-white 2xl:h-4 2xl:w-4 3xl:h-5 3xl:w-5">
                    ★
                  </span>
                </span>
              </span>
            </div>

            <span className="font-medium">4.9 on Play Store</span>
          </div>
        </div>

        <div className="h-px bg-[#ece4ff]" />

        <div className="grid grid-cols-3 divide-x divide-[#ece4ff]">
          {TRUST_BADGES.map((badge) => (
            <div
              key={badge.title}
              className="flex min-h-14 items-center gap-2 px-3 py-2.5 2xl:min-h-16 2xl:gap-2.5 2xl:px-4 2xl:py-3 3xl:min-h-20 3xl:gap-3 3xl:px-5 3xl:py-4"
            >
              {/* Icon */}
              <div className="flex shrink-0 items-center justify-center text-[#6e4dff] [&_img]:2xl:h-7 [&_img]:2xl:w-7 [&_img]:3xl:h-8 [&_img]:3xl:w-8 [&_svg]:2xl:h-6 [&_svg]:2xl:w-6 [&_svg]:3xl:h-7 [&_svg]:3xl:w-7">
                {badge.icon}
              </div>

              {/* Content */}
              <div>
                <p className="text-[0.68rem] font-semibold leading-tight text-[#303972] 2xl:text-xs 3xl:text-sm">
                  {badge.title}
                </p>

                <p className="mt-0.5 text-[0.6rem] leading-tight text-[#8791b5] 2xl:text-[0.65rem] 3xl:text-xs">
                  {badge.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Logo Carousel */}
      <div className="relative overflow-hidden py-2 2xl:py-3 3xl:py-4">
       <div className="flex w-max animate-marquee items-center gap-8">
          {[...PARTNER_LOGOS, ...PARTNER_LOGOS].map((logo, index) => (
            <div
              key={`${logo}-${index}`}
              className="flex h-6 w-20 shrink-0 items-center justify-center 2xl:h-7 2xl:w-24 3xl:h-8 3xl:w-28"
            >
              <Image
                src={logo}
                alt="Partner Logo"
                width={80}
                height={24}
                className="h-5 w-auto object-contain 2xl:h-6 3xl:h-7"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
