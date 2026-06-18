"use client";

import type { AnalyticsPageData } from "@/features/analytics/types";
import { useOsPermissions } from "@/features/os/components/os-permissions-provider";
import { useState } from "react";
import { Share2 } from "lucide-react";
import { ActionDistributionChart } from "@/components/dashboard/action-distribution-chart";
import { GrowthBarChart } from "@/components/dashboard/growth-bar-chart";
import {
  analyticsMetricDisplay,
  formatProgressDisplay,
} from "@/lib/progress/display";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

const tabs = ["Overview", "Trends", "Forecasts", "Reports"] as const;

export function AnalyticsOverview({ data }: { data: AnalyticsPageData }) {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Overview");
  const { analytics: analyticsPermissions } = useOsPermissions();

  const totalActions = data.actionDistribution.reduce((s, d) => s + d.value, 0);
  const hasRealData = analyticsPermissions.hasRealData;
  const hasMilestones = data.stats.milestoneCount > 0;
  const hasActions = totalActions > 0 || data.stats.actionCount > 0;
  const hasEnoughForGoalMetrics = hasRealData && hasMilestones && hasActions;
  const hasFocus = hasRealData && data.stats.focusHours > 0;
  const hasVault = hasRealData && data.stats.totalVaultEntries > 0;
  const hasVaultTrend = data.stats.vaultEntriesThisWeek > 0 && data.metrics.vaultGrowth !== 0;

  const kpis = [
    {
      label: "Vision Health",
      value: formatProgressDisplay(
        analyticsMetricDisplay(data.metrics.visionAlignment, hasEnoughForGoalMetrics)
      ),
      sub: hasEnoughForGoalMetrics
        ? "Connected goal progress"
        : "Collecting data",
    },
    {
      label: "Goal Progress",
      value: formatProgressDisplay(
        analyticsMetricDisplay(data.metrics.goalProgress, hasEnoughForGoalMetrics)
      ),
      sub: hasEnoughForGoalMetrics
        ? `${data.stats.goalsOnTrack} goals on track`
        : "Metrics unlock as activity grows",
    },
    {
      label: "Execution Rate",
      value: formatProgressDisplay(
        analyticsMetricDisplay(data.metrics.executionScore, hasActions && hasRealData)
      ),
      sub: hasActions && hasRealData ? "Completed vs planned actions" : "Collecting data",
    },
    {
      label: "Deep Work",
      value: hasFocus ? `${data.metrics.deepWorkHours}h` : "Collecting data",
      sub: hasFocus
        ? `${formatProgressDisplay(analyticsMetricDisplay(data.metrics.focusQuality, hasFocus))} focus quality`
        : "Metrics unlock as activity grows",
    },
    {
      label: "Focus Quality",
      value: formatProgressDisplay(
        analyticsMetricDisplay(data.metrics.focusQuality, hasFocus)
      ),
      sub: hasFocus ? "Weekly session average" : "Collecting data",
    },
    {
      label: "Vault Growth",
      value: hasVault
        ? hasVaultTrend
          ? `${data.metrics.vaultGrowth > 0 ? "+" : ""}${data.metrics.vaultGrowth}%`
          : `${data.stats.totalVaultEntries} entries`
        : "Collecting data",
      sub: hasVault
        ? `${data.stats.vaultEntriesThisWeek} entries this week`
        : "Ready for entries",
    },
  ];

  const pillars = data.systemStability.map((s) => ({
    label: s.label,
    value: s.value,
  }));

  const distributionLegend = data.actionDistribution.map((d, i) => ({
    label: d.label,
    value: totalActions > 0 ? `${Math.round((d.value / totalActions) * 100)}%` : "0%",
    color: ["bg-primary", "bg-chart-2", "bg-chart-3"][i] ?? "bg-primary",
  }));

  const executiveStats = [
    { label: "Actions", value: String(totalActions) },
    { label: "Focus", value: `${data.stats.focusHours}h` },
    { label: "Goals", value: String(data.stats.goalsOnTrack) },
    {
      label: "Velocity",
      value: data.stats.executionVelocity >= 50 ? "High" : "Low",
    },
  ];

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Measure progress. Understand patterns. Improve execution.
          </p>
          <div className="mt-4 flex gap-6 border-b border-border">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "pb-2 text-sm font-medium transition-colors",
                  activeTab === tab
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" className="rounded-full">
            <Share2 className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="border-border bg-card">
            <CardContent className="p-4">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {kpi.label}
              </p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-bold">{kpi.value}</span>
              </div>
              <p className="mt-1 text-[10px] text-muted-foreground">{kpi.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Growth + Pillars */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-border bg-card lg:col-span-2">
          <CardContent className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold">Growth Overview</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Weekly goal progress trend
                </p>
              </div>
              <div className="text-right">
                <p className={cn(
                  "text-3xl font-bold",
                  hasEnoughForGoalMetrics ? "text-primary" : "text-muted-foreground text-lg"
                )}>
                  {formatProgressDisplay(
                    analyticsMetricDisplay(data.metrics.goalProgress, hasEnoughForGoalMetrics)
                  )}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  Overall Goal Progress
                </p>
              </div>
            </div>
            <div className="mt-4">
              {hasEnoughForGoalMetrics ? (
                <GrowthBarChart data={data.growthTrend} />
              ) : (
                <div className="flex h-32 items-center justify-center rounded-lg border border-dashed border-border bg-surface/30">
                  <p className="text-xs text-muted-foreground">
                    Collecting data — metrics unlock as activity grows
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold">Pillar Breakdown</h3>
            <div className="mt-4 space-y-4">
              {pillars.map((pillar) => {
                const pillarHasData =
                  (pillar.label === "Vision" || pillar.label === "Goals")
                    ? hasEnoughForGoalMetrics
                    : pillar.label === "Execution"
                      ? hasActions
                      : pillar.label === "Focus"
                        ? hasFocus
                        : hasVault;
                return (
                  <div key={pillar.label}>
                    <div className="flex justify-between text-xs">
                      <span>{pillar.label}</span>
                      <span className={pillarHasData ? "text-primary" : "text-muted-foreground"}>
                        {pillarHasData ? `${pillar.value}%` : "Collecting data"}
                      </span>
                    </div>
                    {pillarHasData && (
                      <Progress value={pillar.value} className="mt-1.5" />
                    )}
                    {!pillarHasData && (
                      <div className="mt-1.5 h-1.5 rounded-full bg-muted" />
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Distribution + Deep Work */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold">Action Distribution</h3>
            <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:justify-around">
              <ActionDistributionChart data={data.actionDistribution} />
              <div className="space-y-2">
                {distributionLegend.map((item) => (
                  <div key={item.label} className="flex items-center gap-2 text-xs">
                    <span className={cn("h-2 w-2 rounded-full", item.color)} />
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Deep Work Analysis</h3>
              {hasFocus && (
                <Badge
                  variant="outline"
                  className="border-primary/30 bg-primary/10 text-[10px] text-primary"
                >
                  {data.stats.focusHours}h this week
                </Badge>
              )}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div>
                <p className="text-[10px] text-muted-foreground">Best Window</p>
                <p className="text-sm font-semibold">
                  {hasFocus ? (data.deepWork.bestWindow ?? "—") : "—"}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Avg Session</p>
                <p className="text-sm font-semibold">
                  {hasFocus ? `${data.deepWork.avgSessionMinutes}m` : "—"}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">Quality</p>
                <p className={cn("text-sm font-semibold", hasFocus ? "text-primary" : "text-muted-foreground")}>
                  {hasFocus ? `${data.metrics.focusQuality}%` : "—"}
                </p>
              </div>
            </div>
            <div className="mt-5">
              <p className="text-[10px] font-medium text-muted-foreground">
                Focus Consistency
              </p>
              <div className="mt-2 grid grid-cols-7 gap-1">
                {data.focusConsistency.map((day) => (
                  <div key={day.date} className="text-center">
                    <div
                      className="mx-auto h-8 w-full max-w-[2rem] rounded-md bg-primary/20"
                      style={{
                        opacity: Math.max(0.15, day.score / 100),
                      }}
                    />
                    <p className="mt-1 text-[9px] text-muted-foreground">
                      {day.date}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goal Health + Vault Growth */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <h3 className="mb-4 text-sm font-semibold">Goal Health</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Health</TableHead>
                  <TableHead className="w-[120px]">Progress</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.goalHealth.length > 0 ? (
                  data.goalHealth.map((goal) => (
                    <TableRow key={goal.id}>
                      <TableCell className="text-sm font-medium">
                        {goal.title}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-primary border-primary/30 bg-primary/10">
                          {goal.status}
                        </Badge>
                      </TableCell>
                      <TableCell className={goal.progress > 0 ? "text-primary" : "text-muted-foreground"}>
                        {hasMilestones ? `${goal.progress}%` : "—"}
                      </TableCell>
                      <TableCell>
                        {hasMilestones && <Progress value={goal.progress} />}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                      No system data yet. Add goals and actions to populate analytics.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold">Vault Growth</h3>
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div>
                <p className="text-[10px] text-muted-foreground">Total Entries</p>
                <p className="text-xl font-bold">{data.stats.totalVaultEntries}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">
                  Knowledge Alignment
                </p>
                <p className="text-xl font-bold text-primary">
                  {data.stats.knowledgeAlignment}%
                </p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground">
                  Weekly Growth
                </p>
                <p className="text-xl font-bold">{data.metrics.vaultGrowth}%</p>
              </div>
            </div>
            <div className="mt-5 rounded-lg border border-border bg-surface p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Insight
              </p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {data.insights[0] ??
                  "Create vault entries and link them to goals to strengthen knowledge alignment."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Summary */}
      <Card className="border-border bg-card">
        <CardContent className="p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:justify-between">
            <div className="flex-1">
              <h3 className="text-sm font-semibold">System Summary</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {data.insights[0] ??
                  "Start building your strategic system: create goals, add milestones, link actions, and run focus sessions to see analytics here."}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:gap-6">
              {executiveStats.map((stat) => (
                <div key={stat.label} className="text-center lg:text-right">
                  <p className="text-[10px] text-muted-foreground">
                    {stat.label}
                  </p>
                  <p className="mt-1 text-lg font-bold">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
