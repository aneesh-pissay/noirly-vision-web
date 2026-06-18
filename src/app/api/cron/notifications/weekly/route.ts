import { NextResponse } from "next/server";
import { verifyCronRequest } from "@/lib/cron/auth";
import { runWeeklyReviewJobs } from "@/services/scheduled-notifications";

export async function GET(request: Request) {
  if (!verifyCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await runWeeklyReviewJobs();
    return NextResponse.json({ ok: true, job: "weekly-review" });
  } catch (error) {
    console.error("[Cron] Weekly review failed:", error);
    return NextResponse.json({ error: "Job failed" }, { status: 500 });
  }
}
