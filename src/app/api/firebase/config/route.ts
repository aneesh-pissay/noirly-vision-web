import { NextResponse } from "next/server";
import {
  getFirebasePublicConfig,
  getFirebaseVapidKey,
} from "@/lib/firebase/config";

export async function GET() {
  const config = getFirebasePublicConfig();
  const vapidKey = getFirebaseVapidKey();

  return NextResponse.json({
    config,
    vapidKey,
    pushConfigured: Boolean(config && vapidKey),
  });
}
