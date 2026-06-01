import type { CalculatorInputs } from "./types";

export const DEFAULT_INPUTS: CalculatorInputs = {
  annualIncome: 240000,
  monthlyRent: 4900,
  housePrices: [1000000, 1100000, 1300000],
  downPaymentPercents: [50, 45, 39],
  mortgageRate: 6.5,        // was 5 — aligned to current ~30yr fixed
  monthlyHoa: 0,
  propertyTaxRate: 1.1,
  annualInsurance: 1800,
  maintenancePercent: 1,
  appreciationRate: 4,
  investmentReturnRate: 5,
  rentEscalationRate: 3,    // was 1 — closer to long-run rent growth
  buyerClosingPercent: 2,
  sellerClosingPercent: 5,
  filingStatus: "single",
  nonRetirementSavings: 600000,
  retirementSavings: 855000,
};
