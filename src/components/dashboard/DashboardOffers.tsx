"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import OfferCard from "@/components/offers/OfferCard";
import NotEligibleScreen from "@/components/offers/NotEligibleScreen";
import { getStaticLenderDetail, STATIC_LENDER_LOGOS, DASHBOARD_PRIORITY_ORDER } from "@/lib/constants";
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
  SpeedoLoan: "SpeedoLoan",
  LoanWalle: "LoanWalle",
  Cashvia: "Cashvia",
};

const DASHBOARD_VISIBLE_COUNT = 3;

const FALLBACK_UTM_LINKS: Record<string, string> = {
  // SmartCoin: "https://smartcoin.onelink.me/KLIY/Switchmyloanlandingpage",
  // SmartCoinHighIntent: "https://smartcoin.onelink.me/KLIY/Switchmyloanlandingpage",
    RamFinCorp: "https://ramfincorp.com/",
  Vivifi: "https://online.flexsalary.com/CustomerLogin/Index?CampaignID=9192313#x",
  TrueBalance: "https://truebalance.io/",
  RapidMoney: "https://web.rapidmoney.in/borrower/login?utm_source=creadylandingpage&utm_extsource=abc&utm_medium=rapidmoney&utm_campaign=xyz&utm_campaignID=def",
  KreditBee: "https://www.kreditbee.in/signin",
  
  SpeedoLoan: "https://loanapply.speedoloan.com?partner_id=cready",
  Cashvia: "https://cashvia.in/?utm_source=switchmyloan&utm_medium=switchmyloan&utm_campaign=switchmyloan_",
};

const LENDER_CUSTOM_BADGE: Record<string, string> = {
  KreditBee: "Top Pick",
  RapidMoney: "Quick Approval",
};

const BADGE_VISIBLE_COUNT = 2;

// Lenders that have been removed and should not be displayed
const REMOVED_LENDERS = ["MPokket", "Loan112", "SmartCoin", "SmartCoinHighIntent"];

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

// Sort offers by dashboard priority order
function sortOffersByPriority(offers: DashboardOffer[]): DashboardOffer[] {
  return [...offers].sort((a, b) => {
    const priorityA = DASHBOARD_PRIORITY_ORDER.indexOf(a.name);
    const priorityB = DASHBOARD_PRIORITY_ORDER.indexOf(b.name);
    // If not in priority list, put at the end
    const effectivePriorityA = priorityA === -1 ? DASHBOARD_PRIORITY_ORDER.length : priorityA;
    const effectivePriorityB = priorityB === -1 ? DASHBOARD_PRIORITY_ORDER.length : priorityB;
    return effectivePriorityA - effectivePriorityB;
  });
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
      const data = existingUserData.data as Record<string, unknown>;
      const shownOffers = (data.shownOffers || []) as ShownOffer[];

      // Map existing shown offers, but filter out RapidMoney if isDuplicate is false,
      // RamFinCorp if message !== "Dedup Success", and filter out removed lenders
      const rapidMoneyData = data.RapidMoney as { isDuplicate?: boolean; utm_link?: string } | undefined;
      const ramFinCorpData = data.RamFinCorp as { message?: string; utm_link?: string } | undefined;
      const isRamFinCorpEligible = (ramFinCorpData?.message || "").toLowerCase() === "dedup success";

      const filteredShownOffers = shownOffers.filter((o) => {
        // Filter out removed lenders
        if (REMOVED_LENDERS.includes(o.lenderName)) {
          return false;
        }
        if (o.lenderName === "RapidMoney") {
          return rapidMoneyData?.isDuplicate === false;
        }
        if (o.lenderName === "RamFinCorp") {
          return isRamFinCorpEligible;
        }
        return true;
      });
      const mappedOffers = filteredShownOffers.map((o) => mapShownOfferToDashboardOffer(o, data));

      // Add static lenders that should always be shown (KreditBee, SpeedoLoan, Cashvia, Vivifi, TrueBalance)
      // Note: RapidMoney is now shown based on API response (isDuplicate === false)
      // Note: RamFinCorp is now shown based on API response (message === "Dedup Success")
      // Note: LoanWalle is now shown only if it comes from API staticLenders
      const ALWAYS_SHOW_STATIC_LENDERS = ["KreditBee", "SpeedoLoan", "Cashvia", "Vivifi", "TrueBalance"];
      const existingLenderNames = new Set(mappedOffers.map((o) => o.name));

      // Extract utm_links from staticLenders array (API returns lenders with dynamic utm_link)
      const staticLendersArray = (data.staticLenders || []) as Array<{ name?: string; utm_link?: string }>;
      const staticLenderUtmLinks: Record<string, string> = {};
      // Map API names to internal lender names
      const STATIC_LENDER_NAME_MAP: Record<string, string> = {
        "Speedoloan": "SpeedoLoan",
        "LoanWalle": "LoanWalle",
        "Loanwalle": "LoanWalle",
        "TrueBalance": "TrueBalance",
        "trueBalance": "TrueBalance",
        "truebalance": "TrueBalance",
      };
      for (const lender of staticLendersArray) {
        if (lender.name && lender.utm_link) {
          // Use name map or normalize (e.g., "vivifi" -> "Vivifi")
          const mappedName = STATIC_LENDER_NAME_MAP[lender.name];
          const normalizedName = mappedName || lender.name.charAt(0).toUpperCase() + lender.name.slice(1).toLowerCase();
          staticLenderUtmLinks[normalizedName] = lender.utm_link;
          // Also store with original casing
          staticLenderUtmLinks[lender.name] = lender.utm_link;
        }
      }

      for (const lenderName of ALWAYS_SHOW_STATIC_LENDERS) {
        if (!existingLenderNames.has(lenderName)) {
          // Prefer API's staticLenders utm_link, then fallback
          const utmLink = staticLenderUtmLinks[lenderName] || FALLBACK_UTM_LINKS[lenderName];
          mappedOffers.push({
            name: lenderName,
            utmLink,
            isOffer: false,
          });
        }
      }

      // Add LoanWalle only if it comes from API staticLenders
      if (staticLenderUtmLinks["LoanWalle"] && !existingLenderNames.has("LoanWalle")) {
        mappedOffers.push({
          name: "LoanWalle",
          utmLink: staticLenderUtmLinks["LoanWalle"],
          isOffer: false,
        });
      }

      // Add RapidMoney based on API response (only if isDuplicate === false)
      if (rapidMoneyData?.isDuplicate === false && !existingLenderNames.has("RapidMoney")) {
        mappedOffers.push({
          name: "RapidMoney",
          utmLink: rapidMoneyData.utm_link || FALLBACK_UTM_LINKS["RapidMoney"],
          isOffer: false,
        });
      }

      // Add RamFinCorp based on API response (only if message === "Dedup Success")
      if (isRamFinCorpEligible && !existingLenderNames.has("RamFinCorp")) {
        mappedOffers.push({
          name: "RamFinCorp",
          utmLink: ramFinCorpData?.utm_link || FALLBACK_UTM_LINKS["RamFinCorp"],
          isOffer: false,
        });
      }

      // Sort offers by dashboard priority order
      const sortedOffers = sortOffersByPriority(mappedOffers);
      setOffers(sortedOffers);
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

        <div className={`grid gap-4 grid-cols-1 ${
          lendersToShow.length === 1
            ? 'sm:grid-cols-1 max-w-xl'
            : lendersToShow.length === 2
              ? 'sm:grid-cols-2'
              : 'sm:grid-cols-2 lg:grid-cols-3'
        }`}>
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
