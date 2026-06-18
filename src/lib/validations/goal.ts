import { z } from "zod";
import { getMinFutureDateInputValue } from "@/lib/dates";
import { ACTION_PRIORITIES, GOAL_CATEGORIES, GOAL_STATUSES } from "@/lib/constants";

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

export const goalMilestoneSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Milestone title is required").max(200),
  completed: z.boolean().optional().default(false),
});

export const createGoalSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  category: z.enum(GOAL_CATEGORIES).default("career"),
  priority: z.enum(ACTION_PRIORITIES).default("medium"),
  impactScore: z.number().min(0).max(100).default(75),
  effortScore: z.number().min(0).max(100).default(25),
  targetDate: optionalFutureDateSchema,
  visionId: z.string().min(1, "Linked vision is required"),
  milestones: z.array(goalMilestoneSchema).optional(),
});

export const getGoalSchema = z.object({
  id: z.string().min(1).optional(),
  status: z.enum(GOAL_STATUSES).optional(),
  visionId: z.string().min(1).optional(),
});

export const getGoalsSchema = z.object({
  status: z.enum(GOAL_STATUSES).optional(),
  visionId: z.string().min(1).optional(),
});

export const updateGoalSchema = z.object({
  id: z.string().min(1, "Goal id is required"),
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(2000).optional().nullable(),
  category: z.enum(GOAL_CATEGORIES).optional(),
  priority: z.enum(ACTION_PRIORITIES).optional(),
  impactScore: z.number().min(0).max(100).optional(),
  effortScore: z.number().min(0).max(100).optional(),
  targetDate: optionalNullableFutureDateSchema,
  status: z.enum(GOAL_STATUSES).optional(),
  visionId: z.string().min(1).optional().nullable(),
  milestones: z.array(goalMilestoneSchema).optional(),
});

export const deleteGoalSchema = z.object({
  id: z.string().min(1, "Goal id is required"),
});

export type GoalMilestoneInput = z.infer<typeof goalMilestoneSchema>;
export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type GetGoalInput = z.infer<typeof getGoalSchema>;
export type GetGoalsInput = z.infer<typeof getGoalsSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
export type DeleteGoalInput = z.infer<typeof deleteGoalSchema>;
