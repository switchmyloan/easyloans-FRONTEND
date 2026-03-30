"use client";

import { useState, useEffect } from "react";
import { OFFERS, getStaticLenderDetail, STATIC_LENDER_LOGOS, getEligibleCoupon, type KBCoupon } from "@/lib/constants";
import { getStoredOffers, type StaticLender } from "@/lib/api";
import OfferCard from "@/components/offers/OfferCard";
import ScratchCoupon from "@/components/offers/ScratchCoupon";
import TrustBadges from "@/components/ui/TrustBadges";
import { motion } from "framer-motion";

export default function OffersPage() {
  const [showScratch, setShowScratch] = useState(false);
  const [coupon, setCoupon] = useState<KBCoupon | null>(null);
  const [showKB, setShowKB] = useState(false);
  const [showMV, setShowMV] = useState(false);
  const [kbUtmLink, setKbUtmLink] = useState<string | undefined>();
  const [mvUtmLink, setMvUtmLink] = useState<string | undefined>();
  const [staticLenders, setStaticLenders] = useState<StaticLender[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const response = getStoredOffers();
    if (response?.data) {
      const kbMsg = (response.data.KreditBee?.message || "").toLowerCase();
      const mvMsg = (response.data.MoneyView?.message || "").toLowerCase();
      const isRejected = (msg: string) =>
        msg.includes("rejected") || msg.includes("dedupe") || msg.includes("duplicate");
      const kbHasOffer = !isRejected(kbMsg);
      const mvHasOffer = !isRejected(mvMsg);

      if (kbHasOffer || mvHasOffer) {
        setShowKB(kbHasOffer);
        setShowMV(mvHasOffer);
        if (kbHasOffer) setKbUtmLink(response.data.KreditBee?.utm_link);
        if (mvHasOffer) setMvUtmLink(response.data.MoneyView?.utm_link);
      } else {
        // Both not offered — show static lenders
        setStaticLenders(response.data.staticLenders || []);
      }
    } else {
      // No API response — show both as fallback
      setShowKB(true);
      setShowMV(true);
    }
    // Pick a profile-based KreditBee coupon
    const profile = sessionStorage.getItem("userProfile") || "Salaried";
    setCoupon(getEligibleCoupon(profile));

    setLoaded(true);
  }, []);

  if (!loaded) return null;

  const kbOffer = OFFERS.find((o) => o.lenderName === "KreditBee")!;
  const mvOffer = OFFERS.find((o) => o.lenderName === "MoneyView")!;
  const showStaticOnly = !showKB && !showMV && staticLenders.length > 0;

  const handleApply = (url?: string) => {
    if (url) window.open(url, "_blank");
  };

  return (
    <main className="min-h-screen bg-[#f8f9fb]">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
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

        {/* KreditBee & MoneyView offer cards */}
        {(showKB || showMV) && (
          <div className="space-y-4">
            {showKB && (
              <OfferCard
                lenderName={kbOffer.lenderName}
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
                onApply={() => handleApply(kbUtmLink || "https://www.kreditbee.in/")}
                delay={0.3}
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
            {showMV && (
              <OfferCard
                lenderName={mvOffer.lenderName}
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
                onApply={() => handleApply(mvUtmLink || "https://moneyview.in/")}
                delay={showKB ? 0.45 : 0.3}
              />
            )}
          </div>
        )}

        {/* Static lenders fallback */}
        {showStaticOnly && (
          <div className="space-y-4">
            {staticLenders.map((lender, i) => {
              const detail = getStaticLenderDetail(lender.name);
              const logo = STATIC_LENDER_LOGOS[lender.name];
              return (
                <OfferCard
                  key={lender.name}
                  lenderName={lender.name}
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
                  onApply={() => window.open(lender.utm_link, "_blank")}
                  delay={0.2 + i * 0.1}
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
            Copyright &copy; 2025 SwitchMyLoan Pvt. Ltd. All Rights Reserved.
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
    </main>
  );
}
