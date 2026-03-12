import type {
  CalculatorInputs,
  BuyScenario,
  YearSnapshot,
  RentYearSnapshot,
  BuyYearSnapshot,
  ScenarioSummary,
  CalculatorResults,
} from "./types";
import { monthlyPayment, remainingBalance, interestPaidInYear } from "./mortgage";
import { calcPropertyTax, calcTotalTaxBenefit } from "./taxes";

function buildScenarios(inputs: CalculatorInputs): BuyScenario[] {
  const terms: (15 | 30)[] = [15, 30];
  const scenarios: BuyScenario[] = [];

  for (const price of inputs.housePrices) {
    for (const term of terms) {
      const downPayment = price * (inputs.downPaymentPercent / 100);
      const loanAmount = price - downPayment;
      const monthlyPI = monthlyPayment(loanAmount, inputs.mortgageRate, term);
      scenarios.push({
        label: `$${(price / 1000).toFixed(0)}K / ${term}yr`,
        price,
        term,
        downPayment,
        loanAmount,
        monthlyPI,
      });
    }
  }

  return scenarios;
}

export function computeResults(inputs: CalculatorInputs): CalculatorResults {
  const scenarios = buildScenarios(inputs);
  const yearSnapshots: YearSnapshot[] = [];

  // Track cumulative state
  let rentCumulativeCost = 0;
  // Renter invests the down payment + closing costs they didn't spend
  const rentInvestmentBases = scenarios.map(
    (s) => s.downPayment + s.price * (inputs.buyerClosingPercent / 100)
  );
  const rentInvestmentBalances = [...rentInvestmentBases];
  const buyCumulativeCosts = scenarios.map(() => 0);

  for (let year = 1; year <= 30; year++) {
    // --- Rent ---
    const monthlyRent = inputs.monthlyRent * Math.pow(1 + inputs.rentEscalationRate / 100, year - 1);
    const rentAnnualCost = monthlyRent * 12;
    rentCumulativeCost += rentAnnualCost;

    // Grow each renter investment balance and add monthly savings
    for (let i = 0; i < scenarios.length; i++) {
      rentInvestmentBalances[i] *= 1 + inputs.investmentReturnRate / 100;
    }

    const rent: RentYearSnapshot = {
      monthlyRent,
      annualCost: rentAnnualCost,
      cumulativeCost: rentCumulativeCost,
      investmentBalance: rentInvestmentBalances[0], // Use first scenario's for display
      totalWealth: rentInvestmentBalances[0],
    };

    // --- Buy scenarios ---
    const buySnapshots: BuyYearSnapshot[] = scenarios.map((scenario, i) => {
      const { price, term, loanAmount, monthlyPI } = scenario;

      // Property tax with Prop 13
      const annualPropertyTax = calcPropertyTax(price, inputs.propertyTaxRate, year);
      const monthlyPropertyTax = annualPropertyTax / 12;

      // Monthly costs
      const monthlyInsurance = inputs.annualInsurance / 12;
      const monthlyMaintenance = (price * (inputs.maintenancePercent / 100)) / 12;
      const monthlyHousingCost = monthlyPI + monthlyPropertyTax + monthlyInsurance + inputs.monthlyHoa + monthlyMaintenance;

      // Tax benefit
      const yearInterest = year <= term ? interestPaidInYear(loanAmount, inputs.mortgageRate, term, year) : 0;
      const monthlyTaxBenefit = calcTotalTaxBenefit(
        yearInterest,
        annualPropertyTax,
        inputs.annualIncome,
        inputs.filingStatus
      );

      const netMonthlyCost = monthlyHousingCost - monthlyTaxBenefit;
      const annualCost = netMonthlyCost * 12;
      buyCumulativeCosts[i] += annualCost;

      // Home value and equity
      const homeValue = price * Math.pow(1 + inputs.appreciationRate / 100, year);
      const monthsPaid = Math.min(year * 12, term * 12);
      const balance = year <= term
        ? remainingBalance(loanAmount, inputs.mortgageRate, term, monthsPaid)
        : 0;
      const equity = homeValue - Math.max(0, balance);
      const sellerClosing = homeValue * (inputs.sellerClosingPercent / 100);
      const netSaleProceeds = equity - sellerClosing;

      return {
        monthlyHousingCost,
        monthlyTaxBenefit,
        netMonthlyCost,
        annualCost,
        cumulativeCost: buyCumulativeCosts[i],
        homeValue,
        remainingBalance: Math.max(0, balance),
        equity,
        netSaleProceeds,
        totalWealth: netSaleProceeds,
      };
    });

    yearSnapshots.push({ year, rent, buy: buySnapshots });
  }

  // Compute per-scenario rent wealth using scenario-specific investment balances
  // and determine breakeven years
  const summaries: ScenarioSummary[] = scenarios.map((scenario, i) => {
    let breakevenYear: number | null = null;
    let investBal = rentInvestmentBases[i];
    for (let y = 1; y <= 30; y++) {
      investBal *= 1 + inputs.investmentReturnRate / 100;
      const buyWealth = yearSnapshots[y - 1].buy[i].totalWealth;
      if (breakevenYear === null && buyWealth > investBal) {
        breakevenYear = y;
      }
    }

    return {
      scenario,
      year1MonthlyCost: yearSnapshots[0].buy[i].netMonthlyCost,
      breakevenYear,
      wealth10yr: yearSnapshots[9].buy[i].totalWealth,
      wealth30yr: yearSnapshots[29].buy[i].totalWealth,
    };
  });

  // Recalculate rent wealth at 10yr and 30yr using first scenario's investment base
  let rentInvBal10 = rentInvestmentBases[0];
  let rentInvBal30 = rentInvestmentBases[0];
  for (let y = 1; y <= 30; y++) {
    if (y <= 10) {
      rentInvBal10 = rentInvestmentBases[0] * Math.pow(1 + inputs.investmentReturnRate / 100, y);
    }
    rentInvBal30 = rentInvestmentBases[0] * Math.pow(1 + inputs.investmentReturnRate / 100, y);
  }

  return {
    scenarios,
    yearSnapshots,
    rentYear1Monthly: inputs.monthlyRent,
    rentWealth10yr: rentInvBal10,
    rentWealth30yr: rentInvBal30,
    summaries,
  };
}
