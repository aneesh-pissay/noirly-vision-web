import { Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

type ActiveVisionCardProps = {
  title?: string;
  progress?: number;
  setupProgress: number;
};

export function ActiveVisionCard({
  title,
  progress = 0,
  setupProgress,
}: ActiveVisionCardProps) {
  return (
    <Card className="overflow-hidden border-primary/20 bg-card noirly-glow">
      <CardHeader className="pb-2 pt-4">
        <CardTitle className="flex min-w-0 items-center gap-2 text-sm font-semibold">
          <Target className="h-4 w-4 shrink-0 text-primary" />
          <span className="truncate">Active Vision</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="min-w-0 pb-4">
        <p className="truncate text-sm font-semibold">{title}</p>
        {progress > 0 && (
          <div className="mt-3 min-w-0">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Alignment</span>
              <span className="text-primary">{progress}%</span>
            </div>
            <Progress value={progress} className="mt-1.5" />
          </div>
        )}
        <p className="mt-3 text-[10px] text-muted-foreground">
          {setupProgress}/5 setup steps complete
        </p>
      </CardContent>
    </Card>
  );
}
