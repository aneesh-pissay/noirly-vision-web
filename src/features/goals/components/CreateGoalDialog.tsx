"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { createGoal } from "@/actions/goals";
import { createMilestonesForGoal } from "@/actions/milestones";
import { getGoalFormOptions } from "@/features/goals/actions/goals.actions";
import { ACTION_PRIORITIES, GOAL_CATEGORIES } from "@/lib/constants";
import { getMinFutureDateInputValue } from "@/lib/dates";
import { formatAreaLabel } from "@/features/vision/lib/vision-page-utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FutureDatePicker } from "@/components/ui/future-date-picker";
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

const createGoalFormSchema = z.object({
  visionId: z.string().min(1, "Linked vision is required"),
  title: z.string().min(1, "Goal is required").max(200),
  description: z.string().max(2000).optional(),
  category: z.enum(GOAL_CATEGORIES),
  priority: z.enum(["low", "medium", "high"] as const),
  targetDate: z
    .string()
    .optional()
    .refine(
      (value) => !value || value >= getMinFutureDateInputValue(),
      "Target date must be today or in the future"
    ),
  impactScore: z.coerce.number().min(1).max(10),
  effortScore: z.coerce.number().min(1).max(10),
});

type CreateGoalFormValues = z.input<typeof createGoalFormSchema>;

type CreateGoalDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function formatLabel(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function CreateGoalDialog({ open, onOpenChange }: CreateGoalDialogProps) {
  const router = useRouter();
  const [step, setStep] = useState<"details" | "milestones">("details");
  const [createdGoal, setCreatedGoal] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [milestoneTitles, setMilestoneTitles] = useState<string[]>([
    "",
    "",
    "",
  ]);
  const [savingMilestones, setSavingMilestones] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [visions, setVisions] = useState<{ id: string; title: string }[]>([]);
  const [loadingVisions, setLoadingVisions] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateGoalFormValues>({
    resolver: zodResolver(createGoalFormSchema),
    defaultValues: {
      visionId: "",
      title: "",
      description: "",
      category: "career",
      priority: "high",
      targetDate: "",
      impactScore: 9,
      effortScore: 6,
    },
  });

  useEffect(() => {
    if (!open) return;

    setStep("details");
    setCreatedGoal(null);
    setMilestoneTitles(["", "", ""]);
    setError(null);
    setLoadingVisions(true);

    void getGoalFormOptions()
      .then((options) => {
        setVisions(options.visions);
        reset({
          visionId: options.visions[0]?.id ?? "",
          title: "",
          description: "",
          category: "career",
          priority: "high",
          targetDate: "",
          impactScore: 9,
          effortScore: 6,
        });
      })
      .catch(() => {
        setError("Failed to load visions");
        setVisions([]);
      })
      .finally(() => {
        setLoadingVisions(false);
      });
  }, [open, reset]);

  async function onSubmit(values: CreateGoalFormValues) {
    setError(null);

    const parsed = createGoalFormSchema.safeParse(values);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Validation failed");
      return;
    }

    const result = await createGoal({
      title: parsed.data.title,
      description: parsed.data.description,
      category: parsed.data.category,
      priority: parsed.data.priority as (typeof ACTION_PRIORITIES)[number],
      targetDate: parsed.data.targetDate || undefined,
      visionId: parsed.data.visionId,
      impactScore: parsed.data.impactScore * 10,
      effortScore: parsed.data.effortScore * 10,
    });

    if (!result.success || !result.data) {
      setError(result.error ?? "Something went wrong");
      return;
    }

    setCreatedGoal({ id: result.data.id, title: result.data.title });
    setStep("milestones");
    toast.success("Goal created");
  }

  function handleClose() {
    onOpenChange(false);
    router.refresh();
  }

  function updateMilestoneTitle(index: number, value: string) {
    setMilestoneTitles((current) =>
      current.map((title, i) => (i === index ? value : title))
    );
  }

  function addMilestoneField() {
    setMilestoneTitles((current) => [...current, ""]);
  }

  function removeMilestoneField(index: number) {
    setMilestoneTitles((current) =>
      current.length > 1 ? current.filter((_, i) => i !== index) : current
    );
  }

  async function handleSaveMilestones() {
    if (!createdGoal) return;

    const milestones = milestoneTitles
      .map((title) => title.trim())
      .filter(Boolean)
      .map((title) => ({ title }));

    if (milestones.length === 0) {
      handleClose();
      return;
    }

    setSavingMilestones(true);
    setError(null);

    const result = await createMilestonesForGoal({
      goalId: createdGoal.id,
      milestones,
    });

    setSavingMilestones(false);

    if (!result.success) {
      setError(result.error ?? "Failed to save milestones");
      return;
    }

    toast.success("Milestones added");
    handleClose();
  }

  const hasVisions = visions.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        {step === "details" ? (
          <>
            <DialogHeader>
              <DialogTitle>Create Goal</DialogTitle>
              <DialogDescription>
                Connect a measurable outcome to your vision.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Linked Vision *</Label>
            {loadingVisions ? (
              <div className="h-10 animate-pulse rounded-md bg-muted/50" />
            ) : hasVisions ? (
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
            ) : (
              <div className="rounded-lg border border-dashed border-border bg-surface px-4 py-3 text-sm text-muted-foreground">
                No active vision yet.{" "}
                <Link
                  href="/dashboard/vision"
                  className="text-primary hover:underline"
                  onClick={() => onOpenChange(false)}
                >
                  Create a vision first
                </Link>
              </div>
            )}
            {errors.visionId && (
              <p className="text-xs text-destructive">{errors.visionId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal-title">Goal *</Label>
            <Input
              id="goal-title"
              placeholder="Master Cloud Architecture"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal-description">Description</Label>
            <Textarea
              id="goal-description"
              placeholder="What outcome proves this goal is achieved?"
              {...register("description")}
            />
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
                      <SelectValue placeholder="Select life area" />
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
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      {(["low", "medium", "high"] as const).map((priority) => (
                        <SelectItem key={priority} value={priority}>
                          {formatLabel(priority)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="goal-impact">Impact (1-10)</Label>
              <Input
                id="goal-impact"
                type="number"
                min={1}
                max={10}
                {...register("impactScore")}
              />
              {errors.impactScore && (
                <p className="text-xs text-destructive">
                  {errors.impactScore.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="goal-effort">Effort (1-10)</Label>
              <Input
                id="goal-effort"
                type="number"
                min={1}
                max={10}
                {...register("effortScore")}
              />
              {errors.effortScore && (
                <p className="text-xs text-destructive">
                  {errors.effortScore.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="goal-target-date">Target Date</Label>
            <Controller
              name="targetDate"
              control={control}
              render={({ field }) => (
                <FutureDatePicker
                  id="goal-target-date"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select target date"
                />
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
            <Button type="submit" disabled={isSubmitting || !hasVisions}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Goal
            </Button>
          </DialogFooter>
            </form>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Add Milestones</DialogTitle>
              <DialogDescription>
                Break <span className="font-medium">{createdGoal?.title}</span>{" "}
                into checkpoints you can execute against.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3">
              {milestoneTitles.map((title, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={title}
                    placeholder={
                      index === 0
                        ? "Kubernetes Production"
                        : index === 1
                          ? "Terraform Mastery"
                          : "Milestone title"
                    }
                    onChange={(event) =>
                      updateMilestoneTitle(index, event.target.value)
                    }
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    onClick={() => removeMilestoneField(index)}
                    disabled={milestoneTitles.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={addMilestoneField}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Milestone
              </Button>
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Skip for now
              </Button>
              <Button
                type="button"
                onClick={handleSaveMilestones}
                disabled={savingMilestones}
              >
                {savingMilestones && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Milestones
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
