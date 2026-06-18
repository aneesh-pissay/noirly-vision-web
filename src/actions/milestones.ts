"use server";

import { runMutation } from "@/lib/actions/run-action";
import { loadOsCounts } from "@/lib/progress/load-os-counts";
import {
  assertGoalsUnlocked,
  resolveOsPermissions,
} from "@/lib/progress/permissions";
import { syncGoalProgressFromMilestones } from "@/lib/milestones/sync";
import { id } from "@/lib/serializers";
import { serializeMilestone } from "@/lib/serializers/milestone";
import {
  createMilestonesForGoalSchema,
  type CreateMilestonesForGoalInput,
} from "@/lib/validations/milestone";
import Goal from "@/models/goal.model";
import Milestone from "@/models/milestone.model";
import type { ActionResult } from "@/types";
import type { MilestoneDTO } from "@/types/milestone";

const MILESTONE_PATHS = [
  "/dashboard/goals",
  "/dashboard/vision",
  "/dashboard/execution",
  "/dashboard",
];

export async function createMilestonesForGoal(
  input: CreateMilestonesForGoalInput
): Promise<ActionResult<MilestoneDTO[]>> {
  return runMutation({
    schema: createMilestonesForGoalSchema,
    input,
    errorMessage: "Failed to create milestones",
    revalidatePaths: MILESTONE_PATHS,
    handler: async ({ userId, input: data }) => {
      const permissions = resolveOsPermissions(await loadOsCounts(userId));
      assertGoalsUnlocked(permissions);

      if (permissions.counts.goalCount === 0) {
        throw new Error("Create goals before adding milestones.");
      }

      const goal = await Goal.findOne({ _id: data.goalId, userId }).lean();
      if (!goal) {
        throw new Error("Goal not found");
      }

      const existingCount = await Milestone.countDocuments({
        userId,
        goalId: data.goalId,
      });

      const created = await Milestone.insertMany(
        data.milestones.map((milestone, index) => ({
          userId,
          goalId: data.goalId,
          title: milestone.title,
          description: milestone.description,
          successCriteria: milestone.successCriteria,
          targetDate: milestone.targetDate
            ? new Date(milestone.targetDate)
            : undefined,
          status: "active" as const,
          order: existingCount + index,
        }))
      );

      await syncGoalProgressFromMilestones(userId, data.goalId);

      return created.map((milestone) => serializeMilestone(milestone));
    },
  });
}

export async function getMilestonesForGoal(goalId: string) {
  const { requireSessionUserId } = await import("@/lib/auth/session");
  const { connectDB } = await import("@/lib/db");

  const userId = await requireSessionUserId();
  await connectDB();

  const milestones = await Milestone.find({ userId, goalId })
    .sort({ order: 1, createdAt: 1 })
    .lean();

  return milestones.map((milestone) => ({
    id: id(milestone._id),
    goalId: id(milestone.goalId),
    title: milestone.title,
    description: milestone.description,
    status: milestone.status,
    order: milestone.order,
    completedAt: milestone.completedAt?.toISOString(),
  }));
}
