"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GoalRoadmapSection } from "@/features/goals/components/goal-roadmap-section";
import type { VisionView } from "@/features/vision/types";

type VisionInsightsProps = {
  vision: VisionView;
};

export function VisionInsights({ vision }: VisionInsightsProps) {
  const metrics = vision.performanceMetrics;

  const performanceCards = [
    {
      label: "Connected Goals",
      value: String(metrics.connectedGoals),
      sub:
        metrics.connectedGoals === 0
          ? "No connected goals"
          : metrics.connectedGoals === 1
            ? "Active goal"
            : "Active goals",
    },
    {
      label: "Milestones",
      value: `${metrics.completedMilestones}/${metrics.totalMilestones || 0}`,
      sub:
        metrics.totalMilestones === 0
          ? "No milestones yet"
          : "Completed / total",
    },
    {
      label: "Actions Completed",
      value: `${metrics.completedActions}/${metrics.totalMilestones === 0 ? 0 : metrics.totalActions}`,
      sub:
        metrics.totalMilestones === 0
          ? "No milestone actions yet"
          : metrics.totalActions === 0
            ? "No actions linked yet"
            : "Executed / milestone-linked",
    },
    {
      label: "Focus Invested",
      value: `${metrics.focusHours}h`,
      sub: "Deep work logged",
    },
  ];

  return (
    <Card className="border-border bg-card">
      <CardContent className="p-6">
        <h3 className="text-sm font-semibold">Vision Progress</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Action metrics across goals connected to this vision.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {performanceCards.map((stat) => (
            <div
              key={stat.label}
              className="rounded-xl border border-border bg-surface p-4"
            >
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {stat.label}
              </p>
              <p className="mt-2 text-2xl font-bold">{stat.value}</p>
              <p className="mt-1 text-xs text-muted-foreground">{stat.sub}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 space-y-6">
          {vision.goalRoadmaps.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-surface/40 px-5 py-8 text-center">
              <p className="text-sm font-medium">No connected goals yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Link goals to this vision to build a roadmap.
              </p>
              <Button asChild className="mt-4 rounded-full">
                <Link href="/dashboard/goals">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Goal
                </Link>
              </Button>
            </div>
          ) : (
            vision.goalRoadmaps.map((goal) => (
              <GoalRoadmapSection
                key={goal.id}
                goalTitle={goal.title}
                goalProgress={goal.progress}
                milestones={goal.milestones.map((milestone) => ({
                  id: milestone.id,
                  title: milestone.title,
                  completedActions: milestone.completedActions,
                  totalActions: milestone.totalActions,
                  progress: milestone.progress,
                  completed: milestone.completed,
                }))}
                emptyState={
                  <div className="mt-4 rounded-lg border border-dashed border-border px-4 py-5 text-center">
                    <p className="text-sm text-muted-foreground">
                      No milestones created yet
                    </p>
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="mt-3 rounded-full"
                    >
                      <Link href="/dashboard/goals">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Milestone
                      </Link>
                    </Button>
                  </div>
                }
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
