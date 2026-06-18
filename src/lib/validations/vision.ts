import { z } from "zod";
import { getMinFutureDateInputValue } from "@/lib/dates";
import { VISION_AREAS, VISION_STAGES, VISION_STATUSES } from "@/lib/constants";

const optionalFutureDateSchema = z
  .string()
  .optional()
  .refine(
    (value) => !value || value >= getMinFutureDateInputValue(),
    "Target date must be today or in the future"
  );

const optionalNullableFutureDateSchema = z
  .string()
  .optional()
  .nullable()
  .refine(
    (value) => !value || value >= getMinFutureDateInputValue(),
    "Target date must be today or in the future"
  );

export const createVisionSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  area: z.enum(VISION_AREAS).default("career"),
  phase: z.enum(VISION_STAGES, { message: "Select a current stage" }),
  successMetric: z
    .string()
    .min(1, "Success metric is required")
    .max(500, "Success metric is too long"),
  targetDate: optionalFutureDateSchema,
  progress: z.number().min(0).max(100).optional(),
});

export const getVisionSchema = z.object({
  id: z.string().min(1).optional(),
  status: z.enum(VISION_STATUSES).optional(),
});

export const updateVisionSchema = z.object({
  id: z.string().min(1, "Vision id is required"),
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional(),
  area: z.enum(VISION_AREAS).optional(),
  phase: z.enum(VISION_STAGES).optional().nullable(),
  successMetric: z.string().min(1).max(500).optional().nullable(),
  targetDate: optionalNullableFutureDateSchema,
  progress: z.number().min(0).max(100).optional(),
  status: z.enum(VISION_STATUSES).optional(),
});

export const deleteVisionSchema = z.object({
  id: z.string().min(1, "Vision id is required"),
});

export type CreateVisionInput = z.infer<typeof createVisionSchema>;
export type GetVisionInput = z.infer<typeof getVisionSchema>;
export type UpdateVisionInput = z.infer<typeof updateVisionSchema>;
export type DeleteVisionInput = z.infer<typeof deleteVisionSchema>;
