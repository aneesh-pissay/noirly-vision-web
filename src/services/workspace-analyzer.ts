import { subDays } from "date-fns";
import { connectDB } from "@/lib/db";
import Action from "@/models/action.model";
import FocusSession from "@/models/focus-session.model";
import Goal from "@/models/goal.model";
import Milestone from "@/models/milestone.model";
import Vision from "@/models/vision.model";
import { sendNotification } from "@/services/notification-engine";

export async function analyzeWorkspace(userId: string) {
  await connectDB();

  const [visions, goals, milestones, pendingActions, recentFocus] =
    await Promise.all([
      Vision.countDocuments({ userId }),
      Goal.countDocuments({ userId }),
      Milestone.countDocuments({ userId }),
      Action.countDocuments({
        userId,
        status: { $in: ["PLANNED", "IN_PROGRESS"] as const },
      }),
      FocusSession.countDocuments({
        userId,
        status: "completed",
        completedAt: { $gte: subDays(new Date(), 7) },
      }),
    ]);

  if (visions === 0) {
    await sendNotification({
      userId,
      type: "strategy",
      title: "Create your vision",
      message:
        "Your Personal OS starts with a clear vision. Define what you are building toward.",
      priority: "normal",
      channels: { inApp: true, push: false, email: false },
      relatedEntity: { type: "vision", id: "none" },
      actionUrl: "/dashboard/vision",
    });
    return;
  }

  if (goals === 0) {
    await sendNotification({
      userId,
      type: "strategy",
      title: "Create your first goal",
      message:
        "You have a vision — now translate it into a measurable goal.",
      priority: "normal",
      channels: { inApp: true, push: false, email: false },
      relatedEntity: { type: "goal", id: "none" },
      actionUrl: "/dashboard/goals",
    });
  }

  if (goals > 0 && milestones === 0) {
    await sendNotification({
      userId,
      type: "execution",
      title: "Build your roadmap",
      message:
        "Add milestones to your goals so execution has a clear path forward.",
      priority: "normal",
      channels: { inApp: true, push: false, email: false },
      relatedEntity: { type: "milestone", id: "none" },
      actionUrl: "/dashboard/goals",
    });
  }

  if (pendingActions > 0) {
    await sendNotification({
      userId,
      type: "execution",
      title: "Actions waiting",
      message: `You have ${pendingActions} action${pendingActions === 1 ? "" : "s"} ready in your pipeline.`,
      priority: pendingActions >= 5 ? "high" : "normal",
      relatedEntity: { type: "action", id: "pending" },
      actionUrl: "/dashboard/execution",
    });
  }

  if (recentFocus === 0 && goals > 0) {
    await sendNotification({
      userId,
      type: "focus",
      title: "Return to deep work",
      message:
        "No focus sessions this week. Block time for a deep work session today.",
      priority: "normal",
      relatedEntity: { type: "focus", id: "inactivity" },
      actionUrl: "/dashboard/focus",
    });
  }
}

export async function notifyAchievement(
  userId: string,
  input: {
    key: string;
    title: string;
    message: string;
    actionUrl?: string;
    entityId?: string;
  }
) {
  await sendNotification({
    userId,
    type: "achievement",
    title: input.title,
    message: input.message,
    priority: "normal",
    relatedEntity: { type: input.key, id: input.entityId },
    actionUrl: input.actionUrl ?? "/dashboard",
  });
}

export async function notifySecurityEvent(
  userId: string,
  input: {
    key: string;
    title: string;
    message: string;
    actionUrl?: string;
  }
) {
  await sendNotification({
    userId,
    type: "security",
    title: input.title,
    message: input.message,
    priority: "urgent",
    channels: { inApp: true, push: false, email: true },
    relatedEntity: { type: input.key },
    actionUrl: input.actionUrl ?? "/dashboard/settings",
  });
}

export async function notifyDailyPlanning(userId: string) {
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

export async function notifyEveningReview(userId: string) {
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
}
