"use client";

import { motion } from "framer-motion";
import LoanOffersBanner, { type PreviousLender } from "./LoanOffersBanner";

interface DashboardHeaderProps {
  firstName?: string;
  previousLenders?: PreviousLender[];
  newOffersCount?: number;
}

export default function DashboardHeader({
  firstName,
  previousLenders = [],
  newOffersCount = 0,
}: DashboardHeaderProps) {
  const displayName = firstName
    ? firstName.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
    : "User";

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4"
      >
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          Welcome back,{" "}
          <span className="bg-gradient-to-r from-violet-600 to-purple-500 bg-clip-text text-transparent">
            {displayName}
          </span>
          ! 👋
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Here are your personalized loan offers
        </p>
      </motion.div>

      <LoanOffersBanner
        previousLenders={previousLenders}
        newOffersCount={newOffersCount}
      />
    </div>
  );
}
