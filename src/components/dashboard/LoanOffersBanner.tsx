"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Gift, Sparkle, Sparkles } from "lucide-react";
import { STATIC_LENDER_LOGOS } from "@/lib/constants";
import { getStoredShortExistingUserOffers } from "@/lib/api";

// ============================================================
// Types
// ============================================================
export interface PreviousLender {
  id: string;
  name: string;
  prefix: string;
}

interface SelectedLender {
  lenderName: string;
  createdAt?: string;
  status?: string | null;
  mrn?: string;
}

interface ShownOffer {
  lenderName: string;
  section?: string;
  utmLink?: string | null;
}

// ============================================================
// Constants
// ============================================================
const DEFAULT_MATCH_PERCENTAGE = 92;

// ============================================================
// Utility Functions
// ============================================================
function mapSelectedLenderToPreviousLender(selected: SelectedLender): PreviousLender {
  return {
    id: selected.lenderName,
    name: selected.lenderName,
    prefix: selected.lenderName.charAt(0).toUpperCase(),
  };
}

function mapShownOfferToLender(offer: ShownOffer): PreviousLender {
  return {
    id: offer.lenderName,
    name: offer.lenderName,
    prefix: offer.lenderName.charAt(0).toUpperCase(),
  };
}

/**
 * Sort selected lenders by createdAt descending (most recent first)
 * and deduplicate by lenderName (keep the most recent entry for each lender)
 */
function sortAndDeduplicateSelectedLenders(lenders: SelectedLender[]): SelectedLender[] {
  // Sort by createdAt descending (most recent first)
  const sorted = [...lenders].sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;
  });

  // Deduplicate: keep only the first (most recent) occurrence of each lenderName
  const seen = new Set<string>();
  return sorted.filter((lender) => {
    if (seen.has(lender.lenderName)) {
      return false;
    }
    seen.add(lender.lenderName);
    return true;
  });
}

// ============================================================
// LoanOffersBanner Component
// ============================================================
interface LoanOffersBannerProps {
  previousLenders?: PreviousLender[];
  newOffersCount?: number;
  matchPercentage?: number;
}

export default function LoanOffersBanner({
  previousLenders,
  newOffersCount,
  matchPercentage = DEFAULT_MATCH_PERCENTAGE,
}: LoanOffersBannerProps) {
  // Most recent clicked lender (shown as main/big)
  const [mainLender, setMainLender] = useState<PreviousLender | null>(null);
  // Rest of clicked lenders (shown in floating box, up to 3)
  const [otherClickedLenders, setOtherClickedLenders] = useState<PreviousLender[]>([]);
  // Shown offers from API (used when no selected lenders)
  const [shownOffersLenders, setShownOffersLenders] = useState<PreviousLender[]>([]);
  // Total offers count
  const [totalOffersCount, setTotalOffersCount] = useState<number>(0);

  useEffect(() => {
    const existingUserData = getStoredShortExistingUserOffers();
    const userExists = existingUserData?.data?.found || existingUserData?.data?.exists;

    if (userExists && existingUserData?.data) {
      const data = existingUserData.data;

      // Get shownOffers for total count and fallback display
      const shownOffers = (data.shownOffers || []) as ShownOffer[];
      setTotalOffersCount(shownOffers.length);

      if (shownOffers.length > 0) {
        setShownOffersLenders(shownOffers.map(mapShownOfferToLender));
      }

      // Get selectedLenders and sort by createdAt (most recent first)
      const selectedLenders = (data.selectedLenders || []) as SelectedLender[];

      if (selectedLenders.length > 0) {
        // Sort and deduplicate by lenderName, keeping most recent
        const sortedLenders = sortAndDeduplicateSelectedLenders(selectedLenders);
        const mapped = sortedLenders.map(mapSelectedLenderToPreviousLender);

        // First one is the most recent (main/big lender)
        setMainLender(mapped[0] || null);
        // Rest go to floating box (up to 3)
        setOtherClickedLenders(mapped.slice(1, 4));
      }
    }
  }, []);

  // Determine what to show:
  // If user has clicked lenders, show those
  // Otherwise, fall back to shownOffers
  const hasClickedLenders = mainLender !== null;

  // Main lenders to show (for "previously showed interest" section)
  const displayLenders: PreviousLender[] = hasClickedLenders
    ? [mainLender, ...otherClickedLenders]
    : shownOffersLenders.slice(0, 4);

  // Floating logos: if clicked, show other clicked lenders; else show shownOffers
  const floatingLogosLenders = hasClickedLenders
    ? otherClickedLenders.slice(0, 3)
    : shownOffersLenders.slice(0, 3);

  // Offers count
  const offersCount = newOffersCount ?? totalOffersCount;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="relative overflow-hidden rounded-2xl p-5 sm:p-6 mb-6"
      style={{
        background: "linear-gradient(135deg, #F5F0FF 0%, #EDE5FF 50%, #E8DEFF 100%)",
      }}
    >
      {/* Top Recommendation Tag */}
      <div className="absolute top-0 left-0 z-10">
        <span className="inline-flex items-center gap-1 bg-gradient-to-r from-violet-600 to-[#C894FF] text-white shadow-lg shadow-violet-500/20 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-br-xl rounded-tl-[18px]">
          <svg className="w-2.5 h-2.5 text-amber-300" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l2.39 7.36H22l-6.18 4.49L18.21 22 12 17.27 5.79 22l2.39-8.15L2 9.36h7.61z" />
          </svg>
          Personalized just for you
        </span>
      </div>

      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-violet-200/30 rounded-full blur-2xl" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-violet-200/30 rounded-full blur-2xl" />
      </div>

      {/* Mobile Layout - Side by side */}
      <div className="relative flex sm:hidden flex-row items-start justify-between gap-3 mt-6">
        {/* Left Content */}
        <div className="flex-1 min-w-0">
          <p className="text-gray-900 font-semibold text-xs mb-2">You previously showed interest in</p>

          {/* Lender Logos */}
          <div className="flex flex-wrap items-center gap-1.5 mb-3">
            {displayLenders.map((lender: PreviousLender) => {
              const logoData = STATIC_LENDER_LOGOS[lender.id] || STATIC_LENDER_LOGOS[lender.name];
              if (!logoData) return null;
              return (
                <div
                  key={lender.id}
                  className="w-8 h-8 bg-white rounded-lg shadow-sm flex items-center justify-center p-1"
                >
                  <Image
                    src={logoData.src}
                    alt={lender.name}
                    width={24}
                    height={24}
                    className="object-contain w-full h-full"
                  />
                </div>
              );
            })}
          </div>

          <p className="text-[11px] text-slate-600 mb-3">
            <span className="font-semibold text-violet-600">{offersCount} new offers</span> found for you
          </p>

          {/* Single Button */}
          <Link
            href="/dashboard/offers"
            className="inline-flex items-center gap-1 px-4 py-2 bg-white border border-violet-200 text-violet-700 font-semibold rounded-lg text-xs"
          >
            Explore New Offers <span>→</span>
          </Link>
        </div>

        {/* Right - Gauge Card */}
        <div className="shrink-0">
          <div className="bg-white rounded-xl px-3 py-3 shadow-lg">
            <div className="flex justify-center mb-1">
              <svg className="w-16 h-10" viewBox="0 0 100 55">
                <path d="M 10 50 A 40 40 0 0 1 22 22" fill="none" stroke="#dc2626" strokeWidth="7" strokeLinecap="round" />
                <path d="M 22 22 A 40 40 0 0 1 40 10" fill="none" stroke="#f97316" strokeWidth="7" />
                <path d="M 40 10 A 40 40 0 0 1 60 10" fill="none" stroke="#facc15" strokeWidth="7" />
                <path d="M 60 10 A 40 40 0 0 1 78 22" fill="none" stroke="#84cc16" strokeWidth="7" />
                <path d="M 78 22 A 40 40 0 0 1 90 50" fill="none" stroke="#22c55e" strokeWidth="7" strokeLinecap="round" />
                <motion.g
                  initial={{ rotate: -90 }}
                  animate={{ rotate: -90 + (matchPercentage / 100) * 180 }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  style={{ transformOrigin: "50px 50px" }}
                >
                  <line x1="50" y1="50" x2="50" y2="18" stroke="#1f2937" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="50" cy="50" r="3.5" fill="#1f2937" />
                </motion.g>
              </svg>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-semibold text-slate-800">Good Match</p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-xl font-bold text-green-600 leading-none"
              >
                {matchPercentage}%
              </motion.p>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop/Tablet Layout */}
      <div className="relative hidden sm:flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-6">
        {/* Left Content */}
        <div className="flex-1 w-full lg:max-w-xl mt-4">
          <p className="text-gray-900 font-semibold text-sm mb-3">You previously showed interest in</p>

          {/* Lender Logos */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            {displayLenders.map((lender: PreviousLender) => {
              const logoData = STATIC_LENDER_LOGOS[lender.id] || STATIC_LENDER_LOGOS[lender.name];
              if (!logoData) return null;
              return (
                <div
                  key={lender.id}
                  className="w-16 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center p-2"
                >
                  <Image
                    src={logoData.src}
                    alt={lender.name}
                    width={32}
                    height={32}
                    className="object-contain w-full h-full"
                  />
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0">
              <Gift className="w-5 h-5 text-violet-600 stroke-[2.5]" />
            </div>
            <div>
              <p className="text-xs text-slate-500">
                We found{" "}
                <span className="font-semibold text-violet-600">
                  {offersCount} new personalized offers
                </span>
              </p>
              <p className="text-xs text-slate-500">
                that may give you better rates and faster approvals.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-row gap-3">
            <Link
              href="/dashboard/offers"
              className="px-5 py-2.5 rounded-lg transition-all text-sm shadow-md hover:shadow-lg hover:scale-[1.02] bg-gradient-to-r from-[#D9F941] to-[#7C3AED] text-white font-semibold text-center"
            >
              Apply Now →
            </Link>
            <Link
              href="/dashboard/offers"
              className="px-5 py-2.5 bg-white border border-violet-200 text-violet-700 font-semibold rounded-lg hover:bg-violet-50 transition-colors text-sm text-center"
            >
              View Previous Offers
            </Link>
          </div>

          {/* Trust Banner */}
          <div className="flex flex-wrap items-center gap-2 mt-4 text-xs text-gray-600">
            <div className="flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5 text-indigo-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="font-medium">Trusted by 65L+ customers</span>
            </div>
            <div className="flex -space-x-1.5">
              {[
                { bg: "bg-rose-200", txt: "text-rose-700", c: "A" },
                { bg: "bg-amber-200", txt: "text-amber-700", c: "P" },
                { bg: "bg-sky-200", txt: "text-sky-700", c: "R" },
                { bg: "bg-purple-200", txt: "text-purple-700", c: "S" },
              ].map((a, i) => (
                <span
                  key={i}
                  className={`w-5 h-5 rounded-full border border-white flex items-center justify-center text-[9px] font-bold ${a.bg} ${a.txt}`}
                >
                  {a.c}
                </span>
              ))}
            </div>
            <span className="text-amber-500 font-semibold">4.8 ★</span>
            <span className="text-gray-300">|</span>
            <span>RBI Registered NBFC</span>
          </div>
        </div>

        {/* Floating Box with Logos */}
        <div
          className="relative shrink-0 hidden lg:flex items-end justify-center"
          style={{ width: "240px", height: "240px" }}
        >
          {/* Floating Logos - showing first 3 from recommendation offers */}
          {floatingLogosLenders.map((lender: PreviousLender, index: number) => {
            const logoData = STATIC_LENDER_LOGOS[lender.id] || STATIC_LENDER_LOGOS[lender.name];
            if (!logoData) return null;

            // Position configs for 3 logos floating above box
            const positions = [
              { left: "10%", bottom: "55%", rotate: -8, delay: 0.2 },
              { left: "35%", bottom: "70%", rotate: 0, delay: 0.4 },
              { left: "60%", bottom: "55%", rotate: 8, delay: 0.3 },
            ];
            const pos = positions[index];

            return (
              <motion.div
                key={lender.id}
                initial={{ opacity: 0, y: 30, scale: 0.8 }}
                animate={{
                  opacity: 1,
                  y: [0, -6, 0],
                  scale: 1,
                  rotate: pos.rotate
                }}
                transition={{
                  delay: pos.delay,
                  y: {
                    duration: 2 + index * 0.3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }
                }}
                className="absolute w-12 h-12 bg-white rounded-xl shadow-lg flex items-center justify-center p-2 border border-gray-100"
                style={{
                  left: pos.left,
                  bottom: pos.bottom,
                  zIndex: 10 + index
                }}
              >
                <Image
                  src={logoData.src}
                  alt={lender.name}
                  width={82}
                  height={82}
                  className="object-contain w-[82px] h-[82px]"
                />
              </motion.div>
            );
          })}

          {/* Sparkles */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute top-4 right-2"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
            className="absolute top-8 left-4"
          >
            <Sparkle className="w-3 h-3 text-violet-400" />
          </motion.div>

          {/* Box Image */}
          <motion.img
            src="/box.png"
            alt="box"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-54 h-54 object-contain drop-shadow-xl"
          />
        </div>

        {/* Gauge Card */}
        <div className="shrink-0 flex justify-center lg:justify-end">
          <div className="bg-white rounded-2xl px-4 py-5 shadow-lg w-[150px]">
            {/* Gauge */}
            <div className="flex justify-center mb-2 sm:mb-3">
              <svg className="w-20 h-12 sm:w-24 sm:h-14" viewBox="0 0 100 55">
                {/* Red */}
                <path
                  d="M 10 50 A 40 40 0 0 1 22 22"
                  fill="none"
                  stroke="#dc2626"
                  strokeWidth="7"
                  strokeLinecap="round"
                />
                {/* Orange */}
                <path
                  d="M 22 22 A 40 40 0 0 1 40 10"
                  fill="none"
                  stroke="#f97316"
                  strokeWidth="7"
                />
                {/* Yellow */}
                <path
                  d="M 40 10 A 40 40 0 0 1 60 10"
                  fill="none"
                  stroke="#facc15"
                  strokeWidth="7"
                />
                {/* Light Green */}
                <path
                  d="M 60 10 A 40 40 0 0 1 78 22"
                  fill="none"
                  stroke="#84cc16"
                  strokeWidth="7"
                />
                {/* Green */}
                <path
                  d="M 78 22 A 40 40 0 0 1 90 50"
                  fill="none"
                  stroke="#22c55e"
                  strokeWidth="7"
                  strokeLinecap="round"
                />
                {/* Needle */}
                <motion.g
                  initial={{ rotate: -90 }}
                  animate={{ rotate: -90 + (matchPercentage / 100) * 180 }}
                  transition={{ duration: 1.2, ease: "easeOut" }}
                  style={{ transformOrigin: "50px 50px" }}
                >
                  <line
                    x1="50"
                    y1="50"
                    x2="50"
                    y2="18"
                    stroke="#1f2937"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <circle cx="50" cy="50" r="3.5" fill="#1f2937" />
                </motion.g>
              </svg>
            </div>

            {/* Text */}
            <div className="text-center">
              <p className="text-[13px] sm:text-[14px] font-semibold text-slate-800">
                Good Match
              </p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-[28px] sm:text-[34px] font-bold text-green-600 leading-none mt-1"
              >
                {matchPercentage}%
              </motion.p>
              <p className="text-[12px] sm:text-[13px] text-slate-700 font-medium mt-2 leading-tight">
                High chance of
                <br />
                approval
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
