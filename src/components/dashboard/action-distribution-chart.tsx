"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";

const COLORS = ["#38bdf8", "#818cf8", "#34d399", "#f472b6", "#fbbf24"];

export function ActionDistributionChart({
  data = [],
}: {
  data?: { label: string; value: number }[];
}) {
  const chartData = data
    .filter((d) => d.value > 0)
    .map((d, i) => ({
      name: d.label,
      value: d.value,
      color: COLORS[i % COLORS.length],
    }));

  const total = chartData.reduce((sum, d) => sum + d.value, 0);

  if (chartData.length === 0) {
    return (
      <div
        className="relative mx-auto flex items-center justify-center text-sm text-muted-foreground"
        style={{ width: 160, height: 160 }}
      >
        No actions yet
      </div>
    );
  }

  return (
    <div className="relative mx-auto" style={{ width: 160, height: 160 }}>
      <ResponsiveContainer width={160} height={160} minWidth={160} minHeight={160}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius="58%"
            outerRadius="100%"
            dataKey="value"
            stroke="none"
          >
            {chartData.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xl font-bold">{total}</span>
        <span className="text-[9px] text-muted-foreground">Actions</span>
      </div>
    </div>
  );
}
