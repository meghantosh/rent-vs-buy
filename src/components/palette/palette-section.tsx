"use client";

import { useMemo } from "react";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { Input } from "@/components/ui/input";
import { interpolateColors, isValidHex } from "./color-utils";

const BAR_DATA = [
  { name: "A", value: 40 },
  { name: "B", value: 65 },
  { name: "C", value: 50 },
  { name: "D", value: 80 },
  { name: "E", value: 35 },
  { name: "F", value: 55 },
];

const PIE_DATA = [
  { name: "A", value: 25 },
  { name: "B", value: 20 },
  { name: "C", value: 18 },
  { name: "D", value: 15 },
  { name: "E", value: 12 },
  { name: "F", value: 10 },
];

interface PaletteSectionProps {
  index: number;
  start: string;
  end: string;
  onChangeStart: (value: string) => void;
  onChangeEnd: (value: string) => void;
  readOnly?: boolean;
}

export function PaletteSection({
  index,
  start,
  end,
  onChangeStart,
  onChangeEnd,
  readOnly,
}: PaletteSectionProps) {
  const colors = useMemo(
    () => interpolateColors(isValidHex(start) ? start : "#000000", isValidHex(end) ? end : "#ffffff", 6),
    [start, end]
  );

  const chartConfig = useMemo<ChartConfig>(
    () =>
      Object.fromEntries(
        colors.map((color, i) => [`color${i}`, { label: String.fromCharCode(65 + i), color }])
      ),
    [colors]
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <CardTitle>Palette {index + 1}</CardTitle>
          {!readOnly && (
            <div className="flex items-center gap-6">
              <ColorPicker label="Start" value={start} onChange={onChangeStart} />
              <ColorPicker label="End" value={end} onChange={onChangeEnd} />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-1">
          {colors.map((color, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full h-10 rounded-sm" style={{ backgroundColor: color }} />
              <span className="text-xs text-muted-foreground font-mono">{color}</span>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-6">
          <ChartContainer config={chartConfig} className="aspect-[4/3] w-full">
            <BarChart data={BAR_DATA}>
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                {BAR_DATA.map((_, i) => (
                  <Cell key={i} fill={colors[i]} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
          <ChartContainer config={chartConfig} className="aspect-[4/3] w-full">
            <PieChart>
              <Pie data={PIE_DATA} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius="80%">
                {PIE_DATA.map((_, i) => (
                  <Cell key={i} fill={colors[i]} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function ColorPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <input
        type="color"
        value={isValidHex(value) ? value : "#000000"}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 w-8 cursor-pointer border-0 bg-transparent p-0"
      />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-24 font-mono text-xs"
      />
    </div>
  );
}
