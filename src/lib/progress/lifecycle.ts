/**
 * Global maturity engine — single source of truth for system lifecycle.
 * Parent levels never downgrade when child objects are missing.
 */

export type SystemMaturityLevel =
  | "EMPTY"
  | "VISION_ACTIVE"
  | "GOAL_ACTIVE"
  | "ROADMAP_ACTIVE"
  | "EXECUTING"
  | "OPTIMIZED";

export type SystemLifecycleInput = {
  hasVision: boolean;
  visionTitle: string | null;
  goalCount: number;
  primaryGoalTitle: string | null;
  milestoneCount: number;
  actionCount: number;
  completedActionCount: number;
  completedFocusSessionCount: number;
  activeActionTitle: string | null;
};

export type SystemLifecycle = {
  level: SystemMaturityLevel;
  levelNumber: 0 | 1 | 2 | 3 | 4 | 5;
  statusLabel: string;
  description: string;
  currentFocus: string | null;
  nextStep: {
    title: string;
    description: string;
    href: string;
  };
};

export type ChainLinkState = "complete" | "next" | "waiting";

export type StrategicChainLink = {
  state: ChainLinkState;
  text: string;
};

export type StrategicChainDisplay = {
  vision: StrategicChainLink;
  goal: StrategicChainLink;
  milestone: StrategicChainLink;
  action: StrategicChainLink;
};

const STATUS_LABELS: Record<SystemMaturityLevel, string> = {
  EMPTY: "Create your vision",
  VISION_ACTIVE: "Vision active",
  GOAL_ACTIVE: "Building roadmap",
  ROADMAP_ACTIVE: "Planning actions",
  EXECUTING: "Taking action",
  OPTIMIZED: "Optimizing",
};

const LEVEL_NUMBERS: Record<SystemMaturityLevel, 0 | 1 | 2 | 3 | 4 | 5> = {
  EMPTY: 0,
  VISION_ACTIVE: 1,
  GOAL_ACTIVE: 2,
  ROADMAP_ACTIVE: 3,
  EXECUTING: 4,
  OPTIMIZED: 5,
};

export function resolveSystemMaturityLevel(
  input: SystemLifecycleInput
): SystemMaturityLevel {
  if (!input.hasVision) return "EMPTY";
  if (input.goalCount === 0) return "VISION_ACTIVE";
  if (input.milestoneCount === 0) return "GOAL_ACTIVE";
  if (input.actionCount === 0) return "ROADMAP_ACTIVE";
  if (
    input.completedActionCount > 0 &&
    input.completedFocusSessionCount > 0
  ) {
    return "OPTIMIZED";
  }
  return "EXECUTING";
}

function resolveNextStep(
  level: SystemMaturityLevel,
  input: SystemLifecycleInput
): SystemLifecycle["nextStep"] {
  switch (level) {
    case "EMPTY":
      return {
        title: "Create your vision",
        description: "Define the future you are building toward.",
        href: "/dashboard/vision",
      };
    case "VISION_ACTIVE":
      return {
        title: "Create your first goal",
        description: "Translate your vision into measurable outcomes.",
        href: "/dashboard/goals",
      };
    case "GOAL_ACTIVE":
      return {
        title: "Create first milestone",
        description: "Break your goal into checkpoints to unlock actions.",
        href: "/dashboard/goals",
      };
    case "ROADMAP_ACTIVE":
      return {
        title: "Create your first action",
        description: "Connect daily work to milestones to start taking action.",
        href: "/dashboard/execution",
      };
    case "EXECUTING":
      return input.activeActionTitle
        ? {
            title: "Start focus session",
            description: "Enter deep work on your current action.",
            href: "/dashboard/focus",
          }
        : {
            title: "Choose an action",
            description: "Select an action in Actions to begin.",
            href: "/dashboard/execution",
          };
    case "OPTIMIZED":
      return {
        title: "Review and optimize",
        description: "Use analytics to refine your action rhythm.",
        href: "/dashboard/analytics",
      };
  }
}

function resolveCurrentFocus(
  level: SystemMaturityLevel,
  input: SystemLifecycleInput
): string | null {
  if (level === "EMPTY") return null;
  if (input.activeActionTitle) return input.activeActionTitle;
  if (input.primaryGoalTitle) return input.primaryGoalTitle;
  return input.visionTitle;
}

export function resolveSystemLifecycle(
  input: SystemLifecycleInput
): SystemLifecycle {
  const level = resolveSystemMaturityLevel(input);

  return {
    level,
    levelNumber: LEVEL_NUMBERS[level],
    statusLabel: STATUS_LABELS[level],
    description: STATUS_LABELS[level],
    currentFocus: resolveCurrentFocus(level, input),
    nextStep: resolveNextStep(level, input),
  };
}

export function buildStrategicChainDisplay(input: {
  visionTitle: string | null;
  primaryGoalTitle: string | null;
  milestoneTitle: string | null;
  actionTitle: string | null;
  goalCount: number;
  milestoneCount: number;
  actionCount: number;
}): StrategicChainDisplay {
  const vision: StrategicChainLink = input.visionTitle
    ? { state: "complete", text: input.visionTitle }
    : { state: "next", text: "Create vision" };

  const goal: StrategicChainLink = input.primaryGoalTitle
    ? { state: "complete", text: input.primaryGoalTitle }
    : input.visionTitle
      ? { state: "next", text: "Next: Create goal" }
      : { state: "waiting", text: "Waiting for vision" };

  const milestone: StrategicChainLink =
    input.milestoneCount > 0 && input.milestoneTitle
      ? { state: "complete", text: input.milestoneTitle }
      : input.milestoneCount > 0
        ? {
            state: "complete",
            text: `${input.milestoneCount} milestone${input.milestoneCount === 1 ? "" : "s"}`,
          }
        : input.goalCount > 0
          ? { state: "next", text: "Next: Create milestone" }
          : { state: "waiting", text: "Waiting for goal" };

  const action: StrategicChainLink = input.actionTitle
    ? { state: "complete", text: input.actionTitle }
    : input.actionCount > 0
      ? { state: "next", text: "Next: Choose action" }
      : input.milestoneCount > 0
        ? { state: "next", text: "Next: Create action" }
        : { state: "waiting", text: "Waiting for milestone" };

  return { vision, goal, milestone, action };
}

/** Area-specific status labels for page sections */
export function areaStatusLabels(input: SystemLifecycleInput) {
  const level = resolveSystemMaturityLevel(input);

  return {
    system: STATUS_LABELS[level],
    vision: input.hasVision ? "Active" : "Setup Required",
    goals:
      input.goalCount > 0
        ? input.milestoneCount === 0
          ? "Active — waiting for milestones"
          : "Active"
        : input.hasVision
          ? "Next: create a goal"
          : "—",
    actions:
      !input.hasVision
        ? "No active system"
        : input.actionCount > 0
          ? "Taking action"
          : input.milestoneCount > 0
            ? "Ready for actions"
            : "Waiting for actions",
    focus:
      input.actionCount > 0
        ? input.completedFocusSessionCount > 0
          ? "Active"
          : "No focus data yet"
        : "No focus data yet",
    knowledge:
      input.completedActionCount > 0
        ? "Ready for entries"
        : input.goalCount > 0
          ? "Waiting for actions"
          : input.hasVision
            ? "Waiting for goals"
            : "Knowledge locked",
    analytics: level === "OPTIMIZED" ? "Active" : "Collecting data",
  };
}

export function isSystemStarted(input: Pick<SystemLifecycleInput, "hasVision">) {
  return input.hasVision;
}
