"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  BarChart3,
  Calendar,
  CheckSquare,
  ChevronLeft,
  FolderKanban,
  LayoutDashboard,
  Settings,
} from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  DASHBOARD_NAV_MAIN,
  DASHBOARD_NAV_WORKSPACE,
} from "@/lib/constants";

const NAV_ITEMS = [
  ...DASHBOARD_NAV_MAIN,
  ...DASHBOARD_NAV_WORKSPACE,
  { title: "Settings", href: "/dashboard/settings", icon: "Settings" as const },
];
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/use-ui-store";

const iconMap = {
  LayoutDashboard,
  CheckSquare,
  FolderKanban,
  Calendar,
  BarChart3,
  Settings,
} as const;

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebarCollapsed } = useUIStore();

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? 72 : 260 }}
      className="relative flex h-full flex-col border-r border-border bg-surface"
    >
      <div className="flex h-16 items-center justify-between px-4">
        <Logo collapsed={sidebarCollapsed} />
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={toggleSidebarCollapsed}
        >
          <ChevronLeft
            className={cn(
              "h-4 w-4 transition-transform",
              sidebarCollapsed && "rotate-180"
            )}
          />
        </Button>
      </div>

      <Separator />

      <nav className="flex-1 space-y-1 p-3">
        {NAV_ITEMS.map((item) => {
          const Icon = iconMap[item.icon as keyof typeof iconMap];
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!sidebarCollapsed && <span>{item.title}</span>}
            </Link>
          );
        })}
      </nav>

      {!sidebarCollapsed && (
        <div className="p-4">
          <div className="rounded-xl border border-border bg-card p-4 noirly-gradient">
            <p className="text-xs font-medium text-primary">Pro Tip</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Use keyboard shortcuts to navigate faster across your workspace.
            </p>
          </div>
        </div>
      )}
    </motion.aside>
  );
}
