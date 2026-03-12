"use client";

import { useMemo } from "react";
import type { CalculatorInputs } from "@/lib/calculator/types";
import { computeResults } from "@/lib/calculator/engine";
import { SummaryCards } from "./summary-cards";
import { BreakevenBanner } from "./breakeven-banner";
import { WealthChart } from "./wealth-chart";
import { MonthlyCostChart } from "./monthly-cost-chart";
import { ScenarioComparisonChart } from "./scenario-comparison-chart";
import { ResultsTable } from "./results-table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SharedCalculatorViewProps {
  name: string;
  inputs: CalculatorInputs;
  authorName: string | null;
}

export function SharedCalculatorView({ name, inputs, authorName }: SharedCalculatorViewProps) {
  const results = useMemo(() => computeResults(inputs), [inputs]);

  return (
    <div className="max-w-5xl mx-auto p-4 lg:p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{name}</h1>
        {authorName && (
          <p className="text-sm text-muted-foreground">Shared by {authorName}</p>
        )}
      </div>

      <SummaryCards results={results} />
      <BreakevenBanner results={results} />

      <Tabs defaultValue="comparison">
        <TabsList>
          <TabsTrigger value="comparison">Scenario Comparison</TabsTrigger>
          <TabsTrigger value="table">Year-by-Year</TabsTrigger>
          <TabsTrigger value="cost-chart">Monthly Cost</TabsTrigger>
          <TabsTrigger value="wealth-chart">Wealth Over Time</TabsTrigger>
        </TabsList>

        <TabsContent value="comparison" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ScenarioComparisonChart results={results} yearIndex={9} title="Total Wealth at Year 10" />
            <ScenarioComparisonChart results={results} yearIndex={29} title="Total Wealth at Year 30" />
          </div>
        </TabsContent>

        <TabsContent value="table" className="mt-4">
          <ResultsTable results={results} />
        </TabsContent>

        <TabsContent value="cost-chart" className="mt-4">
          <MonthlyCostChart results={results} />
        </TabsContent>

        <TabsContent value="wealth-chart" className="mt-4">
          <WealthChart results={results} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
