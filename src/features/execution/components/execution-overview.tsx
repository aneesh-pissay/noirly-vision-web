"use client";

import { useState } from "react";
import Link from "next/link";
import { Lock, Plus, Zap } from "lucide-react";
import { ActionFormDialog } from "@/features/execution/components/action-form-dialog";
import { ActionPipeline } from "@/features/execution/components/action-pipeline";
import { useOsPermissions } from "@/features/os/components/os-permissions-provider";
import type { ExecutionPageData } from "@/features/execution/types";
import { ProgressRing } from "@/components/dashboard/progress-ring";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  executionScoreDisplay,
  formatProgressDisplay,
  progressBarValue,
  showProgressBar,
} from "@/lib/progress/display";

function formatMinutes(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export function ExecutionOverview({ data }: { data: ExecutionPageData }) {
  const [formOpen, setFormOpen] = useState(false);
  const { execution } = useOsPermissions();

  const executionDisplay = executionScoreDisplay(
    data.stats.executionScore,
    data.stats.totalActions
  );

  const todaySub =
    data.stats.totalActions === 0
      ? "Create your first action from a milestone"
      : data.stats.plannedActionsToday === 0
        ? "No actions planned for today"
        : `${data.stats.completedActionsToday}/${data.stats.plannedActionsToday} completed today`;

  const alignmentSub =
    data.stats.totalActions === 0
      ? "Waiting for milestone actions"
      : "Actions linked to goals";

  const stats = [
    {
      label: "Execution Score",
      value: formatProgressDisplay(executionDisplay),
      sub: todaySub,
    },
    {
      label: "Active Actions",
      value:
        data.stats.activeActions > 0
          ? String(data.stats.activeActions)
          : "No active actions",
      meta:
        data.stats.activeActions > 0
          ? `${data.stats.highImpactActions} high impact`
          : undefined,
      progress:
        data.stats.activeActions > 0
          ? Math.round(
              (data.stats.highImpactActions / data.stats.activeActions) * 100
            )
          : undefined,
    },
    {
      label: "Deep Work Planned",
      value:
        data.stats.deepWorkMinutes > 0
          ? formatMinutes(data.stats.deepWorkMinutes)
          : "—",
      sub:
        data.stats.sessionsToday > 0
          ? `${data.stats.sessionsToday} focus sessions today`
          : "Start first focus session",
    },
    {
      label: "Goal Alignment",
      value:
        data.stats.totalActions > 0
          ? `${data.stats.alignmentScore}%`
          : "Ready for execution",
      sub: alignmentSub,
    },
  ];

  const mission = data.mission;
  const executionLabel =
    data.stats.totalActions === 0
      ? "Ready for execution"
      : data.stats.todayMomentum !== null && data.stats.todayMomentum >= 75
        ? "On Track"
        : data.stats.todayMomentum !== null && data.stats.todayMomentum >= 40
          ? "Building Momentum"
          : "Needs Focus";

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Execution</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Turn strategy into focused daily progress.
          </p>
        </div>
        <Button
          className="shrink-0 rounded-full"
          onClick={() => setFormOpen(true)}
          disabled={!execution.unlocked}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Action
        </Button>
      </div>

      {!execution.unlocked && (
        <Card className="border-border bg-card">
          <CardContent className="flex flex-col items-center px-6 py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
              <Lock className="h-7 w-7 text-muted-foreground" />
            </div>
            <h2 className="mt-5 text-lg font-semibold">{execution.title}</h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              {execution.message}
            </p>
            {execution.ctaHref && execution.ctaLabel && (
              <Button asChild className="mt-6 rounded-full">
                <Link href={execution.ctaHref}>{execution.ctaLabel}</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-border bg-card">
            <CardContent className="p-4">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {stat.label}
              </p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold">{stat.value}</span>
                {stat.meta != null && (
                  <span className="text-xs text-muted-foreground">
                    / {stat.meta}
                  </span>
                )}
              </div>
              {stat.progress !== undefined && (
                <Progress value={stat.progress} className="mt-2" />
              )}
              {stat.sub && (
                <p className="mt-1 text-[10px] text-muted-foreground">
                  {stat.sub}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border bg-card">
        <CardContent className="p-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <div>
              <Badge
                variant="outline"
                className="border-primary/40 bg-primary/10 text-primary"
              >
                Today&apos;s Mission
              </Badge>
              <h2 className="mt-4 text-xl font-semibold">
                {mission?.title ?? "Create your first action"}
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                {mission
                  ? "Highest priority active action in your pipeline."
                  : "Add an action to execution to set today's mission."}
              </p>
              {mission && (
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-border bg-surface px-3 py-2">
                    <p className="text-[10px] text-muted-foreground">Priority</p>
                    <p className="text-xs font-medium capitalize">
                      {mission.priority}
                    </p>
                  </div>
                  <div className="rounded-lg border border-border bg-surface px-3 py-2">
                    <p className="text-[10px] text-muted-foreground">Status</p>
                    <p className="text-xs font-medium capitalize">
                      {mission.status.replace("_", " ")}
                    </p>
                  </div>
                </div>
              )}
              {mission && (
                <Button asChild className="mt-5 w-full rounded-full sm:w-auto">
                  <Link href="/dashboard/focus">
                    <Zap className="mr-2 h-4 w-4" />
                    Enter Focus
                  </Link>
                </Button>
              )}
            </div>
            <div className="flex flex-col items-center justify-center border-t border-border pt-6 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
              {showProgressBar(executionDisplay) ? (
                <ProgressRing
                  value={progressBarValue(executionDisplay)}
                  label="Progress"
                />
              ) : (
                <div className="flex h-28 w-28 items-center justify-center rounded-full border border-dashed border-border text-center">
                  <p className="px-3 text-xs text-muted-foreground">
                    {formatProgressDisplay(executionDisplay)}
                  </p>
                </div>
              )}
              <p
                className={cn(
                  "mt-3 text-xs font-medium",
                  data.stats.todayMomentum !== null && data.stats.todayMomentum >= 75
                    ? "text-chart-3"
                    : "text-muted-foreground"
                )}
              >
                Today&apos;s Momentum: {executionLabel}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <ActionPipeline
        planned={data.planned}
        inProgress={data.inProgress}
        executed={data.executed}
        onAddPlanned={() => setFormOpen(true)}
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold">Today Timeline</h3>
            <div className="mt-4 space-y-4">
              {data.timeline.length > 0 ? (
                data.timeline.map((block) => (
                  <div
                    key={block.id}
                    className={cn(
                      "rounded-lg border p-4",
                      block.active
                        ? "border-primary/30 bg-primary/5"
                        : "border-border bg-surface"
                    )}
                  >
                    <p className="text-[10px] text-muted-foreground">
                      {block.time}
                    </p>
                    <p className="mt-1 text-sm font-medium">{block.title}</p>
                    {block.badge && (
                      <Badge
                        variant="outline"
                        className="mt-2 border-chart-4/30 bg-chart-4/10 text-[9px] text-chart-4"
                      >
                        {block.badge}
                      </Badge>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground">
                  No actions in progress. Drag a planned action to In Progress.
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold">Execution Alignment</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Share of actions connected to active goals.
            </p>
            <div className="mt-4 space-y-4">
              {data.alignmentAreas.length > 0 ? (
                data.alignmentAreas.map((area) => (
                  <div key={area.label}>
                    <div className="flex justify-between text-xs">
                      <span>{area.label}</span>
                      <span className="text-primary">
                        {area.value}% · {area.actionCount} action
                        {area.actionCount === 1 ? "" : "s"}
                      </span>
                    </div>
                    <Progress value={area.value} className="mt-1.5" />
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground">
                  Link actions to goals when creating them to improve alignment.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <ActionFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        goalOptions={data.goalOptions}
      />
    </div>
  );
}
