"use client";

import type { CalculatorResults } from "@/lib/calculator/types";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";

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
  return `$${(n / 1000).toFixed(1)}K`;
}

interface MonthlyCostChartProps {
  results: CalculatorResults;
}

export function MonthlyCostChart({ results }: MonthlyCostChartProps) {
  const labels = ["Rent", ...results.scenarios.map((s) => s.label)];

  const chartConfig: ChartConfig = Object.fromEntries(
    labels.map((label, i) => [
      label,
      { label, color: COLORS[i % COLORS.length] },
    ])
  );

  const data = results.yearSnapshots.map((snap) => {
    const row: Record<string, number> = { year: snap.year };
    row["Rent"] = Math.round(snap.rent.monthlyRent);
    snap.buy.forEach((b, i) => {
      row[results.scenarios[i].label] = Math.round(b.netMonthlyCost);
    });
    return row;
  });

  return (
    <ChartContainer config={chartConfig} className="aspect-[2/1] w-full">
      <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="year" tickLine={false} axisLine={false} />
        <YAxis tickFormatter={fmtK} tickLine={false} axisLine={false} width={60} />
        <ChartTooltip
          content={
            <ChartTooltipContent
              formatter={(value) => `$${(value as number).toLocaleString()}`}
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        {labels.map((label, i) => (
          <Line
            key={label}
            type="monotone"
            dataKey={label}
            stroke={COLORS[i % COLORS.length]}
            strokeWidth={label === "Rent" ? 2.5 : 1.5}
            strokeDasharray={label === "Rent" ? "6 3" : undefined}
            dot={false}
          />
        ))}
      </LineChart>
    </ChartContainer>
  );
}
