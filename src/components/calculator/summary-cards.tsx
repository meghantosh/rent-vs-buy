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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {/* Rent card */}
      <Card size="sm">
        <CardHeader>
          <CardTitle className="text-sm">Rent</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{fmt(rentMonthly)}</div>
          <div className="text-xs text-muted-foreground">per month (year 1)</div>
        </CardContent>
      </Card>

      {/* Buy scenario cards */}
      {results.summaries.map((summary, i) => {
        const diff = summary.year1MonthlyCost - rentMonthly;
        const isMoreExpensive = diff > 0;

        return (
          <Card key={i} size="sm">
            <CardHeader>
              <CardTitle className="text-sm">{summary.scenario.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{fmt(summary.year1MonthlyCost)}</div>
              <div className="text-xs text-muted-foreground">per month (year 1)</div>
              <div
                className={`text-xs mt-1 font-medium ${
                  isMoreExpensive ? "text-destructive" : "text-emerald-600"
                }`}
              >
                {isMoreExpensive ? "+" : ""}
                {fmt(diff)} vs rent
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
