"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Shield } from "lucide-react";
import Image from "next/image";
import { STATIC_LENDER_LOGOS } from "@/lib/constants";

interface LoanWalleModalProps {
  onClose: () => void;
  onSelectToofan: () => void;
  onSelectRupeeRaftaar: () => void;
  hasToofan: boolean;
  hasRupeeRaftaar: boolean;
}

export default function LoanWalleLenderModal({
  onClose,
  onSelectToofan,
  onSelectRupeeRaftaar,
  hasToofan,
  hasRupeeRaftaar,
}: LoanWalleModalProps) {
  const logoMeta = STATIC_LENDER_LOGOS["LoanWalle"];
  const toofanLogoMeta = STATIC_LENDER_LOGOS["ToofanLoan"];
  const rupeeRaftaarLogoMeta = STATIC_LENDER_LOGOS["RupeeRaftaar"];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4 py-4 overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="relative overflow-hidden rounded-2xl sm:rounded-[28px] border border-[#e9ddff] shadow-[0_8px_30px_rgba(139,92,246,0.2)] w-full max-w-[340px] sm:max-w-[380px] my-auto"
          style={{ background: "#FEFEFF" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="relative pt-4 sm:pt-5 pb-3 sm:pb-4 px-4 sm:px-5">
            {/* Close button */}
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute top-2 right-2 sm:top-3 sm:right-3 w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-white/80 border border-[#e9ddff] hover:bg-white transition-colors cursor-pointer z-10"
            >
              <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500" />
            </button>

            {/* Logo */}
            <div className="flex justify-center items-center">
              {logoMeta?.src ? (
                <div className="h-8 sm:h-10 w-auto">
                  <Image
                    src={logoMeta.src}
                    alt="LoanWalle"
                    width={80}
                    height={32}
                    className="object-contain h-full w-auto"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-base sm:text-lg">L</span>
                </div>
              )}
            </div>

            {/* Title */}
            <motion.h2
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center text-base sm:text-lg font-bold text-gray-900 mt-2 sm:mt-3"
            >
              Choose Your Lender
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-center text-gray-500 text-xs sm:text-sm mt-0.5"
            >
              Select the lender that suits you best
            </motion.p>
          </div>

          {/* Options */}
          <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-2.5 sm:space-y-3">
            {/* Toofan Loan Option */}
            {hasToofan && (
              <motion.button
                type="button"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                onClick={onSelectToofan}
                className="relative w-full p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 hover:border-blue-400 hover:shadow-lg transition-all group cursor-pointer text-left overflow-hidden"
              >
                <div className="flex items-start gap-2.5 sm:gap-3">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 shadow-md overflow-hidden bg-white">
                    {toofanLogoMeta?.src ? (
                      <Image
                        src={toofanLogoMeta.src}
                        alt="Toofan Loan"
                        width={44}
                        height={44}
                        className="object-contain w-full h-full p-1"
                      />
                    ) : (
                      <span className="text-blue-600 font-bold text-lg">T</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1 flex-wrap">
                      <h3 className="font-bold text-gray-900 text-sm sm:text-base">Toofan Loan</h3>
                      <span className="bg-blue-100 text-blue-700 text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap">
                        Fast Approval
                      </span>
                    </div>
                    <p className="text-gray-600 text-[11px] sm:text-xs mb-1.5 sm:mb-2 leading-relaxed">
                      Quick personal loans with transparent terms and flexible tenure.
                    </p>
                    <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-green-500 rounded-full"></span>
                        Up to ₹1 Lakhs
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-green-500 rounded-full"></span>
                        Transparent Terms
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all shrink-0 mt-8" />
                </div>
              </motion.button>
            )}

            {/* Rupee Raftaar Option */}
            {hasRupeeRaftaar && (
              <motion.button
                type="button"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                onClick={onSelectRupeeRaftaar}
                className="w-full p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50 hover:border-orange-400 hover:shadow-lg transition-all group cursor-pointer text-left"
              >
                <div className="flex items-start gap-2.5 sm:gap-3">
                  <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 shadow-md overflow-hidden ${rupeeRaftaarLogoMeta?.darkBg ? 'bg-gray-900' : 'bg-white'}`}>
                    {rupeeRaftaarLogoMeta?.src ? (
                      <Image
                        src={rupeeRaftaarLogoMeta.src}
                        alt="Rupee Raftaar"
                        width={44}
                        height={44}
                        className="object-contain w-full h-full p-1"
                      />
                    ) : (
                      <span className="text-orange-600 font-bold text-lg">R</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 sm:gap-2 mb-0.5 sm:mb-1 flex-wrap">
                      <h3 className="font-bold text-gray-900 text-sm sm:text-base">Rupee Raftaar</h3>
                      <span className="bg-orange-100 text-orange-700 text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap">
                        Quick Disbursal
                      </span>
                    </div>
                    <p className="text-gray-600 text-[11px] sm:text-xs mb-1.5 sm:mb-2 leading-relaxed">
                      Fast disbursement personal loans with flexible tenure options.
                    </p>
                    <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-green-500 rounded-full"></span>
                        Up to ₹3 Lakhs
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 bg-green-500 rounded-full"></span>
                        Flexible Tenure
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all shrink-0 mt-8" />
                </div>
              </motion.button>
            )}
          </div>

          {/* Footer */}
          <div className="px-3 sm:px-4 pb-3 sm:pb-4">
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 bg-gray-50 rounded-lg sm:rounded-xl">
              <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" />
              <span className="text-[10px] sm:text-xs text-gray-600">
                <span className="font-semibold text-gray-700">100% Secure</span> • RBI Registered NBFC
              </span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
