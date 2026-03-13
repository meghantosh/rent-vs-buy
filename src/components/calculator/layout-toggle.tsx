"use client";

import { Button } from "@/components/ui/button";

export type LayoutVariant = "sticky-bar" | "nav" | "results-module" | "floating";

const LABELS: Record<LayoutVariant, string> = {
  "sticky-bar": "A: Sticky Bar",
  "nav": "B: Nav",
  "results-module": "C: Module",
  "floating": "D: Floating",
};

const VARIANTS: LayoutVariant[] = ["sticky-bar", "nav", "results-module", "floating"];

interface LayoutToggleProps {
  current: LayoutVariant;
  onChange: (variant: LayoutVariant) => void;
}

export function LayoutToggle({ current, onChange }: LayoutToggleProps) {
  if (process.env.NODE_ENV !== "development") return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex gap-1 rounded-lg border border-border bg-background/95 p-1 shadow-lg backdrop-blur">
      {VARIANTS.map((v) => (
        <Button
          key={v}
          size="xs"
          variant={v === current ? "default" : "ghost"}
          onClick={() => onChange(v)}
        >
          {LABELS[v]}
        </Button>
      ))}
    </div>
  );
}
