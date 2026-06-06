"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

interface AnimatedSubmitButtonProps {
  isSubmitting: boolean;
  defaultText?: string;
  submittedText?: string;
}

const STATUS_PHRASES = [
  "Verifying your details...",
  "Checking eligibility...",
  "Analyzing your profile...",
  "Finding best offers...",
  "Matching with lenders...",
  "Almost there...",
];

function FullScreenLoader({ phase }: { phase: "expanding" | "scanning" | "done" }) {
  const [phraseIndex, setPhraseIndex] = useState(0);

  // Rotate through phrases
  useEffect(() => {
    if (phase !== "scanning") return;

    const interval = setInterval(() => {
      setPhraseIndex((prev) => (prev + 1) % STATUS_PHRASES.length);
    }, 2000);

    return () => clearInterval(interval);
  }, [phase]);

  return createPortal(
    <motion.div
      className="fixed inset-0 z-9999 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Blurred backdrop - shows the form behind */}
      <motion.div
        className="absolute inset-0 bg-black/40 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      />

      {/* Modal container */}
      <motion.div
        className="relative z-10 w-[90%] max-w-sm rounded-3xl p-8 shadow-2xl"
        style={{
          background: "linear-gradient(135deg, #5b2ee0 0%, #6d45d4 50%, #7c5cc8 100%)",
        }}
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -10 }}
        transition={{
          duration: 0.4,
          type: "spring",
          stiffness: 300,
          damping: 25,
        }}
      >
        {/* Decorative elements */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-[#A6FF00]/15 rounded-full blur-2xl pointer-events-none" />

        <AnimatePresence mode="wait">
          {(phase === "expanding" || phase === "scanning") && (
            <motion.div
              key="document-scanner"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center gap-5"
            >
              {/* Document container with floating animation */}
              <motion.div
                className="relative"
                animate={{
                  y: [0, -6, 0],
                  rotate: [-0.5, 0.5, -0.5],
                }}
                transition={{
                  duration: 2.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                {/* Document SVG */}
                <svg
                  viewBox="0 0 80 100"
                  fill="none"
                  className="w-24 h-30 drop-shadow-xl"
                >
                  {/* Document shadow */}
                  <ellipse cx="40" cy="96" rx="25" ry="3" fill="rgba(0,0,0,0.15)" />

                  {/* Document body */}
                  <path
                    d="M12 8C12 4.68629 14.6863 2 18 2H50L68 20V92C68 95.3137 65.3137 98 62 98H18C14.6863 98 12 95.3137 12 92V8Z"
                    fill="white"
                    stroke="#e5e7eb"
                    strokeWidth="1.5"
                  />

                  {/* Folded corner */}
                  <path
                    d="M50 2V14C50 17.3137 52.6863 20 56 20H68"
                    fill="#f3f4f6"
                    stroke="#e5e7eb"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M50 2L68 20H56C52.6863 20 50 17.3137 50 14V2Z"
                    fill="#f9fafb"
                  />

                  {/* Text lines */}
                  <rect x="22" y="32" width="36" height="3.5" rx="1.75" fill="#d1d5db" />
                  <rect x="22" y="42" width="28" height="3.5" rx="1.75" fill="#e5e7eb" />
                  <rect x="22" y="52" width="32" height="3.5" rx="1.75" fill="#d1d5db" />
                  <rect x="22" y="62" width="22" height="3.5" rx="1.75" fill="#e5e7eb" />
                  <rect x="22" y="72" width="26" height="3.5" rx="1.75" fill="#d1d5db" />
                </svg>

                {/* Scanner line */}
                {phase === "scanning" && (
                  <motion.div
                    className="absolute left-1 right-1 h-1 rounded-full"
                    style={{
                      background: "linear-gradient(90deg, transparent 0%, #A6FF00 15%, #CDFF00 50%, #A6FF00 85%, transparent 100%)",
                      boxShadow: "0 0 15px 4px rgba(166, 255, 0, 0.6), 0 0 30px 8px rgba(166, 255, 0, 0.3)",
                    }}
                    initial={{ top: "8%" }}
                    animate={{
                      top: ["8%", "90%", "8%"],
                    }}
                    transition={{
                      duration: 1.6,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                )}

                {/* Corner scan brackets */}
                {phase === "scanning" && (
                  <>
                    <motion.div
                      className="absolute top-0 left-1 w-5 h-5 border-l-2 border-t-2 border-[#A6FF00] rounded-tl-md"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                    />
                    <motion.div
                      className="absolute top-0 right-1 w-5 h-5 border-r-2 border-t-2 border-[#A6FF00] rounded-tr-md"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: 0.2 }}
                    />
                    <motion.div
                      className="absolute bottom-5 left-1 w-5 h-5 border-l-2 border-b-2 border-[#A6FF00] rounded-bl-md"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: 0.4 }}
                    />
                    <motion.div
                      className="absolute bottom-5 right-1 w-5 h-5 border-r-2 border-b-2 border-[#A6FF00] rounded-br-md"
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: 0.6 }}
                    />
                  </>
                )}
              </motion.div>

              {/* Rotating status text */}
              <div className="h-6 relative overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={phraseIndex}
                    className="text-white/90 text-base font-medium text-center"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.3 }}
                  >
                    {STATUS_PHRASES[phraseIndex]}
                  </motion.p>
                </AnimatePresence>
              </div>

              {/* Progress bar */}
              <div className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: "linear-gradient(90deg, #A6FF00, #7DD600)",
                  }}
                  initial={{ width: "5%" }}
                  animate={{ width: "90%" }}
                  transition={{
                    duration: 12,
                    ease: "easeOut",
                  }}
                />
              </div>

              {/* Loading dots */}
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-[#A6FF00]"
                    animate={{
                      scale: [1, 1.4, 1],
                      opacity: [0.4, 1, 0.4],
                    }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      delay: i * 0.15,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}

          {phase === "done" && (
            <motion.div
              key="submitted"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                duration: 0.4,
                type: "spring",
                stiffness: 250,
                damping: 20,
              }}
              className="flex flex-col items-center gap-4"
            >
              {/* Success checkmark */}
              <motion.div
                className="w-20 h-20 rounded-full bg-[#A6FF00] flex items-center justify-center shadow-lg shadow-[#A6FF00]/30"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 15,
                  delay: 0.1,
                }}
              >
                <svg className="w-10 h-10 text-gray-800" viewBox="0 0 24 24" fill="none">
                  <motion.path
                    d="M5 13l4 4L19 7"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.35, delay: 0.25 }}
                  />
                </svg>
              </motion.div>

              <motion.h2
                className="text-white text-xl font-bold"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                Submitted!
              </motion.h2>

              <motion.p
                className="text-white/60 text-sm text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45 }}
              >
                Finding the best offers for you...
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>,
    document.body
  );
}

export default function AnimatedSubmitButton({
  isSubmitting,
  defaultText = "Get Loan Offers",
}: AnimatedSubmitButtonProps) {
  const [phase, setPhase] = useState<"idle" | "expanding" | "scanning" | "done">("idle");
  const [showOverlay, setShowOverlay] = useState(false);
  const wasSubmittingRef = useRef(false);

  useEffect(() => {
    if (isSubmitting && !wasSubmittingRef.current) {
      wasSubmittingRef.current = true;
      setShowOverlay(true);
      setPhase("expanding");

      setTimeout(() => {
        setPhase("scanning");
      }, 350);
    } else if (!isSubmitting && wasSubmittingRef.current) {
      wasSubmittingRef.current = false;
      setPhase("done");

      setTimeout(() => {
        setShowOverlay(false);
        setPhase("idle");
      }, 1200);
    }
  }, [isSubmitting]);

  return (
    <>
      <motion.button
        type="submit"
        disabled={phase !== "idle"}
        className="w-full font-semibold py-2.5 rounded-xl active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-black/10 text-gray-800"
        style={{
          background: "linear-gradient(88.52deg, #E1E4F3 -17.33%, #A6FF00 100%)",
        }}
        whileTap={{ scale: 0.98 }}
      >
        {defaultText}
        <span className="text-lg">&rarr;</span>
      </motion.button>

      <AnimatePresence>
        {showOverlay && phase !== "idle" && (
          <FullScreenLoader phase={phase as "expanding" | "scanning" | "done"} />
        )}
      </AnimatePresence>
    </>
  );
}
