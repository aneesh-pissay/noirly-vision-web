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
import { sendNotification } from "@/services/notification-engine";
import { analyzeWorkspace } from "@/services/workspace-analyzer";

async function getActiveUsers() {
  await connectDB();
  return User.find({ isVerified: true }).select("_id").lean();
}

export async function runMorningPlanningJobs() {
  const users = await getActiveUsers();

  for (const user of users) {
    try {
      const userId = user._id.toString();
      const [settings, prefs] = await Promise.all([
        Settings.findOne({ userId })
          .select("timezone morningCheckInTime bestFocusWindow")
          .lean(),
        getOrCreateNotificationPreferences(userId),
      ]);

      const wantsPlanning =
        prefs.push.dailyPlanning || prefs.channels.inApp;
      const wantsDailyEmail =
        prefs.email.dailySummary &&
        prefs.channels.email &&
        prefs.email.enabled;

      if (!wantsPlanning && !wantsDailyEmail) continue;

      const timezone = settings?.timezone ?? "UTC";
      const morningTime = settings?.morningCheckInTime ?? "08:00";

      if (!isLocalTimeMatch(timezone, morningTime)) continue;

      if (wantsPlanning) {
        await sendNotification({
          userId,
          type: "review",
          title: "Plan your day",
          message:
            "Take five minutes to review your priorities and choose today's focus.",
          priority: "normal",
          relatedEntity: { type: "daily", id: "planning" },
          actionUrl: "/dashboard/execution",
        });
      }

      if (wantsDailyEmail) {
        const [vision, pendingActions] = await Promise.all([
          Vision.findOne({ userId }).sort({ updatedAt: -1 }).select("title").lean(),
          Action.countDocuments({
            userId,
            status: { $in: ["PLANNED", "IN_PROGRESS"] as const },
          }),
        ]);

        await sendNotification(
          {
            userId,
            type: "review",
            title: "Your daily summary",
            message: "Review today's priorities and suggested focus block.",
            priority: "normal",
            relatedEntity: { type: "daily", id: "summary" },
            actionUrl: "/dashboard/analytics",
          },
          {
            dailySummary: {
              priorityTitle: vision?.title ?? "Define your vision",
              pendingActions,
              suggestedFocus: settings?.bestFocusWindow ?? "Morning block",
            },
          }
        );
      }
    } catch (error) {
      console.error(
        `[ScheduledNotifications] Morning job failed for ${user._id}:`,
        error
      );
    }
  }
}

export async function runEveningReviewJobs() {
  const users = await getActiveUsers();

  for (const user of users) {
    try {
      const userId = user._id.toString();
      const [settings, prefs] = await Promise.all([
        Settings.findOne({ userId }).select("timezone eveningReviewTime").lean(),
        getOrCreateNotificationPreferences(userId),
      ]);

      if (!prefs.push.enabled && !prefs.channels.inApp) continue;

      const timezone = settings?.timezone ?? "UTC";
      const eveningTime = settings?.eveningReviewTime ?? "20:00";

      if (!isLocalTimeMatch(timezone, eveningTime)) continue;

      await sendNotification({
        userId,
        type: "review",
        title: "Evening review",
        message:
          "Reflect on what you accomplished today and set up tomorrow's priorities.",
        priority: "normal",
        relatedEntity: { type: "daily", id: "review" },
        actionUrl: "/dashboard/analytics",
      });
    } catch (error) {
      console.error(
        `[ScheduledNotifications] Evening job failed for ${user._id}:`,
        error
      );
    }
  }
}

export async function runWeeklyReviewJobs() {
  const users = await getActiveUsers();
  const weekAgo = subDays(new Date(), 7);

  for (const user of users) {
    try {
      const userId = user._id.toString();
      const [settings, prefs] = await Promise.all([
        Settings.findOne({ userId }).select("timezone").lean(),
        getOrCreateNotificationPreferences(userId),
      ]);

      if (
        !prefs.email.weeklyReview ||
        !prefs.channels.email ||
        !prefs.email.enabled
      ) {
        continue;
      }

      const timezone = settings?.timezone ?? "UTC";
      if (!isSundayInTimezone(timezone)) continue;
      if (!isLocalTimeMatch(timezone, "09:00", 60)) continue;

      const [goals, actionsCompleted, focusSessions] = await Promise.all([
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
        goals.length > 0
          ? Math.round(
              goals.reduce((sum, goal) => sum + (goal.progress ?? 0), 0) /
                goals.length
            )
          : 0;

      const focusMinutes = focusSessions.reduce(
        (sum, session) => sum + (session.duration ?? 0),
        0
      );

      const topGoal = goals
        .filter((goal) => goal.status === "COMPLETED" || goal.progress >= 100)
        .sort((a, b) => (b.progress ?? 0) - (a.progress ?? 0))[0];

      const weeklyReview = {
        visionProgress: `${avgProgress}% average goal progress`,
        actionsCompleted,
        focusHours: Math.round((focusMinutes / 60) * 10) / 10,
        topAchievement: topGoal?.title ?? "Keep building momentum",
      };

      await sendNotification(
        {
          userId,
          type: "review",
          title: "Your weekly review is ready",
          message: "Your weekly summary is ready. Review your progress.",
          channels: { inApp: true, push: false, email: true },
          relatedEntity: { type: "weekly", id: "review" },
          actionUrl: "/dashboard/analytics",
        },
        { weeklyReview }
      );
    } catch (error) {
      console.error(
        `[ScheduledNotifications] Weekly job failed for ${user._id}:`,
        error
      );
    }
  }
}

export async function runWorkspaceAnalysisJobs() {
  const users = await getActiveUsers();

  for (const user of users) {
    try {
      await analyzeWorkspace(user._id.toString());
    } catch (error) {
      console.error(
        `[ScheduledNotifications] Workspace analysis failed for ${user._id}:`,
        error
      );
    }
  }
}
