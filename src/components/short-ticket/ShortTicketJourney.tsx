"use client";

import { useCallback, useEffect, useRef, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { AnimatePresence } from "framer-motion";
import type { Stage1Data, Stage2Data, AppStage } from "@/lib/types";
import { LOADING_DELAY_MS } from "@/lib/constants";
import {
  sendOtp,
  verifyOtp,
  getOfferShortTicket,
  saveShortDraftLead,
  submitLead,
  mapLeadToFormDefaults,
  checkExistingUser,
  getExistingShortUserDetails,
  type SendOtpResponse,
  type PrefilledStage2,
} from "@/lib/api";

import Stage1Form from "@/components/forms/Stage1Form";
import OtpForm from "@/components/forms/OtpForm";

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

function ApiErrorBanner({ message }: { message: string }) {
  return (
    <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
      <svg
        className="w-4 h-4 shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      {message}
    </div>
  );
}

export default function ShortTicketJourney() {
  return (
    <Suspense fallback={<div className="w-full max-w-md" />}>
      <ShortTicketJourneyContent />
    </Suspense>
  );
}

function ShortTicketJourneyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [stage, setStage] = useState<AppStage>("stage1");
  const [stage1Data, setStage1Data] = useState<Stage1Data | null>(null);
  const [otpData, setOtpData] = useState<SendOtpResponse["data"] | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [prefilledStage2, setPrefilledStage2] = useState<PrefilledStage2 | null>(null);

  const stage1DraftRef = useRef<Partial<Stage1Data>>({});
  const stage2DraftRef = useRef<Partial<Stage2Data>>({});
  const draftTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Effect to capture UTM params from URL and store in sessionStorage
  useEffect(() => {
    const utmMedium = searchParams.get("utm_medium");
    const utmSource = searchParams.get("utm_source");
    const utmCampaign = searchParams.get("utm_campaign");
    const utmContent = searchParams.get("utm_content");
    const utmTerm = searchParams.get("utm_term");

    if (utmMedium) sessionStorage.setItem("utm_medium", utmMedium);
    if (utmSource) sessionStorage.setItem("utm_source", utmSource);
    if (utmCampaign) sessionStorage.setItem("utm_campaign", utmCampaign);
    if (utmContent) sessionStorage.setItem("utm_content", utmContent);
    if (utmTerm) sessionStorage.setItem("utm_term", utmTerm);
  }, [searchParams]);

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
      // Stage 1 no longer collects a name, so stage 2 is the only source left —
      // fullName is composed from it rather than carried down from stage 1.
      fullName:
        [s2.first_name, s2.last_name].filter(Boolean).join(" ") || undefined,
      firstName: s2.first_name,
      lastName: s2.last_name,
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

  useEffect(() => {
    return () => {
      if (draftTimerRef.current) clearTimeout(draftTimerRef.current);
    };
  }, []);

  const handleStage1Change = useCallback(
    (data: Partial<Stage1Data>) => {
      stage1DraftRef.current = { ...stage1DraftRef.current, ...data };
    },
    []
  );

  const handleStage2Change = useCallback(
    (data: Partial<Stage2Data>) => {
      stage2DraftRef.current = { ...stage2DraftRef.current, ...data };
    },
    []
  );

  const handleStage1 = useCallback(async (data: Stage1Data) => {
    setStage1Data(data);
    setApiError(null);
    setOtpError(null);
    stage1DraftRef.current = { ...stage1DraftRef.current, ...data };

    // Try to get prefilled data from existing lead
    try {
      const leadRes = await submitLead({
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

    // Send OTP
    try {
      const res = await sendOtp(data.mobile);
      setOtpData(res.data);
      setStage("otp");
    } catch (err) {
      console.error("sendOtp failed:", err);
      const message = err instanceof Error ? err.message : "Failed to send OTP. Please try again.";
      setApiError(message);
    }
  }, []);

  const handleOtpVerify = useCallback(
    async (otp: string) => {
      console.log("otp:", otp);
      if (!stage1Data || !otpData) return;
      setOtpError(null);
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

        // Save draft after OTP verification
        await saveShortDraftLead({
          phone: stage1Data.mobile,
          loan_amount: stage1Data.loan_amount,
          consent_tnc: stage1Data.consent_tnc,
          consent_credit: stage1Data.consent_credit,
          consent_communication: stage1Data.consent_communication,
        });
      } catch (err) {
        console.error("verifyOtp failed:", err);
        setOtpError(err instanceof Error ? err.message : "Invalid OTP. Please try again.");
        return;
      }

      // Check for existing user (lightweight check)
      try {
        const checkUserResponse = await checkExistingUser(stage1Data.mobile);
        const userExists = checkUserResponse.data.exists;

        if (userExists) {
          // Fetch existing user details
          await getExistingShortUserDetails(stage1Data.mobile);

          // Returning user - mark as OTP verified
          sessionStorage.setItem("dashboardOtpVerified", "true");
          sessionStorage.setItem("dashboardRequiresLogin", "false");
          sessionStorage.setItem("shortDashboardRequiresLogin", "false");
          sessionStorage.removeItem("shortDashboardLinkToken");

          // Redirect to dashboard
          router.push("/dashboard");
          return;
        }
      } catch (err) {
        // If check fails, continue with normal flow (new user)
        console.warn("checkExistingUser failed:", err);
      }

      // New user - continue to stage2
      setStage("loading");
      setTimeout(() => setStage("stage2"), LOADING_DELAY_MS);
    },
    [stage1Data, otpData, router]
  );

  const handleOtpResend = useCallback(async () => {
    if (!stage1Data) return;
    setOtpError(null);
    try {
      const res = await sendOtp(stage1Data.mobile);
      setOtpData(res.data);
    } catch (err) {
      console.error("sendOtp failed:", err);
      const message = err instanceof Error ? err.message : "Failed to resend OTP. Please try again.";
      setOtpError(message);
    }
  }, [stage1Data]);

  const handleOtpBack = useCallback(() => {
    setOtpError(null);
    setStage("stage1");
  }, []);

  const handleStage2 = useCallback(
    async (data: Stage2Data) => {
      if (!stage1Data) return;
      setApiError(null);

      const dobStr =
        data.dob instanceof Date
          ? data.dob.toISOString().split("T")[0]
          : String(data.dob);

      stage2DraftRef.current = { ...stage2DraftRef.current, ...data };

      // Save draft before API call
      try {
        await saveShortDraftLead(buildDraftPayload());
      } catch (err) {
        console.warn("saveShortDraftLead (stage2) failed:", err);
      }

      // Get UTM params from sessionStorage
      const utmSource = sessionStorage.getItem("utm_source");
      const utmMedium = sessionStorage.getItem("utm_medium");
      const utmCampaign = sessionStorage.getItem("utm_campaign");
      const utmContent = sessionStorage.getItem("utm_content");
      const utmTerm = sessionStorage.getItem("utm_term");

      // Show loading state
      setStage("loading");

      try {
        await getOfferShortTicket({
          firstName: data.first_name,
          lastName: data.last_name,
          mobileNumber: stage1Data.mobile,
          email: data.email,
          dateOfBirth: dobStr,
          panNumber: data.pan_no.toUpperCase(),
          gender: data.gender.toUpperCase(),
          pincode: data.pincode,
          jobType: data.profile.toUpperCase().replace(/\s+/g, "_"),
          isSalaried: data.profile === "Salaried",
          monthlySalary: Number(data.monthly_income),
          loanAmount: Number(stage1Data.loan_amount),
          loanPurpose: data.loan_purpose,
          utm_source: utmSource,
          utm_medium: utmMedium,
          utm_campaign: utmCampaign,
          utm_content: utmContent,
          utm_term: utmTerm,
        });
        router.push("/short-ticket/offers");
      } catch (err) {
        console.error("getOfferShortTicket failed:", err);
        const message = err instanceof Error ? err.message : "Something went wrong. Please try again.";
        setApiError(message);
        setStage("stage2");
      }
    },
    [stage1Data, router, buildDraftPayload]
  );

  const stage2Defaults = stage1Data
    ? {
        first_name: prefilledStage2?.first_name,
        last_name: prefilledStage2?.last_name,
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

  const showFormStage = stage === "stage1" || stage === "otp" || stage === "stage2";

  // Loading screen renders full-screen
  if (stage === "loading") {
    return <LoadingScreen />;
  }

  // Form stages render inline
  return (
    <>
      {showFormStage && (
        <div className="w-full max-w-md 2xl:max-w-lg 3xl:max-w-xl">
          {apiError && <ApiErrorBanner message={apiError} />}

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
                onBack={handleOtpBack}
                error={otpError}
              />
            )}
            {stage === "stage2" && (
              <Stage2Form
                key={prefilledStage2 ? "stage2-prefilled" : "stage2"}
                onSubmit={handleStage2}
                onChange={handleStage2Change}
                defaultValues={stage2Defaults}
                isPrefilled={Boolean(prefilledStage2)}
              />
            )}
          </AnimatePresence>

          <footer className="text-center text-gray-400 text-[10px] mt-2 2xl:text-xs 2xl:mt-3 3xl:text-sm 3xl:mt-4">
            Copyright &copy; 2026 SwitchMyLoan Pvt. Ltd. All Rights Reserved.
          </footer>
        </div>
      )}
    </>
  );
}
