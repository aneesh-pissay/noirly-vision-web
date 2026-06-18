import { z } from "zod";
import {
  ACTION_PRIORITIES,
  ACTION_START_STATUSES,
  ACTION_STATUSES,
  ACTION_TYPES,
} from "@/lib/constants";

export const createActionSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  type: z.enum(ACTION_TYPES, { message: "Select an action type" }),
  status: z.enum(ACTION_START_STATUSES).default("PLANNED"),
  priority: z.enum(ACTION_PRIORITIES).default("high"),
  estimatedMinutes: z.number().int().min(5).max(480).default(120),
  visionId: z.string().min(1).optional(),
  goalId: z.string().min(1, "Connected goal is required"),
  milestoneId: z
    .string()
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined)),
});

export const getActionSchema = z.object({
  id: z.string().min(1).optional(),
  status: z.enum(ACTION_STATUSES).optional(),
  goalId: z.string().min(1).optional(),
});

export const getActionsSchema = z.object({
  status: z.enum(ACTION_STATUSES).optional(),
  goalId: z.string().min(1).optional(),
});

export const updateActionSchema = z.object({
  id: z.string().min(1, "Action id is required"),
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  type: z.enum(ACTION_TYPES).optional(),
  status: z.enum(ACTION_STATUSES).optional(),
  priority: z.enum(ACTION_PRIORITIES).optional(),
  estimatedMinutes: z.number().int().min(5).max(480).optional(),
  visionId: z.string().min(1).optional().nullable(),
  goalId: z.string().min(1).optional().nullable(),
  milestoneId: z.string().min(1).optional().nullable(),
});

export const updateActionStatusSchema = z.object({
  id: z.string().min(1, "Action id is required"),
  status: z.enum(ACTION_STATUSES),
});

export const deleteActionSchema = z.object({
  id: z.string().min(1, "Action id is required"),
});

export type CreateActionInput = z.infer<typeof createActionSchema>;
export type GetActionInput = z.infer<typeof getActionSchema>;
export type GetActionsInput = z.infer<typeof getActionsSchema>;
export type UpdateActionInput = z.infer<typeof updateActionSchema>;
export type UpdateActionStatusInput = z.infer<typeof updateActionStatusSchema>;
export type DeleteActionInput = z.infer<typeof deleteActionSchema>;
