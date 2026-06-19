"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useAuth } from "@/components/providers/auth-provider";
import { HeroMockup } from "@/components/landing/hero-mockup";
import { Button } from "@/components/ui/button";

export function Hero() {
  const { isAuthenticated, loading } = useAuth();

  const dashboardHref = isAuthenticated ? "/dashboard" : "/login";

  return (
    <section className="relative overflow-hidden px-6 pb-24 pt-20">
      <div className="absolute inset-0 noirly-gradient" />
      <div className="absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-5xl text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="hyphens-none text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl"
        >
          <span className="whitespace-nowrap">Turn your vision into</span>{" "}
          <span className="whitespace-nowrap text-primary">execution</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mx-auto mt-6 max-w-3xl text-pretty text-base text-muted-foreground sm:text-lg"
        >
          Define your vision. Build goals. Take focused action. Improve every day.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          {loading ? (
            <div className="h-11 w-48 animate-pulse rounded-lg bg-muted/50" />
          ) : (
            <>
              <Button asChild size="lg" className="rounded-lg px-8 noirly-glow">
                <Link href={dashboardHref}>Open Dashboard</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="rounded-lg border-border px-8"
              >
                <Link href="#features">Explore System</Link>
              </Button>
            </>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35 }}
        >
          <HeroMockup />
        </motion.div>
      </div>
    </section>
  );
}
