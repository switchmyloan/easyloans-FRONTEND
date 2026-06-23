"use client";

import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CreditCardPage from "@/components/dashboard/credit-cards/CreditCardPage";

function LoadingSpinner() {
  return (
    <div className="max-w-5xl mx-auto pt-14 lg:pt-0 flex items-center justify-center min-h-[50vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-600"></div>
    </div>
  );
}

export default function CreditCardsPage() {
  return (
    <div className="max-w-5xl mx-auto pt-2 lg:pt-0">
      {/* Back Button */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      {/* Page Content */}
      <Suspense fallback={<LoadingSpinner />}>
        <CreditCardPage />
      </Suspense>
    </div>
  );
}
