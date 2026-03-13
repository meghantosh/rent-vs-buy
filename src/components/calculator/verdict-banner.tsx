"use client";

import type { CalculatorResults } from "@/lib/calculator/types";
import { computeVerdict } from "@/lib/calculator/verdict";

interface VerdictBannerProps {
  results: CalculatorResults;
}

export function VerdictBanner({ results }: VerdictBannerProps) {
  const verdict = computeVerdict(results);

  return (
    <div className="rounded-lg border bg-muted/50 p-4">
      <p className="text-lg font-bold text-center">{verdict.text}</p>
    </div>
  );
}
