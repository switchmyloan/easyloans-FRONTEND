"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import ProgressBar from "@/components/ui/ProgressBar";

interface OtpFormProps {
  mobile: string;
  onVerify: (otp: string) => Promise<void>;
  onResend: () => Promise<void>;
  onBack: () => void;
  error?: string | null;
}

const OTP_LENGTH = 4;
const RESEND_COOLDOWN = 30;

export default function OtpForm({
  mobile,
  onVerify,
  onResend,
  onBack,
  error,
}: OtpFormProps) {
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(RESEND_COOLDOWN);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Resend countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;

    const newOtp = [...otp];
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtp(newOtp);

    const focusIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      const code = otp.join("");
      if (code.length !== OTP_LENGTH) return;

      setIsVerifying(true);
      try {
        await onVerify(code);
      } finally {
        setIsVerifying(false);
      }
    },
    [otp, onVerify]
  );

  const handleResend = async () => {
    setIsResending(true);
    try {
      await onResend();
      setResendTimer(RESEND_COOLDOWN);
      setOtp(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } finally {
      setIsResending(false);
    }
  };

  const maskedMobile = `******${mobile.slice(-4)}`;
  const isComplete = otp.every((d) => d !== "");

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full max-w-sm mx-auto rounded-xl sm:rounded-2xl px-4 sm:px-8 py-5 sm:py-7 relative overflow-hidden shadow-xl sm:shadow-2xl shadow-[#4d2adf]/20 lg:mt-20 mt-0"
      style={{
        background:
          "linear-gradient(135deg, #5b2ee0 0%, #6d45d4 35%, #8b6fc0 70%, #9a85bd 100%)",
      }}
    >
      <div className="absolute -top-12 -right-12 w-32 sm:w-48 h-32 sm:h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-24 sm:w-36 h-24 sm:h-36 bg-[#A6FF00]/5 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10">
        <ProgressBar percent={50} />

        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 text-white/60 hover:text-white text-xs sm:text-sm mt-4 sm:mt-6 mb-1.5 sm:mb-2 transition-colors cursor-pointer"
        >
          <svg
            className="w-3.5 h-3.5 sm:w-4 sm:h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </button>

        <h2 className="text-white text-lg sm:text-[22px] font-semibold mb-0.5 sm:mb-1">
          Verify your number
        </h2>
        <p className="text-white/50 text-xs sm:text-sm mb-5 sm:mb-7">
          We&apos;ve sent a 4-digit OTP to{" "}
          <span className="text-white/80 font-medium">{maskedMobile}</span>
        </p>

        {error && (
          <div className="mb-3 sm:mb-4 bg-red-500/20 border border-red-400/30 text-red-200 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm flex items-center gap-2">
            <svg
              className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="flex justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => {
                  inputRefs.current[i] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={i === 0 ? handlePaste : undefined}
                className="w-12 h-12 sm:w-14 sm:h-14 text-center text-xl sm:text-2xl font-bold text-white bg-white/10 border-2 border-white/20 rounded-lg sm:rounded-xl focus:border-[#A6FF00] focus:bg-white/15 outline-none transition-all duration-200 backdrop-blur-sm"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={!isComplete || isVerifying}
            className="w-full bg-white text-sm sm:text-base font-semibold py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl hover:bg-gray-50 active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-black/10 text-gray-800"
          >
            {isVerifying ? "Verifying..." : "Verify OTP"}
          </button>
        </form>

        <div className="text-center mt-3 sm:mt-5">
          {resendTimer > 0 ? (
            <p className="text-white/40 text-xs sm:text-sm">
              Resend OTP in{" "}
              <span className="text-white/70 font-medium">
                {resendTimer}s
              </span>
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="text-[#A6FF00] hover:text-[#c4ff70] text-xs sm:text-sm font-medium transition-colors cursor-pointer disabled:opacity-50"
            >
              {isResending ? "Sending..." : "Resend OTP"}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
