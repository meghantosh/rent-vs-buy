/**
 * Chart color palette — canonical values live in globals.css as --chart-* vars.
 * This file exists for contexts that can't read CSS variables (e.g. OG image generation).
 * Keep in sync with globals.css.
 */
export const RENT_COLOR = "#E2EBF2";
export const BUY_COLORS = [
  "#f5ed68",
  "#f6d164",
  "#f7b460",
  "#f7985b",
  "#f87b57",
  "#f95f53",
];

export function colorFor(i: number): string {
  return i === 0 ? RENT_COLOR : BUY_COLORS[(i - 1) % BUY_COLORS.length];
}
