"use server";

import { requireSessionUserId } from "@/lib/auth/session";
import { connectDB } from "@/lib/db";
import { iso } from "@/lib/serializers";
import Action from "@/models/action.model";
import FocusSession from "@/models/focus-session.model";
import Goal from "@/models/goal.model";
import Milestone from "@/models/milestone.model";
import Vision from "@/models/vision.model";
import type {
  VisionGoalRoadmap,
  VisionLifeArea,
  VisionPageData,
  VisionPerformanceMetrics,
} from "@/features/vision/types";
import {
  averageResolvedProgress,
  buildMilestonesByGoalMap,
  resolveGoalsProgressMap,
} from "@/lib/goals/goal-progress";
import {
  buildVisionJourneyTimeline,
  filterGoalsForVision,
  formatAreaLabel,
  resolveVisionNextStep,
} from "@/features/vision/lib/vision-page-utils";

function filterMilestoneLinkedActions(
  visionMilestones: Array<{
    _id: { toString(): string };
    goalId: { toString(): string };
  }>,
  actions: Array<{
    goalId?: { toString(): string } | null;
    milestoneId?: { toString(): string } | null;
    status: string;
  }>
) {
  const milestoneGoalMap = new Map(
    visionMilestones.map((milestone) => [
      milestone._id.toString(),
      milestone.goalId.toString(),
    ])
  );

  return actions.filter((action) => {
    const milestoneId = action.milestoneId?.toString();
    const goalId = action.goalId?.toString();
    if (!milestoneId || !goalId) {
      return false;
    }

    return milestoneGoalMap.get(milestoneId) === goalId;
  });
}

// Returns null when no actions exist (milestone needs actions to start).
// Returns 100 when completed, or the real % from actions otherwise.
function milestoneActionProgress(
  completed: boolean,
  completedActions: number,
  totalActions: number
): number | null {
  if (completed) return 100;
  if (totalActions === 0) return null;
  return Math.round((completedActions / totalActions) * 100);
}

function buildGoalRoadmaps(
  goals: Array<{ _id: { toString(): string }; title: string; progress: number }>,
  milestones: Array<{
    _id: { toString(): string };
    goalId: { toString(): string };
    title: string;
    status: "active" | "completed";
  }>,
  actions: Array<{
    milestoneId?: { toString(): string } | null;
    status: string;
  }>
): VisionGoalRoadmap[] {
  return goals.map((goal) => {
    const goalId = goal._id.toString();
    const goalMilestones = milestones
      .filter((milestone) => milestone.goalId.toString() === goalId)
      .map((milestone) => {
        const milestoneId = milestone._id.toString();
        const linked = actions.filter(
          (action) => action.milestoneId?.toString() === milestoneId
        );
        const completedActions = linked.filter(
          (action) => action.status === "EXECUTED"
        ).length;
        const totalActions = linked.length;
        const completed = milestone.status === "completed";

        return {
          id: milestoneId,
          title: milestone.title,
          completed,
          completedActions,
          totalActions,
          progress: milestoneActionProgress(
            completed,
            completedActions,
            totalActions
          ),
        };
      });

    // Goal progress: null when no milestones, otherwise live from milestone completion.
    const goalProgressValue: number | null =
      goalMilestones.length === 0
        ? null
        : Math.round(
            (goalMilestones.filter((m) => m.completed).length /
              goalMilestones.length) *
              100
          );

    return {
      id: goalId,
      title: goal.title,
      progress: goalProgressValue,
      milestones: goalMilestones,
    };
  });
}

function buildLifeAreasForVision(
  goals: Array<{
    _id: { toString(): string };
    category: string;
    progress: number;
  }>,
  focusSessions: Array<{
    duration: number;
    actionId?: { toString(): string } | null;
  }>,
  actions: Array<{
    _id: { toString(): string };
    goalId?: { toString(): string } | null;
  }>
): VisionLifeArea[] {
  const areaMap = new Map<
    string,
    {
      activeGoals: number;
      totalProgress: number;
      focusMinutes: number;
    }
  >();
  const goalToArea = new Map<string, string>();
  const actionToGoal = new Map(
    actions.map((action) => [action._id.toString(), action.goalId?.toString()])
  );

  for (const goal of goals) {
    const name = formatAreaLabel(goal.category);
    const goalId = goal._id.toString();
    goalToArea.set(goalId, name);
    const existing = areaMap.get(name);

    if (existing) {
      existing.activeGoals += 1;
      existing.totalProgress += goal.progress;
    } else {
      areaMap.set(name, {
        activeGoals: 1,
        totalProgress: goal.progress,
        focusMinutes: 0,
      });
    }
  }

  for (const session of focusSessions) {
    const goalId = session.actionId
      ? actionToGoal.get(session.actionId.toString())
      : undefined;
    if (!goalId) continue;

    const areaName = goalToArea.get(goalId);
    if (!areaName) continue;

    const area = areaMap.get(areaName);
    if (area) {
      area.focusMinutes += session.duration;
    }
  }

  return Array.from(areaMap.entries()).map(([name, data]) => ({
    name,
    activeGoals: data.activeGoals,
    focusHours: Math.round(data.focusMinutes / 60),
    alignment:
      data.activeGoals > 0
        ? Math.round(data.totalProgress / data.activeGoals)
        : 0,
  }));
}

export async function getVisionPageData(): Promise<VisionPageData> {
  const userId = await requireSessionUserId();
  await connectDB();

  const [visions, goals, milestones, actions, focusSessions] = await Promise.all([
    Vision.find({ userId }).sort({ createdAt: -1 }).lean(),
    Goal.find({ userId }).sort({ progress: -1 }).lean(),
    Milestone.find({ userId }).sort({ order: 1, createdAt: 1 }).lean(),
    Action.find({ userId }).select("_id goalId milestoneId status").lean(),
    FocusSession.find({ userId, endedAt: { $ne: null } })
      .select("duration actionId")
      .lean(),
  ]);

  const activeVision = visions.find((v) => v.status === "ACTIVE") ?? null;

  if (!activeVision) {
    return {
      vision: null,
      trajectory: [],
      alignmentScore: 0,
      activeGoals: [],
      connectedGoalCount: 0,
      nextStep: {
        title: "Create your first vision",
        description: "Define the future you are building toward.",
      },
    };
  }

  const visionId = activeVision._id.toString();
  const visionGoals = filterGoalsForVision(goals, visionId);
  const milestonesByGoal = buildMilestonesByGoalMap(milestones);
  const progressMap = resolveGoalsProgressMap(visionGoals, milestonesByGoal);
  const resolvedVisionGoals = visionGoals.map((goal) => ({
    ...goal,
    progress: progressMap.get(goal._id.toString()) ?? goal.progress,
  }));
  const connectedGoals = resolvedVisionGoals.filter(
    (goal) => goal.status === "ACTIVE"
  );
  const visionGoalIds = new Set(
    resolvedVisionGoals.map((goal) => goal._id.toString())
  );
  const visionMilestones = milestones.filter((milestone) =>
    visionGoalIds.has(milestone.goalId.toString())
  );
  const trajectory = buildVisionJourneyTimeline(
    activeVision,
    resolvedVisionGoals,
    visionMilestones
  );
  // Vision progress is null (Setup Required) until connected goals have milestones.
  const hasMilestonesForConnectedGoals = visionMilestones.length > 0;
  const progress: number | null = hasMilestonesForConnectedGoals
    ? averageResolvedProgress(connectedGoals.map((goal) => goal.progress))
    : null;
  const resolvedGoals = connectedGoals;
  const milestoneLinkedActions = filterMilestoneLinkedActions(
    visionMilestones,
    actions
  );

  const performanceMetrics: VisionPerformanceMetrics = {
    connectedGoals: connectedGoals.length,
    totalMilestones: visionMilestones.length,
    completedMilestones: visionMilestones.filter(
      (milestone) => milestone.status === "completed"
    ).length,
    totalActions: milestoneLinkedActions.length,
    completedActions: milestoneLinkedActions.filter(
      (action) => action.status === "EXECUTED"
    ).length,
    focusHours: Math.round(
      focusSessions.reduce((sum, session) => sum + session.duration, 0) / 60
    ),
  };

  return {
    vision: {
      id: visionId,
      title: activeVision.title,
      description: activeVision.description,
      area: activeVision.area,
      targetDate: iso(activeVision.targetDate),
      phase: activeVision.phase,
      successMetric: activeVision.successMetric,
      progress,
      status: activeVision.status,
      goalRoadmaps: buildGoalRoadmaps(resolvedGoals, milestones, actions),
      performanceMetrics,
      lifeAreas: buildLifeAreasForVision(resolvedGoals, focusSessions, actions),
    },
    trajectory,
    alignmentScore: progress,  // may be null
    activeGoals: resolvedGoals.map((goal) => ({
      id: goal._id.toString(),
      name: goal.title,
      progress: goal.progress,
    })),
    connectedGoalCount: connectedGoals.length,
    nextStep: resolveVisionNextStep(connectedGoals, milestones, actions),
  };
}
