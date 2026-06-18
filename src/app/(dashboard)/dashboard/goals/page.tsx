import { GoalsOverview } from "@/components/dashboard/goals-overview";
import { getGoalsPageData } from "@/features/goals/actions/goals.actions";

export default async function GoalsPage() {
  const data = await getGoalsPageData();
  return <GoalsOverview data={data} />;
}
