"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { updateGoal } from "@/actions/goals";
import { getGoalFormOptions } from "@/features/goals/actions/goals.actions";
import { GOAL_CATEGORIES } from "@/lib/constants";
import { formatAreaLabel } from "@/features/vision/lib/vision-page-utils";
import type { GoalItem } from "@/features/goals/types";
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
import { Textarea } from "@/components/ui/textarea";

const editGoalFormSchema = z.object({
  visionId: z.string().min(1, "Linked vision is required"),
  title: z.string().min(1, "Goal is required").max(200),
  description: z.string().max(2000).optional(),
  category: z.enum(GOAL_CATEGORIES),
  priority: z.enum(["low", "medium", "high", "critical"] as const),
});

type EditGoalFormValues = z.input<typeof editGoalFormSchema>;

type EditGoalDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: GoalItem | null;
};

export function EditGoalDialog({
  open,
  onOpenChange,
  goal,
}: EditGoalDialogProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [visions, setVisions] = useState<{ id: string; title: string }[]>([]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditGoalFormValues>({
    resolver: zodResolver(editGoalFormSchema),
  });

  useEffect(() => {
    if (!open || !goal) return;

    setError(null);
    void getGoalFormOptions()
      .then((options) => {
        setVisions(options.visions);
        reset({
          visionId: goal.visionId ?? options.visions[0]?.id ?? "",
          title: goal.title,
          description: goal.description ?? "",
          category: goal.category,
          priority: goal.priority as EditGoalFormValues["priority"],
        });
      })
      .catch(() => setError("Failed to load visions"));
  }, [open, goal, reset]);

  async function onSubmit(values: EditGoalFormValues) {
    if (!goal) return;

    setError(null);
    const result = await updateGoal({
      id: goal.id,
      title: values.title,
      description: values.description,
      category: values.category,
      priority: values.priority,
      visionId: values.visionId,
    });

    if (!result.success) {
      setError(result.error ?? "Failed to update goal");
      return;
    }

    toast.success("Goal updated");
    onOpenChange(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Goal</DialogTitle>
          <DialogDescription>
            Update the outcome definition for this goal.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Linked Vision *</Label>
            <Controller
              name="visionId"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vision" />
                  </SelectTrigger>
                  <SelectContent>
                    {visions.map((vision) => (
                      <SelectItem key={vision.id} value={vision.id}>
                        {vision.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-goal-title">Goal *</Label>
            <Input id="edit-goal-title" {...register("title")} />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-goal-description">Description</Label>
            <Textarea id="edit-goal-description" {...register("description")} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Life Area</Label>
              <Controller
                name="category"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {GOAL_CATEGORIES.map((area) => (
                        <SelectItem key={area} value={area}>
                          {formatAreaLabel(area)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Controller
                name="priority"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(["low", "medium", "high", "critical"] as const).map(
                        (priority) => (
                          <SelectItem key={priority} value={priority}>
                            {priority.charAt(0).toUpperCase() + priority.slice(1)}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
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
            <Button type="submit" disabled={isSubmitting || !goal}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
