import type { CalculatorInputs } from "./types";

export const DEFAULT_INPUTS: CalculatorInputs = {
  annualIncome: 240000,
  monthlyRent: 4900,
  housePrices: [1000000, 1100000, 1300000],
  downPaymentPercents: [50, 45, 39],
  mortgageRate: 5,
  monthlyHoa: 0,
  propertyTaxRate: 1.1,
  annualInsurance: 1800,
  maintenancePercent: 1,
  appreciationRate: 4,
  investmentReturnRate: 5,
  rentEscalationRate: 1,
  buyerClosingPercent: 2,
  sellerClosingPercent: 5,
  filingStatus: "single",
  nonRetirementSavings: 750000,
  retirementSavings: 750000,
};
