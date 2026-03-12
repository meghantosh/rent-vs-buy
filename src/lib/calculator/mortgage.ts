/** Standard amortization monthly payment */
export function monthlyPayment(
  principal: number,
  annualRate: number,
  years: number
): number {
  const r = annualRate / 100 / 12;
  if (r === 0) return principal / (years * 12);
  const n = years * 12;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

/** Remaining balance after monthsPaid payments */
export function remainingBalance(
  principal: number,
  annualRate: number,
  years: number,
  monthsPaid: number
): number {
  const r = annualRate / 100 / 12;
  if (r === 0) return principal - (principal / (years * 12)) * monthsPaid;
  const n = years * 12;
  const pmt = monthlyPayment(principal, annualRate, years);
  return principal * Math.pow(1 + r, monthsPaid) - pmt * ((Math.pow(1 + r, monthsPaid) - 1) / r);
}

/** Total interest paid during a specific year (1-indexed) */
export function interestPaidInYear(
  principal: number,
  annualRate: number,
  years: number,
  year: number
): number {
  const r = annualRate / 100 / 12;
  if (r === 0) return 0;
  const pmt = monthlyPayment(principal, annualRate, years);
  let totalInterest = 0;
  const startMonth = (year - 1) * 12;
  for (let m = startMonth; m < startMonth + 12; m++) {
    if (m >= years * 12) break;
    const bal = remainingBalance(principal, annualRate, years, m);
    const interestPortion = bal * r;
    totalInterest += interestPortion;
  }
  return totalInterest;
}
