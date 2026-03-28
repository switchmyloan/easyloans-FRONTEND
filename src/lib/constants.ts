export const PROFILE_OPTIONS = [
  "Salaried",
  "Self Employed",
  "Business Owner",
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

export const LOADING_DELAY_MS = 3000;
