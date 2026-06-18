"use client";

import { LifeAreas } from "@/features/vision/components/life-areas";
import { VisionHero } from "@/features/vision/components/vision-hero";
import { VisionInsights } from "@/features/vision/components/vision-insights";
import { VisionTimeline } from "@/features/vision/components/vision-timeline";
import type { VisionPageData } from "@/features/vision/types";

export function VisionOverview({ data }: { data: VisionPageData }) {
  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Your Vision</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Define your future. Align your goals. Execute daily.
        </p>
      </div>

      <VisionHero
        vision={data.vision}
        connectedGoalCount={data.connectedGoalCount}
      />

      {data.vision && <VisionInsights vision={data.vision} />}

      {data.vision && <LifeAreas lifeAreas={data.vision.lifeAreas} />}

      <VisionTimeline trajectory={data.trajectory} />
    </div>
  );
}
