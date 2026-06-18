import { format } from "date-fns";
import type { NotificationType } from "@/lib/notifications/constants";
import type { CreateNotificationInput } from "@/lib/notifications/types";
import type { INotification } from "@/models/notification.model";
import type { SerializedNotification } from "@/lib/notifications/types";

export function buildDedupeKey(input: CreateNotificationInput): string {
  const date = format(new Date(), "yyyy-MM-dd");
  const entityType = input.relatedEntity?.type ?? "none";
  const entityId = input.relatedEntity?.id ?? "none";

  return `${input.userId}:${input.type}:${entityType}:${entityId}:${date}`;
}

export function serializeNotification(
  notification: INotification | Record<string, unknown>
): SerializedNotification {
  const record = notification as INotification;

  return {
    id: String(record._id),
    type: record.type,
    title: record.title,
    message: record.message,
    priority: record.priority,
    actionUrl: record.actionUrl,
    isRead: record.isRead,
    createdAt:
      record.createdAt instanceof Date
        ? record.createdAt.toISOString()
        : String(record.createdAt),
    relatedEntity: record.relatedEntity
      ? {
          type: record.relatedEntity.type,
          id: record.relatedEntity.id
            ? String(record.relatedEntity.id)
            : undefined,
        }
      : undefined,
  };
}

export function isToday(date: Date): boolean {
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

export function getUserLocalHourMinute(timezone: string): {
  hour: number;
  minute: number;
} {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).formatToParts(new Date());

    const hour = Number(parts.find((p) => p.type === "hour")?.value ?? 0);
    const minute = Number(parts.find((p) => p.type === "minute")?.value ?? 0);
    return { hour, minute };
  } catch {
    const now = new Date();
    return { hour: now.getUTCHours(), minute: now.getUTCMinutes() };
  }
}

export function isLocalTimeMatch(
  timezone: string,
  targetTime: string,
  windowMinutes = 30
): boolean {
  const [targetHour, targetMinute] = targetTime.split(":").map(Number);
  if (Number.isNaN(targetHour) || Number.isNaN(targetMinute)) return false;

  const { hour, minute } = getUserLocalHourMinute(timezone);
  const currentTotal = hour * 60 + minute;
  const targetTotal = targetHour * 60 + targetMinute;
  const diff = Math.abs(currentTotal - targetTotal);

  return diff <= windowMinutes || diff >= 24 * 60 - windowMinutes;
}

export function isSundayInTimezone(timezone: string): boolean {
  try {
    const weekday = new Intl.DateTimeFormat("en-US", {
      timeZone: timezone,
      weekday: "short",
    }).format(new Date());
    return weekday === "Sun";
  } catch {
    return new Date().getUTCDay() === 0;
  }
}

export function shouldAllowPush(
  type: NotificationType,
  priority: string
): boolean {
  if (type === "focus" || type === "review") return true;
  if (type === "execution" && priority === "high") return true;
  if (type === "achievement") return true;
  return false;
}

export function shouldAllowEmail(
  type: NotificationType,
  relatedEntityType?: string
): boolean {
  if (type === "security") return true;
  if (type === "achievement") return true;
  if (type === "review") {
    return relatedEntityType === "weekly" || relatedEntityType === "daily";
  }
  return false;
}
