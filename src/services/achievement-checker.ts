import { subDays } from "date-fns";
import { connectDB } from "@/lib/db";
import FocusSession from "@/models/focus-session.model";
import Goal from "@/models/goal.model";
import { notifyAchievement } from "@/services/workspace-analyzer";

export async function checkFocusSessionAchievements(
  userId: string,
  sessionId: string
) {
  await connectDB();

  const completedCount = await FocusSession.countDocuments({
    userId,
    status: "completed",
  });

  if (completedCount === 1) {
    await notifyAchievement(userId, {
      key: "first_focus",
      title: "First focus session",
      message: "You completed your first deep work session. Momentum starts here.",
      entityId: sessionId,
      actionUrl: "/dashboard/focus",
    });
    return;
  }

  const streak = await calculateFocusStreak(userId);
  if (streak >= 3 && streak % 3 === 0) {
    await notifyAchievement(userId, {
      key: "focus_streak",
      title: `${streak}-day focus streak`,
      message: `You've focused ${streak} days in a row. Keep the chain alive.`,
      entityId: String(streak),
      actionUrl: "/dashboard/focus",
    });
  }
}

async function calculateFocusStreak(userId: string): Promise<number> {
  const sessions = await FocusSession.find({
    userId,
    status: "completed",
    completedAt: { $gte: subDays(new Date(), 30) },
  })
    .select("completedAt")
    .sort({ completedAt: -1 })
    .lean();

  if (sessions.length === 0) return 0;

  const days = new Set(
    sessions
      .filter((session) => session.completedAt)
      .map((session) =>
        new Date(session.completedAt!).toISOString().slice(0, 10)
      )
  );

  let streak = 0;
  const cursor = new Date();

  while (true) {
    const key = cursor.toISOString().slice(0, 10);
    if (!days.has(key)) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export async function checkMilestoneAchievement(
  userId: string,
  milestoneId: string,
  milestoneTitle: string
) {
  await notifyAchievement(userId, {
    key: "milestone_completed",
    title: "Milestone completed",
    message: `"${milestoneTitle}" is done. Your roadmap is advancing.`,
    entityId: milestoneId,
    actionUrl: "/dashboard/goals",
  });
}

export async function checkGoalAchievement(
  userId: string,
  goalId: string,
  goalTitle: string
) {
  await notifyAchievement(userId, {
    key: "goal_completed",
    title: "Goal completed",
    message: `You completed "${goalTitle}". A major win for your vision.`,
    entityId: goalId,
    actionUrl: "/dashboard/goals",
  });
}

export async function checkGoalCompletionAfterProgress(
  userId: string,
  goalId: string
) {
  await connectDB();
  const goal = await Goal.findOne({ _id: goalId, userId })
    .select("title progress status")
    .lean();

  if (!goal) return;
  if (goal.status === "COMPLETED" || goal.progress >= 100) {
    await checkGoalAchievement(userId, goalId, goal.title);
  }
}
