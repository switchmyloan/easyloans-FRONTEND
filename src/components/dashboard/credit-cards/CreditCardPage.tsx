"use client";

import { useState, useEffect, useRef, useCallback, useMemo, ComponentType } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ZetCard, NovioCard, IobCard, TataNeuCard } from "./HoriCreadit";
import {
  LegacyPurpleCard,
  BizFirstCard,
  IndianOilVisaCard,
  SwiggyHdfcCard,
  MarriottHdfcCard,
} from "./FDBackedCreditCard";
import { trackCreditCardClick } from "@/lib/api";

// ─── User identifier for LC2 tracking ─────────────────────────────────────
const LC2_STORAGE_KEY = "cready_lc2_id";

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split(".")[1];
    if (!base64) return null;
    const json = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function generateUserLC2(): string {
  if (typeof window === "undefined") return "XXXX";

  const stored = window.localStorage.getItem(LC2_STORAGE_KEY);
  if (stored && /^C\d{3}$/.test(stored)) return stored;
  window.localStorage.removeItem(LC2_STORAGE_KEY);

  let lc2: string;

  const token = window.sessionStorage.getItem("token");
  if (token) {
    const payload = decodeJwtPayload(token);
    if (payload && typeof payload.sub === "number") {
      const digits = String(payload.sub).split("");
      for (let i = digits.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [digits[i], digits[j]] = [digits[j], digits[i]];
      }
      const shuffled = digits.slice(0, 3).join("").padStart(3, "0");
      lc2 = `C${shuffled}`;
      window.localStorage.setItem(LC2_STORAGE_KEY, lc2);
      return lc2;
    }
  }

  const randomId = Math.floor(100 + Math.random() * 900);
  lc2 = `C${randomId}`;
  window.localStorage.setItem(LC2_STORAGE_KEY, lc2);
  return lc2;
}

function injectLC2(ctaLink: string, lc2: string): string {
  if (!ctaLink) return ctaLink;
  return ctaLink.replace("LC2=XXXX", `LC2=${lc2}`);
}

// ─── Types ─────────────────────────────────────────────────────────────────
type SparkType = "purple" | "gold" | "teal" | "coral";
type CardTheme = "diners" | "gold" | "teal" | "coral";

interface CreditCard {
  id: number;
  name: string;
  bank: string;
  cardLabel: string;
  network: string;
  theme: CardTheme;
  badge: string | null;
  tags: string[];
  features: string[];
  joiningFee: string;
  feeNote: string;
  ctaLabel: string;
  sparkType: SparkType;
  Component: ComponentType<{ cardholderName?: string }>;
  intrinsicWidth: number;
  ctaLink: string;
  intrinsicHeight: number;
}

interface FilterItem {
  name: string;
  icon: string;
}

interface ThemeConfig {
  tagBg: string;
  tagBorder: string;
  tagColor: string;
}

interface Ripple {
  id: number;
  x: number;
  y: number;
  size: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  tx: number;
  ty: number;
  color: string;
  size: number;
  duration: number;
}

const MAX_COMPARE_CARDS = 3;

const parseFeeValue = (value: string): number => {
  const match = value.match(/(\d[\d,]*)/);
  return match ? parseInt(match[1].replace(/,/g, ""), 10) : 0;
};

const useWindowWidth = (): number => {
  const [width, setWidth] = useState<number>(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return width;
};

// ─── Data ──────────────────────────────────────────────────────────────────
const filtersData: FilterItem[] = [
  { name: "Travel", icon: "✈" },
  { name: "Shopping", icon: "🛍" },
  { name: "Dining", icon: "🍽" },
  { name: "Cashback", icon: "💰" },
  { name: "Fuel", icon: "⛽" },
  { name: "Lifetime Free", icon: "♾" },
  { name: "Movies", icon: "🎬" },
  { name: "Premium", icon: "🔥" },
];

const creditCardsData: CreditCard[] = [
  {
    id: 2,
    name: "Novio RuPay Credit Card!",
    bank: "SBM Bank",
    cardLabel: "Novio Select",
    network: "RuPay",
    theme: "gold",
    badge: "Best FD-Backed Card",
    tags: ["Lifetime Free", "UPI Rewards", "FD-Backed"],
    features: [
      "₹100 OFF* on Zepto",
      "Buy 1 Get 1 FREE movie tickets* on BookMyShow",
      "FD interest of up to 7% p.a.",
      "Reach 750+ Credit Score easily",
      "Start with just ₹2,000 FD",
    ],
    joiningFee: "₹0 Joining Fee",
    feeNote: "₹0 annual fee • up to 45 days interest-free",
    ctaLabel: "Apply Now →",
    sparkType: "gold",
    Component: NovioCard,
    intrinsicWidth: 275,
    intrinsicHeight: 430,
    ctaLink:
      "https://customer.credilio.in/v2/sbm-credilio-rupay-credit-card-on-upi?utm_org_code=ORG02560&utm_advisor_code=CRD0181379",
  },
  {
    id: 1,
    name: "ZET RuPay Select Credit Card",
    bank: "SBM Bank",
    cardLabel: "ZET Select",
    network: "RuPay",
    theme: "diners",
    badge: null,
    tags: ["Lifetime Free", "UPI Rewards", "FD-Backed"],
    features: [
      "Lifetime-free card with zero joining and annual fees",
      "FD-backed card with up to 90% of your FD as credit limit",
      "UPI rewards plus discounts and cashback on 80+ brands",
    ],
    joiningFee: "₹0 Joining Fee",
    feeNote: "₹0 annual fee • up to 45 days interest-free",
    ctaLabel: "Check Eligibility →",
    sparkType: "purple",
    Component: ZetCard,
    intrinsicWidth: 275,
    intrinsicHeight: 430,
    ctaLink:
      "https://sbm-zet-card.zetapp.in/onboarding/verify?utm_campaign=zet-rupay&utm_source=cready",
  },
  {
    id: 3,
    name: "Indian Overseas Bank ZET RuPay Credit Card",
    bank: "Indian Overseas Bank",
    cardLabel: "IOB ZET",
    network: "RuPay",
    theme: "teal",
    badge: "Best FD-Backed Card",
    tags: ["FD-Backed", "Cashback", "Lifetime Free"],
    features: [
      "Backed by your IOB Fixed Deposit",
      "Cashback on UPI & online spends",
      "No income proof required",
    ],
    joiningFee: "₹0 Joining Fee",
    feeNote: "*Lifetime free with FD",
    ctaLabel: "Apply Now →",
    sparkType: "teal",
    Component: IobCard,
    intrinsicWidth: 275,
    intrinsicHeight: 430,
    ctaLink:
      "https://zet-card.zetapp.in/iob-onboarding/verify?utm_campaign=zet-rupay&utm_source=cready",
  },
  {
    id: 4,
    name: "HDFC ALL Credit Card",
    bank: "HDFC Bank",
    cardLabel: "Legacy",
    network: "MasterCard",
    theme: "coral",
    badge: null,
    tags: ["FD-Backed", "Premium", "Investor"],
    features: [
      "Simplify your Spendings",
      "Welcome bonus",
      "45 days Interest Free Period",
      "Reward Points",
    ],
    joiningFee: "",
    feeNote: "",
    ctaLabel: "Apply Now →",
    sparkType: "coral",
    Component: LegacyPurpleCard,
    intrinsicWidth: 468,
    intrinsicHeight: 292,
    ctaLink:
      "https://applyonline.hdfc.bank.in/cards/credit-cards.html?FUNC=FLOAT&CHANNEL=DSA&DSACode=XSYL&LGcode=XSYL&LCcode=XSYL&LC2=XXXX&SMcode=S41429#nbb",
  },
  {
    id: 5,
    name: "BizFirst Business Credit Card",
    bank: "HDFC Bank",
    cardLabel: "BizFirst",
    network: "RuPay",
    theme: "diners",
    badge: "Business Pick",
    tags: ["Business", "FD-Backed", "Rewards"],
    features: [
      "Built for founders & SMBs",
      "FD-backed, no income proof needed",
      "GST-ready statements",
    ],
    joiningFee: "₹500 + Taxes",
    feeNote: "Lifetime free with FD",
    ctaLabel: "Apply Now →",
    sparkType: "purple",
    Component: BizFirstCard,
    intrinsicWidth: 468,
    intrinsicHeight: 292,
    ctaLink:
      "https://applyonline.hdfc.bank.in/cards/credit-cards.html?CHANNELSOURCE=BIZC&CHANNEL=DSA&DSACode=XSYL&LGcode=XSYL&LCcode=XSYL&LC2=XXXX&SMcode=S41429",
  },
  {
    id: 6,
    name: "Indian Oil HDFC Bank Visa Credit Card",
    bank: "HDFC Bank",
    cardLabel: "IndianOil",
    network: "Visa",
    theme: "coral",
    badge: null,
    tags: ["Fuel", "Cashback", "FD-Backed"],
    features: [
      "Up to 5% fuel points at IndianOil",
      "Earn on grocery & bill payments",
      "1% fuel surcharge waiver",
    ],
    joiningFee: "₹500 + Taxes",
    feeNote: "Waived on ₹50K annual spend",
    ctaLabel: "Apply Now →",
    sparkType: "coral",
    Component: IndianOilVisaCard,
    intrinsicWidth: 468,
    intrinsicHeight: 292,
    ctaLink:
      "https://applyonline.hdfc.bank.in/cards/credit-cards.html?CHANNELSOURCE=IOCL&CHANNEL=DSA&DSACode=XSYL&LGcode=XSYL&LCcode=XSYL&LC2=XXXX&SMcode=S41429",
  },
  {
    id: 7,
    name: "Swiggy HDFC Bank Credit Card",
    bank: "HDFC Bank",
    cardLabel: "Swiggy HDFC",
    network: "MasterCard",
    theme: "teal",
    badge: null,
    tags: ["Dining", "Cashback", "Shopping"],
    features: [
      "10% cashback on Swiggy orders",
      "5% cashback on online merchants",
      "Swiggy One membership included",
    ],
    joiningFee: "₹500 + Taxes",
    feeNote: "Renewal waived on spends",
    ctaLabel: "Apply Now →",
    sparkType: "teal",
    Component: SwiggyHdfcCard,
    intrinsicWidth: 468,
    intrinsicHeight: 292,
    ctaLink:
      "https://applyonline.hdfc.bank.in/cards/credit-cards.html?CHANNELSOURCE=SWCC&CHANNEL=DSA&DSACode=XSYL&LGcode=XSYL&LCcode=XSYL&LC2=XXXX&SMcode=S41429",
  },
  {
    id: 8,
    name: "Tata Neu HDFC Bank Credit Card",
    bank: "HDFC Bank",
    cardLabel: "Tata Neu",
    network: "Visa",
    theme: "diners",
    badge: null,
    tags: ["Shopping", "Cashback", "Rewards"],
    features: [
      "5% NeuCoins on Tata brands",
      "1.5% NeuCoins on other spends",
      "Complimentary Tata Neu Plus membership",
    ],
    joiningFee: "₹1,499 + Taxes",
    feeNote: "Waived on ₹1L annual spend",
    ctaLabel: "Apply Now →",
    sparkType: "purple",
    Component: TataNeuCard,
    intrinsicWidth: 275,
    intrinsicHeight: 430,
    ctaLink:
      "https://applyonline.hdfc.bank.in/cards/credit-cards.html?CHANNELSOURCE=TDCC&CHANNEL=DSA&DSACode=XSYL&LGcode=XSYL&LCcode=XSYL&LC2=XXXX&SMcode=S41429#nbb",
  },
  {
    id: 9,
    name: "Marriott Bonvoy HDFC Bank Credit Card",
    bank: "HDFC Bank",
    cardLabel: "Marriott Bonvoy",
    network: "Visa",
    theme: "gold",
    badge: null,
    tags: ["Travel", "Premium", "Dining"],
    features: [
      "8 Marriott Bonvoy points per ₹150 spent",
      "Complimentary airport lounge access",
      "1 free night award every year on renewal",
    ],
    joiningFee: "₹3,000 + Taxes",
    feeNote: "Free night award on renewal",
    ctaLabel: "Apply Now →",
    sparkType: "gold",
    Component: MarriottHdfcCard,
    intrinsicWidth: 468,
    intrinsicHeight: 292,
    ctaLink:
      "https://applyonline.hdfc.bank.in/cards/credit-cards.html?CHANNELSOURCE=MRTB&CHANNEL=DSA&DSACode=XSYL&LGcode=XSYL&LCcode=XSYL&LC2=XXXX&SMcode=S41429",
  },
];

const themes: Record<CardTheme, ThemeConfig> = {
  diners: {
    tagBg: "rgba(99,102,241,0.12)",
    tagBorder: "rgba(99,102,241,0.3)",
    tagColor: "#4338ca",
  },
  gold: {
    tagBg: "rgba(245,158,11,0.1)",
    tagBorder: "rgba(245,158,11,0.4)",
    tagColor: "#92400e",
  },
  teal: {
    tagBg: "rgba(20,184,166,0.1)",
    tagBorder: "rgba(20,184,166,0.35)",
    tagColor: "#0f766e",
  },
  coral: {
    tagBg: "rgba(239,68,68,0.1)",
    tagBorder: "rgba(239,68,68,0.3)",
    tagColor: "#991b1b",
  },
};

const sparkColors: Record<SparkType, string[]> = {
  gold: ["#fbbf24", "#f59e0b", "#fff7ed", "#fcd34d"],
  teal: ["#5eead4", "#14b8a6", "#ccfbf1", "#0d9488"],
  coral: ["#fca5a5", "#ef4444", "#fee2e2", "#dc2626"],
  purple: ["#a78bfa", "#818cf8", "#e0e7ff", "#6366f1"],
};

const glowColors: Record<SparkType, string> = {
  gold: "rgba(251,191,36,0.5)",
  teal: "rgba(20,184,166,0.5)",
  coral: "rgba(239,68,68,0.5)",
  purple: "rgba(124,58,237,0.6)",
};

// ─── Single Credit Card Item ───────────────────────────────────────────────
interface CreditCardItemProps {
  card: CreditCard;
  isCompareSelected: boolean;
  compareDisabled: boolean;
  onToggleCompare: (cardId: number) => void;
}

const CreditCardItem: React.FC<CreditCardItemProps> = ({
  card,
  isCompareSelected,
  compareDisabled,
  onToggleCompare,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const theme = themes[card.theme];
  const windowWidth = useWindowWidth();
  const isMob = windowWidth < 640;

  const [lc2, setLc2] = useState("XXXX");
  useEffect(() => {
    const id = generateUserLC2();
    setLc2(id);
  }, []);

  const resolvedCtaLink = useMemo(
    () => injectLC2(card.ctaLink, lc2),
    [card.ctaLink, lc2]
  );

  const slotWidth = isMob ? windowWidth - 64 : 280;
  const slotMaxHeight = isMob ? 180 : 220;
  const scale = Math.min(
    slotWidth / card.intrinsicWidth,
    slotMaxHeight / card.intrinsicHeight
  );
  const scaledW = card.intrinsicWidth * scale;
  const scaledH = card.intrinsicHeight * scale;

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = cardRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      const cx = r.width / 2;
      const cy = r.height / 2;
      const rX = ((y - cy) / cy) * -10;
      const rY = ((x - cx) / cx) * 12;
      el.style.transform = `perspective(1200px) rotateX(${rX}deg) rotateY(${rY}deg) scale(1.02)`;
    },
    []
  );

  const handleMouseLeave = useCallback(() => {
    const el = cardRef.current;
    if (!el) return;
    setHovered(false);
    el.style.transition =
      "transform 0.6s cubic-bezier(0.23,1,0.32,1), box-shadow 0.3s";
    el.style.transform = "";
    setTimeout(() => {
      if (el) el.style.transition = "";
    }, 600);
  }, []);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = cardRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;

      const rid = Date.now();
      const size = Math.max(r.width, r.height) * 1.5;
      setRipples((prev) => [
        ...prev,
        { id: rid, x: x - size / 2, y: y - size / 2, size },
      ]);
      setTimeout(
        () => setRipples((prev) => prev.filter((rr) => rr.id !== rid)),
        800
      );

      const colors = sparkColors[card.sparkType];
      const newParticles: Particle[] = Array.from({ length: 16 }, (_, i) => {
        const angle = (i / 16) * 360;
        const dist = 60 + Math.random() * 80;
        return {
          id: Date.now() + i,
          x,
          y,
          tx: Math.cos((angle * Math.PI) / 180) * dist,
          ty: Math.sin((angle * Math.PI) / 180) * dist,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 4 + Math.random() * 4,
          duration: 0.5 + Math.random() * 0.4,
        };
      });
      setParticles((prev) => [...prev, ...newParticles]);
      setTimeout(
        () =>
          setParticles((prev) =>
            prev.filter((p) => !newParticles.find((np) => np.id === p.id))
          ),
        1200
      );

      setClicked(true);
      setTimeout(() => setClicked(false), 600);

      el.style.boxShadow = `0 0 60px ${glowColors[card.sparkType]}`;
      setTimeout(() => {
        if (el) el.style.boxShadow = "";
      }, 600);
    },
    [card.sparkType]
  );

  return (
    <div
      id={`card-${card.id}`}
      className="mb-4"
      style={{ perspective: 1200 }}
    >
      <div
        ref={cardRef}
        onClick={handleClick}
        onMouseMove={isMob ? undefined : handleMouseMove}
        onMouseEnter={isMob ? undefined : () => setHovered(true)}
        onMouseLeave={isMob ? undefined : handleMouseLeave}
        className="relative bg-white border border-gray-100 rounded-2xl p-4 lg:p-6 flex flex-col lg:flex-row gap-4 lg:gap-6 overflow-hidden cursor-pointer backdrop-blur-xl transition-transform duration-150 ease-out shadow-sm hover:shadow-lg"
        style={{
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
      >
        {/* Animated border on hover */}
        <div
          className={`absolute -inset-px rounded-2xl bg-gradient-to-r from-lime-300 via-gray-200 to-violet-300 transition-opacity duration-400 -z-10 ${
            hovered ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Shimmer sweep */}
        <div className="absolute top-0 -left-full w-1/2 h-full bg-gradient-to-r from-transparent via-white/50 to-transparent -skew-x-12 animate-[sweep_3s_ease-in-out_infinite] pointer-events-none" />

        {/* Flash overlay on click */}
        <div
          className={`absolute inset-0 rounded-2xl pointer-events-none z-10 ${
            clicked ? "animate-[flashIn_0.4s_ease_forwards]" : ""
          }`}
        />

        {/* Badge */}
        {card.badge && (
          <div
            className={`${
              isMob ? "relative self-start mb-1" : "absolute top-4 right-5"
            } px-3 py-1 rounded-full text-[11px] font-bold tracking-wide bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg z-20 whitespace-nowrap`}
          >
            ⭐ {card.badge}
          </div>
        )}

        {/* Ripples */}
        {ripples.map((rp) => (
          <div
            key={rp.id}
            className="absolute rounded-full bg-violet-500/10 scale-0 animate-[rippleOut_0.8s_linear_forwards] pointer-events-none z-10"
            style={{
              width: rp.size,
              height: rp.size,
              left: rp.x,
              top: rp.y,
            }}
          />
        ))}

        {/* Sparks */}
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full pointer-events-none z-20"
            style={{
              width: p.size,
              height: p.size,
              left: p.x,
              top: p.y,
              background: p.color,
              boxShadow: `0 0 6px ${p.color}`,
              animation: `sparkFly ${p.duration}s ease-out forwards`,
              // @ts-expect-error CSS custom properties
              "--tx": `${p.tx}px`,
              "--ty": `${p.ty}px`,
            }}
          />
        ))}

        {/* Card visual */}
        <div
          className="shrink-0 flex items-center justify-center lg:justify-start overflow-visible"
          style={{
            width: isMob ? "100%" : slotWidth,
            height: scaledH,
          }}
        >
          <div
            className="relative shrink-0"
            style={{ width: scaledW, height: scaledH }}
          >
            <div
              className="absolute top-0 left-0"
              style={{
                width: card.intrinsicWidth,
                height: card.intrinsicHeight,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
              }}
            >
              <card.Component />
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            {card.tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-bold px-2 py-0.5 rounded-lg whitespace-nowrap"
                style={{
                  background: theme.tagBg,
                  border: `1px solid ${theme.tagBorder}`,
                  color: theme.tagColor,
                }}
              >
                {tag}
              </span>
            ))}
          </div>

          <h2 className="text-sm lg:text-base font-bold text-gray-900 mb-2 leading-tight">
            {card.name}
          </h2>

          <ul className="list-none mb-3 space-y-1">
            {card.features.map((f, i) => (
              <li
                key={i}
                className="text-xs lg:text-sm text-gray-600 flex items-start gap-1.5 leading-relaxed"
              >
                <span className="text-violet-500 mt-0.5">✓</span>
                {f}
              </li>
            ))}
          </ul>

          {(card.joiningFee || card.feeNote) && (
            <div className="text-xs text-gray-500 mb-3 flex items-center flex-wrap gap-1">
              🗓{" "}
              <strong className="text-gray-900 text-sm">
                {card.joiningFee}
              </strong>
              <span className="text-[11px] text-gray-500">{card.feeNote}</span>
            </div>
          )}

          <div className="flex items-center gap-3 flex-wrap">
            <Link href={resolvedCtaLink} target="_blank">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  trackCreditCardClick({
                    card_id: String(card.id),
                    card_name: card.name,
                    bank: card.bank,
                    lc2_code: lc2,
                    cta_link: resolvedCtaLink,
                  });
                }}
                className="px-5 py-2.5 rounded-full text-xs lg:text-sm font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 shadow-lg hover:shadow-xl transition-all whitespace-nowrap"
              >
                {card.ctaLabel}
              </button>
            </Link>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleCompare(card.id);
              }}
              className={`text-xs font-semibold px-3 py-2 rounded-full border transition-all ${
                isCompareSelected
                  ? "bg-gradient-to-r from-indigo-500 to-violet-500 text-white border-indigo-500"
                  : compareDisabled
                    ? "text-gray-400 border-gray-200 cursor-not-allowed"
                    : "text-indigo-600 border-indigo-200 bg-indigo-50 hover:bg-indigo-100"
              }`}
              disabled={compareDisabled && !isCompareSelected}
            >
              {isCompareSelected
                ? "✓ Added"
                : compareDisabled
                  ? "Compare Full"
                  : "+ Compare"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Root Component ────────────────────────────────────────────────────────
export default function CreditCardPage() {
  const searchParams = useSearchParams();
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set());
  const [sortBy, setSortBy] = useState<string>("popular");
  const [compareIds, setCompareIds] = useState<number[]>([]);
  const windowWidth = useWindowWidth();
  const isMob = windowWidth < 640;

  useEffect(() => {
    const cardId = searchParams.get("card");
    if (!cardId) return;
    const timer = setTimeout(() => {
      const el = document.getElementById(`card-${cardId}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.style.transition = "box-shadow 0.4s ease";
        el.style.boxShadow =
          "0 0 0 3px #6232FF, 0 8px 32px rgba(98,50,255,0.25)";
        el.style.borderRadius = "20px";
        setTimeout(() => {
          el.style.boxShadow = "";
        }, 2000);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchParams]);

  const toggleFilter = (name: string): void => {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  const clearFilters = (): void => setActiveFilters(new Set());

  const toggleCompare = (cardId: number): void => {
    setCompareIds((prev) => {
      if (prev.includes(cardId)) {
        return prev.filter((id) => id !== cardId);
      }
      if (prev.length >= MAX_COMPARE_CARDS) {
        return prev;
      }
      return [...prev, cardId];
    });
  };

  const clearCompare = (): void => setCompareIds([]);

  const filteredCards: CreditCard[] = (() => {
    const base =
      activeFilters.size === 0
        ? [...creditCardsData]
        : creditCardsData.filter((card) =>
            [...activeFilters].every((f) => card.tags.includes(f))
          );

    if (sortBy === "best") {
      return [...base].sort((a, b) => {
        const aHasBadge = a.badge ? 0 : 1;
        const bHasBadge = b.badge ? 0 : 1;
        return aHasBadge - bHasBadge;
      });
    }

    if (sortBy === "lowest") {
      return [...base].sort(
        (a, b) => parseFeeValue(a.joiningFee) - parseFeeValue(b.joiningFee)
      );
    }

    return base;
  })();

  const comparedCards = useMemo(
    () =>
      compareIds
        .map((id) => creditCardsData.find((card) => card.id === id))
        .filter((card): card is CreditCard => Boolean(card)),
    [compareIds]
  );

  const canShowComparePanel = comparedCards.length >= 2;

  return (
    <>
      <style>{`
        @keyframes sweep { 0% { left: -100%; } 100% { left: 220%; } }
        @keyframes rippleOut { to { transform: scale(4); opacity: 0; } }
        @keyframes sparkFly {
          0% { transform: translate(0,0) scale(1); opacity: 1; }
          100% { transform: translate(var(--tx), var(--ty)) scale(0); opacity: 0; }
        }
        @keyframes flashIn {
          0% { background: rgba(255,255,255,0.18); }
          100% { background: rgba(255,255,255,0); }
        }
      `}</style>

      <div className="max-w-5xl mx-auto">
        <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-4 tracking-tight">
          Best Credit Cards in India
        </h1>

        {/* Filters */}
        <div className="mb-3 bg-white/80 border border-gray-100 rounded-xl p-3 backdrop-blur-sm">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-semibold text-gray-500">Filters</h3>
            {activeFilters.size > 0 && (
              <button
                onClick={clearFilters}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
              >
                Clear All
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {filtersData.map((filter) => {
              const isActive = activeFilters.has(filter.name);
              return (
                <button
                  key={filter.name}
                  onClick={() => toggleFilter(filter.name)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${
                    isActive
                      ? "bg-indigo-50 border-indigo-300 text-indigo-700"
                      : "bg-transparent border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <span>{filter.icon}</span> {filter.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sort */}
        {/* <div className="flex items-center gap-3 flex-wrap text-sm text-gray-500 mb-4 bg-white/80 border border-gray-100 rounded-xl p-3 backdrop-blur-sm">
          <span className="whitespace-nowrap">Sort by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-indigo-50 border border-indigo-200 text-indigo-700 px-3 py-1 rounded-lg text-sm font-semibold cursor-pointer outline-none flex-1 max-w-[180px]"
          >
            <option value="popular">🔥 Popular</option>
            <option value="best">⭐ Best for You</option>
            <option value="lowest">💰 Lowest Fee</option>
          </select>
          <div className="ml-auto flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-400">
              Compare {comparedCards.length}/{MAX_COMPARE_CARDS}
            </span>
            {compareIds.length > 0 && (
              <button
                onClick={clearCompare}
                className="border-none bg-red-50 text-red-600 rounded-full px-2.5 py-1 text-xs font-bold"
              >
                Clear
              </button>
            )}
          </div>
        </div> */}

        {/* Compare Panel */}
        {comparedCards.length > 0 && (
          <div className="mb-4 bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100 rounded-2xl p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
              <div>
                <div className="text-sm font-bold text-indigo-900">
                  Compare Credit Cards
                </div>
                <div className="text-xs text-indigo-600">
                  Select up to {MAX_COMPARE_CARDS} cards. Comparison table
                  appears with 2+ cards.
                </div>
              </div>
              {canShowComparePanel && (
                <span className="text-xs font-bold text-indigo-700 bg-white/70 px-2.5 py-1 rounded-full">
                  {comparedCards.length} cards ready
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {comparedCards.map((card) => (
                <button
                  key={card.id}
                  onClick={() => toggleCompare(card.id)}
                  className="flex items-center gap-2 border border-indigo-200 bg-white text-gray-800 rounded-full px-3 py-1.5 text-xs font-bold"
                >
                  <span>{card.cardLabel}</span>
                  <span className="text-gray-400 font-semibold">Remove</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Comparison Table */}
        {canShowComparePanel && (
          <div className="mb-5 bg-white/95 border border-gray-100 rounded-2xl overflow-hidden shadow-lg backdrop-blur-sm">
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-base lg:text-lg font-bold text-gray-900">
                Feature Comparison
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse min-w-[680px]">
                <thead>
                  <tr>
                    <th className="text-left p-3 text-xs text-gray-500 bg-gray-50 border-b border-gray-100 sticky left-0 z-10">
                      Attribute
                    </th>
                    {comparedCards.map((card) => (
                      <th
                        key={card.id}
                        className="text-left p-3 text-sm font-bold text-gray-900 bg-gray-50 border-b border-gray-100 min-w-[200px]"
                      >
                        <div>{card.name}</div>
                        <div className="text-xs text-gray-500 font-semibold mt-1">
                          {card.bank} • {card.network}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      label: "Best For",
                      render: (card: CreditCard) => card.tags.join(", "),
                    },
                    {
                      label: "Joining Fee",
                      render: (card: CreditCard) =>
                        card.joiningFee || "Not specified",
                    },
                    {
                      label: "Fee Note",
                      render: (card: CreditCard) =>
                        card.feeNote || "Not specified",
                    },
                    {
                      label: "Feature 1",
                      render: (card: CreditCard) => card.features[0] || "—",
                    },
                    {
                      label: "Feature 2",
                      render: (card: CreditCard) => card.features[1] || "—",
                    },
                    {
                      label: "Feature 3",
                      render: (card: CreditCard) => card.features[2] || "—",
                    },
                  ].map((row, rowIndex) => (
                    <tr key={row.label}>
                      <td
                        className={`p-3 text-xs font-bold text-gray-600 border-b border-gray-50 sticky left-0 ${
                          rowIndex % 2 === 0 ? "bg-gray-50/50" : "bg-white"
                        }`}
                      >
                        {row.label}
                      </td>
                      {comparedCards.map((card) => (
                        <td
                          key={`${row.label}-${card.id}`}
                          className={`p-3 text-sm text-gray-900 border-b border-gray-50 ${
                            rowIndex % 2 === 0 ? "bg-gray-50/50" : "bg-white"
                          }`}
                        >
                          {row.render(card)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Card list */}
        {filteredCards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500 gap-2 text-center">
            <p className="text-base lg:text-lg font-semibold text-gray-800">
              No cards match your filters
            </p>
            <p className="text-sm">
              Try removing some filters to see more results.
            </p>
          </div>
        ) : (
          filteredCards.map((card) => (
            <CreditCardItem
              key={card.id}
              card={card}
              isCompareSelected={compareIds.includes(card.id)}
              compareDisabled={
                compareIds.length >= MAX_COMPARE_CARDS &&
                !compareIds.includes(card.id)
              }
              onToggleCompare={toggleCompare}
            />
          ))
        )}
      </div>
    </>
  );
}
