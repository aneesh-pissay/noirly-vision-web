"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Plus, Rocket, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteVision, updateVision } from "@/actions/vision";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { VisionFormDialog } from "@/features/vision/components/vision-form-dialog";
import { formatAreaLabel, formatVisionStage } from "@/features/vision/lib/vision-page-utils";
import type { VisionView } from "@/features/vision/types";
import {
  formatProgressDisplay,
  progressBarValue,
  showProgressBar,
  visionProgressDisplay,
} from "@/lib/progress/display";

type VisionHeroProps = {
  vision: VisionView | null;
  connectedGoalCount?: number;
};

export function VisionHero({ vision, connectedGoalCount = 0 }: VisionHeroProps) {
  const router = useRouter();
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [isArchiving, setIsArchiving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openCreate() {
    setFormMode("create");
    setFormOpen(true);
  }

  function openEdit() {
    setFormMode("edit");
    setFormOpen(true);
  }

  async function handleArchive() {
    if (!vision) return;
    setIsArchiving(true);
    setError(null);

    const result = await updateVision({
      id: vision.id,
      status: "ARCHIVED",
    });

    setIsArchiving(false);

    if (!result.success) {
      setError(result.error ?? "Failed to archive vision");
      return;
    }

    toast.success("Vision archived");
    router.refresh();
  }

  async function handleDelete() {
    if (!vision) return;
    if (!window.confirm(`Delete "${vision.title}"? This cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    const result = await deleteVision({ id: vision.id });
    setIsDeleting(false);

    if (!result.success) {
      setError(result.error ?? "Failed to delete vision");
      return;
    }

    toast.success("Vision deleted");
    router.refresh();
  }

  if (!vision) {
    return (
      <>
        <Card className="border-dashed border-border bg-card/50">
          <CardContent className="flex flex-col items-center px-6 py-16 text-center">
            <Rocket className="h-10 w-10 text-primary" />
            <h2 className="mt-4 text-lg font-semibold">No active vision</h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Create your first major vision to align goals, milestones, and daily
              execution.
            </p>
            <Button className="mt-6 rounded-full" onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Create Vision
            </Button>
          </CardContent>
        </Card>
        <VisionFormDialog
          open={formOpen}
          onOpenChange={setFormOpen}
          mode={formMode}
          vision={vision}
        />
      </>
    );
  }

  const progressDisplay = visionProgressDisplay(vision.progress, true);

  return (
    <>
      <Card className="border-border bg-card">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <Rocket className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                  Active Major Vision
                </p>
                <h2 className="mt-1 text-xl font-semibold">{vision.title}</h2>
                {vision.description && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {vision.description}
                  </p>
                )}
                {vision.successMetric && (
                  <p className="mt-2 text-sm text-foreground/90">
                    <span className="text-muted-foreground">Success: </span>
                    {vision.successMetric}
                  </p>
                )}
                <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span>
                    Area:{" "}
                    <span className="text-foreground">
                      {formatAreaLabel(vision.area)}
                    </span>
                  </span>
                  {vision.targetDate && (
                    <span>
                      Target:{" "}
                      <span className="text-foreground">
                        {new Date(vision.targetDate).toLocaleDateString()}
                      </span>
                    </span>
                  )}
                  {vision.phase && (
                    <span>
                      Current Stage:{" "}
                      <span className="text-foreground">
                        {formatVisionStage(vision.phase)}
                      </span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button size="sm" className="rounded-full" onClick={openCreate}>
                <Plus className="mr-2 h-4 w-4" />
                New Vision
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="h-9 w-9">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={openEdit}>Edit Vision</DropdownMenuItem>
                  <DropdownMenuItem onClick={handleArchive} disabled={isArchiving}>
                    {isArchiving ? "Archiving..." : "Archive Vision"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Vision
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  Progress (avg. connected goals)
                </span>
                <span className="font-medium text-primary">
                  {formatProgressDisplay(progressDisplay)}
                </span>
              </div>
              {showProgressBar(progressDisplay) && (
                <Progress
                  value={progressBarValue(progressDisplay)}
                  className="mt-2 h-2"
                />
              )}
            </div>
            <div className="text-right">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Alignment Score
              </p>
              <p className="text-4xl font-bold text-primary">
                {formatProgressDisplay(progressDisplay)}
              </p>
            </div>
          </div>

          {error && <p className="mt-4 text-sm text-destructive">{error}</p>}
        </CardContent>
      </Card>

      <VisionFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        mode={formMode}
        vision={vision}
      />
    </>
  );
}
