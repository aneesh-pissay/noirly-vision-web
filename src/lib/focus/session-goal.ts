export function resolveSessionGoalId(
  session: {
    actionId?: { toString(): string } | null;
  },
  actionGoalIds: Map<string, string>
) {
  if (!session.actionId) return undefined;
  return actionGoalIds.get(session.actionId.toString());
}

export function buildActionGoalIdMap(
  actions: Array<{
    _id: { toString(): string };
    goalId?: { toString(): string } | null;
  }>
) {
  const map = new Map<string, string>();
  for (const action of actions) {
    const goalId = action.goalId?.toString();
    if (goalId) {
      map.set(action._id.toString(), goalId);
    }
  }
  return map;
}
