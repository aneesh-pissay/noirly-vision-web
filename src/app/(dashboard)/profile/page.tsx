import { ProfileOverview } from "@/components/dashboard/profile-overview";
import { getProfilePageData } from "@/features/settings/actions/settings.actions";

export default async function ProfilePage() {
  const data = await getProfilePageData();
  return <ProfileOverview data={data} />;
}
