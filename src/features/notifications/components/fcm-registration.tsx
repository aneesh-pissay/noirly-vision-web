"use client";

import { useEffect } from "react";
import {
  isPushSupported,
  registerFcmToken,
} from "@/lib/firebase/firebase-client";

export function FcmRegistration() {
  useEffect(() => {
    void (async () => {
      if (typeof window === "undefined" || !("Notification" in window)) return;
      if (!(await isPushSupported())) return;
      if (Notification.permission !== "granted") return;

      await registerFcmToken().catch(() => {
        // Token refresh failed — user can re-enable from Settings
      });
    })();
  }, []);

  return null;
}
