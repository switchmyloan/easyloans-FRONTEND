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
  // RamFinCorp: { src: "/ramfinCorp.png" },
  SmartCoin: { src: "/olyv.png" },
  // Vivifi: { src: "/vivifi.webp" },
  TrueBalance: { src: "/truebalance.png" },
  KreditBee: { src: "/kreditbee-logo.svg" },
  // SpeedoLoan: { src: "/speedoloan.png" },
  CashMySalary: { src: "/cashmysalary.webp" },
  LoanWalle: { src: "/loanwalle.webp" },
  LoanWalleSalaried: { src: "/loanwalle.webp" },
  LoanWalleSelfEmployed: { src: "/loanwalle.webp" },
  TrueFund: { src: "/truefund.svg" },
  MoneyDot: { src: "/moneydot.png" },
  RupiNow: { src: "/rupinow.png" },
  // ASAPFinance: { src: "/asapfinance.webp" },
  Apollo: { src: "/apollo.png" },
  LendingPlate: { src: "/lending.png" },
  Cash2You: { src: "/CashToYouLogo.svg" },
  RocketCash: { src: "/RocketCashLogo.png" },
  // MMB: { src: "/MMB_Logo.png" },
  DhanPocket: { src: "/dhanpocket.png" }, 
  // TurantPaisa: { src: "/Turantpaisa.png" }, 
  QuickMoney: { src: "/quickmoney.png" },
  Kamakshimoney: { src: "/kamakshimoney.svg" },
};

export const DISPLAY_NAMES: Record<string, string> = {
  KreditBee: "KreditBee",
  RapidMoney: "RapidMoney",
  // RamFinCorp: "Ram FinCorp",
  SmartCoin: "Olyv",
  // Vivifi: "Vivifi",
  // MMB: "MMB",
  TrueBalance: "TrueBalance",
  CashMySalary: "CashMySalary",
  TrueFund: "TrueFund",
  MoneyDot: "MoneyDot",
  RupiNow: "RupiNow",
  Apollo: "Apollo",
  LendingPlate: "LendingPlate",
  Cash2You: "CashToYou",
  RocketCash: "Rocket Cash",
  LoanWalle: "LoanWalle",
  LoanWalleSalaried: "LoanWalle",
  LoanWalleSelfEmployed: "LoanWalle",
  DhanPocket: "DhanPocket",
  // TurantPaisa: "TurantPaisa",
  QuickMoney: "QuickMoney",
  Kamakshimoney: "Kamakshimoney",
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
  // Vivifi: {
  //  headline: "Get up to ₹3,00,000 in minutes!",
  //   description: "Digital personal loans with flexible tenure options",
  //   keyFeature: "Flexible Tenure and 0% foreclose charge",
  //   interestRate: "Interest Rates start at 1.5%* per month",
  // },
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
  // RamFinCorp: {
  //   headline: "Get Personal Loans from ₹5,000 to ₹2 Lakhs",
  //   description: "Quick personal loans with minimal documentation and fast disbursements",
  //   keyFeature: "Instant Approval and Same Day Disbursement",
  //   interestRate: "Interest Rates start at 1.5%* per month",
  // },
  SmartCoin: {
    headline: "Get up to ₹5,00,000 with quick approval!",
    description: "Personal loans with fast disbursement and No Prepayment Charges",
    keyFeature: "Quick Approval and No Prepayment Charges",
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
  LoanWalleSalaried: {
    headline: "Get up to ₹1,00,000 with quick approval!",
    description: "Personal loans with fast disbursement and No Prepayment Charges",
    keyFeature: "Quick Approval and No Prepayment Charges",
    interestRate: "Interest Rates start at 1%* per day",
  },
  LoanWalleSelfEmployed: {
    headline: "Get up to ₹1,00,000 with quick approval!",
    description: "Personal loans with fast disbursement and No Prepayment Charges",
    keyFeature: "Quick Approval and No Prepayment Charges",
    interestRate: "Interest Rates start at 1%* per day",
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
    headline: "Get up to ₹50,000 with quick approval!",
    description: "Personal loans with Instant Loan Approval and Zero Hidden Charges",
    keyFeature: "Flexible Tenure and Zero Hidden Charges",
    interestRate: "Interest Rates start at 12% to 30% per annum",
  },
  // ASAPFinance: {
  //   headline: "Get up to ₹12,000 with quick approval!",
  //   description: "Personal loans with Fast Approval and No Collateral Needed",
  //   keyFeature: "Hassle-Free Documentation and No Collateral Needed",
  //   interestRate: "Interest Rates start at 0.5% to 1% per day",
  // },
  Apollo: {
    headline: "Get up to ₹50,000 with quick approval!",
    description: "Fully digital personal loan and no paperwork",
    keyFeature: "Quick Approval and up to 6 months tenure",
    interestRate: "Interest Rates start at 5% to 8% per month.",
  },
  Cash2You: {
    headline: "Get Personal Loans from ₹1,000 to ₹40,000",
    description: "Flexible repayment options with tenure up to 60 months",
    keyFeature: "Long Tenure and Flexible EMI Options",
    interestRate: "Interest Rates 36-39% per annum",
  },
  RocketCash: {
    headline: "Get Personal Loans from ₹500 to ₹20,000",
    description: "Quick short-term loans with fast disbursement",
    keyFeature: "Instant Approval and Quick Disbursement",
    interestRate: "Interest Rates 36-39% per annum",
  },
  // MMB: {
  //   headline: "Get Personal Loans from ₹5,000 to ₹30,000",
  //   description: "Bank-level security with 256-bit encryption with tenure up to 45 days",
  //   keyFeature: "No Hidden Fees and Flexible EMI Options",
  //   interestRate: "Interest Rates start at 1.5%* per month",
  // },
  DhanPocket: {
    headline: "Get up to ₹1,00,000 with quick approval!",
    description: "Personal loans with fast disbursement and No Foreclosure charges",
    keyFeature: "Quick Approval and No Foreclosure charges",
    interestRate: "Interest Rates start at 12.49%* per annum",
  },
  // TurantPaisa: {
  //   headline: "Get up to ₹40,000 with quick approval!",
  //   description: "Personal loans with fast disbursement and No hidden charges",
  //   keyFeature: "Quick Approval up to 45 days tenure",
  //   interestRate: "Interest Rates start at 1.00%* per day",
  // },
  QuickMoney: {
    headline: "Get up to ₹25,000 with quick approval!",
    description: "Personal loans with fast disbursement and Paperless Process",
    keyFeature: "Quick Approval and Secure & Trusted",
    interestRate: "Interest Rates start at 3.5%* per month",
  },
  Kamakshimoney: {
    headline: "Get up to ₹30,000 with quick approval!",
    description: "Easy short-term loans with fast disbursement and tenure 7 to 36 days",
    keyFeature: "Quick Approval and Disbursement",
    interestRate: "Interest Rates start at 1% per day",
  },
};

// Dashboard priority order - lenders are displayed in this order when available
// Lower index = higher priority (shown first)
export const DASHBOARD_PRIORITY_ORDER: string[] = [
  "Kamakshimoney",
  "QuickMoney",
  "RupiNow",
  "CashMySalary",
  // "Vivifi",
  "SmartCoin",
  "RapidMoney",
  "DhanPocket",
  // "TurantPaisa",
    "TrueFund",
  "KreditBee",
  "MoneyDot",
  "LoanWalle",
  "Apollo",
  // "MMB",
  "Cash2You",
  "RocketCash",
  "TrueBalance",


];

// Short feature tags for each lender (displayed in offer cards)
export const LENDER_FEATURE_TAGS: Record<string, string> = {
  KreditBee: "High approval chances",
  TrueBalance: "Quick approval",
  RapidMoney: "Quick approval",
  // RamFinCorp: "Instant Approval and Same Day Disbursement",
  SmartCoin: "Quick approval",
  // Vivifi: "Flexible loan options",
  // SpeedoLoan: "Quick approval",
  CashMySalary: "Quick approval",
  LoanWalle: "Only for EPFO registered users",
  LoanWalleSalaried: "Only for EPFO registered users",
  LoanWalleSelfEmployed: "Only for EPFO registered users",
  TrueFund: "Quick approval",
  MoneyDot: "no collateral",
  RupiNow: "zero hidden charges",
  // ASAPFinance: "Fast approval",
  Apollo: "Fully digital loan and no paperwork",
  Cash2You: "Long tenure up to 60 months",
  RocketCash: "Quick short-term loans",
  // MMB: "Bank-level security",
  DhanPocket: "No Foreclosure charges",
  TurantPaisa: "No hidden charges",
  QuickMoney: "Quick approval",
  Kamakshimoney: "Quick approval",
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
  // RamFinCorp: [
  //   { title: "Instant Approval", description: "Same day processing" },
  //   { title: "Same Day Disbursement", description: "Same day transfer" },
  //   { title: "No Prepayment Charges", description: "No hiddenpayment charges" },
  // ],
  SmartCoin: [
    { title: "Quick Approval", description: "Fast processing" },
    { title: "Up to ₹5 Lakh", description: "High loan amount" },
    { title: "Flexible Repayment", description: "Easy repayment options" },
  ],
  LoanWalle: [
    { title: "Quick Approval", description: "Fast processing" },
    { title: "Flexible Repayment", description: "Easy repayment options" },
    { title: "Flexible Tenure", description: "No Prepayment Charges" },
  ],
  LoanWalleSalaried: [
    { title: "Quick Approval", description: "Fast processing" },
    { title: "Flexible Repayment", description: "Easy repayment options" },
    { title: "Flexible Tenure", description: "No Prepayment Charges" },
  ],
  LoanWalleSelfEmployed: [
    { title: "Quick Approval", description: "Fast processing" },
    { title: "Flexible Repayment", description: "Easy repayment options" },
    { title: "Flexible Tenure", description: "No Prepayment Charges" },
  ],
  // ASAPFinance: [
  //   { title: "Quick Approval", description: "Fast processing" },
  //   { title: "No Collateral", description: "No collateral required" },
  //   { title: "Hassle-Free Documentation", description: "No documentation required" },
  // ],
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
  Apollo: [
    { title: "Quick Approval", description: "Fast processing" },
    { title: "No Hidden Charges", description: "Secure and Trusted" },
    { title: "Up to ₹50,000", description: "High loan amount" },
  ],
  RupiNow: [
    { title: "Quick Approval", description: "Fast processing" },
    { title: "Zero Hidden Charges", description: "Transparent fees" },
    { title: "Up to ₹50,000", description: "High loan amount" },
  ],
  Cash2You: [
    { title: "Long Tenure", description: "Up to 60 months" },
    { title: "Flexible EMI", description: "Easy repayment options" },
    { title: "Up to ₹40,000", description: "Personal loan amount" },
  ],
  RocketCash: [
    { title: "Quick Approval", description: "Fast processing" },
    { title: "Short-term Loans", description: "Up to 21 days" },
    { title: "Up to ₹20,000", description: "Instant cash" },
  ],
  // MMB: [
  //   { title: "Bank-level security", description: "Secure and Trusted" },
  //   { title: "Up to 45 days", description: "Personal loan amount" },
  //   { title: "Flexible EMI Options", description: "No hidden fees" },
  // ],
  DhanPocket: [
    { title: "No Foreclosure charges", description: "No hidden fees" },
    { title: "100% DIGITAL Online application", description: "Personal loan amount" },
    { title: "Flexible EMI Options", description: "BANK-LEVEL Security encryption" },
  ],
  TurantPaisa: [
    { title: "No hidden charges", description: "No hidden fees" },
    { title: "Up to 40,000", description: "Personal loan amount" },
    { title: "Flexible EMI Options", description: "100% secure & encrypted" },
  ],
  QuickMoney: [
    { title: "Quick Approval", description: "Fast processing" },
    { title: "Paperless Process", description: "No hidden fees" },
    { title: "Up to 25,000", description: "Personal loan amount" },
  ],
  Kamakshimoney: [
    { title: "Quick Approval", description: "Fast processing" },
    { title: "Disbursement", description: "Same day transfer" },
    { title: "Up to 30,000", description: "Personal loan amount" },
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
  // Vivifi: ["0% Foreclose Charge", "Highest Approval", "Quick Disbursal"],
  LoanWalle: ["EPFO Users Only", "No Prepayment Fee", "Quick Approval"],
  LoanWalleSalaried: ["EPFO Users Only", "No Prepayment Fee", "Quick Approval"],
  LoanWalleSelfEmployed: ["EPFO Users Only", "No Prepayment Fee", "Quick Approval"],
  KreditBee: ["Upto 100% off on PF", "Loans up to ₹10 Lakh", "Instant Disbursal"],
  TrueBalance: ["Loans up to ₹2 Lakh", "Minimal Docs", "Quick Approval"],
  // RamFinCorp: ["Instant Approval", "Same Day Disbursement", "No Prepayment Charges"],
  SmartCoin: ["Quick Approval", "Instant Disbursement", "Up to ₹5 Lakh"],
  MoneyDot: ["Loans up to ₹1 Lakh", "Zero Paperwork", "No Collateral"],
  // SpeedoLoan: ["Quick Approval", "No Hidden Charges", "Up to ₹50,000"],
  CashMySalary: ["Quick Approval", "No Hidden Charges", "Up to ₹50,000"],
  TrueFund: ["Quick Approval", "Up to ₹10 Lakh", "Flexible Repayment"],
  RupiNow: ["Zero Hidden Charges", "Flexible Tenure", "Up to ₹50,000"],
  // ASAPFinance: ["Fast Approval", "No Collateral", "Hassle-Free Docs"],
  Apollo: ["Fully Digital Loan", "Quick Approval", "Up to 6 months tenure"],
  Cash2You: ["Up to 60 Months Tenure", "Flexible EMI", "Up to ₹40,000"],
  RocketCash: ["Quick Approval", "Up to 21 Days", "Up to ₹20,000"],
  // MMB: ["Bank-level security", "Up to 45 days", "No Hidden Fees"],
  DhanPocket: ["No Foreclosure Charges", "100% Digital", "Up to ₹1 Lakh"],
  TurantPaisa: ["No Hidden Charges", "Up to 45 Days", "Up to ₹40,000"],
  QuickMoney: ["Quick Approval", "Paperless Process", "Up to 25,000"],
  Kamakshimoney: ["Quick Approval", "Disbursement", "Up to 30,000"],
};

// Default feature badges if lender not found
export const DEFAULT_FEATURE_BADGES: [string, string, string] = ["Instant Approval", "0% Foreclose Charge", "Quick Disbursal"];

// Max loan amount each lender supports (used for filtering/priority sorting)
export const LENDER_MAX_AMOUNT: Record<string, number> = {
  KreditBee: 1000000,       // ₹10 Lakhs
  TrueBalance: 200000,      // ₹2 Lakhs
  RapidMoney: 15000,        // ₹15,000
  // RamFinCorp: 200000,       // ₹2 Lakhs
  SmartCoin: 500000,        // ₹5 Lakhs
  // Vivifi: 500000,           // ₹5 Lakhs
  // SpeedoLoan: 50000,      // ₹50,000
  CashMySalary: 50000,    // ₹50,000
  LoanWalle: 100000,      // ₹1 Lakh
  LoanWalleSalaried: 100000,      // ₹1 Lakh
  LoanWalleSelfEmployed: 100000,      // ₹1 Lakh
  TrueFund: 50000,      // ₹50,000
  MoneyDot: 100000,      // ₹1 Lakhs
  RupiNow: 50000,      // ₹50,000
  // ASAPFinance: 12000,      // ₹12,000
  Apollo: 50000,      // 50,000
  Cash2You: 40000,      // ₹40,000
  RocketCash: 20000,      // ₹20,000
  // MMB: 30000,      // ₹30,000
  DhanPocket: 100000,      // ₹100,000
  TurantPaisa: 40000,      // ₹40,000
  QuickMoney: 25000,      // ₹25,000
  Kamakshimoney: 30000,      // ₹30,000
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

export const LOADING_DELAY_MS = 1000;
