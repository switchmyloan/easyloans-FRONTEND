"use client";

import { useEffect, useRef } from "react";

interface ProgressBarProps {
  percent: number;
}

export default function ProgressBar({ percent }: ProgressBarProps) {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (barRef.current) {
      barRef.current.style.width = "0%";
      const timer = setTimeout(() => {
        if (barRef.current) {
          barRef.current.style.width = `${percent}%`;
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [percent]);

  return (
    <div className="h-[6px] bg-white/15 rounded-full w-full overflow-hidden backdrop-blur-sm">
      <div
        ref={barRef}
        className="h-full bg-gradient-to-r from-[#C4B5FD] via-[#d4ff70] to-[#A6FF00] rounded-full transition-all duration-[1400ms] ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{ width: "0%" }}
      />
    </div>
  );
}
