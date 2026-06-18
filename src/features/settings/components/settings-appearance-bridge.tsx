"use client";

import { useEffect } from "react";
import type { UserSettings } from "@/features/settings/types";

function resolveThemeClass(theme: UserSettings["theme"]) {
  if (theme === "light") return "light";
  if (theme === "dark") return "dark";
  if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  }
  return "light";
}

export function applyUserSettings(settings: UserSettings) {
  const root = document.documentElement;
  const themeClass = resolveThemeClass(settings.theme);

  root.classList.remove("dark", "light");
  root.classList.add(themeClass);
  root.style.setProperty("--primary", settings.accentColor);
  root.style.setProperty("--ring", settings.accentColor);
  root.style.setProperty("--sidebar-primary", settings.accentColor);
  root.dataset.density = settings.density;
  root.dataset.sidebar = settings.sidebarMode;
  root.dataset.animations = settings.animationsEnabled ? "on" : "off";
}

export function SettingsAppearanceBridge({
  settings,
}: {
  settings: UserSettings;
}) {
  useEffect(() => {
    applyUserSettings(settings);

    if (settings.theme !== "system") return;

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyUserSettings(settings);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [settings]);

  return null;
}
