export type FilingStatus = "single" | "mfj";

export interface CalculatorInputs {
  annualIncome: number;
  monthlyRent: number;
  housePrices: [number, number, number];
  downPaymentPercent: number;
  mortgageRate: number;
  monthlyHoa: number;
  propertyTaxRate: number;
  annualInsurance: number;
  maintenancePercent: number;
  appreciationRate: number;
  investmentReturnRate: number;
  rentEscalationRate: number;
  buyerClosingPercent: number;
  sellerClosingPercent: number;
  filingStatus: FilingStatus;
  nonRetirementSavings: number;
  retirementSavings: number;
}

export interface BuyScenario {
  label: string;
  price: number;
  term: 15 | 30;
  downPayment: number;
  loanAmount: number;
  monthlyPI: number;
}

export interface RentYearSnapshot {
  monthlyRent: number;
  annualCost: number;
  cumulativeCost: number;
  investmentBalance: number;
  retirementBalance: number;
  totalWealth: number;
}

export interface BuyYearSnapshot {
  monthlyHousingCost: number;
  monthlyTaxBenefit: number;
  netMonthlyCost: number;
  annualCost: number;
  cumulativeCost: number;
  homeValue: number;
  remainingBalance: number;
  equity: number;
  netSaleProceeds: number;
  nonRetirementPortfolio: number;
  retirementBalance: number;
  totalWealth: number;
}

export interface YearSnapshot {
  year: number;
  rent: RentYearSnapshot;
  buy: BuyYearSnapshot[];
}

export interface ScenarioSummary {
  scenario: BuyScenario;
  year1MonthlyCost: number;
  breakevenYear: number | null;
  wealth10yr: number;
  wealth30yr: number;
}

export interface CalculatorResults {
  scenarios: BuyScenario[];
  yearSnapshots: YearSnapshot[];
  rentYear1Monthly: number;
  rentWealth10yr: number;
  rentWealth30yr: number;
  summaries: ScenarioSummary[];
}
