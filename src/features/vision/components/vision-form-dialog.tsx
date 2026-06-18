"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { createVision, updateVision } from "@/actions/vision";
import { VISION_AREAS, VISION_STAGES, VISION_STAGE_LABELS } from "@/lib/constants";
import { z } from "zod";
import { createVisionSchema } from "@/lib/validations/vision";
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
import { cn } from "@/lib/utils";
import { isVisionStage } from "@/features/vision/lib/vision-page-utils";
import type { VisionView } from "@/features/vision/types";

type VisionFormValues = z.input<typeof createVisionSchema>;

type VisionFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  vision?: VisionView | null;
};

function toDateInputValue(value?: string) {
  if (!value) return "";
  return value.slice(0, 10);
}

function normalizeStage(value?: string): VisionFormValues["phase"] | undefined {
  if (isVisionStage(value)) return value;
  return undefined;
}

export function VisionFormDialog({
  open,
  onOpenChange,
  mode,
  vision,
}: VisionFormDialogProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<VisionFormValues>({
    resolver: zodResolver(createVisionSchema),
    defaultValues: {
      title: "",
      description: "",
      area: "career",
      phase: "building",
      successMetric: "",
      targetDate: "",
    },
  });

  useEffect(() => {
    if (!open) return;

    setError(null);
    if (mode === "edit" && vision) {
      reset({
        title: vision.title,
        description: vision.description ?? "",
        area: vision.area as VisionFormValues["area"],
        phase: normalizeStage(vision.phase) ?? "building",
        successMetric: vision.successMetric ?? "",
        targetDate: toDateInputValue(vision.targetDate),
      });
      return;
    }

    reset({
      title: "",
      description: "",
      area: "career",
      phase: "building",
      successMetric: "",
      targetDate: "",
    });
  }, [open, mode, vision, reset]);

  async function onSubmit(values: VisionFormValues) {
    setError(null);

    const parsed = createVisionSchema.safeParse(values);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Validation failed");
      return;
    }

    const result =
      mode === "edit" && vision
        ? await updateVision({
            id: vision.id,
            ...parsed.data,
          })
        : await createVision(parsed.data);

    if (!result.success) {
      setError(result.error ?? "Something went wrong");
      return;
    }

    onOpenChange(false);
    router.refresh();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Create Vision" : "Edit Vision"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Define your major vision. Existing active visions will be archived."
              : "Update your active vision details."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Become a World Class Engineer"
              {...register("title")}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Become capable of designing global scale systems"
              {...register("description")}
            />
            {errors.description && (
              <p className="text-xs text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Life Area</Label>
            <Controller
              name="area"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select area" />
                  </SelectTrigger>
                  <SelectContent>
                    {VISION_AREAS.map((area) => (
                      <SelectItem key={area} value={area}>
                        {area.charAt(0).toUpperCase() + area.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="space-y-2">
            <Label>Current Stage</Label>
            <Controller
              name="phase"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-2 gap-2">
                  {VISION_STAGES.map((stage) => {
                    const selected = field.value === stage;
                    return (
                      <button
                        key={stage}
                        type="button"
                        onClick={() => field.onChange(stage)}
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
                        {VISION_STAGE_LABELS[stage]}
                      </button>
                    );
                  })}
                </div>
              )}
            />
            {errors.phase && (
              <p className="text-xs text-destructive">{errors.phase.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="successMetric">Success Metric</Label>
            <Textarea
              id="successMetric"
              placeholder="Launch production systems used by real users"
              className="min-h-[72px]"
              {...register("successMetric")}
            />
            <p className="text-[11px] text-muted-foreground">
              A measurable destination that defines when this vision is achieved.
            </p>
            {errors.successMetric && (
              <p className="text-xs text-destructive">
                {errors.successMetric.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetDate">Target Date</Label>
            <Controller
              name="targetDate"
              control={control}
              render={({ field }) => (
                <FutureDatePicker
                  id="targetDate"
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
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "create" ? "Create Vision" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
