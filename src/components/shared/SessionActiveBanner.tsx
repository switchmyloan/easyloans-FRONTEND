"use client";

import { motion, AnimatePresence } from "framer-motion";

interface SessionActiveBannerProps {
  message: string | null;
  onClose: () => void;
}

/**
 * A notification banner that shows when a user's session is still active
 * (e.g., RamFinCorp session still active)
 */
export default function SessionActiveBanner({ message, onClose }: SessionActiveBannerProps) {
  if (!message) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-amber-50 border border-amber-300 text-amber-800 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 max-w-md"
      >
        <span className="text-xl">⚠️</span>
        <span className="text-sm font-medium">{message}</span>
        <button
          onClick={onClose}
          className="ml-2 text-amber-600 hover:text-amber-800 cursor-pointer"
          aria-label="Dismiss"
        >
          ✕
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
