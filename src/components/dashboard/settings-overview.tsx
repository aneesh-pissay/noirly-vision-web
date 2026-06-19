"use client";

import type { NotificationPreferencesData } from "@/lib/notifications/types";
import type { SettingsPageData, UserSettings } from "@/features/settings/types";
import type { BackupPreview, ImportSummary } from "@/lib/backup/types";
import { formatImportSummaryLines } from "@/lib/backup/utils";
import { useMemo, useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/providers/auth-provider";
import {
  changePassword,
  deleteAccount,
  deleteWorkspaceData,
  exportWorkspaceBackup,
  importWorkspaceBackup,
  previewWorkspaceBackup,
  logoutAllDevices,
  resetWorkspace,
  updateFocusSettings,
  updateNotificationSettings,
  updatePreferencesSettings,
  updateWorkspaceSettings,
} from "@/features/settings/actions/settings.actions";
import { SettingsAppearanceBridge } from "@/features/settings/components/settings-appearance-bridge";
import {
  DangerZone,
  FormField,
  SettingRow,
  SettingSection,
  SettingSwitch,
} from "@/components/settings";
import {
  ACCENT_COLORS,
  DATE_FORMAT_LABELS,
  FOCUS_DURATIONS,
  SETTINGS_TABS,
  STARTUP_PAGES,
  STARTUP_PAGE_LABELS,
  WEEK_START_LABELS,
  type SettingsTab,
} from "@/lib/settings/constants";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SettingsAccountTab } from "@/components/dashboard/settings-account-tab";
import { cn } from "@/lib/utils";
import { registerFcmToken } from "@/lib/firebase/firebase-client";

function downloadTextFile(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function SaveButton({
  saving,
  onClick,
}: {
  saving: boolean;
  onClick: () => void;
}) {
  return (
    <Button className="h-11 rounded-lg px-5" onClick={onClick} disabled={saving}>
      {saving ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Saving...
        </>
      ) : (
        "Save Changes"
      )}
    </Button>
  );
}

export function SettingsOverview({ data }: { data: SettingsPageData }) {
  const router = useRouter();
  const { logout } = useAuth();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<SettingsTab>("Account");
  const [settings, setSettings] = useState<UserSettings>(data.settings);
  const [notificationPreferences, setNotificationPreferences] =
    useState<NotificationPreferencesData>(data.notificationPreferences);
  const [resetOpen, setResetOpen] = useState(false);
  const [deleteDataOpen, setDeleteDataOpen] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [deletePassword, setDeletePassword] = useState("");
  const [importPreview, setImportPreview] = useState<BackupPreview | null>(
    null
  );
  const [pendingImportJson, setPendingImportJson] = useState<string | null>(
    null
  );
  const [importSummary, setImportSummary] = useState<ImportSummary | null>(
    null
  );
  const [importMode, setImportMode] = useState<"replace" | "merge">("replace");

  const previewSummaryLines = useMemo(() => {
    if (!importPreview) return [];
    return formatImportSummaryLines({
      visions: importPreview.metadata.totalVisions,
      goals: importPreview.metadata.totalGoals,
      milestones: importPreview.metadata.totalMilestones,
      actions: importPreview.metadata.totalActions,
      focusSessions: importPreview.focusSessionCount,
      vaultEntries: importPreview.metadata.totalVaultEntries,
      totalFocusHours: importPreview.metadata.totalFocusHours,
    });
  }, [importPreview]);

  const timezoneOptions = useMemo(() => {
    try {
      return Intl.supportedValuesOf("timeZone");
    } catch {
      return ["UTC", "America/New_York", "Europe/London", "Asia/Dubai"];
    }
  }, []);

  const totalRecords = useMemo(
    () =>
      Object.values(data.workspaceStats).reduce((sum, value) => sum + value, 0),
    [data.workspaceStats]
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab && SETTINGS_TABS.includes(tab as SettingsTab)) {
      setActiveTab(tab as SettingsTab);
    }
  }, []);

  function runSave(action: () => Promise<{ success: boolean; error?: string }>) {
    startTransition(async () => {
      const result = await action();
      if (!result.success) {
        toast.error(result.error ?? "Save failed");
        return;
      }
      toast.success("Settings saved");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6 pb-8">
      <SettingsAppearanceBridge settings={settings} />

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Configure your workspace and Personal OS behavior.
        </p>
        <div className="mt-4 flex flex-wrap gap-4 border-b border-border">
          {SETTINGS_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={cn(
                "pb-2 text-sm font-medium transition-colors",
                activeTab === tab
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "Account" && <SettingsAccountTab data={data} />}

      {activeTab === "Workspace" && (
        <div className="space-y-4">
          <SettingSection
            title="Workspace"
            description="Name your workspace and choose where Noirly opens."
            divided={false}
            contentClassName="space-y-5"
            actions={
              <SaveButton
                saving={isPending}
                onClick={() =>
                  runSave(() =>
                    updateWorkspaceSettings({
                      workspaceName: settings.workspaceName,
                      startupPage: settings.startupPage,
                      dateFormat: settings.dateFormat,
                      timezone: settings.timezone,
                      weekStartDay: settings.weekStartDay,
                    })
                  )
                }
              />
            }
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Workspace name" htmlFor="workspaceName" className="sm:col-span-2">
                <Input
                  id="workspaceName"
                  value={settings.workspaceName}
                  onChange={(e) =>
                    setSettings((current) => ({
                      ...current,
                      workspaceName: e.target.value,
                    }))
                  }
                />
              </FormField>
              <FormField label="Default startup page" className="sm:col-span-2">
                <Select
                  value={settings.startupPage}
                  onValueChange={(value) =>
                    setSettings((current) => ({
                      ...current,
                      startupPage: value as UserSettings["startupPage"],
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STARTUP_PAGES.map((page) => (
                      <SelectItem key={page} value={page}>
                        {STARTUP_PAGE_LABELS[page]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </div>
          </SettingSection>
        </div>
      )}

      {activeTab === "Preferences" && (
        <div className="space-y-4">
          <SettingSection
            title="Appearance"
            description="Tune how Noirly looks and feels across your workspace."
          >
          <SettingRow
            title="Theme"
            description="Choose dark, light, or match your system."
            control={
              <Select
                value={settings.theme}
                onValueChange={(value) =>
                  setSettings((current) => ({
                    ...current,
                    theme: value as UserSettings["theme"],
                  }))
                }
              >
                <SelectTrigger className="w-full min-w-[10rem] sm:w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            }
          />

          <SettingRow
            title="Accent color"
            description="Highlights buttons, links, and focus states."
            control={
              <div className="flex flex-wrap gap-2">
                {ACCENT_COLORS.map((color) => (
                  <button
                    key={color.id}
                    type="button"
                    aria-label={color.label}
                    className={cn(
                      "h-9 w-9 rounded-full border-2 transition-transform hover:scale-105",
                      settings.accentColor === color.value
                        ? "border-foreground ring-2 ring-primary/30"
                        : "border-border"
                    )}
                    style={{ backgroundColor: color.value }}
                    onClick={() =>
                      setSettings((current) => ({
                        ...current,
                        accentColor: color.value,
                      }))
                    }
                  />
                ))}
              </div>
            }
          />

          <SettingRow
            title="Density"
            description="Control spacing in lists and panels."
            control={
              <Select
                value={settings.density}
                onValueChange={(value) =>
                  setSettings((current) => ({
                    ...current,
                    density: value as UserSettings["density"],
                  }))
                }
              >
                <SelectTrigger className="w-full min-w-[10rem] sm:w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comfortable">Comfortable</SelectItem>
                  <SelectItem value="compact">Compact</SelectItem>
                </SelectContent>
              </Select>
            }
          />

          <SettingRow
            title="Sidebar"
            description="Expanded shows labels. Compact saves space."
            control={
              <Select
                value={settings.sidebarMode}
                onValueChange={(value) =>
                  setSettings((current) => ({
                    ...current,
                    sidebarMode: value as UserSettings["sidebarMode"],
                  }))
                }
              >
                <SelectTrigger className="w-full min-w-[10rem] sm:w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="expanded">Expanded</SelectItem>
                  <SelectItem value="compact">Compact</SelectItem>
                </SelectContent>
              </Select>
            }
          />

          <SettingSwitch
            title="Animations"
            description="Smooth transitions across the interface."
            checked={settings.animationsEnabled}
            onCheckedChange={(checked) =>
              setSettings((current) => ({
                ...current,
                animationsEnabled: checked,
              }))
            }
          />
          </SettingSection>

          <SettingSection
            title="Date & time"
            description="How dates and times display across your workspace."
            divided={false}
            contentClassName="py-5"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Date format">
                <Select
                  value={settings.dateFormat}
                  onValueChange={(value) =>
                    setSettings((current) => ({
                      ...current,
                      dateFormat: value as UserSettings["dateFormat"],
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(DATE_FORMAT_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Timezone">
                <Select
                  value={settings.timezone}
                  onValueChange={(value) =>
                    setSettings((current) => ({ ...current, timezone: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    {timezoneOptions.map((zone) => (
                      <SelectItem key={zone} value={zone}>
                        {zone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
              <FormField label="Week start day" className="sm:col-span-2">
                <Select
                  value={String(settings.weekStartDay)}
                  onValueChange={(value) =>
                    setSettings((current) => ({
                      ...current,
                      weekStartDay: Number(value),
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(WEEK_START_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </div>
          </SettingSection>

          <div className="flex justify-end">
            <SaveButton
              saving={isPending}
              onClick={() =>
                runSave(async () => {
                  const preferences = await updatePreferencesSettings({
                    theme: settings.theme,
                    accentColor: settings.accentColor,
                    density: settings.density,
                    sidebarMode: settings.sidebarMode,
                    animationsEnabled: settings.animationsEnabled,
                  });
                  if (!preferences.success) return preferences;

                  return updateWorkspaceSettings({
                    workspaceName: settings.workspaceName,
                    startupPage: settings.startupPage,
                    dateFormat: settings.dateFormat,
                    timezone: settings.timezone,
                    weekStartDay: settings.weekStartDay,
                  });
                })
              }
            />
          </div>
        </div>
      )}

      {activeTab === "Focus" && (
        <SettingSection
          title="Deep Work Behavior"
          description="Configure focus sessions and daily targets."
          actions={
            <SaveButton
              saving={isPending}
              onClick={() =>
                runSave(() =>
                  updateFocusSettings({
                    focusDuration: settings.focusDuration,
                    breakReminder: settings.breakReminder,
                    autoStartNextSession: settings.autoStartNextSession,
                    dailyFocusTargetHours: settings.dailyFocusTargetHours,
                    bestFocusWindow: settings.bestFocusWindow,
                  })
                )
              }
            />
          }
        >
          <SettingRow
            title="Default focus duration"
            description="Length of a standard deep work session."
            control={
              <Select
                value={String(settings.focusDuration)}
                onValueChange={(value) =>
                  setSettings((current) => ({
                    ...current,
                    focusDuration: Number(value) as UserSettings["focusDuration"],
                  }))
                }
              >
                <SelectTrigger className="w-full min-w-[10rem] sm:w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FOCUS_DURATIONS.map((duration) => (
                    <SelectItem key={duration} value={String(duration)}>
                      {duration} min
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            }
          />

          <SettingSwitch
            title="Break reminder"
            description="Get nudged to step away after a session ends."
            checked={settings.breakReminder}
            onCheckedChange={(checked) =>
              setSettings((current) => ({ ...current, breakReminder: checked }))
            }
          />

          <SettingSwitch
            title="Auto start next session"
            description="Begin the next focus block without extra clicks."
            checked={settings.autoStartNextSession}
            onCheckedChange={(checked) =>
              setSettings((current) => ({
                ...current,
                autoStartNextSession: checked,
              }))
            }
          />

          <SettingRow
            title="Daily focus target"
            description="Hours of deep work to aim for each day."
            control={
              <Select
                value={String(settings.dailyFocusTargetHours)}
                onValueChange={(value) =>
                  setSettings((current) => ({
                    ...current,
                    dailyFocusTargetHours: Number(value),
                  }))
                }
              >
                <SelectTrigger className="w-full min-w-[10rem] sm:w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, index) => index + 1).map(
                    (hours) => (
                      <SelectItem key={hours} value={String(hours)}>
                        {hours}h
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            }
          />

          <SettingRow
            title="Best focus window"
            description="When you usually do your best deep work."
            control={
              <Input
                type="time"
                className="w-full min-w-[10rem] sm:w-44"
                value={settings.bestFocusWindow}
                onChange={(e) =>
                  setSettings((current) => ({
                    ...current,
                    bestFocusWindow: e.target.value,
                  }))
                }
              />
            }
          />
        </SettingSection>
      )}

      {activeTab === "Notifications" && (
        <div className="space-y-4">
          <SettingSection
            title="Notifications"
            description="Manage how Noirly contacts you."
          >
            <SettingSwitch
              title="In-app notifications"
              description="Store alerts inside Noirly."
              checked={notificationPreferences.channels.inApp}
              onCheckedChange={(checked) =>
                setNotificationPreferences((current) => ({
                  ...current,
                  channels: { ...current.channels, inApp: checked },
                }))
              }
            />
            <SettingSwitch
              title="Push notifications"
              description="Send device notifications."
              checked={notificationPreferences.channels.push}
              onCheckedChange={(checked) =>
                setNotificationPreferences((current) => ({
                  ...current,
                  channels: { ...current.channels, push: checked },
                  push: { ...current.push, enabled: checked },
                }))
              }
            />
            <SettingSwitch
              title="Email reports"
              description="Receive summaries and alerts by email."
              checked={notificationPreferences.channels.email}
              onCheckedChange={(checked) =>
                setNotificationPreferences((current) => ({
                  ...current,
                  channels: { ...current.channels, email: checked },
                  email: { ...current.email, enabled: checked },
                }))
              }
            />
          </SettingSection>

          <SettingSection
            title="Push"
            description="Instant alerts for focus and planning."
          >
            <SettingSwitch
              title="Focus reminders"
              description="Receive alerts before deep work sessions."
              checked={notificationPreferences.push.focusReminder}
              disabled={
                !notificationPreferences.channels.push ||
                !notificationPreferences.push.enabled
              }
              onCheckedChange={(checked) =>
                setNotificationPreferences((current) => ({
                  ...current,
                  push: { ...current.push, focusReminder: checked },
                }))
              }
            />
            <SettingSwitch
              title="Planning reminders"
              description="Morning prompts to plan your day."
              checked={notificationPreferences.push.dailyPlanning}
              disabled={
                !notificationPreferences.channels.push ||
                !notificationPreferences.push.enabled
              }
              onCheckedChange={(checked) =>
                setNotificationPreferences((current) => ({
                  ...current,
                  push: { ...current.push, dailyPlanning: checked },
                }))
              }
            />
            <SettingSwitch
              title="Achievements"
              description="Celebrate milestones and streaks on this device."
              checked={notificationPreferences.push.achievements}
              disabled={
                !notificationPreferences.channels.push ||
                !notificationPreferences.push.enabled
              }
              onCheckedChange={(checked) =>
                setNotificationPreferences((current) => ({
                  ...current,
                  push: { ...current.push, achievements: checked },
                }))
              }
            />
            <SettingRow
              title="Enable on this device"
              description="Register this browser for push delivery."
              control={
                <Button
                  type="button"
                  variant="outline"
                  className="h-11 rounded-lg"
                  disabled={
                    !notificationPreferences.channels.push ||
                    !notificationPreferences.push.enabled
                  }
                  onClick={() =>
                    startTransition(async () => {
                      try {
                        const token = await registerFcmToken();
                        if (token) {
                          toast.success("Push enabled on this device");
                          return;
                        }
                        toast.error(
                          "Could not enable push. Check Firebase config and browser permission."
                        );
                      } catch {
                        toast.error(
                          "Push permission denied or Firebase not configured"
                        );
                      }
                    })
                  }
                >
                  Enable push
                </Button>
              }
            />
          </SettingSection>

          <SettingSection
            title="Email"
            description="Digests and security delivered to your inbox."
          >
            <SettingSwitch
              title="Daily summary"
              description="Morning briefing with priorities and pending actions."
              checked={notificationPreferences.email.dailySummary}
              disabled={
                !notificationPreferences.channels.email ||
                !notificationPreferences.email.enabled
              }
              onCheckedChange={(checked) =>
                setNotificationPreferences((current) => ({
                  ...current,
                  email: { ...current.email, dailySummary: checked },
                }))
              }
            />
            <SettingSwitch
              title="Weekly review"
              description="Sunday recap of progress and focus hours."
              checked={notificationPreferences.email.weeklyReview}
              disabled={
                !notificationPreferences.channels.email ||
                !notificationPreferences.email.enabled
              }
              onCheckedChange={(checked) =>
                setNotificationPreferences((current) => ({
                  ...current,
                  email: { ...current.email, weeklyReview: checked },
                }))
              }
            />
            <SettingSwitch
              title="Achievements"
              description="Email when you hit major milestones."
              checked={notificationPreferences.email.achievements}
              disabled={
                !notificationPreferences.channels.email ||
                !notificationPreferences.email.enabled
              }
              onCheckedChange={(checked) =>
                setNotificationPreferences((current) => ({
                  ...current,
                  email: { ...current.email, achievements: checked },
                }))
              }
            />
            <SettingSwitch
              title="Security alerts"
              description="Immediate emails for password changes and exports."
              checked={notificationPreferences.email.security}
              onCheckedChange={(checked) =>
                setNotificationPreferences((current) => ({
                  ...current,
                  email: { ...current.email, security: checked },
                }))
              }
            />
          </SettingSection>

          <SettingSection
            title="Schedule"
            description="When Noirly sends planning and review reminders."
            divided={false}
            contentClassName="py-2"
          >
            <div className="grid gap-4 py-4 sm:grid-cols-2">
              <FormField label="Morning check-in" htmlFor="morningCheckIn">
                <Input
                  id="morningCheckIn"
                  type="time"
                  value={settings.morningCheckInTime}
                  onChange={(e) =>
                    setSettings((current) => ({
                      ...current,
                      morningCheckInTime: e.target.value,
                    }))
                  }
                />
              </FormField>
              <FormField label="Evening review" htmlFor="eveningReview">
                <Input
                  id="eveningReview"
                  type="time"
                  value={settings.eveningReviewTime}
                  onChange={(e) =>
                    setSettings((current) => ({
                      ...current,
                      eveningReviewTime: e.target.value,
                    }))
                  }
                />
              </FormField>
            </div>
          </SettingSection>

          <div className="flex justify-end">
            <SaveButton
              saving={isPending}
              onClick={() =>
                runSave(() =>
                  updateNotificationSettings({
                    ...notificationPreferences,
                    morningCheckInTime: settings.morningCheckInTime,
                    eveningReviewTime: settings.eveningReviewTime,
                  })
                )
              }
            />
          </div>
        </div>
      )}

      {activeTab === "Security" && (
        <div className="space-y-4">
          <SettingSection
            title="Account security"
            description="Update your password and review account access."
            divided={false}
            contentClassName="space-y-5"
            actions={
              <Button
                className="h-11 rounded-lg px-5"
                disabled={isPending}
                onClick={() =>
                  runSave(async () => {
                    const result = await changePassword(passwordForm);
                    if (result.success) {
                      setPasswordForm({
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: "",
                      });
                      toast.message("Password updated. Sign in again.");
                      await logout();
                    }
                    return result;
                  })
                }
              >
                Change password
              </Button>
            }
          >
            <SettingRow
              title="Account email"
              description="Your sign-in email address."
              control={
                <Input
                  value={data.profile.email}
                  readOnly
                  disabled
                  className="w-full min-w-[12rem] sm:w-72"
                />
              }
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Current password">
                <Input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm((current) => ({
                      ...current,
                      currentPassword: e.target.value,
                    }))
                  }
                />
              </FormField>
              <FormField label="New password">
                <Input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm((current) => ({
                      ...current,
                      newPassword: e.target.value,
                    }))
                  }
                />
              </FormField>
              <FormField label="Confirm new password" className="sm:col-span-2">
                <Input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm((current) => ({
                      ...current,
                      confirmPassword: e.target.value,
                    }))
                  }
                />
              </FormField>
            </div>
          </SettingSection>

          <SettingSection
            title="Active sessions"
            description="Devices currently signed in to your account."
            divided={false}
            contentClassName="space-y-4 py-5"
          >
            <div className="rounded-lg border border-border bg-background px-4 py-3">
              <p className="text-sm font-medium">{data.session.currentDevice}</p>
              <p className="text-sm text-muted-foreground">
                Active session on this browser
              </p>
            </div>
            <Button
              variant="outline"
              className="h-11 rounded-lg"
              disabled={isPending}
              onClick={() =>
                runSave(async () => {
                  const result = await logoutAllDevices();
                  if (result.success) {
                    toast.message(
                      "Other sessions signed out. Sign in again on this device."
                    );
                    await logout();
                  }
                  return result;
                })
              }
            >
              Logout all devices
            </Button>
          </SettingSection>

          <SettingSection
            title="Two-factor authentication"
            description="Add an extra layer of protection to your account."
            divided={false}
            contentClassName="py-5"
          >
            <p className="text-sm text-muted-foreground">Coming soon</p>
          </SettingSection>
        </div>
      )}

      {activeTab === "Data" && (
        <div className="space-y-4">
          <SettingSection
            title="Export"
            description="Download a JSON backup of your workspace data."
            divided={false}
            contentClassName="py-5"
          >
            <Button
              variant="outline"
              className="h-11 rounded-lg"
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  const result = await exportWorkspaceBackup();
                  if (!result.success || !result.data) {
                    toast.error(result.error ?? "Export failed");
                    return;
                  }
                  downloadTextFile(
                    result.data.json,
                    result.data.filename,
                    "application/json"
                  );
                  toast.success("Backup downloaded");
                })
              }
            >
              Download JSON backup
            </Button>
          </SettingSection>

          <SettingSection
            title="Import"
            description="Restore workspace data from a backup file."
            divided={false}
            contentClassName="space-y-3 py-5"
          >
            <FormField
              label="Backup file"
              htmlFor="backup-file"
              description="Choose replace or merge when restoring. Passwords, auth tokens, and login sessions are never imported."
            >
              <Input
                id="backup-file"
                type="file"
                accept="application/json,.json"
                disabled={isPending}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;

                  const reader = new FileReader();
                  reader.onload = () => {
                    const text = reader.result?.toString() ?? "";
                    startTransition(async () => {
                      const result = await previewWorkspaceBackup({ backup: text });
                      if (!result.success || !result.data) {
                        toast.error(result.error ?? "Invalid backup file");
                        return;
                      }
                      setPendingImportJson(text);
                      setImportPreview(result.data);
                    });
                  };
                  reader.readAsText(file);
                  event.target.value = "";
                }}
              />
            </FormField>
          </SettingSection>

          <SettingSection
            title="Danger zone"
            description="Permanent actions that cannot be undone."
            divided={false}
            contentClassName="space-y-4 py-5"
          >
            <DangerZone
              title="Reset workspace data"
              description="Clears vision, goals, milestones, actions, focus sessions, knowledge entries, and analytics. Your account and settings are kept."
            >
              <Button
                variant="destructive"
                className="h-11 rounded-lg"
                onClick={() => setResetOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Reset workspace data
              </Button>
            </DangerZone>

            <DangerZone
              title="Delete all workspace data"
              description={`Removes ${totalRecords} records across your Personal OS. Your account remains.`}
            >
              <Button
                variant="destructive"
                className="h-11 rounded-lg"
                onClick={() => setDeleteDataOpen(true)}
              >
                Delete all workspace data
              </Button>
            </DangerZone>

            <DangerZone
              title="Delete account"
              description="Permanently deletes your account and all associated data."
            >
              <Button
                variant="destructive"
                className="h-11 rounded-lg"
                onClick={() => setDeleteAccountOpen(true)}
              >
                Delete account
              </Button>
            </DangerZone>
          </SettingSection>
        </div>
      )}

      <Dialog
        open={Boolean(importPreview)}
        onOpenChange={(open) => {
          if (!open) {
            setImportPreview(null);
            setPendingImportJson(null);
            setImportMode("replace");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import backup preview</DialogTitle>
            <DialogDescription>
              Review the backup before restoring. Your login account stays active.
            </DialogDescription>
          </DialogHeader>
          {importPreview && (
            <div className="space-y-4 text-sm">
              <p className="text-muted-foreground">
                From {importPreview.user.displayName} ·{" "}
                {new Date(importPreview.exportedAt).toLocaleString()}
              </p>
              <div className="grid gap-2 rounded-lg border border-border bg-surface p-3 text-muted-foreground sm:grid-cols-2">
                <p>
                  Schema: {importPreview.backupSchemaVersion} (v
                  {importPreview.version})
                </p>
                <p>
                  Source: {importPreview.source.app} ·{" "}
                  {importPreview.source.platform}
                </p>
                <p className="sm:col-span-2">
                  Checksum:{" "}
                  {importPreview.checksumStatus === "valid" && (
                    <span className="text-foreground">Verified</span>
                  )}
                  {importPreview.checksumStatus === "legacy" && (
                    <span className="text-foreground">
                      Legacy backup (not verified)
                    </span>
                  )}
                  {importPreview.checksumStatus === "invalid" && (
                    <span className="text-destructive">
                      Failed — file may be corrupted
                    </span>
                  )}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">Import mode</p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant={importMode === "replace" ? "default" : "outline"}
                    onClick={() => setImportMode("replace")}
                  >
                    Replace workspace
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={importMode === "merge" ? "default" : "outline"}
                    onClick={() => setImportMode("merge")}
                  >
                    Merge with current
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {importMode === "replace"
                    ? "Clears your current workspace and restores backup data and settings."
                    : "Keeps existing data and adds backup items. Settings stay unchanged."}
                </p>
              </div>
              <div className="rounded-lg border border-border bg-surface p-3">
                <p className="font-medium">Will import</p>
                <ul className="mt-2 space-y-1 text-muted-foreground">
                  {previewSummaryLines.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                  {previewSummaryLines.length === 0 && <li>Empty workspace</li>}
                </ul>
              </div>
              <p className="text-xs text-muted-foreground">
                Never restored: passwords, auth tokens, login sessions.
              </p>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              className="h-11 rounded-lg"
              onClick={() => {
                setImportPreview(null);
                setPendingImportJson(null);
                setImportMode("replace");
              }}
            >
              Cancel
            </Button>
            <Button
              className="h-11 rounded-lg"
              disabled={
                isPending ||
                !pendingImportJson ||
                importPreview?.checksumStatus === "invalid"
              }
              onClick={() =>
                startTransition(async () => {
                  if (!pendingImportJson) return;
                  const result = await importWorkspaceBackup({
                    backup: pendingImportJson,
                    mode: importMode,
                  });
                  if (!result.success || !result.data) {
                    toast.error(result.error ?? "Import failed");
                    return;
                  }
                  setImportPreview(null);
                  setPendingImportJson(null);
                  setImportMode("replace");
                  setImportSummary(result.data);
                  router.refresh();
                })
              }
            >
              {importMode === "replace" ? "Restore Backup" : "Merge Backup"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(importSummary)}
        onOpenChange={(open) => {
          if (!open) setImportSummary(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {importSummary?.mode === "merge"
                ? "Merge complete"
                : "Restore complete"}
            </DialogTitle>
            <DialogDescription>
              {importSummary?.mode === "merge"
                ? "Backup data was merged into your workspace."
                : "Your workspace was restored from backup."}
            </DialogDescription>
          </DialogHeader>
          {importSummary && (
            <div className="rounded-lg border border-border bg-surface p-3 text-sm">
              <p className="font-medium">Imported:</p>
              <ul className="mt-2 space-y-1 text-muted-foreground">
                {formatImportSummaryLines(importSummary).map((line) => (
                  <li key={line}>{line}</li>
                ))}
                {formatImportSummaryLines(importSummary).length === 0 && (
                  <li>Empty workspace</li>
                )}
              </ul>
            </div>
          )}
          <DialogFooter>
            <Button
              className="h-11 rounded-lg"
              onClick={() => setImportSummary(null)}
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset workspace data?</DialogTitle>
            <DialogDescription>
              This permanently deletes all visions, goals, milestones, actions,
              focus sessions, and knowledge entries.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              className="h-11 rounded-lg"
              onClick={() => setResetOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="h-11 rounded-lg"
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  const result = await resetWorkspace();
                  if (!result.success) {
                    toast.error(result.error ?? "Reset failed");
                    return;
                  }
                  setResetOpen(false);
                  toast.success("Workspace reset");
                  router.refresh();
                })
              }
            >
              Reset Workspace
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteDataOpen} onOpenChange={setDeleteDataOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete all workspace data?</DialogTitle>
            <DialogDescription>
              This removes all Personal OS records. Your account and settings stay.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              className="h-11 rounded-lg"
              onClick={() => setDeleteDataOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="h-11 rounded-lg"
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  const result = await deleteWorkspaceData();
                  if (!result.success) {
                    toast.error(result.error ?? "Delete failed");
                    return;
                  }
                  setDeleteDataOpen(false);
                  toast.success("Workspace data deleted");
                  router.refresh();
                })
              }
            >
              Delete Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteAccountOpen} onOpenChange={setDeleteAccountOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete your account?</DialogTitle>
            <DialogDescription>
              Enter your password to permanently delete your account.
            </DialogDescription>
          </DialogHeader>
          <FormField label="Password" htmlFor="delete-account-password">
            <Input
              id="delete-account-password"
              type="password"
              placeholder="Enter your password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
            />
          </FormField>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              className="h-11 rounded-lg"
              onClick={() => setDeleteAccountOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="h-11 rounded-lg"
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  const result = await deleteAccount({
                    password: deletePassword,
                  });
                  if (!result.success) {
                    toast.error(result.error ?? "Delete failed");
                    return;
                  }
                  toast.success("Account deleted");
                  await logout();
                })
              }
            >
              Delete Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
