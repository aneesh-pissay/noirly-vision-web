import { AnalyticsOverview } from "@/components/dashboard/analytics-overview";
import { getAnalyticsPageData } from "@/features/analytics/actions/analytics.actions";

export default async function AnalyticsPage() {
  const data = await getAnalyticsPageData();
  return <AnalyticsOverview data={data} />;
}
