"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  ChevronLeft,
  Eye,
  Flag,
  LayoutDashboard,
  LayoutGrid,
  Plus,
  Timer,
} from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGoalsDialog } from "@/features/goals/components/goals-dialog-provider";
import { useOsPermissions } from "@/features/os/components/os-permissions-provider";
import { useVaultDialog } from "@/features/vault/components/vault-dialog-provider";
import {
  DASHBOARD_NAV_MAIN,
  DASHBOARD_NAV_WORKSPACE,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/use-ui-store";

const iconMap = {
  LayoutDashboard,
  Eye,
  Flag,
  LayoutGrid,
  Timer,
  BookOpen,
  BarChart3,
} as const;

type NavItem = {
  title: string;
  href: string;
  icon: keyof typeof iconMap;
};

function NavLink({
  item,
  pathname,
  collapsed,
}: {
  item: NavItem;
  pathname: string;
  collapsed: boolean;
}) {
  const Icon = iconMap[item.icon];
  const isActive =
    item.href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(item.href);

  return (
    <Link
      href={item.href}
      title={collapsed ? item.title : undefined}
      className={cn(
        "relative flex items-center rounded-lg py-2 transition-colors",
        collapsed ? "justify-center px-2" : "gap-3 px-3",
        isActive
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-accent hover:text-foreground"
      )}
    >
      {isActive && (
        <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-primary" />
      )}
      <Icon className={cn("h-4 w-4 shrink-0", isActive && "text-primary")} />
      {!collapsed ? <span className="text-sm font-medium">{item.title}</span> : null}
    </Link>
  );
}

function NavSection({
  label,
  items,
  pathname,
  collapsed,
}: {
  label: string;
  items: readonly NavItem[];
  pathname: string;
  collapsed: boolean;
}) {
  return (
    <div>
      {!collapsed ? (
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
      ) : null}
      <div className="space-y-0.5">
        {items.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            pathname={pathname}
            collapsed={collapsed}
          />
        ))}
      </div>
    </div>
  );
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { sidebarCollapsed, toggleSidebarCollapsed } = useUIStore();
  const { setOpen: setCreateGoalOpen } = useGoalsDialog();
  const { openNewEntry } = useVaultDialog();
  const { vault, execution, goals, counts } = useOsPermissions();
  const isGoalsPage = pathname.startsWith("/dashboard/goals");

  function handleNewEntry(action: string) {
    switch (action) {
      case "vision":
        router.push("/dashboard/vision");
        break;
      case "goal":
        if (counts.visionCount === 0) {
          router.push("/dashboard/vision");
          break;
        }
        setCreateGoalOpen(true);
        break;
      case "milestone":
        if (counts.visionCount === 0) {
          router.push("/dashboard/vision");
        } else if (counts.goalCount === 0) {
          router.push("/dashboard/goals");
        } else {
          router.push("/dashboard/goals");
        }
        break;
      case "action":
        if (!execution.unlocked) {
          router.push(execution.ctaHref ?? "/dashboard/goals");
        } else {
          router.push("/dashboard/execution");
        }
        break;
      case "vault":
        if (vault.unlocked) {
          openNewEntry();
        }
        router.push("/dashboard/vault");
        break;
    }
  }

  return (
    <aside
      className={cn(
        "flex h-screen shrink-0 flex-col border-r border-border bg-surface transition-[width] duration-200",
        sidebarCollapsed ? "w-[72px]" : "w-56"
      )}
    >
      <div
        className={cn(
          "shrink-0 py-5",
          sidebarCollapsed ? "px-2" : "px-4"
        )}
      >
        <div
          className={cn(
            "flex items-start gap-1",
            sidebarCollapsed ? "flex-col items-center" : "justify-between"
          )}
        >
          <Logo collapsed={sidebarCollapsed} showSubtitle />
          {!sidebarCollapsed ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-muted-foreground"
              onClick={toggleSidebarCollapsed}
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="mt-2 h-8 w-8 shrink-0 text-muted-foreground"
              onClick={toggleSidebarCollapsed}
              aria-label="Expand sidebar"
            >
              <ChevronLeft className="h-4 w-4 rotate-180" />
            </Button>
          )}
        </div>
      </div>

      <nav className="min-h-0 flex-1 overflow-hidden px-3">
        <div className="space-y-6">
          <NavSection
            label="Main"
            items={DASHBOARD_NAV_MAIN as readonly NavItem[]}
            pathname={pathname}
            collapsed={sidebarCollapsed}
          />
          <NavSection
            label="Workspace"
            items={DASHBOARD_NAV_WORKSPACE as readonly NavItem[]}
            pathname={pathname}
            collapsed={sidebarCollapsed}
          />
        </div>
      </nav>

      <div className="shrink-0 border-t border-border p-3">
        {isGoalsPage && !goals.unlocked ? (
          <Button
            asChild
            className={cn(
              "h-11 rounded-lg",
              sidebarCollapsed ? "w-11 px-0" : "w-full"
            )}
            size={sidebarCollapsed ? "icon" : "default"}
          >
            <Link href="/dashboard/vision" title={sidebarCollapsed ? "Create Vision" : undefined}>
              <Plus className="h-4 w-4" />
              {!sidebarCollapsed ? <span className="ml-2">Create Vision</span> : null}
            </Link>
          </Button>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className={cn(
                  "h-11 rounded-lg",
                  sidebarCollapsed ? "w-11 px-0" : "w-full"
                )}
                size={sidebarCollapsed ? "icon" : "default"}
                title={sidebarCollapsed ? "New Entry" : undefined}
              >
                <Plus className="h-4 w-4" />
                {!sidebarCollapsed ? <span className="ml-2">New Entry</span> : null}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52">
              <DropdownMenuLabel>Create</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleNewEntry("vision")}>
                Create Vision
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleNewEntry("goal")}
                disabled={counts.visionCount === 0}
              >
                Create Goal
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleNewEntry("milestone")}
                disabled={counts.visionCount === 0 || counts.goalCount === 0}
              >
                Create Milestone
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleNewEntry("action")}
                disabled={!execution.unlocked}
              >
                Create Action
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleNewEntry("vault")}
                disabled={!vault.unlocked}
              >
                Create Vault Entry
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </aside>
  );
}
