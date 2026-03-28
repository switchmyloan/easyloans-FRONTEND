"use client";

import { motion } from "framer-motion";
import { OFFERS } from "@/lib/constants";
import OfferCard from "./OfferCard";

export default function SuccessScreen() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="py-4"
    >
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </motion.div>
        <h2 className="text-2xl font-bold text-gray-900 mb-1">Congratulations!</h2>
        <p className="text-gray-500">You have offers from our lending partners</p>
      </div>

      <div className="space-y-4">
        {OFFERS.map((offer, i) => (
          <OfferCard
            key={offer.lenderName}
            lenderName={offer.lenderName}
            lenderLogo={
              <img src={offer.logo} alt={offer.lenderName} className="h-7 w-auto" />
            }
            headline={offer.headline}
            description={offer.description}
            keyFeature={offer.keyFeature}
            interestRate={offer.interestRate}
            onApply={() => console.log(`Apply ${offer.lenderName}`)}
            delay={0.3 + i * 0.2}
          />
        ))}
      </div>
    </motion.div>
  );
}
