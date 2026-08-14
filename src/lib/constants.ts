export interface LenderFeature {
  title: string;
  description: string;
}

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
    headline: "Get Personal Loans up to 5,000 to ₹10 Lakhs",
    description: "Minimal documentation and fast digital process",
    keyFeature: "Flexible Repayment Options and Quick Access to Lump Sum",
    interestRate: "Interest rate starting from 1.16%% per month.",
  },
] as const;

export const STATIC_LENDER_LOGOS: Record<
  string,
  { src: string; darkBg?: boolean }
> = {
  RapidMoney: { src: "/rapidmoney.svg" },
  RamFinCorp: { src: "/ramfinCorp.png" },
  Vivifi: { src: "/vivifi.webp" },
  TrueBalance: { src: "/truebalance.png" },
  KreditBee: { src: "/kreditbee-logo.svg" },
  // SpeedoLoan: { src: "/speedoloan.png" },
  CashMySalary: { src: "/cashmysalary.webp" },
  LoanWalle: { src: "/loanwalle.webp" },
  Cashvia: { src: "/cashvia1.png" },
  TrueFund: { src: "/truefund.svg" },
  MoneyDot: { src: "/moneydot.png" },
  RupiNow: { src: "/rupinow.png" },
  ASAPFinance: { src: "/asapfinance.webp" },
  Nira: { src: "/nira.avif" },
  Apollo: { src: "/apollo.png" },
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
  Zype: {
    headline: "Get Personal Loans from ₹15,000 to ₹5 Lakhs",
    description: "Flexible repayment options and loan tenure from 6 month to 18 months",
    keyFeature: "Flexible Repayment Options and Approval in 60 seconds",
    interestRate: "Interest Rates start at 0.05%* per day",
  },
  Fibe: {
    headline: "Get up to ₹5,00,000 with quick approval!",
    description: "Flexible EMI options and instant digital process",
    keyFeature: "Flexible EMI Options and Instant Disbursement",
    interestRate: "Interest Rates start at 1.5%* per month",
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
  Vivifi: {
   headline: "Get up to ₹3,00,000 in minutes!",
    description: "Digital personal loans with flexible tenure options",
    keyFeature: "Flexible Tenure and 0% foreclose charge",
    interestRate: "Interest Rates start at 1.5%* per month",
  },
  PocketCredit: {
    headline: "Get up to ₹50,000 instantly!",
    description: "Quick personal loans with minimal paperwork",
    keyFeature: "Minimal Paperwork and Instant Disbursement",
    interestRate: "Interest Rates start at 1%* per month",
  },
  RapidMoney: {
    headline: "Get Personal Loans from ₹5,000 to ₹15,000",
    description: "Flexible repayment options and loan tenure from 1 month to 6 months",
    keyFeature: "Quick Access to Lump Sum Amount",
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
  TrueBalance: {
    headline: "Get Personal Loans from ₹1,000 to ₹2 Lakhs",
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
  // SpeedoLoan: {
  //   headline: "Get up to ₹50,000 with quick approval!",
  //   description: "Personal loans with fast disbursement and no hidden charges",
  //   keyFeature: "Quick Approval and No Hidden Charges",
  //   interestRate: "Interest Rates start at 1%* per day",
  // },
  CashMySalary: {
    headline: "Get up to ₹50,000 with quick approval!",
    description: "Personal loans with fast disbursement and no hidden charges",
    keyFeature: "Quick Approval and No Hidden Charges",
    interestRate: "Interest Rates start at 1%* per day",
  },
  LoanWalle: {
    headline: "Get up to ₹1,00,000 with quick approval!",
    description: "Personal loans with fast disbursement and No Prepayment Charges",
    keyFeature: "Quick Approval and No Prepayment Charges",
    interestRate: "Interest Rates start at 1%* per day",
  },
  Cashvia: {
    headline: "Get up to ₹1,00,000 with quick approval!",
    description: "Personal loans with fast disbursement and minimal documentation",
    keyFeature: "Quick Approval and Minimal Documentation",
    interestRate: "Interest Rates start at 1.0%* per month",
  },
  TrueFund: {
    headline: "Get up to ₹50,000 with quick approval!",
    description: "Personal loans with Instant Loan Approval and Smart & Efficient Processing",
    keyFeature: "Quick Approval and Minimal Documentation",
    interestRate: "Interest Rates start at 0.4% to 1.1% per day",
  },
  MoneyDot: {
    headline: "Get up to 10,000 to ₹1,00,000 with quick approval!",
    description: "Personal loans with Instant Loan Approval and Zero paperwork",
    keyFeature: "Quick Approval and with no collateral",
    interestRate: "Interest Rates start at 0.07% to 0.16% per day",
  },
  RupiNow: {
    headline: "Get up to ₹5,00,000 with quick approval!",
    description: "Personal loans with Instant Loan Approval and Zero Hidden Charges",
    keyFeature: "Flexible Tenure and Zero Hidden Charges",
    interestRate: "Interest Rates start at 12% to 30% per annum",
  },
  ASAPFinance: {
    headline: "Get up to ₹12,000 with quick approval!",
    description: "Personal loans with Fast Approval and No Collateral Needed",
    keyFeature: "Hassle-Free Documentation and No Collateral Needed",
    interestRate: "Interest Rates start at 0.5% to 1% per day",
  },
  Nira: {
    headline: "Get up to ₹1,00,000 with quick approval!",
    description: "Personal loans with low interest rates and flexible tenure",
    keyFeature: "Easy to repay and low interest loans",
    interestRate: "Interest Rates start from 2% per month.",
  },
  Apollo: {
    headline: "Get up to ₹50,000 with quick approval!",
    description: "Fully digital personal loan and no paperwork",
    keyFeature: "Quick Approval and up to 6 months tenure",
    interestRate: "Interest Rates start at 5% to 8% per month.",
  },
};

// Dashboard priority order - lenders are displayed in this order when available
// Lower index = higher priority (shown first)
export const DASHBOARD_PRIORITY_ORDER: string[] = [
  "RamFinCorp",
  // "SpeedoLoan",
  "CashMySalary",
  "LoanWalle",
  "Vivifi",
  "Cashvia",
  "TrueBalance",
  "RapidMoney",
  "KreditBee",
  "TrueFund",
  "MoneyDot",
  "RupiNow",
  "ASAPFinance",
  "Nira",
  "Apollo",
  "LendingPlate",
];

// Short feature tags for each lender (displayed in offer cards)
export const LENDER_FEATURE_TAGS: Record<string, string> = {
  KreditBee: "High approval chances",
  TrueBalance: "Quick approval",
  RapidMoney: "Quick approval",
  RamFinCorp: "Flexible loan options",
  Vivifi: "Flexible loan options",
  // SpeedoLoan: "Quick approval",
  CashMySalary: "Quick approval",
  LoanWalle: "Only for EPFO registered users",
  Cashvia: "Minimal documentation",
  TrueFund: "Quick approval",
  MoneyDot: "no collateral",
  RupiNow: "zero hidden charges",
  ASAPFinance: "Fast approval",
  Nira: "Low interest rates",
  Apollo: "Fully digital loan and no paperwork",
};


export const UTM_MEDIUM_LENDERS_FEATURES: Record<string, [LenderFeature, LenderFeature, LenderFeature]> = {
  MoneyDot: [
    { title: "Quick Approval", description: "loan up to ₹1 Lakh" },
    { title: "Minimal Paperwork", description: "100% digital process" },
    { title: "Flexible Tenure", description: "Up to 6 months" },
  ],
  KreditBee: [
    { title: "Highest Approval", description: "Upto 100% off on PF" },
    { title: "Up to ₹10 Lakhs", description: "High loan amount" },
    { title: "Instant Disbursal", description: "Same day transfer" },
  ],
  TrueFund: [
    { title: "Quick Approval", description: "Fast processing" },
    { title: "Minimal Paperwork", description: "100% digital process" },
    { title: "Flexible Repayment", description: "Easy repayment options" },
  ],
  RapidMoney: [
    { title: "Quick Approval", description: "Fast processing" },
    { title: "Flexible Repayment", description: "Easy repayment options" },
    { title: "Flexible Tenure", description: "Up to 6 months" },
  ],
  RamFinCorp: [
    { title: "Quick Approval", description: "Fast processing" },
    { title: "Flexible Repayment", description: "Easy repayment options" },
    { title: "Transparent Terms", description: "No hidden charges" },
  ],
  LoanWalle: [
    { title: "Quick Approval", description: "Fast processing" },
    { title: "Flexible Repayment", description: "Easy repayment options" },
    { title: "Flexible Tenure", description: "No Prepayment Charges" },
  ],
  ASAPFinance: [
    { title: "Quick Approval", description: "Fast processing" },
    { title: "No Collateral", description: "No collateral required" },
    { title: "Hassle-Free Documentation", description: "No documentation required" },
  ],
  // SpeedoLoan: [
  //   { title: "Quick Approval", description: "Fast processing" },
  //   { title: "No Hidden Charges", description: "Secure and Trusted" },
  //   { title: "Up to ₹50,000", description: "High loan amount" },
  // ],
  CashMySalary: [
    { title: "Quick Approval", description: "Fast processing" },
    { title: "No Hidden Charges", description: "Secure and Trusted" },
    { title: "Up to ₹50,000", description: "High loan amount" },
  ],
};

// Default features if lender not found in UTM_MEDIUM_LENDERS_FEATURES
export const DEFAULT_LENDER_FEATURES: [LenderFeature, LenderFeature, LenderFeature] = [
  { title: "Quick Approval", description: "Fast processing" },
  { title: "Minimal Paperwork", description: "100% digital process" },
  { title: "Flexible Tenure", description: "Easy repayment options" },
];



// Default feature tag if lender not found
export const DEFAULT_FEATURE_TAG = "Quick approval";

// Feature badges for each lender (3 badges per lender) - used in LoanOffersBanner
export const LENDER_FEATURE_BADGES: Record<string, [string, string, string]> = {
  RapidMoney: ["Quick Approval", "Flexible Repayment", "Up to ₹15,000"],
  Vivifi: ["0% Foreclose Charge", "Highest Approval", "Quick Disbursal"],
  LoanWalle: ["EPFO Users Only", "No Prepayment Fee", "Quick Approval"],
  KreditBee: ["Upto 100% off on PF", "Loans up to ₹10 Lakh", "Instant Disbursal"],
  TrueBalance: ["Loans up to ₹2 Lakh", "Minimal Docs", "Quick Approval"],
  RamFinCorp: ["Transparent Terms", "Quick Processing", "Easy Approval"],
  MoneyDot: ["Loans up to ₹1 Lakh", "Zero Paperwork", "No Collateral"],
  // SpeedoLoan: ["Quick Approval", "No Hidden Charges", "Up to ₹50,000"],
  CashMySalary: ["Quick Approval", "No Hidden Charges", "Up to ₹50,000"],
  Cashvia: ["Minimal Docs", "Quick Approval", "Fast Disbursal"],
  TrueFund: ["Quick Approval", "Up to ₹10 Lakh", "Flexible Repayment"],
  RupiNow: ["Zero Hidden Charges", "Flexible Tenure", "Up to ₹5 Lakh"],
  ASAPFinance: ["Fast Approval", "No Collateral", "Hassle-Free Docs"],
  Nira: ["Easy to repay", "Low interest loans", "Flexible tenure"],
  Apollo: ["Fully Digital Loan", "Quick Approval", "Up to 6 months tenure"],
};

// Default feature badges if lender not found
export const DEFAULT_FEATURE_BADGES: [string, string, string] = ["Instant Approval", "0% Foreclose Charge", "Quick Disbursal"];

// Max loan amount each lender supports (used for filtering/priority sorting)
export const LENDER_MAX_AMOUNT: Record<string, number> = {
  KreditBee: 1000000,       // ₹10 Lakhs
  TrueBalance: 200000,      // ₹2 Lakhs
  RapidMoney: 15000,        // ₹15,000
  RamFinCorp: 100000,       // ₹1 Lakh
  Vivifi: 500000,           // ₹5 Lakhs
  // SpeedoLoan: 50000,      // ₹50,000
  CashMySalary: 50000,    // ₹50,000
  LoanWalle: 100000,      // ₹1 Lakh
  Cashvia: 30000,      // ₹30,000
  TrueFund: 50000,      // ₹50,000
  MoneyDot: 100000,      // ₹1 Lakhs
  RupiNow: 500000,      // ₹5 Lakhs
  ASAPFinance: 12000,      // ₹12,000
  Nira: 100000,      // 1 Lakhs
  Apollo: 50000,      // 50,000
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

export function getLenderFeatures(name: string): [LenderFeature, LenderFeature, LenderFeature] {
  return UTM_MEDIUM_LENDERS_FEATURES[name] || DEFAULT_LENDER_FEATURES;
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
