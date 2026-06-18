"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type DashboardPanelData = {
  alignmentScore?: number | null;
  focusLabel?: string;
  nextAction?: string;
  insight?: string;
  executionScore?: number | null;
  activeGoals?: number;
  openActions?: number;
};

type PanelContextValue = {
  panel: DashboardPanelData;
  setPanel: (data: DashboardPanelData) => void;
};

const PanelContext = createContext<PanelContextValue | null>(null);

export function DashboardPanelProvider({ children }: { children: ReactNode }) {
  const [panel, setPanelState] = useState<DashboardPanelData>({});
  const setPanel = useCallback((data: DashboardPanelData) => {
    setPanelState(data);
  }, []);

  const value = useMemo(() => ({ panel, setPanel }), [panel, setPanel]);

  return (
    <PanelContext.Provider value={value}>{children}</PanelContext.Provider>
  );
}

export function useDashboardPanel() {
  const ctx = useContext(PanelContext);
  if (!ctx) {
    throw new Error("useDashboardPanel must be used within DashboardPanelProvider");
  }
  return ctx;
}
