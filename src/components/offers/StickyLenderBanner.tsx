"use client";

import { motion, AnimatePresence } from "framer-motion";

interface StickyLenderBannerProps {
  show: boolean;
  lenderName: string;
  logo: string;
  tagText?: string;
  description: string;
  onApply: () => void;
  buttonText?: string;
}

export default function StickyLenderBanner({
  show,
  lenderName,
  logo,
  tagText = "HIGHEST APPROVAL CHANCES",
  description,
  onApply,
  buttonText = "Apply Now",
}: StickyLenderBannerProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
        >
          <div className="mx-2 mb-2">
            {/* Animated border wrapper */}
            <div className="relative rounded-2xl p-[2px] overflow-hidden">
              {/* Rotating gradient ring */}
              <div
                className="absolute inset-0 rounded-2xl"
                style={{
                  background:
                    "conic-gradient(from 0deg, #7C3AED, #C894FF, #D9F941, #7C3AED)",
                  animation: "spin 3s linear infinite",
                }}
              />

              {/* Glow effect */}
              <div
                className="absolute inset-0 rounded-2xl blur-sm opacity-60"
                style={{
                  background:
                    "conic-gradient(from 0deg, #7C3AED, #C894FF, #D9F941, #7C3AED)",
                  animation: "spin 3s linear infinite",
                }}
              />

              {/* Inner card */}
              <div className="relative rounded-[14px] bg-gradient-to-br from-white via-violet-50 to-[#F5F0FF] shadow-xl shadow-violet-500/15 backdrop-blur-xl overflow-hidden">
                {/* Top highlight tag */}
                <div className="bg-gradient-to-r from-violet-600 to-[#C894FF] px-3 py-1">
                  <p className="text-[10px] font-bold text-white text-center tracking-wide flex items-center justify-center gap-1">
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {tagText}
                  </p>
                </div>

                {/* Content */}
                <div className="flex items-center gap-3 p-3">
                  {/* Logo */}
                  <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-md border border-violet-100">
                    <img
                      src={logo}
                      alt={lenderName}
                      className="h-7 w-7 object-contain"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 font-bold text-sm">{lenderName}</p>
                    <p className="text-gray-500 text-[11px] leading-tight">
                      {description}
                    </p>
                  </div>

                  {/* Apply Button */}
                  <button
                    onClick={onApply}
                    className="shrink-0 px-4 py-2.5 bg-gradient-to-r from-[#D9F941] to-[#7C3AED] text-white text-xs font-bold rounded-xl shadow-md shadow-violet-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                  >
                    {buttonText}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* CSS Animation */}
          <style jsx>{`
            @keyframes spin {
              from {
                transform: rotate(0deg);
              }
              to {
                transform: rotate(360deg);
              }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
