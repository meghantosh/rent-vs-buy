"use client";

import type { CalculatorResults } from "@/lib/calculator/types";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from "recharts";

const COLORS = [
  "oklch(0.65 0.19 145)",
  "oklch(0.62 0.21 260)",
  "oklch(0.55 0.24 263)",
  "oklch(0.65 0.20 30)",
  "oklch(0.58 0.22 330)",
  "oklch(0.50 0.20 290)",
  "oklch(0.60 0.18 200)",
];

function fmtK(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  return `$${(n / 1000).toFixed(0)}K`;
}

interface ScenarioComparisonChartProps {
  results: CalculatorResults;
  yearIndex: number;
  title: string;
}

export function ScenarioComparisonChart({
  results,
  yearIndex,
  title,
}: ScenarioComparisonChartProps) {
  const snap = results.yearSnapshots[yearIndex];

  const data = [
    { name: "Rent", wealth: Math.round(snap.rent.totalWealth) },
    ...snap.buy.map((b, i) => ({
      name: results.scenarios[i].label,
      wealth: Math.round(b.totalWealth),
    })),
  ];

  const chartConfig: ChartConfig = Object.fromEntries(
    data.map((d, i) => [
      d.name,
      { label: d.name, color: COLORS[i % COLORS.length] },
    ])
  );

  const maxWealth = Math.max(...data.map((d) => d.wealth));

  return (
    <div>
      <h3 className="text-sm font-semibold mb-2">{title}</h3>
      <ChartContainer config={chartConfig} className="aspect-[2/1] w-full">
        <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="name"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11 }}
            interval={0}
            angle={-30}
            textAnchor="end"
            height={60}
          />
          <YAxis tickFormatter={fmtK} tickLine={false} axisLine={false} width={60} />
          <ChartTooltip
            content={
              <ChartTooltipContent
                formatter={(value) => fmtK(value as number)}
              />
            }
          />
          <Bar dataKey="wealth" radius={[4, 4, 0, 0]}>
            {data.map((entry, i) => (
              <Cell
                key={entry.name}
                fill={COLORS[i % COLORS.length]}
                opacity={entry.wealth === maxWealth ? 1 : 0.7}
              />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  );
}
