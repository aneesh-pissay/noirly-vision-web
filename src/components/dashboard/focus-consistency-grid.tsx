"use client";

import { cn } from "@/lib/utils";

const grid = [
  [0.9, 0.8, 0.7, 0.95, 0.6, 0.85, 0.4],
  [0.75, 0.9, 0.85, 0.7, 0.8, 0.65, 0.5],
  [0.6, 0.7, 0.95, 0.9, 0.85, 0.75, 0.55],
  [0.8, 0.85, 0.7, 0.6, 0.9, 0.8, 0.7],
  [0.5, 0.6, 0.75, 0.85, 0.7, 0.9, 0.65],
];

export function FocusConsistencyGrid() {
  return (
    <div className="space-y-1">
      {grid.map((row, i) => (
        <div key={i} className="flex gap-1">
          {row.map((opacity, j) => (
            <div
              key={j}
              className={cn("h-3 w-3 rounded-sm bg-primary")}
              style={{ opacity }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
