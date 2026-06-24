"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

export default function RingImageSection() {
  return (
    <div
      className="hidden lg:flex items-center justify-center px-4 relative"
      style={{ width: "380px", height: "280px" }}
    >
      {/* Floating message bubble - Top Right */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="absolute top-2 right-20 bg-white rounded-xl px-3 py-2 shadow-lg border border-gray-100 z-10"
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-violet-100 rounded-full flex items-center justify-center">
            <span className="text-violet-600 text-xs">💬</span>
          </div>
          <span className="text-[8px] font-medium text-gray-700">
            You&apos;re just few
            <br />
            steps away!
          </span>
        </div>
      </motion.div>

      {/* Floating message bubble - Left */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
        className="absolute left-6 top-1/3 bg-white rounded-xl px-3 py-2 shadow-lg border border-gray-100 z-10"
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-3.5 h-3.5 text-green-600" />
          </div>
          <span className="text-[8px] font-medium text-gray-700">
            Quick process,
            <br />
            Zero hassle
          </span>
        </div>
      </motion.div>

      {/* Floating message bubble - Right */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        className="absolute right-6 bottom-30 bg-white rounded-xl px-3 py-2 shadow-lg border border-gray-100 z-10"
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-violet-100 rounded-full flex items-center justify-center">
            <svg
              className="w-3.5 h-3.5 text-violet-600"
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
          </div>
          <span className="text-[8px] font-medium text-gray-700">
            Trusted by 65L+
            <br />
            customers
          </span>
        </div>
      </motion.div>

      {/* Center R Ring Image */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
        className="relative"
      >
        <Image
          src="/R-ring.png"
          alt="Loan offers"
          width={600}
          height={600}
          className="object-contain"
        />
      </motion.div>
    </div>
  );
}
