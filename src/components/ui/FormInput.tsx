"use client";

import type { InputHTMLAttributes } from "react";
import type { FieldError, UseFormRegisterReturn } from "react-hook-form";

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: FieldError;
  registration: UseFormRegisterReturn;
  hint?: string;
  prefix?: string;
}

export default function FormInput({
  label,
  error,
  registration,
  hint,
  prefix,
  id,
  className,
  ...rest
}: FormInputProps) {
  return (
    <div className="flex flex-col gap-1.5 2xl:gap-2">
      <label htmlFor={id} className="text-white/90 text-[13px] font-medium tracking-wide 2xl:text-sm 3xl:text-base">
        {label}
      </label>
      <div className={prefix ? "relative" : undefined}>
        {prefix && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50 font-medium text-sm pointer-events-none 2xl:text-base 2xl:left-5 3xl:text-lg 3xl:left-6">
            {prefix}
          </span>
        )}
        <input
          id={id}
          {...registration}
          {...rest}
          className={`w-full rounded-xl px-4 py-2 bg-white/[0.12] backdrop-blur-sm border text-white placeholder:text-white/40 focus:outline-none focus:bg-white/[0.18] focus:border-white/50 focus:shadow-[0_0_0_3px_rgba(255,255,255,0.08)] transition-all duration-200 2xl:px-5 2xl:py-2.5 2xl:text-base 2xl:rounded-2xl 3xl:px-6 3xl:py-3 3xl:text-lg ${
            error ? "border-red-400/80" : "border-white/20"
          } ${prefix ? "pl-12 2xl:pl-14 3xl:pl-16" : ""} ${className ?? ""}`}
        />
      </div>
      {hint && !error && (
        <span className="text-white/40 text-xs pl-1 2xl:text-sm 3xl:text-base">{hint}</span>
      )}
      {error && (
        <span className="text-red-300 text-xs pl-1 2xl:text-sm 3xl:text-base">{error.message}</span>
      )}
    </div>
  );
}
