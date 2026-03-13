import { describe, it, expect } from "vitest";
import { computeVerdict } from "@/lib/calculator/verdict";
import { computeResults } from "@/lib/calculator/engine";
import { DEFAULT_INPUTS } from "@/lib/calculator/defaults";
import type { CalculatorInputs } from "@/lib/calculator/types";

describe("computeVerdict", () => {
  it("returns a verdict with the default inputs", () => {
    const results = computeResults(DEFAULT_INPUTS);
    const verdict = computeVerdict(results);

    expect(verdict.winner).toMatch(/^(rent|buy|tie)$/);
    expect(verdict.text).toBeTruthy();
    expect(verdict.difference).toBeGreaterThanOrEqual(0);
    expect(verdict.bestBuyIndex).toBeGreaterThanOrEqual(0);
    expect(verdict.bestBuyIndex).toBeLessThan(results.summaries.length);
  });

  it("returns rent wins when rent wealth is higher", () => {
    const results = computeResults(DEFAULT_INPUTS);
    // Override so rent wealth clearly beats all buy scenarios
    const rentWinsResults = {
      ...results,
      rentWealth10yr: 2_000_000,
      summaries: results.summaries.map((s) => ({
        ...s,
        wealth10yr: 1_500_000,
      })),
    };
    const verdict = computeVerdict(rentWinsResults);

    expect(verdict.winner).toBe("rent");
    expect(verdict.text).toContain("Renting saves you");
    expect(verdict.text).toContain("at year 10");
  });

  it("returns buy wins when buying is clearly better", () => {
    // Cheap house with high appreciation and expensive rent → buy should win
    const inputs: CalculatorInputs = {
      ...DEFAULT_INPUTS,
      housePrices: [200_000, 250_000, 300_000],
      downPaymentPercents: [50, 50, 50],
      appreciationRate: 8,
      monthlyRent: 5000,
      investmentReturnRate: 2,
    };
    const results = computeResults(inputs);
    const verdict = computeVerdict(results);

    expect(verdict.winner).toBe("buy");
    expect(verdict.text).toContain("Buying");
    expect(verdict.text).toContain("more wealth by year 10");
    expect(verdict.scenarioLabel).toBeTruthy();
  });

  it("returns tie when rent and buy wealth are within $5K", () => {
    // We need to find inputs that produce a near-tie. Construct results directly.
    const results = computeResults(DEFAULT_INPUTS);
    // Override the results to simulate a tie
    const tiedResults = {
      ...results,
      rentWealth10yr: 1_000_000,
      summaries: results.summaries.map((s, i) => ({
        ...s,
        wealth10yr: i === 0 ? 1_002_000 : 500_000, // Within $5K of rent
      })),
    };
    const verdict = computeVerdict(tiedResults);

    expect(verdict.winner).toBe("tie");
    expect(verdict.text).toBe("Renting and buying are roughly equal at year 10");
  });

  it("picks the best buy scenario by highest wealth10yr", () => {
    const results = computeResults(DEFAULT_INPUTS);
    // Override summaries so scenario index 3 is clearly the best
    const modifiedResults = {
      ...results,
      rentWealth10yr: 100_000,
      summaries: results.summaries.map((s, i) => ({
        ...s,
        wealth10yr: i === 3 ? 500_000 : 200_000,
      })),
    };
    const verdict = computeVerdict(modifiedResults);

    expect(verdict.winner).toBe("buy");
    expect(verdict.bestBuyIndex).toBe(3);
  });

  it("uses fmtPrice format in the verdict text", () => {
    const inputs: CalculatorInputs = {
      ...DEFAULT_INPUTS,
      housePrices: [3_000_000, 3_500_000, 4_000_000],
      downPaymentPercents: [20, 20, 20],
      appreciationRate: 0,
      monthlyRent: 2000,
    };
    const results = computeResults(inputs);
    const verdict = computeVerdict(results);

    // The dollar amount should be formatted (contains $ and K or M)
    expect(verdict.text).toMatch(/\$[\d.]+[KM]/);
  });
});
