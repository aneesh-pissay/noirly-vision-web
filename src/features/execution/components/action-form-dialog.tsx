"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { createAction } from "@/actions/execution";
import { useOsPermissions } from "@/features/os/components/os-permissions-provider";
import {
  ACTION_PRIORITIES,
  ACTION_START_STATUSES,
  ACTION_TYPE_LABELS,
  ACTION_TYPES,
} from "@/lib/constants";
import { createActionSchema } from "@/lib/validations/action";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { GoalOption } from "@/features/execution/types";

type ActionFormValues = z.input<typeof createActionSchema>;

type ActionFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goalOptions: GoalOption[];
  defaultStatus?: "PLANNED" | "IN_PROGRESS";
  defaultGoalId?: string;
  defaultMilestoneId?: string;
};

const START_STATUS_LABELS: Record<
  (typeof ACTION_START_STATUSES)[number],
  string
> = {
  PLANNED: "Planned",
  IN_PROGRESS: "In Progress",
};

export function ActionFormDialog({
  open,
  onOpenChange,
  goalOptions,
  defaultStatus = "PLANNED",
  defaultGoalId,
  defaultMilestoneId,
}: ActionFormDialogProps) {
  const router = useRouter();
  const { execution } = useOsPermissions();
  const [error, setError] = useState<string | null>(null);
  const hasGoals = goalOptions.length > 0;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ActionFormValues>({
    resolver: zodResolver(createActionSchema),
    defaultValues: {
      title: "",
      type: "build",
      priority: "high",
      estimatedMinutes: 120,
      status: defaultStatus,
      goalId: "",
      milestoneId: "",
    },
  });

  const selectedGoalId = useWatch({ control, name: "goalId" });
  const selectedGoal = useMemo(
    () => goalOptions.find((goal) => goal.id === selectedGoalId),
    [goalOptions, selectedGoalId]
  );
  const milestoneOptions = selectedGoal?.milestones ?? [];

  useEffect(() => {
    if (!open) return;
    setError(null);
    reset({
      title: "",
      type: "build",
      priority: "high",
      estimatedMinutes: 120,
      status: defaultStatus,
      goalId: defaultGoalId ?? goalOptions[0]?.id ?? "",
      milestoneId: defaultMilestoneId ?? "",
    });
  }, [open, defaultStatus, defaultGoalId, defaultMilestoneId, goalOptions, reset]);

  async function onSubmit(values: ActionFormValues) {
    setError(null);

    const parsed = createActionSchema.safeParse(values);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Validation failed");
      return;
    }

    const result = await createAction(parsed.data);
    if (!result.success) {
      setError(result.error ?? "Failed to create action");
      return;
    }

    onOpenChange(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New Action</DialogTitle>
          <DialogDescription>
            Connect execution to a goal and choose how you will work on it.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Build Payment System"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Connected Goal *</Label>
            {hasGoals ? (
              <Controller
                name="goalId"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select goal" />
                    </SelectTrigger>
                    <SelectContent>
                      {goalOptions.map((goal) => (
                        <SelectItem key={goal.id} value={goal.id}>
                          {goal.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            ) : (
              <div className="rounded-lg border border-dashed border-border bg-surface px-4 py-3 text-sm text-muted-foreground">
                No active goals yet.{" "}
                <Link
                  href="/dashboard/goals"
                  className="text-primary hover:underline"
                  onClick={() => onOpenChange(false)}
                >
                  Create a goal first
                </Link>
              </div>
            )}
            {errors.goalId && (
              <p className="text-xs text-destructive">{errors.goalId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Linked Milestone</Label>
            {milestoneOptions.length > 0 ? (
              <Controller
                name="milestoneId"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value || "none"}
                    onValueChange={(value) =>
                      field.onChange(value === "none" ? "" : value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Optional milestone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No milestone</SelectItem>
                      {milestoneOptions.map((milestone) => (
                        <SelectItem key={milestone.id} value={milestone.id}>
                          {milestone.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            ) : (
              <div className="rounded-lg border border-dashed border-border bg-surface px-4 py-3 text-sm text-muted-foreground">
                {selectedGoalId
                  ? "No milestones for this goal yet."
                  : "Select a goal to link a milestone."}
              </div>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Type</Label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {ACTION_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {ACTION_TYPE_LABELS[type]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.type && (
                <p className="text-xs text-destructive">{errors.type.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {ACTION_PRIORITIES.map((priority) => (
                        <SelectItem key={priority} value={priority}>
                          {priority.charAt(0).toUpperCase() + priority.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="estimatedMinutes">Estimated Focus</Label>
            <div className="flex items-center gap-2">
              <Input
                id="estimatedMinutes"
                type="number"
                min={5}
                max={480}
                className="flex-1"
                {...register("estimatedMinutes", { valueAsNumber: true })}
              />
              <span className="shrink-0 text-sm text-muted-foreground">
                minutes
              </span>
            </div>
            {errors.estimatedMinutes && (
              <p className="text-xs text-destructive">
                {errors.estimatedMinutes.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Start</Label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-2 gap-2">
                  {ACTION_START_STATUSES.map((status) => {
                    const selected = field.value === status;
                    return (
                      <button
                        key={status}
                        type="button"
                        onClick={() => field.onChange(status)}
                        className={cn(
                          "flex items-center gap-2 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
                          selected
                            ? "border-primary/40 bg-primary/10 text-foreground"
                            : "border-border bg-surface text-muted-foreground hover:border-primary/20 hover:text-foreground"
                        )}
                      >
                        <span
                          className={cn(
                            "h-2 w-2 shrink-0 rounded-full border",
                            selected
                              ? "border-primary bg-primary"
                              : "border-muted-foreground/50"
                          )}
                        />
                        {START_STATUS_LABELS[status]}
                      </button>
                    );
                  })}
                </div>
              )}
            />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !hasGoals || !execution.unlocked}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Action
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
