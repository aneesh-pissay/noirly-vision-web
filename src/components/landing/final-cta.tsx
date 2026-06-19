"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export function FinalCTA() {
  return (
    <section className="border-t border-border/50 px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mx-auto max-w-3xl rounded-2xl border border-border bg-card px-8 py-14 text-center"
      >
        <h2 className="hyphens-none text-balance text-3xl font-bold tracking-tight">
          Build your personal operating system
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-pretty text-muted-foreground">
          Start with a vision. Connect your goals. Execute every day.
        </p>
        <Button asChild size="lg" className="mt-8 rounded-lg px-8 noirly-glow">
          <Link href="/register">Create Your Vision</Link>
        </Button>
      </motion.div>
    </section>
  );
}
