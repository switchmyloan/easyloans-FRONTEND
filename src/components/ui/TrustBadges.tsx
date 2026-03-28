"use client";

const badges = [
  {
    label: "256-bit SSL",
    icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
  },
  {
    label: "Bank-grade Security",
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
  },
  {
    label: "RBI Compliant",
    icon: "M5 13l4 4L19 7",
  },
];

export default function TrustBadges() {
  return (
    <div className="flex items-center justify-center gap-6 mt-6 text-xs text-gray-400">
      {badges.map((b) => (
        <div key={b.label} className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={b.icon} />
          </svg>
          {b.label}
        </div>
      ))}
    </div>
  );
}
