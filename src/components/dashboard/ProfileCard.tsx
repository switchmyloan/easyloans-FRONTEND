"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Phone, Mail, Wallet, Calendar, ChevronRight, CheckCircle2 } from "lucide-react";
import { getStoredShortExistingUserOffers } from "@/lib/api";

// ============================================================
// Types
// ============================================================
export interface ExistingUserData {
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  gender: string;
  pincode: string;
  panNumber: string;
  dateOfBirth: string;
  jobType: string;
  monthlySalary: number;
  loanAmount: number;
  loanPurpose: string;
}

// ============================================================
// Utility Functions
// ============================================================
function maskPhone(phone: string): string {
  if (!phone || phone.length < 4) return phone;
  return "******" + phone.slice(-4);
}

function maskEmail(email: string): string {
  if (!email) return email;
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  const visiblePart = local.slice(0, Math.min(5, local.length));
  return visiblePart + "****@" + domain;
}

function formatLoanAmount(amount: number): string {
  if (!amount) return "N/A";
  return "₹" + amount.toLocaleString("en-IN");
}

function formatDateOfBirth(dob: string): string {
  if (!dob) return "N/A";
  const date = new Date(dob);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function calculateProfileCompletion(user: ExistingUserData): number {
  const fields = [
    user.firstName,
    user.lastName,
    user.email,
    user.mobileNumber,
    user.gender,
    user.pincode,
    user.panNumber,
    user.dateOfBirth,
    user.jobType,
    user.monthlySalary,
    user.loanAmount,
    user.loanPurpose,
  ];
  const filled = fields.filter((f) => f !== null && f !== undefined && f !== "").length;
  return Math.round((filled / fields.length) * 100);
}

// ============================================================
// ProfileCard Component
// ============================================================
export default function ProfileCard() {
  const [user, setUser] = useState<ExistingUserData | null>(null);
  const [completion, setCompletion] = useState(0);

  useEffect(() => {
    const existingUserData = getStoredShortExistingUserOffers();
    const userExists = existingUserData?.data?.found || existingUserData?.data?.exists;

    if (userExists && existingUserData?.data?.user) {
      const userData = existingUserData.data.user;
      setUser(userData);
      setCompletion(calculateProfileCompletion(userData));
    }
  }, []);

  if (!user) return null;

  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User";
  const initial = fullName.charAt(0).toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 h-full"
    >
      {/* Top Section - Avatar, Name, Badge, Progress */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold shadow-md">
            {initial}
          </div>

          {/* Name and Verified */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900">{fullName}</h3>
            <p className="text-[10px] text-gray-500">Verified Customer</p>
          </div>
        </div>

        {/* Complete Badge & Progress Circle */}
        <div className="flex items-center gap-3">
          {/* Complete Badge - only show when 100% */}
          {completion === 100 && (
            <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-400 text-emerald-600 px-2 py-0.5 rounded-full text-[10px] font-semibold">
              <CheckCircle2 className="w-3 h-3" />
              Complete
            </div>
          )}

          {/* Progress Circle */}
          <div className="relative w-12 h-12">
            <svg className="w-12 h-12 transform -rotate-90">
              <circle
                cx="24"
                cy="24"
                r="20"
                stroke="#E5E7EB"
                strokeWidth="4"
                fill="none"
              />
              <motion.circle
                cx="24"
                cy="24"
                r="20"
                stroke="#7C3AED"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                initial={{ strokeDasharray: "0 126" }}
                animate={{ strokeDasharray: `${(completion / 100) * 126} 126` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-700">
              {completion}%
            </span>
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-1 mb-2">
        {/* Phone */}
        <div className="bg-gray-50 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-8 h-8 shrink-0 rounded-lg bg-violet-100 flex items-center justify-center">
            <Phone className="w-3 h-3 text-violet-600" />
          </div>
          <div>
            <p className="text-[10px] text-gray-500">Phone</p>
            <p className="text-xs font-semibold text-gray-800">
              {maskPhone(user.mobileNumber)}
            </p>
          </div>
        </div>

        {/* Email */}
        <div className="bg-gray-50 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-8 h-8 shrink-0 rounded-lg bg-violet-100 flex items-center justify-center">
            <Mail className="w-3 h-3 text-violet-600" />
          </div>
          <div>
            <p className="text-[10px] text-gray-500">Email</p>
            <p className="text-[10px] font-semibold text-gray-800">
              {maskEmail(user.email)}
            </p>
          </div>
        </div>

        {/* Loan Amount */}
        <div className="bg-gray-50 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-8 h-8 shrink-0 rounded-lg bg-violet-100 flex items-center justify-center">
            <Wallet className="w-3 h-3 text-violet-600" />
          </div>
          <div>
            <p className="text-[10px] text-gray-500">Loan Amount</p>
            <p className="text-xs font-semibold text-gray-800">
              {formatLoanAmount(user.loanAmount)}
            </p>
          </div>
        </div>

        {/* Date of Birth */}
        <div className="bg-gray-50 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-8 h-8 shrink-0 rounded-lg bg-violet-100 flex items-center justify-center">
            <Calendar className="w-3 h-3 text-violet-600" />
          </div>
          <div>
            <p className="text-[10px] text-gray-500">Date of Birth</p>
            <p className="text-xs font-semibold text-gray-800">
              {formatDateOfBirth(user.dateOfBirth)}
            </p>
          </div>
        </div>
      </div>

      {/* View Profile Button */}
      <Link
        href="/dashboard/profile"
        className="w-full flex items-center justify-center gap-2 py-2 border border-gray-200 rounded-lg text-violet-600 font-medium text-sm hover:bg-[#7F22FE] hover:border-[#6232FF] hover:text-white transition-colors"
      >
        View Profile
        <ChevronRight className="w-4 h-4" />
      </Link>
    </motion.div>
  );
}
