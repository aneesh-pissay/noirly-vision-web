import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function SettingActions({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-end gap-2 border-t border-border/60 px-5 py-4 sm:px-6",
        className
      )}
    >
      {children}
    </div>
  );
}

export function SettingSection({
  title,
  description,
  children,
  actions,
  className,
  contentClassName,
  divided = true,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
  contentClassName?: string;
  divided?: boolean;
}) {
  return (
    <Card className={cn("border-border bg-card shadow-sm", className)}>
      <CardHeader className="space-y-1 border-b border-border/60 px-5 py-4 sm:px-6">
        <CardTitle className="text-base font-semibold tracking-tight">
          {title}
        </CardTitle>
        {description ? (
          <CardDescription className="text-sm leading-relaxed">
            {description}
          </CardDescription>
        ) : null}
      </CardHeader>
      <CardContent
        className={cn(
          "px-5 sm:px-6",
          divided ? "divide-y divide-border/60 py-0" : "py-5",
          contentClassName
        )}
      >
        {children}
      </CardContent>
      {actions ? <SettingActions>{actions}</SettingActions> : null}
    </Card>
  );
}

export function DangerZone({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-5">
      <p className="text-sm font-medium text-destructive">{title}</p>
      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">{children}</div>
    </div>
  );
}
