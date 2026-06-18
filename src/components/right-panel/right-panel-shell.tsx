import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function RightPanelShell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <aside
      className={cn(
        "noirly-sidebar-panel hidden w-72 shrink-0 flex-col gap-4 overflow-y-auto overflow-x-hidden border-l border-border bg-background p-4 xl:flex",
        className
      )}
    >
      {children}
    </aside>
  );
}
