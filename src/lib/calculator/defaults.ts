import type { CalculatorInputs } from "./types";

export const DEFAULT_INPUTS: CalculatorInputs = {
  annualIncome: 150000,
  monthlyRent: 3000,
  housePrices: [750000, 1000000, 1250000],
  downPaymentPercent: 20,
  mortgageRate: 6.5,
  monthlyHoa: 400,
  propertyTaxRate: 1.1,
  annualInsurance: 1800,
  maintenancePercent: 1,
  appreciationRate: 4,
  investmentReturnRate: 7,
  rentEscalationRate: 3,
  buyerClosingPercent: 2,
  sellerClosingPercent: 5,
  filingStatus: "single",
  nonRetirementSavings: 0,
  retirementSavings: 0,
};
