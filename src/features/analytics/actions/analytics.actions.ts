"use server";

import { getAnalyticsDashboardData } from "@/lib/analytics";
import { requireSessionUserId } from "@/lib/auth/session";
import { connectDB } from "@/lib/db";
import type { AnalyticsPageData } from "@/features/analytics/types";

export async function getAnalyticsPageData(): Promise<AnalyticsPageData> {
  const userId = await requireSessionUserId();
  await connectDB();
  return getAnalyticsDashboardData(userId);
}
