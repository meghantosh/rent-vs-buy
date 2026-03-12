import type { FilingStatus } from "./types";
import {
  getMarginalRate,
  FEDERAL_STANDARD_DEDUCTION,
  CA_STANDARD_DEDUCTION,
} from "./tax-brackets";

/** Prop 13: assessed value grows max 2%/year from purchase price */
export function calcPropertyTax(
  purchasePrice: number,
  taxRate: number,
  year: number
): number {
  const assessedValue = purchasePrice * Math.pow(1.02, year - 1);
  return assessedValue * (taxRate / 100);
}

/**
 * Federal tax benefit from mortgage interest + property tax deductions.
 * SALT cap: property tax deduction capped at $10K.
 * Benefit = max(0, itemized - standardDeduction) * marginalRate
 */
export function calcFederalTaxBenefit(
  mortgageInterest: number,
  propertyTax: number,
  income: number,
  filingStatus: FilingStatus
): number {
  const saltDeduction = Math.min(propertyTax, 10000);
  const itemizedDeductions = mortgageInterest + saltDeduction;
  const standardDeduction = FEDERAL_STANDARD_DEDUCTION[filingStatus];
  const excessItemized = Math.max(0, itemizedDeductions - standardDeduction);
  const marginalRate = getMarginalRate(income, filingStatus, "federal");
  return excessItemized * marginalRate;
}

/**
 * CA state tax benefit. CA has no SALT cap on property tax deduction.
 * Benefit = max(0, itemized - standardDeduction) * marginalRate
 */
export function calcStateTaxBenefit(
  mortgageInterest: number,
  propertyTax: number,
  income: number,
  filingStatus: FilingStatus
): number {
  const itemizedDeductions = mortgageInterest + propertyTax;
  const standardDeduction = CA_STANDARD_DEDUCTION[filingStatus];
  const excessItemized = Math.max(0, itemizedDeductions - standardDeduction);
  const marginalRate = getMarginalRate(income, filingStatus, "ca");
  return excessItemized * marginalRate;
}

/** Total annual tax benefit (federal + CA), returned as monthly dollar savings */
export function calcTotalTaxBenefit(
  mortgageInterest: number,
  propertyTax: number,
  income: number,
  filingStatus: FilingStatus
): number {
  const federal = calcFederalTaxBenefit(mortgageInterest, propertyTax, income, filingStatus);
  const state = calcStateTaxBenefit(mortgageInterest, propertyTax, income, filingStatus);
  return (federal + state) / 12;
}
