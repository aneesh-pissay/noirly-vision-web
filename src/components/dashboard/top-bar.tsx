"use client";

import { usePathname } from "next/navigation";
import { NotificationBell } from "@/features/notifications/components/notification-bell";
import { UserMenu } from "@/components/dashboard/user-menu";
import { PROFILE_ROUTE } from "@/lib/constants";

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/vision": "Vision",
  "/dashboard/goals": "Goals",
  "/dashboard/execution": "Execution",
  "/dashboard/focus": "Focus",
  "/dashboard/vault": "Vault",
  "/dashboard/analytics": "Analytics",
  "/dashboard/settings": "Settings",
  [PROFILE_ROUTE]: "Profile",
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

  return (
    <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b border-border bg-background px-6">
      <div className="min-w-0">
        <h1 className="truncate text-sm font-semibold tracking-tight text-foreground">
          {pageTitle}
        </h1>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <NotificationBell />
        <UserMenu />
      </div>
    </header>
  );
}
