"use client";

import { useEffect } from "react";
import {
  useDashboardPanel,
  type DashboardPanelData,
} from "@/components/layout/dashboard/panel-context";

export function DashboardPanelBridge({ data }: { data: DashboardPanelData }) {
  const { setPanel } = useDashboardPanel();

  useEffect(() => {
    setPanel(data);
  }, [data, setPanel]);

  return null;
}
