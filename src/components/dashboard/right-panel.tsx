"use client";

import { Calendar, Lightbulb, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const activeGoals = [
  { name: "Cloud Mastery", progress: 80 },
  { name: "Physical Health", progress: 40 },
];

const insights = [
  {
    icon: Lightbulb,
    title: "Peak Performance",
    description: "Your strongest execution window: 9 AM – 11 AM",
    color: "text-chart-4",
    bg: "bg-chart-4/10",
  },
  {
    icon: Calendar,
    title: "Consistency",
    description: "Plan executed 5/7 days this week",
    color: "text-chart-3",
    bg: "bg-chart-3/10",
  },
];

export function DashboardRightPanel() {
  return (
    <aside className="hidden w-72 shrink-0 flex-col gap-4 overflow-y-auto border-l border-border bg-background p-4 xl:flex">
      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-3 pt-4">
          <CardTitle className="text-sm font-medium">Active Goals</CardTitle>
          <Button variant="ghost" size="icon" className="h-7 w-7">
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4 pb-4">
          {activeGoals.map((goal) => (
            <div key={goal.name}>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{goal.name}</span>
                <span className="font-medium text-primary">{goal.progress}%</span>
              </div>
              <Progress value={goal.progress} className="mt-1.5" />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="pb-3 pt-4">
          <CardTitle className="text-sm font-medium">Quick Notes</CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <textarea
            placeholder="Draft your thoughts..."
            className="min-h-[100px] w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <p className="mt-2 text-[10px] text-muted-foreground">
            Auto-saved 2m ago
          </p>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <p className="text-sm font-medium">Vision Insights</p>
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
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {insight.description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </aside>
  );
}
