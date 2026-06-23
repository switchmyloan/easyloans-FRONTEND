"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Lightbulb } from "lucide-react";

// ============================================================
// Types
// ============================================================
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

interface StaticLender {
  name: string;
  [key: string]: unknown;
}

// ============================================================
// Short-Ticket Lender Order
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

    // TrueBalance uses nested isEligible field instead of success
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
// API Placeholder (TODO: Replace with actual API)
// ============================================================
function getStoredShortTicketOffers(): {
  data?: {
    found?: boolean;
    exists?: boolean;
    staticLenders?: StaticLender[];
    [key: string]: unknown;
  };
} | null {
  // TODO: Replace with actual API call
  // For now, return dummy data with some offers
  return {
    data: {
      found: true,
      KreditBee: { success: true, is_offer: true },
      RapidMoney: { success: true },
      TrueBalance: { data: { response: { data: { isEligible: true } } } },
      SmartCoin: { success: true },
      MPokket: { success: true },
      staticLenders: [],
    },
  };
}

// ============================================================
// SmartInsight Component
// ============================================================
export default function SmartInsight() {
  const [offersCount, setOffersCount] = useState(0);

  useEffect(() => {
    const existingUserData = getStoredShortTicketOffers();
    const userExists = existingUserData?.data?.found || existingUserData?.data?.exists;

    if (userExists && existingUserData?.data) {
      const data = existingUserData.data;
      const addedLenders = new Set<string>();
      let count = 0;

      // Count real offers (success=true, !isDedupe, !isDuplicate)
      for (const lenderName of SHORT_TICKET_LENDER_ORDER) {
        if (isRealOffer(lenderName, data as Record<string, unknown>)) {
          count++;
          addedLenders.add(lenderName);
        }
      }

      // Count static lenders (not already counted)
      const staticLenders = (data.staticLenders || []) as StaticLender[];
      for (const sl of staticLenders) {
        if (!addedLenders.has(sl.name)) {
          count++;
          addedLenders.add(sl.name);
        }
      }

      setOffersCount(count);
    }
  }, []);

  if (offersCount === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 h-full flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
          <Lightbulb className="w-4 h-4 text-green-600" />
        </div>
        <h3 className="text-sm font-semibold text-gray-900">Smart Insight</h3>
      </div>

      {/* Content */}
      <p className="text-xs text-gray-600 leading-relaxed flex-1">
        Since your last visit,{" "}
        <span className="font-semibold text-gray-800">{offersCount} additional lenders</span>{" "}
        have become available for your profile. These offers may have lower processing fees and faster approvals.
      </p>

      {/* CTA Link */}
      <Link
        href="/dashboard/offers"
        className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 hover:text-green-700 mt-4 transition-colors"
      >
        See New Offers
        <span className="text-base">→</span>
      </Link>
    </motion.div>
  );
}
