"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  Mail,
  MapPin,
  Clock,
  Headphones,
  ChevronRight,
  Copy,
  Check,
  Send,
  Building2,
  HelpCircle,
  Zap,
} from "lucide-react";

// ============================================================
// Sub-Components
// ============================================================
interface QuickContactCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: number;
  onClick?: () => void;
}

function QuickContactCard({ icon, title, description, delay = 0, onClick }: QuickContactCardProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      onClick={onClick}
      className="flex items-center gap-2.5 bg-white rounded-lg border border-gray-100 shadow-sm px-3 py-2.5 hover:shadow-md hover:border-violet-200 transition-all w-full text-left group"
    >
      <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
        <p className="text-xs text-gray-500 truncate">{description}</p>
      </div>
      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-violet-500 transition-colors" />
    </motion.button>
  );
}

// ============================================================
// Contact Us Page Component
// ============================================================
export default function ContactUsPage() {
  const [copied, setCopied] = useState(false);
  const email = "support@cready.in";
  const website = "https://www.cready.in";
  const address = "902, 9th Floor, Shubhjivan Arcade, Swami Vivekanand Rd, Mhatre Wadi, Borivali West, Mumbai, Maharashtra - 400092";
  const mapUrl = "https://www.google.com/maps/dir//Shubhjivan+Arcade,+Swami+Vivekanand+Rd,+Mhatre+Wadi,+Borivali+West,+Mumbai,+Maharashtra+400092";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleEmail = () => {
    window.location.href = `mailto:${email}`;
  };

  const handleDirections = () => {
    window.open(mapUrl, "_blank");
  };

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

      {/* Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl overflow-hidden mb-6"
      >
        <div className="bg-gradient-to-r from-violet-600 via-violet-500 to-[#A23AFC] p-4 sm:p-6 relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full" />
            <div className="absolute -bottom-32 -left-20 w-80 h-80 bg-white/5 rounded-full" />
          </div>

          <div className="relative flex items-start gap-3 sm:gap-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
              <Headphones className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-2xl font-bold text-white mb-1">Contact Support</h1>
              <p className="text-xs sm:text-sm text-violet-100">
                We&apos;re here to help you with any questions or concerns
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Contact Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-4"
      >
        <h2 className="text-sm font-semibold text-gray-800 mb-3">Quick Contact</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <QuickContactCard
            icon={<Mail className="w-5 h-5 text-violet-600" />}
            title="Email Us"
            description="Send us an email"
            delay={0.15}
            onClick={handleEmail}
          />
          <QuickContactCard
            icon={<Zap className="w-5 h-5 text-violet-600" />}
            title="Visit Website"
            description={website}
            delay={0.2}
            onClick={() => window.open(website, "_blank", "noopener,noreferrer")}
          />
          <QuickContactCard
            icon={<MapPin className="w-5 h-5 text-violet-600" />}
            title="Visit Us"
            description="Our office address"
            delay={0.25}
            onClick={handleDirections}
          />
        </div>
      </motion.div>

      {/* Main Contact Cards - Two Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Email Us Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
        >
          <div className="flex items-start gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4 text-violet-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-800">Email Us</h3>
              <p className="text-xs text-gray-500">
                Send us an email and we&apos;ll respond within 24 hours
              </p>
            </div>
          </div>

          {/* Email with Copy */}
          <div className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3 mb-3">
            <span className="text-sm font-medium text-gray-700">{email}</span>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-violet-600 hover:text-violet-700 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy
                </>
              )}
            </button>
          </div>

          {/* Response time note */}
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
            <Clock className="w-4 h-4" />
            <span>Typically replies within 24 hours</span>
          </div>

          {/* Send Email Button */}
          <button
            onClick={handleEmail}
            className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white font-medium py-2 rounded-lg transition-colors"
          >
            <Send className="w-4 h-4" />
            Send Email
          </button>
        </motion.div>

        {/* Visit Us Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
        >
          <div className="flex items-start gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4 text-violet-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-800">Visit Us</h3>
              <p className="text-xs text-gray-500">Our office address</p>
            </div>
          </div>

          {/* Address */}
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-violet-600" />
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{address}</p>
          </div>

          {/* Embedded Google Map */}
          <div className="relative w-full h-32 rounded-lg overflow-hidden mb-4">
            <iframe
              src="https://maps.google.com/maps?q=Shubhjivan+Arcade,+Swami+Vivekanand+Rd,+Mhatre+Wadi,+Borivali+West,+Mumbai,+Maharashtra+400092&t=&z=15&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Office Location"
              className="absolute inset-0"
            />
          </div>

          {/* Get Directions Button */}
          <button
            onClick={handleDirections}
            className="w-full flex items-center justify-center gap-2 border-2 border-violet-600 text-violet-600 hover:bg-violet-50 font-medium py-2 rounded-lg transition-colors"
          >
            <Send className="w-4 h-4 rotate-45" />
            Get Directions
          </button>
        </motion.div>
      </div>

      {/* Still have questions? */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-gray-50 rounded-xl border border-gray-100 p-4 sm:p-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-violet-100 flex items-center justify-center shrink-0">
              <HelpCircle className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-800">Still have questions?</h3>
              <p className="text-xs text-gray-500">
                Check out our <span className="text-violet-600 font-medium">FAQs</span> or browse our help center for more information.
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/faq"
            className="inline-flex items-center justify-center gap-1 px-4 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-white hover:border-violet-200 hover:text-violet-600 transition-all w-full sm:w-auto"
          >
            View FAQs
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
