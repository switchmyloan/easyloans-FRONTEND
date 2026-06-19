"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { registerDeviceToken } from "@/lib/push";

/**
 * Mounts Firebase Cloud Messaging on the client and renders the global toast
 * host. Foreground push messages are surfaced as toasts.
 *
 * Permission is requested from a USER GESTURE — the first interaction with the
 * page, plus an explicit "Enable notifications" button. Requesting it on bare
 * page load is silently suppressed by browsers (Chrome's "quieter" UI), which
 * is why no popup used to appear. The resulting FCM token is registered with
 * the backend so this device can be targeted by the push panel.
 */
export default function PushNotificationProvider() {
  const { token, permission, error, requestPermission } = usePushNotifications(
    (title, body) => {
      toast(body ? `${title}: ${body}` : title, { duration: 6000 });
    },
  );

  const [busy, setBusy] = useState(false);
  // Guards the automatic first-gesture trigger so it only fires once.
  const autoTriggered = useRef(false);

  const enable = useCallback(async () => {
    setBusy(true);
    try {
      const fcmToken = await requestPermission();
      if (fcmToken) {
        toast.success("Notifications enabled");
      } else if (
        typeof Notification !== "undefined" &&
        Notification.permission === "denied"
      ) {
        toast.error(
          "Notifications are blocked. Enable them in your browser's site settings, then reload.",
        );
      }
    } finally {
      setBusy(false);
    }
  }, [requestPermission]);

  // Trigger the permission prompt on the FIRST real user gesture. Browsers
  // require a user activation for Notification.requestPermission() to actually
  // show a popup, so we wait for the first pointer/touch/key interaction.
  useEffect(() => {
    if (permission !== "default") return;

    const onFirstGesture = () => {
      if (autoTriggered.current) return;
      autoTriggered.current = true;
      enable();
    };

    const opts: AddEventListenerOptions = { once: true, passive: true };
    window.addEventListener("pointerdown", onFirstGesture, opts);
    window.addEventListener("touchstart", onFirstGesture, opts);
    window.addEventListener("keydown", onFirstGesture, opts);

    return () => {
      window.removeEventListener("pointerdown", onFirstGesture);
      window.removeEventListener("touchstart", onFirstGesture);
      window.removeEventListener("keydown", onFirstGesture);
    };
  }, [permission, enable]);

  // Register (or refresh) the token with the backend once we have it, so the
  // push panel can target this device.
  useEffect(() => {
    if (token) {
      console.log("[FCM] device token:", token);
      registerDeviceToken(token);
    }
  }, [token]);

  // Make setup failures visible in the console for diagnosis.
  useEffect(() => {
    if (error) console.error("[FCM] push setup error:", error);
  }, [error]);

  // Show the manual button whenever the browser supports notifications but we
  // don't yet have a working token — covers "default" (prompt), "denied"
  // (guidance toast on click), and "granted but token failed" (retryable).
  const showEnableButton =
    permission !== "unsupported" && (permission !== "granted" || !token);

  return (
    <>
      <Toaster position="top-center" />
      {showEnableButton && (
        <button
          type="button"
          onClick={() => {
            autoTriggered.current = true;
            enable();
          }}
          disabled={busy}
          aria-label="Enable notifications"
          className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-lg transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span aria-hidden>🔔</span>
          {busy ? "Enabling…" : "Enable notifications"}
        </button>
      )}
    </>
  );
}
