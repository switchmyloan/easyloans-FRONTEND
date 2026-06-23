"use client";
import { AnimatePresence, motion } from "framer-motion";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";

// ─── Gold Rate Data ──────────────────────────────────────────────────────────
const BASE_GOLD_RATES = {
  "22K": {
    "1g": { today: 14043, yesterday: 13970 },
    "8g": { today: 112344, yesterday: 111760 },
    "10g": { today: 140430, yesterday: 139700 },
  },
  "24K": {
    "1g": { today: 15320, yesterday: 15240 },
    "8g": { today: 122560, yesterday: 121920 },
    "10g": { today: 153200, yesterday: 152400 },
  },
  "18K": {
    "1g": { today: 11490, yesterday: 11430 },
    "8g": { today: 91920, yesterday: 91440 },
    "10g": { today: 114900, yesterday: 114300 },
  },
};

const BASE_CITY_RATES: Record<
  string,
  { "22K": number; "24K": number; "18K": number }
> = {
  Mumbai: { "22K": 14280, "24K": 15580, "18K": 11685 },
  Delhi: { "22K": 14060, "24K": 15340, "18K": 11505 },
  Chennai: { "22K": 14130, "24K": 15415, "18K": 11560 },
  Bengaluru: { "22K": 14043, "24K": 15320, "18K": 11490 },
  Hyderabad: { "22K": 14043, "24K": 15320, "18K": 11490 },
  Kolkata: { "22K": 14050, "24K": 15328, "18K": 11496 },
  Pune: { "22K": 14065, "24K": 15344, "18K": 11508 },
  Ahmedabad: { "22K": 14055, "24K": 15335, "18K": 11501 },
};

const CITY_FUEL_RATES: Record<string, { petrol: number; diesel: number }> = {
  Mumbai: { petrol: 103.44, diesel: 89.97 },
  Delhi: { petrol: 94.77, diesel: 87.67 },
  Chennai: { petrol: 100.85, diesel: 92.49 },
  Bengaluru: { petrol: 102.86, diesel: 88.94 },
  Hyderabad: { petrol: 107.41, diesel: 95.65 },
  Kolkata: { petrol: 103.94, diesel: 90.76 },
  Pune: { petrol: 103.49, diesel: 90.01 },
  Ahmedabad: { petrol: 94.39, diesel: 89.97 },
};

const tenDayData = [
  { date: "17 Apr 2026", k22: 113080, k22chg: +640, k24: 123360, k24chg: +720 },
  { date: "16 Apr 2026", k22: 112440, k22chg: -480, k24: 122640, k24chg: -560 },
  { date: "15 Apr 2026", k22: 112920, k22chg: +1200, k24: 123200, k24chg: +1280 },
  { date: "14 Apr 2026", k22: 111720, k22chg: +880, k24: 121920, k24chg: +960 },
  { date: "11 Apr 2026", k22: 110840, k22chg: -640, k24: 120960, k24chg: -720 },
  { date: "10 Apr 2026", k22: 111480, k22chg: +400, k24: 121680, k24chg: +480 },
  { date: "09 Apr 2026", k22: 111080, k22chg: +960, k24: 121200, k24chg: +1040 },
  { date: "08 Apr 2026", k22: 110120, k22chg: -320, k24: 120160, k24chg: -400 },
  { date: "07 Apr 2026", k22: 110440, k22chg: +560, k24: 120560, k24chg: +640 },
  { date: "04 Apr 2026", k22: 109880, k22chg: -800, k24: 119920, k24chg: -880 },
];

const chartData22K = [
  11800, 12100, 12350, 12200, 12550, 12800, 13050, 12900, 13200, 13450, 13700,
  13500, 13850, 14000, 14135,
];
const chartData24K = [
  12880, 13200, 13470, 13310, 13690, 13960, 14230, 14070, 14400, 14680, 14950,
  14760, 15100, 15270, 15420,
];
const chartLabels = [
  "Jan", "", "", "Feb", "", "", "Mar", "", "", "Apr", "", "", "May", "", "Jun",
];

// ─── Loan Calculation Constants ──────────────────────────────────────────────
const MUTHOOT_LTV = 0.75;
const MUTHOOT_RATE_PA = 11.99;
const MUTHOOT_RATE_MONTHLY = MUTHOOT_RATE_PA / 100 / 12;

const PURITY_TO_22K: Record<"18K" | "22K" | "24K", number> = {
  "18K": 18 / 22,
  "22K": 1,
  "24K": 24 / 22,
};

function derive30DayAvgRate22K(spotRatePerGram: number): number {
  const tenDayAvg =
    tenDayData.reduce((sum, row) => sum + row.k22 / 8, 0) / tenDayData.length;
  const blended = (spotRatePerGram + tenDayAvg) / 2;
  return Math.round(blended * 0.995);
}

function to22KEquivalent(weightG: number, purity: "18K" | "22K" | "24K"): number {
  return weightG * PURITY_TO_22K[purity];
}

function calcMaxLoan(weightG: number, purity: "18K" | "22K" | "24K", rate22KPerG: number): number {
  const equiv22K = to22KEquivalent(weightG, purity);
  const goldValue = equiv22K * rate22KPerG;
  return Math.min(Math.floor(goldValue * MUTHOOT_LTV), 10_00_00_000);
}

function calcEMI(principal: number, months: number): number {
  const r = MUTHOOT_RATE_MONTHLY;
  const n = months;
  if (n === 0 || principal === 0) return 0;
  const emi = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  return Math.round(emi);
}

function calcTotalInterest(principal: number, months: number): number {
  return calcEMI(principal, months) * months - principal;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;
const fmtChg = (n: number) => {
  const sign = n >= 0 ? "+" : "";
  const arrow = n >= 0 ? " ▲" : " ▼";
  return `${sign}${n.toLocaleString("en-IN")}${arrow}`;
};

// ─── SVG Line Chart ──────────────────────────────────────────────────────────
function LineChart() {
  const W = 480;
  const H = 180;
  const pad = { t: 16, r: 20, b: 40, l: 56 };
  const cW = W - pad.l - pad.r;
  const cH = H - pad.t - pad.b;
  const allVals = [...chartData22K, ...chartData24K];
  const minV = Math.min(...allVals) - 200;
  const maxV = Math.max(...allVals) + 200;

  const px = (i: number) => pad.l + (i / (chartData22K.length - 1)) * cW;
  const py = (v: number) => pad.t + cH - ((v - minV) / (maxV - minV)) * cH;

  const pathD = (data: number[]) =>
    data.map((v, i) => `${i === 0 ? "M" : "L"} ${px(i).toFixed(1)} ${py(v).toFixed(1)}`).join(" ");

  const gridLines = [12000, 13000, 14000, 15000];

  return (
    <svg aria-hidden="true" viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {gridLines.map((v) => (
        <g key={`grid-${v}`}>
          <line x1={pad.l} x2={W - pad.r} y1={py(v)} y2={py(v)} stroke="#e2e8f0" strokeWidth="1" strokeDasharray="4 3" />
          <text x={pad.l - 8} y={py(v) + 4} textAnchor="end" fontSize="10" fill="#94a3b8">₹{(v / 1000).toFixed(0)}K</text>
        </g>
      ))}
      {chartLabels.reduce<React.ReactNode[]>((acc, lbl, i) => {
        if (lbl) acc.push(<text key={`chart-label-${lbl}`} x={px(i)} y={H - 6} textAnchor="middle" fontSize="10" fill="#94a3b8">{lbl}</text>);
        return acc;
      }, [])}
      <path d={pathD(chartData22K)} fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d={pathD(chartData24K)} fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={px(chartData22K.length - 1)} cy={py(chartData22K[chartData22K.length - 1])} r="4" fill="#7c3aed" />
      <circle cx={px(chartData24K.length - 1)} cy={py(chartData24K[chartData24K.length - 1])} r="4" fill="#f97316" />
      <rect x={pad.l} y={H - 38} width="10" height="3" rx="1.5" fill="#7c3aed" />
      <text x={pad.l + 14} y={H - 32} fontSize="10" fill="#334155">22K Gold</text>
      <rect x={pad.l + 72} y={H - 38} width="10" height="3" rx="1.5" fill="#f97316" />
      <text x={pad.l + 86} y={H - 32} fontSize="10" fill="#334155">24K Gold</text>
    </svg>
  );
}

// ─── Auto-refresh Gold Rates Hook ────────────────────────────────────────────
const CITIES = [
  "Mumbai", "Delhi", "Chennai", "Bengaluru", "Hyderabad", "Kolkata", "Pune", "Ahmedabad",
] as const;

function buildRatesFromPerGram(r22: number, r24: number, r18: number): typeof BASE_GOLD_RATES {
  const yesterday = (today: number) => Math.round(today * 0.99);
  return {
    "22K": { "1g": { today: r22, yesterday: yesterday(r22) }, "8g": { today: r22 * 8, yesterday: yesterday(r22 * 8) }, "10g": { today: r22 * 10, yesterday: yesterday(r22 * 10) } },
    "24K": { "1g": { today: r24, yesterday: yesterday(r24) }, "8g": { today: r24 * 8, yesterday: yesterday(r24 * 8) }, "10g": { today: r24 * 10, yesterday: yesterday(r24 * 10) } },
    "18K": { "1g": { today: r18, yesterday: yesterday(r18) }, "8g": { today: r18 * 8, yesterday: yesterday(r18 * 8) }, "10g": { today: r18 * 10, yesterday: yesterday(r18 * 10) } },
  };
}

function useGoldRates() {
  const [rates, setRates] = useState(BASE_GOLD_RATES);
  const [cityR, setCityR] = useState(BASE_CITY_RATES);

  const currentBase = useRef({
    r22: BASE_GOLD_RATES["22K"]["1g"].today,
    r24: BASE_GOLD_RATES["24K"]["1g"].today,
    r18: BASE_GOLD_RATES["18K"]["1g"].today,
  });

  const applyMicroVariation = useCallback(() => {
    const vary = (v: number) => Math.round(v * (1 + (Math.random() - 0.5) * 0.003));
    const { r22, r24, r18 } = currentBase.current;
    const n22 = vary(r22); const n24 = vary(r24); const n18 = vary(r18);
    currentBase.current = { r22: n22, r24: n24, r18: n18 };
    setCityR((prev) => {
      const updated: Record<string, { "22K": number; "24K": number; "18K": number }> = {};
      for (const city of Object.keys(prev)) {
        updated[city] = { "22K": vary(prev[city]["22K"]), "24K": vary(prev[city]["24K"]), "18K": vary(prev[city]["18K"]) };
      }
      return updated;
    });
    setRates(buildRatesFromPerGram(n22, n24, n18));
  }, []);

  useEffect(() => {
    applyMicroVariation();
    const varId = setInterval(applyMicroVariation, 8 * 60 * 1000);
    return () => { clearInterval(varId); };
  }, [applyMicroVariation]);

  return { rates, cityR };
}

// ─── Reusable UI Components ──────────────────────────────────────────────────

function SectionCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-slate-200/80 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">{children}</p>;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-xs text-red-500 font-medium mt-1.5 flex items-center gap-1">
      <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01" /></svg>
      {message}
    </motion.p>
  );
}

function Input({ value, onChange, placeholder, type = "text", className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 focus:bg-white transition-all placeholder:text-slate-400 ${className}`}
      {...props}
    />
  );
}

function Select({ value, onChange, children }: { value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; children: React.ReactNode }) {
  return (
    <select
      value={value}
      onChange={onChange}
      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 focus:bg-white transition-all"
    >
      {children}
    </select>
  );
}

// ─── Live Rate Ticker ─────────────────────────────────────────────────────
function RateTicker({ rates, silverRate, city }: {
  rates: typeof BASE_GOLD_RATES;
  silverRate: number | null;
  city: string;
}) {
  const r22 = rates["22K"]["1g"];
  const r24 = rates["24K"]["1g"];
  const r18 = rates["18K"]["1g"];
  const chg22 = r22.today - r22.yesterday;
  const chg24 = r24.today - r24.yesterday;
  const chg18 = r18.today - r18.yesterday;
  const silver = silverRate ?? 245;
  const petrol = CITY_FUEL_RATES[city]?.petrol ?? 103.49;
  const diesel = CITY_FUEL_RATES[city]?.diesel ?? 90.01;

  const tickerItems = [
    { label: "Gold 24K", value: `₹${r24.today.toLocaleString("en-IN")}/g`, chg: chg24, bg: "bg-amber-400" },
    { label: "Gold 22K", value: `₹${r22.today.toLocaleString("en-IN")}/g`, chg: chg22, bg: "bg-yellow-400" },
    { label: "Gold 18K", value: `₹${r18.today.toLocaleString("en-IN")}/g`, chg: chg18, bg: "bg-orange-400" },
    { label: "Silver", value: `₹${silver.toLocaleString("en-IN")}/g`, chg: -3, bg: "bg-slate-400" },
    { label: "Petrol", value: `₹${petrol.toFixed(2)}/L`, chg: 0.15, bg: "bg-red-400" },
    { label: "Diesel", value: `₹${diesel.toFixed(2)}/L`, chg: -0.08, bg: "bg-emerald-400" },
  ];

  return (
    <div className="bg-gradient-to-r from-[#1a1a2e] to-[#16213e] border border-[#1a1a2e]/50 rounded-2xl shadow-md overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-white/10">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
        </span>
        <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Live Market Rates</span>
      </div>
      <div className="relative overflow-hidden py-2.5">
        <style jsx>{`
          @keyframes marquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
        <div className="flex w-max gap-6 px-4" style={{ animation: "marquee 20s linear infinite" }}>
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <div key={`${item.label}-${i}`} className="flex items-center gap-2 shrink-0">
              <span className={`w-1.5 h-1.5 rounded-full ${item.bg}`} />
              <span className="text-[11px] font-semibold text-white/50">{item.label}</span>
              <span className="text-xs font-black text-white">{item.value}</span>
              {item.chg !== null && (
                <span className={`text-[10px] font-bold ${item.chg >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {item.chg >= 0 ? "▲" : "▼"} {item.chg >= 0 ? "+" : ""}{item.chg.toLocaleString("en-IN")}
                </span>
              )}
              <span className="text-white/20 ml-2">|</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Gold Rates Detail (tabbed) ───────────────────────────────────────────
function GoldRatesDetail({
  rates,
  cityR,
  silverRate,
}: {
  rates: typeof BASE_GOLD_RATES;
  cityR: Record<string, { "22K": number; "24K": number; "18K": number }>;
  silverRate: number | null;
}) {
  const [activeKarat, setActiveKarat] = useState<"22K" | "24K" | "18K">("22K");
  const [activeTab, setActiveTab] = useState<"rates" | "history" | "cities">("rates");
  const [selectedCity, setSelectedCity] = useState("Mumbai");
  const commodityCity = selectedCity;
  const cities = Object.keys(cityR);

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1">
        {([
          { key: "rates", label: "Today's Rates" },
          { key: "history", label: "10-Day History" },
          { key: "cities", label: "City Rates" },
        ] as const).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
              activeTab === tab.key
                ? "bg-white text-violet-600 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Today's Rates Tab */}
        {activeTab === "rates" && (
          <motion.div key="rates" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
            {/* Karat Selector */}
            <div className="flex gap-2">
              {(["22K", "24K", "18K"] as const).map((k) => (
                <button
                  key={k}
                  onClick={() => setActiveKarat(k)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                    activeKarat === k
                      ? "bg-violet-600 text-white shadow-md shadow-violet-600/20"
                      : "bg-slate-50 border border-slate-200 text-slate-600 hover:border-violet-500/30"
                  }`}
                >
                  {k} Gold
                </button>
              ))}
            </div>

            {/* Rate Table */}
            <SectionCard>
              <div className="overflow-hidden rounded-2xl">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      {["Quantity", "Today's Price", "Yesterday", "Change"].map((h) => (
                        <th key={h} className={`px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider ${h === "Yesterday" || h === "Change" ? "hidden sm:table-cell" : ""}`}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(["1g", "8g", "10g"] as const).map((qty, i) => {
                      const r = rates[activeKarat][qty];
                      const chg = r.today - r.yesterday;
                      const pct = r.yesterday > 0 ? ((chg / r.yesterday) * 100).toFixed(2) : "0.00";
                      const isUp = chg >= 0;
                      return (
                        <tr key={qty} className={`border-b border-slate-50 last:border-0 ${i % 2 === 0 ? "bg-white" : "bg-slate-50/30"}`}>
                          <td className="px-4 py-4 font-bold text-slate-600">{qty}</td>
                          <td className="px-4 py-4">
                            <span className="font-black text-slate-900 text-base">{fmt(r.today)}</span>
                            <span className={`block text-xs font-semibold mt-0.5 sm:hidden ${isUp ? "text-green-600" : "text-red-500"}`}>
                              {isUp ? "↑" : "↓"} {Math.abs(Number(pct))}%
                            </span>
                          </td>
                          <td className="px-4 py-4 text-slate-500 hidden sm:table-cell">{fmt(r.yesterday)}</td>
                          <td className={`px-4 py-4 font-bold text-sm hidden sm:table-cell ${isUp ? "text-green-600" : "text-red-500"}`}>
                            {fmtChg(chg)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </SectionCard>

            {/* Chart + Commodities */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SectionCard className="p-5">
                <h4 className="text-sm font-bold text-slate-700 mb-1">Price Trend (6 Months)</h4>
                <p className="text-xs text-slate-400 mb-4">22K vs 24K per gram</p>
                <LineChart />
              </SectionCard>

              <SectionCard className="p-5">
                <h4 className="text-sm font-bold text-slate-700 mb-4">Other Commodities</h4>
                <div className="space-y-3">
                  {[
                    { label: "Silver", value: silverRate !== null ? `₹${silverRate.toLocaleString("en-IN")}` : "₹245", unit: "/gram" },
                    { label: "Petrol", value: `₹${(CITY_FUEL_RATES[commodityCity]?.petrol ?? 103.49).toFixed(2)}`, unit: "/litre" },
                    { label: "Diesel", value: `₹${(CITY_FUEL_RATES[commodityCity]?.diesel ?? 90.01).toFixed(2)}`, unit: "/litre" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between py-3 px-4 bg-slate-50/50 rounded-xl">
                      <span className="text-sm text-slate-600">{item.label} <span className="text-slate-400">({commodityCity})</span></span>
                      <span className="text-sm font-black text-slate-800">{item.value}<span className="text-xs text-slate-400 font-normal">{item.unit}</span></span>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </div>
          </motion.div>
        )}

        {/* 10-Day History Tab */}
        {activeTab === "history" && (
          <motion.div key="history" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <SectionCard>
              <div className="px-5 py-4 border-b border-slate-100">
                <h4 className="text-sm font-bold text-slate-700">Mumbai Gold Rate — Last 10 Days (8g)</h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">22K (8g)</th>
                      <th className="px-4 py-3 text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider">24K (8g)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tenDayData.map((row, i) => (
                      <tr key={row.date} className={`border-b border-slate-50 last:border-0 ${i % 2 === 0 ? "bg-white" : "bg-slate-50/30"}`}>
                        <td className="px-4 py-3.5 text-slate-600 font-medium whitespace-nowrap">{row.date}</td>
                        <td className="px-4 py-3.5">
                          <span className="font-bold text-slate-800">{fmt(row.k22)}</span>
                          <span className={`ml-2 text-xs font-semibold ${row.k22chg >= 0 ? "text-green-600" : "text-red-500"}`}>{fmtChg(row.k22chg)}</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className="font-bold text-slate-800">{fmt(row.k24)}</span>
                          <span className={`ml-2 text-xs font-semibold ${row.k24chg >= 0 ? "text-green-600" : "text-red-500"}`}>{fmtChg(row.k24chg)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </SectionCard>
          </motion.div>
        )}

        {/* City Rates Tab */}
        {activeTab === "cities" && (
          <motion.div key="cities" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
            <Select value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)}>
              {cities.map((c) => <option key={c}>{c}</option>)}
            </Select>

            {cityR[selectedCity] && (
              <div className="grid grid-cols-3 gap-3">
                {(["22K", "24K", "18K"] as const).map((k) => {
                  const colors = { "22K": "from-violet-50 to-purple-50 border-violet-100 text-violet-700", "24K": "from-orange-50 to-amber-50 border-orange-100 text-orange-700", "18K": "from-yellow-50 to-amber-50 border-yellow-100 text-yellow-700" };
                  return (
                    <div key={k} className={`bg-gradient-to-br ${colors[k]} border rounded-xl p-4 text-center`}>
                      <p className="text-[11px] font-semibold text-slate-500 mb-1">{k} / gram</p>
                      <p className="text-lg font-black">{fmt(cityR[selectedCity][k])}</p>
                      <p className="text-xs text-slate-400 mt-1">10g: {fmt(cityR[selectedCity][k] * 10)}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Gold Loan Calculator Sidebar ───────────────────────────────────────────
function LoanCalculatorSidebar({
  cityR,
}: {
  cityR: Record<string, { "22K": number; "24K": number; "18K": number }>;
}) {
  const [calcWeight, setCalcWeight] = useState(10);
  const [calcPurity, setCalcPurity] = useState<"18K" | "22K" | "24K">("22K");
  const [calcTenure, setCalcTenure] = useState(12);
  const [calcCity, setCalcCity] = useState("Mumbai");

  const spot22K = cityR[calcCity]?.["22K"] ?? 13345;
  const avg22K = derive30DayAvgRate22K(spot22K);
  const maxLoan = calcMaxLoan(calcWeight, calcPurity, avg22K);
  const emi = calcEMI(maxLoan, calcTenure);
  const totalInterest = calcTotalInterest(maxLoan, calcTenure);

  const cities = Object.keys(cityR);

  return (
    <SectionCard className="sticky top-4 overflow-hidden">
      <div className="bg-gradient-to-r from-violet-600 to-violet-500 px-5 py-4">
        <p className="text-white font-bold text-sm">Gold Loan Calculator</p>
        <p className="text-white/70 text-[11px] mt-0.5">75% LTV &middot; {MUTHOOT_RATE_PA}% p.a.</p>
      </div>
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>City</Label>
            <Select value={calcCity} onChange={(e) => setCalcCity(e.target.value)}>
              {cities.map((c) => <option key={c}>{c}</option>)}
            </Select>
          </div>
          <div>
            <Label>Weight (g)</Label>
            <Input type="number" min={1} step={0.5} value={calcWeight} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCalcWeight(Math.max(0.5, +e.target.value))} />
          </div>
        </div>

        <div>
          <Label>Purity</Label>
          <div className="flex gap-2">
            {(["18K", "22K", "24K"] as const).map((k) => (
              <button key={k} type="button" onClick={() => setCalcPurity(k)}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                  calcPurity === k ? "bg-violet-600 text-white shadow-sm" : "bg-slate-50 border border-slate-200 text-slate-500 hover:border-violet-500/30"
                }`}
              >{k}</button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-1">
            <Label>Tenure</Label>
            <span className="text-xs font-black text-violet-600">{calcTenure}M</span>
          </div>
          <input type="range" min={3} max={24} step={1} value={calcTenure} onChange={(e) => setCalcTenure(+e.target.value)} className="w-full accent-violet-600" />
        </div>

        <div className="h-px bg-slate-100" />

        <div className="space-y-2.5">
          {[
            { label: "Eligible Loan", value: fmt(maxLoan), highlight: true },
            { label: "Monthly EMI", value: fmt(emi), highlight: false },
            { label: "Total Interest", value: fmt(totalInterest), highlight: false },
            { label: "Total Payable", value: fmt(maxLoan + totalInterest), highlight: false },
          ].map((row) => (
            <div key={row.label} className={`flex justify-between items-center py-2 px-3 rounded-lg ${row.highlight ? "bg-green-50 border border-green-100" : ""}`}>
              <span className="text-xs text-slate-500">{row.label}</span>
              <span className={`text-sm font-black ${row.highlight ? "text-green-700" : "text-slate-800"}`}>{row.value}</span>
            </div>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}

// ─── Form Steps ──────────────────────────────────────────────────────────────
const steps = ["Gold Details", "Loan Details", "Personal Info", "Review"];
const goldItems = ["Bangles", "Necklace", "Ring", "Coin", "Earrings", "Other"];

export default function GoldLoan() {
  const formRef = useRef<HTMLDivElement>(null);
  const { rates, cityR } = useGoldRates();
  const [silverRate] = useState<number | null>(245);
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [opportunityId, setOpportunityId] = useState("");
  const [showRates, setShowRates] = useState(true);

  // Form state
  const [weight, setWeight] = useState<number | "">(""  );
  const [purity, setPurity] = useState<"18K" | "22K" | "24K">("22K");
  const [items, setItems] = useState<string[]>(["Bangles"]);
  const [loanAmount, setLoanAmount] = useState(0);
  const [tenure, setTenure] = useState(12);
  const [purpose, setPurpose] = useState("Personal");
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("Mumbai");
  const [pincode, setPincode] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});

  const toggleItem = (item: string) =>
    setItems((prev) => prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]);

  const validateStep = (s: number): boolean => {
    const errs: Record<string, string> = {};

    if (s === 0) {
      if (weight === "" || !weight || weight < 0.5) errs.weight = "Please enter gold weight (minimum 0.5g)";
      if (items.length === 0) errs.items = "Select at least one item to pledge";
    }

    if (s === 2) {
      if (!fullName.trim()) errs.fullName = "Full name is required";
      else if (fullName.trim().length < 2) errs.fullName = "Name must be at least 2 characters";

      if (!mobile.trim()) errs.mobile = "Mobile number is required";
      else if (!/^[6-9]\d{9}$/.test(mobile.trim())) errs.mobile = "Enter a valid 10-digit mobile number";

      if (!email.trim()) errs.email = "Email is required";
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.email = "Enter a valid email address";

      if (!city.trim()) errs.city = "City is required";

      if (!pincode.trim()) errs.pincode = "Pincode is required";
      else if (!/^\d{6}$/.test(pincode.trim())) errs.pincode = "Enter a valid 6-digit pincode";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleContinue = () => {
    if (!validateStep(step)) return;
    if (step < 3) setStep(step + 1);
    else handleSubmit();
  };

  const clearError = (field: string) => {
    if (errors[field]) setErrors((prev) => { const next = { ...prev }; delete next[field]; return next; });
  };

  // Loan calculations
  const spot22KCity = cityR[city]?.["22K"] ?? BASE_CITY_RATES["Bengaluru"]["22K"];
  const avg22KRate = derive30DayAvgRate22K(spot22KCity);
  const selectedPurityRate = rates[purity]?.["1g"]?.today ?? BASE_GOLD_RATES[purity]["1g"].today;
  const safeWeight = weight || 0;
  const estimatedGoldValue = Math.round(safeWeight * selectedPurityRate);
  const maxLoan = calcMaxLoan(safeWeight, purity, avg22KRate);

  useEffect(() => {
    setLoanAmount(maxLoan);
  }, [maxLoan]);

  const effectiveLoan = Math.min(loanAmount, maxLoan);
  const emi = calcEMI(effectiveLoan, tenure);
  const totalInterest = calcTotalInterest(effectiveLoan, tenure);

  const handleSubmit = async () => {
    setSubmitError("");
    setSubmitting(true);
    try {
      const trimmedName = fullName.trim();
      const [firstName, ...rest] = trimmedName.split(/\s+/);
      const lastName = rest.join(" ");
      const payload = {
        firstName: firstName || "", lastName: lastName || "", email: email.trim(),
        gender: "", pincode: pincode.trim(), panNumber: "", dateOfBirth: "",
        jobType: purpose, monthlySalary: "", loanAmount: String(effectiveLoan), mobileNumber: mobile.trim(),
      };
      const res = await fetch("https://apply.switchmyloan.in/api/onSubmit/mf-lead", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
      const result = await res.json().catch(() => ({}));
      const lenders = (result?.data ?? {}) as Record<string, { lead_xid?: number | string; lender_xid?: number | string }>;
      const firstLender = Object.values(lenders)[0];
      const opportunity = firstLender?.lead_xid ?? firstLender?.lender_xid ?? result?.opportunityId ?? "";
      setOpportunityId(String(opportunity));
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleNewLead = () => {
    setSubmitted(false); setSubmitError(""); setOpportunityId(""); setStep(0);
    setWeight(""); setPurity("22K"); setItems(["Bangles"]); setLoanAmount(0); setTenure(12);
    setPurpose("Personal"); setFullName(""); setMobile(""); setEmail("");
    setCity("Mumbai"); setPincode("");
  };

  // ─── Success Screen ────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-xl text-center max-w-md w-full"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-violet-600 to-violet-500 flex items-center justify-center shadow-lg shadow-violet-600/30"
          >
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>

          <h2 className="text-2xl font-black text-slate-900 mb-2">Application Submitted</h2>
          <p className="text-slate-500 text-sm mb-6">Our team will contact you within 2 hours for gold assessment.</p>

          {opportunityId && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-6">
              <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1 font-bold">Reference ID</p>
              <p className="text-xl font-black text-violet-600 font-mono">{opportunityId}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 text-sm mb-6">
            {[
              { label: "Loan Amount", value: fmt(effectiveLoan) },
              { label: "Tenure", value: `${tenure} Months` },
              { label: "Monthly EMI", value: fmt(emi) },
              { label: "Rate", value: `${MUTHOOT_RATE_PA}% p.a.` },
            ].map((item) => (
              <div key={item.label} className="bg-slate-50 rounded-xl p-3 text-left">
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5 font-semibold">{item.label}</p>
                <p className="font-black text-slate-800 text-sm">{item.value}</p>
              </div>
            ))}
          </div>

          <button
            onClick={handleNewLead}
            className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-violet-600 to-violet-500 hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-violet-600/20"
          >
            Submit Another Application
          </button>
        </motion.div>
      </div>
    );
  }

  // ─── Main Layout ───────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Page Header + Live Ticker */}
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Gold Loan</h1>
          <p className="text-slate-500 text-sm mt-1">Get up to ₹1 Crore &middot; 75% LTV &middot; {MUTHOOT_RATE_PA}% p.a.</p>
        </div>
        <RateTicker rates={rates} silverRate={silverRate} city={city} />
      </div>

      {/* Two-column: Form + Calculator sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" ref={formRef}>

        {/* Form (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">

          {/* Step Progress */}
          <div className="flex items-center gap-0">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    i < step ? "bg-violet-600 text-white" : i === step ? "border-2 border-violet-600 text-violet-600 bg-white" : "border-2 border-slate-200 text-slate-400 bg-white"
                  }`}>
                    {i < step ? (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    ) : i + 1}
                  </div>
                  <span className={`hidden sm:block text-[10px] mt-1.5 font-semibold whitespace-nowrap ${i <= step ? "text-violet-600" : "text-slate-400"}`}>{s}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 sm:mb-5 rounded-full transition-all ${i < step ? "bg-violet-600" : "bg-slate-200"}`} />
                )}
              </div>
            ))}
          </div>

          {/* Form Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <SectionCard className="p-5 sm:p-6">
                {/* Step 0: Gold Details */}
                {step === 0 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-md shadow-amber-200/50">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14.5a6.5 6.5 0 110-13 6.5 6.5 0 010 13zm-.75-9.25h1.5v3.5h-1.5v-3.5zm0 4.5h1.5v1.5h-1.5v-1.5z" /></svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">Apply for Instant Gold Loan</h3>
                        <p className="text-xs text-slate-400">Enter your gold info to get instant loan estimate</p>
                      </div>
                    </div>

                    {/* Gold Weight & Purity */}
                    <div className="bg-gradient-to-br from-amber-50/80 via-yellow-50/50 to-orange-50/40 border border-amber-200/50 rounded-2xl p-5 space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div>
                          <label className="text-xs font-semibold text-amber-800 uppercase tracking-wider mb-1.5 block">Gold Weight (grams)</label>
                          <div className="relative">
                            <Input
                              type="number" value={weight} min={0.5} step={0.5} placeholder="e.g. 10, 50, 100"
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => { const v = e.target.value; setWeight(v === "" ? "" : Math.max(0.5, +v)); clearError("weight"); }}
                              className={`w-full bg-white border-2 rounded-xl px-4 py-3.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 transition-all placeholder:text-slate-300 placeholder:font-normal ${errors.weight ? "border-red-300 focus:ring-red-200 focus:border-red-400" : "border-amber-200 focus:ring-amber-300/30 focus:border-amber-400 hover:border-amber-300"}`}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-amber-500/60">grams</span>
                          </div>
                          <FieldError message={errors.weight} />
                        </div>
                        <div>
                          <label className="text-xs font-semibold text-amber-800 uppercase tracking-wider mb-1.5 block">Gold Purity</label>
                          <div className="flex gap-2">
                            {(["18K", "22K", "24K"] as const).map((p) => (
                              <button key={p} type="button" onClick={() => setPurity(p)}
                                className={`flex-1 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                                  purity === p
                                    ? "bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-lg shadow-amber-300/30 scale-[1.02]"
                                    : "bg-white border-2 border-amber-200 text-amber-700 hover:border-amber-400 hover:bg-amber-50/50"
                                }`}
                              >{p}</button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Live Rate Badge */}
                      <div className="flex items-center gap-2 bg-white/70 rounded-lg px-3 py-2 border border-amber-100">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                        </span>
                        <span className="text-xs text-slate-500">Today&apos;s {purity} Rate:</span>
                        <span className="text-xs font-bold text-amber-700">{fmt(selectedPurityRate)}/g</span>
                      </div>
                    </div>

                    {/* Loan Amount Display */}
                    <div className="bg-gradient-to-br from-violet-50/50 via-indigo-50 to-purple-50 border border-violet-100 rounded-2xl p-5">
                      <div className="flex items-center gap-2.5 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-500 flex items-center justify-center shadow-md shadow-violet-600/20">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <p className="text-sm font-bold text-slate-800">Maximum Eligible Loan Amount</p>
                      </div>
                      <p className="text-4xl font-black text-violet-600 mb-4">{fmt(maxLoan)}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full font-semibold">75% LTV</span>
                        <span>Max: ₹1Cr</span>
                      </div>
                    </div>

                    {/* Loan Amount Slider */}
                    <div>
                      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2 block">Slide to Choose Your Loan Amount</label>
                      <input
                        type="range"
                        min={0}
                        max={maxLoan}
                        step={1000}
                        value={loanAmount}
                        onChange={(e) => setLoanAmount(+e.target.value)}
                        className="w-full accent-violet-600"
                      />
                      <div className="flex flex-wrap gap-2 mt-3">
                        {[50000, 100000, 500000, 1000000].filter(v => v <= maxLoan).map((v) => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => setLoanAmount(v)}
                            className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                              loanAmount === v
                                ? "bg-violet-600 text-white border-violet-600"
                                : "bg-white text-slate-600 border-slate-200 hover:border-violet-300"
                            }`}
                          >
                            {v >= 100000 ? `₹${v / 100000}L` : `₹${v / 1000}K`}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label: "Gold Weight", value: `${safeWeight}g` },
                        { label: "Rate (22K)", value: fmt(avg22KRate) + "/g", highlight: true },
                        { label: "Gold Value", value: fmt(estimatedGoldValue), highlight: true },
                        { label: "Maximum LTV", value: "₹0" },
                      ].map((stat) => (
                        <div key={stat.label} className={`rounded-xl p-3 text-center ${stat.highlight ? "bg-amber-50 border border-amber-100" : "bg-slate-50 border border-slate-100"}`}>
                          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">{stat.label}</p>
                          <p className={`text-sm font-black ${stat.highlight ? "text-amber-700" : "text-slate-700"}`}>{stat.value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Items to Pledge */}
                    <div>
                      <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2 block">Items to Pledge</label>
                      <div className="flex flex-wrap gap-2">
                        {goldItems.map((item) => (
                          <button
                            key={item}
                            type="button"
                            onClick={() => toggleItem(item)}
                            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                              items.includes(item)
                                ? "bg-violet-600 text-white shadow-md shadow-violet-600/20"
                                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            }`}
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                      <FieldError message={errors.items} />
                    </div>
                  </div>
                )}

                {/* Step 1: Loan Details */}
                {step === 1 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-md shadow-violet-200/50">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">Loan Details</h3>
                        <p className="text-xs text-slate-400">Choose tenure and loan purpose</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <Label>Loan Amount</Label>
                        <div className="bg-violet-50 border border-violet-100 rounded-xl p-4 text-center">
                          <p className="text-2xl font-black text-violet-600">{fmt(effectiveLoan)}</p>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between">
                          <Label>Tenure (Months)</Label>
                          <span className="text-sm font-black text-violet-600">{tenure}M</span>
                        </div>
                        <input
                          type="range" min={3} max={24} step={1} value={tenure}
                          onChange={(e) => setTenure(+e.target.value)}
                          className="w-full accent-violet-600 mt-2"
                        />
                        <div className="flex justify-between text-xs text-slate-400 mt-1">
                          <span>3 months</span>
                          <span>24 months</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label>Purpose of Loan</Label>
                      <Select value={purpose} onChange={(e) => setPurpose(e.target.value)}>
                        {["Personal", "Business", "Medical", "Education", "Wedding", "Other"].map((p) => (
                          <option key={p}>{p}</option>
                        ))}
                      </Select>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                      <h4 className="text-sm font-bold text-slate-700">Loan Summary</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { label: "Monthly EMI", value: fmt(emi) },
                          { label: "Total Interest", value: fmt(totalInterest) },
                          { label: "Total Payable", value: fmt(effectiveLoan + totalInterest) },
                          { label: "Interest Rate", value: `${MUTHOOT_RATE_PA}% p.a.` },
                        ].map((item) => (
                          <div key={item.label} className="bg-white rounded-lg p-3">
                            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">{item.label}</p>
                            <p className="text-sm font-black text-slate-800 mt-1">{item.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Personal Info */}
                {step === 2 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-200/50">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">Personal Information</h3>
                        <p className="text-xs text-slate-400">We need a few details to process your application</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <Label>Full Name</Label>
                        <Input
                          value={fullName}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setFullName(e.target.value); clearError("fullName"); }}
                          placeholder="Enter your full name"
                          className={errors.fullName ? "border-red-300" : ""}
                        />
                        <FieldError message={errors.fullName} />
                      </div>
                      <div>
                        <Label>Mobile Number</Label>
                        <Input
                          type="tel"
                          value={mobile}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setMobile(e.target.value.replace(/\D/g, "").slice(0, 10)); clearError("mobile"); }}
                          placeholder="10-digit mobile number"
                          className={errors.mobile ? "border-red-300" : ""}
                        />
                        <FieldError message={errors.mobile} />
                      </div>
                      <div>
                        <Label>Email Address</Label>
                        <Input
                          type="email"
                          value={email}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setEmail(e.target.value); clearError("email"); }}
                          placeholder="your.email@example.com"
                          className={errors.email ? "border-red-300" : ""}
                        />
                        <FieldError message={errors.email} />
                      </div>
                      <div>
                        <Label>City</Label>
                        <Select value={city} onChange={(e) => { setCity(e.target.value); clearError("city"); }}>
                          {CITIES.map((c) => <option key={c}>{c}</option>)}
                        </Select>
                        <FieldError message={errors.city} />
                      </div>
                      <div>
                        <Label>Pincode</Label>
                        <Input
                          value={pincode}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setPincode(e.target.value.replace(/\D/g, "").slice(0, 6)); clearError("pincode"); }}
                          placeholder="6-digit pincode"
                          className={errors.pincode ? "border-red-300" : ""}
                        />
                        <FieldError message={errors.pincode} />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Review */}
                {step === 3 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-200/50">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">Review Your Application</h3>
                        <p className="text-xs text-slate-400">Please verify all details before submitting</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                        <h4 className="text-sm font-bold text-amber-800 mb-3">Gold Details</h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div><span className="text-slate-500">Weight:</span> <span className="font-bold text-slate-800">{safeWeight}g</span></div>
                          <div><span className="text-slate-500">Purity:</span> <span className="font-bold text-slate-800">{purity}</span></div>
                          <div><span className="text-slate-500">Items:</span> <span className="font-bold text-slate-800">{items.join(", ")}</span></div>
                          <div><span className="text-slate-500">Gold Value:</span> <span className="font-bold text-slate-800">{fmt(estimatedGoldValue)}</span></div>
                        </div>
                      </div>

                      <div className="bg-violet-50 border border-violet-100 rounded-xl p-4">
                        <h4 className="text-sm font-bold text-violet-800 mb-3">Loan Details</h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div><span className="text-slate-500">Loan Amount:</span> <span className="font-bold text-slate-800">{fmt(effectiveLoan)}</span></div>
                          <div><span className="text-slate-500">Tenure:</span> <span className="font-bold text-slate-800">{tenure} Months</span></div>
                          <div><span className="text-slate-500">Monthly EMI:</span> <span className="font-bold text-slate-800">{fmt(emi)}</span></div>
                          <div><span className="text-slate-500">Interest Rate:</span> <span className="font-bold text-slate-800">{MUTHOOT_RATE_PA}% p.a.</span></div>
                        </div>
                      </div>

                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                        <h4 className="text-sm font-bold text-slate-700 mb-3">Personal Details</h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div><span className="text-slate-500">Name:</span> <span className="font-bold text-slate-800">{fullName}</span></div>
                          <div><span className="text-slate-500">Mobile:</span> <span className="font-bold text-slate-800">{mobile}</span></div>
                          <div><span className="text-slate-500">Email:</span> <span className="font-bold text-slate-800">{email}</span></div>
                          <div><span className="text-slate-500">City:</span> <span className="font-bold text-slate-800">{city}</span></div>
                        </div>
                      </div>
                    </div>

                    {submitError && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
                        {submitError}
                      </div>
                    )}
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex gap-3 mt-6">
                  {step > 0 && (
                    <button
                      type="button"
                      onClick={() => setStep(step - 1)}
                      className="flex-1 py-3.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-all"
                    >
                      Back
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleContinue}
                    disabled={submitting}
                    className="flex-1 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-violet-600 to-violet-500 hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-violet-600/20 disabled:opacity-50"
                  >
                    {submitting ? "Submitting..." : step === 3 ? "Submit Application" : "Continue"}
                  </button>
                </div>
              </SectionCard>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Calculator Sidebar (1/3 width) */}
        <div className="hidden lg:block">
          <LoanCalculatorSidebar cityR={cityR} />
        </div>
      </div>

      {/* Gold Rates Section (collapsible) */}
      <SectionCard className="overflow-hidden">
        <button
          type="button"
          onClick={() => setShowRates(!showRates)}
          className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14.5a6.5 6.5 0 110-13 6.5 6.5 0 010 13z" /></svg>
            </div>
            <span className="text-sm font-bold text-slate-700">View Detailed Gold Rates & Market Data</span>
          </div>
          <svg className={`w-5 h-5 text-slate-400 transition-transform ${showRates ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <AnimatePresence>
          {showRates && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t border-slate-100"
            >
              <div className="p-5">
                <GoldRatesDetail rates={rates} cityR={cityR} silverRate={silverRate} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </SectionCard>

      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div className="text-xs text-amber-800">
            <p className="font-bold mb-1">Disclaimer</p>
            <p className="text-amber-700 leading-relaxed">
              Rates shown on this page (gold, silver, petrol, diesel) are sourced from publicly available information and third-party APIs for indicative purposes only. Actual market rates may vary. Cready does not guarantee the accuracy, completeness, or timeliness of this information. We are not responsible for any financial decisions made based on the rates displayed here. Always verify rates with authorized dealers or official sources before transacting.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
