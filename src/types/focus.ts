import type { FocusMode } from "@/types";

export type FocusSessionDTO = {
  id: string;
  userId: string;
  actionId?: string;
  goalId?: string;
  visionId?: string;
  mission: string;
  mode: FocusMode;
  distractionBlocking: boolean;
  status: "active" | "completed";
  startedAt: string;
  endedAt?: string;
  completedAt?: string;
  plannedMinutes: number;
  duration: number;
  quality: number;
  reflection?: string;
  isPaused: boolean;
  pausedAt?: string;
  totalPausedSeconds: number;
  elapsedSeconds: number;
};
