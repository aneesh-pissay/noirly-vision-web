"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { CreateGoalDialog } from "@/features/goals/components/CreateGoalDialog";
import { useOsPermissions } from "@/features/os/components/os-permissions-provider";

type GoalsDialogContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const GoalsDialogContext = createContext<GoalsDialogContextValue | null>(null);

export function GoalsDialogProvider({ children }: { children: ReactNode }) {
  const { goals } = useOsPermissions();
  const [open, setOpenState] = useState(false);

  const setOpen = useCallback(
    (next: boolean) => {
      if (next && !goals.unlocked) return;
      setOpenState(next);
    },
    [goals.unlocked]
  );

  const value = useMemo(() => ({ open, setOpen }), [open, setOpen]);

  return (
    <GoalsDialogContext.Provider value={value}>
      {children}
      {goals.unlocked && <CreateGoalDialog open={open} onOpenChange={setOpen} />}
    </GoalsDialogContext.Provider>
  );
}

export function useGoalsDialog() {
  const ctx = useContext(GoalsDialogContext);
  if (!ctx) {
    throw new Error("useGoalsDialog must be used within GoalsDialogProvider");
  }
  return ctx;
}
