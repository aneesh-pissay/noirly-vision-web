export interface VisionLifeArea {
  name: string;
  activeGoals: number;
  focusHours: number;
  alignment: number;
}

export interface VisionGoalMilestone {
  id: string;
  title: string;
  completed: boolean;
  completedActions: number;
  totalActions: number;
  /** null = no actions linked yet (Needs Actions) */
  progress: number | null;
}

export interface VisionGoalRoadmap {
  id: string;
  title: string;
  /** null = no milestones yet (Setup Required) */
  progress: number | null;
  milestones: VisionGoalMilestone[];
}

export interface VisionPerformanceMetrics {
  connectedGoals: number;
  totalMilestones: number;
  completedMilestones: number;
  totalActions: number;
  completedActions: number;
  focusHours: number;
}

export interface VisionNextStep {
  title: string;
  description: string;
}

export type VisionTimelineEventType =
  | "vision_created"
  | "goal_completed"
  | "milestone_achieved";

export interface VisionTrajectoryItem {
  id: string;
  type: VisionTimelineEventType;
  eventLabel: string;
  title: string;
  description?: string;
  year: string;
  dateLabel: string;
}

export interface VisionView {
  id: string;
  title: string;
  description?: string;
  area: string;
  targetDate?: string;
  phase?: string;
  successMetric?: string;
  /** null = Setup Required (no connected goals with milestones) */
  progress: number | null;
  status: string;
  goalRoadmaps: VisionGoalRoadmap[];
  performanceMetrics: VisionPerformanceMetrics;
  lifeAreas: VisionLifeArea[];
}

export interface VisionPageData {
  vision: VisionView | null;
  trajectory: VisionTrajectoryItem[];
  /** null = Setup Required */
  alignmentScore: number | null;
  activeGoals: { id: string; name: string; progress: number }[];
  connectedGoalCount: number;
  nextStep: VisionNextStep | null;
}
