"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { stage1Schema } from "@/lib/schemas";
import type { Stage1Data } from "@/lib/types";
import { motion } from "framer-motion";
import FormInput from "@/components/ui/FormInput";
import ProgressBar from "@/components/ui/ProgressBar";

interface Stage1FormProps {
  onSubmit: (data: Stage1Data) => void;
  defaultValues?: Partial<Stage1Data>;
}

export default function Stage1Form({ onSubmit, defaultValues }: Stage1FormProps) {
  const [showFullCredit, setShowFullCredit] = useState(false);
  const [showFullComm, setShowFullComm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Stage1Data>({
    resolver: yupResolver(stage1Schema),
    defaultValues,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full rounded-2xl px-7 sm:px-10 py-9 relative overflow-hidden shadow-2xl shadow-[#4d2adf]/20"
      style={{
        background: "linear-gradient(135deg, #5b2ee0 0%, #6d45d4 35%, #8b6fc0 70%, #9a85bd 100%)",
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
            label="First Name"
            type="text"
            placeholder="Enter your first name"
            registration={register("name")}
            error={errors.name}
          />

          <FormInput
            id="mobile"
            label="Mobile Number"
            type="tel"
            maxLength={10}
            placeholder="10-digit mobile number"
            // prefix="+91"
            registration={register("mobile")}
            error={errors.mobile}
          />

          {/* Consent checkboxes */}
          <div className="flex flex-col gap-3 mt-2">
            <label className="flex items-start gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                {...register("consent_tnc")}
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
              <p className="text-red-300 text-[11px] -mt-2 ml-6">{errors.consent_tnc.message}</p>
            )}

            <div className="flex items-start gap-2.5 group">
              <input
                type="checkbox"
                {...register("consent_credit")}
                className="mt-1 h-4 w-4 accent-[#A6FF00] rounded cursor-pointer shrink-0"
              />
              <span className="text-white/70 text-[11px] leading-normal">
                I hereby consent to Cready being appointed as my authorised representative to receive my Credit Information{" "}
                {showFullCredit ? (
                  <>
                    from Experian/Credit/EQUIFAX/CRIF for the purpose of Credit Assessment to Advise on loan offers, or expiry of 6 months; whichever is earlier. I also agree that this consent would be shared with Lending Partners to Process my loan application.{" "}
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
              <p className="text-red-300 text-[11px] -mt-2 ml-6">{errors.consent_credit.message}</p>
            )}

            <div className="flex items-start gap-2.5 group">
              <input
                type="checkbox"
                {...register("consent_communication")}
                className="mt-1 h-4 w-4 accent-[#A6FF00] rounded cursor-pointer shrink-0"
              />
              <span className="text-white/70 text-[11px] leading-normal">
                I hereby consent to receive loan related communication from Cready or its authorized representatives{" "}
                {showFullComm ? (
                  <>
                    via Call, SMS, Email, RCS & Voice over Internet Protocol (VoIP) including WhatsApp.{" "}
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
              <p className="text-red-300 text-[11px] -mt-2 ml-6">{errors.consent_communication.message}</p>
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
