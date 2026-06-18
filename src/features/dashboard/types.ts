import type {

  StrategicChainDisplay,

  SystemMaturityLevel,

} from "@/lib/progress/lifecycle";



export interface DashboardPageData {

  vision: {

    title: string;

    lifeArea: string;

    progress: number | null;

    connectedGoalCount: number;

    focusArea: string | null;

  } | null;



  lifecycle: {

    level: SystemMaturityLevel;

    statusLabel: string;

    description: string;

  };



  executionScore: number | null;

  totalActions: number;
  milestoneCount: number;



  mission: {

    id: string;

    title: string;

  } | null;



  strategicChain: StrategicChainDisplay;



  focusTrend: { label: string; minutes: number }[];

  focusHours: number;

  focusSessionCount: number;



  weeklyReview: {

    completedActions: number;

    focusHours: number;

    progressChange: string | null;

  };



  goals: {

    id: string;

    title: string;

    progress: number;

    milestoneCount: number;

  }[];

}


