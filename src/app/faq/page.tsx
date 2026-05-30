import Link from "next/link";
import { buttonVariants } from "@/components/ui/button-variants";

const assumptions = [
  {
    label: "Mortgage rate",
    value: "5.0%",
    note: "Annual fixed rate. Current market rates are typically 6–7% (as of early 2025). Adjust this to match your expected rate.",
  },
  {
    label: "Home appreciation",
    value: "4.0% / year",
    note: "How fast the home value grows. The historical California average is roughly 3–4% annually, though this varies widely by market and time period.",
  },
  {
    label: "Investment return",
    value: "5.0% / year",
    note: "The return earned on savings that aren't locked in a down payment. The S&P 500 has historically averaged ~10% nominal, but a balanced portfolio may return 5–7%. This rate significantly impacts the renter's projected wealth.",
  },
  {
    label: "Rent escalation",
    value: "1.0% / year",
    note: "Annual rent increase. California averages have historically been 3–5%, and recent years have seen even higher increases. A low value here favors the renting scenario.",
  },
  {
    label: "Property tax rate",
    value: "1.1%",
    note: "California base rate is 1% (Proposition 13) plus local assessments that typically add 0.1–0.3%. The assessed value can only increase by a maximum of 2% per year under Prop 13.",
  },
  {
    label: "Maintenance",
    value: "1.0% of home value / year",
    note: "A standard rule of thumb for annual home maintenance and repairs.",
  },
  {
    label: "Homeowners insurance",
    value: "$1,800 / year",
    note: "Reasonable for California. Actual costs vary by location, coverage, and insurer.",
  },
  {
    label: "Buyer closing costs",
    value: "2.0% of purchase price",
    note: "Covers loan origination, title, escrow, and other fees. The typical range is 2–5%.",
  },
  {
    label: "Seller closing costs",
    value: "5.0% of sale price",
    note: "Primarily real estate agent commissions, typically 5–6%.",
  },
  {
    label: "Monthly HOA",
    value: "$0",
    note: "Defaults to zero for single-family homes. Condos and townhomes often have HOA fees of $200–$800+/month.",
  },
];

export default function FaqPage() {
  return (
    <main>
      <section className="container mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          How the calculations work
        </h1>
        <p className="mt-4 text-muted-foreground">
          An overview of the math, assumptions, and methodology behind the
          rent-vs-buy projections.
        </p>

        {/* Methodology */}
        <div className="mt-12 space-y-10">
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Methodology</h2>
            <p className="text-muted-foreground leading-relaxed">
              The calculator builds <strong>six scenarios</strong> — three home
              prices crossed with two loan terms (15-year and 30-year) — and
              projects each one year-by-year over a 30-year horizon. For each
              year it computes:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
              <li>
                <strong>Renter wealth:</strong> Starting non-retirement savings
                invested at the assumed return rate, plus any monthly
                savings from paying less than the equivalent buy scenario.
              </li>
              <li>
                <strong>Buyer wealth:</strong> Home equity (appreciated home
                value minus remaining mortgage balance) plus invested savings,
                minus cumulative housing costs (mortgage, taxes, insurance,
                maintenance, HOA), minus seller closing costs at the point of
                sale.
              </li>
              <li>
                <strong>Cash flow differential:</strong> Each year, the
                difference between what the renter and buyer spend on housing
                is reinvested by whichever side spends less, capturing the
                opportunity cost of tying up capital in a home versus investing
                it.
              </li>
            </ul>
          </section>

          {/* Tax logic */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Tax calculations</h2>
            <p className="text-muted-foreground leading-relaxed">
              The calculator uses <strong>2024 federal and California</strong>{" "}
              tax brackets to estimate the tax benefit of homeownership:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
              <li>
                Mortgage interest and property taxes are treated as itemized
                deductions. The benefit is the amount by which itemized
                deductions exceed the standard deduction, multiplied by your
                marginal tax rate.
              </li>
              <li>
                The federal <strong>SALT deduction cap of $10,000</strong>{" "}
                (from the Tax Cuts and Jobs Act) limits how much state and
                local tax — including property tax — can be deducted on your
                federal return.
              </li>
              <li>
                California&apos;s <strong>Proposition 13</strong> limits assessed
                value increases to 2% per year, so your property tax base grows
                slower than the market value of the home.
              </li>
              <li>
                California state taxes allow the full property tax deduction
                with no SALT cap.
              </li>
            </ul>
          </section>

          {/* Default assumptions */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Default assumptions</h2>
            <p className="text-muted-foreground leading-relaxed">
              Every input can be customized on the calculator. The defaults are
              tuned for a high-cost California market. Here&apos;s what each one
              means and how it compares to current norms:
            </p>

            <div className="mt-6 divide-y divide-border">
              {assumptions.map((a) => (
                <div key={a.label} className="py-4 first:pt-0 last:pb-0">
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="font-medium">{a.label}</span>
                    <span className="shrink-0 font-mono text-sm text-muted-foreground">
                      {a.value}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                    {a.note}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* What's NOT modeled */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">What&apos;s not modeled</h2>
            <p className="text-muted-foreground leading-relaxed">
              No calculator captures everything. A few things this one leaves
              out:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
              <li>
                <strong>PMI (Private Mortgage Insurance):</strong> If your down
                payment is below 20%, most lenders require PMI (typically
                0.5–1% of the loan per year). This is not included, so
                low-down-payment scenarios may understate the true cost of
                buying.
              </li>
              <li>
                <strong>Capital gains tax on home sale:</strong> The calculator
                does not deduct capital gains tax when computing buyer wealth
                at sale. In practice, the first $250k ($500k married) of gain
                is excluded if you&apos;ve lived in the home for 2+ of the last 5
                years.
              </li>
              <li>
                <strong>Inflation adjustments:</strong> All figures are nominal
                (not adjusted for inflation).
              </li>
              <li>
                <strong>Variable rates or refinancing:</strong> The mortgage
                rate is fixed for the life of the loan.
              </li>
              <li>
                <strong>Non-California taxes:</strong> The tax logic is
                California-specific. Results will be less accurate for other
                states.
              </li>
            </ul>
          </section>

          {/* Verdict */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">How the verdict works</h2>
            <p className="text-muted-foreground leading-relaxed">
              The calculator compares renter and buyer net worth at{" "}
              <strong>year 10</strong> for each scenario. If the difference is
              less than $5,000, it calls it a tie. Otherwise, whichever side has
              more wealth wins. The <strong>breakeven year</strong> is the first
              year that buying overtakes renting in net worth.
            </p>
          </section>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <Link href="/dashboard" className={buttonVariants({ size: "lg" })}>
            Try the calculator
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Calcium75
        </div>
      </footer>
    </main>
  );
}
