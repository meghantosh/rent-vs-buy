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

const RENT_COLOR = "#E2EBF2";
const COLORS = [
  "#f5ed68",
  "#f6d164",
  "#f7b460",
  "#f7985b",
  "#f87b57",
  "#f95f53",
];

function fmtK(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  return `$${(n / 1000).toFixed(0)}K`;
}

interface WealthChartProps {
  results: CalculatorResults;
}

export function WealthChart({ results }: WealthChartProps) {
  const labels = ["Rent", ...results.scenarios.map((s) => s.label)];

  const colorFor = (i: number) => (i === 0 ? RENT_COLOR : COLORS[(i - 1) % COLORS.length]);

  const chartConfig: ChartConfig = Object.fromEntries(
    labels.map((label, i) => [
      label,
      { label, color: colorFor(i) },
    ])
  );

  const data = results.yearSnapshots.map((snap) => {
    const row: Record<string, number> = { year: snap.year };
    row["Rent"] = Math.round(snap.rent.totalWealth);
    snap.buy.forEach((b, i) => {
      row[results.scenarios[i].label] = Math.round(b.totalWealth);
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
              formatter={(value, _name, item) => (
                <div className="flex items-center gap-1.5">
                  <span
                    className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="font-mono font-medium tabular-nums">
                    {fmtK(value as number)}
                  </span>
                </div>
              )}
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        {labels.map((label, i) => (
          <Line
            key={label}
            type="monotone"
            dataKey={label}
            stroke={colorFor(i)}
            strokeWidth={label === "Rent" ? 2.5 : 1.5}
            strokeDasharray={label === "Rent" ? "6 3" : undefined}
            dot={false}
          />
        ))}
      </LineChart>
    </ChartContainer>
  );
}
