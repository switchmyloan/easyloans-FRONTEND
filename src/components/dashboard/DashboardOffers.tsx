"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import OfferCard from "@/components/offers/OfferCard";
import NotEligibleScreen from "@/components/offers/NotEligibleScreen";
import SessionActiveBanner from "@/components/shared/SessionActiveBanner";
import { getStaticLenderDetail, STATIC_LENDER_LOGOS, DASHBOARD_PRIORITY_ORDER, LENDER_FEATURE_TAGS, DISPLAY_NAMES } from "@/lib/constants";
import { useOtpGuard } from "@/app/dashboard/layout";
import { useRamFinCorpApply } from "@/hooks/useRamFinCorpApply"; // stub - RamFinCorp disabled
import { useKreditBeeApply } from "@/hooks/useLenderApply";

// Import API functions
import {
  getStoredShortExistingUserOffers,
  saveShortLender,
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
const DASHBOARD_VISIBLE_COUNT = 4;

const FALLBACK_UTM_LINKS: Record<string, string> = {
  SmartCoin: "https://smartcoin.onelink.me/KLIY/Switchmyloanlandingpage",
  SmartCoinHighIntent: "https://smartcoin.onelink.me/KLIY/Switchmyloanlandingpage",
  // RamFinCorp: "https://ramfincorp.com/",
  Vivifi: "https://online.flexsalary.com/CustomerLogin/Index?CampaignID=9192313#x",
  RapidMoney: "https://web.rapidmoney.in/borrower/login?utm_source=creadylandingpage&utm_extsource=abc&utm_medium=rapidmoney&utm_campaign=xyz&utm_campaignID=def",
  KreditBee: "https://www.kreditbee.in/signin",
  // SpeedoLoan: "https://loanapply.speedoloan.com?partner_id=cready",
  CashMySalary: "https://loanapply.cashmysalary.com/auth?partner_id=cready&utm_medium=whatsapp&utm_campaign=social",
  TrueFund: "https://truefund.in/short-term-loan/?utm_source=Cready&utm_medium=CRDY&utm_campaign=Cready_Referral",
  MoneyDot: "https://www.moneydot.in/",
  RupiNow: "https://www.rupinow.com/home",
  // ASAPFinance: "https://asapfinance.in/customer/login?utm_source=easyloans+Cready",
};

const LENDER_CUSTOM_BADGE: Record<string, string> = {
  KreditBee: "Top Pick",
  RapidMoney: "Quick Approval",
};

const BADGE_VISIBLE_COUNT = 2;

// Lenders that have been removed and should not be displayed
// Lenders that have been removed and should not be displayed
const REMOVED_LENDERS = ["MPokket", "Loan112"];

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
function sortOffersByPriority(offers: DashboardOffer[], priorityLender?: string): DashboardOffer[] {
  // Final choke point: drop retired lenders no matter which path added them.
  const filtered = [...offers].filter((o) => !REMOVED_LENDERS.includes(o.name));

  // If there's a priority lender (from utm_medium), put it first
  if (priorityLender) {
    const priorityIndex = filtered.findIndex((o) => o.name === priorityLender);
    if (priorityIndex > 0) {
      const [priorityOffer] = filtered.splice(priorityIndex, 1);
      filtered.unshift(priorityOffer);
    }
  }

  // Sort remaining offers by dashboard priority order
  return filtered.sort((a, b) => {
    // Keep priority lender at position 0 if it exists
    if (priorityLender) {
      if (a.name === priorityLender) return -1;
      if (b.name === priorityLender) return 1;
    }
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
  const [showNotEligible, setShowNotEligible] = useState<string | null>(null);

  // Lender hooks - handle apply logic and loading state
  const {
    apply: applyRamFinCorp,
    applying: ramFinCorpApplying,
    sessionActiveMessage,
    clearSessionActiveMessage,
  } = useRamFinCorpApply();

  const { apply: applyKreditBee, applying: kbApplying } = useKreditBeeApply();

  // Store the LoanWalle UTM link (from LoanwalleSalaried or LoanwalleSelfEmployed)
  const [loanWalleUtmLink, setLoanWalleUtmLink] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Check utm_medium for priority lender
    const utmMedium = (sessionStorage.getItem("utm_medium") || "").toLowerCase();
    let priorityLenderLocal: string | undefined = undefined;
    if (utmMedium === "loanwalle") {
      priorityLenderLocal = "LoanWalle";
    }

    const existingUserData = getStoredShortExistingUserOffers();
    const userExists = existingUserData?.data?.found || existingUserData?.data?.exists;

    if (userExists && existingUserData?.data) {
      const data = existingUserData.data as Record<string, unknown>;
      const shownOffers = (data.shownOffers || []) as ShownOffer[];

      // Map existing shown offers, but filter out RapidMoney if isDuplicate is false,
      // and filter out removed lenders.
      const rapidMoneyData = data.RapidMoney as { isDuplicate?: boolean; utm_link?: string } | undefined;
      // const ramFinCorpData = data.RamFinCorp as { data?: { response?: { message?: string } }; utm_link?: string } | undefined;
      // const isRamFinCorpEligible = ramFinCorpData?.data?.response?.message === "Dedup Success";
      const isRamFinCorpEligible = false; // RamFinCorp disabled
      // const mmbData = data.MMBDedup as { data?: { message?: string }; utm_link?: string } | undefined;
      // const isMmbEligible = mmbData?.data?.message === "user_not_found";
      const isMmbEligible = false;

      const filteredShownOffers = shownOffers.filter((o) => {
        // Filter out removed lenders
        if (REMOVED_LENDERS.includes(o.lenderName)) {
          return false;
        }
        if (o.lenderName === "RapidMoney") {
          return rapidMoneyData?.isDuplicate === false;
        }
        // if (o.lenderName === "RamFinCorp") {
        //   return isRamFinCorpEligible;
        // }
        // if (o.lenderName === "MMB" || o.lenderName === "MMBDedup") {
        //   return isMmbEligible;
        // }
        return true;
      });
      const mappedOffers = filteredShownOffers.map((o) => mapShownOfferToDashboardOffer(o, data));

      // Add static lenders that should always be shown
      // Note: RapidMoney is now shown based on API response (isDuplicate === false)
      // Note: TejasLoan, F1SpeedLoan, ASAPFinance, SpeedoLoan, Vivifi, TrueBalance, RamFinCorp are shown only if they come from API staticLenders
      const ALWAYS_SHOW_STATIC_LENDERS = ["KreditBee"];
      const existingLenderNames = new Set(mappedOffers.map((o) => o.name));

      // Extract utm_links from staticLenders array (API returns lenders with dynamic utm_link)
      const staticLendersArray = (data.staticLenders || []) as Array<{ name?: string; utm_link?: string }>;
      const staticLenderUtmLinks: Record<string, string> = {};
      // Map API names to internal lender names
      const STATIC_LENDER_NAME_MAP: Record<string, string> = {
        // "Speedoloan": "SpeedoLoan",
        // "speedoloan": "SpeedoLoan",
        // "SpeedoLoan": "SpeedoLoan",
        "CashMySalary": "CashMySalary",
        "cashmysalary": "CashMySalary",
        "Cashmysalary": "CashMySalary",
        // "LoanWalle": "LoanWalle",
        // "Loanwalle": "LoanWalle",
        "TrueBalance": "TrueBalance",
        "trueBalance": "TrueBalance",
        "truebalance": "TrueBalance",
        "Vivifi": "Vivifi",
        "vivifi": "Vivifi",
        // "ASAPFinance": "ASAPFinance",
        // "asapfinance": "ASAPFinance",
        "Apollo": "Apollo",
        "apollo": "Apollo",
        "Cash2You": "Cash2You",
        "cash2you": "Cash2You",
        "cash2You": "Cash2You",
        "RocketCash": "RocketCash",
        "rocketcash": "RocketCash",
        "rocketCash": "RocketCash",
        // "MMB": "MMB",
        // "mmb": "MMB",
        // "mmbdedup": "MMB",
        // "MMBDedup": "MMB",
        "LoanWalle": "LoanWalle",
        "loanwalle": "LoanWalle",
        "LoanwalleSalaried": "LoanwalleSalaried",
        "loanwallesalaried": "LoanwalleSalaried",
        "LoanwalleSelfEmployed": "LoanwalleSelfEmployed",
        "loanwalleselfemployed": "LoanwalleSelfEmployed",
        // "TurantPaisa": "TurantPaisa",
        // "turantpaisa": "TurantPaisa",
        "QuickMoney": "QuickMoney",
        "quickmoney": "QuickMoney",
        "Kamakshimoney": "Kamakshimoney",
        "Kamakshi": "Kamakshimoney",
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

      // // Add ASAPFinance only if it comes from API staticLenders
      // if (staticLenderUtmLinks["ASAPFinance"] && !existingLenderNames.has("ASAPFinance")) {
      //   mappedOffers.push({
      //     name: "ASAPFinance",
      //     utmLink: staticLenderUtmLinks["ASAPFinance"],
      //     isOffer: false,
      //   });
      // }


      // Add Apollo only if it comes from API staticLenders
      if (staticLenderUtmLinks["Apollo"] && !existingLenderNames.has("Apollo")) {
        mappedOffers.push({
          name: "Apollo",
          utmLink: staticLenderUtmLinks["Apollo"],
          isOffer: false,
        });
      }

      // Add Cash2You only if it comes from API staticLenders
      if (staticLenderUtmLinks["Cash2You"] && !existingLenderNames.has("Cash2You")) {
        mappedOffers.push({
          name: "Cash2You",
          utmLink: staticLenderUtmLinks["Cash2You"],
          isOffer: false,
        });
      }

      // Add RocketCash only if it comes from API staticLenders
      if (staticLenderUtmLinks["RocketCash"] && !existingLenderNames.has("RocketCash")) {
        mappedOffers.push({
          name: "RocketCash",
          utmLink: staticLenderUtmLinks["RocketCash"],
          isOffer: false,
        });
      }

      // // Add SpeedoLoan only if it comes from API staticLenders
      // if (staticLenderUtmLinks["SpeedoLoan"] && !existingLenderNames.has("SpeedoLoan")) {
      //   mappedOffers.push({
      //     name: "SpeedoLoan",
      //     utmLink: staticLenderUtmLinks["SpeedoLoan"],
      //     isOffer: false,
      //   });
      // }

      // Add CashMySalary only if it comes from API staticLenders
      if (staticLenderUtmLinks["CashMySalary"] && !existingLenderNames.has("CashMySalary")) {
        mappedOffers.push({
          name: "CashMySalary",
          utmLink: staticLenderUtmLinks["CashMySalary"],
          isOffer: false,
        });
      }

      // Add Vivifi unless message indicates rejection
      // Try both capitalized and lowercase keys (API returns lowercase for vivifi)
      const vivifiData = (data.Vivifi || data.vivifi) as { message?: string; utm_link?: string } | undefined;
      const vivifiMessage = vivifiData?.message || "";
      const isVivifiRejected =
        vivifiMessage === "Rejected due to Eligibility criteria." ||
        vivifiMessage === "Lead rejected.";
      const isVivifiEligible = vivifiMessage && !isVivifiRejected;
      if (isVivifiEligible && vivifiData?.utm_link && !existingLenderNames.has("Vivifi")) {
        mappedOffers.push({
          name: "Vivifi",
          utmLink: vivifiData.utm_link,
          isOffer: false,
        });
      }

      // Add TrueBalance only if it comes from API staticLenders
      if (staticLenderUtmLinks["TrueBalance"] && !existingLenderNames.has("TrueBalance")) {
        mappedOffers.push({
          name: "TrueBalance",
          utmLink: staticLenderUtmLinks["TrueBalance"],
          isOffer: false,
        });
      }

      // Add Kamakshimoney only if it comes from API staticLenders
      if (staticLenderUtmLinks["Kamakshimoney"] && !existingLenderNames.has("Kamakshimoney")) {
        mappedOffers.push({
          name: "Kamakshimoney",
          utmLink: staticLenderUtmLinks["Kamakshimoney"],
          isOffer: false,
        });
      }

      // Add TrueFund only if it comes from API staticLenders (now a static lender —
      // backend gates it on salaried + salary >= 22k + pincode).
      if (staticLenderUtmLinks["TrueFund"] && !existingLenderNames.has("TrueFund")) {
        mappedOffers.push({
          name: "TrueFund",
          utmLink: staticLenderUtmLinks["TrueFund"],
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

      // // Add RamFinCorp if eligible (data.response.message === "Dedup Success") - RamFinCorp disabled
      // if (isRamFinCorpEligible && !existingLenderNames.has("RamFinCorp")) {
      //   mappedOffers.push({
      //     name: "RamFinCorp",
      //     utmLink: ramFinCorpData?.utm_link || FALLBACK_UTM_LINKS["RamFinCorp"],
      //     isOffer: false,
      //   });
      // }

      // Add TurantPaisa only if it comes from API staticLenders
      // if (staticLenderUtmLinks["TurantPaisa"] && !existingLenderNames.has("TurantPaisa")) {
      //   mappedOffers.push({
      //     name: "TurantPaisa",
      //     utmLink: staticLenderUtmLinks["TurantPaisa"],
      //     isOffer: false,
      //   });
      // }

      // Add QuickMoney only if it comes from API staticLenders
      if (staticLenderUtmLinks["QuickMoney"] && !existingLenderNames.has("QuickMoney")) {
        mappedOffers.push({
          name: "QuickMoney",
          utmLink: staticLenderUtmLinks["QuickMoney"],
          isOffer: false,
        });
      }

      // Add MMB if eligible (message === "user_not_found")
      // if (isMmbEligible && !existingLenderNames.has("MMB")) {
      //   mappedOffers.push({
      //     name: "MMB",
      //     utmLink: mmbData?.utm_link,
      //     isOffer: false,
      //   });
      // }

      // LoanWalle logic: Show LoanWalle card if LoanwalleSalaried OR LoanwalleSelfEmployed is available in staticLenders
      // Only one will be received at a time from the API
      const loanwalleUtm = staticLenderUtmLinks["LoanwalleSalaried"] || staticLenderUtmLinks["LoanwalleSelfEmployed"];

      if (loanwalleUtm && !existingLenderNames.has("LoanWalle")) {
        // Store the UTM link for direct redirect
        setLoanWalleUtmLink(loanwalleUtm);

        // Add LoanWalle to offers list
        mappedOffers.push({
          name: "LoanWalle",
          utmLink: loanwalleUtm,
          isOffer: false,
        });
      }

      // Sort offers by dashboard priority order (with utm_medium priority lender first)
      const sortedOffers = sortOffersByPriority(mappedOffers, priorityLenderLocal);
      setOffers(sortedOffers);
    } else {
      setOffers([]);
    }
  }, []);

  const handleKreditBeeApply = async () => {
    const result = await applyKreditBee();
    if (result.status === "notEligible") {
      setShowNotEligible("KreditBee");
    } else if (result.status === "error") {
      toast.error(result.message || "Something went wrong. Please try again.", { duration: 4000 });
    }
  };

  // const handleRamFinCorpApply = async () => {
  //   const result = await applyRamFinCorp();
  //   // Show NotEligible modal for notEligible or error status
  //   if (result.status === "notEligible" || result.status === "error") {
  //     setShowNotEligible("RamFinCorp");
  //   }
  // };

  // const handleMMBApply = async (initialUtmLink?: string) => {
  //   const result = await applyMMB(initialUtmLink);
  //   if (result.status === "notEligible" || result.status === "error") {
  //     setShowNotEligible("MMB");
  //   }
  // };

  const handleLoanWalleApply = async (utmLink?: string) => {
    const linkToUse = utmLink || loanWalleUtmLink;
    if (!linkToUse) return;

    const phone = sessionStorage.getItem("userPhone") || "";
    await saveShortLender(phone, "LoanWalle");

    window.open(linkToUse, "_blank");
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

    // // Route RamFinCorp to specific handler - RamFinCorp disabled
    // if (lenderName === "RamFinCorp") {
    //   handleRamFinCorpApply();
    //   return;
    // }

    // Route LoanWalle to specific handler
    if (lenderName === "LoanWalle") {
      handleLoanWalleApply(utmLink);
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

      {/* Session Active Notification Banner */}
      <SessionActiveBanner
        message={sessionActiveMessage}
        onClose={clearSessionActiveMessage}
      />

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
              : lendersToShow.length === 3
                ? 'sm:grid-cols-2 lg:grid-cols-3'
                : 'sm:grid-cols-2 lg:grid-cols-4'
        }`}>
          {lendersToShow.map((offer, idx) => {
            const lenderName = offer.name;
            const displayName = DISPLAY_NAMES[lenderName] || lenderName;
            const details = getStaticLenderDetail(lenderName);
            const logoMeta = STATIC_LENDER_LOGOS[lenderName];

            const hasCustomBadge = !!LENDER_CUSTOM_BADGE[lenderName];
            const hasFeatureTag = !!LENDER_FEATURE_TAGS[lenderName];
            const showBadge = idx < BADGE_VISIBLE_COUNT || hasCustomBadge || hasFeatureTag || offer.isOffer;
            const badgeText = showBadge
              ? LENDER_FEATURE_TAGS[lenderName] || LENDER_CUSTOM_BADGE[lenderName] || (offer.isOffer ? "Pre-Qualified" : "Matched")
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
