"use client";

import { motion } from "framer-motion";
import { AlertCircle, RefreshCw } from "lucide-react";
import Link from "next/link";

interface LinkExpiredProps {
  reason?: string;
}

export default function LinkExpired({ reason }: LinkExpiredProps) {
  const getMessage = () => {
    switch (reason) {
      case "expired":
        return "This link has expired. Please request a new one.";
      case "invalid":
        return "This link is invalid or has already been used.";
      case "error":
        return "Something went wrong. Please try again.";
      default:
        return "This link is no longer valid.";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[60vh] px-4"
    >
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 max-w-md w-full text-center">
        {/* Icon */}
        <div className="w-16 h-16 mx-auto mb-4 bg-red-50 rounded-full flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>

        {/* Title */}
        <h1 className="text-xl font-bold text-gray-900 mb-2">Link Expired</h1>

        {/* Message */}
        <p className="text-gray-600 text-sm mb-6">{getMessage()}</p>

        {/* Actions */}
        <div className="space-y-3">
          <Link
            href="/short-ticket"
            className="w-full flex items-center justify-center gap-2 py-3 bg-violet-600 text-white rounded-lg font-semibold hover:bg-violet-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Apply Again
          </Link>

          <Link
            href="/"
            className="w-full flex items-center justify-center py-3 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
