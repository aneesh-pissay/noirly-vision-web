"use server";

import { requireSessionUserId } from "@/lib/auth/session";
import { connectDB } from "@/lib/db";
import { pickTodaysMission } from "@/lib/execution/metrics";
import { buildExecutionChainsForActions } from "@/lib/focus/execution-chain";
import {
  buildConsistencyGrid,
  calculateBestFocusWindow,
  calculateWeeklyDeepWorkHours,
  calculateWeeklyDeepWorkMinutes,
  startOfWeek,
} from "@/lib/focus/metrics";
import { calculateFocusDurationSeconds } from "@/lib/focus/session-duration";
import { id, iso } from "@/lib/serializers";
import Action from "@/models/action.model";
import FocusSession from "@/models/focus-session.model";
import type { FocusPageData } from "@/features/focus/types";

export async function getFocusPageData(): Promise<FocusPageData> {
  const userId = await requireSessionUserId();
  await connectDB();

  const weekStart = startOfWeek();

  const [activeSession, recentSessions, weekSessions, activeActions] =
    await Promise.all([
      FocusSession.findOne({
        userId,
        endedAt: null,
        $or: [{ status: "active" }, { status: { $exists: false } }],
      }).lean(),
      FocusSession.find({ userId, endedAt: { $ne: null } })
        .sort({ endedAt: -1 })
        .limit(8)
        .lean(),
      FocusSession.find({ userId, startedAt: { $gte: weekStart } }).lean(),
      Action.find({
        userId,
        status: { $in: ["PLANNED", "IN_PROGRESS"] },
      })
        .sort({ priority: -1, updatedAt: -1 })
        .lean(),
    ]);

  const recentActionIds = recentSessions
    .map((session) => session.actionId?.toString())
    .filter((value): value is string => Boolean(value));

  const chainActionIds = [
    ...new Set([
      ...activeActions.map((action) => action._id.toString()),
      ...recentActionIds,
    ]),
  ];

  const chainActions =
    chainActionIds.length > 0
      ? await Action.find({ _id: { $in: chainActionIds }, userId })
          .select("title goalId")
          .lean()
      : [];

  const executionChains = await buildExecutionChainsForActions(
    userId,
    chainActions
  );

  const weeklyMinutes = calculateWeeklyDeepWorkMinutes(weekSessions, weekStart);
  const weeklyDeepWorkHours = calculateWeeklyDeepWorkHours(
    weekSessions,
    weekStart
  );
  const bestFocusWindow = calculateBestFocusWindow(weekSessions);

  const completedWeek = weekSessions.filter((session) => session.endedAt);
  const averageQuality =
    completedWeek.length > 0
      ? Math.round(
          completedWeek.reduce((sum, session) => sum + session.quality, 0) /
            completedWeek.length
        )
      : 0;

  const daySet = new Set(
    weekSessions.map((session) => new Date(session.startedAt).toDateString())
  );

  const missionAction = pickTodaysMission(activeActions);

  const activeActionId = activeSession?.actionId?.toString();
  const activeChain = activeActionId
    ? executionChains.get(activeActionId)
    : undefined;

  const linkedActionDoc = activeActionId
    ? activeActions.find((action) => action._id.toString() === activeActionId) ??
      (await Action.findOne({ _id: activeActionId, userId })
        .select("title estimatedMinutes completedMinutes progress")
        .lean())
    : null;

  const elapsedSeconds = activeSession
    ? calculateFocusDurationSeconds(activeSession)
    : 0;

  const plannedMinutes =
    activeSession?.plannedMinutes ?? activeSession?.duration ?? 90;
  const progress = activeSession
    ? Math.min(100, Math.round((elapsedSeconds / (plannedMinutes * 60)) * 100))
    : 0;

  const recentWithTitles = await Promise.all(
    recentSessions.map(async (session) => {
      const actionId = session.actionId?.toString();
      const chain = actionId ? executionChains.get(actionId) : undefined;

      return {
        id: id(session._id),
        mission: chain?.actionTitle ?? "Focus Session",
        mode: session.mode ?? "deep_work",
        plannedMinutes: session.plannedMinutes,
        duration: session.duration,
        quality: session.quality,
        reflection: session.reflection,
        completedAt: iso(session.endedAt),
      };
    })
  );

  return {
    activeSession: activeSession
      ? {
          id: id(activeSession._id),
          mission: activeChain?.actionTitle ?? "Focus Session",
          actionId: activeActionId,
          linkedAction: linkedActionDoc
            ? {
                id: activeActionId ?? id(linkedActionDoc._id),
                title: linkedActionDoc.title,
                estimatedMinutes: linkedActionDoc.estimatedMinutes,
                completedMinutes: linkedActionDoc.completedMinutes ?? 0,
                progress: linkedActionDoc.progress ?? 0,
              }
            : undefined,
          mode: activeSession.mode ?? "deep_work",
          distractionBlocking: activeSession.distractionBlocking ?? true,
          executionChain: {
            actionTitle: activeChain?.actionTitle ?? "Focus Session",
            goalTitle: activeChain?.goalTitle,
            visionTitle: activeChain?.visionTitle,
          },
          plannedMinutes,
          elapsedSeconds,
          quality: activeSession.quality,
          progress,
          isPaused: Boolean(activeSession.pausedAt),
          startedAt: iso(activeSession.startedAt) ?? new Date().toISOString(),
          pausedAt: iso(activeSession.pausedAt),
          totalPausedSeconds: activeSession.totalPausedSeconds ?? 0,
        }
      : null,
    recentSessions: recentWithTitles,
    actionOptions: activeActions.map((action) => {
      const chain = executionChains.get(action._id.toString());
      return {
        id: id(action._id),
        title: action.title,
        priority: action.priority,
        goalTitle: chain?.goalTitle,
        visionTitle: chain?.visionTitle,
      };
    }),
    stats: {
      weeklyMinutes,
      weeklyDeepWorkHours,
      consistencyDays: daySet.size,
      averageQuality,
      streak: daySet.size,
      bestFocusWindow: bestFocusWindow
        ? {
            label: bestFocusWindow.label,
            sessionCount: bestFocusWindow.sessionCount,
          }
        : null,
    },
    consistencyGrid: buildConsistencyGrid(weekSessions),
    suggestedActionId: missionAction?._id.toString(),
  };
}
