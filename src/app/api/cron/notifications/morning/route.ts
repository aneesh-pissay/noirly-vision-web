import { NextResponse } from "next/server";
import { verifyCronRequest } from "@/lib/cron/auth";
import { runMorningPlanningJobs } from "@/services/scheduled-notifications";

export async function GET(request: Request) {
  if (!verifyCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await runMorningPlanningJobs();
    return NextResponse.json({ ok: true, job: "morning-planning" });
  } catch (error) {
    console.error("[Cron] Morning planning failed:", error);
    return NextResponse.json({ error: "Job failed" }, { status: 500 });
  }
}
