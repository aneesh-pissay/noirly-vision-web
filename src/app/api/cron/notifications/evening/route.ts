import { NextResponse } from "next/server";
import { verifyCronRequest } from "@/lib/cron/auth";
import { runEveningReviewJobs } from "@/services/scheduled-notifications";

export async function GET(request: Request) {
  if (!verifyCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await runEveningReviewJobs();
    return NextResponse.json({ ok: true, job: "evening-review" });
  } catch (error) {
    console.error("[Cron] Evening review failed:", error);
    return NextResponse.json({ error: "Job failed" }, { status: 500 });
  }
}
