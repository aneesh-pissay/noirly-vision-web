import type { ActionResult } from "@/types";

export function success<T>(data: T): ActionResult<T> {
  return { success: true, data };
}

export function failure(error: string): ActionResult<never> {
  return { success: false, error };
}

export function parseZodError(error: { issues: { message: string }[] }): string {
  return error.issues[0]?.message ?? "Validation failed";
}
