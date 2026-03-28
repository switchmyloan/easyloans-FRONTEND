"use client";

import { useState } from "react";
import { OFFERS } from "@/lib/constants";
import OfferCard from "@/components/offers/OfferCard";
import ScratchCoupon from "@/components/offers/ScratchCoupon";
import TrustBadges from "@/components/ui/TrustBadges";
import { motion } from "framer-motion";

export default function OffersPage() {
  const [showScratch, setShowScratch] = useState(false);

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
            Here are personalized offers from our lending partners
          </p>
        </motion.div>

        {/* Cards */}
        <div className="space-y-4">
          {OFFERS.map((offer, i) => (
            <OfferCard
              key={offer.lenderName}
              lenderName={offer.lenderName}
              lenderLogo={
                <img
                  src={offer.logo}
                  alt={offer.lenderName}
                  className="h-6 w-auto"
                />
              }
              headline={offer.headline}
              description={offer.description}
              keyFeature={offer.keyFeature}
              interestRate={offer.interestRate}
              onApply={() => console.log(`Apply ${offer.lenderName}`)}
              delay={0.3 + i * 0.15}
              badge={
                offer.lenderName === "KreditBee" ? (
                  <button
                    onClick={() => setShowScratch(true)}
                    className="scratch-badge bg-indigo-600 text-white text-[11px] font-semibold px-3 py-1.5 rounded-lg cursor-pointer flex items-center gap-1.5 hover:bg-indigo-700 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                    </svg>
                    Scratch & Win
                  </button>
                ) : undefined
              }
            />
          ))}
        </div>

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

      {showScratch && (
        <ScratchCoupon
          discount="-50%"
          description="50% off processing fee! Use code at checkout. Offer valid until January 1, 2025. Apply now!"
          couponCode="KREDITBEE50OFF"
          onClose={() => setShowScratch(false)}
        />
      )}
    </main>
  );
}
