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
  // Backward compat: migrate old single downPaymentPercent to per-price array.
  const legacy = inputs as CalculatorInputs & { downPaymentPercent?: number };
  const migratedInputs = { ...inputs };
  if (!migratedInputs.downPaymentPercents && legacy.downPaymentPercent != null) {
    const pct = legacy.downPaymentPercent;
    migratedInputs.downPaymentPercents = [pct, pct, pct];
  }
  const safeInputs = { ...DEFAULT_INPUTS, ...migratedInputs };
  const scenarios = buildScenarios(safeInputs);
  const yearSnapshots: YearSnapshot[] = [];

  const r = safeInputs.investmentReturnRate / 100;

  // --- Investment portfolios -------------------------------------------------
  // The renter keeps their FULL non-retirement savings invested (they never
  // spent a down payment). Each buyer starts with whatever is left after the
  // down payment + buyer closing costs. Each year, the buyer's portfolio is
  // credited (or debited) the difference between rent and that scenario's net
  // housing cost. This is the standard "invest the difference" model and makes
  // the renter's wealth a single, scenario-independent line — the buy-minus-rent
  // gap is identical to a correct pairwise comparison, but without the previous
  // version's bug of judging every scenario against scenario 0's rent surplus.
  let rentPortfolio = safeInputs.nonRetirementSavings;
  const buyPortfolios = scenarios.map((s) =>
    Math.max(
      0,
      safeInputs.nonRetirementSavings -
        s.downPayment -
        s.price * (safeInputs.buyerClosingPercent / 100)
    )
  );

  let rentCumulativeCost = 0;
  const buyCumulativeCosts = scenarios.map(() => 0);

  for (let year = 1; year <= 30; year++) {
    // --- Rent ---
    const monthlyRent =
      safeInputs.monthlyRent *
      Math.pow(1 + safeInputs.rentEscalationRate / 100, year - 1);
    const rentAnnualCost = monthlyRent * 12;
    rentCumulativeCost += rentAnnualCost;

    // Grow portfolios one year.
    rentPortfolio *= 1 + r;
    for (let i = 0; i < buyPortfolios.length; i++) buyPortfolios[i] *= 1 + r;

    // Retirement grows identically for both sides (informational only).
    const retirementBalance =
      safeInputs.retirementSavings * Math.pow(1 + r, year);

    const buySnapshots: BuyYearSnapshot[] = scenarios.map((scenario, i) => {
      const { price, term, loanAmount, monthlyPI } = scenario;

      const annualPropertyTax = calcPropertyTax(price, safeInputs.propertyTaxRate, year);
      const monthlyPropertyTax = annualPropertyTax / 12;
      const monthlyInsurance = safeInputs.annualInsurance / 12;
      const monthlyMaintenance = (price * (safeInputs.maintenancePercent / 100)) / 12;
      const monthlyHousingCost =
        monthlyPI + monthlyPropertyTax + monthlyInsurance + safeInputs.monthlyHoa + monthlyMaintenance;

      const yearInterest =
        year <= term ? interestPaidInYear(loanAmount, safeInputs.mortgageRate, term, year) : 0;
      const monthlyTaxBenefit = calcTotalTaxBenefit(
        yearInterest,
        annualPropertyTax,
        safeInputs.annualIncome,
        safeInputs.filingStatus,
        loanAmount
      );

      const netMonthlyCost = monthlyHousingCost - monthlyTaxBenefit;
      const annualCost = netMonthlyCost * 12;
      buyCumulativeCosts[i] += annualCost;

      // Signed cash-flow difference vs renting. Positive => buyer invests the
      // surplus; negative => the buyer's extra housing cost is drawn from their
      // portfolio. (The renter's single portfolio is unaffected; the gap is
      // identical to a pairwise model — see note above.)
      buyPortfolios[i] += rentAnnualCost - annualCost;

      const homeValue = price * Math.pow(1 + safeInputs.appreciationRate / 100, year);
      const monthsPaid = Math.min(year * 12, term * 12);
      const balance =
        year <= term
          ? remainingBalance(loanAmount, safeInputs.mortgageRate, term, monthsPaid)
          : 0;
      const equity = homeValue - Math.max(0, balance);
      const sellerClosing = homeValue * (safeInputs.sellerClosingPercent / 100);
      const netSaleProceeds = equity - sellerClosing;
      const nonRetirementPortfolio = buyPortfolios[i];

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

    const rent: RentYearSnapshot = {
      monthlyRent,
      annualCost: rentAnnualCost,
      cumulativeCost: rentCumulativeCost,
      investmentBalance: rentPortfolio,
      retirementBalance,
      totalWealth: rentPortfolio,
    };

    yearSnapshots.push({ year, rent, buy: buySnapshots });
  }

  const summaries: ScenarioSummary[] = scenarios.map((scenario, i) => {
    let breakevenYear: number | null = null;
    for (let y = 1; y <= 30; y++) {
      const rentWealth = yearSnapshots[y - 1].rent.totalWealth;
      const buyWealth = yearSnapshots[y - 1].buy[i].totalWealth;
      if (breakevenYear === null && buyWealth > rentWealth) {
        breakevenYear = y;
        break;
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

  return {
    scenarios,
    yearSnapshots,
    rentYear1Monthly: safeInputs.monthlyRent,
    rentWealth10yr: yearSnapshots[9].rent.totalWealth,
    rentWealth30yr: yearSnapshots[29].rent.totalWealth,
    summaries,
  };
}
