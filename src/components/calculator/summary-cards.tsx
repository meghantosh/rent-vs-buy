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

interface SummaryCardsProps {
  results: CalculatorResults;
}

export function SummaryCards({ results }: SummaryCardsProps) {
  const rentMonthly = results.rentYear1Monthly;

  // Group scenarios by price: each price has a 15yr and 30yr summary
  const prices = results.scenarios
    .filter((_, i) => i % 2 === 0)
    .map((s) => s.price);

  const priceGroups = prices.map((price, pi) => {
    const s15 = results.summaries[pi * 2];
    const s30 = results.summaries[pi * 2 + 1];
    return { price, s15, s30 };
  });

  return (
    <div className="grid grid-cols-4 gap-3">
      {/* Rent column */}
      <Card size="sm">
        <CardHeader>
          <CardTitle className="text-sm">Rent</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{fmt(rentMonthly)}</div>
          <div className="text-xs text-muted-foreground">per month (year 1)</div>
        </CardContent>
      </Card>

      {/* One column per price point */}
      {priceGroups.map(({ price, s15, s30 }, i) => {
        const label = `$${(price / 1000).toFixed(0)}K`;
        return (
          <Card key={i} size="sm">
            <CardHeader>
              <CardTitle className="text-sm">{label}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[s15, s30].map((summary) => {
                const diff = summary.year1MonthlyCost - rentMonthly;
                const isMoreExpensive = diff > 0;
                return (
                  <div key={summary.scenario.term}>
                    <div className="text-xs text-muted-foreground mb-0.5">{summary.scenario.term}yr</div>
                    <div className="text-xl font-bold">{fmt(summary.year1MonthlyCost)}</div>
                    <div
                      className={`text-xs font-medium ${
                        isMoreExpensive ? "text-destructive" : "text-emerald-600"
                      }`}
                    >
                      {isMoreExpensive ? "+" : ""}
                      {fmt(diff)} vs rent
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
