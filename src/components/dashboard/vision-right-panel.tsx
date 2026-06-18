"use client";

import { TrendingUp } from "lucide-react";
import { AlignmentDonut } from "@/components/dashboard/alignment-donut";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardPanel } from "@/components/layout/dashboard/panel-context";

export function VisionRightPanel() {
  const { panel } = useDashboardPanel();
  const alignment = panel.alignmentScore ?? 0;
  const focus = panel.focusLabel ?? "No active focus";
  const nextAction = panel.nextAction;
  const insight =
    panel.insight ??
    "Define a vision and goals to unlock personalized alignment insights.";

  return (
    <aside className="hidden w-72 shrink-0 flex-col gap-4 overflow-y-auto border-l border-border bg-background p-4 xl:flex">
      <Card className="border-border bg-card">
        <CardHeader className="pb-2 pt-4">
          <CardTitle className="text-sm font-medium">Alignment Score</CardTitle>
        </CardHeader>
        <CardContent className="pb-4 text-center">
          <AlignmentDonut value={alignment} />
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            {alignment > 0
              ? `Your actions are ${alignment}% aligned with your active vision.`
              : "Create a vision to start tracking alignment."}
          </p>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="pb-2 pt-4">
          <CardTitle className="text-sm font-medium">Current Focus</CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <p className="font-medium">{focus}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Primary Growth Vector
          </p>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="pb-2 pt-4">
          <CardTitle className="text-sm font-medium">Next Action</CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <p className="text-sm font-medium">
            {nextAction ?? "No actions queued"}
          </p>
          {nextAction && (
            <Button className="mt-4 w-full rounded-full" size="sm">
              Execute Now
            </Button>
          )}
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center gap-2 pb-2 pt-4">
          <TrendingUp className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm font-medium">System Insight</CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <p className="text-xs leading-relaxed text-muted-foreground">
            {insight}
          </p>
        </CardContent>
      </Card>
    </aside>
  );
}
