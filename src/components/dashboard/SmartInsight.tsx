"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Lightbulb } from "lucide-react";
import { getStoredShortExistingUserOffers } from "@/lib/api";

// ============================================================
// SmartInsight Component
// ============================================================
export default function SmartInsight() {
  const [offersCount, setOffersCount] = useState(0);

  useEffect(() => {
    const existingUserData = getStoredShortExistingUserOffers();
    const userExists = existingUserData?.data?.found || existingUserData?.data?.exists;

    if (userExists && existingUserData?.data) {
      const data = existingUserData.data;

      // Count from shownOffers array - these are the actual offers shown to the user
      const shownOffers = data.shownOffers || [];
      setOffersCount(shownOffers.length);
    }
  }, []);

  if (offersCount === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 h-full flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
          <Lightbulb className="w-4 h-4 text-green-600" />
        </div>
        <h3 className="text-sm font-semibold text-gray-900">Smart Insight</h3>
      </div>

      {/* Content */}
      <p className="text-xs text-gray-600 leading-relaxed flex-1">
        Since your last visit,{" "}
        <span className="font-semibold text-gray-800">{offersCount} additional lenders</span>{" "}
        have become available for your profile. These offers may have lower processing fees and faster approvals.
      </p>

      {/* CTA Link */}
      <Link
        href="/dashboard/offers"
        className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 hover:text-green-700 mt-4 transition-colors"
      >
        See New Offers
        <span className="text-base">→</span>
      </Link>
    </motion.div>
  );
}
