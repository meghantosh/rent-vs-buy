"use client";

import type { CalculatorInputs, FilingStatus } from "@/lib/calculator/types";
import { InputGroup } from "./input-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface InputFormProps {
  inputs: CalculatorInputs;
  onChange: (inputs: CalculatorInputs) => void;
}

export function InputForm({ inputs, onChange }: InputFormProps) {
  const update = <K extends keyof CalculatorInputs>(
    key: K,
    value: CalculatorInputs[K]
  ) => {
    onChange({ ...inputs, [key]: value });
  };

  const updatePrice = (index: number, value: number) => {
    const prices = [...inputs.housePrices] as [number, number, number];
    prices[index] = value;
    onChange({ ...inputs, housePrices: prices });
  };

  return (
    <div className="space-y-6">
      {/* Income & Rent */}
      <section className="space-y-3">
        <h3 className="text-base font-semibold border-t border-foreground pt-3">Income & Rent</h3>
        <InputGroup
          label="Annual Income"
          value={inputs.annualIncome}
          onChange={(v) => update("annualIncome", v)}
          prefix="$"
          step={5000}
        />
        <InputGroup
          label="Monthly Rent"
          value={inputs.monthlyRent}
          onChange={(v) => update("monthlyRent", v)}
          prefix="$"
          step={100}
        />
        <div className="space-y-1">
          <Label className="text-xs text-muted-foreground">Filing Status</Label>
          <Select
            value={inputs.filingStatus}
            onValueChange={(v) => { if (v) update("filingStatus", v as FilingStatus); }}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="single">Single</SelectItem>
              <SelectItem value="mfj">Married Filing Jointly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* Current Savings */}
      <section className="space-y-3">
        <h3 className="text-base font-semibold border-t border-foreground pt-3">Current Savings</h3>
        <InputGroup
          label="Non-Retirement Investments"
          value={inputs.nonRetirementSavings}
          onChange={(v) => update("nonRetirementSavings", v)}
          prefix="$"
          step={10000}
        />
        <InputGroup
          label="Retirement Accounts (401k/IRA)"
          value={inputs.retirementSavings}
          onChange={(v) => update("retirementSavings", v)}
          prefix="$"
          step={10000}
        />
      </section>

      {/* Home Prices */}
      <section className="space-y-3">
        <h3 className="text-base font-semibold border-t border-foreground pt-3">Home Prices</h3>
        <div className="grid grid-cols-3 gap-2">
          {inputs.housePrices.map((price, i) => (
            <InputGroup
              key={i}
              label={`Price ${i + 1}`}
              value={price}
              onChange={(v) => updatePrice(i, v)}
              prefix="$"
              step={25000}
            />
          ))}
        </div>
      </section>

      {/* Mortgage */}
      <section className="space-y-3">
        <h3 className="text-base font-semibold border-t border-foreground pt-3">Mortgage</h3>
        <InputGroup
          label="Down Payment"
          value={inputs.downPaymentPercent}
          onChange={(v) => update("downPaymentPercent", v)}
          suffix="%"
          step={1}
          min={0}
          max={100}
        />
        <InputGroup
          label="Mortgage Rate"
          value={inputs.mortgageRate}
          onChange={(v) => update("mortgageRate", v)}
          suffix="%"
          step={0.125}
          min={0}
        />
      </section>

      {/* Monthly Costs */}
      <section className="space-y-3">
        <h3 className="text-base font-semibold border-t border-foreground pt-3">Monthly Costs</h3>
        <InputGroup
          label="HOA"
          value={inputs.monthlyHoa}
          onChange={(v) => update("monthlyHoa", v)}
          prefix="$"
          step={50}
        />
        <InputGroup
          label="Annual Insurance"
          value={inputs.annualInsurance}
          onChange={(v) => update("annualInsurance", v)}
          prefix="$"
          step={100}
        />
        <InputGroup
          label="Property Tax Rate"
          value={inputs.propertyTaxRate}
          onChange={(v) => update("propertyTaxRate", v)}
          suffix="%"
          step={0.1}
        />
        <InputGroup
          label="Maintenance"
          value={inputs.maintenancePercent}
          onChange={(v) => update("maintenancePercent", v)}
          suffix="%"
          step={0.25}
        />
      </section>

      {/* Growth Rates */}
      <section className="space-y-3">
        <h3 className="text-base font-semibold border-t border-foreground pt-3">Growth Rates</h3>
        <InputGroup
          label="Home Appreciation"
          value={inputs.appreciationRate}
          onChange={(v) => update("appreciationRate", v)}
          suffix="%"
          step={0.5}
        />
        <InputGroup
          label="Investment Return"
          value={inputs.investmentReturnRate}
          onChange={(v) => update("investmentReturnRate", v)}
          suffix="%"
          step={0.5}
        />
        <InputGroup
          label="Rent Escalation"
          value={inputs.rentEscalationRate}
          onChange={(v) => update("rentEscalationRate", v)}
          suffix="%"
          step={0.5}
        />
      </section>

      {/* Transaction Costs */}
      <section className="space-y-3">
        <h3 className="text-base font-semibold border-t border-foreground pt-3">Transaction Costs</h3>
        <InputGroup
          label="Buyer Closing"
          value={inputs.buyerClosingPercent}
          onChange={(v) => update("buyerClosingPercent", v)}
          suffix="%"
          step={0.5}
        />
        <InputGroup
          label="Seller Closing"
          value={inputs.sellerClosingPercent}
          onChange={(v) => update("sellerClosingPercent", v)}
          suffix="%"
          step={0.5}
        />
      </section>
    </div>
  );
}
