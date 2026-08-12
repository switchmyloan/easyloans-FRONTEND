/// <reference path="../types/clevertap.d.ts" />

// Get UTM params from sessionStorage
function getOrCaptureUtm(): { utm_source?: string } {
  if (typeof window === "undefined") return {};
  const utm_source = sessionStorage.getItem("utm_source");
  return { utm_source: utm_source || undefined };
}

// CleverTap owns this site's single browser web-push scope; the file is kept
// at this legacy name (rather than clevertap_sw.js) so the scope doesn't
// change for browsers that already subscribed under it.
const WEB_PUSH_SERVICE_WORKER = "/firebase-messaging-sw.js";

/**
 * A browser PushManager scope can hold only one subscription at a time, keyed
 * to a single applicationServerKey (VAPID key). Once CleverTap has subscribed
 * on this scope, re-calling notifications.push() would throw
 * "InvalidStateError: ... a different applicationServerKey ... already
 * exists" — check first and skip if we already hold the scope.
 */
async function hasActiveWebPushSubscription(): Promise<boolean> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return false;

  try {
    const registration = await navigator.serviceWorker.getRegistration(WEB_PUSH_SERVICE_WORKER);
    const subscription = await registration?.pushManager.getSubscription();
    return Boolean(subscription);
  } catch {
    return false;
  }
}

export interface CleverTapLoginProfile {
  Name?: string;
  Identity: string | number;
  Email?: string;
  Phone?: string;
  Gender?: "M" | "F";
  DOB?: Date;
  "MSG-email"?: boolean;
  "MSG-push"?: boolean;
  "MSG-sms"?: boolean;
  "MSG-whatsapp"?: boolean;
  "category-resubscribe"?: Record<string, string[]>;
  "category-unsubscribe"?: Record<string, string[]>;
  [key: string]: string | number | boolean | Date | Record<string, string[]> | undefined;
}

export type CleverTapProfileFields = Record<
  string,
  string | number | boolean | Date | undefined
>;

function getCleverTap() {
  if (typeof window === "undefined") return null;
  return window.clevertap ?? null;
}


export function cleverTapOnUserLogin(site: CleverTapLoginProfile): void {
  const clevertap = getCleverTap();
  console.log("[CleverTap] onUserLogin:", site, clevertap ? "" : "(SDK not ready)");
  if (!clevertap) return;
  clevertap.onUserLogin.push({ Site: site });
}

const LOGIN_PROFILE_STORAGE_KEY = "CleverTapLoginProfile";

// Persist the last login profile so it can be inspected/restored across the
// journey. Save is independent of whether the CleverTap SDK is loaded, so it
// works even before a.js finishes booting.
export function saveCleverTapLoginProfile(profile: CleverTapLoginProfile): void {
  if (typeof window === "undefined") return;
  console.log("CleverTapLoginProfile:", profile);
  localStorage.setItem(LOGIN_PROFILE_STORAGE_KEY, JSON.stringify(profile));
}

export function cleverTapUpdateProfile(site: CleverTapProfileFields): void {
  const clevertap = getCleverTap();
  console.log("[CleverTap] updateProfile:", site, clevertap ? "" : "(SDK not ready)");
  if (!clevertap) return;
  clevertap.profile.push({ Site: site });
}

// Prompts the visitor to subscribe to CleverTap's Chrome Web Push channel,
// signed with the VAPID key pair configured in the CleverTap dashboard.
// titleText/bodyText/okButtonText/rejectButtonText are required by the SDK
// (it throws "Missing input parameters" and shows nothing if omitted) even
// when the dashboard's Card Popup template is what actually renders — these
// values are only used as a fallback and are overridden by the dashboard
// design (Settings > Channels > Web push > Card Popup).
export async function cleverTapInitWebPush(): Promise<void> {
  const clevertap = getCleverTap();
  console.log("[CleverTap] initWebPush", clevertap ? "" : "(SDK not ready)");
  if (!clevertap) return;

  // A push scope holds a single PushManager subscription. Once CleverTap has
  // subscribed on this scope, skip re-prompting — this call is idempotent.
  if (await hasActiveWebPushSubscription()) {
    console.log("[CleverTap] initWebPush skipped — push scope already subscribed");
    return;
  }

  clevertap.notifications.push({
    titleText: "Turn On Notifications?",
    bodyText: "We will only send you relevant and useful updates.",
    okButtonText: "Allow",
    rejectButtonText: "I'll do it later",
    serviceWorkerPath: WEB_PUSH_SERVICE_WORKER,
  });
}

interface StoredUserFormData {
  firstName?: string;
  lastName?: string;
  mobileNumber?: string;
  email?: string;
  gender?: string; // "MALE" | "FEMALE" | "OTHER"
  pincode?: string;
  jobType?: string;
  dateOfBirth?: string;
  monthlySalary?: string;
  loanAmount?: string;
  loanPurpose?: string;
  panNumber?: string;
}

const SESSION_GENDER_TO_CLEVERTAP: Record<string, "M" | "F" | undefined> = {
  MALE: "M",
  FEMALE: "F",
};

const LEAD_RECEIPT_DATE_STORAGE_KEY = "leadReceiptDates";

// Returns the first-ever visit date for this phone number, persisted in
// localStorage (unlike sessionStorage, this survives across sessions) so a
// returning user's lead_reciept_date is never overwritten on repeat visits.
function getLeadReceiptDate(phone: string): Date {
  let dates: Record<string, string> = {};
  try {
    const raw = localStorage.getItem(LEAD_RECEIPT_DATE_STORAGE_KEY);
    if (raw) dates = JSON.parse(raw);
  } catch {}

  if (!dates[phone]) {
    dates[phone] = new Date().toISOString();
    try {
      localStorage.setItem(LEAD_RECEIPT_DATE_STORAGE_KEY, JSON.stringify(dates));
    } catch {}
  }

  return new Date(dates[phone]);
}

export function syncCleverTapFromSession(): void {
  if (typeof window === "undefined") return;

  const phone = sessionStorage.getItem("userPhone");
  if (!phone) return;

  const firstName = sessionStorage.getItem("userFirstName") ?? undefined;
  const raw = sessionStorage.getItem("userFormData");
  const formData: StoredUserFormData = raw ? JSON.parse(raw) : {};

  const utm = getOrCaptureUtm();
  const leadReceiptDate = getLeadReceiptDate(phone);

  const loginProfile: CleverTapLoginProfile = {
    Name: [firstName, formData.lastName].filter(Boolean).join(" ") || firstName,
    Identity: phone,
    Phone: `+91${phone}`,
    Email: formData.email || undefined,
    "MSG-push": true,
    "MSG-sms": true,
    "MSG-whatsapp": true,
    "MSG-email": !!formData.email,
    Gender: formData.gender ? SESSION_GENDER_TO_CLEVERTAP[formData.gender] : undefined,
    DOB: formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined,
    Pincode: formData.pincode,
    Job_Type: formData.jobType,
    Income: formData.monthlySalary ? Number(formData.monthlySalary) : undefined,
    id_mrn: sessionStorage.getItem("userMrn") ?? undefined,
    "Customer Type": formData.jobType,
    "Monthly Income": formData.monthlySalary ? Number(formData.monthlySalary) : undefined,
    "Loan Amount Requested": formData.loanAmount ? Number(formData.loanAmount) : undefined,
    "Loan Purpose": formData.loanPurpose,
    PAN: formData.panNumber,
    Source: utm.utm_source,
    utm_source: utm.utm_source,
    lead_reciept_date: leadReceiptDate,
  };

  saveCleverTapLoginProfile(loginProfile);

  cleverTapOnUserLogin(loginProfile);

  cleverTapInitWebPush();

  cleverTapUpdateProfile({
    // First_Name: firstName ?? formData.firstName,
    // Last_Name: formData.lastName,
    Name: [firstName, formData.lastName].filter(Boolean).join(" ") || firstName,
    Email: formData.email || undefined,
    Phone: `+91${phone}`,
    Gender: formData.gender ? SESSION_GENDER_TO_CLEVERTAP[formData.gender] : undefined,
    DOB: formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined,
    // Gender/Email/Phone above are CleverTap-reserved keys, so the dashboard
    // shows them in the profile header rather than the "User properties"
    // panel. Duplicate them under custom keys so they also appear there.
    Pincode: formData.pincode,
    Job_Type: formData.jobType,
    Income: formData.monthlySalary ? Number(formData.monthlySalary) : undefined,
    id_mrn: sessionStorage.getItem("userMrn") ?? undefined,
    "Customer Type": formData.jobType,
    "Monthly Income": formData.monthlySalary ? Number(formData.monthlySalary) : undefined,
    "Loan Amount Requested": formData.loanAmount ? Number(formData.loanAmount) : undefined,
    "Loan Purpose": formData.loanPurpose,
    PAN: formData.panNumber,
    Source: utm.utm_source,
    utm_source: utm.utm_source,
    lead_reciept_date: leadReceiptDate,
  });
}

// Ends the CleverTap web session for the current identity (device stays
// registered, but the SDK stops attributing events to the logged-out user
// until the next onUserLogin.push). Does not touch localStorage — the saved
// CleverTapLoginProfile and WZRK device keys are left as-is.
export function cleverTapLogout(): void {
  const clevertap = getCleverTap();
  console.log("[CleverTap] logout", clevertap ? "" : "(SDK not ready)");
  if (!clevertap?.logout) return;
  clevertap.logout();
}

export function cleverTapTrackEvent(
  name: string,
  data?: Record<string, string | number | boolean | Date>
): void {
  const clevertap = getCleverTap();
  console.log("[CleverTap] event:", name, data ?? "", clevertap ? "" : "(SDK not ready)");
  if (!clevertap) return;
  if (data) {
    clevertap.event.push(name, data);
  } else {
    clevertap.event.push(name);
  }
}

export const CLEVERTAP_EVENTS = {
  /** Every visitor, fired when the landing page mounts. */
  LANDED: "Page Viewed",
  /** Fired on page-exit when the visitor left without verifying their OTP. */
  LANDED_NO_OTP: "Landed - OTP Not Verified",
  /** Fired once the OTP is successfully verified. */
  OTP_VERIFIED: "OTP Verified",
  /** Fired when the existing-user check finds a prior application and redirects to the dashboard. */
  EXISTING_USER_IDENTIFIED: "Existing User Identified",
  /** Fired when the applicant completes the journey (Stage 2 submit). */
  FORM_SUBMITTED: "Form Submitted",
  /** Fired when a lender offer card is clicked, tagged with the lender. */
  LENDER_CLICKED: "Lender Clicked",
  /** Fired when the visitor changes the site language, tagged with the chosen language. */
  LANGUAGE_SELECTED: "Language Selected",
} as const;
