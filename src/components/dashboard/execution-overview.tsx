"use client";

import type { ExecutionPageData } from "@/features/execution/types";
import Link from "next/link";
import { Plus, Zap } from "lucide-react";
import { ProgressRing } from "@/components/dashboard/progress-ring";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  executionScoreDisplay,
  formatProgressDisplay,
  progressBarValue,
  showProgressBar,
} from "@/lib/progress/display";
import { cn } from "@/lib/utils";

function formatMinutes(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function formatPriority(priority: string) {
  return `${priority.charAt(0).toUpperCase()}${priority.slice(1)} Priority`;
}

function KanbanCard({
  title,
  energy,
  time,
  impact,
  done,
  className,
}: {
  title: string;
  energy?: string;
  time?: string;
  impact?: string;
  done?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-surface p-3",
        className
      )}
    >
      <p className="text-sm font-medium">{title}</p>
      {energy && (
        <Badge variant="outline" className="mt-2 text-[9px]">
          {energy}
        </Badge>
      )}
      {time && (
        <p className="mt-2 text-[10px] text-muted-foreground">{time}</p>
      )}
      {impact && (
        <Badge
          variant="outline"
          className="mt-2 border-destructive/30 bg-destructive/10 text-[9px] text-destructive"
        >
          Impact: {impact}
        </Badge>
      )}
      {done && (
        <Badge
          variant="secondary"
          className="mt-2 bg-chart-3/10 text-[9px] text-chart-3"
        >
          Done
        </Badge>
      )}
    </div>
  );
}

function KanbanColumn({
  title,
  count,
  children,
  addLabel,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
  addLabel?: string;
}) {
  return (
    <div className="flex flex-col rounded-xl border border-border bg-card/50 p-3">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {title} ({count})
      </p>
      <div className="mt-3 flex flex-1 flex-col gap-2">{children}</div>
      {addLabel && (
        <button
          type="button"
          className="mt-3 flex items-center gap-1 text-[10px] text-muted-foreground transition-colors hover:text-primary"
        >
          <Plus className="h-3 w-3" />
          {addLabel}
        </button>
      )}
    </div>
  );
}

export function ExecutionOverview({ data }: { data: ExecutionPageData }) {
  const executionDisplay = executionScoreDisplay(
    data.stats.executionScore,
    data.stats.totalActions
  );

  const stats: {
    label: string;
    value: string;
    meta?: string;
    sub?: string | null;
    showTrend?: boolean;
    progress?: number;
  }[] = [
    {
      label: "Execution Score",
      value: formatProgressDisplay(executionDisplay),
      sub:
        data.stats.totalActions === 0
          ? "Create your first action"
          : "Based on completed actions",
      showTrend: false,
    },
    {
      label: "Active Actions",
      value: String(data.stats.activeActions),
      meta: `${data.stats.highImpactActions} high impact`,
      sub: null,
      progress:
        data.stats.activeActions > 0
          ? Math.round(
              (data.stats.highImpactActions / data.stats.activeActions) * 100
            )
          : 0,
    },
    {
      label: "Deep Work Planned",
      value: formatMinutes(data.stats.deepWorkMinutes),
      sub: `${data.stats.sessionsToday} sessions today`,
    },
    {
      label: "Goal Alignment",
      value:
        data.stats.totalActions > 0
          ? `${data.stats.alignmentScore}%`
          : "Ready for execution",
      sub: "Vision synergy",
    },
  ];

  const plannedActions = data.planned.map((a) => ({
    title: a.title,
    energy: formatPriority(a.priority),
    time: formatMinutes(a.estimatedMinutes),
  }));

  const executedActions = data.executed.map((a) => ({
    title: a.title,
    time: a.completedAt
      ? `Done · ${new Date(a.completedAt).toLocaleTimeString()}`
      : "Done",
  }));

  const inProgressActions = data.inProgress.map((a) => ({
    title: a.title,
    energy: formatPriority(a.priority),
    time: formatMinutes(a.estimatedMinutes),
    impact: a.priority === "high" || a.priority === "critical" ? "High Impact" : undefined,
  }));

  const alignmentAreas = data.alignmentAreas;
  const timeline = data.timeline;
  const mission = data.mission;

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Execution</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Turn strategy into focused daily progress.
          </p>
        </div>
        <Button className="shrink-0 rounded-full">
          <Plus className="mr-2 h-4 w-4" />
          New Action
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-border bg-card">
            <CardContent className="p-4">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {stat.label}
              </p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold">{stat.value}</span>
                {stat.meta != null && stat.meta !== "" && (
                  <span
                    className={cn(
                      "text-xs",
                      stat.showTrend ? "text-chart-3" : "text-muted-foreground"
                    )}
                  >
                    {stat.showTrend ? stat.meta : `/ ${stat.meta}`}
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

      {/* Today's Mission */}
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
                {mission?.title ?? "No mission set"}
              </h2>
              {mission && (
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-border bg-surface px-3 py-2">
                    <p className="text-[10px] text-muted-foreground">Priority</p>
                    <p className="text-xs font-medium capitalize">{mission.priority}</p>
                  </div>
                  <div className="rounded-lg border border-border bg-surface px-3 py-2">
                    <p className="text-[10px] text-muted-foreground">Status</p>
                    <p className="text-xs font-medium capitalize">{mission.status.replace("_", " ")}</p>
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
              <p className="mt-3 text-xs font-medium text-chart-3">
                Today&apos;s Execution: On Track
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Pipeline */}
      <div>
        <h3 className="mb-3 text-sm font-semibold">Action Pipeline</h3>
        <div className="grid gap-3 lg:grid-cols-3">
          <KanbanColumn
            title="Planned"
            count={plannedActions.length}
            addLabel="Add Planned"
          >
            {plannedActions.map((action) => (
              <KanbanCard key={action.title} {...action} />
            ))}
          </KanbanColumn>
          <KanbanColumn title="In Progress" count={inProgressActions.length}>
            {inProgressActions.map((action) => (
              <KanbanCard key={action.title} {...action} />
            ))}
          </KanbanColumn>
          <KanbanColumn title="Executed" count={executedActions.length}>
            {executedActions.map((action) => (
              <KanbanCard
                key={action.title}
                title={action.title}
                time={action.time}
                done
              />
            ))}
          </KanbanColumn>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold">Today Timeline</h3>
            <div className="mt-4 space-y-4">
              {timeline.map((block) => (
                <div
                  key={block.time}
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
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold">Execution Alignment</h3>
            <div className="mt-4 space-y-4">
              {alignmentAreas.map((area) => (
                <div key={area.label}>
                  <div className="flex justify-between text-xs">
                    <span>{area.label}</span>
                    <span className="text-primary">{area.value}%</span>
                  </div>
                  <Progress value={area.value} className="mt-1.5" />
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-lg border border-border bg-surface p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Strategic Note
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Career development is well-funded this week. Consider allocating
                30 minutes to Physical Health to prevent burnout before your
                Friday deep work block.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
