export interface ActionOption {
  id: string;
  title: string;
  priority: string;
  goalTitle?: string;
  visionTitle?: string;
}

export interface ExecutionChainView {
  actionTitle: string;
  goalTitle?: string;
  visionTitle?: string;
}

export interface FocusPageData {
  activeSession: {
    id: string;
    mission: string;
    actionId?: string;
    linkedAction?: {
      id: string;
      title: string;
      estimatedMinutes: number;
      completedMinutes: number;
      progress: number;
    };
    mode: string;
    distractionBlocking: boolean;
    executionChain: ExecutionChainView;
    plannedMinutes: number;
    elapsedSeconds: number;
    quality: number;
    progress: number;
    isPaused: boolean;
    startedAt: string;
    pausedAt?: string;
    totalPausedSeconds: number;
  } | null;
  recentSessions: {
    id: string;
    mission: string;
    mode: string;
    plannedMinutes: number;
    duration: number;
    quality: number;
    reflection?: string;
    completedAt?: string;
  }[];
  actionOptions: ActionOption[];
  stats: {
    weeklyMinutes: number;
    weeklyDeepWorkHours: number;
    consistencyDays: number;
    averageQuality: number;
    streak: number;
    bestFocusWindow: {
      label: string;
      sessionCount: number;
    } | null;
  };
  consistencyGrid: { date: string; minutes: number }[];
  suggestedActionId?: string;
}
