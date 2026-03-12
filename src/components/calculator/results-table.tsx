"use client";

import type { CalculatorResults } from "@/lib/calculator/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function fmt(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

interface ResultsTableProps {
  results: CalculatorResults;
}

export function ResultsTable({ results }: ResultsTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="sticky left-0 bg-background z-10">Year</TableHead>
            <TableHead>Rent/mo</TableHead>
            <TableHead>Rent Wealth</TableHead>
            {results.scenarios.map((s, i) => (
              <TableHead key={i} colSpan={3} className="text-center border-l">
                {s.label}
              </TableHead>
            ))}
          </TableRow>
          <TableRow>
            <TableHead className="sticky left-0 bg-background z-10" />
            <TableHead />
            <TableHead />
            {results.scenarios.map((_, i) => (
              <Fragment key={i}>
                <TableHead className="border-l text-xs">Net/mo</TableHead>
                <TableHead className="text-xs">Equity</TableHead>
                <TableHead className="text-xs">Wealth</TableHead>
              </Fragment>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.yearSnapshots.map((snap) => (
            <TableRow key={snap.year}>
              <TableCell className="sticky left-0 bg-background z-10 font-medium">
                {snap.year}
              </TableCell>
              <TableCell>{fmt(snap.rent.monthlyRent)}</TableCell>
              <TableCell>{fmt(snap.rent.totalWealth)}</TableCell>
              {snap.buy.map((buy, i) => {
                const buyWins = buy.totalWealth > snap.rent.totalWealth;
                return (
                  <Fragment key={i}>
                    <TableCell className="border-l">{fmt(buy.netMonthlyCost)}</TableCell>
                    <TableCell>{fmt(buy.equity)}</TableCell>
                    <TableCell className={buyWins ? "text-emerald-600 font-medium" : ""}>
                      {fmt(buy.totalWealth)}
                    </TableCell>
                  </Fragment>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// Need Fragment import
import { Fragment } from "react";
