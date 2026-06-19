import type { SystemChecklist } from "@/components/right-panel/types";
import type { OsCounts } from "@/lib/progress/load-os-counts";

export type VaultLockState =
  | "locked_no_vision"
  | "waiting_for_goals"
  | "waiting_for_execution"
  | "unlocked";

export type VaultLockDisplay = {
  state: VaultLockState;
  unlocked: boolean;
  title: string;
  message: string;
  ctaLabel: string | null;
  ctaHref: string | null;
};

export type FeatureLockDisplay = {
  unlocked: boolean;
  title: string;
  message: string;
  ctaLabel: string | null;
  ctaHref: string | null;
};

export type OsPermissions = {
  counts: OsCounts;
  goals: FeatureLockDisplay;
  milestones: FeatureLockDisplay;
  vault: VaultLockDisplay;
  execution: FeatureLockDisplay;
  focus: FeatureLockDisplay;
  analytics: {
    hasRealData: boolean;
  };
  checklist: SystemChecklist;
  setupProgress: number;
};

export function resolveMilestonesLock(counts: OsCounts): FeatureLockDisplay {
  const unlocked = counts.visionCount > 0 && counts.goalCount > 0;

  if (!unlocked && counts.visionCount === 0) {
    return {
      unlocked: false,
      title: "Milestones locked",
      message:
        "Create your vision first. Milestones break goals into checkpoints.",
      ctaLabel: "Create Vision",
      ctaHref: "/dashboard/vision",
    };
  }

  return {
    unlocked,
    title: unlocked ? "Milestones active" : "Milestones locked",
    message: unlocked
      ? "Break goals into measurable checkpoints."
      : "Create a goal first. Milestones break goals into checkpoints.",
    ctaLabel: unlocked ? null : "Go to Goals",
    ctaHref: unlocked ? null : "/dashboard/goals",
  };
}

export function resolveGoalsLock(counts: OsCounts): FeatureLockDisplay {
  const unlocked = counts.visionCount > 0;

  return {
    unlocked,
    title: unlocked ? "Goals active" : "Goals locked",
    message: unlocked
      ? "Transform your vision into measurable outcomes."
      : "Create your vision first. Goals turn your vision into measurable outcomes.",
    ctaLabel: unlocked ? null : "Create Vision",
    ctaHref: unlocked ? null : "/dashboard/vision",
  };
}

export function resolveVaultLock(counts: OsCounts): VaultLockDisplay {
  if (counts.visionCount === 0) {
    return {
      state: "locked_no_vision",
      unlocked: false,
      title: "Knowledge locked",
      message:
        "Create your vision and complete actions before capturing knowledge.",
      ctaLabel: "Create Vision",
      ctaHref: "/dashboard/vision",
    };
  }

  if (counts.goalCount === 0) {
    return {
      state: "waiting_for_goals",
      unlocked: false,
      title: "Waiting for goals",
      message: "Knowledge connects to completed work. Create goals first.",
      ctaLabel: "Create Goal",
      ctaHref: "/dashboard/goals",
    };
  }

  if (counts.completedActionCount === 0) {
    return {
      state: "waiting_for_execution",
      unlocked: false,
      title: "Waiting for actions",
      message:
        "Complete actions and focus sessions to generate knowledge.",
      ctaLabel: "Go to Actions",
      ctaHref: "/dashboard/execution",
    };
  }

  return {
    state: "unlocked",
    unlocked: true,
    title: "Knowledge active",
    message: "Capture knowledge from completed work.",
    ctaLabel: null,
    ctaHref: null,
  };
}

export function resolveExecutionLock(counts: OsCounts): FeatureLockDisplay {
  const unlocked = counts.milestoneCount > 0;

  return {
    unlocked,
    title: unlocked ? "Actions active" : "Actions locked",
    message: unlocked
      ? "Plan and complete actions from your milestones."
      : "Create milestones on your goals before planning actions.",
    ctaLabel: unlocked ? null : "Go to Milestones",
    ctaHref: unlocked ? null : "/milestones",
  };
}

export function resolveFocusLock(counts: OsCounts): FeatureLockDisplay {
  const unlocked = counts.actionCount > 0;

  return {
    unlocked,
    title: unlocked ? "Focus ready" : "Focus locked",
    message: unlocked
      ? "Start a session linked to an action."
      : "Create actions before starting focus sessions.",
    ctaLabel: unlocked ? null : "Go to Actions",
    ctaHref: unlocked ? null : "/dashboard/execution",
  };
}

export function resolveSystemChecklist(counts: OsCounts): SystemChecklist {
  const hasVision = counts.visionCount > 0;
  const hasGoals = hasVision && counts.goalCount > 0;
  const hasActions =
    hasGoals && counts.milestoneCount > 0 && counts.actionCount > 0;
  const hasFocusSession = hasActions && counts.completedFocusSessionCount > 0;
  const hasVaultEntry =
    hasFocusSession && counts.vaultEntryCount > 0;

  return {
    hasVision,
    hasGoals,
    hasActions,
    hasFocusSession,
    hasVaultEntry,
  };
}

export function resolveOsPermissions(counts: OsCounts): OsPermissions {
  const checklist = resolveSystemChecklist(counts);
  const setupProgress = Object.values(checklist).filter(Boolean).length;

  return {
    counts,
    goals: resolveGoalsLock(counts),
    milestones: resolveMilestonesLock(counts),
    vault: resolveVaultLock(counts),
    execution: resolveExecutionLock(counts),
    focus: resolveFocusLock(counts),
    analytics: {
      hasRealData:
        counts.milestoneCount > 0 &&
        counts.actionCount > 0 &&
        counts.completedActionCount > 0,
    },
    checklist,
    setupProgress,
  };
}

export function assertGoalsUnlocked(permissions: OsPermissions) {
  if (!permissions.goals.unlocked) {
    throw new Error("Create a vision before adding goals");
  }
}

export function assertVaultUnlocked(permissions: OsPermissions) {
  if (!permissions.vault.unlocked) {
    throw new Error(permissions.vault.message);
  }
}

export function assertExecutionUnlocked(permissions: OsPermissions) {
  if (!permissions.execution.unlocked) {
    throw new Error(permissions.execution.message);
  }
}

export function assertFocusUnlocked(permissions: OsPermissions) {
  if (!permissions.focus.unlocked) {
    throw new Error(permissions.focus.message);
  }
}
