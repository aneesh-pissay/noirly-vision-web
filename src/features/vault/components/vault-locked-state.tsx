import Link from "next/link";
import { Lock } from "lucide-react";
import type { VaultLockDisplay } from "@/lib/progress/permissions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type VaultLockedStateProps = {
  lock: VaultLockDisplay;
};

export function VaultLockedState({ lock }: VaultLockedStateProps) {
  return (
    <Card className="border-border bg-card">
      <CardContent className="flex flex-col items-center px-6 py-16 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
          <Lock className="h-7 w-7 text-muted-foreground" />
        </div>
        <h2 className="mt-5 text-xl font-semibold">{lock.title}</h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          {lock.message}
        </p>
        {lock.ctaHref && lock.ctaLabel && (
          <Button asChild className="mt-6 rounded-full">
            <Link href={lock.ctaHref}>{lock.ctaLabel}</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
