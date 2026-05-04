"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import type { Stage1Data, Stage2Data, AppStage } from "@/lib/types";
import { LOADING_DELAY_MS } from "@/lib/constants";
import {
  sendOtp,
  verifyOtp,
  getOfferShortTicket,
  saveShortDraftLead,
  submitLead,
  mapLeadToFormDefaults,
  type SendOtpResponse,
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
  const [otpData, setOtpData] = useState<SendOtpResponse["data"] | null>(null);
  const [prefilledStage2, setPrefilledStage2] = useState<PrefilledStage2 | null>(null);

  const stage1DraftRef = useRef<Partial<Stage1Data>>({});
  const stage2DraftRef = useRef<Partial<Stage2Data>>({});
  const draftTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const buildDraftPayload = useCallback(() => {
    const s1 = stage1DraftRef.current;
    const s2 = stage2DraftRef.current;

    const dobStr =
      s2.dob instanceof Date
        ? s2.dob.toISOString().split("T")[0]
        : typeof s2.dob === "string"
          ? s2.dob
          : undefined;

    return {
      fullName: s1.fullName,
      firstName: s2.first_name || s1.firstName,
      lastName: s2.last_name || s1.lastName,
      phone: s1.mobile,
      email: s2.email,
      pan_no: s2.pan_no,
      dob: dobStr,
      gender: s2.gender,
      pincode: s2.pincode,
      profile: s2.profile,
      monthly_income:
        typeof s2.monthly_income === "number" ? s2.monthly_income : undefined,
      loan_purpose: s2.loan_purpose,
      loan_amount:
        typeof s1.loan_amount === "number" ? s1.loan_amount : undefined,
      consent_tnc: s1.consent_tnc,
      consent_credit: s1.consent_credit,
      consent_communication: s1.consent_communication,
    };
  }, []);

  const scheduleDraftSave = useCallback(() => {
    if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    draftTimerRef.current = setTimeout(() => {
      saveShortDraftLead(buildDraftPayload());
    }, 600);
  }, [buildDraftPayload]);

  useEffect(() => {
    return () => {
      if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    };
  }, []);

  const handleStage1Change = useCallback(
    (data: Partial<Stage1Data>) => {
      stage1DraftRef.current = { ...stage1DraftRef.current, ...data };
      scheduleDraftSave();
    },
    [scheduleDraftSave]
  );

  const handleStage2Change = useCallback(
    (data: Partial<Stage2Data>) => {
      stage2DraftRef.current = { ...stage2DraftRef.current, ...data };
      scheduleDraftSave();
    },
    [scheduleDraftSave]
  );

  const handleStage1 = useCallback(async (data: Stage1Data) => {
    setStage1Data(data);
    stage1DraftRef.current = { ...stage1DraftRef.current, ...data };
    try {
      const leadRes = await submitLead({
        name: data.fullName,
        phone: data.mobile,
        consent_tnc: data.consent_tnc,
        consent_credit: data.consent_credit,
        consent_communication: data.consent_communication,
      });
      const lead = leadRes.data?.found ? leadRes.data.leads?.[0] : undefined;
      if (lead) {
        setPrefilledStage2(mapLeadToFormDefaults(lead));
      } else {
        setPrefilledStage2(null);
      }
    } catch (err) {
      console.warn("submitLead (stage1) failed:", err);
      setPrefilledStage2(null);
    }
    try {
      await saveShortDraftLead({
        fullName: data.fullName,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.mobile,
        loan_amount: data.loan_amount,
        consent_tnc: data.consent_tnc,
        consent_credit: data.consent_credit,
        consent_communication: data.consent_communication,
      });
    } catch (err) {
      console.warn("saveShortDraftLead (stage1) failed:", err);
    }
    try {
      const res = await sendOtp(data.mobile);
      setOtpData(res.data);
    } catch (err) {
      console.error("sendOtp failed:", err);
    }
    setStage("otp");
  }, []);

  const handleOtpVerify = useCallback(
    async (otp: string) => {
      if (!stage1Data || !otpData) return;
      try {
        await verifyOtp({
          otp,
          hashedOtp: otpData.hashedOtp,
          expiresAt: otpData.expiresAt,
          mobileNumber: stage1Data.mobile,
          sessionId:
            typeof window !== "undefined"
              ? sessionStorage.getItem("leadDraftSessionId") || undefined
              : undefined,
          shortSessionId:
            typeof window !== "undefined"
              ? sessionStorage.getItem("shortLeadDraftSessionId") || undefined
              : undefined,
        });
      } catch (err) {
        console.error("verifyOtp failed:", err);
      }
      setStage("loading");
      setTimeout(() => setStage("stage2"), LOADING_DELAY_MS);
    },
    [stage1Data, otpData]
  );

  const handleOtpResend = useCallback(async () => {
    if (!stage1Data) return;
    try {
      const res = await sendOtp(stage1Data.mobile);
      setOtpData(res.data);
    } catch (err) {
      console.error("sendOtp failed:", err);
    }
  }, [stage1Data]);

  const handleStage2 = useCallback(
    async (data: Stage2Data) => {
      if (!stage1Data) return;

      const dobStr =
        data.dob instanceof Date
          ? data.dob.toISOString().split("T")[0]
          : String(data.dob);

      stage2DraftRef.current = { ...stage2DraftRef.current, ...data };
      try {
        await saveShortDraftLead(buildDraftPayload());
      } catch (err) {
        console.warn("saveShortDraftLead (stage2) failed:", err);
      }

      try {
        await getOfferShortTicket({
          firstName: data.first_name,
          lastName: data.last_name,
          mobileNumber: stage1Data.mobile,
          email: data.email,
          dateOfBirth: dobStr,
          panNumber: data.pan_no,
          gender: data.gender.toUpperCase(),
          pincode: data.pincode,
          jobType: data.profile.toUpperCase().replace(/\s+/g, "_"),
          isSalaried: data.profile === "Salaried",
          monthlySalary: Number(data.monthly_income),
          loanAmount: Number(stage1Data.loan_amount),
          loanPurpose: data.loan_purpose,
        });
        router.push("/short-ticket/offers");
      } catch (err) {
        console.error("getOfferShortTicket failed:", err);
      }
    },
    [stage1Data, router, buildDraftPayload]
  );

  const stage2Defaults = stage1Data
    ? {
        first_name: prefilledStage2?.first_name || stage1Data.firstName,
        last_name: prefilledStage2?.last_name || stage1Data.lastName,
        ...(prefilledStage2?.email ? { email: prefilledStage2.email } : {}),
        ...(prefilledStage2?.gender ? { gender: prefilledStage2.gender } : {}),
        ...(prefilledStage2?.pincode ? { pincode: prefilledStage2.pincode } : {}),
        ...(prefilledStage2?.pan_no ? { pan_no: prefilledStage2.pan_no } : {}),
        ...(prefilledStage2?.dob ? { dob: prefilledStage2.dob } : {}),
        ...(prefilledStage2?.profile ? { profile: prefilledStage2.profile } : {}),
        ...(typeof prefilledStage2?.monthly_income === "number"
          ? { monthly_income: prefilledStage2.monthly_income }
          : {}),
      }
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
                    onChange={handleStage1Change}
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
                    onChange={handleStage2Change}
                    defaultValues={stage2Defaults}
                    isPrefilled={Boolean(prefilledStage2)}
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
                        setPrefilledStage2(null);
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
