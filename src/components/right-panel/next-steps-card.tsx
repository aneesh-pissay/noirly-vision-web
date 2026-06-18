import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export type NextStepItem = {
  key: string;
  label: string;
  href: string;
  icon: LucideIcon;
  description: string;
};

type NextStepsCardProps = {
  steps: NextStepItem[];
};

export function NextStepsCard({ steps }: NextStepsCardProps) {
  return (
    <Card className="overflow-hidden border-border bg-card">
      <CardHeader className="pb-2 pt-4">
        <CardTitle className="truncate text-sm font-semibold">Next Steps</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 pb-4">
        {steps.map((step) => (
          <Button
            key={step.key}
            asChild
            variant="outline"
            className="h-auto w-full min-w-0 justify-start rounded-xl border-border bg-surface px-3 py-3 text-left"
          >
            <Link href={step.href} className="flex min-w-0 gap-3">
              <step.icon className="h-4 w-4 shrink-0 text-primary" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">
                  {step.label}
                </span>
                <span className="mt-0.5 block break-words text-xs leading-relaxed text-muted-foreground line-clamp-2">
                  {step.description}
                </span>
              </span>
            </Link>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
