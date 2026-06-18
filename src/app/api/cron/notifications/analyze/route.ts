import { NextResponse } from "next/server";
import { verifyCronRequest } from "@/lib/cron/auth";
import { runWorkspaceAnalysisJobs } from "@/services/scheduled-notifications";

export async function GET(request: Request) {
  if (!verifyCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await runWorkspaceAnalysisJobs();
    return NextResponse.json({ ok: true, job: "workspace-analysis" });
  } catch (error) {
    console.error("[Cron] Workspace analysis failed:", error);
    return NextResponse.json({ error: "Job failed" }, { status: 500 });
  }
}
