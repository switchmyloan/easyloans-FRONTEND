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
  /** Prompt the user for permission and fetch a token. */
  requestPermission: () => Promise<string | null>;
}

/**
 * Wires up Firebase Cloud Messaging on the client:
 * - tracks notification permission
 * - listens for foreground messages (shows a toast)
 * - exposes requestPermission() to obtain the device token
 */
export function usePushNotifications(
  onForegroundMessage?: (title: string, body: string) => void,
): UsePushNotifications {
  const [token, setToken] = useState<string | null>(null);
  const [permission, setPermission] = useState<PermissionState>("default");
  const onForegroundRef = useRef(onForegroundMessage);
  onForegroundRef.current = onForegroundMessage;

  const requestPermission = useCallback(async () => {
    const fcmToken = await requestFcmToken();
    setToken(fcmToken);
    if (typeof Notification !== "undefined") {
      setPermission(Notification.permission as PermissionState);
    }
    return fcmToken;
  }, []);

  // Initialise permission state on mount.
  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setPermission("unsupported");
      return;
    }
    setPermission(Notification.permission as PermissionState);

    // If already granted, silently refresh the token.
    if (Notification.permission === "granted") {
      requestFcmToken().then(setToken);
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

  return { token, permission, requestPermission };
}
