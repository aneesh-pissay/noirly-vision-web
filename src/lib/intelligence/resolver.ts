import {
  resolveSystemLifecycle,
  type SystemLifecycleInput,
  type SystemMaturityLevel,
} from "@/lib/progress/lifecycle";

export type StrategicIntelligenceInput = SystemLifecycleInput;

export type StrategicIntelligence = {
  systemState: SystemMaturityLevel;
  statusLabel: string;
  currentPriority: string | null;
  nextStep: {
    title: string;
    description: string;
    href: string;
  };
  blockers: string[];
};

export function resolveStrategicIntelligence(
  input: StrategicIntelligenceInput
): StrategicIntelligence {
  const lifecycle = resolveSystemLifecycle(input);

  return {
    systemState: lifecycle.level,
    statusLabel: lifecycle.statusLabel,
    currentPriority: lifecycle.currentFocus,
    nextStep: lifecycle.nextStep,
    blockers: [],
  };
}
