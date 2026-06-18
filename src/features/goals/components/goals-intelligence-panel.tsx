"use client";

import { Sparkles } from "lucide-react";
import type { GoalsIntelligenceData } from "@/features/goals/types";
import { Card, CardContent } from "@/components/ui/card";
import { RightPanelShell } from "@/components/right-panel/right-panel-shell";
import { cn } from "@/lib/utils";
import type { GoalWorkflowStatus } from "@/lib/goals/goal-workflow-status";

type GoalsIntelligencePanelProps = {
  data: GoalsIntelligenceData;
};

const statusStyles: Record<GoalWorkflowStatus, string> = {
  planning: "text-primary",
  in_progress: "text-chart-3",
  blocked: "text-destructive",
};

export function GoalsIntelligencePanel({ data }: GoalsIntelligencePanelProps) {
  if (!data.hasGoals) {
    return (
      <RightPanelShell>
        <div className="flex min-w-0 items-center gap-2">
          <Sparkles className="h-4 w-4 shrink-0 text-primary" />
          <h2 className="truncate text-sm font-semibold text-primary">
            Goal Intelligence
          </h2>
        </div>

        <Card className="overflow-hidden border-border bg-card">
          <CardContent className="p-4">
            <p className="truncate text-sm font-semibold">No goals connected yet</p>
            <p className="mt-2 break-words text-xs leading-relaxed text-muted-foreground line-clamp-2">
              Create your first goal to unlock alignment tracking and execution
              connection.
            </p>
          </CardContent>
        </Card>
      </RightPanelShell>
    );
  }

  const workflow = data.workflow!;
  const statusColor = statusStyles[workflow.status];
  const roadmapLabel =
    data.milestonesTotal === 0
      ? "0 / 0 roadmap steps completed"
      : `${data.milestonesCompleted} / ${data.milestonesTotal} roadmap steps completed`;

  return (
    <RightPanelShell>
      <div className="flex min-w-0 items-center gap-2">
        <Sparkles className="h-4 w-4 shrink-0 text-primary" />
        <h2 className="truncate text-sm font-semibold text-primary">
          Goal Intelligence
        </h2>
      </div>

      <Card className="overflow-hidden border-border bg-card">
        <CardContent className="space-y-4 p-4">
          <div>
            <p
              className={cn(
                "text-[10px] font-semibold uppercase tracking-wider",
                statusColor
              )}
            >
              {workflow.label.toUpperCase()}
            </p>
            {data.primaryGoalTitle && (
              <p className="mt-2 text-sm font-semibold">{data.primaryGoalTitle}</p>
            )}
          </div>

          {data.nextStepTitle && (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Next
              </p>
              <p className="mt-1 text-sm font-medium">{data.nextStepTitle}</p>
            </div>
          )}

          <p className="text-xs text-muted-foreground">{roadmapLabel}</p>
        </CardContent>
      </Card>
    </RightPanelShell>
  );
}
