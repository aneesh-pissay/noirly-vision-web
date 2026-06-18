"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { GoalsPageData, GoalItem, PriorityMatrixActionItem } from "@/features/goals/types";
import { useGoalsDialog } from "@/features/goals/components/goals-dialog-provider";
import { GoalsLockedState } from "@/features/goals/components/goals-locked-state";
import { AddMilestoneDialog } from "@/features/goals/components/AddMilestoneDialog";
import { EditGoalDialog } from "@/features/goals/components/EditGoalDialog";
import { GoalMilestoneRoadmapList } from "@/features/goals/components/goal-roadmap-section";
import { ActionFormDialog } from "@/features/execution/components/action-form-dialog";
import { deleteGoal, updateGoal } from "@/actions/goals";
import {
  Archive,
  Briefcase,
  Flag,
  GraduationCap,
  Heart,
  Map,
  MoreHorizontal,
  Pencil,
  Plus,
  Target,
  Trash2,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { formatAreaLabel } from "@/features/vision/lib/vision-page-utils";
import {
  formatProgressDisplay,
  goalProgressDisplay,
  progressBarValue,
  showProgressBar,
} from "@/lib/progress/display";

const milestoneExamples = [
  "Learn Kubernetes basics",
  "Deploy AWS project",
  "Complete system design practice",
];

const lifeAreaIcons: Record<string, typeof Briefcase> = {
  career: Briefcase,
  health: Heart,
  learning: GraduationCap,
  finance: Wallet,
  personal: Target,
};

function formatLifeArea(area: string) {
  return formatAreaLabel(area);
}

function actionToMatrixItem(action: PriorityMatrixActionItem) {
  return {
    id: action.id,
    title: action.title,
    goalTitle: action.goalTitle,
    tag: formatLifeArea(action.category),
    status: action.status,
  };
}

const tagColors: Record<string, string> = {
  Learning: "border-primary/30 bg-primary/10 text-primary",
  Finance: "border-chart-4/30 bg-chart-4/10 text-chart-4",
  Career: "border-chart-2/30 bg-chart-2/10 text-chart-2",
  Health: "border-chart-3/30 bg-chart-3/10 text-chart-3",
  Personal: "border-border bg-surface text-muted-foreground",
  Business: "border-primary/30 bg-primary/10 text-primary",
};

function MatrixCard({
  title,
  goalTitle,
  tag,
  status,
}: {
  title: string;
  goalTitle: string;
  tag: string;
  status: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium leading-snug">{title}</p>
        <Badge
          variant="outline"
          className={cn(
            "shrink-0 text-[9px]",
            tagColors[tag] ?? "border-border bg-surface text-muted-foreground"
          )}
        >
          {tag}
        </Badge>
      </div>
      <p className="mt-2 text-[10px] text-muted-foreground">{goalTitle}</p>
      <p className="mt-1 text-[10px] capitalize text-primary">
        {status.replace("_", " ").toLowerCase()}
      </p>
    </div>
  );
}

function MatrixQuadrant({
  title,
  items,
}: {
  title: string;
  items: ReturnType<typeof actionToMatrixItem>[];
}) {
  return (
    <div className="rounded-xl border border-border bg-card/50 p-3">
      <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {title}
      </p>
      <div className="space-y-2">
        {items.map((item) => (
          <MatrixCard key={item.id} {...item} />
        ))}
      </div>
    </div>
  );
}

export function GoalsOverview({ data }: { data: GoalsPageData }) {
  const router = useRouter();
  const roadmapRef = useRef<HTMLDivElement>(null);
  const { setOpen } = useGoalsDialog();
  const [addMilestoneOpen, setAddMilestoneOpen] = useState(false);
  const [editGoalOpen, setEditGoalOpen] = useState(false);
  const [actionFormOpen, setActionFormOpen] = useState(false);
  const [actionDefaults, setActionDefaults] = useState<{
    goalId?: string;
    milestoneId?: string;
  }>({});

  const primary = data.primaryGoal;

  function scrollToRoadmap() {
    roadmapRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function openAddAction(goalId: string, milestoneId: string) {
    setActionDefaults({ goalId, milestoneId });
    setActionFormOpen(true);
  }

  async function handleArchiveGoal(goal: GoalItem) {
    const result = await updateGoal({ id: goal.id, status: "PAUSED" });
    if (!result.success) {
      toast.error(result.error ?? "Failed to archive goal");
      return;
    }
    toast.success("Goal archived");
    router.refresh();
  }

  async function handleDeleteGoal(goal: GoalItem) {
    if (!window.confirm(`Delete "${goal.title}"? This cannot be undone.`)) {
      return;
    }

    const result = await deleteGoal({ id: goal.id });
    if (!result.success) {
      toast.error(result.error ?? "Failed to delete goal");
      return;
    }
    toast.success("Goal deleted");
    router.refresh();
  }

  const goalProgressStat = goalProgressDisplay(
    data.stats.averageProgress,
    data.stats.milestonesTotal
  );

  const stats = [
    { label: "Active Goals", value: String(data.stats.activeGoals), icon: Target },
    {
      label: "Goal Progress",
      value: formatProgressDisplay(goalProgressStat),
      icon: TrendingUp,
    },
    {
      label: "Roadmap Progress",
      value:
        data.stats.milestonesTotal === 0
          ? "Planning"
          : `${data.stats.milestonesCompleted}/${data.stats.milestonesTotal}`,
      icon: Flag,
    },
  ];

  const milestones = primary?.milestones ?? [];
  const hasMilestones = milestones.length > 0;
  const primaryDisplay = primary
    ? goalProgressDisplay(primary.progress, primary.milestones.length)
    : null;
  const categories = data.categories;

  const matrixLegend = [
    { label: "High impact", color: "bg-primary" },
    { label: "Low impact", color: "bg-muted-foreground" },
  ];

  const priorityMatrix = {
    highImpactLowEffort: data.priorityMatrix.highImpactLowEffort.map(actionToMatrixItem),
    highImpactHighEffort: data.priorityMatrix.highImpactHighEffort.map(actionToMatrixItem),
    lowImpactLowEffort: data.priorityMatrix.lowImpactLowEffort.map(actionToMatrixItem),
    lowImpactHighEffort: data.priorityMatrix.lowImpactHighEffort.map(actionToMatrixItem),
  };
  const matrixActionCount = data.totalActions;
  const isGoalsLocked = !data.lock.unlocked;

  if (isGoalsLocked) {
    return (
      <div className="space-y-6 pb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Goals</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Transform your vision into measurable outcomes.
          </p>
        </div>
        <GoalsLockedState lock={data.lock} />
      </div>
    );
  }

  if (data.goals.length === 0) {
    return (
      <div className="space-y-6 pb-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Goals</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Transform your vision into measurable outcomes.
          </p>
        </div>
        <Card className="border-dashed border-border bg-card/50">
          <CardContent className="flex flex-col items-center px-6 py-16 text-center">
            <Target className="h-10 w-10 text-primary" />
            <h2 className="mt-4 text-lg font-semibold">No goals yet</h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Create goals to break your vision into measurable outcomes.
            </p>
            <Button className="mt-6 rounded-full" onClick={() => setOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Goal
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Goals</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Transform your vision into measurable outcomes.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button className="rounded-full" onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Goal
          </Button>
          {primary && hasMilestones && (
            <Button
              variant="outline"
              className="rounded-full"
              onClick={scrollToRoadmap}
            >
              <Map className="mr-2 h-4 w-4" />
              View Roadmap
            </Button>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid gap-3 sm:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-border bg-card">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  {stat.label}
                </p>
                <p className="mt-1 text-2xl font-bold">{stat.value}</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <stat.icon className="h-4 w-4 text-primary" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Goal Detail */}
      <Card className="border-border bg-card">
        <CardContent className={cn("p-6", !hasMilestones && "p-5")}>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              {hasMilestones && (
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className="border-primary/40 bg-primary/10 text-primary"
                  >
                    {primary ? formatLifeArea(primary.category) : "Goal"}
                  </Badge>
                  {primary?.targetDate && (
                    <Badge variant="outline" className="text-[10px]">
                      Target {new Date(primary.targetDate).toLocaleDateString()}
                    </Badge>
                  )}
                </div>
              )}
              <div className={cn("flex items-start justify-between gap-3", hasMilestones && "mt-3")}>
                <h2 className={cn("font-semibold", hasMilestones ? "text-xl" : "text-lg")}>
                  {primary?.title ?? "Primary Goal"}
                </h2>
                {primary && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 shrink-0"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditGoalOpen(true)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit Goal
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleArchiveGoal(primary)}>
                        <Archive className="mr-2 h-4 w-4" />
                        Archive Goal
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => handleDeleteGoal(primary)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Goal
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
              {hasMilestones && primary?.description && (
                <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                  {primary.description}
                </p>
              )}
            </div>
          </div>

          {hasMilestones && (
            <div className="mt-6 max-w-md space-y-2">
              <div className="flex items-end justify-between text-xs">
                <span className="text-muted-foreground">Goal Progress</span>
                <span className="font-medium text-primary">
                  {primaryDisplay ? formatProgressDisplay(primaryDisplay) : "0%"}
                </span>
              </div>
              {primaryDisplay && showProgressBar(primaryDisplay) && (
                <Progress
                  value={progressBarValue(primaryDisplay)}
                  className="h-2"
                />
              )}
            </div>
          )}

          {!hasMilestones ? (
            <div className="mt-5 rounded-xl border border-dashed border-border bg-surface/30 p-5">
              <p className="text-sm font-medium">No milestones yet</p>
              {primary && (
                <p className="mt-2 text-sm text-muted-foreground">
                  Break &ldquo;{primary.title}&rdquo; into measurable checkpoints.
                </p>
              )}
              <div className="mt-4 space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Examples
                </p>
                <ul className="space-y-1.5 text-sm text-muted-foreground">
                  {milestoneExamples.map((example) => (
                    <li key={example} className="flex items-start gap-2">
                      <span className="text-primary">✓</span>
                      <span>{example}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {primary && (
                <Button
                  className="mt-5 rounded-full"
                  onClick={() => setAddMilestoneOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add first milestone
                </Button>
              )}
            </div>
          ) : (
            <div
              id="milestone-roadmap"
              ref={roadmapRef}
              className="mt-8 border-t border-border pt-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Roadmap
                </p>
                {primary && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onClick={() => setAddMilestoneOpen(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Milestone
                  </Button>
                )}
              </div>

              <GoalMilestoneRoadmapList
                milestones={milestones}
                onAddAction={
                  primary
                    ? (milestoneId) => openAddAction(primary.id, milestoneId)
                    : undefined
                }
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Life Areas */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {categories.map((cat) => {
          const Icon = lifeAreaIcons[cat.category] ?? Target;

          return (
            <Card key={cat.name} className="border-border bg-card">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium">
                    Life Area: {cat.name}
                  </p>
                </div>
                <dl className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-muted-foreground">Goals</dt>
                    <dd className="font-medium">{cat.goals}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-muted-foreground">Milestones</dt>
                    <dd className="font-medium">{cat.milestones}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-muted-foreground">Actions</dt>
                    <dd className="font-medium">{cat.actions}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-muted-foreground">Focus</dt>
                    <dd className="font-medium">{cat.focusHours}h</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Priority Matrix */}
      <Card className="border-border bg-card">
        <CardContent className={cn("p-6", matrixActionCount === 0 && "p-4")}>
          {matrixActionCount === 0 ? (
            <div>
              <h3 className="text-sm font-semibold">Priority Matrix Locked</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Create milestone actions to unlock impact vs effort planning.
              </p>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold">Priority Matrix</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Actions ranked by goal impact and effort scores.
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  {matrixLegend.map((item) => (
                    <div key={item.label} className="flex items-center gap-1.5">
                      <span className={cn("h-2 w-2 rounded-full", item.color)} />
                      <span className="text-[10px] text-muted-foreground">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 grid gap-3 lg:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground">High Impact</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <MatrixQuadrant
                      title="Low Effort"
                      items={priorityMatrix.highImpactLowEffort}
                    />
                    <MatrixQuadrant
                      title="High Effort"
                      items={priorityMatrix.highImpactHighEffort}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground">Low Impact</p>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <MatrixQuadrant
                      title="Low Effort"
                      items={priorityMatrix.lowImpactLowEffort}
                    />
                    <MatrixQuadrant
                      title="High Effort"
                      items={priorityMatrix.lowImpactHighEffort}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {primary && (
        <>
          <AddMilestoneDialog
            open={addMilestoneOpen}
            onOpenChange={setAddMilestoneOpen}
            goalId={primary.id}
            goalTitle={primary.title}
          />
          <EditGoalDialog
            open={editGoalOpen}
            onOpenChange={setEditGoalOpen}
            goal={primary}
          />
        </>
      )}

      <ActionFormDialog
        open={actionFormOpen}
        onOpenChange={setActionFormOpen}
        goalOptions={data.goalOptions}
        defaultGoalId={actionDefaults.goalId}
        defaultMilestoneId={actionDefaults.milestoneId}
      />
    </div>
  );
}
