"use client";

import type { CalculatorResults } from "@/lib/calculator/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function fmt(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

interface WealthSnapshotProps {
  results: CalculatorResults;
}

export function WealthSnapshot({ results }: WealthSnapshotProps) {
  const snapshots = [
    { label: "10-Year Wealth", rentWealth: results.rentWealth10yr, yearIndex: 9 },
    { label: "30-Year Wealth", rentWealth: results.rentWealth30yr, yearIndex: 29 },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {snapshots.map((snap) => {
        const allWealth = [
          { label: "Rent", wealth: snap.rentWealth },
          ...results.summaries.map((s, i) => ({
            label: s.scenario.label,
            wealth: results.yearSnapshots[snap.yearIndex].buy[i].totalWealth,
          })),
        ];

        const bestWealth = Math.max(...allWealth.map((w) => w.wealth));

        return (
          <Card key={snap.label} size="sm">
            <CardHeader>
              <CardTitle className="text-sm">{snap.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1.5">
                {allWealth.map((item) => (
                  <div
                    key={item.label}
                    className={`flex justify-between text-sm ${
                      item.wealth === bestWealth ? "font-bold text-emerald-600" : ""
                    }`}
                  >
                    <span>{item.label}</span>
                    <span>{fmt(item.wealth)}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
