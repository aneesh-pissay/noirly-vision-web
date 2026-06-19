import { MilestonesOverview } from "@/components/dashboard/milestones-overview";
import { getMilestonesPageData } from "@/features/milestones/actions/milestones.actions";

export default async function MilestonesPage() {
  const data = await getMilestonesPageData();
  return <MilestonesOverview data={data} />;
}
