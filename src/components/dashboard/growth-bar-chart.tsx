"use client";

import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  XAxis,
} from "recharts";

const COLORS = ["#1e293b", "#1e293b", "#1e293b", "#38bdf8", "#1e293b", "#1e293b", "#1e293b"];

export function GrowthBarChart({
  data = [],
}: {
  data?: { label: string; value: number }[];
}) {
  const chartData = data.map((d) => ({ month: d.label, value: d.value }));

  if (chartData.length === 0) {
    return (
      <div className="flex h-[180px] items-center justify-center text-sm text-muted-foreground">
        No trend data yet
      </div>
    );
  }

  const peakIndex = chartData.reduce(
    (max, item, i) => (item.value > chartData[max].value ? i : max),
    0
  );

  return (
    <ResponsiveContainer width="100%" height={180} minWidth={0} minHeight={180}>
      <BarChart data={chartData} barSize={16}>
        <XAxis
          dataKey="month"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#94a3b8", fontSize: 10 }}
        />
        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
          {chartData.map((entry, i) => (
            <Cell
              key={entry.month}
              fill={i === peakIndex ? "#38bdf8" : COLORS[i % COLORS.length]}
              className={i === peakIndex ? "noirly-glow" : undefined}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
