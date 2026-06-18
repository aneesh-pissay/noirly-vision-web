"use server";

import { requireSessionUserId } from "@/lib/auth/session";
import { connectDB } from "@/lib/db";
import { loadOsCounts } from "@/lib/progress/load-os-counts";
import { resolveVaultLock } from "@/lib/progress/permissions";
import { id } from "@/lib/serializers";
import { serializeVaultEntry } from "@/lib/serializers/vault";
import {
  buildTagCollections,
  calculateKnowledgeAlignment,
  isVaultEntryLinked,
} from "@/lib/vault/metrics";
import Action from "@/models/action.model";
import FocusSession from "@/models/focus-session.model";
import Goal from "@/models/goal.model";
import VaultEntry from "@/models/vault-entry.model";
import Vision from "@/models/vision.model";
import type { VaultEntryItem, VaultPageData } from "@/features/vault/types";

function toVaultEntryItem(
  entry: ReturnType<typeof serializeVaultEntry>
): VaultEntryItem {
  return {
    id: entry.id,
    type: entry.type,
    title: entry.title,
    content: entry.content,
    tags: entry.tags,
    linkedVision: entry.linkedVision,
    linkedGoal: entry.linkedGoal,
    linkedAction: entry.linkedAction,
    linkedFocusSession: entry.linkedFocusSession,
    linkedVisionTitle: entry.linkedVisionTitle,
    linkedGoalTitle: entry.linkedGoalTitle,
    linkedActionTitle: entry.linkedActionTitle,
    linkedFocusSessionTitle: entry.linkedFocusSessionTitle,
    isLinked: entry.isLinked,
    updatedAt: entry.updatedAt,
  };
}

export async function getVaultPageData(): Promise<VaultPageData> {
  const userId = await requireSessionUserId();
  await connectDB();

  const counts = await loadOsCounts(userId);
  const lock = resolveVaultLock(counts);

  const [entries, visions, goals, actions, focusSessions] = await Promise.all([
    VaultEntry.find({ userId }).sort({ updatedAt: -1 }).lean(),
    Vision.find({ userId }).sort({ updatedAt: -1 }).select("_id title").lean(),
    Goal.find({ userId })
      .sort({ updatedAt: -1 })
      .select("_id title visionId")
      .lean(),
    Action.find({ userId })
      .sort({ updatedAt: -1 })
      .select("_id title goalId")
      .lean(),
    FocusSession.find({ userId, endedAt: { $ne: null } })
      .sort({ endedAt: -1 })
      .select("_id actionId startedAt duration")
      .lean(),
  ]);

  const visionTitleMap = new Map(
    visions.map((vision) => [vision._id.toString(), vision.title])
  );
  const goalTitleMap = new Map(
    goals.map((goal) => [goal._id.toString(), goal.title])
  );
  const actionTitleMap = new Map(
    actions.map((action) => [action._id.toString(), action.title])
  );
  const focusSessionTitleMap = new Map(
    focusSessions.map((session) => {
      const actionTitle = session.actionId
        ? actionTitleMap.get(session.actionId.toString())
        : undefined;
      const duration = session.duration ?? 0;
      const label = actionTitle
        ? `${actionTitle} · ${duration}m`
        : `Session · ${duration}m`;
      return [session._id.toString(), label];
    })
  );

  const serialized = entries.map((entry) =>
    serializeVaultEntry(entry, {
      linkedVisionTitle: entry.linkedVision
        ? visionTitleMap.get(entry.linkedVision.toString())
        : undefined,
      linkedGoalTitle: entry.linkedGoal
        ? goalTitleMap.get(entry.linkedGoal.toString())
        : undefined,
      linkedActionTitle: entry.linkedAction
        ? actionTitleMap.get(entry.linkedAction.toString())
        : undefined,
      linkedFocusSessionTitle: entry.linkedFocusSession
        ? focusSessionTitleMap.get(entry.linkedFocusSession.toString())
        : undefined,
    })
  );

  const items = serialized.map(toVaultEntryItem);
  const collections = buildTagCollections(entries);
  const linkedEntries = entries.filter(isVaultEntryLinked).length;

  return {
    lock,
    collections,
    entries: items,
    linkOptions: {
      visions: visions.map((vision) => ({
        id: id(vision._id),
        title: vision.title,
      })),
      goals: goals.map((goal) => ({
        id: id(goal._id),
        title: goal.title,
        visionId: goal.visionId ? id(goal.visionId) : undefined,
      })),
      actions: actions.map((action) => ({
        id: id(action._id),
        title: action.title,
        goalId: action.goalId ? id(action.goalId) : undefined,
      })),
      focusSessions: focusSessions.map((session) => ({
        id: id(session._id),
        title:
          focusSessionTitleMap.get(session._id.toString()) ?? "Focus session",
        actionId: session.actionId ? id(session.actionId) : undefined,
      })),
    },
    stats: {
      totalEntries: entries.length,
      linkedEntries,
      knowledgeAlignment: calculateKnowledgeAlignment(entries),
      lessonsCaptured: entries.filter((entry) =>
        entry.type === "LESSON" || entry.type === "REFLECTION"
      ).length,
      decisionsLogged: entries.filter((entry) => entry.type === "DECISION").length,
      tagCount: collections.length,
    },
  };
}
