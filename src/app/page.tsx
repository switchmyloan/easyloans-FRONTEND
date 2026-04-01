"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { AnimatePresence } from "framer-motion";
import type { Stage1Data, Stage2Data, AppStage } from "@/lib/types";
import { LOADING_DELAY_MS } from "@/lib/constants";
import {
  submitLead,
  getOffers,
  sendOtp,
  verifyOtp,
  mapLeadToFormDefaults,
  type PrefilledStage2,
} from "@/lib/api";

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
  const router = useRouter();
  const [stage, setStage] = useState<AppStage>("stage1");
  const [stage1Data, setStage1Data] = useState<Stage1Data | null>(null);
  const [stage2Defaults, setStage2Defaults] = useState<
    PrefilledStage2 | undefined
  >();
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpData, setOtpData] = useState<{ hashedOtp: string; expiresAt: number } | null>(null);

  const handleStage1 = useCallback(async (data: Stage1Data) => {
    setStage1Data(data);
    setApiError(null);
    setOtpError(null);

    try {
      const otpRes = await sendOtp(data.mobile);
      setOtpData(otpRes.data);
      setStage("otp");
    } catch (err) {
      console.error("Send OTP error:", err);
      const message =
        err instanceof Error ? err.message : "Failed to send OTP. Please try again.";
      setApiError(message);
    }
  }, []);

  const handleOtpVerify = useCallback(
    async (otp: string) => {
      if (!otpData || !stage1Data) return;
      setOtpError(null);

      try {
        await verifyOtp({
          otp,
          hashedOtp: otpData.hashedOtp,
          expiresAt: otpData.expiresAt,
        });

        // OTP verified — now submit lead and proceed
        setStage("loading");

        const response = await submitLead({
          name: stage1Data.name,
          phone: stage1Data.mobile,
          consent_tnc: stage1Data.consent_tnc,
          consent_credit: stage1Data.consent_credit,
          consent_communication: stage1Data.consent_communication,
        });

        if (response.data?.found && response.data.leads?.length > 0) {
          const lead = response.data.leads[0];
          const defaults = mapLeadToFormDefaults(lead);
          setStage2Defaults(defaults);
          setIsPrefilled(true);
        } else {
          const firstName = stage1Data.name.trim().split(/\s+/)[0] || "";
          setStage2Defaults({ first_name: firstName });
        }

        setTimeout(() => setStage("stage2"), LOADING_DELAY_MS);
      } catch (err) {
        console.error("OTP/Lead error:", err);
        const message =
          err instanceof Error ? err.message : "Something went wrong. Please try again.";
        setOtpError(message);
      }
    },
    [otpData, stage1Data]
  );

  const handleOtpResend = useCallback(async () => {
    if (!stage1Data) return;
    setOtpError(null);

    try {
      const otpRes = await sendOtp(stage1Data.mobile);
      setOtpData(otpRes.data);
    } catch (err) {
      console.error("Resend OTP error:", err);
      const message =
        err instanceof Error ? err.message : "Failed to resend OTP. Please try again.";
      setOtpError(message);
    }
  }, [stage1Data]);

  const handleStage2 = useCallback(
    async (data: Stage2Data) => {
      if (!stage1Data) return;
      setApiError(null);

      // Store profile for coupon selection on offers page
      sessionStorage.setItem("userProfile", data.profile);

      try {
        await getOffers({
          name: stage1Data.name,
          first_name: data.first_name,
          last_name: data.last_name,
          mobile: stage1Data.mobile,
          email: data.email,
          gender: data.gender,
          pincode: data.pincode,
          pan_no: data.pan_no,
          dob: data.dob,
          profile: data.profile,
          monthly_income: data.monthly_income,
          loan_purpose: data.loan_purpose,
          loan_amount: stage1Data.loan_amount,
        });

        // Only navigate to offers on successful API response
        router.push("/offers");
      } catch (err) {
        console.error("Get offers error:", err);
        const message =
          err instanceof Error ? err.message : "Something went wrong. Please try again.";
        setApiError(message);
      }
    },
    [stage1Data, router]
  );

  return (
    <>
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      <LeftPanel />

      <main className="flex-1 flex items-center justify-center px-4 py-8 sm:px-8 lg:px-12 relative">
        <AnimatePresence mode="wait">
          {stage === "loading" && <LoadingScreen key="loading" />}
        </AnimatePresence>

        {(stage === "stage1" || stage === "otp" || stage === "stage2") && (
          <div
            className={`w-full ${stage === "stage2" ? "max-w-[540px]" : "max-w-[460px]"}`}
          >
            <MobileHeader />

            {apiError && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {apiError}
              </div>
            )}

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
                  onBack={() => {
                    setStage("stage1");
                    setOtpError(null);
                  }}
                  error={otpError}
                />
              )}
              {stage === "stage2" && (
                <Stage2Form
                  key={isPrefilled ? "stage2-prefilled" : "stage2"}
                  onSubmit={handleStage2}
                  defaultValues={stage2Defaults}
                  isPrefilled={isPrefilled}
                />
              )}
            </AnimatePresence>

            <footer className="text-center text-gray-400 text-[11px] mt-6">
              Copyright &copy; 2025 SwitchMyLoan Pvt. Ltd. All Rights Reserved.
            </footer>
          </div>
        )}
      </main>

    </div>
       <GradientBanner />
    </>
  );
}
