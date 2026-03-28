"use client";

import type { FieldError } from "react-hook-form";

interface GenderToggleProps {
  value: string;
  onChange: (val: string) => void;
  error?: FieldError;
}

const options = ["Male", "Female"];

export default function GenderToggle({ value, onChange, error }: GenderToggleProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-white/90 text-[13px] font-medium tracking-wide">Gender</label>
      <div className="flex gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`flex-1 rounded-xl px-2 py-3 border text-sm text-white font-medium transition-all duration-200 cursor-pointer ${
              value === opt
                ? "bg-white/25 border-white/60 shadow-[0_0_0_1px_rgba(255,255,255,0.15)] backdrop-blur-sm"
                : "bg-white/[0.08] border-white/15 hover:bg-white/[0.14] hover:border-white/25"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
      {error && (
        <span className="text-red-300 text-xs pl-1">{error.message}</span>
      )}
    </div>
  );
}
