import type { FilingStatus } from "./types";

interface Bracket {
  min: number;
  max: number;
  rate: number;
}

// Federal 2024 brackets
const FEDERAL_SINGLE: Bracket[] = [
  { min: 0, max: 11600, rate: 0.10 },
  { min: 11600, max: 47150, rate: 0.12 },
  { min: 47150, max: 100525, rate: 0.22 },
  { min: 100525, max: 191950, rate: 0.24 },
  { min: 191950, max: 243725, rate: 0.32 },
  { min: 243725, max: 609350, rate: 0.35 },
  { min: 609350, max: Infinity, rate: 0.37 },
];

const FEDERAL_MFJ: Bracket[] = [
  { min: 0, max: 23200, rate: 0.10 },
  { min: 23200, max: 94300, rate: 0.12 },
  { min: 94300, max: 201050, rate: 0.22 },
  { min: 201050, max: 383900, rate: 0.24 },
  { min: 383900, max: 487450, rate: 0.32 },
  { min: 487450, max: 731200, rate: 0.35 },
  { min: 731200, max: Infinity, rate: 0.37 },
];

// CA 2024 brackets
const CA_SINGLE: Bracket[] = [
  { min: 0, max: 10412, rate: 0.01 },
  { min: 10412, max: 24684, rate: 0.02 },
  { min: 24684, max: 38959, rate: 0.04 },
  { min: 38959, max: 54081, rate: 0.06 },
  { min: 54081, max: 68350, rate: 0.08 },
  { min: 68350, max: 349137, rate: 0.093 },
  { min: 349137, max: 418961, rate: 0.103 },
  { min: 418961, max: 698271, rate: 0.113 },
  { min: 698271, max: 1000000, rate: 0.123 },
  { min: 1000000, max: Infinity, rate: 0.133 },
];

const CA_MFJ: Bracket[] = [
  { min: 0, max: 20824, rate: 0.01 },
  { min: 20824, max: 49368, rate: 0.02 },
  { min: 49368, max: 77918, rate: 0.04 },
  { min: 77918, max: 108162, rate: 0.06 },
  { min: 108162, max: 136700, rate: 0.08 },
  { min: 136700, max: 698274, rate: 0.093 },
  { min: 698274, max: 837922, rate: 0.103 },
  { min: 837922, max: 1396542, rate: 0.113 },
  { min: 1396542, max: 2000000, rate: 0.123 },
  { min: 2000000, max: Infinity, rate: 0.133 },
];

export const FEDERAL_STANDARD_DEDUCTION = { single: 14600, mfj: 29200 };
export const CA_STANDARD_DEDUCTION = { single: 5540, mfj: 11080 };

function getBrackets(
  jurisdiction: "federal" | "ca",
  filingStatus: FilingStatus
): Bracket[] {
  if (jurisdiction === "federal") {
    return filingStatus === "single" ? FEDERAL_SINGLE : FEDERAL_MFJ;
  }
  return filingStatus === "single" ? CA_SINGLE : CA_MFJ;
}

/** Get the marginal tax rate for a given income */
export function getMarginalRate(
  income: number,
  filingStatus: FilingStatus,
  jurisdiction: "federal" | "ca"
): number {
  const brackets = getBrackets(jurisdiction, filingStatus);
  for (let i = brackets.length - 1; i >= 0; i--) {
    if (income > brackets[i].min) {
      return brackets[i].rate;
    }
  }
  return brackets[0].rate;
}
