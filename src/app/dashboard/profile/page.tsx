"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  Briefcase,
  IndianRupee,
  Target,
  Wallet,
  CheckCircle2,
  ArrowLeft,
  Shield,
  Star,
  Zap,
  Headphones,
} from "lucide-react";
import { getStoredShortExistingUserOffers } from "@/lib/api";

// ============================================================
// Types
// ============================================================
interface ExistingUserData {
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
// Helper Functions
// ============================================================
function maskPan(pan: string): string {
  if (!pan || pan.length < 4) return pan || "N/A";
  return pan.slice(0, 4) + "****" + pan.slice(-2);
}

function maskPhone(phone: string): string {
  if (!phone || phone.length < 4) return phone || "N/A";
  return "+91 ******" + phone.slice(-4);
}

function formatDate(dob: string): string {
  if (!dob) return "N/A";
  const date = new Date(dob);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatDateShort(dob: string): string {
  if (!dob) return "N/A";
  const date = new Date(dob);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatAmount(amount: number): string {
  if (!amount) return "N/A";
  return "₹" + amount.toLocaleString("en-IN");
}

function formatGender(gender: string): string {
  if (!gender) return "N/A";
  const genderMap: Record<string, string> = {
    MALE: "Male",
    FEMALE: "Female",
    OTHER: "Other",
  };
  return genderMap[gender] || gender;
}

function formatJobType(jobType: string): string {
  if (!jobType) return "N/A";
  const jobMap: Record<string, string> = {
    SALARIED: "Salaried",
    SELF_EMPLOYED: "Self Employed",
    BUSINESS_OWNER: "Business Owner",
    FREELANCER: "Freelancer",
    STUDENT: "Student",
    OTHER: "Other",
  };
  return jobMap[jobType] || jobType;
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
// Sub-Components
// ============================================================
interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  masked?: boolean;
}

function InfoItem({ icon, label, value, masked }: InfoItemProps) {
  return (
    <div className="flex items-center gap-3 py-2.5 px-3 bg-gray-50/50 rounded-lg">
      <div className="w-8 h-8 shrink-0 rounded-lg bg-violet-50 flex items-center justify-center">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-gray-400 uppercase tracking-wide">{label}</p>
        <p className={`text-sm font-medium text-gray-800 ${masked ? "tracking-wider" : ""}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  delay?: number;
}

function Section({ title, icon, children, delay = 0 }: SectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden h-full"
    >
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-50">
        <div className="w-6 h-6 rounded-md bg-violet-100 flex items-center justify-center">
          {icon}
        </div>
        <h3 className="text-xs font-semibold text-gray-700">{title}</h3>
      </div>
      <div className="p-3">{children}</div>
    </motion.div>
  );
}

// ============================================================
// Profile Page Component
// ============================================================
export default function ProfilePage() {
  const [user, setUser] = useState<ExistingUserData | null>(null);
  const [completion, setCompletion] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const existingUserData = getStoredShortExistingUserOffers();
    const userExists = existingUserData?.data?.found || existingUserData?.data?.exists;

    if (userExists && existingUserData?.data?.user) {
      const userData = existingUserData.data.user;
      setUser(userData);
      setCompletion(calculateProfileCompletion(userData));
    }
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">No Profile Found</h2>
          <p className="text-sm text-gray-500 mb-6">
            We couldn&apos;t find your profile information. Please complete the application form first.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-violet-600 text-white rounded-xl font-medium text-sm hover:bg-violet-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </motion.div>
      </div>
    );
  }

  const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User";
  const initial = fullName.charAt(0).toUpperCase();

  return (
    <div className="max-w-5xl mx-auto px-4 pb-8">
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-4"
      >
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-violet-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </motion.div>

      {/* Profile Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl overflow-hidden mb-4"
      >
        {/* Main Banner */}
        <div className="bg-gradient-to-r from-violet-600 via-violet-500 to-purple-600 p-4 sm:p-5 relative overflow-hidden">
          {/* Background decorative circles */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full" />
            <div className="absolute -bottom-32 -left-20 w-80 h-80 bg-white/5 rounded-full" />
            <div className="absolute top-1/2 left-1/3 w-32 h-32 bg-white/5 rounded-full" />
          </div>

          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Left Section - Avatar and Info */}
            <div className="flex items-start sm:items-center gap-3 sm:gap-4">
              {/* Avatar with border */}
              <div className="relative shrink-0">
                <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-gray-200 border-4 border-white/30 flex items-center justify-center text-violet-600 text-xl sm:text-3xl font-bold shadow-lg">
                  {initial}
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-400 border-2 border-white flex items-center justify-center shadow-md">
                  <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
                </div>
              </div>

              {/* Name and Details */}
              <div className="flex-1 min-w-0">
                <h1 className="text-base sm:text-xl font-bold text-white mb-0.5 truncate">{fullName}</h1>
                <div className="flex items-center gap-1.5 mb-2">
                  <div className="flex items-center gap-1 bg-emerald-400/20 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3 text-emerald-300" />
                    <span className="text-[10px] sm:text-xs font-medium text-emerald-200">Verified Customer</span>
                  </div>
                </div>
                {/* DOB and Gender */}
                <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/20 flex items-center justify-center">
                      <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
                    </div>
                    <div>
                      <p className="text-[11px] sm:text-sm font-semibold text-white">{formatDateShort(user.dateOfBirth)}</p>
                      <p className="text-[9px] sm:text-[10px] text-violet-300">Date of Birth</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/20 flex items-center justify-center">
                      <User className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
                    </div>
                    <div>
                      <p className="text-[11px] sm:text-sm font-semibold text-white">{formatGender(user.gender)}</p>
                      <p className="text-[9px] sm:text-[10px] text-violet-300">Gender</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Section - Profile Complete Card */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 w-full sm:w-auto sm:min-w-[160px]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-[10px] sm:text-xs text-white font-medium">Profile Complete</span>
                </div>
                <span className="text-lg sm:text-xl font-bold text-white px-2">{completion}%</span>
              </div>
              <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${completion}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-emerald-400 rounded-full"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Info Cards Row */}
        <div className="flex flex-wrap sm:flex-nowrap bg-violet-700 px-3 py-3 sm:px-4 sm:py-4">
          <div className="flex items-center gap-3 w-1/2 sm:w-1/4 sm:flex-1 py-2 sm:py-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
              <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-orange-300" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs text-violet-300">Loan Requirement</p>
              <p className="text-xs sm:text-sm font-bold text-white">{formatAmount(user.loanAmount)}</p>
            </div>
          </div>

          <div className="hidden sm:block w-px bg-violet-500/50 mx-4 self-stretch" />

          <div className="flex items-center gap-3 w-1/2 sm:w-1/4 sm:flex-1 py-2 sm:py-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
              <IndianRupee className="w-4 h-4 sm:w-5 sm:h-5 text-purple-300" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs text-violet-300">Monthly Income</p>
              <p className="text-xs sm:text-sm font-bold text-white">{formatAmount(user.monthlySalary)}</p>
            </div>
          </div>

          <div className="hidden sm:block w-px bg-violet-500/50 mx-4 self-stretch" />

          <div className="flex items-center gap-3 w-1/2 sm:w-1/4 sm:flex-1 py-2 sm:py-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
              <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-300" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs text-violet-300">Employment Type</p>
              <p className="text-xs sm:text-sm font-bold text-white">{formatJobType(user.jobType)}</p>
            </div>
          </div>

          <div className="hidden sm:block w-px bg-violet-500/50 mx-4 self-stretch" />

          <div className="flex items-center gap-3 w-1/2 sm:w-1/4 sm:flex-1 py-2 sm:py-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
              <Target className="w-4 h-4 sm:w-5 sm:h-5 text-pink-300" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] sm:text-xs text-violet-300">Loan Purpose</p>
              <p className="text-xs sm:text-sm font-bold text-white truncate">{user.loanPurpose || "N/A"}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Info Sections */}
      <div className="space-y-2">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
          <Section title="Personal Information" icon={<User className="w-3.5 h-3.5 text-violet-600" />} delay={0.1}>
            <div className="space-y-2">
              <InfoItem icon={<User className="w-3.5 h-3.5 text-violet-500" />} label="First Name" value={user.firstName || "N/A"} />
              <InfoItem icon={<User className="w-3.5 h-3.5 text-violet-500" />} label="Last Name" value={user.lastName || "N/A"} />
              <InfoItem icon={<Calendar className="w-3.5 h-3.5 text-violet-500" />} label="Date of Birth" value={formatDate(user.dateOfBirth)} />
              <InfoItem icon={<User className="w-3.5 h-3.5 text-violet-500" />} label="Gender" value={formatGender(user.gender)} />
            </div>
          </Section>

          <Section title="Contact Information" icon={<Phone className="w-3.5 h-3.5 text-violet-600" />} delay={0.2}>
            <div className="space-y-2">
              <InfoItem icon={<Phone className="w-3.5 h-3.5 text-violet-500" />} label="Mobile Number" value={maskPhone(user.mobileNumber)} masked />
              <InfoItem icon={<Mail className="w-3.5 h-3.5 text-violet-500" />} label="Email Address" value={user.email || "N/A"} />
              <InfoItem icon={<MapPin className="w-3.5 h-3.5 text-violet-500" />} label="Pincode" value={user.pincode || "N/A"} />
              <InfoItem icon={<CreditCard className="w-3.5 h-3.5 text-violet-500" />} label="PAN Number" value={maskPan(user.panNumber)} masked />
            </div>
          </Section>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <Section title="Employment Details" icon={<Briefcase className="w-3.5 h-3.5 text-violet-600" />} delay={0.3}>
            <div className="space-y-2">
              <InfoItem icon={<Briefcase className="w-3.5 h-3.5 text-violet-500" />} label="Employment Type" value={formatJobType(user.jobType)} />
              <InfoItem icon={<IndianRupee className="w-3.5 h-3.5 text-violet-500" />} label="Monthly Income" value={formatAmount(user.monthlySalary)} />
            </div>
          </Section>

          <Section title="Loan Details" icon={<Wallet className="w-3.5 h-3.5 text-violet-600" />} delay={0.4}>
            <div className="space-y-2">
              <InfoItem icon={<Wallet className="w-3.5 h-3.5 text-violet-500" />} label="Loan Amount" value={formatAmount(user.loanAmount)} />
              <InfoItem icon={<Target className="w-3.5 h-3.5 text-violet-500" />} label="Loan Purpose" value={user.loanPurpose || "N/A"} />
            </div>
          </Section>
        </div>

        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex items-center gap-3 p-3 bg-violet-50 rounded-xl border border-violet-100"
        >
          <div className="w-8 h-8 shrink-0 rounded-lg bg-violet-100 flex items-center justify-center">
            <Shield className="w-4 h-4 text-violet-600" />
          </div>
          <div>
            <p className="text-xs text-gray-600">
              <span className="font-medium text-gray-700">Your data is secure.</span> Bank-grade encryption protects your information.
            </p>
          </div>
        </motion.div>

        {/* Exclusive Benefits Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 mt-2"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-lg bg-violet-100 flex items-center justify-center">
              <Star className="w-2 h-2 text-violet-600 fill-violet-600" />
            </div>
            <h3 className="text-xs font-semibold text-gray-800">Exclusive Benefits for You</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div className="flex items-start gap-3 p-2 bg-violet-50 rounded-xl">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-violet-100 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-violet-600" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-violet-600 mb-1">Pre-approved Offers</h4>
                <p className="text-[10px] text-gray-600 leading-relaxed">
                  Get instant pre-approved loan offers with lower interest rates.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-2 bg-emerald-50 rounded-xl">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Zap className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-emerald-600 mb-1">Faster Processing</h4>
                <p className="text-[10px] text-gray-600 leading-relaxed">
                  Enjoy priority processing on your loan applications.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-2 bg-orange-50 rounded-xl">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-orange-100 flex items-center justify-center">
                <Headphones className="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-orange-500 mb-1">Priority Support</h4>
                <p className="text-[10px] text-gray-600 leading-relaxed">
                  Get dedicated support for all your queries.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
