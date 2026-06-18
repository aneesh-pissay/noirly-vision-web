"use server";

import { requireSessionUserId } from "@/lib/auth/session";
import { loadOsCounts } from "@/lib/progress/load-os-counts";
import {
  resolveOsPermissions,
  type OsPermissions,
} from "@/lib/progress/permissions";

export async function getOsPermissions(): Promise<OsPermissions> {
  const userId = await requireSessionUserId();
  const counts = await loadOsCounts(userId);
  return resolveOsPermissions(counts);
}
