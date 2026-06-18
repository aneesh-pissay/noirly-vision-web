import type { LucideIcon } from "lucide-react";
import type { RightPanelInsight } from "@/components/right-panel/types";
import { Card, CardContent } from "@/components/ui/card";

type InsightCardProps = {
  insight: RightPanelInsight;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
};

export function InsightCard({
  insight,
  icon: Icon,
  iconColor,
  iconBg,
}: InsightCardProps) {
  return (
    <Card className="overflow-hidden border-border bg-card">
      <CardContent className="flex min-w-0 gap-3 p-4">
        <div
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconBg}`}
        >
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{insight.title}</p>
          <p className="mt-0.5 break-words text-xs leading-relaxed text-muted-foreground line-clamp-2">
            {insight.description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
