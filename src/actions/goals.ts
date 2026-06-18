"use server";

import { runMutation, runQuery } from "@/lib/actions/run-action";
import { loadOsCounts } from "@/lib/progress/load-os-counts";
import {
  assertGoalsUnlocked,
  resolveOsPermissions,
} from "@/lib/progress/permissions";
import { resolveVisionIdForUser } from "@/lib/goals/verify-vision";
import { serializeGoal } from "@/lib/serializers/goal";
import {
  createGoalSchema,
  deleteGoalSchema,
  getGoalSchema,
  getGoalsSchema,
  updateGoalSchema,
  type CreateGoalInput,
  type DeleteGoalInput,
  type GetGoalInput,
  type GetGoalsInput,
  type UpdateGoalInput,
} from "@/lib/validations/goal";
import Goal from "@/models/goal.model";
import Milestone from "@/models/milestone.model";
import Action from "@/models/action.model";
import Vision from "@/models/vision.model";
import type { ActionResult } from "@/types";
import type { GoalDTO } from "@/types/goal";

const GOAL_PATHS = ["/dashboard/goals", "/dashboard/vision", "/dashboard"];

export async function createGoal(
  input: CreateGoalInput
): Promise<ActionResult<GoalDTO>> {
  return runMutation({
    schema: createGoalSchema,
    input,
    errorMessage: "Failed to create goal",
    revalidatePaths: GOAL_PATHS,
    handler: async ({ userId, input: data }) => {
      const permissions = resolveOsPermissions(await loadOsCounts(userId));
      assertGoalsUnlocked(permissions);

      const activeVision = await Vision.findOne({ userId, status: "ACTIVE" })
        .select("_id")
        .lean();

      if (!activeVision) {
        throw new Error("Create a vision before adding goals");
      }

      const visionId = await resolveVisionIdForUser(userId, data.visionId);
      if (!visionId) {
        throw new Error("Create a vision before adding goals");
      }

      const goal = await Goal.create({
        userId,
        visionId,
        title: data.title,
        description: data.description,
        category: data.category,
        priority: data.priority,
        impactScore: data.impactScore,
        effortScore: data.effortScore,
        targetDate: data.targetDate ? new Date(data.targetDate) : undefined,
        milestones: [],
        progress: 0,
        status: "ACTIVE",
      });

      return serializeGoal(goal);
    },
  });
}

export async function getGoal(
  input: GetGoalInput
): Promise<ActionResult<GoalDTO | null>> {
  return runQuery({
    schema: getGoalSchema,
    input,
    errorMessage: "Failed to get goal",
    handler: async ({ userId, input: data }) => {
      const filter: Record<string, unknown> = { userId };

      if (data.id) filter._id = data.id;
      if (data.status) filter.status = data.status;
      if (data.visionId) filter.visionId = data.visionId;

      const goal = await Goal.findOne(filter).lean();
      return goal ? serializeGoal(goal) : null;
    },
  });
}

export async function getGoals(
  input: GetGoalsInput = {}
): Promise<ActionResult<GoalDTO[]>> {
  return runQuery({
    schema: getGoalsSchema,
    input,
    errorMessage: "Failed to get goals",
    handler: async ({ userId, input: data }) => {
      const filter: Record<string, unknown> = { userId };

      if (data.status) filter.status = data.status;
      if (data.visionId) filter.visionId = data.visionId;

      const goals = await Goal.find(filter)
        .sort({ progress: -1, updatedAt: -1 })
        .lean();

      return goals.map(serializeGoal);
    },
  });
}

export async function updateGoal(
  input: UpdateGoalInput
): Promise<ActionResult<GoalDTO>> {
  return runMutation({
    schema: updateGoalSchema,
    input,
    errorMessage: "Failed to update goal",
    revalidatePaths: GOAL_PATHS,
    handler: async ({ userId, input: data }) => {
      const { id: goalId, milestones: _milestones, visionId, ...fields } = data;

      const update: Record<string, unknown> = { ...fields };

      if (visionId !== undefined) {
        update.visionId = visionId
          ? await resolveVisionIdForUser(userId, visionId)
          : null;
      }

      const goal = await Goal.findOneAndUpdate(
        { _id: goalId, userId },
        update,
        { new: true }
      ).lean();

      if (!goal) {
        throw new Error("Goal not found");
      }

      return serializeGoal(goal);
    },
  });
}

export async function deleteGoal(
  input: DeleteGoalInput
): Promise<ActionResult<{ id: string }>> {
  return runMutation({
    schema: deleteGoalSchema,
    input,
    errorMessage: "Failed to delete goal",
    revalidatePaths: GOAL_PATHS,
    handler: async ({ userId, input: data }) => {
      const goal = await Goal.findOneAndDelete({
        _id: data.id,
        userId,
      });

      if (!goal) {
        throw new Error("Goal not found");
      }

      await Milestone.deleteMany({ goalId: data.id, userId });
      await Action.deleteMany({ goalId: data.id, userId });

      return { id: data.id };
    },
  });
}
