import type { Types } from "mongoose";

export function id(value: Types.ObjectId | string): string {
  return value.toString();
}

export function iso(date?: Date | null): string | undefined {
  return date ? date.toISOString() : undefined;
}
