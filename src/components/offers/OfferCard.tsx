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
  logoDarkBg?: boolean;
  compact?: boolean;
  recommended?: boolean;
  applying?: boolean;
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
  logoDarkBg,
  compact = false,
  recommended = false,
  applying = false,
}: OfferCardProps) {
  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.4 }}
        className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-shadow relative flex flex-col h-full overflow-hidden ${recommended ? "border-emerald-300 ring-1 ring-emerald-200" : "border-gray-200"}`}
      >
        {recommended && (
          <div className="bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 text-center">
            Recommended
          </div>
        )}
        {badge && (
          <div className="absolute top-4 right-4 z-10">{badge}</div>
        )}

        <div className="p-5 flex-1">
          {/* Logo + Name row */}
          <div className="flex items-center gap-3 mb-3">
            <div className={`w-12 h-12 rounded-xl border flex items-center justify-center flex-shrink-0 ${logoDarkBg ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-100"}`}>
              {lenderLogo}
            </div>
            <p className="text-sm font-semibold text-gray-900">{lenderName}</p>
          </div>

          {/* Headline + Description */}
          <h3 className="text-base font-bold text-gray-900 leading-snug mb-1">
            {headline}
          </h3>
          <p className="text-xs text-gray-500 mb-4 line-clamp-2">{description}</p>

          <div className="border-t border-gray-100 pt-3 space-y-2">
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
                Key Feature
              </p>
              <p className="text-xs font-medium text-gray-700 leading-snug">{keyFeature}</p>
            </div>
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
                Interest Rate
              </p>
              <p className="text-xs font-medium text-gray-700 leading-snug">{interestRate}</p>
            </div>
          </div>
        </div>

        <div className="p-5 pt-0">
          <button
            onClick={onApply}
            disabled={applying}
            className="w-full px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-xl transition-colors active:scale-[0.97] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {applying ? "Applying..." : "Apply Now"}
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-shadow relative overflow-hidden ${recommended ? "border-emerald-300 ring-1 ring-emerald-200" : "border-gray-200"}`}
    >
      {recommended && (
        <div className="bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 text-center">
          Recommended
        </div>
      )}

      <div className="flex items-start gap-4 p-5 sm:p-6">
        <div className={`w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-xl border flex items-center justify-center flex-shrink-0 ${logoDarkBg ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-100"}`}>
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
          disabled={applying}
          className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-xl transition-colors flex-shrink-0 active:scale-[0.97] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {applying ? "Applying..." : "Apply Now"}
        </button>
      </div>
    </motion.div>
  );
}
