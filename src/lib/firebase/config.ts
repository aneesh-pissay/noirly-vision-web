export type FirebasePublicConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  messagingSenderId: string;
  appId: string;
};

export function getFirebasePublicConfig(): FirebasePublicConfig | null {
  const config: FirebasePublicConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
    messagingSenderId:
      process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? "",
  };

  if (
    !config.apiKey ||
    !config.projectId ||
    !config.messagingSenderId ||
    !config.appId
  ) {
    return null;
  }

  if (!config.authDomain) {
    config.authDomain = `${config.projectId}.firebaseapp.com`;
  }

  return config;
}

export function getFirebaseVapidKey(): string | null {
  const key = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
  return key && key.length > 0 ? key : null;
}

export function isFirebasePublicConfigReady(
  config: FirebasePublicConfig | null
): config is FirebasePublicConfig {
  return config !== null;
}
