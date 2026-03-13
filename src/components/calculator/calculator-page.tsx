"use client";

import type { CalculatorInputs } from "@/lib/calculator/types";
import { useCalculator } from "@/hooks/use-calculator";
import { InputForm } from "./input-form";
import { SummaryCards } from "./summary-cards";
import { BreakevenBanner } from "./breakeven-banner";
import { WealthChart } from "./wealth-chart";
import { MonthlyCostChart } from "./monthly-cost-chart";
import { ScenarioComparisonChart } from "./scenario-comparison-chart";
import { ResultsTable } from "./results-table";
import { SaveDialog } from "./save-dialog";
import { ShareButton } from "./share-button";
import { ScenarioSelector } from "./scenario-selector";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
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
  const router = useRouter();

  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Full-width title row */}
      <div className="flex items-center justify-between gap-4">
        <ScenarioSelector savedId={savedId} savedName={savedName} />
        <div className="flex items-center gap-2">
          {savedId && <ShareButton calculationId={savedId} />}
          <SaveDialog
            currentName={savedName}
            saving={saving}
            dirty={dirty}
            savedId={savedId}
            onSave={save}
          />
          <Button size="sm" variant="outline" onClick={() => router.push("/dashboard")}>
            New Scenario
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar — input form */}
        <aside className="w-full lg:w-[380px] shrink-0">
          <div className="sticky top-20 space-y-4 max-h-[calc(100vh-6rem)] overflow-y-auto pr-2">
            <InputForm inputs={inputs} onChange={setInputs} />
          </div>
        </aside>

        {/* Results area */}
        <main className="flex-1 min-w-0 space-y-6">
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
                <ScenarioComparisonChart
                  results={results}
                  yearIndex={9}
                  title="Total Wealth at Year 10"
                />
                <ScenarioComparisonChart
                  results={results}
                  yearIndex={29}
                  title="Total Wealth at Year 30"
                />
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
        </main>
      </div>
    </div>
  );
}
