"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { OFFERS, getStaticLenderDetail, STATIC_LENDER_LOGOS, getEligibleCoupon, LENDER_MAX_AMOUNT, type KBCoupon } from "@/lib/constants";
import { getStoredOffers, getStoredMrn, saveLender, applyToKreditBee, applyToMoneyView, type StaticLender, type LenderResponse } from "@/lib/api";
import OfferCard from "@/components/offers/OfferCard";
import ScratchCoupon from "@/components/offers/ScratchCoupon";
import TrustBadges from "@/components/ui/TrustBadges";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import GradientBanner from "@/components/ui/GradientBanner";

const DISPLAY_NAMES: Record<string, string> = {
  poonawalla: "Poonawalla",
  // SmartCoinHighIntent: "SmartCoin",
  Zype_Dedupe: "Zype",
  UnitySmallFinanceBank: "Unity Small Finance Bank",
};

const UNITY_BASE_URL =
  "https://loans.theunitybank.com/unity-pl-ui/page/exclusion/login/logindetails?utm_source=partnership&utm_medium=switchmyloan&utm_campaign=";

function buildUnityUtmLink(mrn: string | null): string {
  return `${UNITY_BASE_URL}${encodeURIComponent(mrn || "partner")}`;
}

export default function OffersPage() {
  const router = useRouter();
  const [showScratch, setShowScratch] = useState(false);
  const [coupon, setCoupon] = useState<KBCoupon | null>(null);
  const [showKB, setShowKB] = useState(false);
  const [showMV, setShowMV] = useState(false);
  const [showPoonawalla, setShowPoonawalla] = useState(false);
  const [showZype, setShowZype] = useState(false);
  const [showTB, setShowTB] = useState(false);
  const [isSalaried, setIsSalaried] = useState(false);
  const [kbUtmLink, setKbUtmLink] = useState<string | undefined>();
  const [mvUtmLink, setMvUtmLink] = useState<string | undefined>();
  const [poonawallaUtmLink, setPoonawallaUtmLink] = useState<string | undefined>();
  const [zypeUtmLink, setZypeUtmLink] = useState<string | undefined>();
  const [tbUtmLink, setTbUtmLink] = useState<string | undefined>();
  const [staticLenders, setStaticLenders] = useState<StaticLender[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [showAllOffers, setShowAllOffers] = useState(false);
  const [filterAmount, setFilterAmount] = useState<number>(0); // auto-set from Stage1 loan_amount
  const [kbApplying, setKbApplying] = useState(false);
  const [mvApplying, setMvApplying] = useState(false);

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

      // Track salaried status from API response
      setIsSalaried(response.data.isSalaried === true);

      // Promote Zype_Dedupe as a top-level card — always show when present (only returned for salaried users)
      const zyp = response.data.Zype_Dedupe;
      if (zyp) {
        setShowZype(true);
        setZypeUtmLink(zyp.utm_link || "https://zype.co.in/");
      }

      // Promote TrueBalance as a top-level card only for salaried users
      const tb = response.data.TrueBalance;
      const tbEligible = tb && isTrueBalanceEligible(tb);
      if (tbEligible && response.data.isSalaried === true) {
        setShowTB(true);
        setTbUtmLink(tb.utm_link || "https://truebalance.io/");
      }

      // Only include extra lenders (excluding promoted ones) if their offer is approved
      const extras: StaticLender[] = [];
      // For self-employed, keep TrueBalance in the static grid
      if (tbEligible && response.data.isSalaried !== true) {
        extras.push({ name: "TrueBalance", utm_link: tb.utm_link || "https://truebalance.io/" });
      }
      // Always include Unity Small Finance Bank — UTM campaign carries the user's MRN
      extras.push({
        name: "UnitySmallFinanceBank",
        utm_link: buildUnityUtmLink(getStoredMrn()),
      });
      const extraKeys: { key: string; fallback: string }[] = [
        // { key: "SmartCoinHighIntent", fallback: "https://olyv.com/" },
      ];
      for (const { key, fallback } of extraKeys) {
        const lenderData = response.data[key as keyof typeof response.data] as LenderResponse | undefined;
        if (!lenderData) continue;
        if (isApprovedOffer(lenderData)) {
          extras.push({ name: key, utm_link: lenderData.utm_link || fallback });
        }
      }

      // Always show KreditBee offer
      setShowKB(true);
      if (kbHasOffer) setKbUtmLink(response.data.KreditBee?.utm_link);

      // Show MoneyView when approved, or when salaried and present in response —
      // but never when the lead was rejected or is a duplicate.
      const mvMessage = (response.data.MoneyView?.message || "").toLowerCase();
      const mvRejected = mvMessage.includes("rejected") || mvMessage.includes("duplicate") || mvMessage.includes("dedupe");
      if (!mvRejected && (mvHasOffer || (response.data.isSalaried === true && response.data.MoneyView))) {
        setShowMV(true);
        setMvUtmLink(response.data.MoneyView?.utm_link);
      }

      // Merge and sort all static lenders by priority
      const LENDER_ORDER = [
        "poonawalla",
        "HeroFinCorp",
        "TrueBalance",
        // "SmartCoinHighIntent",
        "RapidMoney",
      ];
      const allStatic = [...(response.data.staticLenders || []), ...extras];
      allStatic.sort((a, b) => {
        const ai = LENDER_ORDER.indexOf(a.name);
        const bi = LENDER_ORDER.indexOf(b.name);
        return (ai === -1 ? LENDER_ORDER.length : ai) - (bi === -1 ? LENDER_ORDER.length : bi);
      });
      // Load user's requested loan amount for filtering
      const storedAmount = Number(sessionStorage.getItem("userLoanAmount") || "0");
      if (storedAmount > 0) setFilterAmount(storedAmount);

      // Promote Poonawalla when salaried (part of salaried sequence) or loan amount > 50k
      const shouldPromotePoonawalla = response.data.isSalaried === true || storedAmount > 50000;
      if (shouldPromotePoonawalla) {
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
  const zypeDetail = getStaticLenderDetail("Zype_Dedupe");
  const zypeLogo = STATIC_LENDER_LOGOS["Zype_Dedupe"];
  const tbDetail = getStaticLenderDetail("TrueBalance");
  const tbLogo = STATIC_LENDER_LOGOS["TrueBalance"];
  const hasStaticLenders = staticLenders.length > 0;
  const hasPromotedCards = showKB || showMV || showPoonawalla || showZype || showTB;
  const showStaticOnly = !hasPromotedCards && hasStaticLenders;

  // Sort static lenders by filter amount priority:
  // Lenders whose max amount >= filterAmount come first, sorted by closest match
  // Lenders whose max amount < filterAmount go below
  // For loan amounts > 50k, Poonawalla is placed second among eligible lenders
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
  const promotedCount = (showKB ? 1 : 0) + (showZype ? 1 : 0) + (showPoonawalla ? 1 : 0) + (showTB ? 1 : 0) + (showMV ? 1 : 0);
  const totalCards = promotedCount + sortedStaticLenders.length;
  const multipleCards = totalCards > 1;

  const handleApply = async (lenderName: string, url?: string) => {
    const phone = sessionStorage.getItem("userPhone") || "";
    console.log("handleApply called:", { lenderName, phone, url });
    await saveLender(phone, lenderName);
    if (url) window.open(url, "_blank");
  };

  const handleKreditBeeApply = async () => {
    setKbApplying(true);
    try {
      const phone = sessionStorage.getItem("userPhone") || "";
      await saveLender(phone, "KreditBee");
      const res = await applyToKreditBee();
      console.log("KreditBee apply response:", res);

      const kbMessage = res.data?.KreditBee?.message || "";
      const isApproved = kbMessage.toLowerCase().includes("approved");
      const isDuplicate = kbMessage.toLowerCase().includes("duplicate");
      const isRejected = kbMessage.toLowerCase().includes("rejected");

      if (isApproved && !isDuplicate && !isRejected) {
        const url = kbUtmLink || "https://kredt.be/3ZFfVbz";
        window.open(url, "_blank");
      } else {
        toast.error(kbMessage || "Your application was not approved.", {
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

  const handleMoneyViewApply = async () => {
    setMvApplying(true);
    try {
      const phone = sessionStorage.getItem("userPhone") || "";
      await saveLender(phone, "MoneyView");
      const res = await applyToMoneyView();
      console.log("MoneyView apply response:", res);

      const mvMessage = res.data?.MoneyView?.message || "";
      const isApproved = mvMessage.toLowerCase().includes("approved");
      const isDuplicate = mvMessage.toLowerCase().includes("duplicate");
      const isRejected = mvMessage.toLowerCase().includes("rejected");

      if (isApproved && !isDuplicate && !isRejected) {
        const url = mvUtmLink || "https://moneyview.in/";
        window.open(url, "_blank");
      } else {
        toast.error(mvMessage || "Your application was not approved.", {
          duration: 5000,
          style: { maxWidth: 400 },
        });
      }
    } catch (err) {
      console.error("MoneyView apply failed:", err);
      toast.error("Something went wrong. Please try again.", { duration: 4000 });
    } finally {
      setMvApplying(false);
    }
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

        {/* Salaried profile label */}
        {isSalaried && hasPromotedCards && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-4"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-lg border border-emerald-200">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Best Lenders for Salaried Professionals
            </span>
          </motion.div>
        )}

        {/* Promoted offer cards — Order: KreditBee, Zype, Poonawalla, TrueBalance, MoneyView */}
        {hasPromotedCards && (
          <div className={promotedCount > 1 ? "grid grid-cols-1 sm:grid-cols-2 gap-4" : "space-y-4"}>
            {/* KreditBee */}
            {showKB && (
              <OfferCard
                key="KreditBee"
                lenderName={kbOffer.lenderName}
                compact={promotedCount > 1}
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
                onApply={handleKreditBeeApply}
                applying={kbApplying}
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
            {/* Zype — only present when isSalaried */}
            {showZype && (
              <OfferCard
                key="Zype"
                lenderName="Zype"
                compact={promotedCount > 1}
                logoDarkBg={zypeLogo?.darkBg}
                lenderLogo={
                  zypeLogo ? (
                    <img src={zypeLogo.src} alt="Zype" className="h-6 w-auto" />
                  ) : (
                    <span className="text-xl font-bold text-gray-600">Z</span>
                  )
                }
                headline={zypeDetail.headline}
                description={zypeDetail.description}
                keyFeature={zypeDetail.keyFeature}
                interestRate={zypeDetail.interestRate}
                onApply={() => handleApply("Zype_Dedupe", zypeUtmLink)}
                delay={0.35}
                recommended
              />
            )}
            {/* Poonawalla */}
            {showPoonawalla && (
              <OfferCard
                key="Poonawalla"
                lenderName="Poonawalla"
                compact={promotedCount > 1}
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
            {/* TrueBalance */}
            {showTB && (
              <OfferCard
                key="TrueBalance"
                lenderName="TrueBalance"
                compact={promotedCount > 1}
                logoDarkBg={tbLogo?.darkBg}
                lenderLogo={
                  tbLogo ? (
                    <img src={tbLogo.src} alt="TrueBalance" className="h-6 w-auto" />
                  ) : (
                    <span className="text-xl font-bold text-gray-600">T</span>
                  )
                }
                headline={tbDetail.headline}
                description={tbDetail.description}
                keyFeature={tbDetail.keyFeature}
                interestRate={tbDetail.interestRate}
                onApply={() => handleApply("TrueBalance", tbUtmLink)}
                delay={0.45}
                recommended
              />
            )}
            {/* MoneyView */}
            {showMV && (
              <OfferCard
                key="MoneyView"
                lenderName={mvOffer.lenderName}
                compact={promotedCount > 1}
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
                onApply={handleMoneyViewApply}
                applying={mvApplying}
                delay={0.5}
                recommended
              />
            )}
          </div>
        )}

        {/* Static / extra lenders */}
        {hasStaticLenders && (
          <>
            {/* Show "View All Offers" button when promoted cards are visible */}
            {hasPromotedCards && !showAllOffers && (
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
