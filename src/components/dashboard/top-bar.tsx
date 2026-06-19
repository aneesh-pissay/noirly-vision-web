"use client";

import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { NotificationBell } from "@/features/notifications/components/notification-bell";
import { UserAvatar } from "@/components/dashboard/user-menu";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/stores/use-ui-store";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/vision": "Vision",
  "/dashboard/goals": "Goals",
  "/milestones": "Milestones",
  "/dashboard/execution": "Actions",
  "/dashboard/focus": "Focus",
  "/dashboard/vault": "Knowledge",
  "/dashboard/analytics": "Analytics",
  "/dashboard/settings": "Settings",
};

function getPageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname]!;
  const match = Object.entries(PAGE_TITLES)
    .filter(([path]) => path !== "/dashboard")
    .find(([path]) => pathname.startsWith(path));
  return match?.[1] ?? "Dashboard";
}

export function DashboardTopBar() {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);
  const { setSidebarOpen } = useUIStore();

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border bg-background px-4 md:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 shrink-0 text-muted-foreground md:hidden"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open sidebar"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="truncate text-sm font-semibold tracking-tight text-foreground">
          {pageTitle}
        </h1>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <NotificationBell />
        <UserAvatar />
      </div>
    </header>
  );
}
