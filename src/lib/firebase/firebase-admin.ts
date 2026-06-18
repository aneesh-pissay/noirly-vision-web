import { readFileSync } from "fs";
import { getApps, initializeApp, cert, type App } from "firebase-admin/app";
import { getMessaging, type Messaging } from "firebase-admin/messaging";

let adminApp: App | null = null;
let messaging: Messaging | null = null;

type ServiceAccount = {
  project_id: string;
  client_email: string;
  private_key: string;
};

function loadServiceAccount(): ServiceAccount | null {
  const inline = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (inline) {
    try {
      return JSON.parse(inline) as ServiceAccount;
    } catch {
      console.error("[FCM] FIREBASE_SERVICE_ACCOUNT_JSON is invalid JSON");
      return null;
    }
  }

  const filePath =
    process.env.FIREBASE_SERVICE_ACCOUNT_PATH ??
    process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (!filePath) return null;

  try {
    return JSON.parse(readFileSync(filePath, "utf8")) as ServiceAccount;
  } catch (error) {
    console.error("[FCM] Failed to read service account file:", error);
    return null;
  }
}

export function getFirebaseAdmin(): { app: App; messaging: Messaging } | null {
  if (messaging && adminApp) {
    return { app: adminApp, messaging };
  }

  const serviceAccount = loadServiceAccount();
  if (!serviceAccount) {
    return null;
  }

  try {
    adminApp =
      getApps().length > 0
        ? getApps()[0]!
        : initializeApp({
            credential: cert({
              projectId: serviceAccount.project_id,
              clientEmail: serviceAccount.client_email,
              privateKey: serviceAccount.private_key.replace(/\\n/g, "\n"),
            }),
          });

    messaging = getMessaging(adminApp);
    return { app: adminApp, messaging };
  } catch (error) {
    console.error("[FCM] Failed to initialize Firebase Admin:", error);
    return null;
  }
}

export function isPushConfigured(): boolean {
  return Boolean(
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON ||
      process.env.FIREBASE_SERVICE_ACCOUNT_PATH ||
      process.env.GOOGLE_APPLICATION_CREDENTIALS
  );
}
