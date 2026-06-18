import type { StrategicIntelligence } from "@/lib/intelligence/resolver";

export type RightPanelState = "new" | "partial" | "active";

export type SystemChecklist = {
  hasVision: boolean;
  hasGoals: boolean;
  hasActions: boolean;
  hasFocusSession: boolean;
  hasVaultEntry: boolean;
};

export type RightPanelInsight = {
  id: string;
  title: string;
  description: string;
  tone: "primary" | "success" | "warning";
};

export type RightPanelGoal = {
  id: string;
  title: string;
  progress: number;
};

export type RightPanelNote = {
  id: string;
  title: string;
  preview?: string;
  updatedAt: string;
};

export type RightPanelData = {
  state: RightPanelState;
  checklist: SystemChecklist;
  setupProgress: number;
  intelligence: StrategicIntelligence;
};
