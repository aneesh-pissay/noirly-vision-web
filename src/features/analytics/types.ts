export interface AnalyticsPageData {
  metrics: {
    visionAlignment: number;
    goalProgress: number;
    executionScore: number;
    deepWorkHours: number;
    focusQuality: number;
    vaultGrowth: number;
  };
  stats: {
    alignmentScore: number;
    focusHours: number;
    goalsOnTrack: number;
    executionVelocity: number;
    totalVaultEntries: number;
    vaultEntriesThisWeek: number;
    knowledgeAlignment: number;
    milestoneCount: number;
    actionCount: number;
  };
  growthTrend: { label: string; value: number }[];
  actionDistribution: { label: string; value: number }[];
  focusConsistency: { date: string; score: number }[];
  vaultTrend: { label: string; value: number }[];
  systemStability: { label: string; value: number }[];
  goalHealth: { id: string; title: string; progress: number; status: string }[];
  deepWork: {
    bestWindow: string | null;
    avgSessionMinutes: number;
    weeklyMinutes: number;
  };
  insights: string[];
}
