"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { stage1Schema } from "@/lib/schemas";
import type { Stage1Data } from "@/lib/types";
import { motion } from "framer-motion";
import FormInput from "@/components/ui/FormInput";
import ProgressBar from "@/components/ui/ProgressBar";

function formatIndianCurrency(num: number): string {
  return "₹" + num.toLocaleString("en-IN");
}

function numberToIndianWords(num: number): string {
  if (num === 0) return "Zero";
  const ones = [
    "",
    "One",
    "Two",
    "Three",
    "Four",
    "Five",
    "Six",
    "Seven",
    "Eight",
    "Nine",
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];
  const tens = [
    "",
    "",
    "Twenty",
    "Thirty",
    "Forty",
    "Fifty",
    "Sixty",
    "Seventy",
    "Eighty",
    "Ninety",
  ];

  function convert(n: number): string {
    if (n < 20) return ones[n];
    if (n < 100)
      return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
    if (n < 1000)
      return (
        ones[Math.floor(n / 100)] +
        " Hundred" +
        (n % 100 ? " " + convert(n % 100) : "")
      );
    if (n < 100000)
      return (
        convert(Math.floor(n / 1000)) +
        " Thousand" +
        (n % 1000 ? " " + convert(n % 1000) : "")
      );
    if (n < 10000000)
      return (
        convert(Math.floor(n / 100000)) +
        " Lakh" +
        (n % 100000 ? " " + convert(n % 100000) : "")
      );
    return (
      convert(Math.floor(n / 10000000)) +
      " Crore" +
      (n % 10000000 ? " " + convert(n % 10000000) : "")
    );
  }

  return convert(num) + " Only";
}

interface Stage1FormProps {
  onSubmit: (data: Stage1Data) => void;
  onChange?: (data: Partial<Stage1Data>) => void;
  defaultValues?: Partial<Stage1Data>;
}

export default function Stage1Form({
  onSubmit,
  onChange,
  defaultValues,
}: Stage1FormProps) {
  const [showFullCredit, setShowFullCredit] = useState(false);
  const [showFullComm, setShowFullComm] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<Stage1Data>({
    resolver: yupResolver(stage1Schema),
    defaultValues: { loan_amount: 5000, ...defaultValues },
  });

  const lastEmittedRef = useRef("");
  const loanAmount = watch("loan_amount");

  const splitFullName = (fullName: string) => {
    if (!fullName) return { firstName: "", lastName: "" };

    const parts = fullName.trim().split(/\s+/);

    return {
      firstName: parts[0] || "",
      lastName: parts.length > 1 ? parts[parts.length - 1] : "",
    };
  };

  useEffect(() => {
    if (!onChange) return;

    const subscription = watch((value, info) => {
      if (info.type !== "change") return;

      const nextValue = value as Partial<Stage1Data>;
      const serialized = JSON.stringify(nextValue);

      if (serialized === lastEmittedRef.current) return;

      lastEmittedRef.current = serialized;
      onChange(nextValue);
    });

    return () => subscription.unsubscribe();
  }, [onChange, watch]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full rounded-2xl px-7 sm:px-10 py-9 relative overflow-hidden shadow-2xl shadow-[#4d2adf]/20"
      style={{
        background:
          "linear-gradient(135deg, #5b2ee0 0%, #6d45d4 35%, #8b6fc0 70%, #9a85bd 100%)",
      }}
    >
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-[#A6FF00]/5 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10">
        <ProgressBar percent={30} />

        <h2 className="text-white text-[22px] font-semibold mt-7 mb-1">
          Let&apos;s get started
        </h2>
        <p className="text-white/50 text-sm mb-7">
          Enter your name and mobile number to begin
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <FormInput
            id="name"
            label="Full Name"
            type="text"
            placeholder="Enter your full name as per PAN"
            autoComplete="name"
            registration={register("fullName", {
              onChange: (e) => {
                const sanitized = e.target.value
                  .replace(/[^A-Za-z ]/g, "")
                  .replace(/\s{2,}/g, " ");
                if (sanitized !== e.target.value) {
                  e.target.value = sanitized;
                }

                const { firstName, lastName } = splitFullName(sanitized);
                setValue("firstName", firstName);
                setValue("lastName", lastName);
              },
            })}
            error={errors.fullName}
          />
          <FormInput
            id="mobile"
            label="Mobile Number"
            type="tel"
            maxLength={10}
            inputMode="numeric"
            autoComplete="tel"
            placeholder="10-digit mobile number"
            // prefix="+91"
            registration={register("mobile", {
              onChange: (e) => {
                const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                if (digits !== e.target.value) {
                  e.target.value = digits;
                }
              },
            })}
            error={errors.mobile}
          />

          {/* Loan Amount Slider */}
          <div className="flex flex-col gap-2">
            <label className="text-white/80 text-sm font-medium">
              Loan Amount
            </label>
            <p className="text-white text-2xl font-bold tracking-tight">
              {formatIndianCurrency(loanAmount)}
            </p>
            <p className="text-white/40 text-xs italic">
              {numberToIndianWords(loanAmount)}
            </p>
            <input
              type="range"
              min={5000}
              max={200000}
              step={5000}
              {...register("loan_amount", { valueAsNumber: true })}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer accent-[#1a1a2e] bg-white/20
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#1a1a2e] [&::-webkit-slider-thumb]:shadow-md
                [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#1a1a2e] [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:shadow-md"
            />
            <div className="flex justify-between text-white/40 text-[11px]">
              <span>₹5,000</span>
              <span>₹2,00,000</span>
            </div>
            {errors.loan_amount && (
              <p className="text-red-300 text-[11px]">
                {errors.loan_amount.message}
              </p>
            )}
          </div>

          {/* Consent checkboxes */}
          <div className="flex flex-col gap-3 mt-2">
            <label className="flex items-start gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                {...register("consent_tnc")}
                defaultChecked={true}
                className="mt-1 h-4 w-4 accent-[#A6FF00] rounded cursor-pointer shrink-0"
              />
              <span className="text-white/70 text-[11px] leading-normal group-hover:text-white/90 transition-colors">
                I have read and agree to the{" "}
                <a
                  href="https://www.cready.in/terms-condition"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#A6FF00] underline underline-offset-2"
                >
                  Terms & Conditions
                </a>{" "}
                and{" "}
                <a
                  href="https://www.cready.in/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#A6FF00] underline underline-offset-2"
                >
                  Privacy Policy
                </a>
                .
              </span>
            </label>
            {errors.consent_tnc && (
              <p className="text-red-300 text-[11px] -mt-2 ml-6">
                {errors.consent_tnc.message}
              </p>
            )}

            <div className="flex items-start gap-2.5 group">
              <input
                type="checkbox"
                {...register("consent_credit")}
                defaultChecked={true}
                className="mt-1 h-4 w-4 accent-[#A6FF00] rounded cursor-pointer shrink-0"
              />
              <span className="text-white/70 text-[11px] leading-normal">
                I hereby consent to Cready being appointed as my authorised
                representative to receive my Credit Information{" "}
                {showFullCredit ? (
                  <>
                    from Experian/Credit/EQUIFAX/CRIF for the purpose of Credit
                    Assessment to Advise on loan offers, or expiry of 6 months;
                    whichever is earlier. I also agree that this consent would
                    be shared with Lending Partners to Process my loan
                    application.{" "}
                    <button
                      type="button"
                      onClick={() => setShowFullCredit(false)}
                      className="text-[#A6FF00] underline underline-offset-2 cursor-pointer"
                    >
                      Read less
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowFullCredit(true)}
                    className="text-[#A6FF00] underline underline-offset-2 cursor-pointer"
                  >
                    Read more
                  </button>
                )}
              </span>
            </div>
            {errors.consent_credit && (
              <p className="text-red-300 text-[11px] -mt-2 ml-6">
                {errors.consent_credit.message}
              </p>
            )}

            <div className="flex items-start gap-2.5 group">
              <input
                type="checkbox"
                {...register("consent_communication")}
                defaultChecked={true}
                className="mt-1 h-4 w-4 accent-[#A6FF00] rounded cursor-pointer shrink-0"
              />
              <span className="text-white/70 text-[11px] leading-normal">
                I hereby consent to receive loan related communication from
                Cready or its authorized representatives{" "}
                {showFullComm ? (
                  <>
                    via Call, SMS, Email, RCS & Voice over Internet Protocol
                    (VoIP) including WhatsApp.{" "}
                    <button
                      type="button"
                      onClick={() => setShowFullComm(false)}
                      className="text-[#A6FF00] underline underline-offset-2 cursor-pointer"
                    >
                      Read less
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowFullComm(true)}
                    className="text-[#A6FF00] underline underline-offset-2 cursor-pointer"
                  >
                    Read more
                  </button>
                )}
              </span>
            </div>
            {errors.consent_communication && (
              <p className="text-red-300 text-[11px] -mt-2 ml-6">
                {errors.consent_communication.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-5 bg-white font-semibold py-3.5 rounded-xl hover:bg-gray-50 active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-black/10 text-gray-800"
          >
            {isSubmitting ? "Submitting..." : "Next"}
          </button>
        </form>
      </div>
    </motion.div>
  );
}
