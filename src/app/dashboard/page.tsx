"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

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
  type StaticLender,
} from "@/lib/api";

// ============================================================
// Types
// ============================================================
export interface PreviousLender {
  id: string;
  name: string;
  prefix: string;
}

interface ShortTicketLenderResponse {
  success?: boolean;
  is_offer?: boolean;
  isDedupe?: boolean;
  isDuplicate?: boolean;
  data?: {
    response?: {
      data?: {
        isEligible?: boolean;
      };
    };
  };
}

// ============================================================
// Constants
// ============================================================
const SHORT_TICKET_LENDER_ORDER = [
  "RapidMoney",
  "KreditBee",
  "TrueBalance",
  "RamFinCorp",
  "CreditPlus",
  "MPokket",
  "Loan112",
  "SmartCoin",
  "LendingPlate",
];

const LENDER_DISPLAY: Record<string, { name: string; prefix: string }> = {
  KreditBee: { name: "KreditBee", prefix: "KB" },
  RapidMoney: { name: "RapidMoney", prefix: "RM" },
  TrueBalance: { name: "TrueBalance", prefix: "TB" },
  SmartCoin: { name: "Olyv", prefix: "OL" },
  RamFinCorp: { name: "Ram FinCorp", prefix: "RF" },
  MPokket: { name: "mPokket", prefix: "MP" },
  CreditPlus: { name: "CreditPlus", prefix: "CP" },
  Loan112: { name: "Loan112", prefix: "L1" },
  LendingPlate: { name: "LendingPlate", prefix: "LP" },
};

// ============================================================
// Utility Functions
// ============================================================
function getLenderKeys(lenderName: string): string[] {
  const keysToCheck = [lenderName];
  if (lenderName === "TrueBalance") keysToCheck.push("trueBalance");
  if (lenderName === "SmartCoin") keysToCheck.push("smartCoin", "SmartCoinHighIntent");
  if (lenderName === "KreditBee") keysToCheck.push("kreditBee");
  return keysToCheck;
}

function isTrueBalanceEligible(lender: ShortTicketLenderResponse): boolean {
  const resData = lender.data?.response?.data;
  return resData?.isEligible === true;
}

function isRealOffer(lenderName: string, data: Record<string, unknown>): boolean {
  const keysToCheck = getLenderKeys(lenderName);

  for (const key of keysToCheck) {
    const lender = data[key] as ShortTicketLenderResponse | undefined;
    if (!lender) continue;

    if (lenderName === "TrueBalance") {
      return isTrueBalanceEligible(lender);
    }

    const hasOffer = lender.is_offer === true;
    const isSuccess = lender.success === true;
    const notDedupe = lender.isDedupe !== true;
    const notDuplicate = lender.isDuplicate !== true;

    if (hasOffer || (isSuccess && notDedupe && notDuplicate)) {
      return true;
    }
  }
  return false;
}

// ============================================================
// Utility Functions for Processing API Data
// ============================================================
function extractPreviousLenders(data: Record<string, unknown>): string[] {
  const selectedLenders = (data.selectedLenders || []) as { lenderName: string }[];
  return selectedLenders.map((l) => l.lenderName);
}

// ============================================================
// Dashboard Content Component
// ============================================================
function DashboardContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [firstName, setFirstName] = useState<string>("");
  const [previousLenders, setPreviousLenders] = useState<PreviousLender[]>([]);
  const [availableOffersCount, setAvailableOffersCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [linkExpired, setLinkExpired] = useState<{ expired: boolean; reason?: string }>({
    expired: false,
  });

  // Process the stored data and update state
  const processStoredData = (passedData: ShortExistingUserOffersResponse | null = null) => {
    const storedData = passedData || getStoredShortExistingUserOffers();
    const userExists = storedData?.data?.found || storedData?.data?.exists;

    if (userExists && storedData?.data) {
      const userData = storedData.data.user;
      if (userData?.firstName) {
        setFirstName(userData.firstName);
      }

      const prevLenderKeys = extractPreviousLenders(storedData.data as Record<string, unknown>);
      const prevLenders: PreviousLender[] = prevLenderKeys.map((key) => ({
        id: key,
        name: LENDER_DISPLAY[key]?.name || key,
        prefix: LENDER_DISPLAY[key]?.prefix || key.charAt(0).toUpperCase(),
      }));
      setPreviousLenders(prevLenders);

      const responseData = storedData.data;
      const addedLenders = new Set<string>();
      let count = 0;

      for (const lenderName of SHORT_TICKET_LENDER_ORDER) {
        if (isRealOffer(lenderName, responseData as Record<string, unknown>)) {
          count++;
          addedLenders.add(lenderName);
        }
      }

      const staticLenders = (responseData.staticLenders || []) as StaticLender[];
      for (const sl of staticLenders) {
        if (!addedLenders.has(sl.name)) {
          count++;
          addedLenders.add(sl.name);
        }
      }

      setAvailableOffersCount(count);
    } else {
      // Fallback to sessionStorage
      if (typeof window !== "undefined") {
        const storedName = sessionStorage.getItem("userFirstName") || "";
        if (storedName) setFirstName(storedName);
      }
      setPreviousLenders([]);
      setAvailableOffersCount(0);
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
      <DashboardHeader
        firstName={firstName}
        previousLenders={previousLenders}
        newOffersCount={availableOffersCount}
      />

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
