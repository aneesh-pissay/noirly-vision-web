#!/usr/bin/env node
/**
 * Writes Firebase web SDK config + service account into .env.local
 * VAPID must be supplied via --vapid= or FIREBASE_VAPID_KEY env (console-only generation).
 */

import { execSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { randomBytes } from "node:crypto";

const PROJECT_ID = process.argv[2] ?? "noirly-vision-prod";
const APP_ID =
  process.argv[3] ?? "1:426419869726:web:ab9f0e5ef28c71963bb60f";
const vapidArg = process.argv.find((arg) => arg.startsWith("--vapid="));
const VAPID_KEY = vapidArg?.slice("--vapid=".length) ?? process.env.FIREBASE_VAPID_KEY ?? "";

function getFirebaseAccessToken() {
  const configPath = join(homedir(), ".config", "configstore", "firebase-tools.json");
  const store = JSON.parse(readFileSync(configPath, "utf8"));
  const refreshToken = store.tokens?.refresh_token;
  if (!refreshToken) {
    throw new Error("No Firebase refresh token. Run: npx firebase login");
  }

  const body = new URLSearchParams({
    client_id:
      "563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com",
    client_secret: "j9iVZfS8kkCEFUPaAeJV0sAi",
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });

  const response = execSync(
    `curl -s -X POST https://oauth2.googleapis.com/token -d "${body.toString()}"`,
    { encoding: "utf8" }
  );

  const parsed = JSON.parse(response);
  if (!parsed.access_token) {
    throw new Error(`Token refresh failed: ${response}`);
  }
  return parsed.access_token;
}

async function apiFetch(url, token, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`${response.status} ${url}: ${text}`);
  }
  return text ? JSON.parse(text) : null;
}

async function getServiceAccountEmail(token) {
  const url = `https://iam.googleapis.com/v1/projects/${PROJECT_ID}/serviceAccounts`;
  const data = await apiFetch(url, token);
  const accounts = data.accounts ?? [];
  const firebaseAdmin = accounts.find((account) =>
    account.email?.includes("firebase-adminsdk")
  );
  if (!firebaseAdmin?.email) {
    throw new Error(
      "No firebase-adminsdk service account found yet. Wait a minute and retry."
    );
  }
  return firebaseAdmin;
}

async function createServiceAccountKey(token, serviceAccount) {
  const email = encodeURIComponent(serviceAccount.email);
  const url = `https://iam.googleapis.com/v1/projects/${PROJECT_ID}/serviceAccounts/${email}/keys`;
  return apiFetch(url, token, {
    method: "POST",
    body: JSON.stringify({
      keyAlgorithm: "KEY_ALG_RSA_2048",
      privateKeyType: "TYPE_GOOGLE_CREDENTIALS_FILE",
    }),
  });
}

async function enableService(token, service) {
  const url = `https://serviceusage.googleapis.com/v1/projects/${PROJECT_ID}/services/${service}:enable`;
  try {
    await apiFetch(url, token, { method: "POST", body: "{}" });
  } catch {
    // ignore if already enabled or permission-limited
  }
}

function getSdkConfig() {
  const output = execSync(
    `npx -y firebase-tools@latest apps:sdkconfig WEB ${APP_ID} --project ${PROJECT_ID} --json`,
    { encoding: "utf8" }
  );
  const parsed = JSON.parse(output);
  return parsed.result?.sdkConfig ?? parsed.sdkConfig ?? parsed;
}

function parseExistingEnv(path) {
  if (!existsSync(path)) return {};
  const lines = readFileSync(path, "utf8").split(/\r?\n/);
  const env = {};
  for (const line of lines) {
    if (!line || line.startsWith("#") || !line.includes("=")) continue;
    const idx = line.indexOf("=");
    env[line.slice(0, idx)] = line.slice(idx + 1);
  }
  return env;
}

function mergeEnv(existing, updates) {
  const merged = { ...existing };
  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined && value !== null && value !== "") {
      merged[key] = value;
    }
  }
  return merged;
}

function serializeEnv(env) {
  const keys = Object.keys(env).sort((a, b) => {
    const pubA = a.startsWith("NEXT_PUBLIC_") ? 0 : 1;
    const pubB = b.startsWith("NEXT_PUBLIC_") ? 0 : 1;
    if (pubA !== pubB) return pubA - pubB;
    return a.localeCompare(b);
  });
  return keys.map((key) => `${key}=${env[key]}`).join("\n") + "\n";
}

async function main() {
  console.log(`Configuring Firebase project: ${PROJECT_ID}`);

  const sdk = getSdkConfig();
  const token = getFirebaseAccessToken();
  await enableService(token, "iam.googleapis.com");
  await enableService(token, "fcm.googleapis.com");
  const serviceAccount = await getServiceAccountEmail(token);
  const keyResponse = await createServiceAccountKey(token, serviceAccount);

  const privateKeyData = keyResponse.privateKeyData;
  if (!privateKeyData) {
    throw new Error("Failed to generate service account key");
  }

  const serviceAccountJson = JSON.parse(
    Buffer.from(privateKeyData, "base64").toString("utf8")
  );

  const firebaseDir = join(process.cwd(), "firebase");
  mkdirSync(firebaseDir, { recursive: true });
  const serviceAccountPath = join(firebaseDir, "service-account.json");
  writeFileSync(serviceAccountPath, JSON.stringify(serviceAccountJson, null, 2));

  writeFileSync(
    join(firebaseDir, ".firebaserc"),
    JSON.stringify({ projects: { default: PROJECT_ID } }, null, 2)
  );

  const envPath = join(process.cwd(), ".env.local");
  const existing = parseExistingEnv(envPath);
  const cronSecret =
    existing.CRON_SECRET && existing.CRON_SECRET.length > 8
      ? existing.CRON_SECRET
      : randomBytes(24).toString("hex");

  const merged = mergeEnv(existing, {
    NEXT_PUBLIC_FIREBASE_API_KEY: sdk.apiKey,
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: sdk.authDomain,
    NEXT_PUBLIC_FIREBASE_PROJECT_ID: sdk.projectId,
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID: sdk.messagingSenderId,
    NEXT_PUBLIC_FIREBASE_APP_ID: sdk.appId,
    NEXT_PUBLIC_FIREBASE_VAPID_KEY: VAPID_KEY || existing.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    FIREBASE_SERVICE_ACCOUNT_PATH: "./firebase/service-account.json",
    CRON_SECRET: cronSecret,
  });

  writeFileSync(envPath, serializeEnv(merged));

  console.log("\nFirebase setup complete.");
  console.log(`Project: ${PROJECT_ID}`);
  console.log(`Web app: ${APP_ID}`);
  console.log(`Service account: ${serviceAccount.email}`);
  console.log(`Wrote ${envPath}`);
  console.log(`Wrote ${serviceAccountPath}`);

  if (!merged.NEXT_PUBLIC_FIREBASE_VAPID_KEY) {
    console.log(
      "\nVAPID key still missing. Generate in Firebase Console → Cloud Messaging → Web Push certificates,"
    );
    console.log("then rerun: node scripts/fetch-firebase-env.mjs --vapid=YOUR_KEY");
  }
}

main().catch((error) => {
  console.error(error.message ?? error);
  process.exit(1);
});
