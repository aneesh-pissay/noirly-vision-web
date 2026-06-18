"use server";

import { requireSessionUserId } from "@/lib/auth/session";
import { connectDB } from "@/lib/db";
import { buildPriorityMatrix } from "@/lib/goals/priority-matrix";
import {
  resolveGoalLastActivityAt,
  resolveGoalNextStep,
  resolveGoalWorkflowStatus,
} from "@/lib/goals/goal-workflow-status";
import {
  averageResolvedProgress,
  buildMilestonesByGoalMap,
  resolveGoalsProgressMap,
} from "@/lib/goals/goal-progress";
import { serializeGoal } from "@/lib/serializers/goal";
import { GOAL_CATEGORIES } from "@/lib/constants";
import { loadOsCounts } from "@/lib/progress/load-os-counts";
import { resolveGoalsLock } from "@/lib/progress/permissions";
import Action from "@/models/action.model";
import FocusSession from "@/models/focus-session.model";
import Goal from "@/models/goal.model";
import Milestone from "@/models/milestone.model";
import Vision from "@/models/vision.model";
import {
  buildMilestoneGoalIdMap,
  buildMilestoneIdsByGoal,
  countMilestoneLinkedActions,
  isMilestoneLinkedAction,
} from "@/lib/goals/milestone-actions";
import { buildActionGoalIdMap } from "@/lib/focus/session-goal";
import type { IMilestone } from "@/models/milestone.model";
import type {
  GoalCategoryInsight,
  GoalItem,
  GoalMilestoneItem,
  GoalsIntelligenceData,
  GoalsPageData,
  PriorityMatrixActionItem,
} from "@/features/goals/types";
import { id } from "@/lib/serializers";

export type GoalFormOptions = {
  visions: { id: string; title: string }[];
};

export async function getGoalFormOptions(): Promise<GoalFormOptions> {
  const userId = await requireSessionUserId();
  await connectDB();

  const visions = await Vision.find({ userId, status: "ACTIVE" })
    .sort({ createdAt: -1 })
    .select("title")
    .lean();

  return {
    visions: visions.map((vision) => ({
      id: id(vision._id),
      title: vision.title,
    })),
  };
}

type MilestoneRecord = Pick<
  IMilestone,
  "_id" | "goalId" | "title" | "status" | "order" | "createdAt"
>;

function toGoalMilestoneItems(
  goalId: string,
  milestones: MilestoneRecord[],
  actions: Array<{ milestoneId?: { toString(): string } | null; status: string }>
): GoalMilestoneItem[] {
  return milestones
    .filter((milestone) => milestone.goalId.toString() === goalId)
    .sort((a, b) => a.order - b.order || a.createdAt.getTime() - b.createdAt.getTime())
    .map((milestone) => {
      const milestoneId = milestone._id.toString();
      const linked = actions.filter(
        (action) => action.milestoneId?.toString() === milestoneId
      );
      const completedActions = linked.filter(
        (action) => action.status === "EXECUTED"
      ).length;
      const totalActions = linked.length;
      const progress =
        milestone.status === "completed"
          ? 100
          : totalActions === 0
            ? 0
            : Math.round((completedActions / totalActions) * 100);

      return {
        id: id(milestone._id),
        name: milestone.title,
        completed: milestone.status === "completed",
        completedActions,
        totalActions,
        progress,
      };
    });
}

function toPriorityMatrixActions(
  actions: Array<{
    _id: { toString(): string };
    goalId?: { toString(): string } | null;
    milestoneId?: { toString(): string } | null;
    title: string;
    status: string;
  }>,
  goalsById: Map<string, GoalItem>,
  milestoneIdsByGoal: Map<string, Set<string>>,
  milestoneGoalIds: Map<string, string>
): PriorityMatrixActionItem[] {
  return actions
    .filter((action) => {
      if (action.status === "EXECUTED" || !action.milestoneId) return false;

      const milestoneId = action.milestoneId.toString();
      const goalId =
        action.goalId?.toString() ?? milestoneGoalIds.get(milestoneId);
      if (!goalId || !goalsById.has(goalId)) return false;

      const milestoneIds = milestoneIdsByGoal.get(goalId);
      if (!milestoneIds) return false;

      return isMilestoneLinkedAction(
        action,
        milestoneIds,
        goalId,
        milestoneGoalIds
      );
    })
    .map((action) => {
      const milestoneId = action.milestoneId!.toString();
      const goalId =
        action.goalId?.toString() ?? milestoneGoalIds.get(milestoneId)!;
      const goal = goalsById.get(goalId)!;

      return {
        id: action._id.toString(),
        title: action.title,
        goalTitle: goal.title,
        category: goal.category,
        impactScore: goal.impactScore,
        effortScore: goal.effortScore,
        status: action.status,
      };
    });
}

function buildCategoryInsights(
  items: GoalItem[],
  milestones: MilestoneRecord[],
  actions: Array<{
    _id: { toString(): string };
    goalId?: { toString(): string } | null;
    milestoneId?: { toString(): string } | null;
  }>,
  focusSessions: Array<{
    duration: number;
    actionId?: { toString(): string } | null;
  }>,
  milestoneIdsByGoal: Map<string, Set<string>>,
  milestoneGoalIds: Map<string, string>
): GoalCategoryInsight[] {
  const actionsById = new Map(
    actions.map((action) => [action._id.toString(), action])
  );

  return GOAL_CATEGORIES.map((category) => {
    const categoryGoals = items.filter((goal) => goal.category === category);
    if (categoryGoals.length === 0) return null;

    const goalIds = new Set(categoryGoals.map((goal) => goal.id));
    const categoryMilestoneIds = new Set<string>();

    for (const goalId of goalIds) {
      const milestoneIds = milestoneIdsByGoal.get(goalId);
      if (!milestoneIds) continue;
      milestoneIds.forEach((milestoneId) => categoryMilestoneIds.add(milestoneId));
    }

    const actionCount = actions.filter(
      (action) =>
        action.milestoneId &&
        categoryMilestoneIds.has(action.milestoneId.toString())
    ).length;

    let focusMinutes = 0;
    for (const session of focusSessions) {
      if (!session.actionId) continue;

      const action = actionsById.get(session.actionId.toString());
      if (!action?.milestoneId) continue;

      const goalId =
        action.goalId?.toString() ??
        milestoneGoalIds.get(action.milestoneId.toString());
      if (!goalId || !goalIds.has(goalId)) continue;

      focusMinutes += session.duration;
    }

    const milestoneCount = categoryGoals.reduce(
      (sum, goal) => sum + goal.milestones.length,
      0
    );

    return {
      name: category.charAt(0).toUpperCase() + category.slice(1),
      category,
      goals: categoryGoals.length,
      milestones: milestoneCount,
      focusHours: Math.round(focusMinutes / 60),
      actions: actionCount,
    };
  }).filter((category): category is GoalCategoryInsight => category !== null);
}

function toGoalItem(
  goal: ReturnType<typeof serializeGoal>,
  progress: number,
  actionCount: number,
  milestones: GoalMilestoneItem[]
): GoalItem {
  return {
    id: goal.id,
    title: goal.title,
    description: goal.description,
    category: goal.category,
    status: goal.status,
    progress,
    impact: goal.impact,
    effort: goal.effort,
    priority: goal.priority,
    visionId: goal.visionId,
    impactScore: goal.impactScore,
    effortScore: goal.effortScore,
    targetDate: goal.targetDate,
    milestones,
    actionCount,
  };
}

export async function getGoalsPageData(): Promise<GoalsPageData> {
  const userId = await requireSessionUserId();
  await connectDB();

  const counts = await loadOsCounts(userId);
  const lock = resolveGoalsLock(counts);

  const [goals, actions, milestones, focusSessions] = await Promise.all([
    Goal.find({ userId, status: "ACTIVE" }).sort({ progress: -1, priority: -1 }).lean(),
    Action.find({ userId }).lean(),
    Milestone.find({ userId }).sort({ order: 1, createdAt: 1 }).lean(),
    FocusSession.find({ userId, endedAt: { $ne: null } })
      .select("duration actionId")
      .lean(),
  ]);

  const milestonesByGoal = buildMilestonesByGoalMap(milestones);
  const progressMap = resolveGoalsProgressMap(goals, milestonesByGoal);
  const milestoneIdsByGoal = buildMilestoneIdsByGoal(milestones);
  const milestoneGoalIds = buildMilestoneGoalIdMap(milestones);

  const items = goals
    .map((goal) => {
      const serialized = serializeGoal(goal);
      const goalId = goal._id.toString();
      const goalMilestoneIds = milestoneIdsByGoal.get(goalId) ?? new Set<string>();
      const goalActionCount = countMilestoneLinkedActions(
        actions,
        goalMilestoneIds,
        goalId,
        milestoneGoalIds
      );
      const goalMilestones = toGoalMilestoneItems(goalId, milestones, actions);

      return toGoalItem(
        serialized,
        progressMap.get(goalId) ?? serialized.progress,
        goalActionCount,
        goalMilestones
      );
    })
    .sort((a, b) => b.progress - a.progress);

  const milestonesTotal = items.reduce((sum, goal) => sum + goal.milestones.length, 0);
  const milestonesCompleted = items.reduce(
    (sum, goal) => sum + goal.milestones.filter((m) => m.completed).length,
    0
  );
  const averageProgress = averageResolvedProgress(items.map((goal) => goal.progress));

  const categoryInsights = buildCategoryInsights(
    items,
    milestones,
    actions,
    focusSessions,
    milestoneIdsByGoal,
    milestoneGoalIds
  );

  const goalsById = new Map(items.map((goal) => [goal.id, goal]));
  const matrixActions = toPriorityMatrixActions(
    actions,
    goalsById,
    milestoneIdsByGoal,
    milestoneGoalIds
  );
  const matrix = buildPriorityMatrix(matrixActions);
  const totalActions = items.reduce((sum, goal) => sum + goal.actionCount, 0);

  return {
    lock,
    stats: {
      activeGoals: items.length,
      averageProgress,
      milestonesTotal,
      milestonesCompleted,
      alignmentScore: averageProgress,
    },
    primaryGoal: items[0] ?? null,
    goals: items,
    goalOptions: items.map((goal) => ({
      id: goal.id,
      title: goal.title,
      milestones: goal.milestones.map((milestone) => ({
        id: milestone.id,
        title: milestone.name,
      })),
    })),
    categories: categoryInsights,
    priorityMatrix: {
      highImpactLowEffort: matrix.highImpactLowEffort,
      highImpactHighEffort: matrix.highImpactHighEffort,
      lowImpactLowEffort: matrix.lowImpactLowEffort,
      lowImpactHighEffort: matrix.lowImpactHighEffort,
    },
    totalActions,
  };
}

export async function getGoalsIntelligenceData(): Promise<GoalsIntelligenceData> {
  const userId = await requireSessionUserId();
  await connectDB();

  const [goals, actions, milestones, focusSessions] = await Promise.all([
    Goal.find({ userId, status: "ACTIVE" })
      .sort({ progress: -1, impactScore: -1 })
      .lean(),
    Action.find({ userId }).lean(),
    Milestone.find({ userId }).sort({ order: 1, createdAt: 1 }).lean(),
    FocusSession.find({ userId, endedAt: { $ne: null } })
      .select("actionId endedAt")
      .lean(),
  ]);

  if (goals.length === 0) {
    return {
      hasGoals: false,
      primaryGoalTitle: null,
      workflow: null,
      nextStepTitle: null,
      milestonesCompleted: 0,
      milestonesTotal: 0,
    };
  }

  const milestonesByGoal = buildMilestonesByGoalMap(milestones);
  const progressMap = resolveGoalsProgressMap(goals, milestonesByGoal);
  const milestoneIdsByGoal = buildMilestoneIdsByGoal(milestones);
  const milestoneGoalIds = buildMilestoneGoalIdMap(milestones);
  const actionGoalIds = buildActionGoalIdMap(actions);

  const items = goals
    .map((goal) => {
      const serialized = serializeGoal(goal);
      const goalId = goal._id.toString();
      const goalMilestoneIds = milestoneIdsByGoal.get(goalId) ?? new Set<string>();
      const goalActionCount = countMilestoneLinkedActions(
        actions,
        goalMilestoneIds,
        goalId,
        milestoneGoalIds
      );

      return toGoalItem(
        serialized,
        progressMap.get(goalId) ?? serialized.progress,
        goalActionCount,
        toGoalMilestoneItems(goalId, milestones, actions)
      );
    })
    .sort((a, b) => b.progress - a.progress);

  const primary = items[0];
  const primaryRecord = goals.find(
    (goal) => goal._id.toString() === primary.id
  )!;
  const primaryMilestoneIds =
    milestoneIdsByGoal.get(primary.id) ?? new Set<string>();
  const primaryGoalActions = actions.filter((action) =>
    isMilestoneLinkedAction(
      action,
      primaryMilestoneIds,
      primary.id,
      milestoneGoalIds
    )
  );
  const lastActivityAt = resolveGoalLastActivityAt(
    primary.id,
    primaryRecord.updatedAt,
    actions,
    focusSessions,
    actionGoalIds
  );
  const workflow = resolveGoalWorkflowStatus({
    milestoneCount: primary.milestones.length,
    actionCount: primary.actionCount,
    hasInProgressAction: primaryGoalActions.some(
      (action) => action.status === "IN_PROGRESS"
    ),
    lastActivityAt,
  });
  const nextStep = resolveGoalNextStep(workflow);
  const milestonesCompleted = primary.milestones.filter(
    (milestone) => milestone.completed
  ).length;

  return {
    hasGoals: true,
    primaryGoalTitle: primary.title,
    workflow,
    nextStepTitle: nextStep.title,
    milestonesCompleted,
    milestonesTotal: primary.milestones.length,
  };
}
