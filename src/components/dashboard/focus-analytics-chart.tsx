"use client";

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
} from "recharts";

const emptyWeek = [
  { day: "M", hours: 0 },
  { day: "T", hours: 0 },
  { day: "W", hours: 0 },
  { day: "T", hours: 0 },
  { day: "F", hours: 0 },
  { day: "S", hours: 0 },
  { day: "S", hours: 0 },
];

export function FocusAnalyticsChart({
  data,
}: {
  data?: { label: string; minutes: number }[];
}) {
  const chartData = data
    ? data.map((d) => ({
        day: d.label.charAt(0),
        hours: Math.round((d.minutes / 60) * 10) / 10,
      }))
    : emptyWeek;

  return (
    <ResponsiveContainer width="100%" height={120} minWidth={0} minHeight={120}>
      <BarChart data={chartData} barSize={20}>
        <XAxis
          dataKey="day"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#94a3b8", fontSize: 11 }}
        />
        <Bar dataKey="hours" fill="#38bdf8" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
