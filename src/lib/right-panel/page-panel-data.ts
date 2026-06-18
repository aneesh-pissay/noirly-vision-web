"use server";

import { requireSessionUserId } from "@/lib/auth/session";
import { connectDB } from "@/lib/db";
import {
  calculateExecutionScore,
  calculateTodayExecutionMomentum,
  startOfToday,
} from "@/lib/execution/metrics";
import { calculateKnowledgeAlignment } from "@/lib/vault/metrics";
import {
  calculateBestFocusWindow,
  calculateWeeklyDeepWorkHours,
  startOfWeek,
} from "@/lib/focus/metrics";
import {
  averageResolvedProgress,
  buildMilestonesByGoalMap,
  resolveGoalsProgressMap,
} from "@/lib/goals/goal-progress";
import { id } from "@/lib/serializers";
import { resolveStrategicIntelligence } from "@/lib/intelligence/resolver";
import type { StrategicIntelligence } from "@/lib/intelligence/resolver";
import { resolveActiveMission } from "@/lib/metrics/strategic-os";
import Action from "@/models/action.model";
import FocusSession from "@/models/focus-session.model";
import Goal from "@/models/goal.model";
import Milestone from "@/models/milestone.model";
import VaultEntry from "@/models/vault-entry.model";
import Vision from "@/models/vision.model";
import type { VisionTimelineEventType } from "@/features/vision/types";

export type VisionPanelData = {
  visionTitle: string | null;
  visionProgress: number;
  connectedGoalCount: number;
  connectedGoals: { id: string; title: string; progress: number }[];
  nextStep: { title: string; description: string } | null;
  timeline: {
    id: string;
    type: VisionTimelineEventType;
    title: string;
    subtitle: string;
    description?: string;
    date: string;
  }[];
};

export type ExecutionPanelData = {
  executionScore: number | null;
  todayMomentum: number | null;
  totalActions: number;
  currentAction: string | null;
  upcomingActions: string[];
  streakDays: number;
};

export type FocusPanelData = {
  hasActiveSession: boolean;
  sessionMission: string | null;
  isPaused: boolean;
  weeklyDeepWorkHours: number;
  recentSessions: { mission: string; duration: number; quality: number }[];
  bestFocusWindow: string | null;
  consistencyDays: number;
};

export type PagePanelsData = {
  intelligence: StrategicIntelligence;
  vision: VisionPanelData;
  execution: ExecutionPanelData;
  focus: FocusPanelData;
  vaultAlignment: number;
  vaultLinkedCount: number;
  vaultTotalCount: number;
};

export async function getPagePanelsData(): Promise<PagePanelsData> {
  const userId = await requireSessionUserId();
  await connectDB();

  const weekStart = startOfWeek();
  const todayStart = startOfToday();

  const [
    visions,
    goals,
    actions,
    milestones,
    activeSession,
    recentSessions,
    weekSessions,
    vaultEntries,
    completedFocusCount,
  ] = await Promise.all([
    Vision.find({ userId }).sort({ createdAt: -1 }).lean(),
    Goal.find({ userId }).sort({ progress: -1 }).lean(),
    Action.find({ userId }).lean(),
    Milestone.find({ userId })
      .select("goalId status title completedAt updatedAt")
      .lean(),
    FocusSession.findOne({ userId, endedAt: null }).lean(),
    FocusSession.find({ userId, endedAt: { $ne: null } })
      .sort({ endedAt: -1 })
      .limit(3)
      .lean(),
    FocusSession.find({
      userId,
      startedAt: { $gte: weekStart },
      endedAt: { $ne: null },
    }).lean(),
    VaultEntry.find({ userId }).lean(),
    FocusSession.countDocuments({ userId, endedAt: { $ne: null } }),
  ]);

  const activeVision = visions.find((vision) => vision.status === "ACTIVE") ?? null;
  const connectedGoals = activeVision
    ? goals.filter(
        (goal) =>
          goal.status === "ACTIVE" &&
          goal.visionId?.toString() === activeVision._id.toString()
      )
    : [];

  const milestonesByGoal = buildMilestonesByGoalMap(milestones);
  const progressMap = resolveGoalsProgressMap(goals, milestonesByGoal);
  const resolvedConnectedGoals = connectedGoals.map((goal) => ({
    ...goal,
    progress: progressMap.get(goal._id.toString()) ?? goal.progress,
  }));

  const visionProgress = averageResolvedProgress(
    resolvedConnectedGoals.map((goal) => goal.progress)
  );

  const currentAction = resolveActiveMission(actions);
  const primaryGoal = goals.find((goal) => goal.status === "ACTIVE") ?? goals[0];
  const completedActionCount = actions.filter(
    (action) => action.status === "EXECUTED"
  ).length;

  const upcomingActions = actions
    .filter((action) => action.status === "PLANNED")
    .slice(0, 3)
    .map((action) => action.title);

  const executedDays = new Set(
    actions
      .filter((action) => action.status === "EXECUTED" && action.completedAt)
      .map((action) => new Date(action.completedAt!).toDateString())
  );

  const bestWindow = calculateBestFocusWindow(weekSessions);
  const focusDays = new Set(
    weekSessions.map((session) => new Date(session.startedAt).toDateString())
  );
  const weeklyDeepWorkHours = calculateWeeklyDeepWorkHours(weekSessions, weekStart);

  const intelligence = resolveStrategicIntelligence({
    hasVision: Boolean(activeVision),
    visionTitle: activeVision?.title ?? null,
    goalCount: goals.length,
    primaryGoalTitle: primaryGoal?.title ?? null,
    milestoneCount: milestones.length,
    actionCount: actions.length,
    completedActionCount,
    completedFocusSessionCount: completedFocusCount,
    activeActionTitle: currentAction?.title ?? null,
  });

  const sessionTitles = await Promise.all(
    recentSessions.map(async (session) => {
      if (!session.actionId) return "Focus Session";
      const action = await Action.findById(session.actionId).select("title").lean();
      return action?.title ?? "Focus Session";
    })
  );

  return {
    intelligence,
    vision: {
      visionTitle: activeVision?.title ?? null,
      visionProgress,
      connectedGoalCount: connectedGoals.length,
      connectedGoals: resolvedConnectedGoals.slice(0, 4).map((goal) => ({
        id: id(goal._id),
        title: goal.title,
        progress: goal.progress,
      })),
      nextStep: {
        title: intelligence.nextStep.title,
        description: intelligence.nextStep.description,
      },
      timeline: [],
    },
    execution: {
      executionScore: calculateExecutionScore(actions),
      todayMomentum: calculateTodayExecutionMomentum(actions, todayStart),
      totalActions: actions.length,
      currentAction: currentAction?.title ?? null,
      upcomingActions,
      streakDays: executedDays.size,
    },
    focus: {
      hasActiveSession: Boolean(activeSession),
      sessionMission: activeSession
        ? await (async () => {
            if (!activeSession.actionId) return "Focus Session";
            const action = await Action.findById(activeSession.actionId)
              .select("title")
              .lean();
            return action?.title ?? "Focus Session";
          })()
        : null,
      isPaused: Boolean(activeSession?.pausedAt),
      weeklyDeepWorkHours,
      recentSessions: recentSessions.map((session, index) => ({
        mission: sessionTitles[index] ?? "Focus Session",
        duration: session.duration,
        quality: session.quality,
      })),
      bestFocusWindow: bestWindow?.label ?? null,
      consistencyDays: focusDays.size,
    },
    vaultAlignment: calculateKnowledgeAlignment(vaultEntries),
    vaultLinkedCount: vaultEntries.filter(
      (entry) => entry.linkedVision || entry.linkedGoal || entry.linkedAction
    ).length,
    vaultTotalCount: vaultEntries.length,
  };
}
