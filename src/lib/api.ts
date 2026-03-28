const BASE_URL = "https://apply.switchmyloan.in/api";

const PARTNER_HEADERS = {
  "x-partner-shortname": "MoneyTap",
  "x-partner-secret": "MoneyTap@123",
  "x-partner-id": "CHN018",
  "Content-Type": "application/json",
};

// ---------- Lead response types ----------

export interface LeadRecord {
  phone: string;
  name: string;
  pan: string | null;
  dob: string | null;
  email: string | null;
  pincode: string | null;
  gender: string | null;
  profession: string | null;
  income: string | null;
  first_name: string | null;
  last_name: string | null;
  [key: string]: unknown;
}

export interface LeadsResponse {
  statusCode: number;
  data: {
    found: boolean;
    count: number;
    leads: LeadRecord[];
  };
  message: string;
  success: boolean;
}

// ---------- Stage 1: Lead Generation ----------

const SESSION_KEY = "leadResponse";

export async function submitLead(data: {
  name: string;
  phone: string;
}): Promise<LeadsResponse> {
  const res = await fetch(`${BASE_URL}/leadsGeneration`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone: data.phone, name: data.name }),
  });

  if (!res.ok) throw new Error("Lead generation failed. Please try again.");

  const json: LeadsResponse = await res.json();

  if (json.statusCode !== 200 || !json.success) {
    throw new Error(json.message || "Lead generation failed. Please try again.");
  }

  // Store full response in sessionStorage
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(json));

  return json;
}

export function getStoredLead(): LeadsResponse | null {
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

// ---------- Map lead to Stage 2 form defaults ----------

const REVERSE_JOB_MAP: Record<string, string> = {
  SALARIED: "Salaried",
  SELF_EMPLOYED: "Self Employed",
  BUSINESS_OWNER: "Business Owner",
  FREELANCER: "Freelancer",
  STUDENT: "Student",
  OTHER: "Other",
};

const REVERSE_GENDER_MAP: Record<string, string> = {
  MALE: "Male",
  FEMALE: "Female",
  OTHER: "Other",
};

export interface PrefilledStage2 {
  first_name?: string;
  last_name?: string;
  email?: string;
  gender?: string;
  pincode?: string;
  pan_no?: string;
  dob?: string; // YYYY-MM-DD string for date input
  profile?: string;
  monthly_income?: number;
}

export function mapLeadToFormDefaults(lead: LeadRecord): PrefilledStage2 {
  const defaults: PrefilledStage2 = {};

  if (lead.first_name) defaults.first_name = lead.first_name;
  if (lead.last_name) defaults.last_name = lead.last_name;
  if (lead.email) defaults.email = lead.email;
  if (lead.gender)
    defaults.gender = REVERSE_GENDER_MAP[lead.gender] || lead.gender;
  if (lead.pincode) defaults.pincode = lead.pincode;
  if (lead.pan) defaults.pan_no = lead.pan;
  if (lead.dob) defaults.dob = new Date(lead.dob).toISOString().split("T")[0];
  if (lead.profession)
    defaults.profile = REVERSE_JOB_MAP[lead.profession] || lead.profession;
  if (lead.income) defaults.monthly_income = Math.round(parseFloat(lead.income));

  return defaults;
}

// ---------- Stage 2: Get offers ----------

const JOB_TYPE_MAP: Record<string, string> = {
  Salaried: "SALARIED",
  "Self Employed": "SELF_EMPLOYED",
  "Business Owner": "BUSINESS_OWNER",
  Freelancer: "FREELANCER",
  Student: "STUDENT",
  Other: "OTHER",
};

const GENDER_MAP: Record<string, string> = {
  Male: "MALE",
  Female: "FEMALE",
  Other: "OTHER",
};

function formatDOB(dob: Date | string): string {
  const d = typeof dob === "string" ? new Date(dob) : dob;
  return d.toISOString().split("T")[0];
}

export interface GetOffersPayload {
  name: string;
  first_name: string;
  last_name: string;
  mobile: string;
  email: string;
  gender: string;
  pincode: string;
  pan_no: string;
  dob: Date | string;
  profile: string;
  monthly_income: number;
}

// ---------- Offers API response types ----------

export interface StaticLender {
  name: string;
  utm_link: string;
}

export interface LenderResponse {
  success: boolean;
  message: string;
  data: unknown;
  statusCode: number;
  utm_link?: string;
}

export interface OffersApiResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    MoneyView: LenderResponse;
    KreditBee: LenderResponse;
    staticLenders: StaticLender[];
  };
}

const OFFERS_SESSION_KEY = "offersResponse";

export async function getOffers(
  payload: GetOffersPayload
): Promise<OffersApiResponse> {
  const body = {
    name: payload.name,
    firstName: payload.first_name,
    lastName: payload.last_name,
    email: payload.email,
    dateOfBirth: formatDOB(payload.dob),
    gender: GENDER_MAP[payload.gender] || payload.gender,
    jobType: JOB_TYPE_MAP[payload.profile] || payload.profile,
    loanAmount: "",
    mobileNumber: payload.mobile,
    monthlySalary: Number(payload.monthly_income),
    onboardingStep: "",
    panNumber: payload.pan_no,
    pincode: payload.pincode,
  };

  const res = await fetch(`${BASE_URL}/onSubmit/get-offer-kb-mv`, {
    method: "POST",
    headers: PARTNER_HEADERS,
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error("Failed to fetch offers. Please try again.");

  const json: OffersApiResponse = await res.json();

  if (json.statusCode !== 200 || !json.success) {
    throw new Error(json.message || "Failed to fetch offers. Please try again.");
  }

  sessionStorage.setItem(OFFERS_SESSION_KEY, JSON.stringify(json));
  return json;
}

export function getStoredOffers(): OffersApiResponse | null {
  const raw = sessionStorage.getItem(OFFERS_SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
