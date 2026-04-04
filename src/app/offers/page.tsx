"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { OFFERS, getStaticLenderDetail, STATIC_LENDER_LOGOS, getEligibleCoupon, LENDER_MAX_AMOUNT, type KBCoupon } from "@/lib/constants";
import { getStoredOffers, saveLender, type StaticLender, type LenderResponse } from "@/lib/api";
import OfferCard from "@/components/offers/OfferCard";
import ScratchCoupon from "@/components/offers/ScratchCoupon";
import TrustBadges from "@/components/ui/TrustBadges";
import { motion } from "framer-motion";
import GradientBanner from "@/components/ui/GradientBanner";

const DISPLAY_NAMES: Record<string, string> = {
  poonawalla: "Poonawalla",
  SmartCoinHighIntent: "SmartCoin",
  Zype_Dedupe: "Zype",
};

export default function OffersPage() {
  const router = useRouter();
  const [showScratch, setShowScratch] = useState(false);
  const [coupon, setCoupon] = useState<KBCoupon | null>(null);
  const [showKB, setShowKB] = useState(false);
  const [showMV, setShowMV] = useState(false);
  const [showPoonawalla, setShowPoonawalla] = useState(false);
  const [kbUtmLink, setKbUtmLink] = useState<string | undefined>();
  const [mvUtmLink, setMvUtmLink] = useState<string | undefined>();
  const [poonawallaUtmLink, setPoonawallaUtmLink] = useState<string | undefined>();
  const [staticLenders, setStaticLenders] = useState<StaticLender[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [showAllOffers, setShowAllOffers] = useState(false);
  const [filterAmount, setFilterAmount] = useState<number>(0); // auto-set from Stage1 loan_amount

  useEffect(() => {
    const response = getStoredOffers();
    if (response?.data) {
      // Only show offers that are truly successful and approved
      const isApprovedOffer = (lender?: { success?: boolean; message?: string; isDuplicate?: boolean }) => {
        if (!lender || !lender.success) return false;
        const msg = (lender.message || "").toLowerCase();
        if (msg.includes("rejected") || msg.includes("duplicate") || msg.includes("dedupe") || msg.includes("repeat")) return false;
        if (lender.isDuplicate) return false;
        // Must contain positive indicators (approved/eligible/success)
        return msg.includes("approved") || msg.includes("eligible") || msg.includes("success");
      };
      const kbHasOffer = isApprovedOffer(response.data.KreditBee);
      const mvHasOffer = isApprovedOffer(response.data.MoneyView);

      // Check TrueBalance eligibility from nested response data
      const isTrueBalanceEligible = (lender?: LenderResponse) => {
        if (!lender) return false;
        const resData = (lender.data as { response?: { data?: { isEligible?: boolean } } })?.response?.data;
        return resData?.isEligible === true;
      };

      // Only include extra lenders if their offer is approved (not duplicate/rejected)
      const extras: StaticLender[] = [];
      const extraKeys: { key: string; fallback: string }[] = [
        { key: "SmartCoinHighIntent", fallback: "https://olyv.com/" },
        { key: "TrueBalance", fallback: "https://truebalance.io/" },
        { key: "Zype_Dedupe", fallback: "https://zype.co.in/" },
      ];
      for (const { key, fallback } of extraKeys) {
        const lenderData = response.data[key as keyof typeof response.data] as LenderResponse | undefined;
        if (!lenderData) continue;
        const isEligible = key === "TrueBalance"
          ? isTrueBalanceEligible(lenderData)
          : isApprovedOffer(lenderData);
        if (isEligible) {
          extras.push({ name: key, utm_link: lenderData.utm_link || fallback });
        }
      }

      // Always show KreditBee offer
      setShowKB(true);
      if (kbHasOffer) setKbUtmLink(response.data.KreditBee?.utm_link);

      if (mvHasOffer) {
        setShowMV(true);
        setMvUtmLink(response.data.MoneyView?.utm_link);
      }

      // Merge and sort all static lenders by priority
      const LENDER_ORDER = [
        "poonawalla",
        "HeroFinCorp",
        "SmartCoinHighIntent",
        "Zype_Dedupe",
        "TrueBalance",
        "RapidMoney",
      ];
      const allStatic = [...(response.data.staticLenders || []), ...extras];
      allStatic.sort((a, b) => {
        const ai = LENDER_ORDER.indexOf(a.name);
        const bi = LENDER_ORDER.indexOf(b.name);
        // Known lenders first in defined order, unknown lenders at the end
        return (ai === -1 ? LENDER_ORDER.length : ai) - (bi === -1 ? LENDER_ORDER.length : bi);
      });
      // Load user's requested loan amount for filtering
      const storedAmount = Number(sessionStorage.getItem("userLoanAmount") || "0");
      if (storedAmount > 0) setFilterAmount(storedAmount);

      // Extract Poonawalla to show beside KreditBee in top row only if loan amount > 2 Lac
      if (storedAmount > 200000) {
        const poonawallaEntry = allStatic.find((l) => l.name === "poonawalla");
        if (poonawallaEntry) {
          setShowPoonawalla(true);
          setPoonawallaUtmLink(poonawallaEntry.utm_link);
        }
        const remainingStatic = allStatic.filter((l) => l.name !== "poonawalla");
        if (remainingStatic.length > 0) {
          setStaticLenders(remainingStatic);
        }
      } else {
        // Keep Poonawalla in static lenders section
        if (allStatic.length > 0) {
          setStaticLenders(allStatic);
        }
      }
    } else {
      // No API response — user hasn't completed the form, redirect to home
      router.replace("/");
      return;
    }
    // Pick a profile-based KreditBee coupon
    const profile = sessionStorage.getItem("userProfile") || "Salaried";
    setCoupon(getEligibleCoupon(profile));

    setLoaded(true);
  }, []);

  if (!loaded) return null;

  const kbOffer = OFFERS.find((o) => o.lenderName === "KreditBee")!;
  const mvOffer = OFFERS.find((o) => o.lenderName === "MoneyView")!;
  const poonawallaDetail = getStaticLenderDetail("poonawalla");
  const poonawallaLogo = STATIC_LENDER_LOGOS["poonawalla"];
  const hasStaticLenders = staticLenders.length > 0;
  const showStaticOnly = !showKB && !showMV && !showPoonawalla && hasStaticLenders;

  // Sort static lenders by filter amount priority:
  // Lenders whose max amount >= filterAmount come first, sorted by closest match
  // Lenders whose max amount < filterAmount go below
  // For loan amounts > 2 Lac, Poonawalla is placed second among eligible lenders
  const sortedStaticLenders = [...staticLenders].sort((a, b) => {
    if (filterAmount <= 0) return 0; // no filter, keep original order
    const maxA = LENDER_MAX_AMOUNT[a.name] ?? Infinity;
    const maxB = LENDER_MAX_AMOUNT[b.name] ?? Infinity;
    const aCovers = maxA >= filterAmount;
    const bCovers = maxB >= filterAmount;
    // Lenders that cover the amount come first
    if (aCovers && !bCovers) return -1;
    if (!aCovers && bCovers) return 1;
    // Among those that cover, sort by closest max (smaller max = better fit)
    if (aCovers && bCovers) return maxA - maxB;
    // Among those that don't cover, sort by largest max first
    return maxB - maxA;
  });

  // Poonawalla is now shown in top row beside KreditBee, no need to reposition in static list

  // Also determine KB/MV priority based on filter
  const kbCovers = filterAmount > 0 ? (LENDER_MAX_AMOUNT["KreditBee"] ?? Infinity) >= filterAmount : true;
  const mvCovers = filterAmount > 0 ? (LENDER_MAX_AMOUNT["MoneyView"] ?? Infinity) >= filterAmount : true;

  // Decide if we need wider container for grid
  const totalCards = (showKB ? 1 : 0) + (showMV ? 1 : 0) + (showPoonawalla ? 1 : 0) + sortedStaticLenders.length;
  const multipleCards = totalCards > 1;

  const handleApply = async (lenderName: string, url?: string) => {
    const phone = sessionStorage.getItem("userPhone") || "";
    console.log("handleApply called:", { lenderName, phone, url });
    await saveLender(phone, lenderName);
    if (url) window.open(url, "_blank");
  };

  return (
    <main className="min-h-screen bg-[#f8f9fb]">
      <div className={`mx-auto px-4 sm:px-6 py-10 sm:py-14 ${multipleCards ? "max-w-6xl" : "max-w-2xl"}`}>
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
            You&apos;re all set!
          </h1>
          <p className="text-gray-500 text-sm sm:text-base">
            {showStaticOnly
              ? "Explore loan options from our partner lenders"
              : "Here are personalized offers from our lending partners"}
          </p>
        </motion.div>

        {/* KreditBee, Poonawalla & MoneyView offer cards */}
        {(showKB || showMV || showPoonawalla) && (
          <div className={(showKB ? 1 : 0) + (showPoonawalla ? 1 : 0) + (showMV ? 1 : 0) > 1 ? "grid grid-cols-1 sm:grid-cols-2 gap-4" : "space-y-4"}>
            {/* KreditBee */}
            {showKB && (
              <OfferCard
                key="KreditBee"
                lenderName={kbOffer.lenderName}
                compact={(showKB ? 1 : 0) + (showPoonawalla ? 1 : 0) + (showMV ? 1 : 0) > 1}
                lenderLogo={
                  <img
                    src={kbOffer.logo}
                    alt={kbOffer.lenderName}
                    className="h-6 w-auto"
                  />
                }
                headline={kbOffer.headline}
                description={kbOffer.description}
                keyFeature={kbOffer.keyFeature}
                interestRate={kbOffer.interestRate}
                onApply={() => handleApply("KreditBee", kbUtmLink || "https://kredt.be/3ZFfVbz")}
                delay={0.3}
                recommended
                badge={
                  <button
                    onClick={() => setShowScratch(true)}
                    className="scratch-badge bg-indigo-600 text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg cursor-pointer flex items-center gap-1.5 hover:bg-indigo-700 transition-colors"
                  >
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
                        d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                      />
                    </svg>
                    Scratch & Win
                  </button>
                }
              />
            )}
            {/* Poonawalla - beside KreditBee */}
            {showPoonawalla && (
              <OfferCard
                key="Poonawalla"
                lenderName="Poonawalla"
                compact={(showKB ? 1 : 0) + (showPoonawalla ? 1 : 0) + (showMV ? 1 : 0) > 1}
                logoDarkBg={poonawallaLogo?.darkBg}
                lenderLogo={
                  poonawallaLogo ? (
                    <img src={poonawallaLogo.src} alt="Poonawalla" className="h-6 w-auto" />
                  ) : (
                    <span className="text-xl font-bold text-gray-600">P</span>
                  )
                }
                headline={poonawallaDetail.headline}
                description={poonawallaDetail.description}
                keyFeature={poonawallaDetail.keyFeature}
                interestRate={poonawallaDetail.interestRate}
                onApply={() => handleApply("poonawalla", poonawallaUtmLink)}
                delay={0.4}
                recommended
              />
            )}
            {/* MoneyView */}
            {showMV && (
              <OfferCard
                key="MoneyView"
                lenderName={mvOffer.lenderName}
                compact={(showKB ? 1 : 0) + (showPoonawalla ? 1 : 0) + (showMV ? 1 : 0) > 1}
                lenderLogo={
                  <img
                    src={mvOffer.logo}
                    alt={mvOffer.lenderName}
                    className="h-6 w-auto"
                  />
                }
                headline={mvOffer.headline}
                description={mvOffer.description}
                keyFeature={mvOffer.keyFeature}
                interestRate={mvOffer.interestRate}
                onApply={() => handleApply("MoneyView", mvUtmLink || "https://moneyview.in/")}
                delay={showKB ? 0.5 : 0.3}
                recommended
              />
            )}
          </div>
        )}

        {/* Static / extra lenders */}
        {hasStaticLenders && (
          <>
            {/* Show "View All Offers" button when KB or MV is visible */}
            {(showKB || showMV || showPoonawalla) && !showAllOffers && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex justify-center mt-6"
              >
                <button
                  onClick={() => setShowAllOffers(true)}
                  className="px-6 py-3 bg-white border border-gray-200 hover:border-gray-300 text-gray-700 text-sm font-semibold rounded-xl shadow-sm hover:shadow-md transition-all active:scale-[0.97] cursor-pointer flex items-center gap-2"
                >
                  View All Offers
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </motion.div>
            )}

            {/* Show static lenders: always if no KB/MV, or after clicking "View All Offers" */}
            {(showStaticOnly || showAllOffers) && (
              <div className={sortedStaticLenders.length > 1 ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4" : "space-y-4 mt-4"}>
                {sortedStaticLenders.map((lender, i) => {
                  const detail = getStaticLenderDetail(lender.name);
                  const logo = STATIC_LENDER_LOGOS[lender.name];
                  return (
                    <OfferCard
                      key={lender.name}
                      lenderName={DISPLAY_NAMES[lender.name] || lender.name}
                      compact={sortedStaticLenders.length > 1}
                      logoDarkBg={logo?.darkBg}
                      lenderLogo={
                        logo ? (
                          <img src={logo.src} alt={lender.name} className="h-6 w-auto" />
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
                      delay={0.2 + i * 0.1}
                    />
                  );
                })}
              </div>
            )}
          </>
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

      {showScratch && coupon && (
        <ScratchCoupon
          discount={coupon.discount}
          description={coupon.description}
          couponCode={coupon.code}
          onClose={() => setShowScratch(false)}
        />
      )}


      <GradientBanner />
    </main>
  );
}
