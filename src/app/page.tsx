"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence } from "framer-motion";
import type { Stage1Data, Stage2Data, AppStage } from "@/lib/types";
import { LOADING_DELAY_MS } from "@/lib/constants";

import LeftPanel from "@/components/layout/LeftPanel";
import MobileHeader from "@/components/layout/MobileHeader";
import TrustBadges from "@/components/ui/TrustBadges";
import Stage1Form from "@/components/forms/Stage1Form";

const Stage2Form = dynamic(() => import("@/components/forms/Stage2Form"), {
  loading: () => (
    <div className="h-96 rounded-2xl shadow-2xl flex items-center justify-center text-white/50"
      style={{ background: "linear-gradient(135deg, #5b2ee0 0%, #6d45d4 35%, #8b6fc0 70%, #9a85bd 100%)" }}>
      Loading...
    </div>
  ),
});

const LoadingScreen = dynamic(() => import("@/components/offers/LoadingScreen"));

const SuccessScreen = dynamic(() => import("@/components/offers/SuccessScreen"), {
  loading: () => (
    <div className="h-96 flex items-center justify-center text-gray-400">Loading offers...</div>
  ),
});

export default function Home() {
  const [stage, setStage] = useState<AppStage>("stage1");
  const [stage1Data, setStage1Data] = useState<Stage1Data | null>(null);

  const handleStage1 = useCallback((data: Stage1Data) => {
    setStage1Data(data);
    setStage("loading");
    setTimeout(() => setStage("stage2"), LOADING_DELAY_MS);
  }, []);

  const handleStage2 = useCallback(
    (data: Stage2Data) => {
      const fullData = { ...stage1Data, ...data };
      console.log("Full application data:", fullData);
      setStage("success");
    },
    [stage1Data]
  );

  // Full-screen offers
  if (stage === "success") {
    return (
      <main className="min-h-screen bg-gray-50 py-10 px-4 sm:px-8">
        <div className="max-w-3xl mx-auto">
          <SuccessScreen />
          <TrustBadges />
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      <LeftPanel />

      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:px-8 lg:px-12 relative">
        <AnimatePresence mode="wait">
          {stage === "loading" && <LoadingScreen key="loading" />}
        </AnimatePresence>

        {(stage === "stage1" || stage === "stage2") && (
          <div className={`w-full ${stage === "stage2" ? "max-w-[540px]" : "max-w-[460px]"}`}>
            <MobileHeader />

            <AnimatePresence mode="wait">
              {stage === "stage1" && (
                <Stage1Form
                  key="stage1"
                  onSubmit={handleStage1}
                  defaultValues={stage1Data ?? undefined}
                />
              )}
              {stage === "stage2" && (
                <Stage2Form key="stage2" onSubmit={handleStage2} />
              )}
            </AnimatePresence>

            <footer className="text-center text-gray-400 text-[11px] mt-6">
              Copyright &copy; 2025 SwitchMyLoan Pvt. Ltd. All Rights Reserved.
            </footer>
          </div>
        )}
      </main>
    </div>
  );
}
