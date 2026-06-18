"use client";

import { Bar, BarChart, ResponsiveContainer } from "recharts";

const data = [
  { v: 98 },
  { v: 99 },
  { v: 99.5 },
  { v: 99.8 },
  { v: 99.9 },
  { v: 99.9 },
  { v: 99.9 },
];

export function SystemStabilityChart() {
  return (
    <ResponsiveContainer width="100%" height={48} minWidth={0} minHeight={48}>
      <BarChart data={data} barSize={6}>
        <Bar dataKey="v" fill="#38bdf8" radius={[2, 2, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
