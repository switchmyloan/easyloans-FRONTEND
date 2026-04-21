"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import {
  getOfferShortTicket,
  saveLender,
  type ShortTicketLender,
  type ShortTicketPayload,
  type ShortTicketResponse,
} from "@/lib/api";
import {
  getStaticLenderDetail,
  STATIC_LENDER_LOGOS,
} from "@/lib/constants";
import OfferCard from "@/components/offers/OfferCard";
import TrustBadges from "@/components/ui/TrustBadges";
import GradientBanner from "@/components/ui/GradientBanner";
import LoadingScreen from "@/components/offers/LoadingScreen";

const DISPLAY_NAMES: Record<string, string> = {
  RapidMoney: "RapidMoney",
  RamFinCorp: "RamFinCorp",
  KreditBee: "KreditBee",
  TrueBalance: "TrueBalance",
  MPokket: "MPokket",
  CreditPlus: "CreditPlus",
  Loan112: "Loan112",
};

const STATIC_ONLY_LENDERS = new Set(["RapidMoney"]);

const REQUIRED_PARAMS: (keyof ShortTicketPayload)[] = [
  "firstName",
  "lastName",
  "mobileNumber",
  "email",
  "dateOfBirth",
  "panNumber",
  "gender",
  "pincode",
  "jobType",
  "monthlySalary",
  "loanAmount",
  "loanPurpose",
];

function isEligibleLender(name: string, lender?: ShortTicketLender): boolean {
  if (!lender) return false;
  if (STATIC_ONLY_LENDERS.has(name)) return Boolean(lender.utm_link || lender.name);
  if (lender.success === false) return false;
  const msg = (lender.message || "").toLowerCase();
  if (msg.includes("rejected") || msg.includes("duplicate") || msg.includes("dedupe")) {
    return false;
  }
  if (name === "KreditBee" && lender.is_offer === false) return false;
  return lender.success === true || Boolean(lender.utm_link);
}

function extractUtmLink(lender?: ShortTicketLender): string | undefined {
  if (!lender) return undefined;
  if (typeof lender.utm_link === "string" && lender.utm_link) return lender.utm_link;
  const data = lender.data as { utm_link?: string; url?: string } | undefined;
  if (data?.utm_link) return data.utm_link;
  if (data?.url) return data.url;
  return undefined;
}

export default function ShortTicketPage() {
  const searchParams = useSearchParams();
  const [response, setResponse] = useState<ShortTicketResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const payload = useMemo<ShortTicketPayload | null>(() => {
    const missing: string[] = [];
    const get = (key: string) => (searchParams.get(key) || "").trim();

    for (const field of REQUIRED_PARAMS) {
      if (!get(field)) missing.push(field);
    }
    if (missing.length > 0) {
      setError(`Missing required parameters: ${missing.join(", ")}`);
      return null;
    }

    const jobType = get("jobType");
    const isSalariedRaw = searchParams.get("isSalaried");
    const isSalaried =
      isSalariedRaw === null
        ? jobType.toLowerCase() === "salaried"
        : isSalariedRaw === "true" || isSalariedRaw === "1";

    return {
      firstName: get("firstName"),
      lastName: get("lastName"),
      mobileNumber: get("mobileNumber"),
      email: get("email"),
      dateOfBirth: get("dateOfBirth"),
      panNumber: get("panNumber").toUpperCase(),
      gender: get("gender"),
      pincode: get("pincode"),
      jobType,
      isSalaried,
      monthlySalary: Number(get("monthlySalary")),
      loanAmount: Number(get("loanAmount")),
      loanPurpose: get("loanPurpose"),
      mrn: get("mrn") || null,
      utm_source: get("utm_source") || null,
      utm_medium: get("utm_medium") || null,
      utm_campaign: get("utm_campaign") || null,
      utm_content: get("utm_content") || null,
      utm_term: get("utm_term") || null,
    };
  }, [searchParams]);

  useEffect(() => {
    if (!payload) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    getOfferShortTicket(payload)
      .then((res) => {
        if (cancelled) return;
        setResponse(res);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err?.message || "Something went wrong. Please try again.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [payload]);

  if (loading) return <LoadingScreen />;

  if (error || !response?.data) {
    return (
      <main className="min-h-screen bg-[#f8f9fb] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-7 h-7 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            Unable to Load Offers
          </h1>
          <p className="text-gray-500 text-sm">
            {error ||
              "We couldn't fetch your offers right now. Please try again in a moment."}
          </p>
        </div>
      </main>
    );
  }

  const data = response.data;
  const priorityOrder =
    Array.isArray(data.priorityOrder) && data.priorityOrder.length > 0
      ? data.priorityOrder
      : Object.keys(data).filter(
          (k) => !["isSalaried", "priorityOrder", "staticLenders"].includes(k)
        );

  const visibleLenders = priorityOrder
    .map((name) => {
      const lender = data[name] as ShortTicketLender | undefined;
      if (!isEligibleLender(name, lender)) return null;
      if (name === "CreditPlus" && !data.isSalaried) return null;
      return { name, lender: lender! };
    })
    .filter((x): x is { name: string; lender: ShortTicketLender } => x !== null);

  const hasOffers = visibleLenders.length > 0;
  const multipleCards = visibleLenders.length > 1;

  const handleApply = async (lenderName: string, url?: string) => {
    const phone = payload?.mobileNumber || "";
    await saveLender(phone, lenderName);
    if (url) {
      window.open(url, "_blank");
    } else {
      toast.error("No application link available for this lender.", {
        duration: 3500,
      });
    }
  };

  return (
    <main className="min-h-screen bg-[#f8f9fb]">
      <Toaster position="top-center" />
      <div
        className={`mx-auto px-4 sm:px-6 py-10 sm:py-14 ${multipleCards ? "max-w-6xl" : "max-w-2xl"}`}
      >
        {/* Header */}
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
            Hi {payload?.firstName}, your offers are ready!
          </h1>
          <p className="text-gray-500 text-sm sm:text-base">
            {hasOffers
              ? "Personalized loan options curated just for you"
              : "We couldn't find offers matching your profile right now"}
          </p>
        </motion.div>

        {/* Salaried tag */}
        {data.isSalaried && hasOffers && (
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

        {/* Offer cards in priority order */}
        {hasOffers ? (
          <div
            className={
              multipleCards
                ? "grid grid-cols-1 sm:grid-cols-2 gap-4"
                : "space-y-4"
            }
          >
            {visibleLenders.map(({ name, lender }, idx) => {
              const detail = getStaticLenderDetail(name);
              const logo = STATIC_LENDER_LOGOS[name];
              const url = extractUtmLink(lender);
              const displayName = DISPLAY_NAMES[name] || name;

              return (
                <OfferCard
                  key={name}
                  lenderName={displayName}
                  compact={multipleCards}
                  logoDarkBg={logo?.darkBg}
                  lenderLogo={
                    logo ? (
                      <img
                        src={logo.src}
                        alt={displayName}
                        className="h-6 w-auto"
                      />
                    ) : (
                      <span className="text-xl font-bold text-gray-600">
                        {displayName.charAt(0)}
                      </span>
                    )
                  }
                  headline={detail.headline}
                  description={detail.description}
                  keyFeature={detail.keyFeature}
                  interestRate={detail.interestRate}
                  onApply={() => handleApply(name, url)}
                  delay={0.2 + idx * 0.08}
                  recommended={idx === 0}
                />
              );
            })}
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
            <p className="text-gray-500 text-sm">
              No eligible lenders returned for your profile. Please try again
              later or reach out to support.
            </p>
          </div>
        )}

        {/* Static lenders fallback row (if returned separately) */}
        {data.staticLenders && data.staticLenders.length > 0 && !hasOffers && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {data.staticLenders.map((lender, i) => {
              const detail = getStaticLenderDetail(lender.name);
              const logo = STATIC_LENDER_LOGOS[lender.name];
              return (
                <OfferCard
                  key={lender.name}
                  lenderName={DISPLAY_NAMES[lender.name] || lender.name}
                  compact={data.staticLenders.length > 1}
                  logoDarkBg={logo?.darkBg}
                  lenderLogo={
                    logo ? (
                      <img
                        src={logo.src}
                        alt={lender.name}
                        className="h-6 w-auto"
                      />
                    ) : (
                      <span className="text-xl font-bold text-gray-600">
                        {lender.name.charAt(0)}
                      </span>
                    )
                  }
                  headline={detail.headline}
                  description={detail.description}
                  keyFeature={detail.keyFeature}
                  interestRate={detail.interestRate}
                  onApply={() => handleApply(lender.name, lender.utm_link)}
                  delay={0.2 + i * 0.08}
                />
              );
            })}
          </div>
        )}

        {/* Footer */}
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

      <GradientBanner />
    </main>
  );
}
