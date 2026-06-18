"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Check,
  Code2,
  Loader2,
  Pause,
  Play,
  Shield,
} from "lucide-react";
import {
  completeFocusSession,
  pauseFocusSession,
  resumeFocusSession,
  startFocusSession,
} from "@/actions/focus";
import { FocusExecutionChain } from "@/features/focus/components/focus-execution-chain";
import { useOsPermissions } from "@/features/os/components/os-permissions-provider";
import { formatDurationClock } from "@/lib/focus/session-duration";
import type { FocusPageData } from "@/features/focus/types";
import { FOCUS_MODE_LABELS, FOCUS_MODES } from "@/lib/constants";
import type { FocusMode } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type FocusRoomProps = {
  data: FocusPageData;
};

function useFocusTimer(session: FocusPageData["activeSession"]) {
  const [elapsedSeconds, setElapsedSeconds] = useState(
    session?.elapsedSeconds ?? 0
  );

  useEffect(() => {
    setElapsedSeconds(session?.elapsedSeconds ?? 0);
  }, [session?.elapsedSeconds, session?.id]);

  useEffect(() => {
    if (!session || session.isPaused) return;

    const interval = window.setInterval(() => {
      setElapsedSeconds((current) => current + 1);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [session?.id, session?.isPaused]);

  return elapsedSeconds;
}

export function FocusRoom({ data }: FocusRoomProps) {
  const router = useRouter();
  const { focus } = useOsPermissions();
  const [isPending, startTransition] = useTransition();
  const [startOpen, setStartOpen] = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [plannedMinutes, setPlannedMinutes] = useState(90);
  const [selectedActionId, setSelectedActionId] = useState(
    data.suggestedActionId ?? data.actionOptions[0]?.id ?? ""
  );
  const [mode, setMode] = useState<FocusMode>("deep_work");
  const [distractionBlocking, setDistractionBlocking] = useState(true);
  const [quality, setQuality] = useState(80);
  const [reflection, setReflection] = useState("");
  const [actionOutcome, setActionOutcome] = useState<
    "executed" | "more_sessions" | null
  >(null);

  const session = data.activeSession;
  const elapsedSeconds = useFocusTimer(session);
  const linkedAction = session?.linkedAction;
  const sessionMinutes = Math.max(1, Math.round(elapsedSeconds / 60));
  const projectedCompletedMinutes =
    (linkedAction?.completedMinutes ?? 0) + sessionMinutes;
  const projectedProgress = linkedAction
    ? Math.min(
        100,
        Math.round(
          (projectedCompletedMinutes /
            Math.max(linkedAction.estimatedMinutes, 1)) *
            100
        )
      )
    : 0;
  const progress = session
    ? Math.min(
        100,
        Math.round((elapsedSeconds / (session.plannedMinutes * 60)) * 100)
      )
    : 0;

  const hasActions = focus.unlocked && data.actionOptions.length > 0;

  const selectedAction = useMemo(
    () => data.actionOptions.find((action) => action.id === selectedActionId),
    [data.actionOptions, selectedActionId]
  );

  useEffect(() => {
    if (!startOpen) return;

    setError(null);
    setPlannedMinutes(90);
    setMode("deep_work");
    setDistractionBlocking(true);
    setSelectedActionId(
      data.suggestedActionId ?? data.actionOptions[0]?.id ?? ""
    );
  }, [startOpen, data.suggestedActionId, data.actionOptions]);

  useEffect(() => {
    if (!completeOpen) return;

    setActionOutcome(null);
    setQuality(80);
    setReflection("");
    setError(null);
  }, [completeOpen]);

  async function handleStart() {
    if (!selectedActionId) {
      setError("Select an action to work on");
      return;
    }

    setError(null);
    const result = await startFocusSession({
      plannedMinutes,
      actionId: selectedActionId,
      mode,
      distractionBlocking,
    });

    if (!result.success) {
      setError(result.error ?? "Failed to start session");
      return;
    }

    setStartOpen(false);
    startTransition(() => router.refresh());
  }

  async function handlePauseResume() {
    if (!session) return;
    setError(null);

    const result = session.isPaused
      ? await resumeFocusSession({ id: session.id })
      : await pauseFocusSession({ id: session.id });

    if (!result.success) {
      setError(result.error ?? "Failed to update session");
      return;
    }

    startTransition(() => router.refresh());
  }

  async function handleComplete() {
    if (!session) return;
    if (!actionOutcome) {
      setError("Choose whether you finished the linked action");
      return;
    }

    setError(null);

    const result = await completeFocusSession({
      id: session.id,
      quality,
      reflection: reflection.trim() || undefined,
      actionOutcome: actionOutcome ?? undefined,
    });

    if (!result.success) {
      setError(result.error ?? "Failed to complete session");
      return;
    }

    setCompleteOpen(false);
    setReflection("");
    setActionOutcome(null);
    startTransition(() => router.refresh());
  }

  const footerStats = [
    {
      label: "Weekly Deep Work",
      value: `${data.stats.weeklyDeepWorkHours}h`,
      sub: `${data.stats.weeklyMinutes} minutes logged`,
    },
    {
      label: "Best Focus Window",
      value: data.stats.bestFocusWindow?.label ?? "—",
      sub: data.stats.bestFocusWindow
        ? `${data.stats.bestFocusWindow.sessionCount} sessions`
        : "Complete sessions to unlock",
    },
    {
      label: "Consistency",
      value: `${data.stats.consistencyDays} days`,
      sub: "This week",
    },
    {
      label: "Completion Quality",
      value:
        data.stats.averageQuality > 0
          ? `${data.stats.averageQuality}%`
          : "—",
      sub:
        data.recentSessions.length > 0
          ? "Weekly average"
          : "Start first focus session",
    },
  ];

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Focus Room</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Protect your attention. Execute what matters.
          </p>
        </div>
        {!session && hasActions && (
          <Button
            className="shrink-0 rounded-full"
            onClick={() => setStartOpen(true)}
          >
            <Play className="mr-2 h-4 w-4" />
            Start Session
          </Button>
        )}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Card className="border-border bg-card noirly-glow">
        <CardContent className="p-6 lg:p-8">
          {session ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                    Working On
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold">{session.mission}</h2>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge
                      variant="outline"
                      className="border-primary/40 bg-primary/10 text-[10px] text-primary"
                    >
                      {FOCUS_MODE_LABELS[session.mode as FocusMode] ??
                        "Deep Work"}
                    </Badge>
                    {session.distractionBlocking && (
                      <Badge
                        variant="outline"
                        className="border-chart-3/40 bg-chart-3/10 text-[10px] text-chart-3"
                      >
                        <Shield className="mr-1 h-3 w-3" />
                        Distraction Blocking ON
                      </Badge>
                    )}
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px]",
                    session.isPaused
                      ? "border-chart-4/40 bg-chart-4/10 text-chart-4"
                      : "border-primary/40 bg-primary/10 text-primary"
                  )}
                >
                  {session.isPaused ? "Paused" : "Focus Active"}
                </Badge>
              </div>

              <div className="mt-6 max-w-sm">
                <FocusExecutionChain
                  actionTitle={session.executionChain.actionTitle}
                  goalTitle={session.executionChain.goalTitle}
                  visionTitle={session.executionChain.visionTitle}
                />
              </div>

              <div className="mt-10 text-center">
                <p className="font-mono text-5xl font-bold tracking-wider text-foreground sm:text-6xl lg:text-7xl">
                  {formatDurationClock(elapsedSeconds)}
                </p>
                {!session.isPaused && (
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                    </span>
                    <span className="text-sm text-primary">Focus in progress</span>
                  </div>
                )}
                {session.isPaused && (
                  <p className="mt-4 text-sm text-chart-4">Session paused</p>
                )}
              </div>

              <div className="mx-auto mt-8 max-w-md">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    Target{" "}
                    <span className="text-foreground">{session.plannedMinutes}m</span>
                  </span>
                  <span className="text-muted-foreground">
                    Progress <span className="text-primary">{progress}%</span>
                  </span>
                </div>
                <Progress value={progress} className="mt-2 h-2" />
              </div>

              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button
                  variant="outline"
                  className="rounded-full px-8"
                  onClick={handlePauseResume}
                  disabled={isPending}
                >
                  {isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : session.isPaused ? (
                    <Play className="mr-2 h-4 w-4" />
                  ) : (
                    <Pause className="mr-2 h-4 w-4" />
                  )}
                  {session.isPaused ? "Resume" : "Pause"}
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full px-8"
                  onClick={() => setCompleteOpen(true)}
                  disabled={isPending}
                >
                  <Check className="mr-2 h-4 w-4" />
                  Complete Session
                </Button>
              </div>
            </>
          ) : hasActions ? (
            <div className="flex flex-col items-center px-4 py-10 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
                <Play className="h-7 w-7 text-primary" />
              </div>
              <h2 className="mt-5 text-2xl font-semibold">Ready to Focus</h2>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                Execute an action with protected attention. Every session connects
                Focus → Action → Goal → Vision.
              </p>
              <Button className="mt-6 rounded-full" onClick={() => setStartOpen(true)}>
                <Play className="mr-2 h-4 w-4" />
                Start Session
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center px-4 py-12 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                <Play className="h-7 w-7 text-muted-foreground" />
              </div>
              <h2 className="mt-5 text-lg font-semibold">{focus.title}</h2>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">
                {focus.message}
              </p>
              {focus.ctaHref && focus.ctaLabel && (
                <Link href={focus.ctaHref}>
                  <Button className="mt-6 rounded-full">{focus.ctaLabel}</Button>
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border bg-card">
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold">Recent Sessions</h3>
          <div className="mt-4 space-y-3">
            {data.recentSessions.length > 0 ? (
              data.recentSessions.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                      <Code2 className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{item.mission}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {FOCUS_MODE_LABELS[item.mode as FocusMode] ?? "Deep Work"}{" "}
                        · {item.duration}m · Quality {item.quality}%
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground">
                    {item.completedAt
                      ? new Date(item.completedAt).toLocaleDateString()
                      : "Recent"}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">
                No completed sessions yet. Start your first focus block.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {footerStats.map((stat) => (
          <Card key={stat.label} className="border-border bg-card">
            <CardContent className="p-4">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {stat.label}
              </p>
              <p className="mt-1 text-lg font-bold">{stat.value}</p>
              {stat.sub && (
                <p className="mt-1 text-[10px] text-muted-foreground">{stat.sub}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={startOpen} onOpenChange={setStartOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Start Focus Session</DialogTitle>
            <DialogDescription>
              Execute an action with protected attention.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Working On *</Label>
              {hasActions ? (
                <Select value={selectedActionId} onValueChange={setSelectedActionId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select action" />
                  </SelectTrigger>
                  <SelectContent>
                    {data.actionOptions.map((action) => (
                      <SelectItem key={action.id} value={action.id}>
                        {action.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="rounded-lg border border-dashed border-border bg-surface px-4 py-3 text-sm text-muted-foreground">
                  No active actions yet.{" "}
                  <Link
                    href="/dashboard/execution"
                    className="text-primary hover:underline"
                    onClick={() => setStartOpen(false)}
                  >
                    Create an action first
                  </Link>
                </div>
              )}
            </div>

            {selectedAction && (
              <FocusExecutionChain
                actionTitle={selectedAction.title}
                goalTitle={selectedAction.goalTitle}
                visionTitle={selectedAction.visionTitle}
              />
            )}

            <div className="space-y-2">
              <Label>Mode</Label>
              <div className="grid grid-cols-2 gap-2">
                {FOCUS_MODES.map((focusMode) => {
                  const selected = mode === focusMode;
                  return (
                    <button
                      key={focusMode}
                      type="button"
                      onClick={() => setMode(focusMode)}
                      className={cn(
                        "flex items-center gap-2 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors",
                        selected
                          ? "border-primary/40 bg-primary/10 text-foreground"
                          : "border-border bg-surface text-muted-foreground hover:border-primary/20 hover:text-foreground"
                      )}
                    >
                      <span
                        className={cn(
                          "h-2 w-2 shrink-0 rounded-full border",
                          selected
                            ? "border-primary bg-primary"
                            : "border-muted-foreground/50"
                        )}
                      />
                      {FOCUS_MODE_LABELS[focusMode]}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="plannedMinutes">Duration</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="plannedMinutes"
                  type="number"
                  min={15}
                  max={480}
                  value={plannedMinutes}
                  onChange={(event) =>
                    setPlannedMinutes(Number(event.target.value))
                  }
                  className="flex-1"
                />
                <span className="shrink-0 text-sm text-muted-foreground">
                  minutes
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3">
              <div>
                <p className="text-sm font-medium">Distraction Blocking</p>
                <p className="text-xs text-muted-foreground">
                  Protect attention during this session
                </p>
              </div>
              <Button
                type="button"
                variant={distractionBlocking ? "default" : "outline"}
                size="sm"
                className="min-w-[56px] rounded-full"
                onClick={() => setDistractionBlocking((current) => !current)}
              >
                {distractionBlocking ? "ON" : "OFF"}
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setStartOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleStart} disabled={isPending || !hasActions}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Start Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={completeOpen} onOpenChange={setCompleteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Session</DialogTitle>
            <DialogDescription>
              Log your focus quality and decide whether this session finished
              the linked action.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="quality">Focus Quality ({quality}%)</Label>
              <Input
                id="quality"
                type="range"
                min={0}
                max={100}
                value={quality}
                onChange={(event) => setQuality(Number(event.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reflection">Reflection</Label>
              <Textarea
                id="reflection"
                placeholder="What did you accomplish? What blocked you?"
                value={reflection}
                onChange={(event) => setReflection(event.target.value)}
              />
            </div>

            {linkedAction && (
              <div className="space-y-3 rounded-lg border border-border bg-surface/50 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Action Progress
                </p>
                <p className="text-sm font-medium">{linkedAction.title}</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {actionOutcome === "more_sessions"
                        ? `${projectedCompletedMinutes} / ${linkedAction.estimatedMinutes} minutes after session`
                        : `${linkedAction.completedMinutes} / ${linkedAction.estimatedMinutes} minutes logged`}
                    </span>
                    <span>
                      {actionOutcome === "more_sessions"
                        ? `${projectedProgress}%`
                        : `${linkedAction.progress}%`}
                    </span>
                  </div>
                  <Progress
                    value={
                      actionOutcome === "more_sessions"
                        ? projectedProgress
                        : linkedAction.progress
                    }
                    className="h-1.5"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Did you complete this action?
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <Button
                    type="button"
                    variant={
                      actionOutcome === "executed" ? "default" : "outline"
                    }
                    className={cn(
                      "h-auto justify-start px-3 py-3 text-left",
                      actionOutcome === "executed" &&
                        "border-primary bg-primary/10 text-primary hover:bg-primary/15"
                    )}
                    onClick={() => setActionOutcome("executed")}
                  >
                    <Check className="mr-2 h-4 w-4 shrink-0" />
                    <span className="text-sm">Mark as Executed</span>
                  </Button>
                  <Button
                    type="button"
                    variant={
                      actionOutcome === "more_sessions" ? "default" : "outline"
                    }
                    className={cn(
                      "h-auto justify-start px-3 py-3 text-left",
                      actionOutcome === "more_sessions" &&
                        "border-chart-4/40 bg-chart-4/10 text-chart-4 hover:bg-chart-4/15"
                    )}
                    onClick={() => setActionOutcome("more_sessions")}
                  >
                    <Pause className="mr-2 h-4 w-4 shrink-0" />
                    <span className="text-sm">I need more sessions</span>
                  </Button>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCompleteOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleComplete}
              disabled={isPending || (Boolean(linkedAction) && !actionOutcome)}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Complete Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
