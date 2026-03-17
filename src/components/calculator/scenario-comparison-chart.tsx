"use client";

import type { CalculatorResults } from "@/lib/calculator/types";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Cell } from "recharts";

const RENT_COLOR = "var(--chart-rent)";
const COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
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

  const colorFor = (i: number) => (i === 0 ? RENT_COLOR : COLORS[(i - 1) % COLORS.length]);

  const chartConfig: ChartConfig = Object.fromEntries(
    data.map((d, i) => [
      d.name,
      { label: d.name, color: colorFor(i) },
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
                fill={colorFor(i)}
                opacity={entry.wealth === maxWealth ? 1 : 0.7}
              />
            ))}
          </Bar>
        </BarChart>
      </ChartContainer>
    </div>
  );
}
