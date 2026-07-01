"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Lock, Zap, CheckCircle, Clock, ChevronRight } from "lucide-react";
import { STATIC_LENDER_LOGOS, LENDER_FEATURE_TAGS, DEFAULT_FEATURE_TAG } from "@/lib/constants";
import { getStoredShortExistingUserOffers, saveShortLender } from "@/lib/api";
import { useOtpGuard } from "@/app/dashboard/layout";
import RingImageSection from "./RingImageSection";

// Lender UTM links — used when an offer doesn't carry its own utmLink. Same set
// the offer cards use, so the banner hero redirects to the right place.
const FALLBACK_UTM_LINKS: Record<string, string> = {
  SmartCoin: "https://smartcoin.onelink.me/KLIY/Switchmyloanlandingpage",
  SmartCoinHighIntent: "https://smartcoin.onelink.me/KLIY/Switchmyloanlandingpage",
  TrueBalance: "https://truebalance.io/",
  RapidMoney: "https://web.rapidmoney.in/borrower/login?utm_source=creadylandingpage&utm_extsource=abc&utm_medium=rapidmoney&utm_campaign=xyz&utm_campaignID=def",
  KreditBee: "https://www.kreditbee.in/signin",
  CreditPlus: "https://loan.credittnow.com/?utm_source=cready&utm_medium=website",
  SpeedoLoan: "https://loanapply.speedoloan.com?partner_id=cready",
  LoanWalle: "https://www.loanwalle.com/personal-loan?utm_source=CREADY&utm_medium=affiliate&utm_campaign=mcl-aff&click_id=landing-page",
  Cashvia: "https://cashvia.in/?utm_source=switchmyloan&utm_medium=switchmyloan&utm_campaign=switchmyloan_",
};

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

function sortAndDeduplicateSelectedLenders(lenders: SelectedLender[]): SelectedLender[] {
  const sorted = [...lenders].sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateB - dateA;
  });

  const seen = new Set<string>();
  return sorted.filter((lender) => {
    if (seen.has(lender.lenderName)) {
      return false;
    }
    seen.add(lender.lenderName);
    return true;
  });
}

// Format lender name for display (add spaces before capitals)
function formatLenderName(name: string): string {
  return name.replace(/([A-Z])/g, ' $1').trim();
}

// ============================================================
// LoanOffersBanner Component
// ============================================================
export default function LoanOffersBanner() {
  const { guardActivity } = useOtpGuard();
  const [mainLender, setMainLender] = useState<PreviousLender | null>(null);
  const [otherLenders, setOtherLenders] = useState<PreviousLender[]>([]);
  const [shownOffersLenders, setShownOffersLenders] = useState<PreviousLender[]>([]);

  useEffect(() => {
    const existingUserData = getStoredShortExistingUserOffers();
    const userExists = existingUserData?.data?.found || existingUserData?.data?.exists;

    if (userExists && existingUserData?.data) {
      const data = existingUserData.data;

      const shownOffers = (data.shownOffers || []) as ShownOffer[];
      if (shownOffers.length > 0) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setShownOffersLenders(shownOffers.map(mapShownOfferToLender));
      }

      const selectedLenders = (data.selectedLenders || []) as SelectedLender[];

      if (selectedLenders.length > 0) {
        const sortedLenders = sortAndDeduplicateSelectedLenders(selectedLenders);
        const mapped = sortedLenders.map(mapSelectedLenderToPreviousLender);
        setMainLender(mapped[0] || null);
        // Set other lenders (up to 3) for "More offers" section
        setOtherLenders(mapped.slice(1, 4));
      }
    }
  }, []);

  const hasClickedLenders = mainLender !== null;
  const displayLender = hasClickedLenders ? mainLender : shownOffersLenders[0];

  // Get lender logo
  const lenderLogo = displayLender
    ? STATIC_LENDER_LOGOS[displayLender.id] || STATIC_LENDER_LOGOS[displayLender.name]
    : null;

  // Combine otherLenders with shownOffersLenders to get at least 3 offers
  const moreOffers = (() => {
    const combined: PreviousLender[] = [...otherLenders];
    const existingIds = new Set([displayLender?.id, ...otherLenders.map(l => l.id)]);

    // Add from shownOffers if we need more
    for (const lender of shownOffersLenders) {
      if (combined.length >= 3) break;
      if (!existingIds.has(lender.id)) {
        combined.push(lender);
        existingIds.add(lender.id);
      }
    }

    return combined.slice(0, 3);
  })();

  // Apply to the hero lender — redirect to its UTM link (KreditBee → its signin),
  // same as the offer cards. OTP-gated; saves the lender first. The link comes
  // from the shown offer, falling back to FALLBACK_UTM_LINKS.
  const handleHeroApply = async () => {
    if (!displayLender) return;
    const allowed = await guardActivity();
    if (!allowed) return;

    const phone = sessionStorage.getItem("userPhone") || "";
    await saveShortLender(phone, displayLender.id);

    const data = getStoredShortExistingUserOffers()?.data as Record<string, unknown> | undefined;
    const shownOffers = (data?.shownOffers || []) as ShownOffer[];
    const match = shownOffers.find((o) => o.lenderName === displayLender.id);
    // Prefer the backend's per-lender utm_link, then the shown-offer link, then fallback.
    const lenderData = data?.[displayLender.id] as { utm_link?: string } | undefined;
    const url = lenderData?.utm_link || match?.utmLink || FALLBACK_UTM_LINKS[displayLender.id];
    if (url) window.open(url, "_blank");
  };

  // If no lender data, don't render
  if (!displayLender) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="relative overflow-hidden rounded-2xl mb-6 border border-violet-200/60 shadow-lg shadow-violet-100/50"
      style={{
        background: "linear-gradient(135deg, #F8F5FF 0%, #F0E8FF 50%, #E8DEFF 100%)",
      }}
    >
      {/* Top Tag */}
    <div className="absolute top-0 left-0 z-10">
        <span className="inline-flex items-center gap-1 bg-gradient-to-r from-violet-600 to-[#C894FF] text-white shadow-lg shadow-violet-500/20 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-br-xl rounded-tl-[18px]">
          <svg className="w-2.5 h-2.5 text-amber-300" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l2.39 7.36H22l-6.18 4.49L18.21 22 12 17.27 5.79 22l2.39-8.15L2 9.36h7.61z" />
          </svg>
          Personalized just for you
        </span>
      </div> 

      {/* Background decorative dots */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-1/4 w-1 h-1 bg-violet-300 rounded-full opacity-50" />
        <div className="absolute top-20 left-1/3 w-1.5 h-1.5 bg-violet-200 rounded-full opacity-40" />
        <div className="absolute bottom-20 left-1/5 w-1 h-1 bg-violet-300 rounded-full opacity-50" />
        <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-violet-200 rounded-full opacity-40" />
      </div>

      <div className="flex flex-col lg:flex-row ">
        {/* Left Section - Main Content */}
        <div className="flex-1 p-4 sm:p-6 lg:p-8 pt-9 sm:pt-12">
          {/* Interest Text */}
          <p className="text-black font-bold text-[11px] sm:text-sm mb-1 mt-1">
            You&apos;ve shown interest in
          </p>

          {/* Lender Logo */}
          {lenderLogo && (
            <div className="mb-2">
              <Image
                src={lenderLogo.src}
                alt={displayLender.name}
                width={120}
                height={40}
                className="object-contain h-10 sm:h-12 w-auto"
              />
            </div>
          )}

          {/* Subtitle */}
          <p className="text-gray-600 text-[10px] sm:text-sm">
            Continue now and get your loan
          </p>

          {/* Instantly in Minutes */}
          <div className="flex items-center gap-1 text-violet-600 font-semibold text-sm sm:text-[24px] mb-3 sm:mb-5">
            <span>Instantly</span>
            <span className="text-violet-800 font-bold">in Minutes!</span>
            <Zap className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-yellow-500 fill-yellow-500" />
          </div>

          {/* Feature Badges - Scrollable on mobile */}
          <div className="flex items-center gap-1 sm:gap-3 mb-2 sm:mb-1 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-hide">
            <div className="flex items-center gap-1 sm:gap-1.5 bg-white rounded-md px-2 py-1 sm:px-2 sm:py-1.5 shrink-0">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-violet-50 flex items-center justify-center">
                <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-violet-600" />
              </div>
              <span className="text-[8px] sm:text-[10px] text-gray-700 font-medium whitespace-nowrap">Instant Approval</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-1.5 bg-white rounded-md px-2 py-1 sm:px-2 sm:py-1.5 shrink-0">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-violet-50 flex items-center justify-center">
                <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-violet-600" />
              </div>
              <span className="text-[8px] sm:text-[10px] text-gray-700 font-medium whitespace-nowrap">Minimal Documents</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-1.5 bg-white rounded-md px-2 py-1 sm:px-2 sm:py-1.5 shrink-0">
              <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-violet-50 flex items-center justify-center">
                <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-violet-600" />
              </div>
              <span className="text-[8px] sm:text-[10px] text-gray-700 font-medium whitespace-nowrap">Quick Disbursal</span>
            </div>
          </div>

          {/* CTA Button — redirects to the hero lender's UTM link */}
          <button
            type="button"
            onClick={handleHeroApply}
            className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-5 sm:px-8 py-2.5 rounded-md text-white font-semibold text-xs sm:text-sm shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] group bg-gradient-to-r from-[#dfff45] via-[#9b6bff] to-[#7c3aed] mt-2 cursor-pointer"
          >
            Apply Now
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </button>

          {/* Trust Badge */}
          <div className="flex items-center justify-center sm:justify-start gap-1.5 mt-2 text-[10px] sm:text-xs text-gray-600">
            <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-500" />
            <span>100% Secure & Trusted</span>
          </div>
        </div>

        {/* Center Section - R Ring Image with floating bubbles (hidden on mobile) */}
        <div className="hidden lg:block mt-10">
          <RingImageSection lenderName={displayLender?.name} />
        </div>

        {/* Vertical Divider Line */}
        {moreOffers.length > 0 && (
          <div className="hidden xl:flex items-center py-8">
            <div className="w-px h-68 bg-gradient-to-b from-transparent via-violet-300 to-transparent" />
          </div>
        )}

        {/* Right Section - More Offers */}
        {moreOffers.length > 0 && (
          <div className="hidden xl:block w-64 p-5">
            <h3 className="text-xs font-semibold text-gray-800 mb-4">More offers you may like</h3>

            <div className="space-y-3">
              {moreOffers.map((lender) => {
                const logo = STATIC_LENDER_LOGOS[lender.id] || STATIC_LENDER_LOGOS[lender.name];
                return (
                  <Link
                    key={lender.id}
                    href="/dashboard/offers"
                    className="flex items-center justify-between p-2 bg-white rounded-xl hover:shadow-md transition-all group border border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10  flex items-center justify-center ">
                        {logo ? (
                          <Image
                            src={logo.src}
                            alt={lender.name}
                            width={42}
                            height={42}
                            className="object-contain"
                          />
                        ) : (
                          <span className="text-sm font-bold text-violet-600">{lender.prefix}</span>
                        )}
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-gray-800">{formatLenderName(lender.name)}</p>
                        <p className="text-[10px] font-semibold text-gray-500">{LENDER_FEATURE_TAGS[lender.id] || DEFAULT_FEATURE_TAG}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-violet-600 transition-colors" />
                  </Link>
                );
              })}
            </div>

            <Link
              href="/dashboard/offers"
              className="inline-flex items-center gap-1 text-violet-600 text-xs font-medium mt-4 hover:text-violet-700"
            >
              View all offers
              <span>→</span>
            </Link>
          </div>
        )}
      </div>



      {/* Mobile More Offers Section */}
      {moreOffers.length > 0 && (
        <div className="xl:hidden border-t border-violet-100 bg-white/40 backdrop-blur-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-800">More offers you may like</h3>
            <Link href="/dashboard/offers" className="text-violet-600 text-xs font-medium">
              View all →
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
            {moreOffers.map((lender) => {
              const logo = STATIC_LENDER_LOGOS[lender.id] || STATIC_LENDER_LOGOS[lender.name];
              return (
                <Link
                  key={lender.id}
                  href="/dashboard/offers"
                  className="shrink-0 flex items-center gap-2 p-3 bg-white rounded-xl shadow-sm min-w-[160px]"
                >
                  <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center p-1">
                    {logo ? (
                      <Image
                        src={logo.src}
                        alt={lender.name}
                        width={24}
                        height={24}
                        className="object-contain"
                      />
                    ) : (
                      <span className="text-xs font-bold text-violet-600">{lender.prefix}</span>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-800">{formatLenderName(lender.name)}</p>
                    <p className="text-[10px] text-gray-500">{LENDER_FEATURE_TAGS[lender.id] || DEFAULT_FEATURE_TAG}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}
