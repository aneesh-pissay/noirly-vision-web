import type { IGoal } from "@/models/goal.model";
import type { VisionStage } from "@/types";
import type {
  VisionLifeArea,
  VisionNextStep,
  VisionTrajectoryItem,
} from "@/features/vision/types";

type VisionRecord = {
  _id: { toString(): string };
  title: string;
  description?: string;
  targetDate?: Date;
  createdAt: Date;
  status: string;
};

type GoalRecord = Pick<
  IGoal,
  "_id" | "visionId" | "progress" | "title" | "category" | "status" | "updatedAt"
>;

export function formatAreaLabel(area: string) {
  return area.charAt(0).toUpperCase() + area.slice(1);
}

export function formatVisionStage(stage?: string) {
  if (!stage) return undefined;

  const labels: Record<string, string> = {
    exploring: "Exploring",
    building: "Building",
    scaling: "Scaling",
    mastery: "Mastery",
  };

  return labels[stage] ?? stage;
}

export function isVisionStage(value?: string): value is VisionStage {
  return (
    value === "exploring" ||
    value === "building" ||
    value === "scaling" ||
    value === "mastery"
  );
}

export function averageGoalProgress(goals: Pick<IGoal, "progress">[]) {
  if (goals.length === 0) return 0;
  return Math.round(
    goals.reduce((sum, goal) => sum + goal.progress, 0) / goals.length
  );
}

export function buildLifeAreas(goals: Pick<IGoal, "category" | "progress">[]) {
  const areaMap = new Map<string, { activeGoals: number; totalProgress: number }>();

  for (const goal of goals) {
    const name = formatAreaLabel(goal.category);
    const existing = areaMap.get(name);
    if (existing) {
      existing.activeGoals += 1;
      existing.totalProgress += goal.progress;
    } else {
      areaMap.set(name, { activeGoals: 1, totalProgress: goal.progress });
    }
  }

  return Array.from(areaMap.entries()).map(([name, data]) => ({
    name,
    activeGoals: data.activeGoals,
    focusHours: 0,
    alignment: Math.round(data.totalProgress / data.activeGoals),
  })) satisfies VisionLifeArea[];
}

export function resolveVisionNextStep(
  connectedGoals: Array<{ _id: { toString(): string }; title: string }>,
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
): VisionNextStep | null {
  if (connectedGoals.length === 0) {
    return {
      title: "Add your first goal",
      description: "Connect a measurable outcome to this vision.",
    };
  }

  for (const goal of connectedGoals) {
    const goalId = goal._id.toString();
    const goalMilestones = milestones.filter(
      (milestone) => milestone.goalId.toString() === goalId
    );

    if (goalMilestones.length === 0) {
      return {
        title: "Create your first milestone",
        description: `Break "${goal.title}" into executable checkpoints.`,
      };
    }

    const nextMilestone = goalMilestones.find(
      (milestone) => milestone.status !== "completed"
    );

    if (nextMilestone) {
      const linked = actions.filter(
        (action) => action.milestoneId?.toString() === nextMilestone._id.toString()
      );
      const remaining = linked.filter((action) => action.status !== "EXECUTED").length;

      if (remaining > 0) {
        return {
          title: `Continue: ${nextMilestone.title}`,
          description: `${remaining} action${remaining === 1 ? "" : "s"} remaining`,
        };
      }

      return {
        title: `Continue: ${nextMilestone.title}`,
        description: "Add actions to keep momentum.",
      };
    }
  }

  return {
    title: "Roadmap complete",
    description: "All milestones for connected goals are done.",
  };
}

export function formatTimelineDate(date: Date) {
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

type VisionJourneyGoal = {
  _id: { toString(): string };
  title: string;
  status: string;
  progress: number;
  updatedAt: Date;
};

type VisionJourneyMilestone = {
  _id: { toString(): string };
  goalId: { toString(): string };
  title: string;
  status: string;
  completedAt?: Date;
  updatedAt: Date;
};

export function buildVisionJourneyTimeline(
  vision: VisionRecord | null,
  goals: VisionJourneyGoal[],
  milestones: VisionJourneyMilestone[]
): VisionTrajectoryItem[] {
  if (!vision) return [];

  const visionId = vision._id.toString();
  const goalTitles = new Map(
    goals.map((goal) => [goal._id.toString(), goal.title])
  );
  const connectedGoalIds = new Set(goals.map((goal) => goal._id.toString()));
  const events: Array<VisionTrajectoryItem & { sortTime: number }> = [];

  events.push({
    id: `vision-created-${visionId}`,
    type: "vision_created",
    eventLabel: "Vision created",
    title: vision.title,
    description: vision.description,
    year: String(vision.createdAt.getFullYear()),
    dateLabel: formatTimelineDate(vision.createdAt),
    sortTime: vision.createdAt.getTime(),
  });

  for (const goal of goals) {
    const completed = goal.status === "COMPLETED" || goal.progress >= 100;
    if (!completed) continue;

    events.push({
      id: `goal-completed-${goal._id.toString()}`,
      type: "goal_completed",
      eventLabel: "Goal completed",
      title: goal.title,
      year: String(goal.updatedAt.getFullYear()),
      dateLabel: formatTimelineDate(goal.updatedAt),
      sortTime: goal.updatedAt.getTime(),
    });
  }

  for (const milestone of milestones) {
    if (milestone.status !== "completed") continue;

    const goalId = milestone.goalId.toString();
    if (!connectedGoalIds.has(goalId)) continue;

    const occurredAt = milestone.completedAt ?? milestone.updatedAt;
    const goalTitle = goalTitles.get(goalId);

    events.push({
      id: `milestone-${milestone._id.toString()}`,
      type: "milestone_achieved",
      eventLabel: "Milestone achieved",
      title: milestone.title,
      description: goalTitle ? `Goal: ${goalTitle}` : undefined,
      year: String(occurredAt.getFullYear()),
      dateLabel: formatTimelineDate(occurredAt),
      sortTime: occurredAt.getTime(),
    });
  }

  return events
    .sort((a, b) => a.sortTime - b.sortTime)
    .map(({ sortTime: _sortTime, ...event }) => event);
}

export function filterGoalsForVision(
  goals: GoalRecord[],
  visionId: string
): GoalRecord[] {
  return goals.filter((goal) => goal.visionId?.toString() === visionId);
}
