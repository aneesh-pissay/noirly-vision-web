import {
  getFirebasePublicConfig,
  getFirebaseVapidKey,
} from "@/lib/firebase/config";

export async function GET() {
  const config = getFirebasePublicConfig() ?? {
    apiKey: "",
    authDomain: "",
    projectId: "",
    messagingSenderId: "",
    appId: "",
  };

  const script = `
importScripts("https://www.gstatic.com/firebasejs/11.6.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/11.6.0/firebase-messaging-compat.js");
firebase.initializeApp(${JSON.stringify(config)});
const messaging = firebase.messaging();
messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || payload.data?.title || "Noirly Vision";
  const body = payload.notification?.body || payload.data?.body || "You have a new notification";
  self.registration.showNotification(title, {
    body,
    icon: "/logo.png",
    data: { url: payload.data?.url || "/dashboard" },
  });
});
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/dashboard";
  event.waitUntil(clients.openWindow(url));
});
`.trim();

  return new Response(script, {
    headers: {
      "Content-Type": "application/javascript",
      "Cache-Control": "no-cache",
    },
  });
}
