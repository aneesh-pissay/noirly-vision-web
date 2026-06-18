"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

interface AlignmentDonutProps {
  value: number;
  size?: number;
  sublabel?: string;
}

export function AlignmentDonut({
  value,
  size = 140,
  sublabel = "Optimal",
}: AlignmentDonutProps) {
  const data = [
    { name: "aligned", value },
    { name: "remaining", value: 100 - value },
  ];

  return (
    <div
      className="relative mx-auto min-h-[140px] min-w-[140px]"
      style={{ width: size, height: size }}
    >
      <ResponsiveContainer width={size} height={size} minWidth={size} minHeight={size}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius="72%"
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
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-primary">{value}%</span>
        <span className="text-[10px] text-muted-foreground">{sublabel}</span>
      </div>
    </div>
  );
}
