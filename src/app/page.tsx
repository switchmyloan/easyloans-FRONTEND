"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import type { Stage1Data, Stage2Data, AppStage } from "@/lib/types";
import { LOADING_DELAY_MS } from "@/lib/constants";

import LeftPanel from "@/components/layout/LeftPanel";
import MobileHeader from "@/components/layout/MobileHeader";
import Stage1Form from "@/components/forms/Stage1Form";
import OtpForm from "@/components/forms/OtpForm";
import GradientBanner from "@/components/ui/GradientBanner";

const Stage2Form = dynamic(() => import("@/components/forms/Stage2Form"), {
  loading: () => (
    <div
      className="h-96 rounded-2xl shadow-2xl flex items-center justify-center text-white/50"
      style={{
        background:
          "linear-gradient(135deg, #5b2ee0 0%, #6d45d4 35%, #8b6fc0 70%, #9a85bd 100%)",
      }}
    >
      Loading...
    </div>
  ),
});

const LoadingScreen = dynamic(
  () => import("@/components/offers/LoadingScreen")
);

export default function Home() {
  const [stage, setStage] = useState<AppStage>("stage1");
  const [stage1Data, setStage1Data] = useState<Stage1Data | null>(null);

  const handleStage1 = useCallback(async (data: Stage1Data) => {
    setStage1Data(data);
    setStage("otp");
  }, []);

  const handleOtpVerify = useCallback(
    async (_otp: string) => {
      if (!stage1Data) return;
      setStage("loading");
      setTimeout(() => setStage("stage2"), LOADING_DELAY_MS);
    },
    [stage1Data]
  );

  const handleOtpResend = useCallback(async () => {
    // Template: no-op
  }, []);

  const handleStage2 = useCallback(async (_data: Stage2Data) => {
    setStage("success");
  }, []);

  const stage2Defaults = stage1Data
    ? { first_name: stage1Data.firstName, last_name: stage1Data.lastName }
    : undefined;

  return (
    <>
      <div className="min-h-screen flex flex-col lg:flex-row bg-white">
        <LeftPanel />

        <main className="flex-1 flex items-center justify-center px-4 py-8 sm:px-8 lg:px-12 relative">
          <AnimatePresence mode="wait">
            {stage === "loading" && <LoadingScreen key="loading" />}
          </AnimatePresence>

          {(stage === "stage1" ||
            stage === "otp" ||
            stage === "stage2" ||
            stage === "success") && (
            <div
              className={`w-full ${stage === "stage2" ? "max-w-[540px]" : "max-w-[460px]"}`}
            >
              <MobileHeader />

              <AnimatePresence mode="wait">
                {stage === "stage1" && (
                  <Stage1Form
                    key="stage1"
                    onSubmit={handleStage1}
                    defaultValues={stage1Data ?? undefined}
                  />
                )}
                {stage === "otp" && stage1Data && (
                  <OtpForm
                    key="otp"
                    mobile={stage1Data.mobile}
                    onVerify={handleOtpVerify}
                    onResend={handleOtpResend}
                    onBack={() => setStage("stage1")}
                  />
                )}
                {stage === "stage2" && (
                  <Stage2Form
                    key="stage2"
                    onSubmit={handleStage2}
                    defaultValues={stage2Defaults}
                  />
                )}
                {stage === "success" && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="w-full rounded-2xl px-7 sm:px-10 py-12 relative overflow-hidden shadow-2xl shadow-[#4d2adf]/20 text-center"
                    style={{
                      background:
                        "linear-gradient(135deg, #5b2ee0 0%, #6d45d4 35%, #8b6fc0 70%, #9a85bd 100%)",
                    }}
                  >
                    <div className="w-16 h-16 bg-white/15 rounded-full flex items-center justify-center mx-auto mb-5">
                      <svg
                        className="w-8 h-8 text-[#A6FF00]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <h2 className="text-white text-[22px] font-semibold mb-2">
                      Form submitted
                    </h2>
                    <p className="text-white/60 text-sm">
                      Template flow complete. Hook this up to your backend to
                      continue.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setStage1Data(null);
                        setStage("stage1");
                      }}
                      className="mt-7 px-5 py-2.5 bg-white text-gray-800 text-sm font-semibold rounded-xl hover:bg-gray-50 active:scale-[0.98] transition-all cursor-pointer"
                    >
                      Start over
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <footer className="text-center text-gray-400 text-[11px] mt-6">
                Copyright &copy; 2026 SwitchMyLoan Pvt. Ltd. All Rights
                Reserved.
              </footer>
            </div>
          )}
        </main>
      </div>
      <GradientBanner />
    </>
  );
}
