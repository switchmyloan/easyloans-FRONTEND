"use client";

import { useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { registerDeviceToken } from "@/lib/push";

/**
 * Mounts Firebase Cloud Messaging on the client and renders the global toast
 * host. Foreground push messages are surfaced as toasts.
 *
 * The device token is available via usePushNotifications() in any client
 * component — send it to your backend to target this browser.
 */
export default function PushNotificationProvider() {
  const { token, permission, requestPermission } = usePushNotifications(
    (title, body) => {
      toast(body ? `${title}: ${body}` : title, { duration: 6000 });
    },
  );

  // Dev affordance: prompt for notification permission on load so a device
  // token is produced and can be targeted for test pushes.
  useEffect(() => {
    if (permission === "default") {
      requestPermission();
    }
  }, [permission, requestPermission]);

  // Surface the FCM token and register it with the backend so this device can
  // be targeted by the push-notification panel.
  useEffect(() => {
    if (token) {
      console.log("[FCM] device token:", token);
      registerDeviceToken(token);
    }
  }, [token]);

  return <Toaster position="top-center" />;
}
