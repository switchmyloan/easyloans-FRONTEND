"use client";

import { useState, useCallback, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  checkExistingUser,
  getExistingShortUserDetails,
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
import { getPreferredLanguageLabel } from "@/components/ui/LanguageToggle";

const GENDER_TO_CLEVERTAP: Record<string, "M" | "F" | undefined> = {
  Male: "M",
  Female: "F",
};

// Dedupe the "Page Viewed" event across React's dev double-invoke of effects.
let hasTrackedLanding = false;

import LeftPanel from "@/components/layout/LeftPanel";
import { GanpatiBackdrop, GanpatiDecor, GanpatiMobileBackdrop, GanpatiMobileFooter } from "@/components/campaign/Ganpati";
import Stage1Form from "@/components/forms/Stage1Form";
import OtpForm from "@/components/forms/OtpForm";
import GradientBanner from "@/components/ui/GradientBanner";
import { Clock3, IndianRupee, TrendingUp, ShieldCheck } from "lucide-react";

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
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <HomeContent />
    </Suspense>
  );
}

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [stage, setStage] = useState<AppStage>("stage1");
  const [stage1Data, setStage1Data] = useState<Stage1Data | null>(null);
  const [otpData, setOtpData] = useState<SendOtpResponse["data"] | null>(null);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [prefilledStage2, setPrefilledStage2] = useState<PrefilledStage2 | null>(null);

  const stage1DraftRef = useRef<Partial<Stage1Data>>({});
  const stage2DraftRef = useRef<Partial<Stage2Data>>({});
  const draftTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Effect to capture UTM params from URL and store in sessionStorage
  useEffect(() => {
    const utmSource = searchParams.get("utm_source");
    const utmMedium = searchParams.get("utm_medium");
    const utmCampaign = searchParams.get("utm_campaign");
    const utmContent = searchParams.get("utm_content");
    const utmTerm = searchParams.get("utm_term");

    if (utmSource) sessionStorage.setItem("utm_source", utmSource);
    if (utmMedium) sessionStorage.setItem("utm_medium", utmMedium);
    if (utmCampaign) sessionStorage.setItem("utm_campaign", utmCampaign);
    if (utmContent) sessionStorage.setItem("utm_content", utmContent);
    if (utmTerm) sessionStorage.setItem("utm_term", utmTerm);
  }, [searchParams]);

  // Track page landing
  // useEffect(() => {
  //   if (!hasTrackedLanding) {
  //     hasTrackedLanding = true;
  //     cleverTapTrackEvent(CLEVERTAP_EVENTS.EASY_LANDED, { URL: window.location.href });
  //   }
  // }, []);

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
      fullName: s2.first_name && s2.last_name ? `${s2.first_name} ${s2.last_name}` : undefined,
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

        // CleverTap: Track OTP verification
        const loginProfile: CleverTapLoginProfile = {
          Identity: stage1Data.mobile,
          Phone: `+91${stage1Data.mobile}`,
          "MSG-push": stage1Data.consent_communication,
          "MSG-sms": stage1Data.consent_communication,
          "MSG-whatsapp": stage1Data.consent_communication,
          "Loan Amount Requested": stage1Data.loan_amount,
        };
        saveCleverTapLoginProfile(loginProfile);
        cleverTapOnUserLogin(loginProfile);
        void cleverTapInitWebPush();

        cleverTapTrackEvent(CLEVERTAP_EVENTS.EASY_OTP_VERIFIED, {
          Phone: `+91${stage1Data.mobile}`,
        });
        console.log("EASY_OTP_VERIFIED event tracked");
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
          // CleverTap: Track existing user
          cleverTapTrackEvent(CLEVERTAP_EVENTS.EASY_EXISTING_USER_IDENTIFIED, {
            Phone: `+91${stage1Data.mobile}`,
          });

          // Fetch existing user details
          await getExistingShortUserDetails(stage1Data.mobile);

          syncCleverTapFromSession();

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

      // Get UTM params from sessionStorage
      const utmSource = sessionStorage.getItem("utm_source");
      const utmMedium = sessionStorage.getItem("utm_medium");
      const utmCampaign = sessionStorage.getItem("utm_campaign");
      const utmContent = sessionStorage.getItem("utm_content");
      const utmTerm = sessionStorage.getItem("utm_term");

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
          utm_source: utmSource,
          utm_medium: utmMedium,
          utm_campaign: utmCampaign,
          utm_content: utmContent,
          utm_term: utmTerm,
        });

        // CleverTap: Update profile with Stage 2 data
        cleverTapUpdateProfile({
          First_Name: data.first_name,
          Last_Name: data.last_name,
          Email: data.email,
          Phone: `+91${stage1Data.mobile}`,
          Gender: GENDER_TO_CLEVERTAP[data.gender],
          DOB: new Date(dobStr),
          Pincode: data.pincode,
          Income: data.monthly_income,
          LP_Job_Type: data.profile,
          "Customer Type": data.profile,
          "Monthly Income": data.monthly_income,
          "Loan Purpose": data.loan_purpose,
          PAN: data.pan_no,
          Preferred_Language: getPreferredLanguageLabel(),
        });

        // CleverTap: Track form submission
        cleverTapTrackEvent(CLEVERTAP_EVENTS.EASY_FORM_SUBMITTED, {
          "Customer Type": data.profile,
          "Loan Amount Requested": stage1Data.loan_amount,
          "Loan Purpose": data.loan_purpose,
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

  return (
    <>
      <div className="relative flex min-h-screen w-full flex-col overflow-hidden lg:flex-row">
        {/* extra blur glow effects */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {/* left yellow glow */}
          <div className="absolute left-[-180px] top-[20%] h-[380px] w-[380px] rounded-full bg-[#FEF3D5] blur-3xl" />

          {/* top purple glow */}
          <div className="absolute left-[30%] top-[-120px] h-[360px] w-[480px] rounded-full bg-violet-400/50 blur-3xl" />

          {/* bottom purple glow */}
          <div className="absolute bottom-[-180px] left-[10%] h-[500px] w-[500px] rounded-full bg-purple-300/30 blur-3xl" />

          {/* soft center white glow */}
          <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/20 blur-3xl" />

          {/* curved lines */}
          <div className="absolute bottom-[-120px] left-[-100px] h-[500px] w-[900px] rotate-6 rounded-[100%] border border-white/30" />
          <div className="absolute bottom-[-180px] left-[-140px] h-[600px] w-[1100px] rotate-6 rounded-[100%] border border-white/20" />

          {/* right yellow glow */}
          <div className="absolute right-[-300px] bottom-[-10%] h-[420px] w-[420px] rounded-full bg-[#f7e9c4] blur-3xl" />
        </div>

        <GanpatiDecor />
        <GanpatiMobileBackdrop />
        <GanpatiBackdrop />

        <LeftPanel />
        

        <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8 sm:px-8 lg:px-12">
          <AnimatePresence mode="wait">
            {stage === "loading" && <LoadingScreen key="loading" />}
          </AnimatePresence>

          {(stage === "stage1" ||
            stage === "otp" ||
            stage === "stage2" ||
            stage === "success") && (
            <div className="w-full max-w-[460px]">
         

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
                    onBack={() => {
                      setOtpError(null);
                      setStage("stage1");
                    }}
                    error={otpError}
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

              {/* Mobile: Bottom section with headline and stats */}
              <div className="lg:hidden mt-8 space-y-5">
                {/* Headline */}
                <div className="text-center">
                  <h2 className="text-2xl font-extrabold text-[#161a6d]">
                    Small Loans
                  </h2>
                  <h2 className="text-2xl font-extrabold bg-gradient-to-r from-[#8560ff] via-[#664cff] to-[#4d3cff] bg-clip-text text-transparent">
                    when you need them.
                  </h2>
                  <p className="mt-2 text-sm text-gray-500">
                    Built around your moments.<br />
                    Backed by trust. Driven by technology.
                  </p>
                </div>

                {/* Stats Card */}
                <div className="relative overflow-hidden rounded-xl border border-white/80 bg-white/60 backdrop-blur-xl shadow-[0_24px_80px_rgba(116,82,255,0.12)]">
                  <div className="grid grid-cols-3">
                    {/* 5 min */}
                    <div className="relative flex flex-col items-center px-3 py-4 text-center">
                      <div className="flex h-6 w-6 items-center justify-center text-[#6b4cff]">
                        <Clock3 className="h-6 w-6 stroke-2" />
                      </div>
                      <div className="mt-2 flex flex-col items-center">
                        <p className="text-sm font-semibold text-[#4e35d3]">5 min</p>
                        <p className="mt-1 text-[10px] font-medium text-[#8088ad]">Approval Time*</p>
                      </div>
                      <div className="absolute right-0 top-1/2 h-12 w-px -translate-y-1/2 bg-[#e7defd]" />
                    </div>

                    {/* ₹15 Lakh */}
                    <div className="relative flex flex-col items-center px-3 py-4 text-center">
                      <div className="flex h-6 w-6 items-center justify-center text-[#6b4cff]">
                        <IndianRupee className="h-6 w-6 stroke-2" />
                      </div>
                      <div className="mt-2 flex flex-col items-center">
                        <p className="mb-0.5 text-[10px] font-medium text-[#868eb0]">Up to</p>
                        <p className="text-sm font-semibold text-[#4e35d3]">₹2 Lakh</p>
                        <p className="mt-1 text-[10px] font-medium text-[#8088ad]">Loan Amount</p>
                      </div>
                      <div className="absolute right-0 top-1/2 h-12 w-px -translate-y-1/2 bg-[#e7defd]" />
                    </div>

                    {/* 0.83% */}
                    <div className="flex flex-col items-center px-3 py-4 text-center">
                      <div className="flex h-6 w-6 items-center justify-center text-[#6b4cff]">
                        <TrendingUp className="h-6 w-6 stroke-2" />
                      </div>
                      <div className="mt-2 flex flex-col items-center">
                        <p className="text-sm font-semibold text-[#4e35d3]">0.83%</p>
                        <p className="mt-1 text-[10px] font-medium text-[#8088ad]">Starting Rate*</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ganpati Image - Mobile */}
                <GanpatiMobileFooter />

                {/* Data Safety Notice */}
                <div className="flex flex-col items-center text-center text-[#717aa2]">
                  <div className="mb-1 text-[#6e4dff]">
                    <ShieldCheck className="h-5 w-5" strokeWidth={2} />
                  </div>
                  <p className="text-xs font-medium text-[#5d648f]">
                    Your data is safe with us.
                  </p>
                  <p className="text-xs text-[#717aa2]">We never share your information.</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
      <GradientBanner />
    </>
  );
}