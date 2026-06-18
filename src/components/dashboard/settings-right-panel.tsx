"use client";

import { Sparkles } from "lucide-react";
import { useDashboardPanel } from "@/components/layout/dashboard/panel-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function SettingsRightPanel() {
  const { panel } = useDashboardPanel();

  const systemOverview = [
    { label: "Alignment", value: `${panel.alignmentScore ?? 0}%` },
    { label: "Active Goals", value: String(panel.activeGoals ?? 0) },
    { label: "Open Actions", value: String(panel.openActions ?? 0) },
    { label: "Insight", value: panel.insight ? "Ready" : "—" },
  ];
  return (
    <aside className="hidden w-72 shrink-0 flex-col gap-4 overflow-y-auto border-l border-border bg-background p-4 xl:flex">
      <h2 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        System Overview
      </h2>

      <Card className="border-border bg-card">
        <CardContent className="space-y-3 p-4">
          {systemOverview.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between text-sm"
            >
              <span className="text-muted-foreground">{item.label}</span>
              <span className="font-medium">{item.value}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      <div>
        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Subscription
        </h3>
        <Card className="border-primary/20 bg-card noirly-glow">
          <CardContent className="p-5">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="font-semibold">Vision Pro</span>
            </div>
            <Badge variant="outline" className="mt-2 text-[9px]">
              Member since 2026
            </Badge>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              You have full access to high-fidelity planning and biometric
              focus tracking.
            </p>
            <Button
              variant="outline"
              className="mt-4 h-11 w-full rounded-lg border-primary/30"
            >
              Manage billing
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-card">
        <CardContent className="p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Current State
          </p>
          <p className="mt-3 text-xs italic leading-relaxed text-muted-foreground">
            &ldquo;Your digital environment reflects your mental clarity.&rdquo;
          </p>
        </CardContent>
      </Card>
    </aside>
  );
}
