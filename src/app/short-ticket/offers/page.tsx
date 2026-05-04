"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import {
  applyToShortKreditBee,
  applyToShortMoneyView,
  getStoredShortTicketOffers,
  saveShortLender,
  type ShortTicketLender,
} from "@/lib/api";
import {
  OFFERS,
  STATIC_LENDER_LOGOS,
  getStaticLenderDetail,
} from "@/lib/constants";
import OfferCard from "@/components/offers/OfferCard";
import NotEligibleScreen from "@/components/offers/NotEligibleScreen";
import TrustBadges from "@/components/ui/TrustBadges";
import GradientBanner from "@/components/ui/GradientBanner";

const FALLBACK_UTM: Record<string, string> = {
  KreditBee: "https://kredt.be/3ZFfVbz",
  RamFinCorp: "https://ramfincorp.com/",
  TrueBalance: "https://truebalance.io/",
  MPokket: "https://mpokket.com/",
  CreditPlus: "https://www.creditplus.in/",
  Loan112: "https://loan112.com/",
  RapidMoney: "https://web.rapidmoney.in/",
};

function getUtmLink(
  name: string,
  lender: ShortTicketLender | undefined
): string | null {
  // KreditBee is always shown on the lender selection screen.
  // Eligibility is checked via API on click; success → KB web journey,
  // failure → NotEligibleScreen.
  if (name === "KreditBee") {
    const directLink =
      typeof lender?.utm_link === "string" ? lender.utm_link : null;
    return directLink || FALLBACK_UTM.KreditBee;
  }

  if (!lender) return null;
  const directLink =
    typeof lender.utm_link === "string" ? lender.utm_link : null;

  switch (name) {
    case "RapidMoney":
      return directLink || FALLBACK_UTM.RapidMoney;

    case "TrueBalance": {
      const nested = (
        lender.data as {
          response?: { data?: { isEligible?: boolean } };
        } | undefined
      )?.response?.data;
      if (nested?.isEligible !== true) return null;
      return directLink || FALLBACK_UTM.TrueBalance;
    }

    case "RamFinCorp":
      if (lender.success !== true) return null;
      return directLink || FALLBACK_UTM.RamFinCorp;

    case "MPokket": {
      const isEligible = (lender as { isEligible?: boolean }).isEligible;
      if (isEligible === false) return null;
      if (lender.success !== true) return null;
      return directLink || FALLBACK_UTM.MPokket;
    }

    case "CreditPlus":
      if (lender.success !== true) return null;
      return directLink || FALLBACK_UTM.CreditPlus;

    case "Loan112":
      if (lender.success !== true) return null;
      return directLink || FALLBACK_UTM.Loan112;

    default:
      return directLink;
  }
}

interface EligibleOffer {
  name: string;
  utmLink: string;
  headline: string;
  description: string;
  keyFeature: string;
  interestRate: string;
  logoSrc?: string;
  logoDarkBg?: boolean;
}

export default function ShortTicketOffersPage() {
  const router = useRouter();
  const [offers, setOffers] = useState<EligibleOffer[]>([]);
  const [isSalaried, setIsSalaried] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [kbApplying, setKbApplying] = useState(false);
  const [mvApplying, setMvApplying] = useState(false);
  const [showNotEligible, setShowNotEligible] = useState(false);

  useEffect(() => {
    const response = getStoredShortTicketOffers();
    if (!response?.data) {
      router.replace("/");
      return;
    }

    const data = response.data;
    setIsSalaried(data.isSalaried === true);

    const kbOffer = OFFERS.find((o) => o.lenderName === "KreditBee");

    const buildOffer = (name: string, utmLink: string): EligibleOffer => {
      if (name === "KreditBee" && kbOffer) {
        return {
          name,
          utmLink,
          headline: kbOffer.headline,
          description: kbOffer.description,
          keyFeature: kbOffer.keyFeature,
          interestRate: kbOffer.interestRate,
          logoSrc: kbOffer.logo,
        };
      }
      const detail = getStaticLenderDetail(name);
      const logo = STATIC_LENDER_LOGOS[name];
      return {
        name,
        utmLink,
        headline: detail.headline,
        description: detail.description,
        keyFeature: detail.keyFeature,
        interestRate: detail.interestRate,
        logoSrc: logo?.src,
        logoDarkBg: logo?.darkBg,
      };
    };

    const baseOrder =
      Array.isArray(data.priorityOrder) && data.priorityOrder.length > 0
        ? [...data.priorityOrder]
        : [
            "RapidMoney",
            "RamFinCorp",
            "KreditBee",
            "TrueBalance",
            "MPokket",
            "CreditPlus",
            "Loan112",
          ];

    // KreditBee must always appear on the lender selection screen
    // (eligibility is determined by API call on click).
    const order = baseOrder.includes("KreditBee")
      ? baseOrder
      : ["KreditBee", ...baseOrder];

    const eligible: EligibleOffer[] = [];
    const seen = new Set<string>();

    for (const name of order) {
      if (seen.has(name)) continue;
      const lender = data[name] as ShortTicketLender | undefined;
      const utm = getUtmLink(name, lender);
      if (!utm) continue;
      eligible.push(buildOffer(name, utm));
      seen.add(name);
    }

    for (const sl of data.staticLenders || []) {
      if (seen.has(sl.name)) continue;
      eligible.push(buildOffer(sl.name, sl.utm_link));
      seen.add(sl.name);
    }

    setOffers(eligible);
    setLoaded(true);
  }, [router]);

  const handleApply = async (lenderName: string, url: string) => {
    const phone = sessionStorage.getItem("userPhone") || "";
    await saveShortLender(phone, lenderName);
    if (url) window.open(url, "_blank");
  };

  const handleKreditBeeApply = async (fallbackUrl: string) => {
    setKbApplying(true);
    try {
      const phone = sessionStorage.getItem("userPhone") || "";
      await saveShortLender(phone, "KreditBee");
      const res = await applyToShortKreditBee();

      const kb = res.data?.KreditBee;
      const kbMessage = (kb?.message || "").toLowerCase();
      const leadStatus = (
        (kb?.data as { response?: { model?: { leadStatus?: string } } })
          ?.response?.model?.leadStatus || ""
      ).toLowerCase();

      const isKbSuccess = kb?.success === true;
      const isNotApproved =
        kbMessage.includes("not approved") ||
        kbMessage.includes("rejected") ||
        leadStatus === "not approved" ||
        leadStatus === "rejected";
      const isApproved =
        !isNotApproved &&
        (kbMessage.includes("approved") || leadStatus === "approved");
      const isDuplicate = kbMessage.includes("duplicate");

      if (isKbSuccess && isApproved && !isDuplicate) {
        const url =
          ((kb?.data as { utm_link?: string })?.utm_link as string) ||
          fallbackUrl ||
          "https://kredt.be/3ZFfVbz";
        window.open(url, "_blank");
      } else if (isNotApproved || !isKbSuccess) {
        setShowNotEligible(true);
      } else {
        toast.error(kb?.message || "Your application was not approved.", {
          duration: 5000,
          style: { maxWidth: 400 },
        });
      }
    } catch (err) {
      console.error("Short KreditBee apply failed:", err);
      toast.error("Something went wrong. Please try again.", { duration: 4000 });
    } finally {
      setKbApplying(false);
    }
  };

  const handleMoneyViewApply = async (fallbackUrl: string) => {
    setMvApplying(true);
    try {
      const phone = sessionStorage.getItem("userPhone") || "";
      await saveShortLender(phone, "MoneyView");
      const res = await applyToShortMoneyView();

      const mvMessage = (res.data?.MoneyView?.message || "").toLowerCase();
      const isApproved = mvMessage.includes("approved");
      const isDuplicate = mvMessage.includes("duplicate");
      const isRejected = mvMessage.includes("rejected");

      if (isApproved && !isDuplicate && !isRejected) {
        const url = fallbackUrl || "https://moneyview.in/";
        window.open(url, "_blank");
      } else {
        toast.error(
          res.data?.MoneyView?.message || "Your application was not approved.",
          { duration: 5000, style: { maxWidth: 400 } }
        );
      }
    } catch (err) {
      console.error("Short MoneyView apply failed:", err);
      toast.error("Something went wrong. Please try again.", { duration: 4000 });
    } finally {
      setMvApplying(false);
    }
  };

  if (!loaded) return null;

  const multipleCards = offers.length > 1;

  return (
    <main className="min-h-screen bg-[#f8f9fb]">
      <Toaster position="top-center" />
      <div
        className={`mx-auto px-4 sm:px-6 py-10 sm:py-14 ${
          multipleCards ? "max-w-6xl" : "max-w-2xl"
        }`}
      >
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <img
            src="/cready.png"
            alt="Cready"
            className="h-7 w-auto mx-auto mb-8 opacity-70"
          />

          <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <motion.svg
              className="w-7 h-7 text-emerald-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
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

          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            You&apos;re all set!
          </h1>
          <p className="text-gray-500 text-sm sm:text-base">
            {offers.length > 0
              ? "Here are personalized offers from our lending partners"
              : "No matching offers found — please try again later"}
          </p>
        </motion.div>

        {isSalaried && offers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-4"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg border border-emerald-200">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              Best Lenders for Salaried Professionals
            </span>
          </motion.div>
        )}

        {offers.length > 0 && (
          <div
            className={
              multipleCards
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                : "space-y-4"
            }
          >
            {offers.map((offer, i) => (
              <OfferCard
                key={offer.name}
                lenderName={offer.name}
                compact={multipleCards}
                logoDarkBg={offer.logoDarkBg}
                lenderLogo={
                  offer.logoSrc ? (
                    <img
                      src={offer.logoSrc}
                      alt={offer.name}
                      className="h-6 w-auto"
                    />
                  ) : (
                    <span className="text-xl font-bold text-gray-600">
                      {offer.name.charAt(0)}
                    </span>
                  )
                }
                headline={offer.headline}
                description={offer.description}
                keyFeature={offer.keyFeature}
                interestRate={offer.interestRate}
                onApply={
                  offer.name === "KreditBee"
                    ? () => handleKreditBeeApply(offer.utmLink)
                    : offer.name === "MoneyView"
                      ? () => handleMoneyViewApply(offer.utmLink)
                      : () => handleApply(offer.name, offer.utmLink)
                }
                applying={
                  offer.name === "KreditBee"
                    ? kbApplying
                    : offer.name === "MoneyView"
                      ? mvApplying
                      : undefined
                }
                delay={0.15 + i * 0.08}
                recommended={i < 2}
              />
            ))}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-10"
        >
          <TrustBadges />
          <p className="text-center text-gray-400 text-[11px] mt-5">
            Copyright &copy; 2026 SwitchMyLoan Pvt. Ltd. All Rights Reserved.
          </p>
        </motion.div>
      </div>
      {showNotEligible && (
        <NotEligibleScreen
          onClose={() => setShowNotEligible(false)}
          onExplore={() => {
            setShowNotEligible(false);
            if (typeof window !== "undefined") {
              window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
            }
          }}
        />
      )}

      <GradientBanner />
    </main>
  );
}