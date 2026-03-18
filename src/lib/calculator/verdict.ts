import type { CalculatorResults } from "./types";
import { fmtPrice } from "./format";

export interface Verdict {
  winner: "rent" | "buy" | "tie";
  text: string;
  /** Subtitle providing additional context (e.g. what rent is compared against) */
  subtext?: string;
  difference: number;
  scenarioLabel?: string;
  /** Index of the winning buy scenario (0-5) when buy wins */
  bestBuyIndex: number;
}

export function computeVerdict(results: CalculatorResults): Verdict {
  const rentWealth = results.rentWealth10yr;

  // Find the best buy scenario (highest wealth at year 10)
  let bestIdx = 0;
  let bestWealth = results.summaries[0].wealth10yr;
  for (let i = 1; i < results.summaries.length; i++) {
    if (results.summaries[i].wealth10yr > bestWealth) {
      bestWealth = results.summaries[i].wealth10yr;
      bestIdx = i;
    }
  }

  const diff = Math.abs(rentWealth - bestWealth);
  const label = results.summaries[bestIdx].scenario.label;

  if (diff < 5000) {
    return {
      winner: "tie",
      text: "Renting and buying are roughly equal at year 10",
      difference: diff,
      scenarioLabel: label,
      bestBuyIndex: bestIdx,
    };
  }

  if (rentWealth > bestWealth) {
    const scenario = results.summaries[bestIdx].scenario;
    return {
      winner: "rent",
      text: `Renting saves ${fmtPrice(diff)} at year 10`,
      subtext: `vs. a ${scenario.term}yr mortgage on ${fmtPrice(scenario.price)}`,
      difference: diff,
      scenarioLabel: label,
      bestBuyIndex: bestIdx,
    };
  }

  return {
    winner: "buy",
    text: `Buying (${label}) builds ${fmtPrice(diff)} more wealth by year 10`,
    difference: diff,
    scenarioLabel: label,
    bestBuyIndex: bestIdx,
  };
}
