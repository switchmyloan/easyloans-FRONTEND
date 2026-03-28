"use client";

import { motion } from "framer-motion";

interface OfferCardProps {
  lenderName: string;
  lenderLogo: React.ReactNode;
  headline: string;
  description: string;
  keyFeature: string;
  interestRate: string;
  onApply: () => void;
  delay?: number;
}

export default function OfferCard({
  lenderName,
  lenderLogo,
  headline,
  description,
  keyFeature,
  interestRate,
  onApply,
  delay = 0,
}: OfferCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-white rounded-2xl border-2 border-indigo-100 shadow-md hover:shadow-lg transition-shadow overflow-hidden"
    >
      <div className="flex items-start gap-5 p-5 sm:p-6">
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-center flex-shrink-0">
          {lenderLogo}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-500">
            Lender <span className="font-semibold text-gray-800">{lenderName}</span>
          </p>
          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mt-1 leading-tight">
            {headline}
          </h3>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>
      </div>

      <div className="mx-5 sm:mx-6 border-t border-gray-100" />

      <div className="flex items-center gap-4 p-5 sm:p-6">
        <div className="flex-1">
          <p className="text-[11px] font-semibold text-indigo-500 uppercase tracking-wider mb-1">
            Key Feature
          </p>
          <p className="text-sm font-semibold text-gray-800 leading-snug">{keyFeature}</p>
        </div>
        <div className="flex-1">
          <p className="text-[11px] font-semibold text-indigo-500 uppercase tracking-wider mb-1">
            Interest Rate
          </p>
          <p className="text-sm font-semibold text-gray-800 leading-snug">{interestRate}</p>
        </div>
        <button
          onClick={onApply}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition-colors flex-shrink-0 active:scale-95 cursor-pointer"
        >
          Apply Now
        </button>
      </div>
    </motion.div>
  );
}
