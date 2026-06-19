"use client";

import Link from "next/link";
import { Crosshair, Plus } from "lucide-react";
import { FocusAnalyticsChart } from "@/components/dashboard/focus-analytics-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const visionMilestones = [
  { label: "Cloud Architecture", progress: 80 },
  { label: "System Design", progress: 45 },
  { label: "Open Source Contribution", progress: 20 },
];

const improvedAreas = ["ENGINEERING", "FOCUS DURATION", "LEARNING"];

export function DashboardOverview() {
  return (
    <div className="relative space-y-5 pb-20">
      {/* Vision Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Your Vision</h1>
          <p className="mt-1 text-sm text-primary">
            Become a World Class Engineer
          </p>
          <div className="mt-3 flex items-center gap-3">
            <Progress value={75} className="w-48" />
            <span className="text-xs text-muted-foreground">
              75% aligned this week
            </span>
          </div>
        </div>

        <Card className="shrink-0 border-border bg-card px-5 py-4">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Action Score
          </p>
          <p className="mt-1 text-3xl font-bold text-primary">84%</p>
          <Progress value={84} className="mt-2 w-28" />
          <p className="mt-1.5 text-[10px] text-muted-foreground">
            Based on focus sessions &amp; tasks
          </p>
        </Card>
      </div>

      {/* Middle Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border bg-card">
          <CardContent className="flex flex-col p-6">
            <Badge
              variant="secondary"
              className="w-fit rounded-full bg-primary/10 text-primary"
            >
              Today&apos;s Mission
            </Badge>
            <div className="mt-6 flex flex-1 flex-col items-center justify-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Crosshair className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">Build payment system</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Impact: Career Growth +3%
              </p>
            </div>
            <Button className="mt-6 w-full rounded-full">Enter Focus</Button>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Vision: Elite Software Engineer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {visionMilestones.map((milestone) => (
              <div key={milestone.label}>
                <div className="flex items-center justify-between text-xs">
                  <span>{milestone.label}</span>
                  <span className="text-primary">{milestone.progress}%</span>
                </div>
                <Progress value={milestone.progress} className="mt-1.5" />
              </div>
            ))}
            <div className="border-t border-border pt-4">
              <p className="text-xs text-muted-foreground">
                Overall Milestone Progress
              </p>
              <p className="text-2xl font-bold text-primary">75%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border bg-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Focus Analytics</CardTitle>
            <Badge variant="outline" className="text-[10px]">
              This Week
            </Badge>
          </CardHeader>
          <CardContent>
            <FocusAnalyticsChart />
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
                  Deep Work
                </p>
                <p className="text-xl font-bold">18h 40m</p>
              </div>
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Completed
                </p>
                <p className="text-xl font-bold">34 actions</p>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                Improved Areas
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {improvedAreas.map((area) => (
                  <Badge
                    key={area}
                    variant="secondary"
                    className="rounded-full bg-primary/10 text-[10px] text-primary"
                  >
                    {area}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="border-t border-border pt-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Planning Accuracy</span>
                <span className="font-medium text-primary">92%</span>
              </div>
              <Progress value={92} className="mt-1.5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions Timeline */}
      <Card className="border-border bg-card">
        <CardContent className="flex items-center justify-between p-4">
          <p className="text-sm font-medium">Actions Timeline</p>
          <Link
            href="/dashboard/calendar"
            className="text-xs text-primary hover:underline"
          >
            View Full Calendar
          </Link>
        </CardContent>
      </Card>

      {/* FAB */}
      <Button
        size="icon"
        className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-xl shadow-lg noirly-glow"
      >
        <Plus className="h-5 w-5" />
      </Button>
    </div>
  );
}
