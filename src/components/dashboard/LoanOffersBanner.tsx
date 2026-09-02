"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Lock, Zap, CheckCircle, Clock, ChevronRight } from "lucide-react";
import { STATIC_LENDER_LOGOS, LENDER_FEATURE_TAGS, DEFAULT_FEATURE_TAG, DASHBOARD_PRIORITY_ORDER, LENDER_FEATURE_BADGES, DEFAULT_FEATURE_BADGES } from "@/lib/constants";
import { getStoredShortExistingUserOffers, saveShortLender, applyToShortKreditBee, applyToShortRamFinCorp, applyToShortMMB, applyToLoanWalle } from "@/lib/api";
import toast, { Toaster } from "react-hot-toast";
import NotEligibleScreen from "@/components/offers/NotEligibleScreen";
import { useOtpGuard } from "@/app/dashboard/layout";
import RingImageSection from "./RingImageSection";

// Lender UTM links — used when an offer doesn't carry its own utmLink. Same set
// the offer cards use, so the banner hero redirects to the right place.
const FALLBACK_UTM_LINKS: Record<string, string> = {
  // SmartCoin: "https://smartcoin.onelink.me/KLIY/Switchmyloanlandingpage",
  // SmartCoinHighIntent: "https://smartcoin.onelink.me/KLIY/Switchmyloanlandingpage",
  TrueBalance: "https://truebalance.io/",
  RapidMoney: "https://web.rapidmoney.in/borrower/login?utm_source=creadylandingpage&utm_extsource=abc&utm_medium=rapidmoney&utm_campaign=xyz&utm_campaignID=def",
  KreditBee: "https://www.kreditbee.in/signin",
  // SpeedoLoan: "https://loanapply.speedoloan.com?partner_id=cready",
  CashMySalary: "https://cashmysalary.com/?partner_id=cready",
  TrueFund: "https://truefund.in/short-term-loan/?utm_source=Cready&utm_medium=CRDY&utm_campaign=Cready_Referral",
  Vivifi: "https://online.flexsalary.com/CustomerLogin/Index?CampaignID=9192313#x",
  MoneyDot: "https://www.moneydot.in/",
  RupiNow: "https://www.rupinow.com/home",
  // ASAPFinance: "https://asapfinance.in/customer/login?utm_source=easyloans+Cready",
  Cash2You: "https://www.cashtoyou.in/",
  RocketCash: "https://www.rocketcash.in/",
};

// Map utm_medium values to lender names (case-insensitive matching)
const UTM_MEDIUM_TO_LENDER: Record<string, string> = {
  rapidmoney: "RapidMoney",
  kreditbee: "KreditBee",
  ramfincorp: "RamFinCorp",
  truebalance: "TrueBalance",
  // speedoloan: "SpeedoLoan",
  cashmysalary: "CashMySalary",
  tejasloan: "TejasLoan",
  truefund: "TrueFund",
  vivifi: "Vivifi",
  moneydot: "MoneyDot",
  // asapfinance: "ASAPFinance",
  apollo: "Apollo",
  f1speedloan: "F1SpeedLoan",
  rupinow: "RupiNow",
  cash2you: "Cash2You",
  rocketcash: "RocketCash",
  mmb: "MMB",
};

// ============================================================
// Types
// ============================================================
export interface PreviousLender {
  id: string;
  name: string;
  prefix: string;
}

interface ShownOffer {
  lenderName: string;
  section?: string;
  utmLink?: string | null;
}

interface SelectedLender {
  lenderName: string;
  createdAt?: string;
  status?: string | null;
  mrn?: string;
}

// Lenders that have been removed and should not be displayed
// Lenders that have been removed and should not be displayed
const REMOVED_LENDERS = ["MPokket", "Loan112", "SmartCoin", "SmartCoinHighIntent"];

// Static lenders that should always be shown
// Note: RamFinCorp is now shown based on API response (message === "Dedup Success")
// Note: TejasLoan, F1SpeedLoan are shown only when received in staticLenders from API (with utm_link)
// Note: Vivifi is now shown based on API response (message === "Application Accepted")
const ALWAYS_SHOW_STATIC_LENDERS = ["KreditBee", /* "SpeedoLoan", */ "TrueBalance"];

// ============================================================
// Utility Functions
// ============================================================
// Sort PreviousLender array by dashboard priority order
function sortLendersByPriority(lenders: PreviousLender[]): PreviousLender[] {
  return [...lenders].sort((a, b) => {
    const priorityA = DASHBOARD_PRIORITY_ORDER.indexOf(a.id);
    const priorityB = DASHBOARD_PRIORITY_ORDER.indexOf(b.id);
    const effectivePriorityA = priorityA === -1 ? DASHBOARD_PRIORITY_ORDER.length : priorityA;
    const effectivePriorityB = priorityB === -1 ? DASHBOARD_PRIORITY_ORDER.length : priorityB;
    return effectivePriorityA - effectivePriorityB;
  });
}

// Format lender name for display (add spaces before capitals)
function formatLenderName(name: string): string {
  return name.replace(/([A-Z])/g, ' $1').trim();
}

// ============================================================
// LoanOffersBanner Component
// ============================================================
export default function LoanOffersBanner() {
  const { guardActivity } = useOtpGuard();
  const [mainLender, setMainLender] = useState<PreviousLender | null>(null);
  const [otherLenders, setOtherLenders] = useState<PreviousLender[]>([]);
  const [kbApplying, setKbApplying] = useState(false);
  const [ramFinCorpApplying, setRamFinCorpApplying] = useState(false);
  const [mmbApplying, setMmbApplying] = useState(false);
  const [tejasLoanApplying, setTejasLoanApplying] = useState(false);
  const [f1SpeedLoanApplying, setF1SpeedLoanApplying] = useState(false);
  const [showNotEligible, setShowNotEligible] = useState<string | null>(null);

  useEffect(() => {
    const existingUserData = getStoredShortExistingUserOffers();
    const userExists = existingUserData?.data?.found || existingUserData?.data?.exists;

    if (userExists && existingUserData?.data) {
      const data = existingUserData.data as Record<string, unknown>;

      // Get eligibility data for each lender
      const rapidMoneyData = data.RapidMoney as { isDuplicate?: boolean; utm_link?: string } | undefined;
      const trueFundData = data.TrueFund as { message?: string; utm_link?: string; data?: { response?: { message?: string } } } | undefined;
      const moneyDotData = data.MoneyDot as { data?: { response?: { can_attribute?: boolean } }; utm_link?: string } | undefined;
      const ramFinCorpData = data.RamFinCorp as { data?: { response?: { message?: string } }; utm_link?: string } | undefined;

      const trueFundMessage = (trueFundData?.message || "").toLowerCase();
      const trueFundResponseMessage = (trueFundData?.data?.response?.message || "").toLowerCase();
      const isTrueFundEligible =
        trueFundMessage.includes("user details received sucessfully") ||
        trueFundResponseMessage.includes("user details received sucessfully");
      const isMoneyDotEligible = moneyDotData?.data?.response?.can_attribute === true;
      const isRamFinCorpEligible = ramFinCorpData?.data?.response?.message === "Dedup Success";

      const rupiNowData = data.RupiNow as { dedupeStatus?: string; utm_link?: string } | undefined;
      const isRupiNowEligible = rupiNowData?.dedupeStatus === "Passed";

      const mmbData = data.MMBDedup as { data?: { message?: string }; utm_link?: string } | undefined;
      const isMmbEligible = mmbData?.data?.message === "user_not_found";

      // Try both capitalized and lowercase keys (API returns lowercase for vivifi)
      const vivifiData = (data.Vivifi || data.vivifi) as { message?: string; utm_link?: string } | undefined;
      const vivifiMessage = vivifiData?.message || "";
      const isVivifiRejected =
        vivifiMessage === "Rejected due to Eligibility criteria." ||
        vivifiMessage === "Lead rejected.";
      const isVivifiEligible = vivifiMessage && !isVivifiRejected;

      // Get shownOffers from API response
      const shownOffers = (data.shownOffers || []) as ShownOffer[];

      // Build list of eligible lenders from shownOffers
      const eligibleLenders: PreviousLender[] = [];
      const addedLenders = new Set<string>();

      // Filter shownOffers based on eligibility
      for (const offer of shownOffers) {
        const lenderName = offer.lenderName;

        // Skip removed lenders
        if (REMOVED_LENDERS.includes(lenderName)) continue;
        // Skip duplicates
        if (addedLenders.has(lenderName)) continue;

        // Check eligibility for specific lenders
        if (lenderName === "RapidMoney" && rapidMoneyData?.isDuplicate !== false) continue;
        if (lenderName === "TrueFund" && !isTrueFundEligible) continue;
        if (lenderName === "MoneyDot" && !isMoneyDotEligible) continue;
        if (lenderName === "RupiNow" && !isRupiNowEligible) continue;
        if (lenderName === "RamFinCorp" && !isRamFinCorpEligible) continue;
        if (lenderName === "Vivifi" && !isVivifiEligible) continue;
      

        addedLenders.add(lenderName);
        eligibleLenders.push({
          id: lenderName,
          name: lenderName,
          prefix: lenderName.charAt(0).toUpperCase(),
        });
      }

      // Add static lenders that should always be shown (if not already added)
      for (const lenderName of ALWAYS_SHOW_STATIC_LENDERS) {
        if (!addedLenders.has(lenderName)) {
          addedLenders.add(lenderName);
          eligibleLenders.push({
            id: lenderName,
            name: lenderName,
            prefix: lenderName.charAt(0).toUpperCase(),
          });
        }
      }

      // Add RapidMoney if eligible and not already added
      if (rapidMoneyData?.isDuplicate === false && !addedLenders.has("RapidMoney")) {
        addedLenders.add("RapidMoney");
        eligibleLenders.push({
          id: "RapidMoney",
          name: "RapidMoney",
          prefix: "R",
        });
      }

      // Add TrueFund if it comes from API staticLenders (now a static lender —
      // backend gates it on salaried + salary >= 22k + pincode).
      const trueFundFromApi = ((data.staticLenders || []) as Array<{ name?: string; utm_link?: string }>).find(
        (l) => l.name?.toLowerCase() === "truefund"
      );
      if (trueFundFromApi?.utm_link && !addedLenders.has("TrueFund")) {
        addedLenders.add("TrueFund");
        eligibleLenders.push({
          id: "TrueFund",
          name: "TrueFund",
          prefix: "T",
        });
      }

      // Add MoneyDot if eligible and not already added
      if (isMoneyDotEligible && !addedLenders.has("MoneyDot")) {
        addedLenders.add("MoneyDot");
        eligibleLenders.push({
          id: "MoneyDot",
          name: "MoneyDot",
          prefix: "M",
        });
      }

      // Add RupiNow if eligible and not already added
      if (isRupiNowEligible && !addedLenders.has("RupiNow")) {
        addedLenders.add("RupiNow");
        eligibleLenders.push({
          id: "RupiNow",
          name: "RupiNow",
          prefix: "R",
        });
      }

      // Add Vivifi if API response message is "Application Accepted" and not already added
      if (isVivifiEligible && vivifiData?.utm_link && !addedLenders.has("Vivifi")) {
        addedLenders.add("Vivifi");
        eligibleLenders.push({
          id: "Vivifi",
          name: "Vivifi",
          prefix: "V",
        });
      }

      // // Add LoanWalle only if it comes from API staticLenders (with utm_link)
      const staticLendersArray = (data.staticLenders || []) as Array<{ name?: string; utm_link?: string }>;
      // const loanWalleFromApi = staticLendersArray.find(
      //   (l) => l.name?.toLowerCase() === "loanwalle"
      // );
      // if (loanWalleFromApi?.utm_link && !addedLenders.has("LoanWalle")) {
      //   addedLenders.add("LoanWalle");
      //   eligibleLenders.push({
      //     id: "LoanWalle",
      //     name: "LoanWalle",
      //     prefix: "L",
      //   });
      // }

      // Check loanWalleUserFound - if true, hide TejasLoan and F1SpeedLoan
      const loanWalleUserFound = (data as { loanWalleUserFound?: boolean })?.loanWalleUserFound;

      // Add TejasLoan only if loanWalleUserFound is NOT true AND it exists in staticLenders
      const tejasLoanFromApi = staticLendersArray.find(
        (l) => l.name?.toLowerCase() === "tejas" || l.name?.toLowerCase() === "tejasloan"
      );
      if (loanWalleUserFound !== true && tejasLoanFromApi?.utm_link && !addedLenders.has("TejasLoan")) {
        addedLenders.add("TejasLoan");
        eligibleLenders.push({
          id: "TejasLoan",
          name: "TejasLoan",
          prefix: "T",
        });
      }

      // Add F1SpeedLoan only if loanWalleUserFound is NOT true AND it exists in staticLenders
      const f1SpeedLoanFromApi = staticLendersArray.find(
        (l) => l.name?.toLowerCase() === "f1speedloan"
      );
      if (loanWalleUserFound !== true && f1SpeedLoanFromApi?.utm_link && !addedLenders.has("F1SpeedLoan")) {
        addedLenders.add("F1SpeedLoan");
        eligibleLenders.push({
          id: "F1SpeedLoan",
          name: "F1SpeedLoan",
          prefix: "F",
        });
      }


      

      // Add RamFinCorp if eligible (data.response.message === "Dedup Success")
      if (isRamFinCorpEligible && !addedLenders.has("RamFinCorp")) {
        addedLenders.add("RamFinCorp");
        eligibleLenders.push({
          id: "RamFinCorp",
          name: "RamFinCorp",
          prefix: "R",
        });
      }

      // Add MMB if eligible (message === "user_not_found")
      if (isMmbEligible && !addedLenders.has("MMB")) {
        addedLenders.add("MMB");
        eligibleLenders.push({
          id: "MMB",
          name: "MMB",
          prefix: "M",
        });
      }

      // Add Apollo only if it comes from API staticLenders
      const apolloFromApi = staticLendersArray.find(
        (l) => l.name?.toLowerCase() === "apollo"
      );
      if (apolloFromApi?.utm_link && !addedLenders.has("Apollo")) {
        addedLenders.add("Apollo");
        eligibleLenders.push({
          id: "Apollo",
          name: "Apollo",
          prefix: "A",
        });
      }

      // Add Cash2You only if it comes from API staticLenders
      const cash2YouFromApi = staticLendersArray.find(
        (l) => l.name?.toLowerCase() === "cash2you"
      );
      if (cash2YouFromApi?.utm_link && !addedLenders.has("Cash2You")) {
        addedLenders.add("Cash2You");
        eligibleLenders.push({
          id: "Cash2You",
          name: "Cash2You",
          prefix: "C",
        });
      }

      // Add RocketCash only if it comes from API staticLenders
      const rocketCashFromApi = staticLendersArray.find(
        (l) => l.name?.toLowerCase() === "rocketcash"
      );
      if (rocketCashFromApi?.utm_link && !addedLenders.has("RocketCash")) {
        addedLenders.add("RocketCash");
        eligibleLenders.push({
          id: "RocketCash",
          name: "RocketCash",
          prefix: "R",
        });
      }

    

      // Check if user came via UTM medium link - prioritize that lender
      const utmMedium = (sessionStorage.getItem("utm_medium") || "").toLowerCase();
      const utmLenderName = UTM_MEDIUM_TO_LENDER[utmMedium];

      // // If UTM is loanwalle and LoanWalle exists in staticLenders but wasn't added yet, add it now
      // if (utmLenderName === "LoanWalle" && loanWalleFromApi?.utm_link && !addedLenders.has("LoanWalle")) {
      //   addedLenders.add("LoanWalle");
      //   eligibleLenders.push({
      //     id: "LoanWalle",
      //     name: "LoanWalle",
      //     prefix: "L",
      //   });
      // }

      // If UTM is tejasloan and TejasLoan exists in staticLenders but wasn't added yet, add it now
      // Only if loanWalleUserFound is NOT true
      if (utmLenderName === "TejasLoan" && loanWalleUserFound !== true && tejasLoanFromApi?.utm_link && !addedLenders.has("TejasLoan")) {
        addedLenders.add("TejasLoan");
        eligibleLenders.push({
          id: "TejasLoan",
          name: "TejasLoan",
          prefix: "T",
        });
      }

      // If UTM is f1speedloan and F1SpeedLoan exists in staticLenders but wasn't added yet, add it now
      // Only if loanWalleUserFound is NOT true
      if (utmLenderName === "F1SpeedLoan" && loanWalleUserFound !== true && f1SpeedLoanFromApi?.utm_link && !addedLenders.has("F1SpeedLoan")) {
        addedLenders.add("F1SpeedLoan");
        eligibleLenders.push({
          id: "F1SpeedLoan",
          name: "F1SpeedLoan",
          prefix: "F",
        });
      }

      // If UTM is apollo and Apollo exists in staticLenders but wasn't added yet, add it now
      if (utmLenderName === "Apollo" && apolloFromApi?.utm_link && !addedLenders.has("Apollo")) {
        addedLenders.add("Apollo");
        eligibleLenders.push({
          id: "Apollo",
          name: "Apollo",
          prefix: "A",
        });
      }

      // If UTM is cash2you and Cash2You exists in staticLenders but wasn't added yet, add it now
      if (utmLenderName === "Cash2You" && cash2YouFromApi?.utm_link && !addedLenders.has("Cash2You")) {
        addedLenders.add("Cash2You");
        eligibleLenders.push({
          id: "Cash2You",
          name: "Cash2You",
          prefix: "C",
        });
      }

      // If UTM is rocketcash and RocketCash exists in staticLenders but wasn't added yet, add it now
      if (utmLenderName === "RocketCash" && rocketCashFromApi?.utm_link && !addedLenders.has("RocketCash")) {
        addedLenders.add("RocketCash");
        eligibleLenders.push({
          id: "RocketCash",
          name: "RocketCash",
          prefix: "R",
        });
      }

     

      // If UTM is rupinow and RupiNow is eligible but wasn't added yet, add it now
      if (utmLenderName === "RupiNow" && isRupiNowEligible && !addedLenders.has("RupiNow")) {
        addedLenders.add("RupiNow");
        eligibleLenders.push({
          id: "RupiNow",
          name: "RupiNow",
          prefix: "R",
        });
      }

      // If UTM is vivifi and Vivifi is eligible but wasn't added yet, add it now
      if (utmLenderName === "Vivifi" && isVivifiEligible && vivifiData?.utm_link && !addedLenders.has("Vivifi")) {
        addedLenders.add("Vivifi");
        eligibleLenders.push({
          id: "Vivifi",
          name: "Vivifi",
          prefix: "V",
        });
      }

    

      // // If UTM is asapfinance, add ASAPFinance if not already added
      // if (utmLenderName === "ASAPFinance" && !addedLenders.has("ASAPFinance")) {
      //   addedLenders.add("ASAPFinance");
      //   eligibleLenders.push({
      //     id: "ASAPFinance",
      //     name: "ASAPFinance",
      //     prefix: "A",
      //   });
      // }

      // Sort all eligible lenders by dashboard priority order
      const prioritySorted = sortLendersByPriority(eligibleLenders);

      if (utmLenderName && addedLenders.has(utmLenderName)) {
        // User came via UTM medium link - show that lender as main
        const utmLender: PreviousLender = {
          id: utmLenderName,
          name: utmLenderName,
          prefix: utmLenderName.charAt(0).toUpperCase(),
        };
        setMainLender(utmLender);
        // Set other lenders (excluding UTM lender) sorted by priority
        const othersSorted = prioritySorted.filter(l => l.id !== utmLenderName);
        setOtherLenders(othersSorted.slice(0, 3));
      } else {
        // No UTM medium - check selectedLenders for most recently clicked lender
        // that is in the dashboard priority order
        const selectedLenders = (data.selectedLenders || []) as SelectedLender[];

        // Sort by createdAt (most recent first)
        const sortedByRecent = [...selectedLenders].sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });

        // Find the most recently clicked lender that is in DASHBOARD_PRIORITY_ORDER and is eligible
        let mainLenderFromSelected: PreviousLender | null = null;
        for (const selected of sortedByRecent) {
          const lenderName = selected.lenderName;

          // Skip if not in dashboard priority order
          if (!DASHBOARD_PRIORITY_ORDER.includes(lenderName)) continue;
          // Skip removed lenders
          if (REMOVED_LENDERS.includes(lenderName)) continue;
          // Check eligibility for specific lenders
          if (lenderName === "RapidMoney" && rapidMoneyData?.isDuplicate !== false) continue;
          if (lenderName === "TrueFund" && !isTrueFundEligible) continue;
          if (lenderName === "MoneyDot" && !isMoneyDotEligible) continue;
          if (lenderName === "RamFinCorp" && !isRamFinCorpEligible) continue;
          if (lenderName === "Vivifi" && !isVivifiEligible) continue;
     

          // Found an eligible lender in priority order
          mainLenderFromSelected = {
            id: lenderName,
            name: lenderName,
            prefix: lenderName.charAt(0).toUpperCase(),
          };
          break;
        }

        if (mainLenderFromSelected) {
          // Use the recently clicked lender as main
          setMainLender(mainLenderFromSelected);
          // Set other lenders (excluding main) sorted by priority
          const othersSorted = prioritySorted.filter(l => l.id !== mainLenderFromSelected!.id);
          setOtherLenders(othersSorted.slice(0, 3));
        } else if (prioritySorted.length > 0) {
          // No valid recently clicked lender found - fall back to priority sorted list
          setMainLender(prioritySorted[0] || null);
          setOtherLenders(prioritySorted.slice(1, 4));
        }
      }
    }
  }, []);

  const displayLender = mainLender;

  // Get lender logo
  const lenderLogo = displayLender
    ? STATIC_LENDER_LOGOS[displayLender.id] || STATIC_LENDER_LOGOS[displayLender.name]
    : null;

  // Get up to 3 other lenders for "More offers" section
  const moreOffers = otherLenders.slice(0, 3);

  // KreditBee special apply handler - calls the API first
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

  // RamFinCorp special apply handler - calls the new API endpoint
  const handleRamFinCorpApply = async (initialUtmLink?: string) => {
    if (ramFinCorpApplying) return;
    setRamFinCorpApplying(true);
    try {
      const phone = sessionStorage.getItem("userPhone") || "";
      await saveShortLender(phone, "RamFinCorp");
      const res = await applyToShortRamFinCorp();

      const outcome = res.data?.outcome;
      const redirectUrl = res.data?.redirectUrl || res.data?.utm_link || initialUtmLink || FALLBACK_UTM_LINKS.RamFinCorp || "https://ramfincorp.com/";

      // Redirect only if outcome is BRE_APPROVED or PROCEED_TO_BANK and redirectUrl exists
      if ((outcome === "BRE_APPROVED" || outcome === "PROCEED_TO_BANK") && redirectUrl) {
        window.open(redirectUrl, "_blank");
      } else {
        // Show Not Eligible modal for any other outcome
        setShowNotEligible("RamFinCorp");
      }
    } catch (err) {
      console.error("RamFinCorp apply failed:", err);
      setShowNotEligible("RamFinCorp");
    } finally {
      setRamFinCorpApplying(false);
    }
  };

  // MMB special apply handler - calls the API first
  const handleMMBApply = async (initialUtmLink?: string) => {
    if (mmbApplying) return;
    setMmbApplying(true);
    try {
      const phone = sessionStorage.getItem("userPhone") || "";
      await saveShortLender(phone, "MMB");
      const res = await applyToShortMMB();

      const mmbData = res.data?.MMBCreateLead;
      // Check if message is "Signed-in Successfully" AND redirectLink is available
      const isSignedIn = mmbData?.message === "Signed-in Successfully";
      const hasRedirectLink = mmbData?.redirectLink && mmbData.redirectLink.trim() !== "";

      if (isSignedIn && hasRedirectLink) {
        // Redirect to utm_link from MMBDedup (passed as initialUtmLink)
        if (initialUtmLink) {
          window.open(initialUtmLink, "_blank");
        } else {
          // No utm_link available from MMBDedup
          setShowNotEligible("MMB");
        }
      } else {
        // Show not eligible modal when apply fails
        setShowNotEligible("MMB");
      }
    } catch (err) {
      console.error("MMB apply failed:", err);
      setShowNotEligible("MMB");
    } finally {
      setMmbApplying(false);
    }
  };

  // TejasLoan special apply handler - calls the LoanWalle API first
  const handleTejasLoanApply = async (initialUtmLink?: string) => {
    if (tejasLoanApplying) return;
    setTejasLoanApplying(true);
    try {
      const phone = sessionStorage.getItem("userPhone") || "";
      await saveShortLender(phone, "TejasLoan");
      await applyToLoanWalle("Tejas");

      // Redirect to UTM link after API call
      if (initialUtmLink) {
        window.open(initialUtmLink, "_blank");
      }
    } catch (err) {
      console.error("TejasLoan apply failed:", err);
      // Still redirect on error - the UTM link flow should continue
      if (initialUtmLink) {
        window.open(initialUtmLink, "_blank");
      }
    } finally {
      setTejasLoanApplying(false);
    }
  };

  // F1SpeedLoan special apply handler - calls the LoanWalle API first
  const handleF1SpeedLoanApply = async (initialUtmLink?: string) => {
    if (f1SpeedLoanApplying) return;
    setF1SpeedLoanApplying(true);
    try {
      const phone = sessionStorage.getItem("userPhone") || "";
      await saveShortLender(phone, "F1SpeedLoan");
      await applyToLoanWalle("F1");

      // Redirect to UTM link after API call
      if (initialUtmLink) {
        window.open(initialUtmLink, "_blank");
      }
    } catch (err) {
      console.error("F1SpeedLoan apply failed:", err);
      // Still redirect on error - the UTM link flow should continue
      if (initialUtmLink) {
        window.open(initialUtmLink, "_blank");
      }
    } finally {
      setF1SpeedLoanApplying(false);
    }
  };

  // Apply to the hero lender — redirect to its UTM link
  // KreditBee and RamFinCorp have special handling with API call
  const handleHeroApply = async () => {
    if (!displayLender) return;
    const allowed = await guardActivity();
    if (!allowed) return;

    // Special handling for KreditBee
    if (displayLender.id === "KreditBee") {
      handleKreditBeeApply();
      return;
    }

    // Special handling for RamFinCorp
    if (displayLender.id === "RamFinCorp") {
      // Get utm_link from stored data for fallback
      const data = getStoredShortExistingUserOffers()?.data as Record<string, unknown> | undefined;
      const ramFinCorpData = data?.RamFinCorp as { utm_link?: string } | undefined;
      handleRamFinCorpApply(ramFinCorpData?.utm_link);
      return;
    }

    // Special handling for MMB
    if (displayLender.id === "MMB") {
      // Get utm_link from stored data for fallback
      const data = getStoredShortExistingUserOffers()?.data as Record<string, unknown> | undefined;
      const mmbData = data?.MMBDedup as { utm_link?: string } | undefined;
      handleMMBApply(mmbData?.utm_link);
      return;
    }

    // Special handling for TejasLoan
    if (displayLender.id === "TejasLoan") {
      const data = getStoredShortExistingUserOffers()?.data as Record<string, unknown> | undefined;
      const staticLendersArray = (data?.staticLenders || []) as Array<{ name?: string; utm_link?: string }>;
      const tejasLender = staticLendersArray.find(
        (l) => l.name?.toLowerCase() === "tejas" || l.name?.toLowerCase() === "tejasloan"
      );
      handleTejasLoanApply(tejasLender?.utm_link);
      return;
    }

    // Special handling for F1SpeedLoan
    if (displayLender.id === "F1SpeedLoan") {
      const data = getStoredShortExistingUserOffers()?.data as Record<string, unknown> | undefined;
      const staticLendersArray = (data?.staticLenders || []) as Array<{ name?: string; utm_link?: string }>;
      const f1Lender = staticLendersArray.find(
        (l) => l.name?.toLowerCase() === "f1speedloan"
      );
      handleF1SpeedLoanApply(f1Lender?.utm_link);
      return;
    }

    const phone = sessionStorage.getItem("userPhone") || "";
    await saveShortLender(phone, displayLender.id);

    const data = getStoredShortExistingUserOffers()?.data as Record<string, unknown> | undefined;

    // First check top-level lender data for utm_link
    const lenderData = data?.[displayLender.id] as { utm_link?: string } | undefined;
    let url = lenderData?.utm_link;

    // If not found, check staticLenders array (API returns some lenders like Vivifi here)
    if (!url && data?.staticLenders) {
      const staticLendersArray = data.staticLenders as Array<{ name?: string; utm_link?: string }>;
      const lenderIdLower = displayLender.id.toLowerCase();
      const matchingLender = staticLendersArray.find((l) => {
        const nameLower = l.name?.toLowerCase();
        // Handle TejasLoan which might come as "Tejas" or "TejasLoan"
        if (lenderIdLower === "tejasloan") {
          return nameLower === "tejas" || nameLower === "tejasloan";
        }
        return nameLower === lenderIdLower;
      });
      url = matchingLender?.utm_link;
    }

    // Fall back to hardcoded URL if still not found
    url = url || FALLBACK_UTM_LINKS[displayLender.id];
    if (url) window.open(url, "_blank");
  };

  // If no lender data, don't render
  if (!displayLender) {
    return null;
  }

  return (
    <>
    <Toaster position="top-center" />
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="relative overflow-hidden rounded-2xl mb-6 border border-violet-200/60 shadow-lg shadow-violet-100/50"
      style={{
        background: "linear-gradient(135deg, #F8F5FF 0%, #F0E8FF 50%, #E8DEFF 100%)",
      }}
    >
      {/* Top Tag */}
    <div className="absolute top-0 left-0 z-10">
        <span className="inline-flex items-center gap-1 bg-gradient-to-r from-violet-600 to-[#C894FF] text-white shadow-lg shadow-violet-500/20 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-br-xl rounded-tl-[18px]">
          <svg className="w-2.5 h-2.5 text-amber-300" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l2.39 7.36H22l-6.18 4.49L18.21 22 12 17.27 5.79 22l2.39-8.15L2 9.36h7.61z" />
          </svg>
          Personalized just for you
        </span>
      </div> 

      {/* Background decorative dots */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-1/4 w-1 h-1 bg-violet-300 rounded-full opacity-50" />
        <div className="absolute top-20 left-1/3 w-1.5 h-1.5 bg-violet-200 rounded-full opacity-40" />
        <div className="absolute bottom-20 left-1/5 w-1 h-1 bg-violet-300 rounded-full opacity-50" />
        <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-violet-200 rounded-full opacity-40" />
      </div>

      <div className="flex flex-col lg:flex-row ">
        {/* Left Section - Main Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 pt-9 sm:pt-12">
          {/* Interest Text */}
          <p className="text-black font-bold text-[11px] sm:text-sm mb-1 mt-1">
            You&apos;ve shown interest in
          </p>

          {/* Lender Logo */}
          {lenderLogo && (
            <div className={`mb-2 ${lenderLogo.darkBg ? "bg-gray-800 rounded-lg px-3 py-2 w-fit" : ""}`}>
              <Image
                src={lenderLogo.src}
                alt={displayLender.name}
                width={120}
                height={40}
                className="object-contain h-10 sm:h-12 w-auto"
              />
            </div>
          )}

          {/* Feature Tag */}
          {LENDER_FEATURE_TAGS[displayLender.id] && (
            <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-[10px] sm:text-[11px] font-semibold text-amber-700 mb-2">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {LENDER_FEATURE_TAGS[displayLender.id]}
            </span>
          )}

          {/* Subtitle */}
          <p className="text-gray-600 text-[10px] sm:text-sm">
            Continue now and get your loan
          </p>

          {/* Instantly in Minutes */}
          <div className="flex items-center gap-1 text-violet-600 font-semibold text-sm sm:text-[24px] mb-3 sm:mb-5">
            <span>Instantly</span>
            <span className="text-violet-800 font-bold">in Minutes!</span>
            <Zap className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-yellow-500 fill-yellow-500" />
          </div>

          {/* Feature Badges - Scrollable on mobile */}
          <div className="flex items-center gap-1 sm:gap-3 mb-2 sm:mb-1 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
            {(LENDER_FEATURE_BADGES[displayLender?.id] || DEFAULT_FEATURE_BADGES).map((badge, index) => {
              const icons = [Zap, CheckCircle, Clock];
              const IconComponent = icons[index];
              return (
                <div key={badge} className="flex items-center gap-1 sm:gap-1.5 bg-white rounded-md px-2 py-1 sm:px-2 sm:py-1.5 shrink-0">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-violet-50 flex items-center justify-center">
                    <IconComponent className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-violet-600" />
                  </div>
                  <span className="text-[8px] sm:text-[10px] text-gray-700 font-medium whitespace-nowrap">{badge}</span>
                </div>
              );
            })}
          </div>

          {/* CTA Button — redirects to the hero lender's UTM link */}
          <button
            type="button"
            onClick={handleHeroApply}
            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-5 sm:px-8 py-2.5 rounded-md text-white font-semibold text-xs sm:text-sm shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] group bg-gradient-to-r from-[#dfff45] via-[#9b6bff] to-[#7c3aed] mt-2 cursor-pointer"
          >
            Apply Now
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>

          {/* Trust Badge */}
          <div className="flex items-center justify-center sm:justify-start gap-1.5 mt-2 text-[10px] sm:text-xs text-gray-600">
            <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-500" />
            <span>100% Secure & Trusted</span>
          </div>
        </div>

        {/* Center Section - R Ring Image with floating bubbles (hidden on mobile) */}
        <div className="hidden lg:block mt-10">
          <RingImageSection lenderName={displayLender?.name} />
        </div>

        {/* Vertical Divider Line */}
        {moreOffers.length > 0 && (
          <div className="hidden xl:flex items-center py-8">
            <div className="w-px h-68 bg-gradient-to-b from-transparent via-violet-300 to-transparent" />
          </div>
        )}

        {/* Right Section - More Offers */}
        {moreOffers.length > 0 && (
          <div className="hidden xl:block w-64 p-5">
            <h3 className="text-xs font-semibold text-gray-800 mb-4">More offers you may like</h3>

            <div className="space-y-3">
              {moreOffers.map((lender) => {
                const logo = STATIC_LENDER_LOGOS[lender.id] || STATIC_LENDER_LOGOS[lender.name];
                return (
                  <Link
                    key={lender.id}
                    href="/dashboard/offers"
                    className="flex items-center justify-between p-2 bg-white rounded-xl hover:shadow-md transition-all group border border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10  flex items-center justify-center ">
                        {logo ? (
                          <Image
                            src={logo.src}
                            alt={lender.name}
                            width={42}
                            height={42}
                            className="object-contain"
                          />
                        ) : (
                          <span className="text-sm font-bold text-violet-600">{lender.prefix}</span>
                        )}
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-gray-800">{formatLenderName(lender.name)}</p>
                        <p className="text-[10px] font-semibold text-gray-500">{LENDER_FEATURE_TAGS[lender.id] || DEFAULT_FEATURE_TAG}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-violet-600 transition-colors" />
                  </Link>
                );
              })}
            </div>

            <Link
              href="/dashboard/offers"
              className="inline-flex items-center gap-1 text-violet-600 text-xs font-medium mt-4 hover:text-violet-700"
            >
              View all offers
              <span>→</span>
            </Link>
          </div>
        )}
      </div>



      {/* Mobile More Offers Section */}
      {moreOffers.length > 0 && (
        <div className="xl:hidden border-t border-violet-100 bg-white/40 backdrop-blur-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-800">More offers you may like</h3>
            <Link href="/dashboard/offers" className="text-violet-600 text-xs font-medium">
              View all →
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
            {moreOffers.map((lender) => {
              const logo = STATIC_LENDER_LOGOS[lender.id] || STATIC_LENDER_LOGOS[lender.name];
              return (
                <Link
                  key={lender.id}
                  href="/dashboard/offers"
                  className="shrink-0 flex items-center gap-2 p-3 bg-white rounded-xl shadow-sm min-w-[160px]"
                >
                  <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center p-1">
                    {logo ? (
                      <Image
                        src={logo.src}
                        alt={lender.name}
                        width={24}
                        height={24}
                        className="object-contain"
                      />
                    ) : (
                      <span className="text-xs font-bold text-violet-600">{lender.prefix}</span>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-800">{formatLenderName(lender.name)}</p>
                    <p className="text-[10px] text-gray-500">{LENDER_FEATURE_TAGS[lender.id] || DEFAULT_FEATURE_TAG}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
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
