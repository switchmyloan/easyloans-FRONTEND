"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { cleverTapTrackEvent, CLEVERTAP_EVENTS } from "@/lib/clevertap";

// Import dashboard components
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import ProfileCard from "@/components/dashboard/ProfileCard";
import LoanJourney from "@/components/dashboard/LoanJourney";
import SmartInsight from "@/components/dashboard/SmartInsight";
import DashboardOffers from "@/components/dashboard/DashboardOffers";
import LinkExpired from "@/components/dashboard/LinkExpired";
import TrustedSection from "@/components/dashboard/TrustedSection";

// Import API functions
import {
  getStoredShortExistingUserOffers,
  resolveShortDashboardLink,
  type ShortExistingUserOffersResponse,
} from "@/lib/api";

// Dedupe the "Page Viewed" event
let hasTrackedDashboardLanding = false;

// ============================================================
// Dashboard Content Component
// ============================================================
function DashboardContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [firstName, setFirstName] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [linkExpired, setLinkExpired] = useState<{ expired: boolean; reason?: string }>({
    expired: false,
  });

  // Track page view on mount
  // useEffect(() => {
  //   if (!hasTrackedDashboardLanding) {
  //     hasTrackedDashboardLanding = true;
  //     cleverTapTrackEvent(CLEVERTAP_EVENTS.EASY_LANDED, { URL: window.location.href });
  //   }
  // }, []);

  // Process the stored data and update state
  const processStoredData = (passedData: ShortExistingUserOffersResponse | null = null) => {
    const storedData = passedData || getStoredShortExistingUserOffers();
    const userExists = storedData?.data?.found || storedData?.data?.exists;

    if (userExists && storedData?.data) {
      const userData = storedData.data.user;
      if (userData?.firstName) {
        setFirstName(userData.firstName);
      }
    } else {
      // Fallback to sessionStorage
      if (typeof window !== "undefined") {
        const storedName = sessionStorage.getItem("userFirstName") || "";
        if (storedName) setFirstName(storedName);
      }
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    // If token is present, resolve the magic link first
    if (token) {
      resolveShortDashboardLink(token)
        .then((result) => {
          if (result.valid) {
            // Data is now stored in sessionStorage, process it
            processStoredData();
          } else {
            setLinkExpired({ expired: true, reason: result.reason });
          }
          setIsLoading(false);
        })
        .catch(() => {
          setLinkExpired({ expired: true, reason: "error" });
          setIsLoading(false);
        });
      return;
    }

    // No token - use existing flow (get from sessionStorage)
    processStoredData();
    setIsLoading(false);
  }, [token]);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  // Show expired link screen if token was invalid
  if (linkExpired.expired) {
    return (
      <div className="max-w-5xl mx-auto">
        <LinkExpired reason={linkExpired.reason} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header Section */}
      <DashboardHeader firstName={firstName} />

      {/* Profile, Journey, Insight Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-2 mb-3">
        <div className="lg:col-span-2">
          <ProfileCard />
        </div>

        <div className="lg:col-span-2">
          <LoanJourney />
        </div>

        <div className="lg:col-span-1">
          <SmartInsight />
        </div>
      </div>

      {/* Offers Section */}
      <DashboardOffers />

      {/* Trusted Partners Section */}
      <TrustedSection />
    </div>
  );
}

// ============================================================
// Main Page Component with Suspense
// ============================================================
export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-5xl mx-auto flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-600"></div>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
