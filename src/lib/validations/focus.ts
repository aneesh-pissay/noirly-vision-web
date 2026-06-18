import { z } from "zod";
import { FOCUS_MODES } from "@/lib/constants";

export const startFocusSessionSchema = z.object({
  actionId: z.string().min(1, "Select an action to work on"),
  plannedMinutes: z.number().int().min(15).max(480).default(90),
  mode: z.enum(FOCUS_MODES).default("deep_work"),
  distractionBlocking: z.boolean().default(true),
});

export const pauseFocusSessionSchema = z.object({
  id: z.string().min(1, "Session id is required"),
});

export const resumeFocusSessionSchema = z.object({
  id: z.string().min(1, "Session id is required"),
});

export const completeFocusSessionSchema = z.object({
  id: z.string().min(1, "Session id is required"),
  quality: z.number().min(0).max(100),
  reflection: z.string().max(2000).optional(),
  actionOutcome: z.enum(["executed", "more_sessions"]).optional(),
});

export type StartFocusSessionInput = z.infer<typeof startFocusSessionSchema>;
export type PauseFocusSessionInput = z.infer<typeof pauseFocusSessionSchema>;
export type ResumeFocusSessionInput = z.infer<typeof resumeFocusSessionSchema>;
export type CompleteFocusSessionInput = z.infer<typeof completeFocusSessionSchema>;
