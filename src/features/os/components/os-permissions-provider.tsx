"use client";

import {
  createContext,
  useContext,
  type ReactNode,
} from "react";
import type { OsPermissions } from "@/lib/progress/permissions";

const OsPermissionsContext = createContext<OsPermissions | null>(null);

export function OsPermissionsProvider({
  permissions,
  children,
}: {
  permissions: OsPermissions;
  children: ReactNode;
}) {
  return (
    <OsPermissionsContext.Provider value={permissions}>
      {children}
    </OsPermissionsContext.Provider>
  );
}

export function useOsPermissions() {
  const ctx = useContext(OsPermissionsContext);
  if (!ctx) {
    throw new Error(
      "useOsPermissions must be used within OsPermissionsProvider"
    );
  }
  return ctx;
}
