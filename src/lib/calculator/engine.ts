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
import { DEFAULT_INPUTS } from "./defaults";
import { fmtPrice } from "./format";

function buildScenarios(inputs: CalculatorInputs): BuyScenario[] {
  const terms: (15 | 30)[] = [15, 30];
  const scenarios: BuyScenario[] = [];

  for (let pi = 0; pi < inputs.housePrices.length; pi++) {
    const price = inputs.housePrices[pi];
    for (const term of terms) {
      const downPayment = price * (inputs.downPaymentPercents[pi] / 100);
      const loanAmount = price - downPayment;
      const monthlyPI = monthlyPayment(loanAmount, inputs.mortgageRate, term);
      scenarios.push({
        label: `${fmtPrice(price)} / ${term}yr`,
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
  // Backward compat: old saved calculations missing new fields get defaults
  // Migrate old single downPaymentPercent to per-price array
  const legacy = inputs as CalculatorInputs & { downPaymentPercent?: number };
  const migratedInputs = { ...inputs };
  if (!migratedInputs.downPaymentPercents && legacy.downPaymentPercent != null) {
    const pct = legacy.downPaymentPercent;
    migratedInputs.downPaymentPercents = [pct, pct, pct];
  }
  const safeInputs = { ...DEFAULT_INPUTS, ...migratedInputs };
  const scenarios = buildScenarios(safeInputs);
  const yearSnapshots: YearSnapshot[] = [];

  // Track cumulative state
  let rentCumulativeCost = 0;
  // Renter keeps all savings plus what they didn't spend on buying
  const rentInvestmentBases = scenarios.map(
    (s) => safeInputs.nonRetirementSavings + s.downPayment + s.price * (safeInputs.buyerClosingPercent / 100)
  );
  const rentInvestmentBalances = [...rentInvestmentBases];
  // Buyer's remaining non-retirement portfolio after down payment + closing costs
  const buyInvestmentBalances = scenarios.map(
    (s) => Math.max(0, safeInputs.nonRetirementSavings - s.downPayment - s.price * (safeInputs.buyerClosingPercent / 100))
  );
  const buyCumulativeCosts = scenarios.map(() => 0);

  for (let year = 1; year <= 30; year++) {
    // --- Rent ---
    const monthlyRent = safeInputs.monthlyRent * Math.pow(1 + safeInputs.rentEscalationRate / 100, year - 1);
    const rentAnnualCost = monthlyRent * 12;
    rentCumulativeCost += rentAnnualCost;

    // Grow each renter investment balance
    for (let i = 0; i < scenarios.length; i++) {
      rentInvestmentBalances[i] *= 1 + safeInputs.investmentReturnRate / 100;
    }

    // Grow buyer investment balances
    for (let i = 0; i < scenarios.length; i++) {
      buyInvestmentBalances[i] *= 1 + safeInputs.investmentReturnRate / 100;
    }

    // Retirement grows identically for both sides
    const retirementBalance = safeInputs.retirementSavings * Math.pow(1 + safeInputs.investmentReturnRate / 100, year);

    const rent: RentYearSnapshot = {
      monthlyRent,
      annualCost: rentAnnualCost,
      cumulativeCost: rentCumulativeCost,
      investmentBalance: rentInvestmentBalances[0], // Use first scenario's for display
      retirementBalance,
      totalWealth: rentInvestmentBalances[0],
    };

    // --- Buy scenarios ---
    const buySnapshots: BuyYearSnapshot[] = scenarios.map((scenario, i) => {
      const { price, term, loanAmount, monthlyPI } = scenario;

      // Property tax with Prop 13
      const annualPropertyTax = calcPropertyTax(price, safeInputs.propertyTaxRate, year);
      const monthlyPropertyTax = annualPropertyTax / 12;

      // Monthly costs
      const monthlyInsurance = safeInputs.annualInsurance / 12;
      const monthlyMaintenance = (price * (safeInputs.maintenancePercent / 100)) / 12;
      const monthlyHousingCost = monthlyPI + monthlyPropertyTax + monthlyInsurance + safeInputs.monthlyHoa + monthlyMaintenance;

      // Tax benefit
      const yearInterest = year <= term ? interestPaidInYear(loanAmount, safeInputs.mortgageRate, term, year) : 0;
      const monthlyTaxBenefit = calcTotalTaxBenefit(
        yearInterest,
        annualPropertyTax,
        safeInputs.annualIncome,
        safeInputs.filingStatus
      );

      const netMonthlyCost = monthlyHousingCost - monthlyTaxBenefit;
      const annualCost = netMonthlyCost * 12;
      buyCumulativeCosts[i] += annualCost;

      // Home value and equity
      const homeValue = price * Math.pow(1 + safeInputs.appreciationRate / 100, year);
      const monthsPaid = Math.min(year * 12, term * 12);
      const balance = year <= term
        ? remainingBalance(loanAmount, safeInputs.mortgageRate, term, monthsPaid)
        : 0;
      const equity = homeValue - Math.max(0, balance);
      const sellerClosing = homeValue * (safeInputs.sellerClosingPercent / 100);
      const netSaleProceeds = equity - sellerClosing;
      const nonRetirementPortfolio = buyInvestmentBalances[i];

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
        nonRetirementPortfolio,
        retirementBalance,
        totalWealth: netSaleProceeds + nonRetirementPortfolio,
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
      investBal *= 1 + safeInputs.investmentReturnRate / 100;
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
      rentInvBal10 = rentInvestmentBases[0] * Math.pow(1 + safeInputs.investmentReturnRate / 100, y);
    }
    rentInvBal30 = rentInvestmentBases[0] * Math.pow(1 + safeInputs.investmentReturnRate / 100, y);
  }

  return {
    scenarios,
    yearSnapshots,
    rentYear1Monthly: safeInputs.monthlyRent,
    rentWealth10yr: rentInvBal10,
    rentWealth30yr: rentInvBal30,
    summaries,
  };
}
