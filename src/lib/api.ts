const BASE_URL = "https://apply.switchmyloan.in/api";
// const BASE_URL = "http://localhost:8000/api";

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
    [key: string]: unknown;
  };
  message: string;
  success: boolean;
  [key: string]: unknown;
}

// ---------- Stage 1: Lead Generation ----------

const SESSION_KEY = "leadResponse";
const LEAD_DRAFT_SESSION_KEY = "leadDraftSessionId";
const LEAD_DRAFT_ID_KEY = "leadDraftId";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function setSessionValue(key: string, value: string): void {
  if (!isBrowser()) return;
  sessionStorage.setItem(key, value);
}

function getSessionValue(key: string): string | null {
  if (!isBrowser()) return null;
  return sessionStorage.getItem(key);
}

function createClientSessionId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `lead_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function getOrCreateLeadSessionId(): string {
  const existing = getSessionValue(LEAD_DRAFT_SESSION_KEY);
  if (existing) return existing;

  const sessionId = createClientSessionId();
  setSessionValue(LEAD_DRAFT_SESSION_KEY, sessionId);

  return sessionId;
}

export function getStoredLeadId(): string | null {
  return getSessionValue(LEAD_DRAFT_ID_KEY);
}

function setStoredLeadId(leadId: string): void {
  setSessionValue(LEAD_DRAFT_ID_KEY, leadId);
}

function findLeadId(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;

  const record = value as Record<string, unknown>;
  const candidates = ["leadID", "leadId", "lead_id", "id"];

  for (const key of candidates) {
    const candidate = record[key];
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate;
    }
    if (typeof candidate === "number") {
      return String(candidate);
    }
  }

  for (const nestedValue of Object.values(record)) {
    if (Array.isArray(nestedValue)) {
      for (const item of nestedValue) {
        const nestedLeadId = findLeadId(item);
        if (nestedLeadId) return nestedLeadId;
      }
      continue;
    }

    const nestedLeadId = findLeadId(nestedValue);
    if (nestedLeadId) return nestedLeadId;
  }

  return null;
}

function storeLeadResponse(json: LeadsResponse): void {
  if (!isBrowser()) return;

  sessionStorage.setItem(SESSION_KEY, JSON.stringify(json));

  const leadId = findLeadId(json);
  if (leadId) {
    setStoredLeadId(leadId);
  }
}

export interface DraftLeadPayload {
  fullName?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  consent_tnc?: boolean;
  consent_credit?: boolean;
  consent_communication?: boolean;
  email?: string;
  pan_no?: string;
  dob?: string;
  gender?: string;
  pincode?: string;
  profile?: string;
  monthly_income?: number;
  loan_purpose?: string;
  loan_amount?: number;
}

function buildDraftLeadBody(data: DraftLeadPayload) {
  const sessionId = getOrCreateLeadSessionId();

  return {
    sessionId,
    fullName: data.fullName || null,
    firstName: data.firstName || null,
    lastName: data.lastName || null,
    email: data.email || null,
    panNumber: data.pan_no || null,
    dateOfBirth: data.dob || null,
    gender: data.gender || null,
    pincode: data.pincode || null,
    jobType: data.profile || null,
    monthlySalary:
      typeof data.monthly_income === "number" &&
      !Number.isNaN(data.monthly_income)
        ? data.monthly_income
        : null,
    loanAmount:
      typeof data.loan_amount === "number" && !Number.isNaN(data.loan_amount)
        ? data.loan_amount
        : null,
    loanPurpose: data.loan_purpose || null,
    mobileNumber: data.phone || null,
    consent_tnc: data.consent_tnc ?? false,
    consent_credit: data.consent_credit ?? false,
    consent_communication: data.consent_communication ?? false,
  };
}

export async function submitLead(data: {
  name: string;
  phone: string;
  consent_tnc: boolean;
  consent_credit: boolean;
  consent_communication: boolean;
}): Promise<LeadsResponse> {
  const res = await fetch(`${BASE_URL}/leadsGeneration`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      phone: data.phone,
      name: data.name,
      consent_tnc: data.consent_tnc,
      consent_credit: data.consent_credit,
      consent_communication: data.consent_communication,
    }),
  });

  if (!res.ok) throw new Error("Lead generation failed. Please try again.");

  const json: LeadsResponse = await res.json();

  if (json.statusCode !== 200 || !json.success) {
    throw new Error(json.message || "Lead generation failed. Please try again.");
  }

  storeLeadResponse(json);

  return json;
}


export async function Createlead(
  data: DraftLeadPayload
): Promise<LeadsResponse> {
  const res = await fetch(`${BASE_URL}/onSubmit/applynew-view-draft`, {
    method: "POST",
    headers: PARTNER_HEADERS,
    body: JSON.stringify(buildDraftLeadBody(data)),
  });

  if (!res.ok) throw new Error("Lead generation failed. Please try again.");

  const json: LeadsResponse = await res.json();

  if (![200, 201].includes(json.statusCode)) {
    throw new Error(json.message || "Lead generation failed. Please try again.");
  }

  storeLeadResponse(json);

  return json;
}


export async function onChangeUpdateLead(
  data: DraftLeadPayload
): Promise<LeadsResponse> {
  const leadId = getStoredLeadId();

  if (!leadId) {
    throw new Error("Draft lead id not found for update.");
  }

  const res = await fetch(`${BASE_URL}/onSubmit/applynew-view-draft/${leadId}`, {
    method: "PUT",
    headers: PARTNER_HEADERS,
    body: JSON.stringify(buildDraftLeadBody(data)),
  });

  if (!res.ok) throw new Error("Lead generation failed. Please try again.");

  const json: LeadsResponse = await res.json();

  if (json.statusCode !== 200) {
    throw new Error(json.message || "Lead generation failed. Please try again.");
  }

  storeLeadResponse(json);

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

// ---------- OTP ----------

export interface SendOtpResponse {
  statusCode: number;
  data: { hashedOtp: string; expiresAt: number };
  message: string;
  success: boolean;
}

export async function sendOtp(mobileNumber: string): Promise<SendOtpResponse> {
  const res = await fetch(`${BASE_URL}/onSubmit/send-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ mobileNumber }),
  });

  if (!res.ok) throw new Error("Failed to send OTP. Please try again.");

  const json: SendOtpResponse = await res.json();

  if (json.statusCode !== 200) {
    throw new Error(json.message || "Failed to send OTP.");
  }

  return json;
}

export interface VerifyOtpResponse {
  statusCode: number;
  data: { isVerified: boolean };
  message: string;
  success: boolean;
}

export async function verifyOtp(payload: {
  otp: string;
  hashedOtp: string;
  expiresAt: number;
}): Promise<VerifyOtpResponse> {
  const res = await fetch(`${BASE_URL}/onSubmit/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error("OTP verification failed. Please try again.");

  const json: VerifyOtpResponse = await res.json();

  if (json.statusCode !== 200 || !json.data.isVerified) {
    throw new Error(json.message || "Invalid OTP.");
  }

  return json;
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
  loan_purpose: string;
  loan_amount: number;
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
    SmartCoinHighIntent?: LenderResponse;
    TrueBalance?: LenderResponse;
    Zype_Dedupe?: LenderResponse;
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
    loanAmount: String(payload.loan_amount),
    mobileNumber: payload.mobile,
    monthlySalary: Number(payload.monthly_income),
    onboardingStep: "",
    panNumber: payload.pan_no,
    pincode: payload.pincode,
    loanPurpose: payload.loan_purpose,
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
  sessionStorage.setItem("userPhone", payload.mobile);
  sessionStorage.setItem("userLoanAmount", String(payload.loan_amount));
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

// ---------- Save Lender (on Apply Now click) ----------

export async function saveLender(phoneNumber: string, lenderName: string): Promise<void> {
  try {
    await fetch(`${BASE_URL}/onSubmit/save-lender`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phoneNumber,
        lenders: [{ lenderName }],
      }),
    });
  } catch (err) {
    console.error("Failed to save lender:", err);
  }
}
