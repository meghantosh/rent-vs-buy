"use client";

import type { ReactNode } from "react";
import type { CalculatorResults } from "@/lib/calculator/types";
import { computeVerdict } from "@/lib/calculator/verdict";

const RENT_COLOR = "#E2EBF2";
const BUY_COLORS = [
  "#f5ed68",
  "#f6d164",
  "#f7b460",
  "#f7985b",
  "#f87b57",
  "#f95f53",
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
      <p className="text-lg font-bold">{verdict.text}</p>
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  );
}
