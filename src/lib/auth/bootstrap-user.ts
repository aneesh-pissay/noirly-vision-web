import { connectDB } from "@/lib/db";
import Settings from "@/models/settings.model";

export async function bootstrapUserData(userId: string) {
  await connectDB();
  const timezone =
    typeof Intl !== "undefined"
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : "UTC";

  await Settings.findOneAndUpdate(
    { userId },
    {
      $setOnInsert: {
        timezone,
      },
    },
    { upsert: true, new: true }
  );
}
