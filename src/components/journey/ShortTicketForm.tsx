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
  getExistingShortUserOffer,
  type SendOtpResponse,
  type PrefilledStage2,
} from "@/lib/api";

import { 
 cleverTapOnUserLogin,
  cleverTapUpdateProfile,
  cleverTapTrackEvent,
  cleverTapInitWebPush,
  saveCleverTapLoginProfile,
  syncCleverTapFromSession,
  CLEVERTAP_EVENTS,
  type CleverTapLoginProfile,
 } from "@/lib/clevertap";


import Stage1Form from "@/components/forms/Stage1Form";
import OtpForm from "@/components/forms/OtpForm";

const GENDER_TO_CLEVERTAP: Record<string, "M" | "F" | undefined> = {
  Male: "M",
  Female: "F",
};
// Dedupe the "Landed" event across React's dev double-invoke of effects. Resets
// on a full page reload (module re-eval), so each real page load fires once.
let hasTrackedLanding = false;

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

export default function ShortTicketForm() {
  return (
    <Suspense fallback={<div className="w-full max-w-md" />}>
      <ShortTicketFormContent />
    </Suspense>
  );
}

function ShortTicketFormContent() {
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

  // Track if OTP was verified (prevents drop-off event after verification)
  const hasVerifiedOtpRef = useRef(false);

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

  // CleverTap: Track page landing and drop-off
  useEffect(() => {
    // Fire "Page Viewed" once on mount
    if (!hasTrackedLanding) {
      hasTrackedLanding = true;
      cleverTapTrackEvent(CLEVERTAP_EVENTS.LANDED, { URL: window.location.href });
    }

    // Track drop-off if user leaves without verifying OTP
    let firedDropoff = false;
    const handleExit = () => {
      if (firedDropoff || hasVerifiedOtpRef.current) return;
      firedDropoff = true;
      cleverTapTrackEvent(CLEVERTAP_EVENTS.LANDED_NO_OTP);
    };

    window.addEventListener("pagehide", handleExit);
    return () => window.removeEventListener("pagehide", handleExit);
  }, []);

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
    setApiError(null);
    setOtpError(null);
    stage1DraftRef.current = { ...stage1DraftRef.current, ...data };

    // Try to get prefilled data from existing lead
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

    // Save draft lead for short ticket
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

        const loginProfile: CleverTapLoginProfile = {
          Name: stage1Data.fullName,
          Identity: stage1Data.mobile,
          Phone: `+91${stage1Data.mobile}`,
          "MSG-push": stage1Data.consent_communication,
          "MSG-sms": stage1Data.consent_communication,
          "MSG-whatsapp": stage1Data.consent_communication,
          // Custom project fields (not part of the reserved Site keys)
          "Loan Amount Requested": stage1Data.loan_amount,
        };
        saveCleverTapLoginProfile(loginProfile);
        cleverTapOnUserLogin(loginProfile);
        // Web Push may already have been subscribed anonymously (before this
        // Identity existed) by the global FirebaseNotifications mount — redo
        // it now so the subscription attaches to the identified profile.
        // Fire-and-forget: never block the OTP flow on this.
        void cleverTapInitWebPush();

        // Mark OTP as verified (prevents drop-off event)
        hasVerifiedOtpRef.current = true;

        // Track OTP verified event
        cleverTapTrackEvent(CLEVERTAP_EVENTS.OTP_VERIFIED, {
          Phone: `+91${stage1Data.mobile}`,
        });

      } catch (err) {
        console.error("verifyOtp failed:", err);
        setOtpError(err instanceof Error ? err.message : "Invalid OTP. Please try again.");
        return;
      }

      // Check for existing user offers (returning user detection)
      try {
        const utmSource = sessionStorage.getItem("utm_source");
        const utmMedium = sessionStorage.getItem("utm_medium");
        const existingUserResponse = await getExistingShortUserOffer(stage1Data.mobile, {
          utm_source: utmSource,
          utm_medium: utmMedium,
        });
        const userExists = existingUserResponse.data.found || existingUserResponse.data.exists;

        if (userExists) {
          // Track existing user identified event
          cleverTapTrackEvent(CLEVERTAP_EVENTS.EXISTING_USER_IDENTIFIED, {
            Phone: `+91${stage1Data.mobile}`,
          });

          // Sync full profile from session
          syncCleverTapFromSession();

          // Returning user - mark as OTP verified (they just verified OTP here)
          // This prevents the dashboard from triggering another OTP flow
          sessionStorage.setItem("dashboardOtpVerified", "true");
          sessionStorage.setItem("dashboardRequiresLogin", "false");
          // Also clear short dashboard link state to prevent magic-link OTP flow
          sessionStorage.setItem("shortDashboardRequiresLogin", "false");
          sessionStorage.removeItem("shortDashboardLinkToken");

          // Redirect to dashboard
          router.push("/dashboard");
          return;
        }
      } catch (err) {
        // If check fails, continue with normal flow (new user)
        console.warn("getExistingShortUserOffer check failed:", err);
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

        // Update user profile with all collected data
        cleverTapUpdateProfile({
          First_Name: data.first_name,
          Last_Name: data.last_name,
          Email: data.email,
          Phone: `+91${stage1Data.mobile}`,
          Gender: GENDER_TO_CLEVERTAP[data.gender],
          DOB: new Date(dobStr),
          Pincode: data.pincode,
          Income: data.monthly_income,
          Job_Type: data.profile,
          "Customer Type": data.profile,
          "Monthly Income": data.monthly_income,
          "Loan Purpose": data.loan_purpose,
          PAN: data.pan_no,
        });

        // Track form submission
        cleverTapTrackEvent(CLEVERTAP_EVENTS.FORM_SUBMITTED, {
          "Customer Type": data.profile,
          "Loan Amount Requested": stage1Data.loan_amount,
          "Loan Purpose": data.loan_purpose,
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
