"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

interface ProgressRingProps {
  value: number;
  size?: number;
  label?: string;
  sublabel?: string;
}

export function ProgressRing({
  value,
  size = 120,
  label,
  sublabel,
}: ProgressRingProps) {
  const data = [
    { name: "progress", value },
    { name: "remaining", value: 100 - value },
  ];

  return (
    <div
      className="relative mx-auto"
      style={{ width: size, height: size, minWidth: size, minHeight: size }}
    >
      <ResponsiveContainer width={size} height={size} minWidth={size} minHeight={size}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius="70%"
            outerRadius="100%"
            startAngle={90}
            endAngle={-270}
            dataKey="value"
            stroke="none"
          >
            <Cell fill="#38bdf8" />
            <Cell fill="#1e293b" />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-2xl font-bold text-primary">{value}%</span>
        {label && (
          <span className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </span>
        )}
        {sublabel && (
          <span className="mt-0.5 text-[9px] text-muted-foreground">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  );
}
