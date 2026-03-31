"use client";

import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { stage2Schema } from "@/lib/schemas";
import type { Stage2Data } from "@/lib/types";
import { motion } from "framer-motion";
import FormInput from "@/components/ui/FormInput";
import GenderToggle from "@/components/ui/GenderToggle";
import JobTypeToggle from "@/components/ui/JobTypeToggle";
import ProgressBar from "@/components/ui/ProgressBar";

interface Stage2Defaults {
  first_name?: string;
  last_name?: string;
  email?: string;
  gender?: string;
  pincode?: string;
  pan_no?: string;
  dob?: string | Date;
  profile?: string;
  monthly_income?: number;
  loan_purpose?: string;
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
      profile: "Salaried",
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
          {/* Row 1: First Name + Last Name */}
          <div className="grid grid-cols-2 gap-3">
            <FormInput
              id="first_name"
              label="First Name"
              type="text"
              placeholder="Rahul"
              registration={register("first_name")}
              error={errors.first_name}
            />
            <FormInput
              id="last_name"
              label="Last Name"
              type="text"
              placeholder="Kumar"
              registration={register("last_name")}
              error={errors.last_name}
            />
          </div>

          {/* Row 2: Email + Gender */}
          <div className="grid grid-cols-2 gap-3">
            <FormInput
              id="email"
              label="Email"
              type="email"
              placeholder="you@example.com"
              registration={register("email")}
              error={errors.email}
            />
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
          </div>

          {/* Row 3: Pincode + PAN */}
          <div className="grid grid-cols-2 gap-3">
            <FormInput
              id="pincode"
              label="Pincode"
              type="text"
              maxLength={6}
              placeholder="400001"
              registration={register("pincode")}
              error={errors.pincode}
            />
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
          </div>

          {/* Row 4: DOB + Job Type */}
          <div className="grid grid-cols-2 gap-3">
            <FormInput
              id="dob"
              label="Date of Birth"
              type="date"
              registration={register("dob")}
              error={errors.dob}
              max={new Date().toISOString().split("T")[0]}
            />
            <Controller
              name="profile"
              control={control}
              render={({ field }) => (
                <JobTypeToggle
                  value={field.value}
                  onChange={field.onChange}
                  error={errors.profile}
                />
              )}
            />
          </div>

          {/* Row 5: Monthly Salary */}
          <div className="grid grid-cols-2 gap-3">
            <FormInput
              id="monthly_income"
              label="Monthly Salary"
              type="number"
              placeholder="45000"
              // prefix="₹"
              registration={register("monthly_income")}
              error={errors.monthly_income}
            />

            {/* Row 6: Loan Purpose */}
          {/* <div className="grid grid-cols-2 gap-3"> */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="loan_purpose" className="text-white/90 text-[13px] font-medium tracking-wide">
                Loan Purpose
              </label>
              <select
                id="loan_purpose"
                {...register("loan_purpose")}
                className={`w-full rounded-xl px-4 py-3 bg-white/[0.12] backdrop-blur-sm border text-white focus:outline-none focus:bg-white/[0.18] focus:border-white/50 focus:shadow-[0_0_0_3px_rgba(255,255,255,0.08)] transition-all duration-200 ${
                  errors.loan_purpose ? "border-red-400/80" : "border-white/20"
                }`}
              >
                <option value="" className="text-gray-800">Select purpose</option>
                <option value="Home Renovation" className="text-gray-800">Home Renovation</option>
                <option value="Medical Emergency" className="text-gray-800">Medical Emergency</option>
                <option value="Education" className="text-gray-800">Education</option>
                <option value="Wedding" className="text-gray-800">Wedding</option>
                <option value="Travel" className="text-gray-800">Travel</option>
                <option value="Debt Consolidation" className="text-gray-800">Debt Consolidation</option>
                <option value="Others" className="text-gray-800">Others</option>
              </select>
              {errors.loan_purpose && (
                <span className="text-red-300 text-xs pl-1">{errors.loan_purpose.message}</span>
              )}
            </div>
          {/* </div> */}
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
