#!/usr/bin/env node
/**
 * Firebase setup helper for Noirly Vision push notifications.
 *
 * Prerequisites:
 *   1. npx firebase login
 *   2. Firebase project with Cloud Messaging enabled
 *
 * Usage:
 *   npm run firebase:setup -- <firebase-project-id>
 *
 * This script prints .env.local values for copy/paste.
 * It also writes firebase/.firebaserc and downloads a service account key
 * to firebase/service-account.json (gitignored).
 */

import { execSync } from "node:child_process";
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const projectId = process.argv[2];

function run(command) {
  return execSync(command, { encoding: "utf8", stdio: ["pipe", "pipe", "pipe"] }).trim();
}

function tryRun(command) {
  try {
    return run(command);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(message);
  }
}

function main() {
  console.log("Noirly Vision — Firebase push setup\n");

  try {
    const login = tryRun("npx -y firebase-tools@latest login:list");
    console.log(login);
  } catch {
    console.error(
      "Firebase CLI is not authenticated. Run:\n  npx firebase login\n"
    );
    process.exit(1);
  }

  if (!projectId) {
    console.log("Usage: npm run firebase:setup -- <firebase-project-id>\n");
    try {
      const projects = tryRun("npx -y firebase-tools@latest projects:list");
      console.log(projects);
    } catch {
      console.error(
        "Could not list projects. Re-authenticate with:\n  npx firebase login --reauth\n"
      );
    }
    process.exit(1);
  }

  const firebaseDir = join(process.cwd(), "firebase");
  mkdirSync(firebaseDir, { recursive: true });

  writeFileSync(
    join(firebaseDir, ".firebaserc"),
    JSON.stringify({ projects: { default: projectId } }, null, 2)
  );

  let appsOutput = "";
  try {
    appsOutput = tryRun(
      `npx -y firebase-tools@latest apps:list --project ${projectId} --json`
    );
  } catch {
    console.warn("Could not list apps — continuing.");
  }

  let appId = null;
  if (appsOutput) {
    try {
      const parsed = JSON.parse(appsOutput);
      const webApp = parsed.result?.find?.(
        (app) => app.platform === "WEB"
      ) ?? parsed?.find?.((app) => app.platform === "WEB");
      appId = webApp?.appId ?? null;
    } catch {
      // ignore parse errors
    }
  }

  if (!appId) {
    console.log(`Creating web app in project ${projectId}...`);
    const createOutput = tryRun(
      `npx -y firebase-tools@latest apps:create WEB "Noirly Vision Web" --project ${projectId} --json`
    );
    const created = JSON.parse(createOutput);
    appId = created.appId ?? created.result?.appId;
  }

  if (!appId) {
    console.error("Failed to resolve Firebase web app ID.");
    process.exit(1);
  }

  const sdkOutput = tryRun(
    `npx -y firebase-tools@latest apps:sdkconfig WEB ${appId} --project ${projectId}`
  );

  const apiKey = sdkOutput.match(/apiKey:\s*"([^"]+)"/)?.[1] ?? "";
  const authDomain = sdkOutput.match(/authDomain:\s*"([^"]+)"/)?.[1] ?? "";
  const messagingSenderId =
    sdkOutput.match(/messagingSenderId:\s*"([^"]+)"/)?.[1] ?? "";
  const resolvedAppId = sdkOutput.match(/appId:\s*"([^"]+)"/)?.[1] ?? appId;

  const serviceAccountPath = join(firebaseDir, "service-account.json");
  if (!existsSync(serviceAccountPath)) {
    console.log(
      "\nDownload a service account key from Firebase Console → Project settings → Service accounts → Generate new private key"
    );
    console.log(`Save it as: ${serviceAccountPath}`);
  }

  console.log("\n--- Add to .env.local ---\n");
  console.log(`NEXT_PUBLIC_FIREBASE_API_KEY=${apiKey}`);
  console.log(`NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=${authDomain}`);
  console.log(`NEXT_PUBLIC_FIREBASE_PROJECT_ID=${projectId}`);
  console.log(`NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=${messagingSenderId}`);
  console.log(`NEXT_PUBLIC_FIREBASE_APP_ID=${resolvedAppId}`);
  console.log(
    "NEXT_PUBLIC_FIREBASE_VAPID_KEY=<from Firebase Console → Cloud Messaging → Web Push certificates>"
  );
  console.log(`FIREBASE_SERVICE_ACCOUNT_PATH=./firebase/service-account.json`);
  console.log("CRON_SECRET=<random-string-for-vercel-cron>");
  console.log("\n--- VAPID key ---");
  console.log(
    "Firebase Console → Build → Cloud Messaging → Web configuration → Generate key pair"
  );
  console.log("\nDone.");
}

main();
