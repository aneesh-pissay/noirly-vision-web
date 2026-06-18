"use client";

import Link from "next/link";
import { Crosshair, Target } from "lucide-react";
import type { DashboardPageData } from "@/features/dashboard/types";
import type { StrategicChainLink } from "@/lib/progress/lifecycle";
import { FocusAnalyticsChart } from "@/components/dashboard/focus-analytics-chart";
import {
  executionScoreDisplay,
  formatProgressDisplay,
  goalProgressDisplay,
  progressBarValue,
  showProgressBar,
  visionProgressDisplay,
} from "@/lib/progress/display";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

function StrategicChainRow({
  label,
  link,
  isLast = false,
}: {
  label: string;
  link: StrategicChainLink;
  isLast?: boolean;
}) {
  const isComplete = link.state === "complete";

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div
          className={cn(
            "h-2.5 w-2.5 rounded-full",
            isComplete
              ? "bg-primary"
              : "border border-muted-foreground/40 bg-transparent"
          )}
        />
        {!isLast && <div className="mt-1 w-px flex-1 bg-border" />}
      </div>
      <div className={cn("min-w-0 pb-4", isLast && "pb-0")}>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p
          className={cn(
            "mt-0.5 truncate text-sm font-medium",
            link.state === "waiting" && "text-muted-foreground",
            link.state === "next" && "text-primary"
          )}
        >
          {isComplete ? `✓ ${link.text}` : `○ ${link.text}`}
        </p>
      </div>
    </div>
  );
}

function executionCardSubtitle(data: DashboardPageData): string {
  if (!data.vision) {
    return "Create your vision to begin";
  }
  if (data.totalActions === 0 && data.milestoneCount === 0) {
    return "Build milestones before creating actions";
  }
  if (data.totalActions === 0) {
    return "Create your first action from a milestone";
  }
  return "Completed actions / total actions";
}

export function DashboardOverview({ data }: { data: DashboardPageData }) {
  const hasVision = Boolean(data.vision);
  const hasExecutableActions = data.totalActions > 0;

  const visionDisplay = data.vision
    ? visionProgressDisplay(data.vision.progress, true)
    : null;
  const executionDisplay = executionScoreDisplay(
    data.executionScore,
    data.totalActions,
    { hasVision, milestoneCount: data.milestoneCount }
  );
  const hasFocusData = data.focusSessionCount > 0;

  return (
    <div className="relative space-y-5 pb-20">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            What should I do now?
          </p>
          <Badge
            variant="outline"
            className="mt-3 border-primary/30 bg-primary/5 text-primary"
          >
            {data.lifecycle.statusLabel}
          </Badge>
        </div>

        <Card className="shrink-0 border-border bg-card px-5 py-4">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Execution Score
          </p>
          <p className="mt-1 text-3xl font-bold text-primary">
            {formatProgressDisplay(executionDisplay)}
          </p>
          {showProgressBar(executionDisplay) && (
            <Progress
              value={progressBarValue(executionDisplay)}
              className="mt-2 w-28"
            />
          )}
          <p className="mt-1.5 text-[10px] text-muted-foreground">
            {executionCardSubtitle(data)}
          </p>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Vision</CardTitle>
          </CardHeader>
          <CardContent>
            {data.vision ? (
              <div className="space-y-3">
                <div>
                  <p className="text-lg font-semibold">{data.vision.title}</p>
                  {data.vision.focusArea && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Focus area: {data.vision.focusArea}
                    </p>
                  )}
                </div>
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Vision progress</span>
                    <span className="text-primary">
                      {visionDisplay
                        ? formatProgressDisplay(visionDisplay)
                        : "Active"}
                    </span>
                  </div>
                  {visionDisplay && showProgressBar(visionDisplay) && (
                    <Progress
                      value={progressBarValue(visionDisplay)}
                      className="mt-1.5"
                    />
                  )}
                </div>
              </div>
            ) : (
              <div className="py-4 text-center">
                <p className="text-sm text-muted-foreground">No vision defined yet</p>
                <Button asChild variant="outline" size="sm" className="mt-3 rounded-full">
                  <Link href="/dashboard/vision">Create Vision</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="flex flex-col p-6">
            <Badge
              variant="secondary"
              className="w-fit rounded-full bg-primary/10 text-primary"
            >
              Today&apos;s Mission
            </Badge>
            {data.mission ? (
              <>
                <div className="mt-6 flex flex-1 flex-col items-center justify-center text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Crosshair className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">{data.mission.title}</h3>
                </div>
                <Button asChild className="mt-6 w-full rounded-full">
                  <Link href="/dashboard/focus">Start Focus</Link>
                </Button>
              </>
            ) : (
              <div className="mt-6 flex flex-1 flex-col items-center justify-center py-8 text-center">
                <p className="text-sm font-medium text-muted-foreground">
                  No mission available
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Build your strategy chain first
                </p>
                {hasExecutableActions && (
                  <Button asChild variant="outline" className="mt-4 rounded-full">
                    <Link href="/dashboard/execution">Choose Action</Link>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Target className="h-4 w-4 text-primary" />
              Strategic Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <StrategicChainRow label="Vision" link={data.strategicChain.vision} />
            <StrategicChainRow label="Goal" link={data.strategicChain.goal} />
            <StrategicChainRow
              label="Milestone"
              link={data.strategicChain.milestone}
            />
            <StrategicChainRow
              label="Action"
              link={data.strategicChain.action}
              isLast
            />
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Connected Goals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.goals.length > 0 ? (
              data.goals.map((goal) => {
                const progress = goalProgressDisplay(
                  goal.progress,
                  goal.milestoneCount
                );
                return (
                  <div key={goal.id}>
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="min-w-0 truncate">{goal.title}</span>
                      <span className="shrink-0 text-primary">
                        {formatProgressDisplay(progress)}
                      </span>
                    </div>
                    {showProgressBar(progress) && (
                      <Progress
                        value={progressBarValue(progress)}
                        className="mt-1.5"
                      />
                    )}
                  </div>
                );
              })
            ) : (
              <div className="py-4 text-center">
                <p className="text-sm text-muted-foreground">
                  {hasVision
                    ? "No goals connected yet"
                    : "Goals unlock after you create a vision"}
                </p>
                {hasVision && (
                  <Button asChild variant="outline" size="sm" className="mt-3 rounded-full">
                    <Link href="/dashboard/goals">Create your first goal</Link>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Focus Analytics</CardTitle>
            <Badge variant="outline" className="text-[10px]">
              This Week
            </Badge>
          </CardHeader>
          <CardContent>
            {hasFocusData ? (
              <FocusAnalyticsChart data={data.focusTrend} />
            ) : (
              <div className="flex flex-col items-center py-8 text-center">
                <p className="text-sm text-muted-foreground">No focus data yet</p>
                {hasExecutableActions && (
                  <Button asChild variant="outline" size="sm" className="mt-3 rounded-full">
                    <Link href="/dashboard/focus">Start a session</Link>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Weekly Review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Completed Actions
                </p>
                <p className="text-xl font-bold">{data.weeklyReview.completedActions}</p>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Focus Hours
                </p>
                <p className="text-xl font-bold">{data.weeklyReview.focusHours}h</p>
              </div>
            </div>
            {data.weeklyReview.progressChange ? (
              <p className="text-xs text-muted-foreground">
                {data.weeklyReview.progressChange}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Complete actions and focus sessions to track progress changes.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
