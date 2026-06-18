import { Calendar } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";

export default function CalendarPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Calendar"
        description="Schedule and visualize your upcoming work"
      />

      <Card className="border-border bg-card">
        <CardContent className="flex h-96 flex-col items-center justify-center gap-4">
          <div className="rounded-full bg-primary/10 p-4 text-primary">
            <Calendar className="h-8 w-8" />
          </div>
          <div className="text-center">
            <p className="font-medium">Calendar coming soon</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Full calendar integration with task due dates and project milestones.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
