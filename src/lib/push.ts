// Device-token registration with the push-notification backend.
//
// After the browser grants permission and Firebase issues an FCM token, we POST
// it to the backend's public `/notifications/register` endpoint so the admin
// panel can target this device. Segmentation tags are optional and can be
// enriched on later calls (the backend only overwrites fields that are sent).

const NOTIFICATION_API_BASE_URL =
  process.env.NEXT_PUBLIC_NOTIFICATION_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:8000/api";

// Identifies this app's audience in the backend so the admin panel can target
// STPL devices specifically (the "STPL Push" section).
const PUSH_SOURCE = "STPL";

export interface RegisterTokenExtras {
  mobileNumber?: string;
  loanAmount?: number | string;
  gender?: string;
  pincode?: string;
  age?: number | string;
  jobType?: string;
  monthlySalary?: number | string;
  loanPurpose?: string;
  selectedLenders?: string | string[];
  otpVerified?: boolean;
  formSubmitted?: boolean;
  lenderClicked?: boolean;
}

/**
 * Register (or refresh) this browser's FCM token with the backend. Fire-and-
 * forget: failures are logged but never bubble up to the UI.
 */
export async function registerDeviceToken(
  token: string,
  extras: RegisterTokenExtras = {},
): Promise<void> {
  if (!token) return;
  try {
    const res = await fetch(
      `${NOTIFICATION_API_BASE_URL}/notifications/register`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          platform: "web",
          source: PUSH_SOURCE,
          ...extras,
        }),
      },
    );
    if (!res.ok) {
      console.warn("[FCM] token registration HTTP", res.status);
      return;
    }
    console.log("[FCM] token registered with backend");
  } catch (err) {
    console.warn("[FCM] token registration failed:", err);
  }
}

/** Drop this token from the backend (permission revoked / sign out). */
export async function unregisterDeviceToken(token: string): Promise<void> {
  if (!token) return;
  try {
    await fetch(`${NOTIFICATION_API_BASE_URL}/notifications/unregister`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
  } catch (err) {
    console.warn("[FCM] token unregistration failed:", err);
  }
}
