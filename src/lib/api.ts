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
  mrn: string | null;
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

  // Store MRN from the first lead if available
  const lead = json.data?.leads?.[0];
  console.log("[MRN] storeLeadResponse — lead.mrn:", lead?.mrn ?? "not present");
  if (lead?.mrn) {
    sessionStorage.setItem("userMrn", lead.mrn);
    console.log("[MRN] Stored in sessionStorage:", lead.mrn);
  }
}

export function getStoredMrn(): string | null {
  return getSessionValue("userMrn");
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
  const loanPurpose =
    typeof data.loan_purpose === "string" && data.loan_purpose.trim()
      ? data.loan_purpose
      : undefined;

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
    ...(loanPurpose ? { loanPurpose } : {}),
    mobileNumber: data.phone || null,
    mrn: getStoredMrn() || null,
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
  const draftBody = buildDraftLeadBody(data);
  console.log("[MRN] POST /applynew-view-draft — mrn:", draftBody.mrn);

  const res = await fetch(`${BASE_URL}/onSubmit/applynew-view-draft`, {
    method: "POST",
    headers: PARTNER_HEADERS,
    body: JSON.stringify(draftBody),
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

  const draftBody = buildDraftLeadBody(data);
  console.log("[MRN] PUT /applynew-view-draft/%s — mrn:", leadId, draftBody.mrn);

  const res = await fetch(`${BASE_URL}/onSubmit/applynew-view-draft/${leadId}`, {
    method: "PUT",
    headers: PARTNER_HEADERS,
    body: JSON.stringify(draftBody),
  });

  if (!res.ok) throw new Error("Lead generation failed. Please try again.");

  const json: LeadsResponse = await res.json();

  if (json.statusCode !== 200) {
    throw new Error(json.message || "Lead generation failed. Please try again.");
  }

  storeLeadResponse(json);

  return json;
}

// ---------- Short ticket draft (cready short form) ----------

const SHORT_LEAD_DRAFT_SESSION_KEY = "shortLeadDraftSessionId";
const SHORT_LEAD_DRAFT_ID_KEY = "shortLeadDraftId";

function getOrCreateShortLeadSessionId(): string {
  const existing = getSessionValue(SHORT_LEAD_DRAFT_SESSION_KEY);
  if (existing) return existing;

  const sessionId = createClientSessionId();
  setSessionValue(SHORT_LEAD_DRAFT_SESSION_KEY, sessionId);
  return sessionId;
}

export function getStoredShortLeadId(): string | null {
  return getSessionValue(SHORT_LEAD_DRAFT_ID_KEY);
}

function setStoredShortLeadId(leadId: string): void {
  setSessionValue(SHORT_LEAD_DRAFT_ID_KEY, leadId);
}

function buildShortDraftLeadBody(data: DraftLeadPayload) {
  const sessionId = getOrCreateShortLeadSessionId();
  const loanPurpose =
    typeof data.loan_purpose === "string" && data.loan_purpose.trim()
      ? data.loan_purpose
      : undefined;

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
    ...(loanPurpose ? { loanPurpose } : {}),
    mobileNumber: data.phone || null,
    mrn: getStoredMrn() || null,
    consent_tnc: data.consent_tnc ?? false,
    consent_credit: data.consent_credit ?? false,
    consent_communication: data.consent_communication ?? false,
  };
}

// Coalesce concurrent creates so a single session produces only one row,
// even if the user types fast and the first POST hasn't returned yet.
let shortDraftCreateInFlight: Promise<string | null> | null = null;

async function createShortDraftOnce(
  data: DraftLeadPayload
): Promise<string | null> {
  const existing = getStoredShortLeadId();
  if (existing) return existing;

  if (shortDraftCreateInFlight) return shortDraftCreateInFlight;

  shortDraftCreateInFlight = (async () => {
    const body = buildShortDraftLeadBody(data);
    const res = await fetch(
      `${BASE_URL}/onSubmit/short-applynew-view-draft`,
      {
        method: "POST",
        headers: PARTNER_HEADERS,
        body: JSON.stringify(body),
      }
    );

    if (!res.ok) return null;
    const json = await res.json();
    const leadId = findLeadId(json);
    if (leadId) setStoredShortLeadId(leadId);
    return leadId;
  })().finally(() => {
    shortDraftCreateInFlight = null;
  });

  return shortDraftCreateInFlight;
}

async function updateShortDraft(
  leadId: string,
  data: DraftLeadPayload
): Promise<void> {
  const body = buildShortDraftLeadBody(data);
  await fetch(`${BASE_URL}/onSubmit/short-applynew-view-draft/${leadId}`, {
    method: "PUT",
    headers: PARTNER_HEADERS,
    body: JSON.stringify(body),
  });
}

// Single entry point for the short-ticket form: creates on first call, updates
// thereafter. Uses sessionStorage so repeat submits in the same session reuse
// the same row.
export async function saveShortDraftLead(
  data: DraftLeadPayload
): Promise<void> {
  try {
    const existingId = getStoredShortLeadId();
    if (existingId) {
      await updateShortDraft(existingId, data);
      return;
    }
    await createShortDraftOnce(data);
  } catch (err) {
    console.warn("saveShortDraftLead failed:", err);
  }
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
  // Optional — sent so the backend can flip `otpVerified` on the matching
  // apply_new_draft_leads row (used by the Lending User Journey report).
  mobileNumber?: string;
  sessionId?: string;
  // sessionId of the short draft (short_apply_new_draft_leads) if applicable.
  shortSessionId?: string;
}): Promise<VerifyOtpResponse> {
  const res = await fetch(`${BASE_URL}/onSubmit/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  // Read body even for non-2xx responses so we surface the API's "Invalid OTP"
  // message instead of a generic one.
  let json: Partial<VerifyOtpResponse> = {};
  try {
    json = await res.json();
  } catch {
    // body wasn't JSON
  }

  console.log("[verifyOtp] HTTP", res.status, "body:", json);

  const isVerified = json?.data?.isVerified === true;
  const ok = res.ok && json?.statusCode === 200 && isVerified;

  if (!ok) {
    throw new Error(json?.message || "Invalid OTP.");
  }

  return json as VerifyOtpResponse;
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
  mrn?: string | null;
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
  isDuplicate?: boolean;
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
    isSalaried: boolean;
    staticLenders: StaticLender[];
  };
}

const OFFERS_SESSION_KEY = "offersResponse";

export async function getOffers(
  payload: GetOffersPayload
): Promise<OffersApiResponse> {
  const isSalaried = payload.profile === "Salaried";

  const mrn = payload.mrn || getStoredMrn();
  console.log("[MRN] POST /get-offer-kb-mv — mrn:", mrn);

  const body = {
    name: payload.name,
    firstName: payload.first_name,
    lastName: payload.last_name,
    email: payload.email,
    dateOfBirth: formatDOB(payload.dob),
    gender: GENDER_MAP[payload.gender] || payload.gender,
    jobType: JOB_TYPE_MAP[payload.profile] || payload.profile,
    isSalaried,
    loanAmount: String(payload.loan_amount),
    mobileNumber: payload.mobile,
    monthlySalary: Number(payload.monthly_income),
    onboardingStep: "",
    panNumber: payload.pan_no,
    pincode: payload.pincode,
    loanPurpose: payload.loan_purpose,
    ...(mrn ? { mrn } : {}),
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

  // Store user data for lender-specific apply APIs (e.g. KreditBee)
  sessionStorage.setItem("userFormData", JSON.stringify({
    firstName: payload.first_name,
    lastName: payload.last_name,
    mobileNumber: payload.mobile,
    email: payload.email,
    panNumber: payload.pan_no,
    dateOfBirth: formatDOB(payload.dob),
    gender: payload.gender,
    pincode: payload.pincode,
    jobType: JOB_TYPE_MAP[payload.profile] || payload.profile,
    monthlySalary: String(payload.monthly_income),
    loanAmount: String(payload.loan_amount),
    loanPurpose: payload.loan_purpose,
  }));

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

// ---------- Apply to KreditBee ----------

export interface KreditBeeApplyResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    KreditBee: {
      success: boolean;
      message: string;
      data: unknown;
      statusCode: number;
    };
  };
}

export async function applyToKreditBee(): Promise<KreditBeeApplyResponse> {
  const raw = sessionStorage.getItem("userFormData");
  if (!raw) throw new Error("User data not found. Please fill the form first.");

  const userData = JSON.parse(raw);

  const res = await fetch(`${BASE_URL}/onSubmit/kreditbee`, {
    method: "POST",
    headers: PARTNER_HEADERS,
    body: JSON.stringify(userData),
  });

  if (!res.ok) throw new Error("Failed to apply to KreditBee. Please try again.");

  const json: KreditBeeApplyResponse = await res.json();
  return json;
}

// ---------- Apply to MoneyView ----------

export interface MoneyViewApplyResponse {
  statusCode: number;
  success: boolean;
  message: string;
  data: {
    MoneyView: {
      success: boolean;
      message: string;
      data: unknown;
      statusCode: number;
    };
  };
}

export async function applyToMoneyView(): Promise<MoneyViewApplyResponse> {
  const raw = sessionStorage.getItem("userFormData");
  if (!raw) throw new Error("User data not found. Please fill the form first.");

  const userData = JSON.parse(raw);

  const body = {
    firstName: userData.firstName,
    lastName: userData.lastName,
    mobileNumber: userData.mobileNumber,
    panNumber: userData.panNumber,
    gender: (userData.gender || "").toLowerCase(),
    dateOfBirth: userData.dateOfBirth,
    jobType: (userData.jobType || "").toLowerCase(),
    monthlySalary: Number(userData.monthlySalary),
    pincode: userData.pincode,
    email: userData.email,
  };

  const res = await fetch(`${BASE_URL}/onSubmit/money-view`, {
    method: "POST",
    headers: PARTNER_HEADERS,
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error("Failed to apply to MoneyView. Please try again.");

  const json: MoneyViewApplyResponse = await res.json();
  return json;
}

// ---------- Short Ticket (WhatsApp / campaign flow) ----------

export interface ShortTicketPayload {
  firstName: string;
  lastName: string;
  mobileNumber: string;
  email: string;
  dateOfBirth: string;
  panNumber: string;
  gender: string;
  pincode: string;
  jobType: string;
  isSalaried: boolean;
  monthlySalary: number;
  loanAmount: number;
  loanPurpose: string;
  mrn?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  utm_term?: string | null;
}

export interface ShortTicketLender {
  name?: string;
  success?: boolean;
  is_offer?: boolean;
  message?: string;
  utm_link?: string;
  data?: unknown;
  statusCode?: number;
  [key: string]: unknown;
}

export interface ShortTicketData {
  isSalaried: boolean;
  priorityOrder: string[];
  staticLenders: StaticLender[];
    CreditPlus?: ShortTicketLender;
  RapidMoney?: ShortTicketLender;
  RamFinCorp?: ShortTicketLender;
  KreditBee?: ShortTicketLender;
  TrueBalance?: ShortTicketLender;
  MPokket?: ShortTicketLender;

  Loan112?: ShortTicketLender;
  [key: string]: unknown;
}

export interface ShortTicketResponse {
  statusCode: number;
  data: ShortTicketData;
  message?: string;
  success?: boolean;
}

const SHORT_TICKET_SESSION_KEY = "shortTicketOffers";

export async function getOfferShortTicket(
  payload: ShortTicketPayload
): Promise<ShortTicketResponse> {
  const mrn = payload.mrn || getStoredMrn();

  const body = {
    firstName: payload.firstName,
    lastName: payload.lastName,
    mobileNumber: payload.mobileNumber,
    email: payload.email,
    dateOfBirth: payload.dateOfBirth,
    panNumber: payload.panNumber,
    gender: payload.gender,
    pincode: payload.pincode,
    jobType: payload.jobType,
    isSalaried: payload.isSalaried,
    monthlySalary: Number(payload.monthlySalary),
    loanAmount: Number(payload.loanAmount),
    loanPurpose: payload.loanPurpose,
    ...(mrn ? { mrn } : {}),
    ...(payload.utm_source ? { utm_source: payload.utm_source } : {}),
    ...(payload.utm_medium ? { utm_medium: payload.utm_medium } : {}),
    ...(payload.utm_campaign ? { utm_campaign: payload.utm_campaign } : {}),
    ...(payload.utm_content ? { utm_content: payload.utm_content } : {}),
    ...(payload.utm_term ? { utm_term: payload.utm_term } : {}),
  };

  console.log("[ShortTicket] POST /get-offer-short-ticket — body:", body);

  const res = await fetch(`${BASE_URL}/onSubmit/get-offer-short-ticket`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error("Failed to fetch offers. Please try again.");

  const json: ShortTicketResponse = await res.json();

  if (json.statusCode !== 200) {
    throw new Error(json.message || "Failed to fetch offers. Please try again.");
  }

  if (isBrowser()) {
    sessionStorage.setItem(SHORT_TICKET_SESSION_KEY, JSON.stringify(json));
    sessionStorage.setItem("userPhone", payload.mobileNumber);
    sessionStorage.setItem("userLoanAmount", String(payload.loanAmount));
    if (mrn) sessionStorage.setItem("userMrn", mrn);

    // Store UTM params separately for easy access
    if (payload.utm_medium) sessionStorage.setItem("utm_medium", payload.utm_medium);
    if (payload.utm_source) sessionStorage.setItem("utm_source", payload.utm_source);

    // Also store user form data for subsequent API calls, like the main flow does
    sessionStorage.setItem("userFormData", JSON.stringify(payload));
  }

  return json;
}

export function getStoredShortTicketOffers(): ShortTicketResponse | null {
  if (!isBrowser()) return null;
  const raw = sessionStorage.getItem(SHORT_TICKET_SESSION_KEY);
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
    const mrn = getStoredMrn();
    console.log("[MRN] POST /save-lender — mrn:", mrn);
    await fetch(`${BASE_URL}/onSubmit/save-lender`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phoneNumber,
        lenders: [{ lenderName }],
        ...(mrn ? { mrn } : {}),
      }),
    });
  } catch (err) {
    console.error("Failed to save lender:", err);
  }
}

// ---------- Track Shown Offers (short-ticket) ----------
//
// Captures the lenders actually rendered on the short-ticket /offers page
// (after client-side filtering). Updates the latest shortOfferLeads row
// for this phone with a `shown_offers` JSON payload. Fire-and-forget —
// never blocks the UI.

export interface ShownOfferEntry {
  lenderName: string;
  section: "promoted" | "static";
  utmLink?: string | null;
  wasApproved?: boolean | null;
}

export async function trackShortShownOffers(
  phoneNumber: string,
  shownOffers: ShownOfferEntry[]
): Promise<void> {
  try {
    if (!phoneNumber || !shownOffers.length) return;
    const mrn = getStoredMrn();
    await fetch(`${BASE_URL}/onSubmit/short-track-shown-offers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone: phoneNumber,
        ...(mrn ? { mrn } : {}),
        shown_offers: shownOffers,
      }),
    });
  } catch (err) {
    console.error("Failed to track short shown offers:", err);
  }
}

// ---------- Short variants: save lender / KreditBee / MoneyView ----------

export async function saveShortLender(
  phoneNumber: string,
  lenderName: string
): Promise<void> {
  try {
    const mrn = getStoredMrn();
    await fetch(`${BASE_URL}/onSubmit/short-save-lender`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phoneNumber,
        lenders: [{ lenderName }],
        ...(mrn ? { mrn } : {}),
      }),
    });
  } catch (err) {
    console.error("Failed to save short lender:", err);
  }
}

export async function applyToShortKreditBee(): Promise<KreditBeeApplyResponse> {
  const raw = sessionStorage.getItem("userFormData");
  if (!raw) throw new Error("User data not found. Please fill the form first.");

  const userData = JSON.parse(raw);

  const res = await fetch(`${BASE_URL}/onSubmit/short-kreditbee`, {
    method: "POST",
    headers: PARTNER_HEADERS,
    body: JSON.stringify(userData),
  });

  if (!res.ok) throw new Error("Failed to apply to KreditBee. Please try again.");

  const json: KreditBeeApplyResponse = await res.json();
  return json;
}

export async function applyToShortMoneyView(): Promise<MoneyViewApplyResponse> {
  const raw = sessionStorage.getItem("userFormData");
  if (!raw) throw new Error("User data not found. Please fill the form first.");

  const userData = JSON.parse(raw);

  const body = {
    firstName: userData.firstName,
    lastName: userData.lastName,
    mobileNumber: userData.mobileNumber,
    panNumber: userData.panNumber,
    gender: (userData.gender || "").toLowerCase(),
    dateOfBirth: userData.dateOfBirth,
    jobType: (userData.jobType || "").toLowerCase(),
    monthlySalary: Number(userData.monthlySalary),
    pincode: userData.pincode,
    email: userData.email,
  };

  const res = await fetch(`${BASE_URL}/onSubmit/short-money-view`, {
    method: "POST",
    headers: PARTNER_HEADERS,
    body: JSON.stringify(body),
  });

  if (!res.ok) throw new Error("Failed to apply to MoneyView. Please try again.");

  const json: MoneyViewApplyResponse = await res.json();
  return json;
}