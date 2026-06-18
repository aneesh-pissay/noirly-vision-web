"use client";

import {
  Activity,
  ArrowUpRight,
  Clock,
  LineChart,
  Target,
  Zap,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const insights = [
  {
    icon: Target,
    title: "Strongest Area",
    highlight: "System Design Focus",
    description: "94% adherence to planned system design sessions this month.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: Clock,
    title: "Execution Pattern",
    highlight: "Morning Peak",
    description: "80% of high-impact tasks completed before 12:00 PM.",
    color: "text-chart-4",
    bg: "bg-chart-4/10",
  },
  {
    icon: Activity,
    title: "Improvement Area",
    highlight: "Physical Health",
    description: "Workout frequency dropped 22% compared to last month.",
    color: "text-destructive",
    bg: "bg-destructive/10",
  },
  {
    icon: Zap,
    title: "Next Adjustment",
    highlight: "Deep Work Expansion",
    description:
      "Extend morning focus window by 30 minutes to capture peak cognitive hours.",
    color: "text-chart-3",
    bg: "bg-chart-3/10",
  },
];

export function AnalyticsRightPanel() {
  return (
    <aside className="hidden w-72 shrink-0 flex-col gap-4 overflow-y-auto border-l border-border bg-background p-4 xl:flex">
      <h2 className="text-sm font-semibold">Growth Insights</h2>

      {insights.map((insight) => (
        <Card key={insight.title} className="border-border bg-card">
          <CardContent className="flex gap-3 p-4">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${insight.bg}`}
            >
              <insight.icon className={`h-4 w-4 ${insight.color}`} />
            </div>
            <div>
              <p className="text-xs font-medium">{insight.title}</p>
              <p className={`mt-0.5 text-xs font-semibold ${insight.color}`}>
                {insight.highlight}
              </p>
              <p className="mt-1 text-[10px] leading-relaxed text-muted-foreground">
                {insight.description}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}

      <Card className="border-border bg-card">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <LineChart className="h-4 w-4 text-primary" />
            <p className="text-xs font-medium">Trend Projection</p>
          </div>
          <p className="mt-2 text-sm font-semibold text-primary">
            Predicting Q3 Alignment
          </p>
          <p className="mt-1 text-[10px] text-muted-foreground">
            Based on current velocity, you&apos;re on track for 88% vision
            alignment by September.
          </p>
          <div className="mt-3 flex h-16 items-end gap-1">
            {[40, 55, 48, 62, 70, 75, 82, 88].map((h, i) => (
              <div
                key={i}
                className="flex-1 rounded-t bg-primary/60"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
          <button
            type="button"
            className="mt-3 flex items-center gap-1 text-[10px] text-primary hover:underline"
          >
            View Forecast
            <ArrowUpRight className="h-3 w-3" />
          </button>
        </CardContent>
      </Card>
    </aside>
  );
}
