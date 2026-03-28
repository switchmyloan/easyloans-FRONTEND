"use client";

import type { FieldError, UseFormRegisterReturn } from "react-hook-form";

interface FormSelectProps {
  id: string;
  label: string;
  options: readonly string[];
  placeholder: string;
  error?: FieldError;
  registration: UseFormRegisterReturn;
}

export default function FormSelect({
  id,
  label,
  options,
  placeholder,
  error,
  registration,
}: FormSelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-white/90 text-[13px] font-medium tracking-wide">
        {label}
      </label>
      <select
        id={id}
        {...registration}
        className={`w-full rounded-xl px-4 py-3 bg-white/[0.12] backdrop-blur-sm border text-white focus:outline-none focus:bg-white/[0.18] focus:border-white/50 focus:shadow-[0_0_0_3px_rgba(255,255,255,0.08)] appearance-none cursor-pointer transition-all duration-200 ${
          error ? "border-red-400/80" : "border-white/20"
        }`}
        defaultValue=""
      >
        <option value="" disabled className="text-gray-800 bg-white">
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt} value={opt} className="text-gray-800 bg-white">
            {opt}
          </option>
        ))}
      </select>
      {error && (
        <span className="text-red-300 text-xs pl-1">{error.message}</span>
      )}
    </div>
  );
}
