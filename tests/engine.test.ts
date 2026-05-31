import { describe, it, expect } from "vitest";
import { computeResults } from "@/lib/calculator/engine";
import { computeVerdict } from "@/lib/calculator/verdict";
import { monthlyPayment } from "@/lib/calculator/mortgage";
import {
  calcPropertyTax,
  calcTotalTaxBenefit,
  saltCap,
  homeSaleCapGainsTax,
  portfolioCapGainsTax,
  capitalGainsRate,
} from "@/lib/calculator/taxes";
import { DEFAULT_INPUTS } from "@/lib/calculator/defaults";
import type { CalculatorInputs } from "@/lib/calculator/types";

const base: CalculatorInputs = {
  ...DEFAULT_INPUTS,
  housePrices: [1_000_000, 1_100_000, 1_300_000],
  downPaymentPercents: [50, 45, 39],
};

describe("mortgage", () => {
  it("matches the closed-form payment for 100k / 6.5% / 30yr", () => {
    expect(monthlyPayment(100_000, 6.5, 30)).toBeCloseTo(632.07, 1);
  });
});

describe("property tax (Prop 13)", () => {
  it("is price x rate in year 1", () => {
    expect(calcPropertyTax(1_000_000, 1.1, 1)).toBeCloseTo(11_000, 6);
  });
  it("grows the assessed value 2%/yr, not with market value", () => {
    expect(calcPropertyTax(1_000_000, 1.1, 11)).toBeCloseTo(11_000 * 1.02 ** 10, 4);
  });
});

describe("SALT cap (OBBBA)", () => {
  it("gives the full cap below the phaseout", () => {
    expect(saltCap(240_000)).toBe(40_400);
  });
  it("phases down 30c per $1 over the threshold but not below the floor", () => {
    expect(saltCap(600_000)).toBeCloseTo(Math.max(10_000, 40_400 - 0.3 * (600_000 - 505_000)), 6);
    expect(saltCap(2_000_000)).toBe(10_000);
  });
});

describe("mortgage interest deduction cap", () => {
  it("limits deductible interest to the first $750k of acquisition debt", () => {
    const small = calcTotalTaxBenefit(40_000, 12_000, 240_000, "single", 750_000);
    const big = calcTotalTaxBenefit(40_000, 12_000, 240_000, "single", 1_500_000);
    expect(big).toBeLessThan(small);
  });
});

describe("tax benefit is incremental to renting", () => {
  it("is zero with no mortgage interest and no property tax", () => {
    expect(calcTotalTaxBenefit(0, 0, 240_000, "single", 0)).toBe(0);
  });
});

describe("REGRESSION: rent comparison must not depend on scenario ordering", () => {
  // Previously the engine compared every buy scenario against scenario 0's rent
  // surplus, so a scenario's verdict changed with its position in the array.
  const reordered: CalculatorInputs = {
    ...base,
    housePrices: [1_300_000, 1_100_000, 1_000_000],
    downPaymentPercents: [39, 45, 50],
  };
  const a = computeResults(base);
  const b = computeResults(reordered);
  const idx = (r: typeof a) => r.scenarios.findIndex((s) => s.price === 1_000_000 && s.term === 30);
  const ia = idx(a), ib = idx(b);

  it("yields identical wealth for the same scenario regardless of position", () => {
    expect(a.summaries[ia].wealth10yr).toBeCloseTo(b.summaries[ib].wealth10yr, 6);
  });
  it("keeps the buy-minus-rent gap position-independent", () => {
    const gapA = a.summaries[ia].wealth10yr - a.rentWealth10yr;
    const gapB = b.summaries[ib].wealth10yr - b.rentWealth10yr;
    expect(gapA).toBeCloseTo(gapB, 6);
  });
  it("exposes a single, scenario-independent rent line", () => {
    expect(a.rentWealth10yr).toBeCloseTo(b.rentWealth10yr, 6);
  });
});

describe("verdict", () => {
  it("selects the highest-wealth buy scenario", () => {
    const r = computeResults(base);
    const v = computeVerdict(r);
    const best = Math.max(...r.summaries.map((s) => s.wealth10yr));
    expect(r.summaries[v.bestBuyIndex].wealth10yr).toBe(best);
  });
});

describe("REGRESSION: P&I stops at payoff", () => {
  const r = computeResults(base);
  const i15 = r.scenarios.findIndex((s) => s.price === 1_000_000 && s.term === 15);
  it("drops the 15yr net cost sharply the year after payoff", () => {
    const yr15 = r.yearSnapshots[14].buy[i15].netMonthlyCost;
    const yr16 = r.yearSnapshots[15].buy[i15].netMonthlyCost;
    // Year 16 has no P&I — should fall by roughly the monthly payment.
    expect(yr16).toBeLessThan(yr15 * 0.5);
    expect(yr16).toBeGreaterThan(0); // taxes + insurance + maintenance remain
  });
});

describe("capital gains", () => {
  it("applies the §121 exclusion: a sub-exclusion home gain owes no home tax", () => {
    // $200k gain, single ($250k exclusion) -> 0
    expect(homeSaleCapGainsTax(1_200_000, 1_000_000, 240_000, "single")).toBe(0);
    // $400k gain, single -> taxed on $150k
    expect(homeSaleCapGainsTax(1_400_000, 1_000_000, 240_000, "single")).toBeGreaterThan(0);
  });
  it("taxes embedded portfolio gains at liquidation", () => {
    expect(portfolioCapGainsTax(100_000, 100_000, 240_000, "single")).toBe(0); // no gain
    expect(portfolioCapGainsTax(200_000, 100_000, 240_000, "single")).toBeCloseTo(
      100_000 * capitalGainsRate(240_000, "single"), 6
    );
  });
});
