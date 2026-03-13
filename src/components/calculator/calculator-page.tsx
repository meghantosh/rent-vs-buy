"use client";

import { useState } from "react";
import type { CalculatorInputs } from "@/lib/calculator/types";
import { useCalculator } from "@/hooks/use-calculator";
import { InputForm } from "./input-form";
import { SummaryCards } from "./summary-cards";
import { BreakevenBanner } from "./breakeven-banner";
import { WealthChart } from "./wealth-chart";
import { MonthlyCostChart } from "./monthly-cost-chart";
import { ScenarioComparisonChart } from "./scenario-comparison-chart";
import { ResultsTable } from "./results-table";
import { ActionBar } from "./action-bar";
import { LayoutToggle, type LayoutVariant } from "./layout-toggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CalculatorPageProps {
  initialInputs?: CalculatorInputs;
  initialId?: string;
  initialName?: string;
}

export function CalculatorPage({ initialInputs, initialId, initialName }: CalculatorPageProps) {
  const { inputs, setInputs, results, savedId, savedName, saving, dirty, save } = useCalculator(
    initialInputs,
    initialId,
    initialName
  );
  const [layout, setLayout] = useState<LayoutVariant>("sticky-bar");

  const actionBarProps = { savedId, savedName, saving, dirty, onSave: save };

  const sidebar = (
    <aside className="w-full lg:w-[380px] shrink-0">
      <div className="sticky top-20 space-y-4 max-h-[calc(100vh-6rem)] overflow-y-auto pr-2">
        {/* Only show actions in sidebar for non-variant layouts (none currently) */}
        <h2 className="text-lg font-bold">Assumptions</h2>
        <InputForm inputs={inputs} onChange={setInputs} />
      </div>
    </aside>
  );

  const resultsContent = (
    <>
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
    </>
  );

  return (
    <>
      {/* Variant A: Sticky bar below header */}
      {layout === "sticky-bar" && (
        <>
          <div className="sticky top-16 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex items-center justify-between gap-4 px-4 py-2 lg:px-6">
              <div className="flex items-center gap-3">
                <h1 className="text-lg font-bold">Rent vs. Buy Comparison</h1>
                {savedId && savedName && (
                  <span className="text-sm text-muted-foreground truncate max-w-[200px] hidden sm:inline">
                    — {savedName}{dirty && <span className="text-amber-500 ml-1">*</span>}
                  </span>
                )}
              </div>
              <ActionBar {...actionBarProps} className="flex items-center gap-1" />
            </div>
          </div>
          <div className="flex flex-col lg:flex-row gap-6 p-4 lg:p-6">
            {sidebar}
            <main className="flex-1 min-w-0 space-y-6">
              {resultsContent}
            </main>
          </div>
        </>
      )}

      {/* Variant B: Actions in the nav area (simulated with a top bar that extends the header) */}
      {layout === "nav" && (
        <>
          <div className="sticky top-16 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex items-center gap-4 px-4 py-1.5 lg:px-6">
              <nav className="flex items-center gap-2 text-sm">
                <span className="font-medium text-muted-foreground">Dashboard</span>
                <span className="text-muted-foreground">/</span>
                {savedId && savedName ? (
                  <span className="font-medium truncate max-w-[200px]">
                    {savedName}{dirty && <span className="text-amber-500 ml-1">*</span>}
                  </span>
                ) : (
                  <span className="font-medium">New Calculation</span>
                )}
              </nav>
              <div className="ml-auto">
                <ActionBar {...actionBarProps} className="flex items-center gap-1" />
              </div>
            </div>
          </div>
          <div className="flex flex-col lg:flex-row gap-6 p-4 lg:p-6">
            {sidebar}
            <main className="flex-1 min-w-0 space-y-6">
              <h1 className="text-2xl font-bold">Rent vs. Buy Comparison</h1>
              {resultsContent}
            </main>
          </div>
        </>
      )}

      {/* Variant C: Actions in a module with the results header */}
      {layout === "results-module" && (
        <div className="flex flex-col lg:flex-row gap-6 p-4 lg:p-6">
          {sidebar}
          <main className="flex-1 min-w-0 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
              <div>
                <h1 className="text-2xl font-bold">Rent vs. Buy Comparison</h1>
                {savedId && savedName && (
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {savedName}{dirty && <span className="text-amber-500 ml-1">*</span>}
                  </p>
                )}
              </div>
              <ActionBar {...actionBarProps} className="flex items-center gap-1" />
            </div>
            {resultsContent}
          </main>
        </div>
      )}

      {/* Variant D: Floating action buttons */}
      {layout === "floating" && (
        <>
          <div className="flex flex-col lg:flex-row gap-6 p-4 lg:p-6">
            {sidebar}
            <main className="flex-1 min-w-0 space-y-6">
              <h1 className="text-2xl font-bold">Rent vs. Buy Comparison</h1>
              {resultsContent}
            </main>
          </div>
          <div className="fixed top-20 right-4 z-40 flex flex-col gap-1.5 rounded-lg border border-border bg-background/95 p-2 shadow-lg backdrop-blur">
            {savedId && savedName && (
              <span className="text-xs text-muted-foreground truncate max-w-[140px] px-1">
                {savedName}{dirty && <span className="text-amber-500 ml-1">*</span>}
              </span>
            )}
            <ActionBar {...actionBarProps} className="flex flex-col gap-1" />
          </div>
        </>
      )}

      <LayoutToggle current={layout} onChange={setLayout} />
    </>
  );
}
