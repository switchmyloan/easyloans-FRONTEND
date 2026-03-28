"use client";

import { motion } from "framer-motion";

interface OfferCardProps {
  lenderName: string;
  lenderLogo: React.ReactNode;
  headline: string;
  description: string;
  keyFeature: string;
  interestRate: string;
  onApply: () => void;
  delay?: number;
  badge?: React.ReactNode;
}

export default function OfferCard({
  lenderName,
  lenderLogo,
  headline,
  description,
  keyFeature,
  interestRate,
  onApply,
  delay = 0,
  badge,
}: OfferCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow relative"
    >
      {badge && (
        <div className="absolute top-4 right-4 z-10">{badge}</div>
      )}

      <div className="flex items-start gap-4 p-5 sm:p-6">
        <div className="w-16 h-16 sm:w-[72px] sm:h-[72px] bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center flex-shrink-0">
          {lenderLogo}
        </div>
        <div className="flex-1 min-w-0 pr-20">
          <p className="text-sm font-semibold text-gray-900">{lenderName}</p>
          <h3 className="text-base sm:text-lg font-bold text-gray-900 mt-1 leading-snug">
            {headline}
          </h3>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>
      </div>

      <div className="mx-5 sm:mx-6 border-t border-gray-100" />

      <div className="flex flex-wrap items-center gap-4 px-5 py-4 sm:px-6">
        <div className="flex-1 min-w-[110px]">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Key Feature
          </p>
          <p className="text-sm font-medium text-gray-700 leading-snug">{keyFeature}</p>
        </div>
        <div className="flex-1 min-w-[110px]">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
            Interest Rate
          </p>
          <p className="text-sm font-medium text-gray-700 leading-snug">{interestRate}</p>
        </div>
        <button
          onClick={onApply}
          className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-xl transition-colors flex-shrink-0 active:scale-[0.97] cursor-pointer"
        >
          Apply Now
        </button>
      </div>
    </motion.div>
  );
}
