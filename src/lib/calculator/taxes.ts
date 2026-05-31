import type { FilingStatus } from "./types";
import {
  getMarginalRate,
  calcTaxOwed,
  FEDERAL_STANDARD_DEDUCTION,
  CA_STANDARD_DEDUCTION,
  SALT_CAP,
  SALT_PHASEOUT_THRESHOLD,
  SALT_PHASEOUT_RATE,
  SALT_FLOOR,
  MORTGAGE_INTEREST_DEBT_CAP,
  federalLtcgRate,
  NIIT_RATE,
  NIIT_THRESHOLD,
  PRIMARY_RESIDENCE_EXCLUSION,
} from "./tax-brackets";

/** Prop 13: assessed value grows max 2%/year from the purchase price. */
export function calcPropertyTax(
  purchasePrice: number,
  taxRate: number,
  year: number
): number {
  const assessedValue = purchasePrice * Math.pow(1.02, year - 1);
  return assessedValue * (taxRate / 100);
}

/** Deductible mortgage interest, limited to interest on the first $750k of
 *  acquisition debt. Approximates with the original loan amount. */
export function deductibleInterest(yearInterest: number, loanAmount: number): number {
  if (loanAmount <= 0) return 0;
  const fraction = Math.min(1, MORTGAGE_INTEREST_DEBT_CAP / loanAmount);
  return yearInterest * fraction;
}

/** SALT cap after the OBBBA high-income phase-down. Uses income as a MAGI proxy. */
export function saltCap(magi: number): number {
  const reduced = SALT_CAP - SALT_PHASEOUT_RATE * Math.max(0, magi - SALT_PHASEOUT_THRESHOLD);
  return Math.max(SALT_FLOOR, reduced);
}

/**
 * Federal tax benefit attributable to BUYING — i.e. the incremental tax saved
 * versus renting. We compare itemized-with-housing against the better of
 * (itemized-without-housing, standard deduction). For a high earner whose state
 * income tax already exceeds the standard deduction, this yields ~full marginal
 * rate on the housing deductions instead of letting the standard deduction
 * swallow them (the previous version's bias).
 *
 * `interest` is the (already capped) deductible mortgage interest.
 */
export function calcFederalTaxBenefit(
  interest: number,
  propertyTax: number,
  income: number,
  filingStatus: FilingStatus
): number {
  const cap = saltCap(income);
  const stateIncomeTax = calcTaxOwed(income, filingStatus, "ca");

  // Renter baseline: SALT = state income tax only (no property tax), capped.
  const saltWithout = Math.min(stateIncomeTax, cap);
  // Owner: SALT = state income tax + property tax, capped.
  const saltWith = Math.min(stateIncomeTax + propertyTax, cap);

  const std = FEDERAL_STANDARD_DEDUCTION[filingStatus];
  const itemizedWith = interest + saltWith;
  const itemizedWithout = saltWithout;

  const deductibleDelta =
    Math.max(itemizedWith, std) - Math.max(itemizedWithout, std);
  const marginalRate = getMarginalRate(income, filingStatus, "federal");
  return Math.max(0, deductibleDelta) * marginalRate;
}

/**
 * CA state tax benefit from buying. California does NOT conform to the federal
 * SALT cap and allows mortgage interest + property tax as itemized deductions
 * (it does not allow deducting CA income tax on the CA return). Renter's CA
 * itemized deductions from housing are zero, so we compare against the CA
 * standard deduction.
 */
export function calcStateTaxBenefit(
  interest: number,
  propertyTax: number,
  income: number,
  filingStatus: FilingStatus
): number {
  const std = CA_STANDARD_DEDUCTION[filingStatus];
  const itemizedWith = interest + propertyTax;
  const deductibleDelta = Math.max(itemizedWith, std) - std;
  const marginalRate = getMarginalRate(income, filingStatus, "ca");
  return Math.max(0, deductibleDelta) * marginalRate;
}

/** Total annual tax benefit of buying (federal + CA), returned as MONTHLY $. */
export function calcTotalTaxBenefit(
  yearInterest: number,
  propertyTax: number,
  income: number,
  filingStatus: FilingStatus,
  loanAmount: number
): number {
  const interest = deductibleInterest(yearInterest, loanAmount);
  const federal = calcFederalTaxBenefit(interest, propertyTax, income, filingStatus);
  const state = calcStateTaxBenefit(interest, propertyTax, income, filingStatus);
  return (federal + state) / 12;
}

// --- Capital gains at liquidation -----------------------------------------

/**
 * Combined long-term capital gains rate: federal LTCG (0/15/20) + NIIT (3.8%
 * over the MAGI threshold) + CA (which taxes gains as ordinary income, so we
 * reuse the CA marginal rate). Income is used as a MAGI/taxable-income proxy.
 */
export function capitalGainsRate(income: number, filingStatus: FilingStatus): number {
  const federal = federalLtcgRate(income, filingStatus);
  const niit = income > NIIT_THRESHOLD[filingStatus] ? NIIT_RATE : 0;
  const ca = getMarginalRate(income, filingStatus, "ca");
  return federal + niit + ca;
}

/** Tax on liquidating an investment portfolio (value vs cost basis). */
export function portfolioCapGainsTax(
  value: number,
  basis: number,
  income: number,
  filingStatus: FilingStatus
): number {
  return Math.max(0, value - basis) * capitalGainsRate(income, filingStatus);
}

/**
 * Tax on selling the primary residence. `amountRealized` is the sale price net
 * of selling costs; `basis` is purchase price + acquisition costs. The §121
 * exclusion shields the first $250k single / $500k MFJ of gain.
 */
export function homeSaleCapGainsTax(
  amountRealized: number,
  basis: number,
  income: number,
  filingStatus: FilingStatus
): number {
  const gain = Math.max(0, amountRealized - basis);
  const taxable = Math.max(0, gain - PRIMARY_RESIDENCE_EXCLUSION[filingStatus]);
  return taxable * capitalGainsRate(income, filingStatus);
}
