"use client";

import { motion } from "framer-motion";
import { Code2, GraduationCap, Palette, type LucideIcon } from "lucide-react";

const personas: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: Code2,
    title: "Developers",
    description:
      "Ship projects with clear goals, focused sessions, and a record of what you learned.",
  },
  {
    icon: GraduationCap,
    title: "Lifelong Learners",
    description:
      "Structure study goals, track progress, and keep notes in one place.",
  },
  {
    icon: Palette,
    title: "Creators",
    description:
      "Move from ideas to execution while capturing lessons along the way.",
  },
];

export function Personas() {
  return (
    <section className="border-t border-border/50 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">Built for builders</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            A personal OS for people who create, learn, and ship.
          </p>
        </div>

        <div className="mt-16 grid gap-4 md:grid-cols-3">
          {personas.map((persona, i) => (
            <motion.div
              key={persona.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="rounded-2xl border border-border bg-card p-6"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <persona.icon className="h-4 w-4" />
              </div>
              <h3 className="mt-4 font-semibold">{persona.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {persona.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
