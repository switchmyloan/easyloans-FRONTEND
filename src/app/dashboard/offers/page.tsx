"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import OfferCard from "@/components/offers/OfferCard";
import NotEligibleScreen from "@/components/offers/NotEligibleScreen";
import LoanWalleLenderModal from "@/components/offers/LoanWalleLenderModal";
import SessionActiveBanner from "@/components/shared/SessionActiveBanner";
import { getStaticLenderDetail, STATIC_LENDER_LOGOS, DASHBOARD_PRIORITY_ORDER, LENDER_FEATURE_TAGS, DISPLAY_NAMES } from "@/lib/constants";
import { useOtpGuard } from "@/app/dashboard/layout";
import { useRamFinCorpApply } from "@/hooks/useRamFinCorpApply"; // stub - RamFinCorp disabled
import { useKreditBeeApply, useSmartCoinApply, useMMBApply, useTejasLoanApply, useF1SpeedLoanApply } from "@/hooks/useLenderApply";
import {
  getStoredShortExistingUserOffers,
  saveShortLender,
  applyToLoanWalle,
} from "@/lib/api";
import { cleverTapTrackEvent, CLEVERTAP_EVENTS } from "@/lib/clevertap";
import StickyLenderBanner from "@/components/offers/StickyLenderBanner";


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
const FALLBACK_UTM_LINKS: Record<string, string> = {
  SmartCoin: "https://smartcoin.onelink.me/KLIY/Switchmyloanlandingpage",
  // RamFinCorp: "https://ramfincorp.com/",
  Vivifi: "https://online.flexsalary.com/CustomerLogin/Index?CampaignID=9192313#x",
  SmartCoinHighIntent: "https://smartcoin.onelink.me/KLIY/Switchmyloanlandingpage",
  TrueBalance: "https://truebalance.io/",
  RapidMoney: "https://web.rapidmoney.in/borrower/login?utm_source=creadylandingpage&utm_extsource=abc&utm_medium=rapidmoney&utm_campaign=xyz&utm_campaignID=def",
  KreditBee: "https://www.kreditbee.in/signin",
 
  // SpeedoLoan: "https://loanapply.speedoloan.com?partner_id=cready",
  CashMySalary: "https://loanapply.cashmysalary.com/auth?partner_id=cready&utm_medium=whatsapp&utm_campaign=social",
  TrueFund: "https://truefund.in/short-term-loan/?utm_source=Cready&utm_medium=CRDY&utm_campaign=Cready_Referral",
  MoneyDot: "https://www.moneydot.in/",
  RupiNow: "https://www.rupinow.com/home",
  // ASAPFinance: "https://asapfinance.in/customer/login?utm_source=easyloans+Cready",
  LendingPlate: "https://lendingplate.com/",
};

const LENDER_CUSTOM_BADGE: Record<string, string> = {
  KreditBee: "Top Pick",
  RapidMoney: "Quick Approval",
  TrueBalance: "Popular",
};

const BADGE_VISIBLE_COUNT = 3;

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

  // Normalize API lender names to display names (e.g., MMBDedup → MMB)
  const normalizedName = shownOffer.lenderName === "MMBDedup" ? "MMB" : shownOffer.lenderName;

  return {
    name: normalizedName,
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
// All Offers Page Component
// ============================================================
export default function DashboardOffersPage() {
  const { guardActivity } = useOtpGuard();
  const [offers, setOffers] = useState<DashboardOffer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNotEligible, setShowNotEligible] = useState<string | null>(null);

  // Lender hooks - handle apply logic and loading state
  const {
    apply: applyRamFinCorp,
    applying: ramFinCorpApplying,
    sessionActiveMessage,
    clearSessionActiveMessage,
  } = useRamFinCorpApply();

  const { apply: applyKreditBee, applying: kbApplying } = useKreditBeeApply();
  const { apply: applySmartCoin, applying: smartCoinApplying } = useSmartCoinApply();
  const { apply: applyMMB, applying: mmbApplying } = useMMBApply();
  const { apply: applyTejasLoan, applying: tejasLoanApplying } = useTejasLoanApply();
  const { apply: applyF1SpeedLoan, applying: f1SpeedLoanApplying } = useF1SpeedLoanApply();

  // LoanWalle modal state
  const [showLoanWalleModal, setShowLoanWalleModal] = useState(false);
  const [showQuickMoneyBanner, setShowQuickMoneyBanner] = useState(true);
  const [loanWalleLenders, setLoanWalleLenders] = useState<{
    toofanLoan?: { name: string; displayName: string; utmLink: string; logo: string };
    rupeeRaftaar?: { name: string; displayName: string; utmLink: string; logo: string };
  }>({});

  // utm_medium priority lender state
  const [priorityLender, setPriorityLender] = useState<string | undefined>(undefined);

  useEffect(() => {
    // Check utm_medium for priority lender
    const utmMedium = (sessionStorage.getItem("utm_medium") || "").toLowerCase();
    let priorityLenderLocal: string | undefined = undefined;
    if (utmMedium === "loanwalle") {
      priorityLenderLocal = "LoanWalle";
    }
    setPriorityLender(priorityLenderLocal);
    const existingUserData = getStoredShortExistingUserOffers();
    const userExists = existingUserData?.data?.found || existingUserData?.data?.exists;

    if (userExists && existingUserData?.data) {
      const data = existingUserData.data as Record<string, unknown>;
      const shownOffers = (data.shownOffers || []) as ShownOffer[];

      // Map existing shown offers, but filter out RapidMoney if isDuplicate is false
      // and filter out TrueFund if message doesn't contain "user details received sucessfully"
      const rapidMoneyData = data.RapidMoney as { isDuplicate?: boolean; utm_link?: string } | undefined;
      const trueFundData = data.TrueFund as { message?: string; utm_link?: string; data?: { response?: { message?: string } } } | undefined;
      const trueFundMessage = (trueFundData?.message || "").toLowerCase();
      const trueFundResponseMessage = (trueFundData?.data?.response?.message || "").toLowerCase();
      const isTrueFundEligible =
        trueFundMessage.includes("user details received sucessfully") ||
        trueFundResponseMessage.includes("user details received sucessfully");

const moneyDotData = data.MoneyDot as {
  data?: {
    response?: {
      can_attribute?: boolean;
    };
  };
  utm_link?: string;
} | undefined;

const isMoneyDotEligible =
  moneyDotData?.data?.response?.can_attribute === true;

// const ramFinCorpData = data.RamFinCorp as {
//   data?: { response?: { message?: string } };
//   utm_link?: string;
// } | undefined;

// const isRamFinCorpEligible = ramFinCorpData?.data?.response?.message === "Dedup Success";
const isRamFinCorpEligible = false; // RamFinCorp disabled

const smartCoinDedupeData = (data.smartCoinDedupe || data.SmartCoinDedupe) as {
  isDuplicate?: boolean;
  utm_link?: string;
} | undefined;

const isSmartCoinEligible = smartCoinDedupeData?.isDuplicate === false;

const mmbData = data.MMBDedup as {
  data?: { message?: string };
  utm_link?: string;
} | undefined;

const isMmbEligible = mmbData?.data?.message === "user_not_found"; 

const rupiNowData = data.RupiNow as {
  dedupeStatus?: string;
  utm_link?: string;
} | undefined;

const isRupiNowEligible = rupiNowData?.dedupeStatus === "Passed";


// LendingPlate is a lead-push lender: the backend folds resData.status === "S"
// into `success`, and stamps utm_link (their API returns no redirect URL).
const lendingPlateData = data.LendingPlate as {
  success?: boolean;
  utm_link?: string;
} | undefined;

const isLendingPlateEligible = lendingPlateData?.success === true;

      const filteredShownOffers = shownOffers.filter((o) => {
        // Filter out removed lenders
        if (REMOVED_LENDERS.includes(o.lenderName)) {
          return false;
        }
        if (o.lenderName === "RapidMoney") {
          return rapidMoneyData?.isDuplicate === false;
        }
        if (o.lenderName === "TrueFund") {
          // TrueFund is now a static lender — added below from staticLenders, not here.
          return false;
        }
        if (o.lenderName === "MoneyDot") {
          return isMoneyDotEligible;
        }
        // if (o.lenderName === "RamFinCorp") {
        //   return isRamFinCorpEligible;
        // }
        if (o.lenderName === "MMBDedup") {
          return isMmbEligible;
        }
        if (o.lenderName === "RupiNow") {
          return isRupiNowEligible;
        }
        return true;
      });
      const mappedOffers = filteredShownOffers.map((o) => mapShownOfferToDashboardOffer(o, data));

      // Add static lenders that should always be shown
      // Note: RapidMoney is now shown based on API response (isDuplicate === false)
      // Note: TejasLoan, F1SpeedLoan, ASAPFinance, SpeedoLoan, Vivifi, TrueBalance are shown only if they come from API staticLenders (RamFinCorp disabled)
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
        "SmartCoin": "SmartCoin",
        "smartcoin": "SmartCoin",
        "Smartcoin": "SmartCoin",
        "smartCoinDedupe": "SmartCoin",
        "SmartCoinDedupe": "SmartCoin",
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
        // "RamFinCorp": "RamFinCorp",
        // "ramfincorp": "RamFinCorp",
        "Tejas": "TejasLoan",
        "tejas": "TejasLoan",
        "TejasLoan": "TejasLoan",
        "tejasloan": "TejasLoan",
        "F1SpeedLoan": "F1SpeedLoan",
        "f1speedloan": "F1SpeedLoan",
        "Cash2You": "Cash2You",
        "cash2you": "Cash2You",
        "cash2You": "Cash2You",
        "RocketCash": "RocketCash",
        "rocketcash": "RocketCash",
        "rocketCash": "RocketCash",
        "MMB": "MMB",
        "mmb": "MMB",
        "mmbdedup": "MMB",
        "MMBDedup": "MMB",
        "ToofanLoan": "ToofanLoan",
        "toofanloan": "ToofanLoan",
        "RupeeRaftaar": "RupeeRaftaar",
        "rupeeraftaar": "RupeeRaftaar",
        "LoanWalle": "LoanWalle",
        "loanwalle": "LoanWalle",
        "DhanPocket": "DhanPocket",
        "dhanpocket": "DhanPocket",
        "TurantPaisa": "TurantPaisa",
        "turantpaisa": "TurantPaisa",
        "QuickMoney": "QuickMoney",
        "quickmoney": "QuickMoney"
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

      // // Add LoanWalle only if it comes from API staticLenders
      // if (staticLenderUtmLinks["LoanWalle"] && !existingLenderNames.has("LoanWalle")) {
      //   mappedOffers.push({
      //     name: "LoanWalle",
      //     utmLink: staticLenderUtmLinks["LoanWalle"],
      //     isOffer: false,
      //   });
      // }

      // Check loanWalleUserFound - if true, hide TejasLoan and F1SpeedLoan
      const loanWalleUserFound = (data as { loanWalleUserFound?: boolean })?.loanWalleUserFound;

      // Add TejasLoan only if loanWalleUserFound is NOT true AND it exists in staticLenders
      if (loanWalleUserFound !== true && staticLenderUtmLinks["TejasLoan"] && !existingLenderNames.has("TejasLoan")) {
        mappedOffers.push({
          name: "TejasLoan",
          utmLink: staticLenderUtmLinks["TejasLoan"],
          isOffer: false,
        });
      }

      // Add F1SpeedLoan only if loanWalleUserFound is NOT true AND it exists in staticLenders
      if (loanWalleUserFound !== true && staticLenderUtmLinks["F1SpeedLoan"] && !existingLenderNames.has("F1SpeedLoan")) {
        mappedOffers.push({
          name: "F1SpeedLoan",
          utmLink: staticLenderUtmLinks["F1SpeedLoan"],
          isOffer: false,
        });
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

      // Add RapidMoney based on API response (only if isDuplicate === false)
      if (rapidMoneyData?.isDuplicate === false && !existingLenderNames.has("RapidMoney")) {
        mappedOffers.push({
          name: "RapidMoney",
          utmLink: rapidMoneyData.utm_link || FALLBACK_UTM_LINKS["RapidMoney"],
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

      // Add MoneyDot based on API response (only if canAttribute === true)
      if (isMoneyDotEligible && !existingLenderNames.has("MoneyDot")) {
        mappedOffers.push({
          name: "MoneyDot",
          utmLink: moneyDotData?.utm_link || FALLBACK_UTM_LINKS["MoneyDot"],
          isOffer: false,
        });
      }

      // // Add RamFinCorp if eligible (data.response.message === "Dedup Success") - RamFinCorp disabled
      // if (isRamFinCorpEligible && !existingLenderNames.has("RamFinCorp")) {
      //   // Track RamFinCorp card shown after dedup success
      //   console.log("[RamFinCorp] Dedup success - card shown, firing CleverTap event");
      //   cleverTapTrackEvent(CLEVERTAP_EVENTS.EASY_RAMFINCORP_DEDUP_SUCCESS_CARD_SHOWN);
      //   mappedOffers.push({
      //     name: "RamFinCorp",
      //     utmLink: ramFinCorpData?.utm_link || FALLBACK_UTM_LINKS["RamFinCorp"],
      //     isOffer: false,
      //   });
      // } else if (ramFinCorpData && !isRamFinCorpEligible) {
      //   // Track RamFinCorp dedup fail - API returned data but user is not eligible
      //   console.log("[RamFinCorp] Dedup fail - firing CleverTap event");
      //   cleverTapTrackEvent(CLEVERTAP_EVENTS.EASY_RAMFINCORP_DEDUP_FAIL);
      // }

      // Add SmartCoin if eligible (isDuplicate === false)
      if (isSmartCoinEligible && !existingLenderNames.has("SmartCoin")) {
        // Track SmartCoin card shown after dedup success
        console.log("[SmartCoin] Dedup success - card shown, firing CleverTap event");
        cleverTapTrackEvent(CLEVERTAP_EVENTS.EASY_SMARTCOIN_DEDUP_SUCCESS_CARD_SHOWN);
        mappedOffers.push({
          name: "SmartCoin",
          utmLink: smartCoinDedupeData?.utm_link,
          isOffer: false,
        });
      } else if (smartCoinDedupeData && !isSmartCoinEligible) {
        // Track SmartCoin dedup fail - API returned data but user is a duplicate
        console.log("[SmartCoin] Dedup fail - firing CleverTap event");
        cleverTapTrackEvent(CLEVERTAP_EVENTS.EASY_SMARTCOIN_DEDUP_FAIL);
      }

    // Add MMB if eligible (data.message === "user_not_found")
      if (isMmbEligible && !existingLenderNames.has("MMB")) {
        mappedOffers.push({
          name: "MMB",
          utmLink: mmbData?.utm_link,
          isOffer: false,
        });
      }


      //   if (staticLenderUtmLinks["MMB"] && !existingLenderNames.has("MMB")) {
      //   mappedOffers.push({
      //     name: "MMB",
      //     utmLink: staticLenderUtmLinks["MMB"],
      //     isOffer: false,
      //   });
      // }

      // Add RupiNow based on API response (only if dedupeStatus === "Passed")
      if (isRupiNowEligible && !existingLenderNames.has("RupiNow")) {
        mappedOffers.push({
          name: "RupiNow",
          utmLink: rupiNowData?.utm_link || FALLBACK_UTM_LINKS["RupiNow"],
          isOffer: false,
        });
      }


      // Add LendingPlate based on API response (only if the lead push succeeded)
      if (isLendingPlateEligible && !existingLenderNames.has("LendingPlate")) {
        mappedOffers.push({
          name: "LendingPlate",
          utmLink: lendingPlateData?.utm_link || FALLBACK_UTM_LINKS["LendingPlate"],
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

      // Add DhanPocket only if it comes from API staticLenders
      if (staticLenderUtmLinks["DhanPocket"] && !existingLenderNames.has("DhanPocket")) {
        mappedOffers.push({
          name: "DhanPocket",
          utmLink: staticLenderUtmLinks["DhanPocket"],
          isOffer: false,
        });
      }

      // Add TurantPaisa only if it comes from API staticLenders
      if (staticLenderUtmLinks["TurantPaisa"] && !existingLenderNames.has("TurantPaisa")) {
        mappedOffers.push({
          name: "TurantPaisa",
          utmLink: staticLenderUtmLinks["TurantPaisa"],
          isOffer: false,
        });
      }

      // Add QuickMoney only if it comes from API staticLenders
      if (staticLenderUtmLinks["QuickMoney"] && !existingLenderNames.has("QuickMoney")) {
        mappedOffers.push({
          name: "QuickMoney",
          utmLink: staticLenderUtmLinks["QuickMoney"],
          isOffer: false,
        });
      }

      // LoanWalle logic: Show LoanWalle card if ToofanLoan OR RupeeRaftaar is available in staticLenders
      const toofanLoanUtm = staticLenderUtmLinks["ToofanLoan"];
      const rupeeRaftaarUtm = staticLenderUtmLinks["RupeeRaftaar"];

      if ((toofanLoanUtm || rupeeRaftaarUtm) && !existingLenderNames.has("LoanWalle")) {
        // Store the lender options for the modal
        const loanWalleOptions: {
          toofanLoan?: { name: string; displayName: string; utmLink: string; logo: string };
          rupeeRaftaar?: { name: string; displayName: string; utmLink: string; logo: string };
        } = {};

        if (toofanLoanUtm) {
          loanWalleOptions.toofanLoan = {
            name: "ToofanLoan",
            displayName: DISPLAY_NAMES["ToofanLoan"] || "Toofan Loan",
            utmLink: toofanLoanUtm,
            logo: STATIC_LENDER_LOGOS["ToofanLoan"]?.src || "/toofan-loan.png",
          };
        }

        if (rupeeRaftaarUtm) {
          loanWalleOptions.rupeeRaftaar = {
            name: "RupeeRaftaar",
            displayName: DISPLAY_NAMES["RupeeRaftaar"] || "Rupee Raftaar",
            utmLink: rupeeRaftaarUtm,
            logo: STATIC_LENDER_LOGOS["RupeeRaftaar"]?.src || "/Rupee-Raftaaar.png",
          };
        }

        setLoanWalleLenders(loanWalleOptions);

        // Add LoanWalle to offers list
        mappedOffers.push({
          name: "LoanWalle",
          utmLink: undefined,
          isOffer: false,
        });
      }

      // Sort offers by dashboard priority order (with utm_medium priority lender first)
      const sortedOffers = sortOffersByPriority(mappedOffers, priorityLenderLocal);
      setOffers(sortedOffers);
    } else {
      setOffers([]);
    }
    setIsLoading(false);
  }, []);

  const handleKreditBeeApply = async (utmLink?: string) => {
    const result = await applyKreditBee(utmLink);
    if (result.status === "notEligible") {
      setShowNotEligible("KreditBee");
    } else if (result.status === "error") {
      toast.error(result.message || "Something went wrong. Please try again.", { duration: 4000 });
    }
  };

  // const handleRamFinCorpApply = async () => {
  //   const result = await applyRamFinCorp();
  //   // Show toast error for notEligible or error status
  //   if (result.status === "notEligible" || result.status === "error") {
  //     toast.error(result.message || "You are not eligible for this offer.", { duration: 4000 });
  //   }
  // };

  const handleSmartCoinApply = async (initialUtmLink?: string) => {
    const result = await applySmartCoin(initialUtmLink);
    if (result.status === "notEligible" || result.status === "error") {
      setShowNotEligible("SmartCoin");
    }
  };

  const handleMMBApply = async (initialUtmLink?: string) => {
    const result = await applyMMB(initialUtmLink);
    if (result.status === "notEligible" || result.status === "error") {
      setShowNotEligible("MMB");
    }
  };

  const handleTejasLoanApply = async (initialUtmLink?: string) => {
    await applyTejasLoan(initialUtmLink);
  };

  const handleF1SpeedLoanApply = async (initialUtmLink?: string) => {
    await applyF1SpeedLoan(initialUtmLink);
  };

  const handleLoanWalleApply = async () => {
    const hasToofan = !!loanWalleLenders.toofanLoan;
    const hasRupeeRaftaar = !!loanWalleLenders.rupeeRaftaar;

    // If both are available, show the modal
    if (hasToofan && hasRupeeRaftaar) {
      setShowLoanWalleModal(true);
      return;
    }

    // If only one is available, redirect directly
    const singleLender = loanWalleLenders.toofanLoan || loanWalleLenders.rupeeRaftaar;
    if (singleLender) {
      const phone = sessionStorage.getItem("userPhone") || "";
      await saveShortLender(phone, singleLender.name);

      // Call LoanWalle leads API for internal tracking (non-blocking)
      const partnerName = singleLender.name === "ToofanLoan" ? "Toofan" : "RupeeRaftaar";
      try {
        await applyToLoanWalle(partnerName);
      } catch (err) {
        console.error(`${singleLender.name} leads API failed:`, err);
      }

      window.open(singleLender.utmLink, "_blank");
    }
  };

  const handleLoanWalleLenderSelect = async (lenderName: string, utmLink: string) => {
    setShowLoanWalleModal(false);

    const phone = sessionStorage.getItem("userPhone") || "";
    await saveShortLender(phone, lenderName);

    // Call LoanWalle leads API for internal tracking (non-blocking)
    const partnerName = lenderName === "ToofanLoan" ? "Toofan" : "RupeeRaftaar";
    try {
      await applyToLoanWalle(partnerName);
    } catch (err) {
      console.error(`${lenderName} leads API failed:`, err);
    }

    window.open(utmLink, "_blank");
  };

  const handleApply = async (lenderName: string, utmLink?: string) => {
    const allowed = await guardActivity();
    if (!allowed) return;

    if (lenderName === "KreditBee") {
      handleKreditBeeApply(utmLink);
      return;
    }

    // if (lenderName === "RamFinCorp") {
    //   handleRamFinCorpApply();
    //   return;
    // }

    if (lenderName === "SmartCoin") {
      handleSmartCoinApply(utmLink);
      return;
    }

    if (lenderName === "MMB") {
      handleMMBApply(utmLink);
      return;
    }

    if (lenderName === "TejasLoan") {
      handleTejasLoanApply(utmLink);
      return;
    }

    if (lenderName === "F1SpeedLoan") {
      handleF1SpeedLoanApply(utmLink);
      return;
    }

    // Route LoanWalle to specific handler (opens modal)
    if (lenderName === "LoanWalle") {
      handleLoanWalleApply();
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

      {/* Session Active Notification Banner */}
      <SessionActiveBanner
        message={sessionActiveMessage}
        onClose={clearSessionActiveMessage}
      />

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
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2"
          >
            {offers.map((offer, idx) => {
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

              const isApplying = lenderName === "KreditBee" ? kbApplying : /* lenderName === "RamFinCorp" ? ramFinCorpApplying : */ lenderName === "SmartCoin" ? smartCoinApplying : lenderName === "MMB" ? mmbApplying : lenderName === "TejasLoan" ? tejasLoanApplying : lenderName === "F1SpeedLoan" ? f1SpeedLoanApplying : false;

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

       {/* Sticky QuickMoney Banner - Mobile Only */}
        {(() => {
          const quickMoneyLender = offers.find(l => l.name === "QuickMoney");
          if (!quickMoneyLender?.utmLink) return null;
          return (
            <StickyLenderBanner
              show={showQuickMoneyBanner}
              lenderName="QuickMoney"
              logo="/quickmoney.png"
              description="Get personal loan Up to ₹25,000 • Fast Approval"
              onApply={() => handleApply("QuickMoney", quickMoneyLender.utmLink)}
            />
          );
        })()}

      {/* Not Eligible Modal */}
      {showNotEligible && (
        <NotEligibleScreen
          lenderName={showNotEligible}
          onClose={() => setShowNotEligible(null)}
          onExplore={() => setShowNotEligible(null)}
        />
      )}

      {/* LoanWalle Lender Selection modal */}
      {showLoanWalleModal && (
        <LoanWalleLenderModal
          onClose={() => setShowLoanWalleModal(false)}
          hasToofan={!!loanWalleLenders.toofanLoan}
          hasRupeeRaftaar={!!loanWalleLenders.rupeeRaftaar}
          onSelectToofan={() => {
            if (loanWalleLenders.toofanLoan) {
              handleLoanWalleLenderSelect("ToofanLoan", loanWalleLenders.toofanLoan.utmLink);
            }
          }}
          onSelectRupeeRaftaar={() => {
            if (loanWalleLenders.rupeeRaftaar) {
              handleLoanWalleLenderSelect("RupeeRaftaar", loanWalleLenders.rupeeRaftaar.utmLink);
            }
          }}
        />
      )}
    </>
  );
}
