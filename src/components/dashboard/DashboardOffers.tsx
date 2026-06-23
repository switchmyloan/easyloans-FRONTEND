"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import OfferCard from "@/components/offers/OfferCard";
import NotEligibleScreen from "@/components/offers/NotEligibleScreen";
import { getStaticLenderDetail, STATIC_LENDER_LOGOS } from "@/lib/constants";
import { useOtpGuard } from "@/app/dashboard/layout";

// Import API functions
import {
  getStoredShortExistingUserOffers,
  saveShortLender,
  applyToShortKreditBee,
} from "@/lib/api";

// ============================================================
// Types
// ============================================================
interface DashboardOffer {
  name: string;
  utmLink?: string;
  isOffer?: boolean;
}

interface ShownOffer {
  lenderName: string;
  section?: string;
  utmLink?: string | null;
}

// ============================================================
// Constants
// ============================================================
const DISPLAY_NAMES: Record<string, string> = {
  KreditBee: "KreditBee",
  RapidMoney: "RapidMoney",
  TrueBalance: "TrueBalance",
  RamFinCorp: "Ram FinCorp",
  CreditPlus: "CreditPlus",
  MPokket: "mPokket",
  Loan112: "Loan112",
  SmartCoin: "Olyv",
  SmartCoinHighIntent: "Olyv",
  LendingPlate: "LendingPlate",
};

const DASHBOARD_VISIBLE_COUNT = 3;

const FALLBACK_UTM_LINKS: Record<string, string> = {
  SmartCoin: "https://smartcoin.onelink.me/KLIY/Switchmyloanlandingpage",
  SmartCoinHighIntent: "https://smartcoin.onelink.me/KLIY/Switchmyloanlandingpage",
  TrueBalance: "https://truebalance.io/",
  RapidMoney: "https://rapidmoney.in/",
};

const LENDER_CUSTOM_BADGE: Record<string, string> = {
  KreditBee: "Top Pick",
  RapidMoney: "Quick Approval",
};

const BADGE_VISIBLE_COUNT = 2;

// ============================================================
// Utility Functions
// ============================================================
function mapShownOfferToDashboardOffer(shownOffer: ShownOffer): DashboardOffer {
  const utmLink = shownOffer.utmLink || FALLBACK_UTM_LINKS[shownOffer.lenderName] || undefined;
  return {
    name: shownOffer.lenderName,
    utmLink,
    isOffer: shownOffer.section === "promoted",
  };
}

// ============================================================
// DashboardOffers Component
// ============================================================
export default function DashboardOffers() {
  const { guardActivity } = useOtpGuard();
  const [offers, setOffers] = useState<DashboardOffer[]>([]);
  const [kbApplying, setKbApplying] = useState(false);
  const [showNotEligible, setShowNotEligible] = useState<string | null>(null);

  useEffect(() => {
    const existingUserData = getStoredShortExistingUserOffers();
    const userExists = existingUserData?.data?.found || existingUserData?.data?.exists;

    if (userExists && existingUserData?.data) {
      const shownOffers = (existingUserData.data.shownOffers || []) as ShownOffer[];
      if (shownOffers.length > 0) {
        const mappedOffers = shownOffers.map(mapShownOfferToDashboardOffer);
        setOffers(mappedOffers);
      } else {
        setOffers([]);
      }
    } else {
      setOffers([]);
    }
  }, []);

  const handleKreditBeeApply = async () => {
    if (kbApplying) return;
    setKbApplying(true);
    try {
      const phone = sessionStorage.getItem("userPhone") || "";
      await saveShortLender(phone, "KreditBee");
      const res = await applyToShortKreditBee();

      const kb = res.data?.KreditBee;
      const kbMessage = (kb?.message || "").toLowerCase();

      const isKbSuccess = kb?.success === true;
      const isRejected =
        kbMessage.includes("not approved") || kbMessage.includes("rejected");

      if (!isKbSuccess || isRejected) {
        setShowNotEligible("KreditBee");
      } else {
        window.open("https://www.kreditbee.in/signin", "_blank");
      }
    } catch (err) {
      console.error("KreditBee apply failed:", err);
      toast.error("Something went wrong. Please try again.", { duration: 4000 });
    } finally {
      setKbApplying(false);
    }
  };

  const handleApply = async (lenderName: string, utmLink?: string) => {
    // OTP verification
    const allowed = await guardActivity();
    if (!allowed) return;

    // Route KreditBee to specific handler
    if (lenderName === "KreditBee") {
      handleKreditBeeApply();
      return;
    }

    // For other lenders, save and open UTM link
    const phone = sessionStorage.getItem("userPhone") || "";
    await saveShortLender(phone, lenderName);

    const fallbackUrl = FALLBACK_UTM_LINKS[lenderName];
    const url = utmLink || fallbackUrl;

    if (url) {
      window.open(url, "_blank");
    } else {
      toast.success(`Applied to ${DISPLAY_NAMES[lenderName] || lenderName}!`);
    }
  };

  const lendersToShow = offers.slice(0, DASHBOARD_VISIBLE_COUNT);

  if (lendersToShow.length === 0) {
    return null;
  }

  return (
    <>
      <Toaster position="top-center" />
      <motion.div
        id="offers-section"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2 sm:gap-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
            <h2 className="text-lg font-semibold text-gray-800">Recommended for you</h2>
            <span className="text-sm text-gray-500">Based on your profile</span>
          </div>
          <Link
            href="/dashboard/offers"
            className="text-sm font-medium text-purple-600 hover:text-purple-700 flex items-center gap-1 self-start sm:self-auto"
          >
            View all offers
            <span className="text-lg">→</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {lendersToShow.map((offer, idx) => {
            const lenderName = offer.name;
            const displayName = DISPLAY_NAMES[lenderName] || lenderName;
            const details = getStaticLenderDetail(lenderName);
            const logoMeta = STATIC_LENDER_LOGOS[lenderName];

            const hasCustomBadge = !!LENDER_CUSTOM_BADGE[lenderName];
            const showBadge = idx < BADGE_VISIBLE_COUNT || hasCustomBadge || offer.isOffer;
            const badgeText = showBadge
              ? LENDER_CUSTOM_BADGE[lenderName] || (offer.isOffer ? "Pre-Qualified" : "Matched")
              : null;

            const isApplying = lenderName === "KreditBee" ? kbApplying : false;

            return (
              <OfferCard
                key={lenderName}
                lenderName={displayName}
                compact={false}
                logoDarkBg={logoMeta?.darkBg}
                lenderLogo={
                  logoMeta?.src ? (
                    <img
                      src={logoMeta.src}
                      alt={displayName}
                      className="max-h-5 max-w-full w-auto object-contain"
                    />
                  ) : (
                    <span className="text-base font-bold text-gray-600">
                      {displayName.charAt(0)}
                    </span>
                  )
                }
                headline={details.headline}
                description={details.description}
                keyFeature={details.keyFeature}
                interestRate={details.interestRate}
                onApply={() => handleApply(lenderName, offer.utmLink)}
                delay={0.15 + idx * 0.05}
                recommended={idx < 2}
                badgeText={badgeText}
                applying={isApplying}
              />
            );
          })}
        </div>
      </motion.div>

      {/* Not Eligible Modal */}
      {showNotEligible && (
        <NotEligibleScreen
          lenderName={showNotEligible}
          onClose={() => setShowNotEligible(null)}
          onExplore={() => {
            setShowNotEligible(null);
            window.location.href = "/dashboard/offers";
          }}
        />
      )}
    </>
  );
}
