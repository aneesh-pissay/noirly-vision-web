"use client";

import { Clock, Plus, TrendingUp, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ExecutionRightPanel() {
  return (
    <aside className="relative hidden w-72 shrink-0 flex-col gap-4 overflow-y-auto border-l border-border bg-background p-4 pb-20 xl:flex">
      <h2 className="text-sm font-semibold">Execution Insights</h2>

      <Card className="border-border bg-card">
        <CardContent className="flex gap-3 p-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-chart-3/10">
            <TrendingUp className="h-4 w-4 text-chart-3" />
          </div>
          <div>
            <p className="text-xs font-medium">Momentum</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              You maintained focused execution 4 days this week.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardContent className="flex gap-3 p-4">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Clock className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-xs font-medium">Peak Window</p>
            <p className="mt-1 text-lg font-bold text-primary">9 AM – 11 AM</p>
            <p className="text-[10px] text-muted-foreground">
              Work quality is 40% higher during this window.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardContent className="p-4">
          <p className="text-[10px] text-muted-foreground">Planning Accuracy</p>
          <p className="mt-1 text-2xl font-bold text-primary">92%</p>
          <p className="mt-1 text-[10px] text-muted-foreground">
            Task estimates have stabilized.
          </p>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center gap-2 pb-2 pt-4">
          <Zap className="h-4 w-4 text-chart-4" />
          <CardTitle className="text-sm font-medium">Optimization</CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <p className="text-xs leading-relaxed text-muted-foreground">
            Reduce 2 low-impact actions from your pipeline to free 90 minutes
            for high-friction deep work.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4 w-full rounded-full border-primary/30 text-xs"
          >
            Apply Suggestions
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardContent className="p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Strategic Calibration
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Review weekly alignment before Friday planning session.
          </p>
        </CardContent>
      </Card>

      <Button
        size="icon"
        className="absolute bottom-6 right-6 h-11 w-11 rounded-xl shadow-lg noirly-glow"
      >
        <Plus className="h-5 w-5" />
      </Button>
    </aside>
  );
}
