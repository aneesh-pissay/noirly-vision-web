import { requireSessionUserId } from "@/lib/auth/session";

import { connectDB } from "@/lib/db";

import { loadOsCounts } from "@/lib/progress/load-os-counts";
import {
  resolveStrategicIntelligence,
  type StrategicIntelligenceInput,
} from "@/lib/intelligence/resolver";
import { resolveSystemChecklist } from "@/lib/progress/permissions";
import { resolveActiveMission } from "@/lib/metrics/strategic-os";

import type {

  RightPanelData,

  RightPanelState,

  SystemChecklist,

} from "@/components/right-panel/types";

import Action from "@/models/action.model";

import Goal from "@/models/goal.model";

import Vision from "@/models/vision.model";



function resolveState(checklist: SystemChecklist): RightPanelState {

  if (!checklist.hasVision) return "new";



  const completed = Object.values(checklist).filter(Boolean).length;

  if (completed >= 4 && checklist.hasGoals && checklist.hasActions) {

    return "active";

  }



  return "partial";

}



export async function getRightPanelData(): Promise<RightPanelData> {

  const userId = await requireSessionUserId();

  await connectDB();

  const activeVision = await Vision.findOne({ userId, status: "ACTIVE" }).lean();

  const counts = await loadOsCounts(userId);

  const [actions] = await Promise.all([
    Action.find({ userId }).select("status priority createdAt completedAt title").lean(),
  ]);

  const checklist = resolveSystemChecklist(counts);



  const setupProgress = Object.values(checklist).filter(Boolean).length;

  const state = resolveState(checklist);

  const mission = resolveActiveMission(actions);
  const primaryGoal = await Goal.findOne({ userId, status: "ACTIVE" })
    .sort({ createdAt: 1 })
    .select("title")
    .lean();

  const intelligenceInput: StrategicIntelligenceInput = {
    hasVision: counts.visionCount > 0,
    visionTitle: activeVision?.title ?? null,
    goalCount: counts.goalCount,
    primaryGoalTitle: primaryGoal?.title ?? null,
    milestoneCount: counts.milestoneCount,
    actionCount: counts.actionCount,
    completedActionCount: counts.completedActionCount,
    completedFocusSessionCount: counts.completedFocusSessionCount,
    activeActionTitle: mission?.title ?? null,
  };



  return {

    state,

    checklist,

    setupProgress,

    intelligence: resolveStrategicIntelligence(intelligenceInput),

  };

}


