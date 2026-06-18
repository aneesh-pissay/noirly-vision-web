import { FocusRoom } from "@/features/focus/components/focus-room";
import { getFocusPageData } from "@/features/focus/actions/focus.actions";

export default async function FocusPage() {
  const data = await getFocusPageData();
  return <FocusRoom data={data} />;
}
