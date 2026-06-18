import { VisionOverview } from "@/features/vision/components/vision-overview";
import { getVisionPageData } from "@/features/vision/actions/vision.actions";

export default async function VisionPage() {
  const data = await getVisionPageData();
  return <VisionOverview data={data} />;
}
