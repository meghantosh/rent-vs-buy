import { interpolateLab } from "d3-interpolate";

export function interpolateColors(start: string, end: string, count: number): string[] {
  const interpolator = interpolateLab(start, end);
  return Array.from({ length: count }, (_, i) => {
    const color = interpolator(i / (count - 1));
    return rgbToHex(color);
  });
}

function rgbToHex(rgb: string): string {
  const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!match) return rgb;
  const [, r, g, b] = match;
  return (
    "#" +
    [r, g, b]
      .map((c) =>
        Math.max(0, Math.min(255, Math.round(Number(c))))
          .toString(16)
          .padStart(2, "0")
      )
      .join("")
  );
}

export function isValidHex(value: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(value);
}

export const DEFAULT_PALETTES: [string, string][] = [
  ["#9C5454", "#F1C878"],
  ["#9C5454", "#D79CEA"],
  ["#9C5454", "#6B8D5F"],
  ["#9C5454", "#FF8E6F"],
  ["#9C5454", "#F95F53"],
  ["#6B8D5F", "#D6E65A"],
  ["#D79CEA", "#FF8E6F"],
  ["#F5ED68", "#3A0E00"],
  ["#F5ED68", "#FF9839"],
  ["#F5ED68", "#F1B9FD"],
];

const STORAGE_KEY = "palette-visualizer-colors";

export function loadPalettes(): [string, string][] {
  if (typeof window === "undefined") return DEFAULT_PALETTES.map(([s, e]) => [s, e]);
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length === DEFAULT_PALETTES.length) {
        return parsed;
      }
    }
  } catch {}
  return DEFAULT_PALETTES.map(([s, e]) => [s, e]);
}

export function savePalettes(palettes: [string, string][]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(palettes));
  } catch {}
}
