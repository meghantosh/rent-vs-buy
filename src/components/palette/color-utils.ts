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
  ["#f5ed68", "#f95f53"],
  ["#6366f1", "#ec4899"],
  ["#10b981", "#3b82f6"],
  ["#f59e0b", "#7c3aed"],
  ["#06b6d4", "#f43e5e"],
  ["#8b5cf6", "#f97316"],
  ["#14b8a6", "#e11d48"],
  ["#facc15", "#2563eb"],
  ["#a855f7", "#22c55e"],
  ["#fb923c", "#6366f1"],
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
