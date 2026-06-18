import { ExecutionOverview } from "@/features/execution/components/execution-overview";
import { getExecutionPageData } from "@/features/execution/actions/execution.actions";

export default async function ExecutionPage() {
  const data = await getExecutionPageData();
  return <ExecutionOverview data={data} />;
}
