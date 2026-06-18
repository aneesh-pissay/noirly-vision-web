"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const data = [
  { name: "Mon", completed: 4, created: 6 },
  { name: "Tue", completed: 7, created: 5 },
  { name: "Wed", completed: 5, created: 8 },
  { name: "Thu", completed: 9, created: 4 },
  { name: "Fri", completed: 6, created: 7 },
  { name: "Sat", completed: 3, created: 2 },
  { name: "Sun", completed: 2, created: 3 },
];

export function ProductivityChart() {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-base font-medium">Weekly Productivity</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="name"
              stroke="#94a3b8"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#94a3b8"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#111827",
                border: "1px solid #1e293b",
                borderRadius: "8px",
                color: "#f8fafc",
              }}
            />
            <Bar dataKey="completed" fill="#38bdf8" radius={[4, 4, 0, 0]} />
            <Bar dataKey="created" fill="#818cf8" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
