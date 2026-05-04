"use client";

import { motion, AnimatePresence } from "framer-motion";

interface NotEligibleScreenProps {
  onClose: () => void;
  onExplore: () => void;
  lenderName?: string;
}

export default function NotEligibleScreen({
  onClose,
  onExplore,
  lenderName = "Kreditbee",
}: NotEligibleScreenProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-start sm:items-center justify-center z-50 px-4 py-6 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 28 }}
          className="bg-[#f5f6fb] rounded-3xl shadow-2xl w-full max-w-md relative overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer z-20"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="pt-6 pb-3 flex justify-center">
            <img src="/cready.png" alt="Cready" className="h-7 w-auto" />
          </div>

          <div className="bg-white rounded-2xl mx-3 mb-3 px-5 pt-7 pb-7 relative overflow-hidden">
            <div className="pointer-events-none absolute inset-0">
              <span className="absolute top-12 left-10 w-1.5 h-1.5 rounded-full bg-indigo-200/70" />
              <span className="absolute top-20 right-12 w-1.5 h-1.5 rounded-full bg-pink-200/70" />
              <span className="absolute top-28 left-20 text-indigo-300 text-xs">+</span>
              <span className="absolute top-16 right-24 text-indigo-300 text-[10px]">◦</span>
              <span className="absolute top-40 right-8 text-indigo-200 text-xs">+</span>
              <span className="absolute top-8 right-20 w-1 h-1 rounded-full bg-indigo-200/60" />

              <div className="absolute top-10 left-4 grid grid-cols-4 gap-1 opacity-50">
                {Array.from({ length: 16 }).map((_, i) => (
                  <span key={`l-${i}`} className="w-0.5 h-0.5 rounded-full bg-indigo-200" />
                ))}
              </div>
              <div className="absolute top-8 right-4 grid grid-cols-4 gap-1 opacity-50">
                {Array.from({ length: 16 }).map((_, i) => (
                  <span key={`r-${i}`} className="w-0.5 h-0.5 rounded-full bg-indigo-200" />
                ))}
              </div>
            </div>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.15 }}
              className="relative w-32 h-32 mx-auto mb-5 flex items-center justify-center"
            >
              <div className="absolute inset-0 rounded-full bg-linear-to-br from-indigo-50 to-white border border-indigo-100/70 shadow-inner" />
              <div className="absolute inset-3 rounded-full bg-white border border-indigo-50" />
              <span className="relative text-[72px] leading-none select-none" aria-hidden>
                😔
              </span>
            </motion.div>

            <h1 className="text-center text-[26px] sm:text-[28px] font-bold text-gray-900 leading-snug tracking-tight">
              You are currently
              <br />
              <span className="text-indigo-600">not eligible</span> for {lenderName}
            </h1>

            <div className="mt-6 bg-indigo-50/70 rounded-2xl p-4 flex items-start gap-3">
              <div className="w-12 h-12 rounded-full bg-white border border-indigo-100 flex items-center justify-center shrink-0 shadow-sm">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M3 13c0-1.1.9-2 2-2h2l2-2 4 4 4-3 4 3v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.8}
                    d="M9.5 7.5a2 2 0 112.83-2.83L13 5.34l.67-.67a2 2 0 112.83 2.83L13 10.83 9.5 7.5z"
                  />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-indigo-700 font-bold text-base">Don&apos;t lose hope!</p>
                <p className="text-gray-600 text-sm mt-1 leading-relaxed">
                  We have other loan options
                  <br />
                  for you.
                </p>
              </div>
            </div>

            <div className="relative mt-5 -mx-5 mb-4 h-16 overflow-hidden">
              <svg
                viewBox="0 0 400 80"
                preserveAspectRatio="none"
                className="absolute bottom-0 left-0 w-full h-full"
                aria-hidden
              >
                <defs>
                  <linearGradient id="city-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a5b4fc" stopOpacity="0.55" />
                    <stop offset="100%" stopColor="#a5b4fc" stopOpacity="0.15" />
                  </linearGradient>
                </defs>
                <path
                  fill="url(#city-grad)"
                  d="M0,80 L0,55 L20,55 L20,40 L40,40 L40,60 L60,60 L60,30 L80,30 L80,50 L100,50 L100,35 L120,35 L120,55 L140,55 L140,25 L160,25 L160,45 L180,45 L180,55 L210,55 L210,30 L230,30 L230,50 L250,50 L250,40 L270,40 L270,55 L300,55 L300,35 L320,35 L320,55 L340,55 L340,45 L360,45 L360,55 L380,55 L380,50 L400,50 L400,80 Z"
                />
                <circle cx="50" cy="20" r="1.5" fill="#fde68a" />
                <circle cx="320" cy="15" r="1.5" fill="#fde68a" />
                <circle cx="200" cy="10" r="1" fill="#c7d2fe" />
                <text x="40" y="22" fontSize="10" fill="#fde68a" opacity="0.8">✦</text>
                <text x="350" y="30" fontSize="12" fill="#fde68a" opacity="0.9">✦</text>
              </svg>
            </div>

            <motion.button
              type="button"
              onClick={onExplore}
              whileTap={{ scale: 0.98 }}
              className="relative w-full bg-linear-to-r from-indigo-700 via-violet-700 to-indigo-800 text-white font-semibold py-3.5 rounded-xl flex items-center justify-between px-4 shadow-md shadow-indigo-700/25 ring-1 ring-amber-300/70 transition-all cursor-pointer"
            >
              <span className="text-amber-300 text-base leading-none">✨</span>
              <span className="text-[15px]">Explore all loan options</span>
              <span className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </motion.button>

            <div className="flex items-center justify-center gap-1.5 mt-4 text-gray-400 text-xs">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <span>Your data is safe and secure with us.</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
