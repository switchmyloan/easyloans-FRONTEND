export const PROFILE_OPTIONS = [
  "Salaried",
  "Self Employed",
  "Freelancer",
  "Student",
  "Other",
] as const;

export const GENDER_OPTIONS = ["Male", "Female", "Other"] as const;

export const OFFERS = [
  {
    lenderName: "KreditBee",
    logo: "/kreditbee-logo.svg",
    headline: "Get up to ₹5,000 to ₹4,00,000 in minutes!",
    description: "Flexible repayment options and loan tenure up to 24 months",
    keyFeature: "Instant Disbursement and Flexible EMI Options",
    interestRate: "Interest Rates start at 0.1%* per day",
  },
  {
    lenderName: "MoneyView",
    logo: "/moneyview-logo.svg",
    headline: "Get up to ₹10,00,000 with quick approval!",
    description: "Minimal documentation and fast digital process",
    keyFeature: "Flexible Repayment Options and Quick Access to Lump Sum",
    interestRate: "Interest Rates start at 1.33%* per month",
  },
] as const;

export const STATIC_LENDER_LOGOS: Record<
  string,
  { src: string; darkBg?: boolean }
> = {
  RapidMoney: { src: "/dark_rapid_money_logo.webp", darkBg: true },
  poonawalla: { src: "/poonawalla.svg" },
  HeroFinCorp: { src: "/herofincorp.svg", darkBg: true },
  AdityaBirlaCapital: { src: "/adityabirlacapitalloan.svg" },
  RamFinCorp: { src: "/ramfinCorp.png" },
};

export const STATIC_LENDER_DETAILS: Record<
  string,
  {
    headline: string;
    description: string;
    keyFeature: string;
    interestRate: string;
  }
> = {
  SmartCoin: {
    headline: "Get up to ₹5,000 to ₹25,000 in minutes!",
    description: "Flexible repayment options and loan tenure from 1 month to 6 months",
    keyFeature: "Flexible Repayment Options and Quick Access to Lump Sum Amount",
    interestRate: "Interest Rates start at 0.1%* per day",
  },
  LendingPlate: {
    headline: "Get up to ₹50,000 with instant approval!",
    description: "Quick digital process and minimal documentation required",
    keyFeature: "Instant Approval and Same Day Disbursement",
    interestRate: "Interest Rates start at 1%* per month",
  },
  Zype: {
    headline: "Get up to ₹3,000 to ₹3,00,000 in minutes!",
    description: "Flexible repayment options and loan tenure from 6 month to 18 months",
    keyFeature: "Flexible Repayment Options and Approval in 60 seconds",
    interestRate: "Interest Rates start at 0.05%* per day",
  },
  MPokket: {
    headline: "Get up to ₹30,000 instantly!",
    description: "Quick loans for students and young professionals",
    keyFeature: "No Collateral Required and Quick Disbursement",
    interestRate: "Interest Rates start at 1%* per month",
  },
  Fibe: {
    headline: "Get up to ₹5,00,000 with quick approval!",
    description: "Flexible EMI options and instant digital process",
    keyFeature: "Flexible EMI Options and Instant Disbursement",
    interestRate: "Interest Rates start at 1.5%* per month",
  },
  CreditPlus: {
    headline: "Get up to ₹1,00,000 in minutes!",
    description: "Hassle-free personal loans with minimal documentation",
    keyFeature: "Zero Prepayment Charges and Flexible Tenure",
    interestRate: "Interest Rates start at 1.2%* per month",
  },
  FiMoney: {
    headline: "Get up to ₹5,00,000 instantly!",
    description: "Smart personal loans with flexible repayment options",
    keyFeature: "Instant Approval and Smart Money Management",
    interestRate: "Interest Rates start at 1.2%* per month",
  },
  MyFloat: {
    headline: "Get up to ₹25,000 in minutes!",
    description: "Quick salary advance and personal loans",
    keyFeature: "Salary Advance and Flexible Repayment",
    interestRate: "Interest Rates start at 0.1%* per day",
  },
  Loan112: {
    headline: "Get up to ₹2,00,000 with quick approval!",
    description: "Instant personal loans with easy EMI options",
    keyFeature: "Easy EMI Options and No Hidden Charges",
    interestRate: "Interest Rates start at 1%* per month",
  },
  Vivifi: {
    headline: "Get up to ₹5,00,000 in minutes!",
    description: "Digital personal loans with flexible tenure options",
    keyFeature: "Flexible Tenure and Quick Disbursement",
    interestRate: "Interest Rates start at 1.5%* per month",
  },
  PocketCredit: {
    headline: "Get up to ₹50,000 instantly!",
    description: "Quick personal loans with minimal paperwork",
    keyFeature: "Minimal Paperwork and Instant Disbursement",
    interestRate: "Interest Rates start at 1%* per month",
  },
  RapidMoney: {
    headline: "Get up to ₹5,000 to ₹25,000 in minutes!",
    description: "Flexible repayment options and loan tenure from 1 month to 6 months",
    keyFeature: "Flexible Repayment Options and Quick Access to Lump Sum Amount",
    interestRate: "Interest Rates start at 0.1%* per day",
  },
  RamFinCorp: {
    headline: "Get up to ₹1,00,000 with easy approval!",
    description: "Personal loans with transparent terms and conditions",
    keyFeature: "Transparent Terms and Quick Processing",
    interestRate: "Interest Rates start at 1.5%* per month",
  },
  poonawalla: {
    headline: "Get up to ₹25,00,000 with quick approval!",
    description: "Personal loans with attractive interest rates and flexible tenure",
    keyFeature: "Pre-approved Offers and Instant Disbursement",
    interestRate: "Interest Rates start at 10.49%* per annum",
  },
  HeroFinCorp: {
    headline: "Get up to ₹5,00,000 in minutes!",
    description: "Hassle-free personal loans with quick digital process",
    keyFeature: "No Collateral Required and Flexible EMI Options",
    interestRate: "Interest Rates start at 14%* per annum",
  },
  AdityaBirlaCapital: {
    headline: "Get up to ₹40,00,000 with easy approval!",
    description: "Personal loans with competitive rates from a trusted brand",
    keyFeature: "Quick Approval and Minimal Documentation",
    interestRate: "Interest Rates start at 10.5%* per annum",
  },
};

const DEFAULT_LENDER_DETAIL = {
  headline: "Get a personal loan in minutes!",
  description: "Flexible repayment options and quick approval process",
  keyFeature: "Quick Approval and Flexible Repayment",
  interestRate: "Competitive interest rates",
};

export function getStaticLenderDetail(name: string) {
  return STATIC_LENDER_DETAILS[name] || DEFAULT_LENDER_DETAIL;
}

export const LOADING_DELAY_MS = 3000;

// ---------- KreditBee Coupons ----------

export interface KBCoupon {
  code: string;
  discount: string;
  description: string;
  eligibility: ("salaried" | "business")[];
}

export const KB_COUPONS: KBCoupon[] = [
  {
    code: "New100",
    discount: "100% OFF",
    description:
      "100% off processing fee for salaried professionals! Apply now with KreditBee.",
    eligibility: ["salaried"],
  },
  {
    code: "KBPA50",
    discount: "50% OFF",
    description:
      "50% off processing fee for salaried & business applicants! Limited time offer.",
    eligibility: ["salaried", "business"],
  },
  {
    code: "LIST70",
    discount: "70% OFF",
    description:
      "70% off processing fee exclusively for business owners! Apply now.",
    eligibility: ["business"],
  },
  {
    code: "LIST75",
    discount: "75% OFF",
    description:
      "75% off processing fee exclusively for business owners! Apply now.",
    eligibility: ["business"],
  },
  {
    code: "KOT100",
    discount: "100% OFF",
    description:
      "Up to 100% off processing fee for business applicants! Don't miss out.",
    eligibility: ["business"],
  },
];

export function getEligibleCoupon(profile: string): KBCoupon {
  const businessProfiles = ["Self Employed", "Freelancer"];
  const category = businessProfiles.includes(profile) ? "business" : "salaried";
  const eligible = KB_COUPONS.filter((c) => c.eligibility.includes(category));
  return eligible[Math.floor(Math.random() * eligible.length)];
}
