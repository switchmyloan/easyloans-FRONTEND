"use client";

import { useState, useEffect, useCallback, Suspense, createContext, useContext } from "react";
import { useSearchParams } from "next/navigation";
import Sidebar from "@/components/dashboard/Sidebar";
import DashboardOtpOverlay from "@/components/dashboard/DashboardOtpOverlay";
import {
  getStoredShortDashboardLinkState,
  sendShortDashboardLinkOtp,
  verifyShortDashboardLinkOtp,
} from "@/lib/api";

// Context to provide guardActivity function to child components
interface OtpGuardContextType {
  guardActivity: () => Promise<boolean>;
}

const OtpGuardContext = createContext<OtpGuardContextType>({
  guardActivity: async () => true,
});

export const useOtpGuard = () => useContext(OtpGuardContext);

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token");

  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [showOtpOverlay, setShowOtpOverlay] = useState(false);
  const [otpData, setOtpData] = useState<{
    hashedOtp: string;
    expiresAt: number;
    maskedPhone: string;
  } | null>(null);
  // Promise resolver for guardActivity - allows activity to wait for OTP completion
  const [otpPromiseResolver, setOtpPromiseResolver] = useState<{
    resolve: (value: boolean) => void;
  } | null>(null);

  // Check if already verified on mount (restore session state)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const verified = sessionStorage.getItem("dashboardOtpVerified") === "true";
    if (verified) {
      setIsOtpVerified(true);
    }
  }, []);

  // Show OTP overlay immediately on mount if verification is required
  useEffect(() => {
    const initOtpVerification = async () => {
      // Skip if already verified
      if (isOtpVerified) return;
      if (typeof window !== "undefined" && sessionStorage.getItem("dashboardOtpVerified") === "true") {
        setIsOtpVerified(true);
        return;
      }

      // Check if OTP is required
      const { token, requiresLogin } = getStoredShortDashboardLinkState();
      const activeToken = tokenFromUrl || token;

      if (!activeToken || !requiresLogin) return;

      // Send OTP and show overlay immediately
      const sendResult = await sendShortDashboardLinkOtp(activeToken);
      if (sendResult.success && sendResult.data) {
        setOtpData(sendResult.data);
        setShowOtpOverlay(true);
      }
    };

    initOtpVerification();
  }, [tokenFromUrl, isOtpVerified]);

  // Handle OTP verification
  const handleOtpVerify = useCallback(
    async (otp: string): Promise<boolean> => {
      const { token } = getStoredShortDashboardLinkState();
      const activeToken = tokenFromUrl || token;

      if (!activeToken || !otpData) return false;

      const result = await verifyShortDashboardLinkOtp(
        activeToken,
        otp,
        otpData.hashedOtp,
        otpData.expiresAt
      );

      if (result.success) {
        setIsOtpVerified(true);
        setShowOtpOverlay(false);
        // Store verified state in sessionStorage
        sessionStorage.setItem("dashboardOtpVerified", "true");
        sessionStorage.setItem("shortDashboardRequiresLogin", "false");
        // Resolve the pending activity promise
        if (otpPromiseResolver) {
          otpPromiseResolver.resolve(true);
          setOtpPromiseResolver(null);
        }
        return true;
      }

      return false;
    },
    [tokenFromUrl, otpData, otpPromiseResolver]
  );

  // Handle OTP resend
  const handleOtpResend = useCallback(async (): Promise<void> => {
    const { token } = getStoredShortDashboardLinkState();
    const activeToken = tokenFromUrl || token;

    if (!activeToken) return;

    const result = await sendShortDashboardLinkOtp(activeToken);
    if (result.success && result.data) {
      setOtpData(result.data);
    }
  }, [tokenFromUrl]);

  // Handle overlay cancel (user closes modal without verifying)
  const handleOtpCancel = useCallback(() => {
    setShowOtpOverlay(false);
    if (otpPromiseResolver) {
      otpPromiseResolver.resolve(false);
      setOtpPromiseResolver(null);
    }
  }, [otpPromiseResolver]);

  /**
   * guardActivity - Call this BEFORE any activity (Apply / Save / Proceed).
   * Returns true if the action may run; false if OTP failed/cancelled.
   *
   * IMPORTANT: This is ONLY called from onClick handlers, NEVER from useEffect/render.
   * Viewing the dashboard never triggers this.
   */
  const guardActivity = useCallback(async (): Promise<boolean> => {
    // If already verified in this session, allow immediately
    if (isOtpVerified) return true;

    // Check sessionStorage as backup (for page reloads within session)
    if (typeof window !== "undefined" && sessionStorage.getItem("dashboardOtpVerified") === "true") {
      setIsOtpVerified(true);
      return true;
    }

    // Check if OTP is required (magic link flow)
    const { token, requiresLogin } = getStoredShortDashboardLinkState();
    const activeToken = tokenFromUrl || token;

    // No token or doesn't require login - allow activity
    if (!activeToken || !requiresLogin) return true;

    // Need OTP verification - send OTP and show overlay
    const sendResult = await sendShortDashboardLinkOtp(activeToken);
    if (!sendResult.success) {
      console.error("Failed to send OTP:", sendResult.message);
      return false;
    }

    setOtpData(sendResult.data);
    setShowOtpOverlay(true);

    // Return a promise that resolves when OTP is verified or cancelled
    return new Promise<boolean>((resolve) => {
      setOtpPromiseResolver({ resolve });
    });
  }, [isOtpVerified, tokenFromUrl]);

  return (
    <OtpGuardContext.Provider value={{ guardActivity }}>
      {/* OTP Overlay - shown on mount if verification required, or on activity */}
      {showOtpOverlay && otpData && (
        <DashboardOtpOverlay
          maskedPhone={otpData.maskedPhone}
          onVerify={handleOtpVerify}
          onResend={handleOtpResend}
        />
      )}

      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main content with left margin for sidebar */}
      <main
        className="min-h-screen bg-[#F8F5FF] p-4 lg:p-6"
        style={{ marginLeft: "0" }}
      >
        <div className="hidden lg:block" style={{ marginLeft: "180px" }}>
          <style>{`
            @media (min-width: 1024px) {
              main { margin-left: 180px !important; }
            }
          `}</style>
        </div>
        <div className="lg:hidden pt-12">{children}</div>
        <div className="hidden lg:block">{children}</div>
      </main>
    </OtpGuardContext.Provider>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F8F5FF] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-600"></div>
        </div>
      }
    >
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </Suspense>
  );
}
