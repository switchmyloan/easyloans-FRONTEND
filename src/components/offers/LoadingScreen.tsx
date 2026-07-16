"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const steps = [
  {
    title: "Connecting to trusted partners",
    subtitle: "Secure channel established",
  },
  {
    title: "Verifying your details",
    subtitle: "Information verified successfully",
  },
  {
    title: "Checking your credit eligibility",
    subtitle: "Analysing your credit profile",
  },
  {
    title: "Preparing your offers",
    subtitle: "Almost there...",
  },
];

const partnerLogos = [
  { name: "KreditBee", src: "/kreditbee-logo.svg" },
  { name: "Moneyview", src: "/moneyview-logo.svg" },
  { name: "IDFC First Bank", src: "/idfc.svg" },
  { name: "Hero Fincorp", src: "/hero.webp" },
  { name: "Poonawalla Fincorp", src: "/poonawalla.svg" },
  { name: "True Balance", src: "/true.webp" },
  // { name: "Olyv", src: "/olyv.png" },
  { name: "Zype", src: "/zype.png" },
  { name: "LendingPlate", src: "/lending.png" },
  { name: "MoneyDot", src: "/moneydot1.png" },
  { name: "TrueFund", src: "/truefund.svg" },
  { name: "Vivifi", src: "/vivifi.webp" },

];

export default function LoadingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        if (oldProgress >= 100) {
          clearInterval(timer);
          return 100;
        }

        const diff = Math.random() * 6;
        const nextProgress = Math.min(oldProgress + diff, 100);

        const stepIndex = Math.floor(
          (nextProgress / 100) * steps.length
        );

        if (stepIndex < steps.length && stepIndex !== currentStep) {
          setCurrentStep(stepIndex);
        }

        return nextProgress;
      });
    }, 220);

    return () => clearInterval(timer);
  }, [currentStep]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden px-4"
      style={{
        background:
          "radial-gradient(circle at center, #ede9fe 0%, #ddd6fe 45%, #c4b5fd 100%)",
      }}
    >

      {/* Main Scan Card */}
     <motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{
    opacity: 1,
    y: [0, -10, 0],
  }}
  transition={{
    opacity: { duration: 0.5 },
    y: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut",
    },
  }}
  exit={{ opacity: 0 }}
  className="relative w-full max-w-[320px] overflow-hidden rounded-[28px] border border-white/50 bg-white shadow-[0_20px_60px_rgba(79,70,229,0.18)] backdrop-blur-2xl"
>
        {/* Global Scan Line Container */}
        <div className="absolute inset-0 z-50 pointer-events-none overflow-hidden rounded-[28px]">
          {/* Soft Wide Glow */}
          <motion.div
            initial={{ y: "-100%" }}
            animate={{ y: "100%" }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute inset-x-0 h-32 top-0"

          />

          {/* Sharp Beam Line */}
          <motion.div
            initial={{ y: "0%" }}
            animate={{ y: "380px" }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute left-0 right-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/80 to-transparent shadow-[0_0_12px_rgba(99,102,241,0.8)]"
          />
        </div>

        {/* Soft Glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white to-indigo-50/60" />



        {/* Noise Overlay */}
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none bg-[url('/noise.png')]" />

        {/* Content */}
        <div className="relative z-40 px-4 py-4">

          {/* Top Icon */}
          <div className="flex justify-center mb-4">
            <div className="relative w-18 h-18 flex items-center justify-center">

              <motion.div
                animate={{
                  scale: [1, 1.12, 1],
                  opacity: [0.25, 0.45, 0.25],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 rounded-full bg-indigo-400 blur-2xl"
              />

              <div className="absolute w-14 h-14 rounded-full border border-indigo-200 animate-[spin_14s_linear_infinite]" />
              <div className="absolute w-9 h-9 rounded-full border border-indigo-300 animate-[spin_10s_linear_infinite_reverse]" />

              <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-b from-indigo-600 to-indigo-800 shadow-xl shadow-indigo-500/30">
                <svg
                  className="w-4 h-4 text-white animate-pulse"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.348 14.651a3.75 3.75 0 010-5.303m5.304 0a3.75 3.75 0 010 5.303m-7.425 2.122a6.75 6.75 0 010-9.546m9.546 0a6.75 6.75 0 010 9.546"
                  />
                </svg>
              </div>

              <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-lime-400 shadow-[0_0_16px_rgba(163,230,53,0.8)]" />
            </div>
          </div>

          {/* Heading */}
          <div className="text-center">
            <h2 className="text-[17px] font-black tracking-tight text-slate-900 leading-tight">
              Unlocking your best loan options ✨
            </h2>

            <p className="mt-1 text-[11px] font-medium text-slate-500">
              Securely matching you with verified lending partners
            </p>
          </div>

          {/* Progress */}
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                Processing
              </span>

              <span className="text-sm font-black text-indigo-700">
                {Math.round(progress)}%
              </span>
            </div>

            <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 p-[2px] shadow-inner">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-lime-400"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Steps */}
          <div className="mt-4 space-y-2">
            {steps.slice(0, 3).map((step, i) => {
              const isCompleted = i < currentStep;
              const isActive = i === currentStep;

              return (
                <motion.div
                  key={step.title}
                  animate={{
                    scale: isActive ? 1.015 : 1,
                  }}
                  transition={{ duration: 0.25 }}
                  className={`relative overflow-hidden rounded-lg border px-2.5 py-2 transition-all duration-300 ${isActive
                    ? "border-indigo-200 bg-indigo-50/70 shadow-md shadow-indigo-100"
                    : isCompleted
                      ? "border-emerald-100 bg-emerald-50/60"
                      : "border-slate-100 bg-white/70"
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">

                      {/* Status */}
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-full ${isCompleted
                          ? "bg-emerald-500 text-white"
                          : isActive
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-200 text-slate-500"
                          }`}
                      >
                        {isCompleted ? (
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            strokeWidth={3}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        ) : isActive ? (
                          <svg
                            className="w-3.5 h-3.5 animate-spin"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                            />
                          </svg>
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-slate-500" />
                        )}
                      </div>

                      {/* Text */}
                      <div>
                        <p className={`text-[12px] font-bold ${isActive || isCompleted
                          ? "text-slate-800"
                          : "text-slate-500"
                          }`}
                        >
                          {step.title}
                        </p>

                        <p className={`text-[10px] ${isCompleted
                          ? "text-emerald-600"
                          : isActive
                            ? "text-indigo-600"
                            : "text-slate-400"
                          }`}
                        >
                          {step.subtitle}
                        </p>
                      </div>
                    </div>

                    {(isCompleted || isActive) && (
                      <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(74,222,128,0.8)]" />
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>



          {/* Partners */}
          <div className="mt-4 border-t border-slate-100 pt-3">
            <p className="mb-2.5 text-center text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">
              Trusted Lending Partners
            </p>

            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {partnerLogos.map((logo) => (
                <div
                  key={logo.name}
                  className="flex items-center justify-center rounded-md border border-slate-100 bg-white px-2 py-1 shadow-sm"
                >
                  <img
                    src={logo.src}
                    alt={logo.name}
                    className="h-3 w-auto object-contain opacity-90"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
