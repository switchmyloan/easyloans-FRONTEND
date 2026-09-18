"use client";

import { useState, useCallback } from "react";
import type { Stage1Data, Stage2Data, AppStage } from "@/lib/types";
import {
  sendOtp,
  verifyOtp,
  getOfferShortTicket,
  saveShortDraftLead,
  getStoredShortLeadId,
  checkExistingUser,
  getExistingShortUserDetails,
  type ShortTicketPayload,
} from "@/lib/api";

// Maps for converting form values to API format
const JOB_TYPE_MAP: Record<string, string> = {
  Salaried: "SALARIED",
  "Self Employed": "SELF_EMPLOYED",
  "Business Owner": "BUSINESS_OWNER",
  Freelancer: "FREELANCER",
  Student: "STUDENT",
  Other: "OTHER",
};

const GENDER_MAP: Record<string, string> = {
  Male: "MALE",
  Female: "FEMALE",
  Other: "OTHER",
};

function formatDOB(dob: Date | string): string {
  const d = typeof dob === "string" ? new Date(dob) : dob;
  return d.toISOString().split("T")[0];
}

export interface ShortTicketFormState {
  stage: AppStage;
  stage1Data: Partial<Stage1Data>;
  stage2Data: Partial<Stage2Data>;
  mobile: string;
  loanAmount: number;
  otpError: string | null;
  hashedOtp: string;
  otpExpiresAt: number;
  isLoading: boolean;
  error: string | null;
}

export interface ShortTicketFormActions {
  handleStage1Submit: (data: Stage1Data) => Promise<void>;
  handleOtpVerify: (otp: string) => Promise<void>;
  handleOtpResend: () => Promise<void>;
  handleOtpBack: () => void;
  handleStage2Submit: (data: Stage2Data) => Promise<void>;
  handleStage1Change: (data: Partial<Stage1Data>) => void;
  handleStage2Change: (data: Partial<Stage2Data>) => void;
}

export function useShortTicketForm(): [ShortTicketFormState, ShortTicketFormActions] {
  const [stage, setStage] = useState<AppStage>("stage1");
  const [stage1Data, setStage1Data] = useState<Partial<Stage1Data>>({});
  const [stage2Data, setStage2Data] = useState<Partial<Stage2Data>>({});
  const [mobile, setMobile] = useState("");
  const [loanAmount, setLoanAmount] = useState(5000);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [hashedOtp, setHashedOtp] = useState("");
  const [otpExpiresAt, setOtpExpiresAt] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle Stage 1 form change
  const handleStage1Change = useCallback((data: Partial<Stage1Data>) => {
    setStage1Data(data);
  }, []);

  // Handle Stage 2 form change
  const handleStage2Change = useCallback((data: Partial<Stage2Data>) => {
    setStage2Data(data);
  }, []);

  // Handle Stage 1 submit
  const handleStage1Submit = useCallback(async (data: Stage1Data) => {
    setIsLoading(true);
    setError(null);

    try {
      setStage1Data(data);
      setMobile(data.mobile);
      setLoanAmount(data.loan_amount);

      // Send OTP
      const otpRes = await sendOtp(data.mobile);
      setHashedOtp(otpRes.data.hashedOtp);
      setOtpExpiresAt(otpRes.data.expiresAt);

      setStage("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle OTP verification
  const handleOtpVerify = useCallback(async (otp: string) => {
    setOtpError(null);

    try {
      const shortSessionId = getStoredShortLeadId() || undefined;

      await verifyOtp({
        otp,
        hashedOtp,
        expiresAt: otpExpiresAt,
        mobileNumber: mobile,
        shortSessionId,
         type: "short", 
      });

      // Save draft after OTP verification
      await saveShortDraftLead({
        phone: mobile,
        loan_amount: loanAmount,
        consent_tnc: stage1Data.consent_tnc,
        consent_credit: stage1Data.consent_credit,
        consent_communication: stage1Data.consent_communication,
      });

      // Check for existing user (lightweight check)
      try {
        const checkUserResponse = await checkExistingUser(mobile);
        const userExists = checkUserResponse.data.exists;

        if (userExists) {
          // Fetch existing user details and offers
          await getExistingShortUserDetails(mobile);

          // Returning user - mark as OTP verified
          sessionStorage.setItem("dashboardOtpVerified", "true");
          sessionStorage.setItem("dashboardRequiresLogin", "false");
          sessionStorage.setItem("shortDashboardRequiresLogin", "false");
          sessionStorage.removeItem("shortDashboardLinkToken");

          // Redirect to dashboard
          window.location.href = "/dashboard";
          return;
        }
      } catch (err) {
        // If check fails, continue with normal flow (new user)
        console.warn("checkExistingUser failed:", err);
      }

      // New user - show brief loading then move to stage 2
      setStage("loading");

      // Small delay for loading screen
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setStage("stage2");
    } catch (err) {
      setOtpError(err instanceof Error ? err.message : "Invalid OTP");
    }
  }, [hashedOtp, otpExpiresAt, mobile]);

  // Handle OTP resend
  const handleOtpResend = useCallback(async () => {
    try {
      const otpRes = await sendOtp(mobile);
      setHashedOtp(otpRes.data.hashedOtp);
      setOtpExpiresAt(otpRes.data.expiresAt);
      setOtpError(null);
    } catch (err) {
      setOtpError(err instanceof Error ? err.message : "Failed to resend OTP");
    }
  }, [mobile]);

  // Handle OTP back button
  const handleOtpBack = useCallback(() => {
    setStage("stage1");
    setOtpError(null);
  }, []);

  // Handle Stage 2 submit - calls the short ticket API
  const handleStage2Submit = useCallback(async (data: Stage2Data) => {
    setIsLoading(true);
    setError(null);
    setStage("loading");

    try {
      setStage2Data(data);

      const jobType = JOB_TYPE_MAP[data.profile] || data.profile;
      const isSalaried = data.profile === "Salaried";

      // Get UTM params from sessionStorage
      const utmSource = sessionStorage.getItem("utm_source");
      const utmMedium = sessionStorage.getItem("utm_medium");
      const utmCampaign = sessionStorage.getItem("utm_campaign");
      const utmContent = sessionStorage.getItem("utm_content");
      const utmTerm = sessionStorage.getItem("utm_term");

      const payload: ShortTicketPayload = {
        firstName: data.first_name,
        lastName: data.last_name,
        mobileNumber: mobile,
        email: data.email,
        dateOfBirth: formatDOB(data.dob),
        panNumber: data.pan_no.toUpperCase(),
        gender: GENDER_MAP[data.gender] || data.gender,
        pincode: data.pincode,
        jobType,
        isSalaried,
        monthlySalary: data.monthly_income,
        loanAmount,
        loanPurpose: data.loan_purpose,
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
        utm_content: utmContent,
        utm_term: utmTerm,
      };

      // Call short ticket API - this stores the response in sessionStorage
      await getOfferShortTicket(payload);

      // Redirect to offers page
      window.location.href = "/short-ticket/offers";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setStage("stage2");
    } finally {
      setIsLoading(false);
    }
  }, [mobile, loanAmount]);

  const state: ShortTicketFormState = {
    stage,
    stage1Data,
    stage2Data,
    mobile,
    loanAmount,
    otpError,
    hashedOtp,
    otpExpiresAt,
    isLoading,
    error,
  };

  const actions: ShortTicketFormActions = {
    handleStage1Submit,
    handleOtpVerify,
    handleOtpResend,
    handleOtpBack,
    handleStage2Submit,
    handleStage1Change,
    handleStage2Change,
  };

  return [state, actions];
}
