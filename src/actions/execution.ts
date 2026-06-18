"use server";

import { runMutation, runQuery } from "@/lib/actions/run-action";
import { loadOsCounts } from "@/lib/progress/load-os-counts";
import {
  assertExecutionUnlocked,
  resolveOsPermissions,
} from "@/lib/progress/permissions";
import { syncMilestoneCompletionForAction } from "@/lib/milestones/sync";
import { resolveMilestoneIdForUser } from "@/lib/milestones/verify";
import {
  resolveGoalIdForUser,
  resolveVisionIdForUser,
} from "@/lib/execution/verify-refs";
import {
  applyStatusUpdate,
  createStatusFields,
  serializeAction,
} from "@/lib/serializers/action";
import {
  createActionSchema,
  deleteActionSchema,
  getActionSchema,
  getActionsSchema,
  updateActionSchema,
  updateActionStatusSchema,
  type CreateActionInput,
  type DeleteActionInput,
  type GetActionInput,
  type GetActionsInput,
  type UpdateActionInput,
  type UpdateActionStatusInput,
} from "@/lib/validations/action";
import Action from "@/models/action.model";
import Goal from "@/models/goal.model";
import type { ActionResult } from "@/types";
import type { ActionDTO } from "@/types/action";

const EXECUTION_PATHS = [
  "/dashboard/execution",
  "/dashboard/focus",
  "/dashboard/goals",
  "/dashboard/vision",
  "/dashboard",
];

export async function createAction(
  input: CreateActionInput
): Promise<ActionResult<ActionDTO>> {
  return runMutation({
    schema: createActionSchema,
    input,
    errorMessage: "Failed to create action",
    revalidatePaths: EXECUTION_PATHS,
    handler: async ({ userId, input: data }) => {
      const permissions = resolveOsPermissions(await loadOsCounts(userId));
      assertExecutionUnlocked(permissions);

      const goal = await Goal.findOne({ _id: data.goalId, userId })
        .select("visionId")
        .lean();

      if (!goal) {
        throw new Error("Goal not found");
      }

      const [visionIdFromInput, goalId] = await Promise.all([
        resolveVisionIdForUser(userId, data.visionId),
        resolveGoalIdForUser(userId, data.goalId),
      ]);

      const visionId = visionIdFromInput ?? goal.visionId ?? undefined;

      let milestoneId: typeof goal.visionId | undefined;
      if (data.milestoneId) {
        const resolvedMilestone = await resolveMilestoneIdForUser(
          userId,
          data.milestoneId,
          data.goalId
        );
        if (!resolvedMilestone) {
          throw new Error("Milestone not found");
        }
        milestoneId = resolvedMilestone;
      }

      const action = await Action.create({
        userId,
        visionId,
        goalId,
        milestoneId,
        title: data.title,
        description: data.description,
        type: data.type,
        priority: data.priority,
        estimatedMinutes: data.estimatedMinutes,
        ...createStatusFields(data.status),
      });

      return serializeAction(action);
    },
  });
}

export async function getAction(
  input: GetActionInput
): Promise<ActionResult<ActionDTO | null>> {
  return runQuery({
    schema: getActionSchema,
    input,
    errorMessage: "Failed to get action",
    handler: async ({ userId, input: data }) => {
      const filter: Record<string, unknown> = { userId };
      if (data.id) filter._id = data.id;
      if (data.status) filter.status = data.status;
      if (data.goalId) filter.goalId = data.goalId;

      const action = await Action.findOne(filter).lean();
      return action ? serializeAction(action) : null;
    },
  });
}

export async function getActions(
  input: GetActionsInput = {}
): Promise<ActionResult<ActionDTO[]>> {
  return runQuery({
    schema: getActionsSchema,
    input,
    errorMessage: "Failed to get actions",
    handler: async ({ userId, input: data }) => {
      const filter: Record<string, unknown> = { userId };
      if (data.status) filter.status = data.status;
      if (data.goalId) filter.goalId = data.goalId;

      const actions = await Action.find(filter)
        .sort({ updatedAt: -1 })
        .lean();

      return actions.map(serializeAction);
    },
  });
}

export async function updateAction(
  input: UpdateActionInput
): Promise<ActionResult<ActionDTO>> {
  return runMutation({
    schema: updateActionSchema,
    input,
    errorMessage: "Failed to update action",
    revalidatePaths: EXECUTION_PATHS,
    handler: async ({ userId, input: data }) => {
      const { id: actionId, visionId, goalId, milestoneId, status, ...fields } = data;
      const update: Record<string, unknown> = { ...fields };

      if (visionId !== undefined) {
        update.visionId = visionId
          ? await resolveVisionIdForUser(userId, visionId)
          : null;
      }

      if (goalId !== undefined) {
        update.goalId = goalId
          ? await resolveGoalIdForUser(userId, goalId)
          : null;
      }

      if (milestoneId !== undefined) {
        if (milestoneId === null) {
          update.milestoneId = null;
        } else {
          const resolvedGoalId =
            (goalId as string | undefined) ??
            (
              await Action.findOne({ _id: actionId, userId })
                .select("goalId")
                .lean()
            )?.goalId?.toString();

          const resolvedMilestone = await resolveMilestoneIdForUser(
            userId,
            milestoneId,
            resolvedGoalId
          );
          if (!resolvedMilestone) {
            throw new Error("Milestone not found");
          }
          update.milestoneId = resolvedMilestone;
        }
      }

      if (status !== undefined) {
        applyStatusUpdate(status, update);
      }

      const action = await Action.findOneAndUpdate(
        { _id: actionId, userId },
        update,
        { new: true }
      ).lean();

      if (!action) {
        throw new Error("Action not found");
      }

      if (status === "EXECUTED") {
        await syncMilestoneCompletionForAction(userId, actionId);
      }

      return serializeAction(action);
    },
  });
}

export async function updateActionStatus(
  input: UpdateActionStatusInput
): Promise<ActionResult<ActionDTO>> {
  return runMutation({
    schema: updateActionStatusSchema,
    input,
    errorMessage: "Failed to update action status",
    revalidatePaths: EXECUTION_PATHS,
    handler: async ({ userId, input: data }) => {
      const statusUpdate: Record<string, unknown> = {};
      applyStatusUpdate(data.status, statusUpdate);

      const action = await Action.findOneAndUpdate(
        { _id: data.id, userId },
        statusUpdate,
        { new: true }
      ).lean();

      if (!action) {
        throw new Error("Action not found");
      }

      if (data.status === "EXECUTED") {
        await syncMilestoneCompletionForAction(userId, data.id);
      }

      return serializeAction(action);
    },
  });
}

export async function deleteAction(
  input: DeleteActionInput
): Promise<ActionResult<{ id: string }>> {
  return runMutation({
    schema: deleteActionSchema,
    input,
    errorMessage: "Failed to delete action",
    revalidatePaths: EXECUTION_PATHS,
    handler: async ({ userId, input: data }) => {
      const action = await Action.findOneAndDelete({
        _id: data.id,
        userId,
      });

      if (!action) {
        throw new Error("Action not found");
      }

      return { id: data.id };
    },
  });
}
