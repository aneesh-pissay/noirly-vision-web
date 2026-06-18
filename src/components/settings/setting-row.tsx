import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SettingRow({
  title,
  description,
  control,
  children,
  className,
}: {
  title: string;
  description?: string;
  control?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6",
        className
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description ? (
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center sm:justify-end">
        {control ?? children}
      </div>
    </div>
  );
}
