"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Check,
  Loader2,
  Shield,
  Sparkles,
  Target,
  Trash2,
  Zap,
} from "lucide-react";
import type { NotificationType } from "@/lib/notifications/constants";
import type { SerializedNotification } from "@/lib/notifications/types";
import { isToday } from "@/lib/notifications/utils";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const TYPE_ICONS: Record<NotificationType, typeof Bell> = {
  strategy: Target,
  execution: Zap,
  focus: Sparkles,
  review: Bell,
  achievement: Sparkles,
  security: Shield,
};

function formatRelativeTime(iso: string) {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString();
}

function NotificationCard({
  notification,
  onRead,
  onDelete,
  onOpen,
}: {
  notification: SerializedNotification;
  onRead: (id: string) => void;
  onDelete: (id: string) => void;
  onOpen: (notification: SerializedNotification) => void;
}) {
  const Icon = TYPE_ICONS[notification.type] ?? Bell;

  return (
    <div
      className={cn(
        "rounded-lg border border-border p-3 transition-colors",
        notification.isRead ? "bg-card" : "bg-primary/5"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-medium">{notification.title}</p>
              <p className="mt-0.5 text-xs capitalize text-muted-foreground">
                {notification.type}
              </p>
            </div>
            <span className="shrink-0 text-[10px] text-muted-foreground">
              {formatRelativeTime(notification.createdAt)}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {notification.message}
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            {notification.actionUrl && (
              <Button
                size="sm"
                variant="outline"
                className="h-7 rounded-full px-2 text-xs"
                onClick={() => onOpen(notification)}
              >
                Open
              </Button>
            )}
            {!notification.isRead && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 rounded-full px-2 text-xs"
                onClick={() => onRead(notification.id)}
              >
                <Check className="mr-1 h-3 w-3" />
                Mark read
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="h-7 rounded-full px-2 text-xs text-muted-foreground"
              onClick={() => onDelete(notification.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<SerializedNotification[]>(
    []
  );
  const [unreadCount, setUnreadCount] = useState(0);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/notifications?limit=50", {
        credentials: "include",
      });
      if (!response.ok) return;
      const data = (await response.json()) as {
        notifications: SerializedNotification[];
        unreadCount: number;
      };
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadNotifications();
    const interval = window.setInterval(() => {
      void loadNotifications();
    }, 60000);
    return () => window.clearInterval(interval);
  }, [loadNotifications]);

  useEffect(() => {
    if (open) void loadNotifications();
  }, [open, loadNotifications]);

  const grouped = useMemo(() => {
    const today: SerializedNotification[] = [];
    const earlier: SerializedNotification[] = [];

    for (const notification of notifications) {
      if (isToday(new Date(notification.createdAt))) {
        today.push(notification);
      } else {
        earlier.push(notification);
      }
    }

    return { today, earlier };
  }, [notifications]);

  async function markRead(id: string) {
    await fetch(`/api/notifications/${id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isRead: true }),
    });
    setNotifications((current) =>
      current.map((item) =>
        item.id === id ? { ...item, isRead: true } : item
      )
    );
    setUnreadCount((count) => Math.max(0, count - 1));
  }

  async function deleteNotification(id: string) {
    await fetch(`/api/notifications/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    setNotifications((current) => current.filter((item) => item.id !== id));
    const removed = notifications.find((item) => item.id === id);
    if (removed && !removed.isRead) {
      setUnreadCount((count) => Math.max(0, count - 1));
    }
  }

  function openNotification(notification: SerializedNotification) {
    if (!notification.isRead) void markRead(notification.id);
    if (notification.actionUrl) {
      setOpen(false);
      router.push(notification.actionUrl);
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8 text-muted-foreground"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[380px] p-0">
        <div className="border-b border-border px-4 py-3">
          <p className="text-sm font-semibold">Notifications</p>
          <p className="text-xs text-muted-foreground">
            {unreadCount > 0
              ? `${unreadCount} unread`
              : "You're all caught up"}
          </p>
        </div>
        <div className="max-h-[420px] overflow-y-auto">
          <div className="space-y-4 p-4">
            {loading && notifications.length === 0 && (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            )}
            {!loading && notifications.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No notifications yet
              </p>
            )}
            {grouped.today.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Today
                </p>
                {grouped.today.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onRead={markRead}
                    onDelete={deleteNotification}
                    onOpen={openNotification}
                  />
                ))}
              </div>
            )}
            {grouped.earlier.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Earlier
                </p>
                {grouped.earlier.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onRead={markRead}
                    onDelete={deleteNotification}
                    onOpen={openNotification}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
