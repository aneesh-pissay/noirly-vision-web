import cron, { type ScheduledTask } from "node-cron";
import {
  runEveningReviewJobs,
  runMorningPlanningJobs,
  runWeeklyReviewJobs,
  runWorkspaceAnalysisJobs,
} from "@/services/scheduled-notifications";

const scheduledTasks: ScheduledTask[] = [];
let initialized = false;

async function runJob(name: string, job: () => Promise<void>) {
  const startedAt = new Date().toISOString();
  console.log(`[NotificationScheduler] ${name} started at ${startedAt}`);

  try {
    await job();
    console.log(`[NotificationScheduler] ${name} completed`);
  } catch (error) {
    console.error(`[NotificationScheduler] ${name} failed:`, error);
  }
}

export function initializeNotificationScheduler() {
  if (initialized) {
    return;
  }

  if (process.env.NOTIFICATION_SCHEDULER_ENABLED === "false") {
    console.log("[NotificationScheduler] Disabled via NOTIFICATION_SCHEDULER_ENABLED=false");
    return;
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    console.log("[NotificationScheduler] Skipped on edge runtime");
    return;
  }

  // Hourly: morning check-in, evening review (per-user timezone inside jobs)
  scheduledTasks.push(
    cron.schedule("0 * * * *", () => {
      void runJob("morning-check-in", runMorningPlanningJobs);
      void runJob("evening-review", runEveningReviewJobs);
    })
  );

  // Weekly review emails (Sunday 09:00 UTC tick; user timezone checked in job)
  scheduledTasks.push(
    cron.schedule("0 9 * * 0", () => {
      void runJob("weekly-review", runWeeklyReviewJobs);
    })
  );

  // Daily workspace analysis: goal/milestone/focus reminders
  scheduledTasks.push(
    cron.schedule("0 6 * * *", () => {
      void runJob("workspace-analysis", runWorkspaceAnalysisJobs);
    })
  );

  initialized = true;
  console.log(
    `[NotificationScheduler] Initialized ${scheduledTasks.length} cron jobs`
  );
}

export function stopNotificationScheduler() {
  for (const task of scheduledTasks) {
    task.stop();
  }
  scheduledTasks.length = 0;
  initialized = false;
  console.log("[NotificationScheduler] Stopped");
}
