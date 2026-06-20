import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  isSupported as isMessagingSupported,
  type Messaging,
  type MessagePayload,
} from "firebase/messaging";
import {
  getAnalytics,
  isSupported as isAnalyticsSupported,
  type Analytics,
} from "firebase/analytics";

// Your web app's Firebase configuration, sourced from NEXT_PUBLIC_* env vars
// (see .env.local). These values are safe to expose on the client — they
// identify the project, they do not grant privileged access.
export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Web Push certificate key pair (VAPID). Generate it in the Firebase console:
// Project settings → Cloud Messaging → Web configuration → "Web Push certificates".
export const VAPID_KEY = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ?? "";

// Reuse the existing app instance during HMR / repeated imports.
export const firebaseApp: FirebaseApp = getApps().length
  ? getApp()
  : initializeApp(firebaseConfig);

/** Returns the Messaging instance, or null when the browser can't support it. */
export async function getMessagingInstance(): Promise<Messaging | null> {
  if (typeof window === "undefined") return null;
  if (!(await isMessagingSupported())) return null;
  return getMessaging(firebaseApp);
}

/** Returns the Analytics instance, or null when unsupported (e.g. SSR). */
export async function getAnalyticsInstance(): Promise<Analytics | null> {
  if (typeof window === "undefined") return null;
  if (!(await isAnalyticsSupported())) return null;
  return getAnalytics(firebaseApp);
}

/**
 * Requests notification permission, registers the FCM service worker and
 * returns the device registration token. Returns null if permission is denied
 * or messaging is unsupported.
 */
export async function requestFcmToken(): Promise<string | null> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    console.warn("[firebase] Notifications unsupported in this environment.");
    return null;
  }

  if (!VAPID_KEY) {
    console.warn(
      "[firebase] Missing NEXT_PUBLIC_FIREBASE_VAPID_KEY — cannot request FCM token.",
    );
    return null;
  }

  // IMPORTANT: request permission FIRST — synchronously inside the user gesture,
  // before any other `await`. The browser consumes the user-activation on the
  // first await, after which it silently suppresses the permission popup
  // (Chrome's "quieter" UI) — that's the "no popup appears" symptom. So we must
  // not await getMessagingInstance() (a feature-support check) before this call.
  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    console.warn(
      `[firebase] Notification permission not granted (state: "${permission}").`,
    );
    return null;
  }

  const messaging = await getMessagingInstance();
  if (!messaging) {
    console.warn("[firebase] Firebase Messaging unsupported in this browser.");
    return null;
  }

  try {
    const serviceWorkerRegistration = await navigator.serviceWorker.register(
      "/firebase-messaging-sw.js",
    );

    // register() resolves before the worker is *active*. Calling getToken() too
    // early throws "no active Service Worker" (PushManager.subscribe AbortError),
    // so wait until the worker is activated before requesting the token.
    await navigator.serviceWorker.ready;
    if (!serviceWorkerRegistration.active) {
      await new Promise<void>((resolve) => {
        const worker =
          serviceWorkerRegistration.installing ||
          serviceWorkerRegistration.waiting;
        if (!worker) {
          resolve();
          return;
        }
        worker.addEventListener("statechange", () => {
          if (worker.state === "activated") resolve();
        });
      });
    }

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration,
    });

    if (!token) {
      console.warn("[firebase] getToken() returned empty — no FCM token issued.");
      return null;
    }
    return token;
  } catch (err) {
    // Surface the real failure (VAPID mismatch, blocked push service, SW
    // registration failure, etc.) instead of letting it vanish into an
    // unhandled rejection. Re-throw so the UI can report it.
    console.error("[firebase] Failed to obtain FCM token:", err);
    throw err instanceof Error ? err : new Error(String(err));
  }
}

/**
 * Raise an OS-level system notification for a *foreground* message.
 *
 * FCM only auto-displays system notifications for background messages (via the
 * service worker's onBackgroundMessage). When the tab is focused the message is
 * delivered to onMessage instead and nothing is shown at the OS level — so we
 * display it ourselves here, reusing the active firebase-messaging service
 * worker so the existing `notificationclick` handler still routes the click.
 */
export async function showForegroundSystemNotification(
  payload: MessagePayload,
): Promise<void> {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  if (!("serviceWorker" in navigator)) return;

  const registration =
    (await navigator.serviceWorker.getRegistration("/firebase-messaging-sw.js")) ||
    (await navigator.serviceWorker.ready);
  if (!registration) return;

  const notification = payload.notification;
  const data = (payload.data ?? {}) as Record<string, string>;
  const link = data.link || data.url || "/";

  await registration.showNotification(notification?.title || "Cready", {
    body: notification?.body || "",
    icon: notification?.image || "/cready.png",
    badge: "/cready.png",
    // Coalesce same-content messages so a foreground + background race can't
    // stack two identical OS notifications.
    tag: notification?.title || "cready",
    data: { url: link },
  });
}
