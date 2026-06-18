import { z } from "zod";

export const milestoneInputSchema = z.object({
  title: z.string().min(1, "Milestone title is required").max(200),
  description: z.string().max(2000).optional(),
  targetDate: z.string().optional(),
  successCriteria: z.string().max(500).optional(),
});

export const createMilestonesForGoalSchema = z.object({
  goalId: z.string().min(1, "Goal id is required"),
  milestones: z
    .array(milestoneInputSchema)
    .min(1, "Add at least one milestone")
    .max(20),
});

export type CreateMilestonesForGoalInput = z.infer<
  typeof createMilestonesForGoalSchema
>;
