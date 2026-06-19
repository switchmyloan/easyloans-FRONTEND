/* global importScripts, firebase */
// Firebase Cloud Messaging service worker.
// Handles push notifications while the site is in the background or closed.
// Note: service workers can't read process.env, so the config is inlined here.
// Keep these values in sync with src/lib/firebase.ts.

importScripts(
  "https://www.gstatic.com/firebasejs/12.14.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/12.14.0/firebase-messaging-compat.js",
);

firebase.initializeApp({
  apiKey: "AIzaSyA40nc8r-O9owvylmUMBnSGlpNscPq5NYI",
  authDomain: "cready-sml.firebaseapp.com",
  projectId: "cready-sml",
  storageBucket: "cready-sml.firebasestorage.app",
  messagingSenderId: "193071391040",
  appId: "1:193071391040:web:0b415ee28edf8ab8061aa5",
  measurementId: "G-CJCC9E00QZ",
});

const messaging = firebase.messaging();

// Shown when a background "notification" payload arrives. (Pure data messages
// are delivered to onMessage in the page instead.)
messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || "Cready";
  const options = {
    body: payload.notification?.body,
    icon: payload.notification?.icon || "/cready.png",
    data: payload.data || {},
  };
  self.registration.showNotification(title, options);
});

// Focus or open the app when a notification is clicked.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/";
  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(targetUrl) && "focus" in client) {
            return client.focus();
          }
        }
        return self.clients.openWindow(targetUrl);
      }),
  );
});
