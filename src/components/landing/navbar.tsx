"use client";

import Link from "next/link";
import { useAuth } from "@/components/providers/auth-provider";
import { BrandLogo } from "@/components/landing/brand-logo";
import { Button } from "@/components/ui/button";

export function LandingNavbar() {
  const { isAuthenticated, loading } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <BrandLogo />

        <div className="flex items-center gap-3">
          {loading ? (
            <div
              className="h-9 w-28 animate-pulse rounded-lg bg-muted/50"
              aria-hidden
            />
          ) : isAuthenticated ? (
            <Button asChild size="sm" className="rounded-lg px-5">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
              >
                <Link href="/login">Sign In</Link>
              </Button>
              <Button asChild size="sm" className="rounded-lg px-5">
                <Link href="/register">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
