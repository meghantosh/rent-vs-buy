"use client";

import { useState, useMemo, useCallback } from "react";
import type { CalculatorInputs } from "@/lib/calculator/types";
import { DEFAULT_INPUTS } from "@/lib/calculator/defaults";
import { computeResults } from "@/lib/calculator/engine";

function migrateInputs(raw?: CalculatorInputs): CalculatorInputs {
  if (!raw) return DEFAULT_INPUTS;
  const legacy = raw as CalculatorInputs & { downPaymentPercent?: number };
  const migrated = { ...DEFAULT_INPUTS, ...raw };
  if (!raw.downPaymentPercents && legacy.downPaymentPercent != null) {
    const pct = legacy.downPaymentPercent;
    migrated.downPaymentPercents = [pct, pct, pct];
  }
  return migrated;
}

export function useCalculator(initialInputs?: CalculatorInputs, initialId?: string, initialName?: string) {
  const [inputs, setInputs] = useState<CalculatorInputs>(() => migrateInputs(initialInputs));
  const [savedId, setSavedId] = useState<string | null>(initialId ?? null);
  const [savedName, setSavedName] = useState<string>(initialName ?? "");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const results = useMemo(() => computeResults(inputs), [inputs]);

  const updateInputs = useCallback((newInputs: CalculatorInputs) => {
    setInputs(newInputs);
    setDirty(true);
  }, []);

  const save = useCallback(async (name: string) => {
    setSaving(true);
    try {
      if (savedId) {
        const res = await fetch(`/api/calculations/${savedId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, inputs }),
        });
        if (!res.ok) throw new Error("Failed to save");
        setSavedName(name);
        setDirty(false);
      } else {
        const res = await fetch("/api/calculations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, inputs }),
        });
        if (!res.ok) throw new Error("Failed to save");
        const data = await res.json();
        setSavedId(data.id);
        setSavedName(name);
        setDirty(false);
        // Update URL without full navigation
        window.history.replaceState(null, "", `/dashboard?calc=${data.id}`);
      }
    } finally {
      setSaving(false);
    }
  }, [savedId, inputs]);

  return { inputs, setInputs: updateInputs, results, savedId, savedName, saving, dirty, save };
}
