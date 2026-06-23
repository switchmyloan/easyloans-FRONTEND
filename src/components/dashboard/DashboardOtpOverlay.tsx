"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";

interface DashboardOtpOverlayProps {
  maskedPhone: string;
  onVerify: (otp: string) => Promise<boolean>;
  onResend: () => Promise<void>;
  onCancel?: () => void;
  error?: string | null;
}

const OTP_LENGTH = 4;
const RESEND_COOLDOWN = 30;

export default function DashboardOtpOverlay({
  maskedPhone,
  onVerify,
  onResend,
  onCancel,
  error: externalError,
}: DashboardOtpOverlayProps) {
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(RESEND_COOLDOWN);
  const [internalError, setInternalError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const error = externalError || internalError;

  // Focus first input on mount
  useEffect(() => {
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
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
    setInternalError(null);

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
      setInternalError(null);
      try {
        const success = await onVerify(code);
        if (!success) {
          setInternalError("Invalid OTP. Please try again.");
          setOtp(Array(OTP_LENGTH).fill(""));
          inputRefs.current[0]?.focus();
        }
      } catch {
        setInternalError("Verification failed. Please try again.");
      } finally {
        setIsVerifying(false);
      }
    },
    [otp, onVerify]
  );

  const handleResend = async () => {
    setIsResending(true);
    setInternalError(null);
    try {
      await onResend();
      setResendTimer(RESEND_COOLDOWN);
      setOtp(Array(OTP_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } catch {
      setInternalError("Failed to resend OTP. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const isComplete = otp.every((d) => d !== "");

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Full screen backdrop - blocks all interactions */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="relative z-10 w-full max-w-sm mx-4"
      >
        <div
          className="w-full rounded-2xl px-6 py-7 relative overflow-hidden shadow-2xl"
          style={{
            background:
              "linear-gradient(135deg, #5b2ee0 0%, #6d45d4 35%, #8b6fc0 70%, #9a85bd 100%)",
          }}
        >
          {/* Close button */}
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="Close"
            >
              <svg
                className="w-4 h-4 text-white/70"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}

          {/* Decorative blurs */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-36 h-36 bg-[#A6FF00]/5 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10">
            {/* Lock icon */}
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center">
                <svg
                  className="w-7 h-7 text-[#A6FF00]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
            </div>

            <h2 className="text-white text-xl font-semibold text-center mb-1">
              Verify Your Identity
            </h2>
            <p className="text-white/60 text-sm text-center mb-2">
              Please verify to access the dashboard
            </p>
            <p className="text-white/50 text-xs text-center mb-6">
              OTP sent to{" "}
              <span className="text-white/80 font-medium">{maskedPhone}</span>
            </p>

            {error && (
              <div className="mb-4 bg-red-500/20 border border-red-400/30 text-red-200 px-4 py-2.5 rounded-xl text-sm flex items-center gap-2">
                <svg
                  className="w-4 h-4 shrink-0"
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
              <div className="flex justify-center gap-3 mb-6">
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
                    className="w-14 h-14 text-center text-2xl font-bold text-white bg-white/10 border-2 border-white/20 rounded-xl focus:border-[#A6FF00] focus:bg-white/15 outline-none transition-all duration-200 backdrop-blur-sm"
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={!isComplete || isVerifying}
                className="w-full bg-white text-gray-800 font-semibold py-3.5 rounded-xl hover:bg-gray-50 active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-black/10"
              >
                {isVerifying ? "Verifying..." : "Verify & Continue"}
              </button>
            </form>

            <div className="text-center mt-5">
              {resendTimer > 0 ? (
                <p className="text-white/40 text-sm">
                  Resend OTP in{" "}
                  <span className="text-white/70 font-medium">{resendTimer}s</span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResending}
                  className="text-[#A6FF00] hover:text-[#c4ff70] text-sm font-medium transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isResending ? "Sending..." : "Resend OTP"}
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
