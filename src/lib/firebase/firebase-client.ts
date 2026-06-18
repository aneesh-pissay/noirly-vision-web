"use client";

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  isSupported,
  onMessage,
  type Messaging,
} from "firebase/messaging";
import type { FirebasePublicConfig } from "@/lib/firebase/config";

let cachedConfig: FirebasePublicConfig | null | undefined;
let foregroundListenerAttached = false;

async function fetchPublicConfig(): Promise<FirebasePublicConfig | null> {
  if (cachedConfig !== undefined) return cachedConfig;

  try {
    const response = await fetch("/api/firebase/config", {
      credentials: "include",
    });
    if (!response.ok) {
      cachedConfig = null;
      return null;
    }
    const data = (await response.json()) as {
      config: FirebasePublicConfig | null;
    };
    cachedConfig = data.config;
    return cachedConfig;
  } catch {
    cachedConfig = null;
    return null;
  }
}

async function resolveFirebaseConfig(): Promise<FirebasePublicConfig | null> {
  const fromEnv: FirebasePublicConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
    messagingSenderId:
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
  };

  if (
    fromEnv.apiKey &&
    fromEnv.projectId &&
    fromEnv.messagingSenderId &&
    fromEnv.appId
  ) {
    if (!fromEnv.authDomain) {
      fromEnv.authDomain = `${fromEnv.projectId}.firebaseapp.com`;
    }
    return fromEnv;
  }

  return fetchPublicConfig();
}

async function resolveVapidKey(): Promise<string | null> {
  const envKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
  if (envKey) return envKey;

  try {
    const response = await fetch("/api/firebase/config", {
      credentials: "include",
    });
    if (!response.ok) return null;
    const data = (await response.json()) as { vapidKey: string | null };
    return data.vapidKey;
  } catch {
    return null;
  }
}

function getFirebaseApp(config: FirebasePublicConfig): FirebaseApp {
  if (getApps().length > 0) return getApps()[0]!;
  return initializeApp(config);
}

function attachForegroundListener(messaging: Messaging) {
  if (foregroundListenerAttached) return;
  foregroundListenerAttached = true;

  onMessage(messaging, (payload) => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    const title =
      payload.notification?.title ?? payload.data?.title ?? "Noirly Vision";
    const body =
      payload.notification?.body ??
      payload.data?.body ??
      "You have a new notification";

    new Notification(title, {
      body,
      icon: "/logo.png",
      data: { url: payload.data?.url ?? "/dashboard" },
    });
  });
}

export async function isPushSupported(): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (!(await isSupported())) return false;
  const config = await resolveFirebaseConfig();
  return config !== null;
}

export async function registerFcmToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  if (!(await isSupported())) return null;

  const config = await resolveFirebaseConfig();
  if (!config) return null;

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return null;

  const vapidKey = await resolveVapidKey();
  if (!vapidKey) return null;

  const app = getFirebaseApp(config);
  const messaging = getMessaging(app);
  attachForegroundListener(messaging);

  const registration = await navigator.serviceWorker.register(
    "/firebase-messaging-sw.js"
  );

  const token = await getToken(messaging, {
    vapidKey,
    serviceWorkerRegistration: registration,
  });

  if (!token) return null;

  const response = await fetch("/api/notifications/device", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      fcmToken: token,
      deviceName: "Web",
      browser: navigator.userAgent,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to register device token");
  }

  return token;
}

export async function unregisterFcmOnServer(token: string) {
  await fetch("/api/notifications/device", {
    method: "DELETE",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fcmToken: token }),
  });
}
