"use server";

import { checkFocusSessionAchievements } from "@/services/achievement-checker";
import { runMutation } from "@/lib/actions/run-action";
import { loadOsCounts } from "@/lib/progress/load-os-counts";
import {
  assertFocusUnlocked,
  resolveOsPermissions,
} from "@/lib/progress/permissions";
import {
  markActionExecutedFromFocus,
  recordFocusTimeOnAction,
} from "@/lib/focus/action-progress";
import { calculateFocusDurationMinutes } from "@/lib/focus/session-duration";
import { resolveActionIdForUser } from "@/lib/focus/verify-action";
import { applyStatusUpdate } from "@/lib/serializers/action";
import { serializeFocusSession } from "@/lib/serializers/focus";
import {
  completeFocusSessionSchema,
  pauseFocusSessionSchema,
  resumeFocusSessionSchema,
  startFocusSessionSchema,
  type CompleteFocusSessionInput,
  type PauseFocusSessionInput,
  type ResumeFocusSessionInput,
  type StartFocusSessionInput,
} from "@/lib/validations/focus";
import Action from "@/models/action.model";
import FocusSession from "@/models/focus-session.model";
import type { ActionResult } from "@/types";
import type { FocusSessionDTO } from "@/types/focus";

const FOCUS_PATHS = [
  "/dashboard/focus",
  "/dashboard/execution",
  "/dashboard/goals",
  "/dashboard/vision",
  "/dashboard",
];

async function getMissionTitle(actionId?: string) {
  if (!actionId) return "Focus Session";
  const action = await Action.findById(actionId).select("title").lean();
  return action?.title ?? "Focus Session";
}

const ACTIVE_SESSION_FILTER = {
  endedAt: null,
  $or: [{ status: "active" as const }, { status: { $exists: false } }],
};

async function getActiveSession(userId: string) {
  return FocusSession.findOne({
    userId,
    ...ACTIVE_SESSION_FILTER,
  }).lean();
}

export async function startFocusSession(
  input: StartFocusSessionInput
): Promise<ActionResult<FocusSessionDTO>> {
  return runMutation({
    schema: startFocusSessionSchema,
    input,
    errorMessage: "Failed to start focus session",
    revalidatePaths: FOCUS_PATHS,
    handler: async ({ userId, input: data }) => {
      const permissions = resolveOsPermissions(await loadOsCounts(userId));
      assertFocusUnlocked(permissions);

      const existing = await getActiveSession(userId);
      if (existing) {
        throw new Error("A focus session is already active");
      }

      const actionId = await resolveActionIdForUser(userId, data.actionId);
      if (!actionId) {
        throw new Error("Action not found");
      }

      const action = await Action.findOne({ _id: actionId, userId }).lean();
      if (!action) {
        throw new Error("Action not found");
      }

      const session = await FocusSession.create({
        userId,
        actionId,
        mode: data.mode,
        distractionBlocking: data.distractionBlocking,
        status: "active",
        startedAt: new Date(),
        plannedMinutes: data.plannedMinutes,
        duration: 0,
        totalPausedSeconds: 0,
      });

      if (action.status === "PLANNED") {
        const update: Record<string, unknown> = {};
        applyStatusUpdate("IN_PROGRESS", update);
        await Action.findOneAndUpdate({ _id: actionId, userId }, update);
      }

      const mission = await getMissionTitle(actionId.toString());
      return serializeFocusSession(session, mission);
    },
  });
}

export async function pauseFocusSession(
  input: PauseFocusSessionInput
): Promise<ActionResult<FocusSessionDTO>> {
  return runMutation({
    schema: pauseFocusSessionSchema,
    input,
    errorMessage: "Failed to pause focus session",
    revalidatePaths: FOCUS_PATHS,
    handler: async ({ userId, input: data }) => {
      const session = await FocusSession.findOne({
        _id: data.id,
        userId,
        ...ACTIVE_SESSION_FILTER,
      }).lean();

      if (!session) {
        throw new Error("Active focus session not found");
      }

      if (session.pausedAt) {
        throw new Error("Session is already paused");
      }

      const updated = await FocusSession.findOneAndUpdate(
        { _id: data.id, userId, ...ACTIVE_SESSION_FILTER },
        { pausedAt: new Date() },
        { new: true }
      ).lean();

      if (!updated) {
        throw new Error("Failed to pause session");
      }

      const mission = await getMissionTitle(updated.actionId?.toString());
      return serializeFocusSession(updated, mission);
    },
  });
}

export async function resumeFocusSession(
  input: ResumeFocusSessionInput
): Promise<ActionResult<FocusSessionDTO>> {
  return runMutation({
    schema: resumeFocusSessionSchema,
    input,
    errorMessage: "Failed to resume focus session",
    revalidatePaths: FOCUS_PATHS,
    handler: async ({ userId, input: data }) => {
      const session = await FocusSession.findOne({
        _id: data.id,
        userId,
        ...ACTIVE_SESSION_FILTER,
      }).lean();

      if (!session) {
        throw new Error("Active focus session not found");
      }

      if (!session.pausedAt) {
        throw new Error("Session is not paused");
      }

      const pauseSeconds = Math.floor(
        (Date.now() - new Date(session.pausedAt).getTime()) / 1000
      );

      const updated = await FocusSession.findOneAndUpdate(
        { _id: data.id, userId, ...ACTIVE_SESSION_FILTER },
        {
          $unset: { pausedAt: "" },
          $inc: { totalPausedSeconds: pauseSeconds },
        },
        { new: true }
      ).lean();

      if (!updated) {
        throw new Error("Failed to resume session");
      }

      const mission = await getMissionTitle(updated.actionId?.toString());
      return serializeFocusSession(updated, mission);
    },
  });
}

export async function completeFocusSession(
  input: CompleteFocusSessionInput
): Promise<ActionResult<FocusSessionDTO>> {
  return runMutation({
    schema: completeFocusSessionSchema,
    input,
    errorMessage: "Failed to complete focus session",
    revalidatePaths: FOCUS_PATHS,
    handler: async ({ userId, input: data }) => {
      const session = await FocusSession.findOne({
        _id: data.id,
        userId,
        ...ACTIVE_SESSION_FILTER,
      }).lean();

      if (!session) {
        throw new Error("Active focus session not found");
      }

      const completedAt = new Date();
      const duration = calculateFocusDurationMinutes(session, completedAt);

      const updated = await FocusSession.findOneAndUpdate(
        { _id: data.id, userId, ...ACTIVE_SESSION_FILTER },
        {
          status: "completed",
          endedAt: completedAt,
          completedAt,
          duration,
          quality: data.quality,
          reflection: data.reflection,
          $unset: { pausedAt: "" },
        },
        { new: true }
      ).lean();

      if (!updated) {
        throw new Error("Failed to complete session");
      }

      if (updated.actionId) {
        if (!data.actionOutcome) {
          throw new Error("Choose whether you finished the linked action");
        }

        if (data.actionOutcome === "executed") {
          await markActionExecutedFromFocus({
            userId,
            actionId: updated.actionId.toString(),
          });
        } else {
          await recordFocusTimeOnAction({
            userId,
            actionId: updated.actionId.toString(),
            sessionMinutes: duration,
          });
        }
      }

      const mission = await getMissionTitle(updated.actionId?.toString());

      void checkFocusSessionAchievements(
        userId,
        updated._id.toString()
      ).catch(console.error);

      return serializeFocusSession(updated, mission);
    },
  });
}
