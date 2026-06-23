export const PROFILE_OPTIONS = [
  "Salaried",
  "Self Employed",
] as const;

export const GENDER_OPTIONS = ["Male", "Female", "Other"] as const;

export const OFFERS = [
  {
    lenderName: "KreditBee",
    logo: "/kreditbee-logo.svg",
    headline: "Get Personal Loans up to ₹6000 to ₹10 Lakhs",
    description: "Flexible repayment options and loan tenure up to 24 months",
    keyFeature: "Instant Disbursement and Flexible EMI Options",
    interestRate: "Interest rate starting from 1% per month",
  },
  {
    lenderName: "MoneyView",
    logo: "/moneyview-logo.svg",
    headline: "Get Personal Loans up to ₹10 Lakhs",
    description: "Minimal documentation and fast digital process",
    keyFeature: "Flexible Repayment Options and Quick Access to Lump Sum",
    interestRate: "Interest rate starting from 1.16%% per month.",
  },
] as const;

export const STATIC_LENDER_LOGOS: Record<
  string,
  { src: string; darkBg?: boolean }
> = {
  RapidMoney: { src: "/rapid-black.webp", darkBg: true },
  poonawalla: { src: "/poonawalla.svg" },
  HeroFinCorp: { src: "/herofincorp.svg", darkBg: true },
  AdityaBirlaCapital: { src: "/adityabirlacapitalloan.svg" },
  RamFinCorp: { src: "/ramfinCorp.png" },
  SmartCoinHighIntent: { src: "/olyv.png" },
  SmartCoin: { src: "/olyv.png" },
  TrueBalance: { src: "/truebalance.png" },
  Zype_Dedupe: { src: "/zype.png" },
  UnitySmallFinanceBank: { src: "/unity_bank.png" },
  CreditPlus: { src: "/credit.svg" },
  KreditBee: { src: "/kreditbee-logo.svg" },
  MPokket: { src: "/mpoket.svg" },
  Loan112: { src: "/logo_Loan112.svg" },
  LendingPlate: { src: "/lending.png" },
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
  KreditBee: {
    headline: "Get Personal Loans up to ₹6,000 to ₹10 Lakhs",
    description: "Flexible repayment options and loan tenure up to 24 months",
    keyFeature: "Instant Disbursement and Flexible EMI Options",
    interestRate: "Interest rate starting from 1% per month",
  },
  SmartCoin: {
    headline: "Get Personal Loans from ₹1,000 to ₹5 Lakhs",
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
    headline: "Get Personal Loans from ₹15,000 to ₹5 Lakhs",
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
    headline: "Get Personal Loans upto ₹1,000 to ₹100,000",
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
    headline: "Get Personal Loans from ₹5,000 to ₹25,000",
    description: "Flexible repayment options and loan tenure from 1 month to 6 months",
    keyFeature: "Flexible Repayment Options and Quick Access to Lump Sum Amount",
    interestRate: "Interest rate starting from 3.01% per month.",
  },
  RamFinCorp: {
    headline: "Get up to ₹1,00,000 with easy approval!",
    description: "Personal loans with transparent terms and conditions",
    keyFeature: "Transparent Terms and Quick Processing",
    interestRate: "Interest Rates start at 1.5%* per month",
  },
  poonawalla: {
    headline: "Get Instant Personal Loans from ₹50,000 to ₹15 Lakhs",
    description: "Personal loans with attractive interest rates and flexible tenure",
    keyFeature: "Pre-approved Offers and Instant Disbursement",
    interestRate: "Interest rate starting from 0.83% per month.",
  },
  HeroFinCorp: {
    headline: "Get Personal Loans from ₹50,000 to ₹5 Lakhs",
    description: "Hassle-free personal loans with quick digital process",
    keyFeature: "No Collateral Required and Flexible EMI Options",
    interestRate: "Interest rate starting from 1.58% per month.",
  },
  AdityaBirlaCapital: {
    headline: "Get up to ₹40,00,000 with easy approval!",
    description: "Personal loans with competitive rates from a trusted brand",
    keyFeature: "Quick Approval and Minimal Documentation",
    interestRate: "Interest Rates start at 10.5%* per annum",
  },
  SmartCoinHighIntent: {
    headline: "Get Personal Loans from ₹1,000 to ₹5 Lakhs",
    description: "Flexible repayment options and loan tenure from 1 month to 6 months",
    keyFeature: "Flexible Repayment Options and Quick Access to Lump Sum Amount",
    interestRate: "Interest rate starting from 1.5% per month.",
  },
  TrueBalance: {
    headline: "Get Personal Loans from ₹1,000 to ₹5 Lakhs",
    description: "Quick personal loans with minimal documentation and fast disbursement",
    keyFeature: "Instant Approval and Same Day Disbursement",
    interestRate: "Interest rate starting from 2.4% per month.",
  },
  Zype_Dedupe: {
    headline: "Get Personal Loans from ₹15,000 to ₹5 Lakhs",
    description: "Flexible repayment options and loan tenure from 6 month to 18 months",
    keyFeature: "Flexible Repayment Options and Approval in 60 seconds",
    interestRate: "Interest rate starting from 1.5% per month.",
  },
  UnitySmallFinanceBank: {
    headline: "Get Personal Loans from ₹1,00,000 to ₹5,00,000",
    description: "Flexible repayment options and loan tenure from 6 to 36 months",
    keyFeature: "Instant Approval and Same Day Disbursement",
    interestRate: "Interest rate starting from 1.3% per month.",
  },
};

// Max loan amount each lender supports (used for filtering/priority sorting)
export const LENDER_MAX_AMOUNT: Record<string, number> = {
  KreditBee: 1000000,       // ₹10 Lakhs
  MoneyView: 1000000,       // ₹10 Lakhs
  poonawalla: 1500000,      // ₹15 Lakhs
  HeroFinCorp: 500000,      // ₹5 Lakhs
  SmartCoinHighIntent: 500000, // ₹5 Lakhs
  Zype_Dedupe: 500000,      // ₹5 Lakhs
  TrueBalance: 500000,      // ₹5 Lakhs
  UnitySmallFinanceBank: 500000, // ₹5 Lakhs
  RapidMoney: 25000,        // ₹25,000
  AdityaBirlaCapital: 4000000, // ₹40 Lakhs
  RamFinCorp: 100000,       // ₹1 Lakh
  SmartCoin: 500000,        // ₹5 Lakhs
  Zype: 500000,             // ₹5 Lakhs
  Fibe: 500000,             // ₹5 Lakhs
  LendingPlate: 50000,      // ₹50,000
  MPokket: 30000,           // ₹30,000
  FiMoney: 500000,          // ₹5 Lakhs
  MyFloat: 25000,           // ₹25,000
  Loan112: 200000,          // ₹2 Lakhs
  Vivifi: 500000,           // ₹5 Lakhs
  PocketCredit: 50000,      // ₹50,000
  CreditPlus: 100000,       // ₹1 Lakh
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
