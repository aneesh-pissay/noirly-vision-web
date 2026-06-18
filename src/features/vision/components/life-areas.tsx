"use client";

import {
  Activity,
  BookOpen,
  Briefcase,
  Building2,
  User,
  Wallet,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { VisionLifeArea } from "@/features/vision/types";

const areaIcons: Record<string, typeof Briefcase> = {
  Career: Briefcase,
  Health: Activity,
  Learning: BookOpen,
  Finance: Wallet,
  Personal: User,
  Business: Building2,
};

type LifeAreasProps = {
  lifeAreas: VisionLifeArea[];
};

export function LifeAreas({ lifeAreas }: LifeAreasProps) {
  if (lifeAreas.length === 0) return null;

  return (
    <div>
      <h3 className="text-sm font-semibold">Life Areas Alignment</h3>
      <p className="mt-1 text-xs text-muted-foreground">
        Goals, focus, and alignment across areas connected to your active vision.
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {lifeAreas.map((area) => {
          const Icon = areaIcons[area.name] ?? Briefcase;
          return (
            <Card key={area.name} className="border-border bg-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium">{area.name}</p>
                </div>

                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">Active goals</span>
                    <span className="font-medium">{area.activeGoals}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">Focus invested</span>
                    <span className="font-medium">{area.focusHours}h</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-muted-foreground">Alignment</span>
                    <span className="font-medium text-primary">
                      {area.alignment}%
                    </span>
                  </div>
                </div>

                <Progress value={area.alignment} className="mt-3 h-2" />
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
