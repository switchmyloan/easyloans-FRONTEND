"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getStaticLenderDetail, STATIC_LENDER_LOGOS, getEligibleCoupon, type KBCoupon, LENDER_FEATURE_TAGS, getLenderFeatures } from "@/lib/constants";
import {
  getStoredShortTicketOffers,
  saveShortLender,
  applyToShortKreditBee,
  trackShortShownOffers,
  type ShortTicketLender,
  type ShownOfferEntry,
} from "@/lib/api";
import NotEligibleScreen from "@/components/offers/NotEligibleScreen";
import ScratchCoupon from "@/components/offers/ScratchCoupon";
import OfferCard from "@/components/offers/OfferCard";
import TrustBadges from "@/components/ui/TrustBadges";
import GradientBanner from "@/components/ui/GradientBanner";
// CLEVERTAP DISABLED
// import { cleverTapTrackEvent, CLEVERTAP_EVENTS } from "@/lib/clevertap";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Clock, Contact, Lock } from "lucide-react";

const DISPLAY_NAMES: Record<string, string> = {
  RapidMoney: "RapidMoney",
  RamFinCorp: "RamFinCorp",
  Vivifi: "Vivifi",
  KreditBee: "Kreditbee",
  TrueBalance: "TrueBalance",
  SpeedoLoan: "SpeedoLoan",
  LoanWalle: "LoanWalle",
  Cashvia: "Cashvia",
  TrueFund: "TrueFund",
  MoneyDot: "MoneyDot",
  RupiNow: "RupiNow",
  ASAPFinance: "ASAPFinance",
  Nira: "Nira",
  Apollo: "Apollo",
};

// Default render order
const LENDER_ORDER = [
  "RapidMoney",
  "RamFinCorp",
  "LoanWalle",
  "KreditBee",
  "TrueBalance",
  "Vivifi",
  "SpeedoLoan",
  "Cashvia",
  "TrueFund",
  "MoneyDot",
  "RupiNow",
  "ASAPFinance",
  "Nira",
  "Apollo",
];

// When utm_medium=kreditbee: KreditBee first
const KB_PRIORITY_ORDER = [
  "KreditBee",
  "RapidMoney",
  "RamFinCorp",
  "LoanWalle",
  "TrueBalance",
  "Vivifi",
  "SpeedoLoan",
  "Cashvia",
  "TrueFund",
  "MoneyDot",
  "RupiNow",
  "ASAPFinance",
  "Nira",
  "Apollo",
];

// When utm_medium=rapidmoney: RapidMoney first
const RAPIDMONEY_PRIORITY_ORDER = [
  "RapidMoney",
    "RamFinCorp",
      "LoanWalle",
  "KreditBee",
    "TrueBalance",
  "Vivifi",
   "SpeedoLoan",
  "Cashvia",
  "TrueFund",
  "MoneyDot",
  "RupiNow",
  "ASAPFinance",
  "Nira",
  "Apollo",
];

const RamFinCorp_PRIORITY_ORDER = [
  "RamFinCorp",
  "RapidMoney",
  "LoanWalle",
  "KreditBee",
  "TrueBalance",
  "Vivifi",
  "SpeedoLoan",
  "Cashvia",
  "TrueFund",
  "MoneyDot",
  "RupiNow",
  "ASAPFinance",
  "Nira",
  "Apollo",
];

// When utm_medium=loanwalle: LoanWalle first
const LOANWALLE_PRIORITY_ORDER = [
  "LoanWalle",
  "RapidMoney",
  "RamFinCorp",
  "KreditBee",
  "TrueBalance",
  "Vivifi",
  "SpeedoLoan",
  "Cashvia",
  "TrueFund",
  "MoneyDot",
  "RupiNow",
  "ASAPFinance",
  "Nira",
  "Apollo",
];

// When utm_medium=moneydot: MoneyDot first
const MONEYDOT_PRIORITY_ORDER = [
  "MoneyDot",
  "RapidMoney",
  "RamFinCorp",
  "LoanWalle",
  "KreditBee",
  "TrueBalance",
  "Vivifi",
  "SpeedoLoan",
  "Cashvia",
  "TrueFund",
  "RupiNow",
  "ASAPFinance",
  "Nira",
  "Apollo",
];

const TRUEFUND_PRIORITY_ORDER = [
  "TrueFund",
  "RapidMoney",
  "RamFinCorp",
  "LoanWalle",
  "KreditBee",
  "TrueBalance",
  "Vivifi",
  "SpeedoLoan",
  "Cashvia",
  "MoneyDot",
  "RupiNow",
  "ASAPFinance",
  "Nira",
  "Apollo",
];

const ASAPFINANCE_PRIORITY_ORDER = [
  "ASAPFinance",
  "RapidMoney",
  "RamFinCorp",
  "LoanWalle",
  "KreditBee",
  "TrueBalance",
  "Vivifi",
  "SpeedoLoan",
  "Cashvia",
  "TrueFund",
  "MoneyDot",
  "RupiNow",
  "Nira",
  "Apollo",
];

const FALLBACK_UTM: Record<string, string> = {
  KreditBee: "https://kredt.be/3ZFfVbz",
  RamFinCorp: "https://ramfincorp.com/",
  Vivifi: "https://online.flexsalary.com/CustomerLogin/Index?CampaignID=9192313#x",
  TrueBalance: "https://truebalance.io/",
  // MPokket: "https://mpokket.com/",
  RapidMoney: "https://web.rapidmoney.in/",
  SpeedoLoan: "https://loanapply.speedoloan.com?partner_id=cready",
  Cashvia: "https://cashvia.in/?utm_source=switchmyloan&utm_medium=switchmyloan&utm_campaign=switchmyloan_",
  TrueFund: "https://truefund.in/short-term-loan/?utm_source=Cready&utm_medium=CRDY&utm_campaign=Cready_Referral",
  MoneyDot: "https://www.moneydot.in/",
  RupiNow: "https://www.rupinow.com/home",
  ASAPFinance: "https://asapfinance.in/customer/login?utm_source=easyloans+Cready",
  Nira: "https://play.google.com/store/apps/details?id=com.nirafinance.customer&referrer=pid%3DCready%26c%3DPartnerships_Cready_CPA%26af_adset%3D%7B%7D%26af_tranid%3DMTgzMjkwOTA0MzAyMDE3NjUyOTE%3D",
};

// Map API names to internal lender names
const STATIC_LENDER_NAME_MAP: Record<string, string> = {
  "RamFinCorp": "RamFinCorp",
  "Speedoloan": "SpeedoLoan",
  "speedoloan": "SpeedoLoan",
  "SpeedoLoan": "SpeedoLoan",
  "LoanWalle": "LoanWalle",
  "Loanwalle": "LoanWalle",
  "Cashvia": "Cashvia",
  "RapidMoney": "RapidMoney",
  "TrueBalance": "TrueBalance",
  "trueBalance": "TrueBalance",
  "truebalance": "TrueBalance",
  "Truebalance": "TrueBalance",
  "Vivifi": "Vivifi",
  "vivifi": "Vivifi",
  "MoneyDot": "MoneyDot",
  "RupiNow": "RupiNow",
  "ASAPFinance": "ASAPFinance",
  "asapfinance": "ASAPFinance",
  "Nira": "Nira",
  "nira": "Nira",
  "Apollo": "Apollo",
  "apollo": "Apollo",
};

function getUtmLink(
  name: string,
  lender: ShortTicketLender | undefined
): string | null {
  if (!lender) return FALLBACK_UTM[name] || null;
  const directLink =
    typeof lender.utm_link === "string" ? lender.utm_link : null;

  switch (name) {
    case "RapidMoney": {
      // RapidMoney is shown based on API response (isDuplicate === false)
      const isDuplicate = (lender as { isDuplicate?: boolean })?.isDuplicate;
      if (isDuplicate !== false) return null;
      return directLink || FALLBACK_UTM.RapidMoney;
    }

    case "KreditBee": {
      if (lender.is_offer !== true) return null;
      return directLink || FALLBACK_UTM.KreditBee;
    }

    case "TrueBalance":
      // TrueBalance only shows if it comes from API staticLenders (no fallback)
      return directLink || null;

    case "SpeedoLoan":
      // SpeedoLoan only shows if it comes from API staticLenders (no fallback)
      return directLink || null;

    case "Vivifi":
      // Vivifi only shows if it comes from API staticLenders (no fallback)
      return directLink || null;

    case "ASAPFinance":
      // ASAPFinance only shows if it comes from API staticLenders (no fallback)
      return directLink || null;

    case "Nira":
      // Nira only shows if it comes from API staticLenders (no fallback)
      return directLink || null;

    case "Apollo":
      return directLink || null;  

    case "RamFinCorp": {
      // RamFinCorp is shown only if message is "Dedup Success"
      const ramFinCorpMessage = (lender.message || "").toLowerCase();
      if (ramFinCorpMessage !== "dedup success") return null;
      return directLink || FALLBACK_UTM.RamFinCorp;
    }

    case "TrueFund": {
      // TrueFund is shown only if API response message contains "user details received sucessfully"
      const trueFundMessage = (lender.message || "").toLowerCase();
      const trueFundResponseMessage = (
        (lender.data as { response?: { message?: string } })?.response?.message || ""
      ).toLowerCase();
      const isTrueFundEligible =
        trueFundMessage.includes("user details received sucessfully") ||
        trueFundResponseMessage.includes("user details received sucessfully");
      if (!isTrueFundEligible) return null;
      return directLink || FALLBACK_UTM.TrueFund;
    }

    case "MoneyDot": {
  const canAttribute = (
    lender?.data as {
      response?: {
        can_attribute?: boolean;
      };
    }
  )?.response?.can_attribute;

  if (canAttribute !== true) return null;

  return directLink || FALLBACK_UTM.MoneyDot;
}

    case "RupiNow": {
      // RupiNow is shown only if dedupeStatus === "Passed"
      const rupiNowDedupeStatus = (lender as { dedupeStatus?: string })?.dedupeStatus;
      if (rupiNowDedupeStatus !== "Passed") return null;
      return directLink || FALLBACK_UTM.RupiNow;
    }

    case "Cashvia": {
      // Cashvia is shown only if dedupeStatus === "Passed"
      const cashviaDedupeStatus = (lender as { dedupeStatus?: string })?.dedupeStatus;
      if (cashviaDedupeStatus !== "Passed") return null;
      return directLink || FALLBACK_UTM.Cashvia;
    }

    default:
      return directLink || FALLBACK_UTM[name] || null;
  }
}

interface OrderedLender {
  name: string;
  utm_link?: string;
  wasApproved?: boolean;
}

export default function ShortTicketOffersPage() {
  const router = useRouter();
  const [orderedLenders, setOrderedLenders] = useState<OrderedLender[]>([]);
  const [isSalaried, setIsSalaried] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [kbApplying, setKbApplying] = useState(false);
  const [kbApplied, setKbApplied] = useState(false);
  const [firstName, setFirstName] = useState<string>("");
  const [isKbMedium, setIsKbMedium] = useState(false);
  const [isRapidMoneyMedium, setIsRapidMoneyMedium] = useState(false);
  const [isRamFinCorpMedium, setIsRamFinCorpMedium] = useState(false);
  const [isLoanWalleMedium, setIsLoanWalleMedium] = useState(false);
  const [isMoneyDotMedium, setIsMoneyDotMedium] = useState(false);
  const [isTrueFundMedium, setIsTrueFundMedium] = useState(false);
  const [isASAPFinanceMedium, setIsASAPFinanceMedium] = useState(false);
  const [showNotEligible, setShowNotEligible] = useState<string | null>(null);
  const [priorityVisible, setPriorityVisible] = useState(0);
  const [showAll, setShowAll] = useState(false);
  const [showScratch, setShowScratch] = useState(false);
  const [coupon, setCoupon] = useState<KBCoupon | null>(null);

  useEffect(() => {
    const response = getStoredShortTicketOffers();
    if (!response?.data) {
      router.replace("/short-ticket");
      return;
    }
    const data = response.data;

    if (typeof window !== "undefined") {
      if (sessionStorage.getItem("kbApplied") === "1") {
        setKbApplied(true);
      }
      let storedName = sessionStorage.getItem("userFirstName") || "";
      if (!storedName) {
        try {
          const raw = sessionStorage.getItem("userFormData");
          if (raw) {
            const parsed = JSON.parse(raw) as { firstName?: string };
            if (parsed?.firstName) storedName = parsed.firstName;
          }
        } catch {
          // ignore
        }
      }
      if (storedName) setFirstName(storedName);
    }

    const isSalariedFlag = data.isSalaried === true;
    setIsSalaried(isSalariedFlag);

    // Build UTM map
    const utmMap: Record<string, string | undefined> = {};
    if (data.RapidMoney?.utm_link) utmMap["RapidMoney"] = data.RapidMoney.utm_link;
    if (data.RamFinCorp?.utm_link) utmMap["RamFinCorp"] = data.RamFinCorp.utm_link;
    if (data.KreditBee?.utm_link) utmMap["KreditBee"] = data.KreditBee.utm_link;
    if (data.TrueBalance?.utm_link) utmMap["TrueBalance"] = data.TrueBalance.utm_link;
    if ((data.RupiNow as { utm_link?: string })?.utm_link) utmMap["RupiNow"] = (data.RupiNow as { utm_link?: string }).utm_link;
    if ((data.Cashvia as { utm_link?: string })?.utm_link) utmMap["Cashvia"] = (data.Cashvia as { utm_link?: string }).utm_link;

    // Process static lenders from API
    const staticLenders = (data as { staticLenders?: Array<{ name: string; utm_link: string }> }).staticLenders || [];
    for (const sl of staticLenders) {
      const internalName = STATIC_LENDER_NAME_MAP[sl.name] || sl.name;
      if (sl.utm_link) utmMap[internalName] = sl.utm_link;
    }

    // Check utm_medium for priority ordering
    const utmMedium = (sessionStorage.getItem("utm_medium") || "").toLowerCase();
    const isKbMediumLocal = utmMedium === "kreditbee";
    setIsKbMedium(isKbMediumLocal);
    const isRapidMoneyMediumLocal = utmMedium === "rapidmoney";
    setIsRapidMoneyMedium(isRapidMoneyMediumLocal);
    const isRamFinCorpMediumLocal = utmMedium === "ramfincorp";
    setIsRamFinCorpMedium(isRamFinCorpMediumLocal);
    const isLoanWalleMediumLocal = utmMedium === "loanwalle";
    setIsLoanWalleMedium(isLoanWalleMediumLocal);
    const isMoneyDotMediumLocal = utmMedium === "moneydot";
    setIsMoneyDotMedium(isMoneyDotMediumLocal);
    const isTrueFundMediumLocal = utmMedium === "truefund";
    setIsTrueFundMedium(isTrueFundMediumLocal);
    const isASAPFinanceMediumLocal = utmMedium === "asapfinance";
    setIsASAPFinanceMedium(isASAPFinanceMediumLocal);

    let renderOrder = LENDER_ORDER;
    let initialVisible = 4;

     if (isKbMediumLocal) {
      renderOrder = KB_PRIORITY_ORDER;
      initialVisible = 5;
    } else if (isRapidMoneyMediumLocal) {
      renderOrder = RAPIDMONEY_PRIORITY_ORDER;
      initialVisible = 5;
    } else if (isRamFinCorpMediumLocal) {
      renderOrder = RamFinCorp_PRIORITY_ORDER;
      initialVisible = 5;
    } else if (isLoanWalleMediumLocal) {
      renderOrder = LOANWALLE_PRIORITY_ORDER;
      initialVisible = 5;
    } else if (isMoneyDotMediumLocal) {
      renderOrder = MONEYDOT_PRIORITY_ORDER;
      initialVisible = 5;
    } else if (isTrueFundMediumLocal) {
      renderOrder = TRUEFUND_PRIORITY_ORDER;
      initialVisible = 5;
    } else if (isASAPFinanceMediumLocal) {
      renderOrder = ASAPFINANCE_PRIORITY_ORDER;
      initialVisible = 5;
    }

    // Build ordered list based on eligibility
    const ordered: OrderedLender[] = [];
    for (const name of renderOrder) {
      const lender = data[name] as ShortTicketLender | undefined;
      const utmLink = getUtmLink(name, lender);

      switch (name) {
        case "RapidMoney": {
          // RapidMoney is shown based on API response (isDuplicate === false)
          const isDuplicate = (lender as { isDuplicate?: boolean })?.isDuplicate;
          if (isDuplicate !== false) break;
          if (utmLink) ordered.push({ name, utm_link: utmLink });
          break;
        }

        case "KreditBee":
          if (lender?.is_offer === false) break;
          if (utmLink) ordered.push({ name, utm_link: utmLink, wasApproved: lender?.success });
          break;

        case "TrueBalance":
          // TrueBalance only shows if it comes from API staticLenders
          if (!utmMap[name]) break;
          ordered.push({ name, utm_link: utmMap[name] });
          break;

        // RamFinCorp - shown only if message is "Dedup Success"
        case "RamFinCorp": {
          const ramFinCorpMessage = (lender?.message || "").toLowerCase();
          if (ramFinCorpMessage !== "dedup success") break;
          ordered.push({ name, utm_link: utmMap[name] || FALLBACK_UTM.RamFinCorp });
          break;
        }
        

        case "Vivifi":
          // Vivifi only shows if it comes from API staticLenders
          if (!utmMap[name]) break;
          ordered.push({ name, utm_link: utmMap[name] });
          break;

        case "SpeedoLoan":
          // SpeedoLoan only shows if it comes from API staticLenders
          if (!utmMap[name]) break;
          ordered.push({ name, utm_link: utmMap[name] });
          break;

        case "LoanWalle":
          // LoanWalle only shows if it comes from API staticLenders
          if (!utmMap[name]) break;
          ordered.push({ name, utm_link: utmMap[name] });
          break;

        case "ASAPFinance":
          // ASAPFinance only shows if it comes from API staticLenders
          if (!utmMap[name]) break;
          ordered.push({ name, utm_link: utmMap[name] });
          break;

        case "Nira":
          // Nira only shows if it comes from API staticLenders
          if (!utmMap[name]) break;
          ordered.push({ name, utm_link: utmMap[name] });
          break;

        case "Apollo": 
        
        if (!utmMap[name]) break;
        ordered.push({ name, utm_link: utmMap[name] });

        case "Cashvia": {
          // Cashvia is shown only if dedupeStatus === "Passed"
          const cashviaDedupeStatus = (lender as { dedupeStatus?: string })?.dedupeStatus;
          if (cashviaDedupeStatus !== "Passed") break;
          ordered.push({ name, utm_link: utmMap[name] || FALLBACK_UTM.Cashvia });
          break;
        }

        case "TrueFund": {
          // TrueFund is shown only if API response message contains "user details received sucessfully"
          const trueFundMessage = (lender?.message || "").toLowerCase();
          const trueFundResponseMessage = (
            (lender?.data as { response?: { message?: string } })?.response?.message || ""
          ).toLowerCase();
          const isTrueFundEligible =
            trueFundMessage.includes("user details received sucessfully") ||
            trueFundResponseMessage.includes("user details received sucessfully");
          if (!isTrueFundEligible) break;
          ordered.push({ name, utm_link: utmMap[name] || FALLBACK_UTM.TrueFund });
          break;
        }

        case "MoneyDot": {
  const canAttribute = (
    lender?.data as {
      response?: {
        can_attribute?: boolean;
      };
    }
  )?.response?.can_attribute;

  if (canAttribute !== true) break;

  ordered.push({
    name,
    utm_link: utmLink || FALLBACK_UTM.MoneyDot,
  });
  break;
}

        case "RupiNow": {
          // RupiNow is shown only if dedupeStatus === "Passed"
          const rupiNowDedupeStatus = (lender as { dedupeStatus?: string })?.dedupeStatus;
          if (rupiNowDedupeStatus !== "Passed") break;
          ordered.push({ name, utm_link: utmMap[name] || FALLBACK_UTM.RupiNow });
          break;
        }

        default:
          if (utmLink) ordered.push({ name, utm_link: utmLink });
      }
    }

    setPriorityVisible(initialVisible);
    setOrderedLenders(ordered);

    // Pick a profile-based KreditBee coupon
    const profile = isSalariedFlag ? "Salaried" : "Self Employed";
    setCoupon(getEligibleCoupon(profile));

    // Track shown offers
    try {
      const phone = sessionStorage.getItem("userPhone") || "";
      if (phone && ordered.length) {
        const shownOffers: ShownOfferEntry[] = ordered.map((l) => ({
          lenderName: l.name,
          section: "promoted",
          utmLink: l.utm_link || null,
          ...(typeof l.wasApproved === "boolean" ? { wasApproved: l.wasApproved } : {}),
        }));
        void trackShortShownOffers(phone, shownOffers);
      }
    } catch (err) {
      console.error("trackShortShownOffers failed:", err);
    }

    setLoaded(true);
  }, [router]);

  if (!loaded) return null;

  const visibleLenders =
    priorityVisible > 0 && !showAll
      ? orderedLenders.slice(0, priorityVisible)
      : orderedLenders;
  const multipleCards = visibleLenders.length > 1;
  const hasHiddenOffers =
    priorityVisible > 0 && !showAll && orderedLenders.length > priorityVisible;

  const handleApply = async (lenderName: string, url?: string) => {
    const phone = sessionStorage.getItem("userPhone") || "";
    await saveShortLender(phone, lenderName);

    // CLEVERTAP DISABLED
    // cleverTapTrackEvent(CLEVERTAP_EVENTS.LENDER_CLICKED, {
    //   Lender: DISPLAY_NAMES[lenderName] || lenderName,
    //   LenderKey: lenderName,
    // });

    if (url) window.open(url, "_blank");
  };

  const handleKreditBeeApply = async () => {
    if (kbApplying || kbApplied) return;
    setKbApplying(true);

    // CLEVERTAP DISABLED
    // cleverTapTrackEvent(CLEVERTAP_EVENTS.LENDER_CLICKED, {
    //   Lender: "Kreditbee",
    //   LenderKey: "KreditBee",
    // });

    try {
      const phone = sessionStorage.getItem("userPhone") || "";
      await saveShortLender(phone, "KreditBee");
      const res = await applyToShortKreditBee();

      setKbApplied(true);
      try {
        sessionStorage.setItem("kbApplied", "1");
      } catch { }

      const kb = res.data?.KreditBee;
      const kbMessage = (kb?.message || "").toLowerCase();
      const leadStatus = (
        (kb?.data as { response?: { model?: { leadStatus?: string } } })?.response?.model?.leadStatus || ""
      ).toLowerCase();

      const isKbSuccess = kb?.success === true;
      const isNotApproved =
        kbMessage.includes("not approved") ||
        kbMessage.includes("rejected") ||
        leadStatus === "not approved" ||
        leadStatus === "rejected";
      const isApproved = !isNotApproved && (kbMessage.includes("approved") || leadStatus === "approved");
      const isDuplicate = kbMessage.includes("duplicate");

      if (isKbSuccess && isApproved && !isDuplicate) {
        // Use UTM link from orderedLenders if available, otherwise use fallback
        const kbLender = orderedLenders.find((l) => l.name === "KreditBee");
        const redirectUrl = kbLender?.utm_link || FALLBACK_UTM.KreditBee;
        window.open(redirectUrl, "_blank");
      } else if (isNotApproved || !isKbSuccess) {
        setShowNotEligible("Kreditbee");
      } else {
        toast.error(kb?.message || "Your application was not approved.", {
          duration: 5000,
          style: { maxWidth: 400 },
        });
      }
    } catch (err) {
      console.error("KreditBee apply failed:", err);
      toast.error("Something went wrong. Please try again.", { duration: 4000 });
    } finally {
      setKbApplying(false);
    }
  };

  // Resolve lender content
  const resolve = (name: string) => {
    const detail = getStaticLenderDetail(name);
    const meta = STATIC_LENDER_LOGOS[name] || {};
    return { ...detail, logo: meta.src, logoMeta: meta };
  };

  const onApplyFor = (lender: OrderedLender) => {
    if (lender.name === "KreditBee") return handleKreditBeeApply;
    return () => handleApply(lender.name, lender.utm_link);
  };

  // Hero card logic
  const showHeroFlow = isKbMedium || isRapidMoneyMedium || isRamFinCorpMedium || isLoanWalleMedium || isMoneyDotMedium || isTrueFundMedium || isASAPFinanceMedium;
  const heroName = isKbMedium ? "KreditBee" : isRapidMoneyMedium ? "RapidMoney" : isRamFinCorpMedium ? "RamFinCorp" : isLoanWalleMedium ? "LoanWalle" : isMoneyDotMedium ? "MoneyDot" : isTrueFundMedium ? "TrueFund" : isASAPFinanceMedium ? "ASAPFinance" : null;
  const heroIdx = heroName ? visibleLenders.findIndex((l) => l.name === heroName) : -1;
  const showHeroCard = showHeroFlow && heroIdx === 0 && visibleLenders.length > 0;
  const heroLender = showHeroCard ? visibleLenders[0] : null;
  const otherLenders = showHeroCard ? visibleLenders.slice(1) : visibleLenders;

  return (
    <>
      <main className="min-h-screen bg-[#F0E4FD] overflow-x-hidden relative">
        {/* Background decorations */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-[-180px] top-[20%] h-[380px] w-[380px] rounded-full bg-[#FEF3D5]/40 blur-3xl" />
          <div className="absolute left-[30%] top-[-220px] h-[360px] w-[480px] rounded-full bg-violet-400/20 blur-3xl" />
          <div className="absolute bottom-[-180px] left-[10%] h-[500px] w-[500px] rounded-full bg-purple-300/30 blur-3xl" />
          <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-[-120px] left-[-100px] h-[500px] w-[900px] rotate-6 rounded-[100%] border border-white/30" />
          <div className="absolute bottom-[-180px] left-[-140px] h-[600px] w-[1100px] rotate-6 rounded-[100%] border border-white/20" />
          <div className="absolute right-[-300px] bottom-[-5%] h-[420px] w-[420px] rounded-full bg-[#f7e9c4]/50 blur-3xl" />
        </div>

        <div className={`relative mx-auto px-3 z-10 sm:px-5 py-4 sm:py-6 w-full ${multipleCards || showHeroFlow ? "max-w-6xl" : "max-w-xl"}`}>

          {/* Header */}
          {showHeroFlow ? (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-3"
            >
              <img src="/cready.png" alt="Cready" className="h-5 w-auto mb-1.5" />
              <div className="flex items-center gap-1.5 mb-0.5">
                <h1 className="text-[20px] sm:text-[24px] font-bold tracking-tight text-[#171717]">
                  Hi{" "}
                  <span className="bg-gradient-to-r from-violet-700 to-[#C894FF] bg-clip-text text-transparent">
                    {firstName
                      ? firstName.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
                      : "There"}
                  </span>
                </h1>
                <motion.span
                  animate={{ rotate: [0, 18, -8, 18, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
                  className="text-lg"
                >
                  👋
                </motion.span>
              </div>
              <p className="max-w-lg text-[11px] sm:text-[12px] leading-relaxed text-gray-600">
                We&apos;ve analysed your profile and handpicked the{" "}
                <span className="font-semibold text-violet-700">best loan offers</span> for you.
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-4"
            >
              <img src="/cready.png" alt="Cready" className="h-5 w-auto mx-auto mb-5 opacity-70" />
              <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <motion.svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M5 13l4 4L19 7"
                  />
                </motion.svg>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">You&apos;re all set!</h1>
              <p className="text-gray-500 text-[12px] sm:text-[13px]">
                Here are personalized offers from our lending partners
              </p>
            </motion.div>
          )}

          {/* Hero Card */}
          {showHeroCard && heroLender && (() => {
            const c = resolve(heroLender.name);
            const heroDisplayName = DISPLAY_NAMES[heroLender.name] || heroLender.name;
            const heroApplying = heroLender.name === "KreditBee" && kbApplying;
            const heroApplied = heroLender.name === "KreditBee" && kbApplied;
            const heroDisabled = heroApplying || heroApplied;
            const heroLabel = heroApplying ? "Applying..." : heroApplied ? "Applied" : null;
            const applyHandler = onApplyFor(heroLender);
            const headlineIdx = (c.headline || "").indexOf("₹");
            const headlineHead = headlineIdx > -1 ? c.headline.slice(0, headlineIdx).trim() : c.headline;
            const headlineAmount = headlineIdx > -1 ? c.headline.slice(headlineIdx) : "";

            return (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="relative overflow-hidden rounded-[20px] border border-white/40 bg-[linear-gradient(135deg,rgba(255,255,255,0.30),rgba(245,240,255,0.92))] backdrop-blur-xl shadow-[0_6px_24px_rgba(124,58,237,0.08)]"
              >
                {/* Top recommendation pill */}
                <div className="absolute top-0 left-0 z-10">
                  <span className="inline-flex items-center gap-1 bg-gradient-to-r from-violet-600 to-[#C894FF] text-white shadow-lg shadow-violet-500/20 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-br-xl rounded-tl-[18px]">
                    <svg className="w-2.5 h-2.5 text-amber-300" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l2.39 7.36H22l-6.18 4.49L18.21 22 12 17.27 5.79 22l2.39-8.15L2 9.36h7.61z" />
                    </svg>
                    Top Recommendation For You
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-4 p-2.5 sm:p-4 pt-8 sm:pt-10">
                  {/* Left column */}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`h-8 px-2 rounded-lg border border-white shadow-sm flex items-center justify-center ${c.logoMeta?.darkBg ? "bg-gray-800" : "bg-white/80"}`}>
                        {c.logo ? (
                          <img src={c.logo} alt={heroDisplayName} className="h-6 w-auto object-contain" />
                        ) : (
                          <span className="text-lg font-bold text-gray-600">{heroDisplayName.charAt(0)}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-[12px] font-semibold text-[#111827]">{heroDisplayName}</p>
                        {LENDER_FEATURE_TAGS[heroLender.name] && (
                          <span className="inline-flex items-center gap-0.5 rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[9px] font-semibold text-amber-700">
                            {LENDER_FEATURE_TAGS[heroLender.name]}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-0.5 rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-[9px] font-semibold text-violet-700">
                          Highly Recommended
                        </span>
                        {heroLender.name === "KreditBee" && (
                          <button
                            onClick={() => setShowScratch(true)}
                            className="inline-flex items-center gap-1 bg-indigo-600 text-white text-[9px] font-semibold px-2 py-0.5 rounded-full cursor-pointer hover:bg-indigo-700 transition-colors"
                          >
                            <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                            </svg>
                            Scratch & Win
                          </button>
                        )}
                      </div>
                    </div>

                    <h2 className="text-[22px] sm:text-[26px] leading-[1.15] tracking-[-0.03em] font-bold text-gray-900 mb-1">
                      {headlineHead}
                      {headlineAmount && (
                        <>
                          <br />
                          <span className="bg-gradient-to-r from-violet-700 to-[#C894FF] bg-clip-text text-transparent">{headlineAmount}</span>
                        </>
                      )}
                    </h2>
                    <p className="text-[10px] sm:text-[12px] text-[#6B7280] max-w-[480px] leading-relaxed mt-1.5 mb-1.5 sm:mb-2 line-clamp-1 sm:line-clamp-none">{c.description}</p>

                    {/* Feature chips */}
                    <div className="flex items-start gap-2">
                      {(() => {
                        const features = getLenderFeatures(heroLender.name);
                        const icons = [
                          <path key="icon1" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />,
                          <path key="icon2" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
                          <path key="icon3" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
                        ];
                        return features.map((f, idx) => ({
                          title: f.title,
                          sub: f.description,
                          icon: icons[idx],
                        }));
                      })().map((f) => (
                        <div key={f.title} className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left gap-0.5 sm:gap-1.5 px-1 py-1 sm:px-2 sm:py-1.5 bg-white/40 rounded-md border border-white/80">
                          <div className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center shrink-0">
                            <svg className="w-3 h-3 sm:w-3 sm:h-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">{f.icon}</svg>
                          </div>
                          <div className="min-w-0">
                            <p className="text-[8px] sm:text-[10px] font-semibold text-gray-900 leading-tight">{f.title}</p>
                            <p className="hidden sm:block text-[9px] text-gray-500 leading-tight">{f.sub}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right column */}
                  <div className="relative flex items-center justify-between rounded-[18px] bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.14),transparent_65%)] px-3 py-3">
                    <div className="flex flex-col gap-1.5 sm:gap-2.5 flex-1 min-w-0">
                      <div className="flex items-start gap-1.5 sm:gap-2">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-white flex items-center justify-center shrink-0">
                          <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-[8px] sm:text-[9px] font-semibold text-gray-400 uppercase tracking-wider">Key Feature</p>
                          <p className="text-[10px] sm:text-[11px] font-medium text-gray-700 leading-snug mt-0.5 line-clamp-2">{c.keyFeature}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-1.5 sm:gap-2">
                        <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-white flex items-center justify-center shrink-0">
                          <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-[8px] sm:text-[9px] font-semibold text-gray-400 uppercase tracking-wider">Interest Rate</p>
                          <p className="text-[10px] sm:text-[11px] font-medium text-gray-700 leading-snug mt-0.5 line-clamp-2">{c.interestRate}</p>
                        </div>
                      </div>
                    </div>
                    <div className="relative w-[100px] h-[100px] sm:w-[120px] sm:h-[120px] shrink-0 self-center">
                      <svg className="absolute top-0 -right-1 w-3 h-3 text-indigo-300" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l1.5 5L19 8.5l-5.5 1.5L12 15l-1.5-5L5 8.5l5.5-1.5L12 2z" />
                      </svg>
                      <svg className="absolute top-4 right-0.5 w-2 h-2 text-indigo-200" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l1.5 5L19 8.5l-5.5 1.5L12 15l-1.5-5L5 8.5l5.5-1.5L12 2z" />
                      </svg>
                      <img src="/shield.png" alt="shield" className="w-full h-full object-contain" />
                    </div>
                  </div>
                </div>

                {/* Footer bar */}
                <div className="border-t border-gray-100 bg-purple-100 px-2.5 sm:px-4 py-1.5 sm:py-2 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                  <div className="flex items-center gap-1 sm:gap-1.5 text-[9px] sm:text-[10px] text-gray-600">
                    <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-indigo-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span className="font-medium">Trusted by {heroLender.name === "KreditBee" ? "69L+" : "40L+"} customers</span>
                    <div className="flex -space-x-1.5">
                      {[
                        { bg: "bg-rose-200", txt: "text-rose-700", c: "A" },
                        { bg: "bg-amber-200", txt: "text-amber-700", c: "P" },
                        { bg: "bg-sky-200", txt: "text-sky-700", c: "R" },
                        { bg: "bg-purple-200", txt: "text-purple-700", c: "S" },
                      ].map((a, i) => (
                        <span key={i} className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border border-white flex items-center justify-center text-[7px] sm:text-[8px] font-bold ${a.bg} ${a.txt}`}>
                          {a.c}
                        </span>
                      ))}
                    </div>
                    <span className="text-amber-500 font-semibold text-[9px]">4.8 ★</span>
                  </div>
                  <span className="hidden sm:inline text-gray-300">|</span>
                  <div className="hidden sm:block text-[10px] text-gray-600 font-medium">RBI Registered NBFC</div>
                  <button
                    onClick={applyHandler}
                    disabled={heroDisabled}
                    className="sm:ml-auto inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-lg bg-gradient-to-r from-[#D9F941] to-[#7C3AED] text-white text-[12px] font-semibold shadow-md shadow-violet-500/20 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 cursor-pointer"
                  >
                    {heroLabel ?? (<>Apply Now <span aria-hidden>→</span></>)}
                  </button>
                </div>
              </motion.div>
            );
          })()}

          {/* "More Matched Offers" section header */}
          {showHeroCard && otherLenders.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-2 sm:mb-3"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-2 mt-3">
                <div>
                  <h3 className="text-[12px] sm:text-[14px] font-bold text-gray-900 flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l2.39 7.36H22l-6.18 4.49L18.21 22 12 17.27 5.79 22l2.39-8.15L2 9.36h7.61z" />
                    </svg>
                    More Matched Offers For You
                  </h3>
                  <p className="text-[10px] sm:text-[11px] text-gray-500 mt-0.5">
                    Curated based on your profile and preferences
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2 w-full lg:w-auto">
                  {[
                    { icon: Lock, title: "100% Secure", sub: "Bank-level safety" },
                    { icon: Clock, title: "Quick & Easy", sub: "Paperless process" },
                    { icon: Contact, title: "Over 50 Partners", sub: "Top NBFCs & Banks" },
                  ].map((f) => (
                    <div key={f.title} className="min-w-[90px] rounded-md border border-white/60 bg-white/55 backdrop-blur-xl px-2 py-1.5 shadow-sm">
                      <div className="flex items-center gap-1.5">
                        <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                          <f.icon className="w-3 h-3" />
                        </div>
                        <div>
                          <p className="text-[9px] sm:text-[10px] font-semibold text-violet-600">{f.title}</p>
                          <p className="text-[8px] sm:text-[9px] text-gray-500 leading-tight">{f.sub}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Salaried badge when no hero */}
          {!showHeroCard && isSalaried && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg border border-emerald-200">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Best Lenders for Salaried Professionals
              </span>
            </motion.div>
          )}

          {/* Offer cards grid */}
          {otherLenders.length > 0 && (
            <div className={
              otherLenders.length === 1 ? "max-w-md mx-auto" :
              otherLenders.length === 2 ? "grid grid-cols-1 sm:grid-cols-2 gap-3" :
              otherLenders.length === 3 ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3" :
              "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
            }>
              {otherLenders.map((lender, idx) => {
                const isKB = lender.name === "KreditBee";
                const c = resolve(lender.name);
                const displayName = DISPLAY_NAMES[lender.name] || lender.name;
                const logoSrc = c.logo;
                const logoDarkBg = c.logoMeta?.darkBg;
                const isApplying = isKB && kbApplying;
                const isApplied = isKB && kbApplied;
                const applyHandler = onApplyFor(lender);

                return (
                  <OfferCard
                    key={lender.name}
                    lenderName={displayName}
                    lenderLogo={
                      logoSrc ? (
                        <img src={logoSrc} alt={displayName} className="h-8 w-auto object-contain" />
                      ) : (
                        <span className="text-xl font-bold text-gray-600">{displayName.charAt(0)}</span>
                      )
                    }
                    headline={c.headline}
                    description={c.description}
                    keyFeature={c.keyFeature}
                    interestRate={c.interestRate}
                    onApply={applyHandler}
                    delay={0.1 + idx * 0.05}
                    logoDarkBg={logoDarkBg}
                    applying={isApplying}
                    applied={isApplied}
                    badgeText={LENDER_FEATURE_TAGS[lender.name] || (idx === 0 && !showHeroCard ? "Matched Offer" : undefined)}
                    badge={isKB ? (
                      <button
                        onClick={() => setShowScratch(true)}
                        className="scratch-badge bg-indigo-600 text-white text-[10px] font-semibold px-2 py-1 rounded-lg cursor-pointer flex items-center gap-1 hover:bg-indigo-700 transition-colors"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                        </svg>
                        Scratch & Win
                      </button>
                    ) : undefined}
                  />
                );
              })}
            </div>
          )}

          {/* View All button */}
          {hasHiddenOffers && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="flex justify-center mt-6">
              <button
                onClick={() => setShowAll(true)}
                className="px-8 py-3 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 text-sm font-semibold rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-[0.97] cursor-pointer flex items-center gap-2"
              >
                View All Offers ({orderedLenders.length - priorityVisible} more)
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </motion.div>
          )}

          {/* No offers */}
          {orderedLenders.length === 0 && (
            <div className="bg-white rounded-2xl p-8 text-center shadow-lg">
              <p className="text-gray-500 text-sm">
                No eligible lenders returned for your profile. Please try again later or reach out to support.
              </p>
            </div>
          )}

          {/* Footer */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-12">
            <TrustBadges />
            <p className="text-center text-gray-400 text-[11px] mt-5">
              Copyright &copy; 2026 SwitchMyLoan Pvt. Ltd. All Rights Reserved.
            </p>
          </motion.div>
        </div>
      </main>

      <GradientBanner />

      {/* Not Eligible popup */}
      {showNotEligible && (
        <NotEligibleScreen
          lenderName={showNotEligible}
          onClose={() => setShowNotEligible(null)}
          onExplore={() => {
            setShowNotEligible(null);
            setShowAll(true);
          }}
        />
      )}

      {/* Scratch Coupon modal */}
      {showScratch && coupon && (
        <ScratchCoupon
          discount={coupon.discount}
          description={coupon.description}
          couponCode={coupon.code}
          onClose={() => setShowScratch(false)}
        />
      )}
    </>
  );
}
