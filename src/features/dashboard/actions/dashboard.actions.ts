"use server";



import { requireSessionUserId } from "@/lib/auth/session";

import { connectDB } from "@/lib/db";

import { calculateWeeklyDeepWorkHours, startOfWeek } from "@/lib/focus/metrics";

import {

  buildMilestonesByGoalMap,

  resolveGoalsProgressMap,

} from "@/lib/goals/goal-progress";

import {

  buildStrategicChainDisplay,

  resolveSystemLifecycle,

  type StrategicChainDisplay,

  type SystemLifecycle,

} from "@/lib/progress/lifecycle";

import {

  calculateVisionProgress,

  countCompletedActions,

  resolveActiveMission,

  resolveExecutionScore,

} from "@/lib/metrics/strategic-os";

import Action from "@/models/action.model";

import FocusSession from "@/models/focus-session.model";

import Goal from "@/models/goal.model";

import Milestone from "@/models/milestone.model";

import Vision from "@/models/vision.model";

import type { DashboardPageData } from "@/features/dashboard/types";



const WEEK_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];



function startOfLastWeek(date = new Date()) {

  const weekStart = startOfWeek(date);

  const last = new Date(weekStart);

  last.setDate(last.getDate() - 7);

  return last;

}



export async function getDashboardPageData(): Promise<DashboardPageData> {

  const userId = await requireSessionUserId();

  await connectDB();



  const weekStart = startOfWeek();

  const lastWeekStart = startOfLastWeek();



  const [

    vision,

    goals,

    allActions,

    sessions,

    milestones,

    lastWeekSessions,

    completedFocusSessionCount,

  ] = await Promise.all([

    Vision.findOne({ userId, status: "ACTIVE" }).lean(),

    Goal.find({ userId, status: "ACTIVE" }).sort({ progress: -1 }).lean(),

    Action.find({ userId }).lean(),

    FocusSession.find({

      userId,

      startedAt: { $gte: weekStart },

      endedAt: { $ne: null },

    }).lean(),

    Milestone.find({ userId }).select("goalId status title").lean(),

    FocusSession.find({

      userId,

      startedAt: { $gte: lastWeekStart, $lt: weekStart },

      endedAt: { $ne: null },

    }).lean(),

    FocusSession.countDocuments({ userId, endedAt: { $ne: null } }),

  ]);



  const connectedGoals = vision

    ? goals.filter((goal) => goal.visionId?.toString() === vision._id.toString())

    : [];



  const milestonesByGoal = buildMilestonesByGoalMap(milestones);

  const progressMap = resolveGoalsProgressMap(goals, milestonesByGoal);

  const visionProgress = calculateVisionProgress(connectedGoals, milestones);

  const missionDoc = resolveActiveMission(allActions);

  const executionScore = resolveExecutionScore(allActions);

  const completedActions = countCompletedActions(allActions);



  const focusTrend = WEEK_LABELS.map((label, i) => {

    const d = new Date(weekStart);

    d.setDate(d.getDate() + i);

    const key = d.toDateString();

    const minutes = sessions

      .filter((session) => new Date(session.startedAt).toDateString() === key)

      .reduce((sum, session) => sum + session.duration, 0);

    return { label, minutes };

  });



  const focusHours = calculateWeeklyDeepWorkHours(sessions, weekStart);

  const primaryGoal = connectedGoals[0] ?? goals[0];

  const primaryGoalMilestones = primaryGoal

    ? milestones.filter(

        (milestone) => milestone.goalId.toString() === primaryGoal._id.toString()

      )

    : [];

  const firstMilestone = primaryGoalMilestones[0];

  const activeMilestone = missionDoc?.milestoneId

    ? milestones.find(

        (milestone) => milestone._id.toString() === missionDoc.milestoneId?.toString()

      )

    : firstMilestone;



  const lifecycle = resolveSystemLifecycle({

    hasVision: Boolean(vision),

    visionTitle: vision?.title ?? null,

    goalCount: connectedGoals.length || goals.length,

    primaryGoalTitle: primaryGoal?.title ?? null,

    milestoneCount: milestones.length,

    actionCount: allActions.length,

    completedActionCount: completedActions,

    completedFocusSessionCount,

    activeActionTitle: missionDoc?.title ?? null,

  });



  const strategicChain: StrategicChainDisplay = buildStrategicChainDisplay({

    visionTitle: vision?.title ?? null,

    primaryGoalTitle: primaryGoal?.title ?? null,

    milestoneTitle: activeMilestone?.title ?? null,

    actionTitle: missionDoc?.title ?? null,

    goalCount: connectedGoals.length || goals.length,

    milestoneCount: milestones.length,

    actionCount: allActions.length,

  });



  const goalSummaries = goals.slice(0, 5).map((goal) => {

    const goalId = goal._id.toString();

    const goalMilestones = milestones.filter(

      (milestone) => milestone.goalId.toString() === goalId

    );



    return {

      id: goalId,

      title: goal.title,

      progress: progressMap.get(goalId) ?? goal.progress,

      milestoneCount: goalMilestones.length,

    };

  });



  const lifecycleSummary: Pick<SystemLifecycle, "level" | "statusLabel" | "description"> =

    {

      level: lifecycle.level,

      statusLabel: lifecycle.statusLabel,

      description: lifecycle.description,

    };



  return {

    vision: vision

      ? {

          title: vision.title,

          lifeArea: vision.area ?? "personal",

          progress: visionProgress,

          connectedGoalCount: connectedGoals.length,

          focusArea: primaryGoal?.category ?? null,

        }

      : null,

    lifecycle: lifecycleSummary,

    executionScore,

    totalActions: allActions.length,
    milestoneCount: milestones.length,

    mission: missionDoc

      ? { id: missionDoc._id.toString(), title: missionDoc.title }

      : null,

    strategicChain,

    focusTrend,

    focusHours,

    focusSessionCount: sessions.length,

    weeklyReview: {

      completedActions,

      focusHours,

      progressChange: null,

    },

    goals: goalSummaries,

  };

}


