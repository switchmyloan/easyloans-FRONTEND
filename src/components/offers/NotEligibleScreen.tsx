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
        className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-95 relative overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Purple gradient header */}
          <div className="bg-linear-to-br from-violet-600 via-purple-600 to-indigo-700 px-6 pt-8 pb-14 relative">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 left-6 w-20 h-20 border border-white rounded-full" />
              <div className="absolute top-8 right-8 w-12 h-12 border border-white rounded-full" />
              <div className="absolute bottom-4 left-1/2 w-8 h-8 border border-white rounded-full" />
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Sad emoji */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.15 }}
              className="w-20 h-20 mx-auto bg-white rounded-2xl shadow-lg flex items-center justify-center"
            >
              <span className="text-5xl select-none" aria-hidden>😔</span>
            </motion.div>
          </div>

          {/* Content */}
          <div className="px-6 pb-6 -mt-6">
            {/* Card that overlaps header */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h1 className="text-center text-xl font-bold text-gray-900 mb-1 mt-4">
                You&apos;re currently not eligible
              </h1>
              <p className="text-center text-violet-600 font-medium text-sm mb-5">
                for {lenderName}
              </p>

              {/* Encouragement */}
              <div className="bg-linear-to-r from-violet-50 to-purple-50 rounded-xl p-4 mb-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">Don&apos;t worry!</p>
                    <p className="text-gray-600 text-xs mt-0.5 leading-relaxed">
                      We have other loan options that might be perfect for you.
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <motion.button
                type="button"
                onClick={onExplore}
                animate={{
                  scale: [1, 1.02, 1],
                  y: [0, -2, 0]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-linear-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-violet-500/25 transition-all cursor-pointer"
              >
                <span>Explore Other Offers</span>
                <motion.svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  animate={{ x: [0, 3, 0] }}
                  transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </motion.svg>
              </motion.button>
            </div>

            {/* Footer */}
            <p className="text-center text-gray-400 text-[11px] mt-4">
              Your data is 100% safe & secure
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
