"use client";

import { useState } from "react";
import { Flag, Map, Milestone, Plus, Target } from "lucide-react";
import type { MilestonesPageData } from "@/features/milestones/types";
import type { GoalItem } from "@/features/goals/types";
import { GoalsLockedState } from "@/features/goals/components/goals-locked-state";
import { AddMilestoneDialog } from "@/features/goals/components/AddMilestoneDialog";
import { GoalMilestoneRoadmapList } from "@/features/goals/components/goal-roadmap-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatAreaLabel } from "@/features/vision/lib/vision-page-utils";
import {
  formatProgressDisplay,
  goalProgressDisplay,
} from "@/lib/progress/display";

function GoalMilestonesCard({
  goal,
  onAddMilestone,
}: {
  goal: GoalItem;
  onAddMilestone: (goalId: string) => void;
}) {
  const progress = goalProgressDisplay(goal.progress, goal.milestones.length);
  const hasMilestones = goal.milestones.length > 0;

  return (
    <Card className="border-border bg-card">
      <CardContent className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-semibold">{goal.title}</h2>
              <Badge variant="outline" className="text-[10px] uppercase">
                {formatAreaLabel(goal.category)}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {hasMilestones
                ? `${goal.milestones.filter((m) => m.completed).length}/${goal.milestones.length} checkpoints complete`
                : "No milestones yet"}
              {hasMilestones ? ` · ${formatProgressDisplay(progress)}` : null}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="rounded-lg"
            onClick={() => onAddMilestone(goal.id)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add milestone
          </Button>
        </div>

        {hasMilestones ? (
          <div className="mt-5 border-t border-border pt-5">
            <GoalMilestoneRoadmapList milestones={goal.milestones} />
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-dashed border-border bg-surface/30 p-4">
            <p className="text-sm text-muted-foreground">
              Break &ldquo;{goal.title}&rdquo; into measurable checkpoints.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function MilestonesOverview({ data }: { data: MilestonesPageData }) {
  const [addMilestoneGoalId, setAddMilestoneGoalId] = useState<string | null>(
    null
  );

  if (!data.lock.unlocked) {
    return <GoalsLockedState lock={data.lock} />;
  }

  const stats = [
    {
      label: "Active Goals",
      value: String(data.stats.activeGoals),
      icon: Target,
    },
    {
      label: "Milestones",
      value: String(data.stats.milestonesTotal),
      icon: Milestone,
    },
    {
      label: "Completed",
      value:
        data.stats.milestonesTotal === 0
          ? "—"
          : `${data.stats.milestonesCompleted}/${data.stats.milestonesTotal}`,
      icon: Flag,
    },
  ];

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Milestones</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Break goals into checkpoints that guide your actions.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="border-border bg-card">
              <CardContent className="flex items-center gap-3 p-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#38BDF8]/10">
                  <Icon className="h-4 w-4 text-[#38BDF8]" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-lg font-semibold">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {data.goals.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="flex flex-col items-center px-6 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
              <Map className="h-7 w-7 text-muted-foreground" />
            </div>
            <h2 className="mt-5 text-xl font-semibold">No goals yet</h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Create a goal first, then add milestones to map your progress.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {data.goals.map((goal) => (
            <GoalMilestonesCard
              key={goal.id}
              goal={goal}
              onAddMilestone={setAddMilestoneGoalId}
            />
          ))}
        </div>
      )}

      {addMilestoneGoalId ? (
        <AddMilestoneDialog
          open={Boolean(addMilestoneGoalId)}
          onOpenChange={(open) => {
            if (!open) setAddMilestoneGoalId(null);
          }}
          goalId={addMilestoneGoalId}
          goalTitle={
            data.goals.find((goal) => goal.id === addMilestoneGoalId)?.title ??
            "Goal"
          }
        />
      ) : null}
    </div>
  );
}
