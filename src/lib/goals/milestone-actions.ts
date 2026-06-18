export function buildMilestoneIdsByGoal(
  milestones: Array<{
    _id: { toString(): string };
    goalId: { toString(): string };
  }>
) {
  const map = new Map<string, Set<string>>();

  for (const milestone of milestones) {
    const goalId = milestone.goalId.toString();
    const milestoneIds = map.get(goalId) ?? new Set<string>();
    milestoneIds.add(milestone._id.toString());
    map.set(goalId, milestoneIds);
  }

  return map;
}

export function isMilestoneLinkedAction(
  action: {
    milestoneId?: { toString(): string } | null;
    goalId?: { toString(): string } | null;
  },
  milestoneIds: Set<string>,
  goalId?: string,
  milestoneGoalIds?: Map<string, string>
) {
  if (!action.milestoneId) return false;

  const milestoneId = action.milestoneId.toString();
  if (!milestoneIds.has(milestoneId)) return false;

  if (goalId) {
    const resolvedGoalId =
      action.goalId?.toString() ?? milestoneGoalIds?.get(milestoneId);
    if (resolvedGoalId !== goalId) return false;
  }

  return true;
}

export function countMilestoneLinkedActions(
  actions: Array<{
    milestoneId?: { toString(): string } | null;
    goalId?: { toString(): string } | null;
  }>,
  milestoneIds: Set<string>,
  goalId?: string,
  milestoneGoalIds?: Map<string, string>
) {
  return actions.filter((action) =>
    isMilestoneLinkedAction(action, milestoneIds, goalId, milestoneGoalIds)
  ).length;
}

export function resolveActionGoalId(
  action: {
    _id: { toString(): string };
    goalId?: { toString(): string } | null;
    milestoneId?: { toString(): string } | null;
  },
  milestoneGoalIds: Map<string, string>
) {
  if (action.goalId) return action.goalId.toString();

  if (action.milestoneId) {
    return milestoneGoalIds.get(action.milestoneId.toString());
  }

  return undefined;
}

export function buildMilestoneGoalIdMap(
  milestones: Array<{
    _id: { toString(): string };
    goalId: { toString(): string };
  }>
) {
  return new Map(
    milestones.map((milestone) => [
      milestone._id.toString(),
      milestone.goalId.toString(),
    ])
  );
}
