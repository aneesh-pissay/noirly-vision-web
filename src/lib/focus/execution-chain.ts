import Action from "@/models/action.model";
import Goal from "@/models/goal.model";
import Vision from "@/models/vision.model";

export type ExecutionChain = {
  actionTitle: string;
  goalTitle?: string;
  visionTitle?: string;
};

export async function buildExecutionChainsForActions(
  userId: string,
  actions: { _id: { toString(): string }; title: string; goalId?: { toString(): string } | null }[]
): Promise<Map<string, ExecutionChain>> {
  const goalIds = [
    ...new Set(
      actions
        .map((action) => action.goalId?.toString())
        .filter((value): value is string => Boolean(value))
    ),
  ];

  const goals = goalIds.length
    ? await Goal.find({ _id: { $in: goalIds }, userId })
        .select("title visionId")
        .lean()
    : [];

  const goalMap = new Map(
    goals.map((goal) => [goal._id.toString(), goal])
  );

  const visionIds = [
    ...new Set(
      goals
        .map((goal) => goal.visionId?.toString())
        .filter((value): value is string => Boolean(value))
    ),
  ];

  const visions = visionIds.length
    ? await Vision.find({ _id: { $in: visionIds }, userId }).select("title").lean()
    : [];

  const visionMap = new Map(
    visions.map((vision) => [vision._id.toString(), vision.title])
  );

  const chains = new Map<string, ExecutionChain>();

  for (const action of actions) {
    const goal = action.goalId
      ? goalMap.get(action.goalId.toString())
      : undefined;

    chains.set(action._id.toString(), {
      actionTitle: action.title,
      goalTitle: goal?.title,
      visionTitle: goal?.visionId
        ? visionMap.get(goal.visionId.toString())
        : undefined,
    });
  }

  return chains;
}

export async function buildExecutionChainForAction(
  userId: string,
  actionId: string
): Promise<ExecutionChain | null> {
  const action = await Action.findOne({ _id: actionId, userId })
    .select("title goalId")
    .lean();

  if (!action) return null;

  const chains = await buildExecutionChainsForActions(userId, [action]);
  return chains.get(actionId) ?? null;
}
