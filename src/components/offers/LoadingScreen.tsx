"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

const steps = [
  { text: "Connecting to Partners...", icon: "satellite" },
  { text: "Verifying your details...", icon: "shield" },
  { text: "Checking your credit eligibility...", icon: "kreditbee" },
  { text: "Preparing your offers...", icon: "gift" },
];

function StepIcon({ type }: { type: string }) {
  switch (type) {
    case "satellite":
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.348 14.651a3.75 3.75 0 010-5.303m5.304 0a3.75 3.75 0 010 5.303m-7.425 2.122a6.75 6.75 0 010-9.546m9.546 0a6.75 6.75 0 010 9.546M5.106 18.894c-3.808-3.808-3.808-9.98 0-13.789m13.788 0c3.808 3.808 3.808 9.981 0 13.79M12 12h.008v.007H12V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
      );
    case "shield":
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      );
    case "kreditbee":
      return <span className="text-xs font-bold">KB</span>;
    case "moneyview":
      return <span className="text-xs font-bold">MV</span>;
    case "gift":
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a4 4 0 00-4-4 4 4 0 004 4zm0 0V6a4 4 0 014-4 4 4 0 01-4 4zm-8 4h16M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
        </svg>
      );
    default:
      return null;
  }
}

export default function LoadingScreen() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 550);
    return () => clearInterval(interval);
  }, []);

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: "linear-gradient(135deg, #f8f9ff 0%, #f0edff 50%, #f5f3ff 100%)",
      }}
    >
      <div className="flex flex-col items-center w-full max-w-sm px-6">
        {/* Animated satellite icon */}
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="relative mb-8"
        >
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#6232FF]/10 to-[#6232FF]/5 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#6232FF]/20 to-[#6232FF]/10 flex items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6232FF] to-[#4d2adf] flex items-center justify-center shadow-lg shadow-[#6232FF]/30"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.348 14.651a3.75 3.75 0 010-5.303m5.304 0a3.75 3.75 0 010 5.303m-7.425 2.122a6.75 6.75 0 010-9.546m9.546 0a6.75 6.75 0 010 9.546M5.106 18.894c-3.808-3.808-3.808-9.98 0-13.789m13.788 0c3.808 3.808 3.808 9.981 0 13.79M12 12h.008v.007H12V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </motion.div>
            </div>
          </div>
          {/* Pulse rings */}
          <motion.div
            animate={{ scale: [1, 1.5], opacity: [0.3, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 rounded-full border-2 border-[#6232FF]/20"
          />
          <motion.div
            animate={{ scale: [1, 1.8], opacity: [0.2, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            className="absolute inset-0 rounded-full border-2 border-[#6232FF]/10"
          />
        </motion.div>

        {/* Title */}
        {/* <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-gray-900 mb-1"
        >
          Fetching your data
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-gray-400 text-sm mb-8"
        >
          via Satekkite secure gateway
        </motion.p> */}

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-gray-200 rounded-full mb-6 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#6232FF] to-[#A6FF00]"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>

        {/* Step checklist */}
        <div className="w-full space-y-2.5">
          {steps.map((step, i) => (
            <motion.div
              key={step.text}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: i <= currentStep ? 1 : 0.3, x: 0 }}
              transition={{ delay: i * 0.1, duration: 0.3 }}
              className="flex items-center gap-3"
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                  i < currentStep
                    ? "bg-emerald-100 text-emerald-600"
                    : i === currentStep
                      ? "bg-[#6232FF] text-white shadow-md shadow-[#6232FF]/20"
                      : "bg-gray-100 text-gray-400"
                }`}
              >
                {i < currentStep ? (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <StepIcon type={step.icon} />
                )}
              </div>
              <AnimatePresence mode="wait">
                <motion.span
                  key={`${step.text}-${i <= currentStep}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`text-sm transition-colors duration-300 ${
                    i < currentStep
                      ? "text-emerald-600 font-medium"
                      : i === currentStep
                        ? "text-gray-800 font-medium"
                        : "text-gray-400"
                  }`}
                >
                  {i < currentStep ? step.text.replace("...", "") + " ✓" : step.text}
                </motion.span>
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Partner logos */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="flex items-center gap-4 mt-8 pt-6 border-t border-gray-200 w-full justify-center"
        >
          <div className="px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-100">
            <img src="/kreditbee-logo.svg" alt="KreditBee" className="h-5 w-auto" />
          </div>
          <div className="px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-100">
            <img src="/moneyview-logo.svg" alt="MoneyView" className="h-5 w-auto" />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
