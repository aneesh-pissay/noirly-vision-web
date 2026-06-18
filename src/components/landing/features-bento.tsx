"use client";

import { motion } from "framer-motion";
import {
  BookOpen,
  Flag,
  LineChart,
  Rocket,
  Sparkles,
  Timer,
} from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "Vision",
    description: "Plan your direction.",
    className: "lg:col-span-2",
  },
  {
    icon: Flag,
    title: "Goals",
    description: "Turn ambition into milestones.",
    className: "lg:col-span-2",
  },
  {
    icon: Rocket,
    title: "Execution",
    description: "Move every day.",
    className: "lg:col-span-2",
  },
  {
    icon: Timer,
    title: "Focus",
    description: "Protect deep work time.",
    className: "lg:col-span-2",
  },
  {
    icon: LineChart,
    title: "Analytics",
    description: "Understand your progress.",
    className: "lg:col-span-2",
  },
  {
    icon: BookOpen,
    title: "Vault",
    description: "Remember what you learn.",
    className: "lg:col-span-2",
  },
] as const;

export function FeaturesBento() {
  return (
    <section id="features" className="border-t border-border/50 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Everything connected
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Vision, goals, execution, focus, and knowledge live in one system.
          </p>
        </div>

        <div className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className={`rounded-2xl border border-border bg-card p-6 ${feature.className}`}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
