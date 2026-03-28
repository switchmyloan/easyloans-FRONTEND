"use client";

import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { stage2Schema } from "@/lib/schemas";
import type { Stage2Data } from "@/lib/types";
import { PROFILE_OPTIONS } from "@/lib/constants";
import { motion } from "framer-motion";
import FormInput from "@/components/ui/FormInput";
import FormSelect from "@/components/ui/FormSelect";
import GenderToggle from "@/components/ui/GenderToggle";
import ProgressBar from "@/components/ui/ProgressBar";

interface Stage2Defaults {
  last_name?: string;
  email?: string;
  gender?: string;
  pincode?: string;
  pan_no?: string;
  dob?: string | Date;
  profile?: string;
  monthly_income?: number;
}

interface Stage2FormProps {
  onSubmit: (data: Stage2Data) => void;
  defaultValues?: Stage2Defaults;
  isPrefilled?: boolean;
}

export default function Stage2Form({ onSubmit, defaultValues, isPrefilled }: Stage2FormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<Stage2Data>({
    resolver: yupResolver(stage2Schema),
    defaultValues: {
      gender: "Male",
      ...defaultValues,
    } as Record<string, unknown>,
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full rounded-2xl px-5 sm:px-8 py-6 relative overflow-hidden shadow-2xl shadow-[#4d2adf]/20"
      style={{
        background: "linear-gradient(135deg, #5b2ee0 0%, #6d45d4 35%, #8b6fc0 70%, #9a85bd 100%)",
      }}
    >
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-white/5 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-[#A6FF00]/5 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10">
        <ProgressBar percent={75} />

        <h2 className="text-white text-lg font-semibold mt-5 mb-0.5">
          {isPrefilled ? "Review your details" : "A few more details..."}
        </h2>
        <p className="text-white/50 text-xs mb-5">
          {isPrefilled
            ? "We found your info on file — verify and update if needed"
            : "Complete your profile to see loan offers"}
        </p>

        {/* {isPrefilled && (
          <div className="flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-4 py-2.5 mb-4">
            <svg className="w-4 h-4 text-amber-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-white/70 text-xs">
              Fields are pre-filled from your previous application. You can edit any field.
            </p>
          </div>
        )} */}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
          {/* Row 1: Last Name + Email */}
          <div className="grid grid-cols-2 gap-3">
            <FormInput
              id="last_name"
              label="Last Name"
              type="text"
              placeholder="Kumar"
              registration={register("last_name")}
              error={errors.last_name}
            />
            <FormInput
              id="email"
              label="Email"
              type="email"
              placeholder="you@example.com"
              registration={register("email")}
              error={errors.email}
            />
          </div>

          {/* Row 2: Gender + Pincode */}
          <div className="grid grid-cols-2 gap-3">
            <Controller
              name="gender"
              control={control}
              render={({ field }) => (
                <GenderToggle
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.gender}
                />
              )}
            />
            <FormInput
              id="pincode"
              label="Pincode"
              type="text"
              maxLength={6}
              placeholder="400001"
              registration={register("pincode")}
              error={errors.pincode}
            />
          </div>

          {/* Row 3: PAN + DOB */}
          <div className="grid grid-cols-2 gap-3">
            <FormInput
              id="pan_no"
              label="PAN Number"
              type="text"
              maxLength={10}
              placeholder="ABCDE1234F"
              registration={register("pan_no", {
                onChange: (e) => {
                  e.target.value = e.target.value.toUpperCase();
                },
              })}
              error={errors.pan_no}
              style={{ textTransform: "uppercase" }}
            />
            <FormInput
              id="dob"
              label="Date of Birth"
              type="date"
              registration={register("dob")}
              error={errors.dob}
              max={new Date().toISOString().split("T")[0]}
            />
          </div>

          {/* Row 4: Job Type + Salary */}
          <div className="grid grid-cols-2 gap-3">
            <FormSelect
              id="profile"
              label="Job Type"
              options={PROFILE_OPTIONS}
              placeholder="Select"
              registration={register("profile")}
              error={errors.profile}
            />
            <FormInput
              id="monthly_income"
              label="Monthly Salary"
              type="number"
              placeholder="45000"
              prefix="₹"
              registration={register("monthly_income")}
              error={errors.monthly_income}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-3 font-semibold py-3 rounded-xl active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-black/10 text-gray-800"
            style={{
              background: "linear-gradient(88.52deg, #E1E4F3 -17.33%, #A6FF00 100%)",
            }}
          >
            {isSubmitting ? "Submitting..." : "Get Loan Offers"}
            {!isSubmitting && <span>&rarr;</span>}
          </button>
        </form>
      </div>
    </motion.div>
  );
}
