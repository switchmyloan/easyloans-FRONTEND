"use client";

import { motion } from "framer-motion";
import { Zap, Star, CirclePercent, ShieldCheck } from "lucide-react";

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
  applied?: boolean;
  /** Text to show in the top-right badge. Pass null/undefined to hide. */
  badgeText?: string | null;
  /** Feature tag to show below the lender name (e.g., "Only for EPFO registered users") */
  featureTag?: string;
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
  applied = false,
  badgeText,
  featureTag,
}: OfferCardProps) {
  const buttonLabel = applying
    ? "Applying..."
    : applied
      ? "Applied"
      : "Apply Now";

  const isDisabled = applying || applied;
  const fadedClass = applied ? "opacity-75" : "";

  // Compact Card
  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.4 }}
        className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-shadow relative flex flex-col h-full overflow-hidden ${
          recommended
            ? "border-emerald-300 ring-1 ring-emerald-200"
            : "border-gray-200"
        } ${fadedClass}`}
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
          {/* Logo */}
          <div className="flex items-center gap-3 mb-3">
            <div
              className={`w-12 h-12 rounded-xl border flex items-center justify-center flex-shrink-0 ${
                logoDarkBg
                  ? "bg-gray-800 border-gray-700"
                  : "bg-gray-50 border-gray-100"
              }`}
            >
              {lenderLogo}
            </div>

            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900">
                {lenderName}
              </p>
              {featureTag && (
                <p className="text-[10px] font-medium text-gray-500 truncate">
                  {featureTag}
                </p>
              )}
            </div>
          </div>

          {/* Headline */}
          <h3 className="text-base font-bold text-gray-900 leading-snug mb-1">
            {headline}
          </h3>

          <p className="text-xs text-gray-500 mb-4 line-clamp-2">
            {description}
          </p>

          {/* Features */}
          <div className="border-t border-gray-100 pt-3 space-y-2">
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
                Key Feature
              </p>

              <p className="text-xs font-medium text-gray-700 leading-snug">
                {keyFeature}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
                Interest Rate
              </p>

              <p className="text-xs font-medium text-gray-700 leading-snug">
                {interestRate}
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="p-5 pt-0">
          <button
            onClick={onApply}
            disabled={isDisabled}
            className="w-full px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold rounded-xl transition-colors active:scale-[0.97] cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {buttonLabel}
          </button>
        </div>
      </motion.div>
    );
  }

  // Main Premium Card
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
     className={`relative overflow-hidden rounded-[16px] border border-[#e9ddff] bg-gradient-to-br from-[#faf8ff] to-[#f6f1ff] shadow-[0_6px_20px_rgba(139,92,246,0.08)] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_12px_30px_rgba(139,92,246,0.16)] h-full flex flex-col ${fadedClass}`}
    >
      <div className="p-3 sm:p-4 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          {/* Left */}
          <div className="flex items-center gap-2 min-w-0">
            <div
              className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 ${
                logoDarkBg
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-[#ebe5ff]"
              }`}
            >
              {lenderLogo}
            </div>

            <div className="min-w-0">
              <p className="text-[11px] font-medium text-gray-600 truncate">
                {lenderName}
              </p>
              {featureTag && (
                <p className="text-[10px] font-medium text-gray-500 truncate">
                  {featureTag}
                </p>
              )}
            </div>
          </div>

          {/* Badge */}
          {badgeText && (
            badgeText.toLowerCase().includes("waiver") ? (
              // Special IDFC waiver badge - gold/amber theme to stand out
              <div className="flex shrink-0 items-center gap-0.5 rounded-full border border-amber-400 bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 shadow-sm max-w-35 sm:max-w-none">
                <span className="text-xs">🎉</span>
                <span className="truncate">{badgeText}</span>
              </div>
            ) : (
              // Regular badge
              <div className="flex shrink-0 items-center gap-1 rounded-full border border-[#e6d8ff] bg-[#faf7ff] px-2 py-0.5 text-[10px] font-semibold text-violet-600 max-w-35 sm:max-w-none">
                <Star className="w-2.5 h-2.5 fill-current shrink-0" />
                <span className="truncate">{badgeText}</span>
              </div>
            )
          )}
        </div>

        {/* Headline */}
        <div className="mt-2.5">
          <h3 className="text-[15px] sm:text-[16px] leading-[1.3] font-bold tracking-tight text-gray-900">
            {headline}
          </h3>

          <p className="mt-1 text-[11px] leading-relaxed text-gray-500 line-clamp-2">
            {description}
          </p>
        </div>

        {/* Divider */}
        <div className="my-2.5 h-px bg-[#ebe4ff]" />

        {/* Features */}
        <div className="flex flex-col sm:flex-row items-stretch flex-1">
          {/* Key Feature */}
          <div className="flex-1 rounded-[12px] p-2">
            <div className="flex items-start gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-violet-100 text-violet-600 shrink-0">
                <Zap className="w-3 h-3" />
              </div>

              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-violet-500">
                  Key Feature
                </p>

                <p className="mt-0.5 text-[11px] font-medium leading-snug text-gray-700">
                  {keyFeature}
                </p>
              </div>
            </div>
          </div>

          {/* Vertical Divider */}
          <div className="hidden sm:block w-px bg-[#ebe4ff]" />

          {/* Horizontal Divider Mobile */}
          <div className="sm:hidden h-px bg-[#ebe4ff] mx-2" />

          {/* Interest Rate */}
          <div className="flex-1 rounded-[12px] p-2">
            <div className="flex items-start gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-violet-100 text-violet-600 shrink-0">
                <CirclePercent className="w-3 h-3" />
              </div>

              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-violet-500">
                  Interest Rate
                </p>

                <p className="mt-0.5 text-[11px] font-medium leading-snug text-gray-700">
                  {interestRate}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-2.5 grid grid-cols-[1fr_auto] gap-2">
          {/* Apply Button */}
          <button
            onClick={onApply}
            disabled={isDisabled}
            className="group relative h-9 overflow-hidden rounded-lg bg-gradient-to-r from-[#dfff45] via-[#9b6bff] to-[#7c3aed] px-4 text-[12px] font-semibold text-white shadow-md transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-60 cursor-pointer"
          >
            <span className="relative z-10 flex items-center justify-center gap-1.5">
              {buttonLabel}

              <span className="transition-transform duration-200 group-hover:translate-x-1">
                →
              </span>
            </span>
          </button>

          {/* RBI */}
          <div className="flex items-center gap-1.5 rounded-lg border border-[#ece4ff] bg-white/95 px-3 text-[11px] font-medium text-gray-700">
           <ShieldCheck className="w-3.5 h-3.5 text-white fill-[#12a305] shrink-0" />

            RBI Registered
          </div>
        </div>
      </div>
    </motion.div>
  );
}
