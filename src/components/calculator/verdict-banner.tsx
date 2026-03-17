"use client";

import type { ReactNode } from "react";
import type { CalculatorResults } from "@/lib/calculator/types";
import { computeVerdict } from "@/lib/calculator/verdict";

const RENT_COLOR = "var(--chart-rent)";
const BUY_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
  "var(--chart-6)",
];

interface VerdictBannerProps {
  results: CalculatorResults;
  actions?: ReactNode;
}

export function VerdictBanner({ results, actions }: VerdictBannerProps) {
  const verdict = computeVerdict(results);

  const bgColor =
    verdict.winner === "buy"
      ? BUY_COLORS[verdict.bestBuyIndex % BUY_COLORS.length]
      : RENT_COLOR;

  return (
    <div
      className="rounded-lg border p-4 flex items-center justify-between gap-4"
      style={{ backgroundColor: bgColor }}
    >
      <p className="text-4xl font-bold font-[family-name:var(--font-ibm-plex)]">{verdict.text}</p>
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  );
}
