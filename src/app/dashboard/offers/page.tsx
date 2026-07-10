"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import OfferCard from "@/components/offers/OfferCard";
import NotEligibleScreen from "@/components/offers/NotEligibleScreen";
import { getStaticLenderDetail, STATIC_LENDER_LOGOS } from "@/lib/constants";
import { useOtpGuard } from "@/app/dashboard/layout";
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
  // Loan112: "Loan112",
  SmartCoin: "Olyv",
  SmartCoinHighIntent: "Olyv",
  LendingPlate: "LendingPlate",
  SpeedoLoan: "SpeedoLoan",
  LoanWalle: "LoanWalle",
  Cashvia: "Cashvia",
};

const FALLBACK_UTM_LINKS: Record<string, string> = {
  SmartCoin: "https://smartcoin.onelink.me/KLIY/Switchmyloanlandingpage",
    RamFinCorp: "https://ramfincorp.com/",
  Vivifi: "https://online.flexsalary.com/CustomerLogin/Index?CampaignID=9192313#x",
  SmartCoinHighIntent: "https://smartcoin.onelink.me/KLIY/Switchmyloanlandingpage",
  TrueBalance: "https://truebalance.io/",
  RapidMoney: "https://web.rapidmoney.in/borrower/login?utm_source=creadylandingpage&utm_extsource=abc&utm_medium=rapidmoney&utm_campaign=xyz&utm_campaignID=def",
  KreditBee: "https://www.kreditbee.in/signin",
  CreditPlus: "https://loan.credittnow.com/?utm_source=cready&utm_medium=website",
  SpeedoLoan: "https://loanapply.speedoloan.com?partner_id=cready",
  LoanWalle: "https://www.loanwalle.com/personal-loan?utm_source=CREADY&utm_medium=affiliate&utm_campaign=mcl-aff&click_id=landing-page",
  Cashvia: "https://cashvia.in/?utm_source=switchmyloan&utm_medium=switchmyloan&utm_campaign=switchmyloan_",
};

const LENDER_CUSTOM_BADGE: Record<string, string> = {
  KreditBee: "Top Pick",
  RapidMoney: "Quick Approval",
  TrueBalance: "Popular",
};

const BADGE_VISIBLE_COUNT = 3;

// ============================================================
// Utility Functions
// ============================================================
function mapShownOfferToDashboardOffer(
  shownOffer: ShownOffer,
  data: Record<string, unknown>
): DashboardOffer {
  // Prefer the backend's per-lender utm_link (data.<Lender>.utm_link), then the
  // shown-offer link, then the static fallback — same as the offers page.
  const lenderData = data[shownOffer.lenderName] as { utm_link?: string } | undefined;
  const utmLink =
    lenderData?.utm_link || shownOffer.utmLink || FALLBACK_UTM_LINKS[shownOffer.lenderName] || undefined;
  return {
    name: shownOffer.lenderName,
    utmLink,
    isOffer: shownOffer.section === "promoted",
  };
}

// ============================================================
// All Offers Page Component
// ============================================================
export default function DashboardOffersPage() {
  const { guardActivity } = useOtpGuard();
  const [offers, setOffers] = useState<DashboardOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [kbApplying, setKbApplying] = useState(false);
  const [showNotEligible, setShowNotEligible] = useState<string | null>(null);

  useEffect(() => {
    const existingUserData = getStoredShortExistingUserOffers();
    const userExists = existingUserData?.data?.found || existingUserData?.data?.exists;

    if (userExists && existingUserData?.data) {
      const data = existingUserData.data as Record<string, unknown>;
      const shownOffers = (data.shownOffers || []) as ShownOffer[];

      // Map existing shown offers, but filter out RapidMoney if isDuplicate is false
      const rapidMoneyData = data.RapidMoney as { isDuplicate?: boolean; utm_link?: string } | undefined;
      const filteredShownOffers = shownOffers.filter((o) => {
        if (o.lenderName === "RapidMoney") {
          return rapidMoneyData?.isDuplicate === false;
        }
        return true;
      });
      const mappedOffers = filteredShownOffers.map((o) => mapShownOfferToDashboardOffer(o, data));

      // Add static lenders that should always be shown (SpeedoLoan, LoanWalle, Cashvia)
      // Note: RapidMoney is now shown based on API response (isDuplicate === false)
      const ALWAYS_SHOW_STATIC_LENDERS = ["SpeedoLoan", "LoanWalle", "Cashvia", "Vivifi", "RamFinCorp"];
      const existingLenderNames = new Set(mappedOffers.map((o) => o.name));

      for (const lenderName of ALWAYS_SHOW_STATIC_LENDERS) {
        if (!existingLenderNames.has(lenderName)) {
          mappedOffers.push({
            name: lenderName,
            utmLink: FALLBACK_UTM_LINKS[lenderName],
            isOffer: false,
          });
        }
      }

      // Add RapidMoney based on API response (only if isDuplicate === false)
      if (rapidMoneyData?.isDuplicate === false && !existingLenderNames.has("RapidMoney")) {
        mappedOffers.push({
          name: "RapidMoney",
          utmLink: rapidMoneyData.utm_link || FALLBACK_UTM_LINKS["RapidMoney"],
          isOffer: false,
        });
      }

      setOffers(mappedOffers);
    } else {
      setOffers([]);
    }
    setIsLoading(false);
  }, []);

  const handleKreditBeeApply = async (utmLink?: string) => {
    if (kbApplying) return;
    setKbApplying(true);
    try {
      const phone = sessionStorage.getItem("userPhone") || "";
      await saveShortLender(phone, "KreditBee");
      const res = await applyToShortKreditBee();

      const kb = res.data?.KreditBee;
      const kbMessage = (kb?.message || "").toLowerCase();
      const isKbSuccess = kb?.success === true;
      const isRejected = kbMessage.includes("not approved") || kbMessage.includes("rejected");

      if (!isKbSuccess || isRejected) {
        setShowNotEligible("KreditBee");
      } else {
        const redirectUrl = utmLink || "https://www.kreditbee.in/signin";
        window.open(redirectUrl, "_blank");
      }
    } catch (err) {
      console.error("KreditBee apply failed:", err);
      toast.error("Something went wrong. Please try again.", { duration: 4000 });
    } finally {
      setKbApplying(false);
    }
  };

  const handleApply = async (lenderName: string, utmLink?: string) => {
    const allowed = await guardActivity();
    if (!allowed) return;

    if (lenderName === "KreditBee") {
      handleKreditBeeApply(utmLink);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-center" />
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">All Available Offers</h1>
          <p className="text-gray-600 text-sm mt-1">
            {offers.length > 0
              ? `${offers.length} offers available based on your profile`
              : "No offers available at the moment"}
          </p>
        </div>

        {/* Offers Grid */}
        {offers.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {offers.map((offer, idx) => {
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
                  delay={0.1 + idx * 0.05}
                  recommended={idx < 2}
                  badgeText={badgeText}
                  applying={isApplying}
                />
              );
            })}
          </motion.div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
            <p className="text-gray-600">No offers available at the moment. Please check back later.</p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 mt-4 text-purple-600 hover:text-purple-700 font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </div>
        )}
      </div>

      {/* Not Eligible Modal */}
      {showNotEligible && (
        <NotEligibleScreen
          lenderName={showNotEligible}
          onClose={() => setShowNotEligible(null)}
          onExplore={() => setShowNotEligible(null)}
        />
      )}
    </>
  );
}
