"use client";

import { ArrowUpRight, Sparkles } from "lucide-react";
import { SystemStabilityChart } from "@/components/dashboard/system-stability-chart";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function GoalsRightPanel() {
  return (
    <aside className="hidden w-72 shrink-0 flex-col gap-4 overflow-y-auto border-l border-border bg-background p-4 xl:flex">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <h2 className="text-sm font-semibold text-primary">Goal Intelligence</h2>
      </div>

      <Card className="border-border bg-card">
        <CardHeader className="pb-2 pt-4">
          <CardTitle className="text-sm font-medium">Most Aligned</CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <p className="font-medium">Cloud Mastery</p>
          <p className="mt-1 text-xs text-muted-foreground">
            45% vision contribution
          </p>
          <Badge
            variant="outline"
            className="mt-3 border-primary/30 bg-primary/10 text-[10px] text-primary"
          >
            High impact detected
          </Badge>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="pb-2 pt-4">
          <CardTitle className="text-sm font-medium">Next Up</CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <p className="text-sm font-medium">Complete Terraform Project</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Critical path for Cloud Mastery
          </p>
          <button
            type="button"
            className="mt-3 text-xs text-primary hover:underline"
          >
            Mark as Complete
          </button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <p className="text-[10px] text-muted-foreground">Goal Health</p>
            <p className="mt-1 text-sm font-semibold text-chart-3">
              On Track
            </p>
            <p className="text-lg font-bold">83%</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <p className="text-[10px] text-muted-foreground">Weekly Movement</p>
            <div className="mt-1 flex items-center gap-1">
              <ArrowUpRight className="h-4 w-4 text-primary" />
              <p className="text-lg font-bold text-primary">+12%</p>
            </div>
            <p className="text-[10px] text-muted-foreground">Progress</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-card">
        <CardContent className="p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            AI Insight
          </p>
          <p className="mt-2 text-xs italic leading-relaxed text-muted-foreground">
            Your action alignment is peak. Recommend shifting focus from
            &apos;Learning&apos; to &apos;Actions&apos; to close 2 current
            milestones before EOW.
          </p>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-muted-foreground">System Stability</p>
            <p className="text-sm font-bold text-primary">99.9%</p>
          </div>
          <div className="mt-2">
            <SystemStabilityChart />
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
