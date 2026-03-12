"use client";

import type { CalculatorResults } from "@/lib/calculator/types";

interface BreakevenBannerProps {
  results: CalculatorResults;
}

export function BreakevenBanner({ results }: BreakevenBannerProps) {
  return (
    <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
      <h3 className="text-sm font-semibold">Breakeven Timeline</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {results.summaries.map((summary, i) => (
          <div key={i} className="text-sm">
            <span className="text-muted-foreground">{summary.scenario.label}: </span>
            <span className="font-medium">
              {summary.breakevenYear
                ? `Year ${summary.breakevenYear}`
                : "Does not break even"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
