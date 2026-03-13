/** Format a price as $500K or $1.3M depending on magnitude */
export function fmtPrice(n: number): string {
  if (n >= 1000000) {
    const m = n / 1000000;
    return `$${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}M`;
  }
  return `$${(n / 1000).toFixed(0)}K`;
}
