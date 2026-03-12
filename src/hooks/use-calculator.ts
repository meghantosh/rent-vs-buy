"use client";

import { useState, useMemo } from "react";
import type { CalculatorInputs } from "@/lib/calculator/types";
import { DEFAULT_INPUTS } from "@/lib/calculator/defaults";
import { computeResults } from "@/lib/calculator/engine";

export function useCalculator() {
  const [inputs, setInputs] = useState<CalculatorInputs>(DEFAULT_INPUTS);
  const results = useMemo(() => computeResults(inputs), [inputs]);
  return { inputs, setInputs, results };
}
