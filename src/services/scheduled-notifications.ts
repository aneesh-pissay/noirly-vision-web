import { subDays } from "date-fns";
import { connectDB } from "@/lib/db";
import { isLocalTimeMatch, isSundayInTimezone } from "@/lib/notifications/utils";
import Action from "@/models/action.model";
import FocusSession from "@/models/focus-session.model";
import Goal from "@/models/goal.model";
import Settings from "@/models/settings.model";
import User from "@/models/user.model";
import Vision from "@/models/vision.model";
import { getOrCreateNotificationPreferences } from "@/lib/notifications/preferences";
import {
  notifyDailyPlanning,
  notifyEveningReview,
} from "@/services/workspace-analyzer";
import { createAndSendNotification } from "@/services/notification-engine";
import {
  sendDailySummary,
  sendWeeklyReview,
} from "@/services/email-service";
import { analyzeWorkspace } from "@/services/workspace-analyzer";

async function getActiveUsers() {
  await connectDB();
  return User.find({ isVerified: true }).select("_id").lean();
}

export async function runMorningPlanningJobs() {
  const users = await getActiveUsers();

  for (const user of users) {
    const userId = user._id.toString();
    const [settings, prefs] = await Promise.all([
      Settings.findOne({ userId }).select("timezone morningCheckInTime").lean(),
      getOrCreateNotificationPreferences(userId),
    ]);

    if (!prefs.push.dailyPlanning && !prefs.email.dailySummary) continue;

    const timezone = settings?.timezone ?? "UTC";
    const morningTime = settings?.morningCheckInTime ?? "08:00";

    if (!isLocalTimeMatch(timezone, morningTime)) continue;

    await notifyDailyPlanning(userId);

    if (prefs.email.dailySummary && prefs.channels.email && prefs.email.enabled) {
      const [visions, pendingActions] = await Promise.all([
        Vision.findOne({ userId }).sort({ updatedAt: -1 }).select("title").lean(),
        Action.countDocuments({
          userId,
          status: { $in: ["PLANNED", "IN_PROGRESS"] as const },
        }),
      ]);

      const settingsDoc = await Settings.findOne({ userId })
        .select("bestFocusWindow")
        .lean();

      await sendDailySummary(userId, {
        priorityTitle: visions?.title ?? "Define your vision",
        pendingActions,
        suggestedFocus: settingsDoc?.bestFocusWindow ?? "Morning block",
      });
    }
  }
}

export async function runEveningReviewJobs() {
  const users = await getActiveUsers();

  for (const user of users) {
    const userId = user._id.toString();
    const [settings, prefs] = await Promise.all([
      Settings.findOne({ userId }).select("timezone eveningReviewTime").lean(),
      getOrCreateNotificationPreferences(userId),
    ]);

    if (!prefs.push.enabled && !prefs.channels.inApp) continue;

    const timezone = settings?.timezone ?? "UTC";
    const eveningTime = settings?.eveningReviewTime ?? "20:00";

    if (!isLocalTimeMatch(timezone, eveningTime)) continue;

    await notifyEveningReview(userId);
  }
}

export async function runWeeklyReviewJobs() {
  const users = await getActiveUsers();
  const weekAgo = subDays(new Date(), 7);

  for (const user of users) {
    const userId = user._id.toString();
    const [settings, prefs] = await Promise.all([
      Settings.findOne({ userId }).select("timezone").lean(),
      getOrCreateNotificationPreferences(userId),
    ]);

    if (!prefs.email.weeklyReview || !prefs.channels.email || !prefs.email.enabled) {
      continue;
    }

    const timezone = settings?.timezone ?? "UTC";
    if (!isSundayInTimezone(timezone)) continue;
    if (!isLocalTimeMatch(timezone, "09:00", 60)) continue;

    const [visions, actionsCompleted, focusSessions] = await Promise.all([
      Goal.find({ userId }).select("progress title status").lean(),
      Action.countDocuments({
        userId,
        status: "EXECUTED",
        completedAt: { $gte: weekAgo },
      }),
      FocusSession.find({
        userId,
        status: "completed",
        completedAt: { $gte: weekAgo },
      })
        .select("duration")
        .lean(),
    ]);

    const avgProgress =
      visions.length > 0
        ? Math.round(
            visions.reduce((sum, goal) => sum + (goal.progress ?? 0), 0) /
              visions.length
          )
        : 0;

    const focusMinutes = focusSessions.reduce(
      (sum, session) => sum + (session.duration ?? 0),
      0
    );

    const topGoal = visions
      .filter((goal) => goal.status === "COMPLETED" || goal.progress >= 100)
      .sort((a, b) => (b.progress ?? 0) - (a.progress ?? 0))[0];

    await sendWeeklyReview(userId, {
      visionProgress: `${avgProgress}% average goal progress`,
      actionsCompleted,
      focusHours: Math.round((focusMinutes / 60) * 10) / 10,
      topAchievement: topGoal?.title ?? "Keep building momentum",
    });

    await createAndSendNotification({
      userId,
      type: "review",
      title: "Your weekly review is ready",
      message: "Your weekly summary email has been sent. Review your progress.",
      channels: { inApp: true, push: false, email: false },
      relatedEntity: { type: "weekly", id: "review" },
      actionUrl: "/dashboard/analytics",
    });
  }
}

export async function runWorkspaceAnalysisJobs() {
  const users = await getActiveUsers();

  for (const user of users) {
    try {
      await analyzeWorkspace(user._id.toString());
    } catch (error) {
      console.error(
        `[Notifications] Workspace analysis failed for ${user._id}:`,
        error
      );
    }
  }
}
