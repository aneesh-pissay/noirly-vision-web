"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  ChevronLeft,
  Eye,
  Flag,
  LayoutDashboard,
  ListTodo,
  LogOut,
  Milestone,
  Settings,
  Timer,
  X,
} from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/providers/auth-provider";
import {
  DASHBOARD_NAV,
  DASHBOARD_NAV_SETTINGS,
} from "@/lib/constants";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/use-ui-store";

const iconMap = {
  LayoutDashboard,
  Eye,
  Flag,
  Milestone,
  ListTodo,
  Timer,
  BookOpen,
  BarChart3,
  Settings,
} as const;

type NavItem = (typeof DASHBOARD_NAV)[number];

function isNavActive(item: NavItem, pathname: string) {
  if (item.href === "/dashboard") {
    return pathname === "/dashboard";
  }
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function NavLink({
  item,
  pathname,
  collapsed,
  onNavigate,
}: {
  item: NavItem;
  pathname: string;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const Icon = iconMap[item.icon];
  const isActive = isNavActive(item, pathname);

  return (
    <Link
      href={item.href}
      title={collapsed ? item.title : undefined}
      onClick={onNavigate}
      className={cn(
        "flex items-center rounded-lg text-sm font-medium transition-colors",
        collapsed ? "justify-center px-2.5 py-2.5" : "gap-3 px-3 py-2.5",
        isActive
          ? "bg-[#38BDF8]/12 text-[#38BDF8]"
          : "text-muted-foreground hover:bg-accent/80 hover:text-foreground"
      )}
    >
      <Icon
        className={cn(
          "h-[18px] w-[18px] shrink-0",
          isActive ? "text-[#38BDF8]" : "text-muted-foreground"
        )}
      />
      {!collapsed ? <span>{item.title}</span> : null}
    </Link>
  );
}

function BottomLink({
  href,
  icon: Icon,
  label,
  collapsed,
  onNavigate,
}: {
  href: string;
  icon: typeof Settings;
  label: string;
  collapsed: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const isActive = pathname.startsWith(href);

  return (
    <Link
      href={href}
      title={collapsed ? label : undefined}
      onClick={onNavigate}
      className={cn(
        "flex items-center rounded-lg text-sm font-medium transition-colors",
        collapsed ? "justify-center px-2.5 py-2.5" : "gap-3 px-3 py-2.5",
        isActive
          ? "bg-[#38BDF8]/12 text-[#38BDF8]"
          : "text-muted-foreground hover:bg-accent/80 hover:text-foreground"
      )}
    >
      <Icon
        className={cn(
          "h-[18px] w-[18px] shrink-0",
          isActive ? "text-[#38BDF8]" : "text-muted-foreground"
        )}
      />
      {!collapsed ? <span>{label}</span> : null}
    </Link>
  );
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const {
    sidebarCollapsed,
    toggleSidebarCollapsed,
    sidebarOpen,
    setSidebarOpen,
  } = useUIStore();

  function closeMobileSidebar() {
    if (window.matchMedia("(max-width: 767px)").matches) {
      setSidebarOpen(false);
    }
  }

  async function handleLogout() {
    closeMobileSidebar();
    await logout();
  }

  return (
    <>
      {sidebarOpen ? (
        <button
          type="button"
          aria-label="Close sidebar"
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex h-screen shrink-0 flex-col border-r border-border bg-surface transition-[width,transform] duration-200 md:static md:translate-x-0",
          sidebarCollapsed ? "w-[72px]" : "w-64",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        <div
          className={cn(
            "shrink-0 border-b border-border/60",
            sidebarCollapsed ? "px-3 py-4" : "px-5 py-5"
          )}
        >
          <div
            className={cn(
              "flex items-center",
              sidebarCollapsed ? "flex-col gap-2" : "justify-between gap-2"
            )}
          >
            <Logo collapsed={sidebarCollapsed} markSize={28} />
            <div className="flex items-center gap-0.5">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 text-muted-foreground md:hidden"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close sidebar"
              >
                <X className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="hidden h-8 w-8 shrink-0 text-muted-foreground md:inline-flex"
                onClick={toggleSidebarCollapsed}
                aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                <ChevronLeft
                  className={cn(
                    "h-4 w-4 transition-transform",
                    sidebarCollapsed && "rotate-180"
                  )}
                />
              </Button>
            </div>
          </div>
        </div>

        <nav
          className={cn(
            "min-h-0 flex-1 overflow-y-auto overflow-x-hidden",
            sidebarCollapsed ? "px-2 py-4" : "px-3 py-4"
          )}
        >
          <div className="space-y-1">
            {DASHBOARD_NAV.map((item) => (
              <NavLink
                key={item.id}
                item={item}
                pathname={pathname}
                collapsed={sidebarCollapsed}
                onNavigate={closeMobileSidebar}
              />
            ))}
          </div>
        </nav>

        <div
          className={cn(
            "shrink-0 space-y-1 border-t border-border/60",
            sidebarCollapsed ? "px-2 py-4" : "px-3 py-4"
          )}
        >
          <BottomLink
            href={DASHBOARD_NAV_SETTINGS.href}
            icon={Settings}
            label={DASHBOARD_NAV_SETTINGS.title}
            collapsed={sidebarCollapsed}
            onNavigate={closeMobileSidebar}
          />
          <button
            type="button"
            title={sidebarCollapsed ? "Logout" : undefined}
            onClick={() => void handleLogout()}
            className={cn(
              "flex w-full items-center rounded-lg text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/80 hover:text-foreground",
              sidebarCollapsed ? "justify-center px-2.5 py-2.5" : "gap-3 px-3 py-2.5"
            )}
          >
            <LogOut className="h-[18px] w-[18px] shrink-0" />
            {!sidebarCollapsed ? <span>Logout</span> : null}
          </button>
        </div>
      </aside>
    </>
  );
}
