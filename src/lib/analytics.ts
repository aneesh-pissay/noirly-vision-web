import mongoose from "mongoose";
import { startOfToday } from "@/lib/execution/metrics";
import { calculateBestFocusWindow, startOfWeek } from "@/lib/focus/metrics";
import Action from "@/models/action.model";
import FocusSession from "@/models/focus-session.model";
import Goal from "@/models/goal.model";
import Milestone from "@/models/milestone.model";
import VaultEntry from "@/models/vault-entry.model";
import Vision from "@/models/vision.model";

const WEEK_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export type AnalyticsDashboardData = {
  metrics: {
    visionAlignment: number;
    goalProgress: number;
    executionScore: number;
    deepWorkHours: number;
    focusQuality: number;
    /** 0 when no comparison data available; not a real "100% growth" */
    vaultGrowth: number;
  };
  stats: {
    alignmentScore: number;
    focusHours: number;
    goalsOnTrack: number;
    executionVelocity: number;
    totalVaultEntries: number;
    vaultEntriesThisWeek: number;
    knowledgeAlignment: number;
    /** Total milestone count across all user goals */
    milestoneCount: number;
    /** Total action count */
    actionCount: number;
  };
  growthTrend: { label: string; value: number }[];
  actionDistribution: { label: string; value: number }[];
  focusConsistency: { date: string; score: number }[];
  vaultTrend: { label: string; value: number }[];
  systemStability: { label: string; value: number }[];
  goalHealth: { id: string; title: string; progress: number; status: string }[];
  deepWork: {
    bestWindow: string | null;
    avgSessionMinutes: number;
    weeklyMinutes: number;
  };
  insights: string[];
};

type CountResult = { count: number };
type AvgResult = { avg: number };
type SumResult = { total: number };
type StatusCount = { _id: string; count: number };
type DayQuality = { _id: number; avgQuality: number; totalMinutes: number };
type DayCount = { _id: string; count: number };
type DayProgress = { _id: string; avgProgress: number };

function toObjectId(userId: string) {
  return new mongoose.Types.ObjectId(userId);
}

function startOfLastWeek(weekStart: Date) {
  const start = new Date(weekStart);
  start.setDate(start.getDate() - 7);
  return start;
}

function mapDayOfWeekToLabel(dayOfWeek: number) {
  const map: Record<number, string> = {
    1: "Sun",
    2: "Mon",
    3: "Tue",
    4: "Wed",
    5: "Thu",
    6: "Fri",
    7: "Sat",
  };
  return map[dayOfWeek] ?? "Mon";
}

function roundPercent(value: number) {
  return Math.round(value);
}

function roundHours(minutes: number) {
  return Math.round((minutes / 60) * 10) / 10;
}

async function aggregateVisionAlignment(userId: mongoose.Types.ObjectId) {
  const activeVision = await Vision.findOne({ userId, status: "ACTIVE" })
    .select("_id")
    .lean();

  if (!activeVision) return 0;

  const [result] = await Goal.aggregate<AvgResult>([
    {
      $match: {
        userId,
        status: "ACTIVE",
        visionId: activeVision._id,
      },
    },
    {
      $group: {
        _id: null,
        avg: { $avg: "$progress" },
      },
    },
  ]);

  return roundPercent(result?.avg ?? 0);
}

async function aggregateGoalProgress(userId: mongoose.Types.ObjectId) {
  const [result] = await Goal.aggregate<AvgResult>([
    {
      $match: {
        userId,
        status: "ACTIVE",
      },
    },
    {
      $group: {
        _id: null,
        avg: { $avg: "$progress" },
      },
    },
  ]);

  return roundPercent(result?.avg ?? 0);
}

async function aggregateGoalsOnTrack(userId: mongoose.Types.ObjectId) {
  const [result] = await Goal.aggregate<CountResult>([
    {
      $match: {
        userId,
        status: "ACTIVE",
        progress: { $gte: 50 },
      },
    },
    { $count: "count" },
  ]);

  return result?.count ?? 0;
}

async function aggregateGoalHealth(userId: mongoose.Types.ObjectId) {
  return Goal.aggregate<{ _id: mongoose.Types.ObjectId; title: string; progress: number; status: string }>([
    { $match: { userId, status: "ACTIVE" } },
    { $sort: { progress: -1 } },
    { $limit: 8 },
    {
      $project: {
        _id: 1,
        title: 1,
        progress: 1,
        status: 1,
      },
    },
  ]);
}

async function aggregateExecutionScore(userId: mongoose.Types.ObjectId) {
  const [result] = await Action.aggregate<{ total: number; executed: number }>([
    { $match: { userId } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        executed: {
          $sum: {
            $cond: [{ $eq: ["$status", "EXECUTED"] }, 1, 0],
          },
        },
      },
    },
  ]);

  if (!result?.total) return 0;
  return roundPercent((result.executed / result.total) * 100);
}

async function aggregateExecutionVelocity(userId: mongoose.Types.ObjectId) {
  const [result] = await Action.aggregate<{ total: number; executed: number }>([
    { $match: { userId } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        executed: {
          $sum: {
            $cond: [{ $eq: ["$status", "EXECUTED"] }, 1, 0],
          },
        },
      },
    },
  ]);

  if (!result?.total) return 0;
  return roundPercent((result.executed / result.total) * 100);
}

async function aggregateActionDistribution(userId: mongoose.Types.ObjectId) {
  const results = await Action.aggregate<StatusCount>([
    { $match: { userId } },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const counts = Object.fromEntries(results.map((row) => [row._id, row.count]));

  return [
    { label: "Planned", value: counts.PLANNED ?? 0 },
    { label: "In Progress", value: counts.IN_PROGRESS ?? 0 },
    { label: "Executed", value: counts.EXECUTED ?? 0 },
  ];
}

async function aggregateDeepWork(userId: mongoose.Types.ObjectId, weekStart: Date) {
  const [result] = await FocusSession.aggregate<SumResult>([
    {
      $match: {
        userId,
        startedAt: { $gte: weekStart },
        endedAt: { $ne: null },
        duration: { $gt: 0 },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: "$duration" },
      },
    },
  ]);

  const [avgResult] = await FocusSession.aggregate<AvgResult>([
    {
      $match: {
        userId,
        startedAt: { $gte: weekStart },
        endedAt: { $ne: null },
        duration: { $gt: 0 },
      },
    },
    {
      $group: {
        _id: null,
        avg: { $avg: "$duration" },
      },
    },
  ]);

  return {
    weeklyMinutes: result?.total ?? 0,
    avgSessionMinutes: roundPercent(avgResult?.avg ?? 0),
  };
}

async function aggregateFocusQuality(
  userId: mongoose.Types.ObjectId,
  weekStart: Date
) {
  const [result] = await FocusSession.aggregate<AvgResult>([
    {
      $match: {
        userId,
        startedAt: { $gte: weekStart },
        endedAt: { $ne: null },
      },
    },
    {
      $group: {
        _id: null,
        avg: { $avg: "$quality" },
      },
    },
  ]);

  return roundPercent(result?.avg ?? 0);
}

async function aggregateFocusConsistency(
  userId: mongoose.Types.ObjectId,
  weekStart: Date
) {
  const results = await FocusSession.aggregate<DayQuality>([
    {
      $match: {
        userId,
        startedAt: { $gte: weekStart },
        endedAt: { $ne: null },
      },
    },
    {
      $group: {
        _id: { $dayOfWeek: "$startedAt" },
        avgQuality: { $avg: "$quality" },
        totalMinutes: { $sum: "$duration" },
      },
    },
  ]);

  const qualityByDay = new Map(
    results.map((row) => [mapDayOfWeekToLabel(row._id), roundPercent(row.avgQuality)])
  );

  return WEEK_LABELS.map((label) => ({
    date: label,
    score: qualityByDay.get(label) ?? 0,
  }));
}

async function aggregateGrowthTrend(
  userId: mongoose.Types.ObjectId,
  weekStart: Date,
  fallback: number
) {
  const results = await Goal.aggregate<DayProgress>([
    {
      $match: {
        userId,
        status: "ACTIVE",
        updatedAt: { $gte: weekStart },
      },
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$updatedAt" },
        },
        avgProgress: { $avg: "$progress" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const progressByDate = new Map(
    results.map((row) => [row._id, roundPercent(row.avgProgress)])
  );

  return WEEK_LABELS.map((label, index) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + index);
    const key = date.toISOString().slice(0, 10);
    return {
      label,
      value: progressByDate.get(key) ?? fallback,
    };
  });
}

async function aggregateVaultMetrics(
  userId: mongoose.Types.ObjectId,
  weekStart: Date,
  lastWeekStart: Date
) {
  const [facet] = await VaultEntry.aggregate<{
    total: CountResult[];
    thisWeek: CountResult[];
    lastWeek: CountResult[];
    linked: CountResult[];
    byDay: DayCount[];
  }>([
    { $match: { userId } },
    {
      $facet: {
        total: [{ $count: "count" }],
        thisWeek: [
          { $match: { createdAt: { $gte: weekStart } } },
          { $count: "count" },
        ],
        lastWeek: [
          {
            $match: {
              createdAt: { $gte: lastWeekStart, $lt: weekStart },
            },
          },
          { $count: "count" },
        ],
        linked: [
          {
            $match: {
              $or: [
                { linkedVision: { $exists: true, $ne: null } },
                { linkedGoal: { $exists: true, $ne: null } },
                { linkedAction: { $exists: true, $ne: null } },
              ],
            },
          },
          { $count: "count" },
        ],
        byDay: [
          { $match: { createdAt: { $gte: weekStart } } },
          {
            $group: {
              _id: {
                $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ],
      },
    },
  ]);

  const totalEntries = facet.total[0]?.count ?? 0;
  const entriesThisWeek = facet.thisWeek[0]?.count ?? 0;
  const entriesLastWeek = facet.lastWeek[0]?.count ?? 0;
  const linkedEntries = facet.linked[0]?.count ?? 0;

  // Only calculate growth when we have a valid previous-week baseline.
  // Never fake 100% when there is no prior period to compare against.
  const growth =
    entriesLastWeek > 0
      ? roundPercent(((entriesThisWeek - entriesLastWeek) / entriesLastWeek) * 100)
      : 0;

  const countByDate = new Map(
    (facet.byDay ?? []).map((row) => [row._id, row.count])
  );

  const vaultTrend = WEEK_LABELS.map((label, index) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + index);
    const key = date.toISOString().slice(0, 10);
    return {
      label,
      value: countByDate.get(key) ?? 0,
    };
  });

  return {
    totalEntries,
    entriesThisWeek,
    growth,
    knowledgeAlignment:
      totalEntries > 0 ? roundPercent((linkedEntries / totalEntries) * 100) : 0,
    vaultTrend,
  };
}

function buildInsights(metrics: AnalyticsDashboardData["metrics"], stats: AnalyticsDashboardData["stats"]) {
  const insights: string[] = [];

  if (stats.goalsOnTrack === 0) {
    insights.push("Create active goals to unlock progress analytics.");
  } else if (metrics.executionScore < 50) {
    insights.push(
      "Today's action score is below 50%. Move planned actions into focus sessions."
    );
  } else if (metrics.deepWorkHours < 5) {
    insights.push(
      "Weekly deep work is under 5 hours. Schedule protected focus blocks."
    );
  } else if (metrics.vaultGrowth > 0) {
    insights.push(
      `Knowledge grew ${metrics.vaultGrowth}% week-over-week with ${stats.totalVaultEntries} total entries.`
    );
  } else {
    insights.push(
      `${stats.goalsOnTrack} goals on track · ${metrics.deepWorkHours}h deep work · ${metrics.focusQuality}% focus quality.`
    );
  }

  return insights;
}

export async function getAnalyticsDashboardData(
  userId: string
): Promise<AnalyticsDashboardData> {
  const userObjectId = toObjectId(userId);
  const weekStart = startOfWeek();
  const lastWeekStart = startOfLastWeek(weekStart);
  const todayStart = startOfToday();

  const [
    visionAlignment,
    goalProgress,
    executionScore,
    executionVelocity,
    goalsOnTrack,
    goalHealth,
    actionDistribution,
    deepWorkAgg,
    focusQuality,
    focusConsistency,
    vaultMetrics,
    completedSessions,
    milestoneCount,
    actionCount,
  ] = await Promise.all([
    aggregateVisionAlignment(userObjectId),
    aggregateGoalProgress(userObjectId),
    aggregateExecutionScore(userObjectId),
    aggregateExecutionVelocity(userObjectId),
    aggregateGoalsOnTrack(userObjectId),
    aggregateGoalHealth(userObjectId),
    aggregateActionDistribution(userObjectId),
    aggregateDeepWork(userObjectId, weekStart),
    aggregateFocusQuality(userObjectId, weekStart),
    aggregateFocusConsistency(userObjectId, weekStart),
    aggregateVaultMetrics(userObjectId, weekStart, lastWeekStart),
    FocusSession.find({
      userId: userObjectId,
      startedAt: { $gte: weekStart },
      endedAt: { $ne: null },
      duration: { $gt: 0 },
    })
      .select("startedAt endedAt duration quality")
      .lean(),
    Milestone.countDocuments({ userId: userObjectId }),
    Action.countDocuments({ userId: userObjectId }),
  ]);

  const deepWorkHours = roundHours(deepWorkAgg.weeklyMinutes);
  const bestFocusWindow = calculateBestFocusWindow(completedSessions);
  const growthTrend = await aggregateGrowthTrend(
    userObjectId,
    weekStart,
    goalProgress
  );

  const metrics = {
    visionAlignment,
    goalProgress,
    executionScore,
    deepWorkHours,
    focusQuality,
    vaultGrowth: vaultMetrics.growth,
  };

  const stats = {
    alignmentScore: visionAlignment,
    focusHours: Math.round(deepWorkHours),
    goalsOnTrack,
    executionVelocity,
    totalVaultEntries: vaultMetrics.totalEntries,
    vaultEntriesThisWeek: vaultMetrics.entriesThisWeek,
    knowledgeAlignment: vaultMetrics.knowledgeAlignment,
    milestoneCount,
    actionCount,
  };

  const data: AnalyticsDashboardData = {
    metrics,
    stats,
    growthTrend,
    actionDistribution,
    focusConsistency,
    vaultTrend: vaultMetrics.vaultTrend,
    systemStability: [
      { label: "Vision", value: visionAlignment },
      { label: "Goals", value: goalProgress },
      { label: "Actions", value: executionVelocity },
      { label: "Focus", value: focusQuality },
      { label: "Knowledge", value: vaultMetrics.knowledgeAlignment },
    ],
    goalHealth: goalHealth.map((goal) => ({
      id: goal._id.toString(),
      title: goal.title,
      progress: roundPercent(goal.progress),
      status: goal.status,
    })),
    deepWork: {
      bestWindow: bestFocusWindow?.label ?? null,
      avgSessionMinutes: deepWorkAgg.avgSessionMinutes,
      weeklyMinutes: deepWorkAgg.weeklyMinutes,
    },
    insights: [],
  };

  data.insights = buildInsights(metrics, stats);

  return data;
}
