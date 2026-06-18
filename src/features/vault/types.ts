import type { VaultLockDisplay } from "@/lib/progress/permissions";
import type { VaultType } from "@/types";

export interface VaultCollection {
  id: string;
  name: string;
  count: number;
}

export interface LinkOption {
  id: string;
  title: string;
}

export interface GoalLinkOption extends LinkOption {
  visionId?: string;
}

export interface ActionLinkOption extends LinkOption {
  goalId?: string;
}

export interface FocusSessionLinkOption extends LinkOption {
  actionId?: string;
}

export interface VaultEntryItem {
  id: string;
  type: VaultType;
  title: string;
  content?: string;
  tags: string[];
  linkedVision?: string;
  linkedGoal?: string;
  linkedAction?: string;
  linkedFocusSession?: string;
  linkedVisionTitle?: string;
  linkedGoalTitle?: string;
  linkedActionTitle?: string;
  linkedFocusSessionTitle?: string;
  isLinked: boolean;
  updatedAt: string;
}

export interface VaultPageData {
  lock: VaultLockDisplay;
  collections: VaultCollection[];
  entries: VaultEntryItem[];
  linkOptions: {
    visions: LinkOption[];
    goals: GoalLinkOption[];
    actions: ActionLinkOption[];
    focusSessions: FocusSessionLinkOption[];
  };
  stats: {
    totalEntries: number;
    linkedEntries: number;
    knowledgeAlignment: number;
    lessonsCaptured: number;
    decisionsLogged: number;
    tagCount: number;
  };
}
