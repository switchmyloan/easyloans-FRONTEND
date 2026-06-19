"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { onMessage } from "firebase/messaging";
import { getMessagingInstance, requestFcmToken } from "@/lib/firebase";

type PermissionState = "default" | "granted" | "denied" | "unsupported";

interface UsePushNotifications {
  /** The FCM device token, once permission is granted. */
  token: string | null;
  /** Current notification permission state. */
  permission: PermissionState;
  /** Last error raised while obtaining a token (null when none). */
  error: Error | null;
  /** Prompt the user for permission and fetch a token. Resolves to the token
   *  (or null) and never rejects — read `error` for the failure reason. */
  requestPermission: () => Promise<string | null>;
}

/**
 * Wires up Firebase Cloud Messaging on the client:
 * - tracks notification permission
 * - listens for foreground messages (shows a toast)
 * - exposes requestPermission() to obtain the device token
 *
 * requestPermission() must be called from a user gesture (click/tap/key) —
 * browsers suppress permission prompts requested on bare page load.
 */
export function usePushNotifications(
  onForegroundMessage?: (title: string, body: string) => void,
): UsePushNotifications {
  const [token, setToken] = useState<string | null>(null);
  const [permission, setPermission] = useState<PermissionState>("default");
  const [error, setError] = useState<Error | null>(null);
  const onForegroundRef = useRef(onForegroundMessage);
  onForegroundRef.current = onForegroundMessage;

  const requestPermission = useCallback(async () => {
    setError(null);
    try {
      const fcmToken = await requestFcmToken();
      setToken(fcmToken);
      return fcmToken;
    } catch (err) {
      const normalised = err instanceof Error ? err : new Error(String(err));
      console.error("[FCM] requestPermission failed:", normalised);
      setError(normalised);
      return null;
    } finally {
      if (typeof Notification !== "undefined") {
        setPermission(Notification.permission as PermissionState);
      }
    }
  }, []);

  // Initialise permission state on mount.
  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setPermission("unsupported");
      return;
    }
    setPermission(Notification.permission as PermissionState);

    // If already granted, silently refresh the token (no gesture needed).
    if (Notification.permission === "granted") {
      requestFcmToken()
        .then(setToken)
        .catch((err) => {
          const normalised = err instanceof Error ? err : new Error(String(err));
          console.error("[FCM] token refresh failed:", normalised);
          setError(normalised);
        });
    }
  }, []);

  // Listen for foreground messages.
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    getMessagingInstance().then((messaging) => {
      if (!messaging) return;
      unsubscribe = onMessage(messaging, (payload) => {
        const title = payload.notification?.title || "Cready";
        const body = payload.notification?.body || "";
        onForegroundRef.current?.(title, body);
      });
    });

    return () => unsubscribe?.();
  }, []);

  return { token, permission, error, requestPermission };
}
