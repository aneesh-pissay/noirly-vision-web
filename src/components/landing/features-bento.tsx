"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  BookOpen,
  Flag,
  ListTodo,
  Map,
  Sparkles,
  Target,
  Timer,
} from "lucide-react";

const features = [
  {
    icon: Target,
    title: "Dashboard",
    description: "Your complete growth overview.",
    className: "lg:col-span-2",
  },
  {
    icon: Sparkles,
    title: "Vision",
    description: "Define your long-term direction.",
    className: "lg:col-span-2",
  },
  {
    icon: Flag,
    title: "Goals",
    description: "Turn vision into measurable outcomes.",
    className: "lg:col-span-2",
  },
  {
    icon: Map,
    title: "Milestones",
    description: "Break goals into achievable checkpoints.",
    className: "lg:col-span-2",
  },
  {
    icon: ListTodo,
    title: "Actions",
    description: "Execute with daily focus.",
    className: "lg:col-span-2",
  },
  {
    icon: Timer,
    title: "Focus",
    description: "Protect deep work sessions.",
    className: "lg:col-span-2",
  },
  {
    icon: BookOpen,
    title: "Knowledge",
    description: "Capture lessons and ideas.",
    className: "lg:col-span-2",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description: "Track progress and patterns.",
    className: "lg:col-span-2",
  },
] as const;

export function FeaturesBento() {
  return (
    <section id="features" className="border-t border-border/50 px-6 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <h2 className="hyphens-none text-balance text-3xl font-bold tracking-tight">
            Your personal growth system
          </h2>
          <p className="mx-auto mt-3 max-w-3xl text-pretty text-muted-foreground">
            Everything you need to turn ideas into consistent progress.
          </p>
        </div>

        <div className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
              <h3 className="mt-5 text-lg font-semibold hyphens-none">
                {feature.title}
              </h3>
              <p className="mt-2 text-pretty text-sm text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
