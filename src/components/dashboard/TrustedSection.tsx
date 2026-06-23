"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ShieldCheck, Lock } from "lucide-react";
import type { ReactNode } from "react";

// ============================================================
// Types
// ============================================================
type TrustBadge = {
  title: string;
  subtitle: string;
  icon: ReactNode;
};

// ============================================================
// Trust Badges Data
// ============================================================
const TRUST_BADGES: TrustBadge[] = [
  {
    title: "RBI Registered",
    subtitle: "NBFC Partner",
    icon: (
      <Image
        src="/reservebank.png"
        alt="RBI"
        width={26}
        height={26}
        className="h-8 w-8 object-contain"
      />
    ),
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
  {
    title: "256-bit",
    subtitle: "Encryption",
    icon: <ShieldCheck className="h-5 w-5" strokeWidth={2} />,
  },
  {
    title: "100% Safe",
    subtitle: "Your data is secure",
    icon: <Lock className="h-5 w-5" strokeWidth={2} />,
  },
];

// ============================================================
// TrustedSection Component
// ============================================================
export default function TrustedSection() {
  return (
    <motion.div
      id="trusted-section"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div className="flex items-center mb-2 mt-2">
        <div className="flex items-left gap-3">
          <h2 className="text-base sm:text-lg font-bold">Your trust is our priority</h2>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 bg-white rounded-xl p-1 shadow-md sm:shadow-sm">
        {TRUST_BADGES.map((badge, index) => (
          <div
            key={badge.title}
            className={`flex min-h-12 sm:min-h-14 items-center gap-2 px-2 sm:px-3 py-2 sm:py-2.5
              ${index % 2 !== 0 ? "border-l border-[#ece4ff]" : ""}
              ${index >= 2 ? "border-t sm:border-t-0 border-[#ece4ff]" : ""}
              ${index !== 0 ? "sm:border-l" : ""}
            `}
          >
            {/* Icon */}
            <div className="flex shrink-0 items-center justify-center text-[#6e4dff]">
              {badge.icon}
            </div>

            {/* Content */}
            <div>
              <p className="text-[0.65rem] sm:text-[0.68rem] font-semibold leading-tight text-[#303972]">
                {badge.title}
              </p>
              <p className="mt-0.5 text-[0.55rem] sm:text-[0.6rem] leading-tight text-[#8791b5]">
                {badge.subtitle}
              </p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
