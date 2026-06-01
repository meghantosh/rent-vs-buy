import Link from "next/link";
import { buttonVariants } from "@/components/ui/button-variants";

const assumptions = [
  {
    label: "Mortgage rate",
    value: "6.5%",
    note: "Annual fixed rate, in line with recent 30-year fixed rates (roughly 6–7%). Adjust to your expected rate.",
  },
  {
    label: "Home appreciation",
    value: "4.0% / year",
    note: "How fast the home value grows. The historical California average is roughly 3–4% annually, though it varies widely by market and time period.",
  },
  {
    label: "Investment return",
    value: "5.0% / year",
    note: "The return on savings not locked into a down payment. The S&P 500 has historically averaged ~10% nominal; a balanced portfolio may return 5–7%. This is the single most influential input — it drives the renter's wealth and the buy-vs-borrow tradeoff.",
  },
  {
    label: "Rent escalation",
    value: "3.0% / year",
    note: "Annual rent increase. California has historically run 3–5%. A lower value favors renting.",
  },
  {
    label: "Property tax rate",
    value: "1.1%",
    note: "California's 1% base (Prop 13) plus local assessments of ~0.1–0.3%. Assessed value can rise at most 2% per year.",
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

        {/* What changed callout */}
        <div className="mt-8 rounded-lg border border-border bg-muted/50 px-5 py-4 text-sm text-muted-foreground leading-relaxed">
          <strong className="text-foreground">What changed (May 2026 update):</strong>{" "}
          the engine now (1) stops mortgage payments once a loan is paid off,
          (2) uses a single, consistent renter baseline, (3) reflects 2026
          federal/California tax law, and (4) applies capital-gains tax on both
          investment portfolios and on the home sale. The sections below are
          current as of that update.
        </div>

        <div className="mt-12 space-y-10">
          {/* Methodology */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Methodology</h2>
            <p className="text-muted-foreground leading-relaxed">
              The calculator builds <strong>six scenarios</strong> — three home
              prices crossed with two loan terms (15-year and 30-year) — and
              projects each one year-by-year over a 30-year horizon. Every
              figure is computed on an{" "}
              <strong>after-tax, &quot;if you liquidated today&quot;</strong>{" "}
              basis. For each year it computes:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
              <li>
                <strong>Renter wealth:</strong> Your full starting
                non-retirement savings invested at the assumed return rate and
                grown over time, minus capital-gains tax on the portfolio&apos;s
                growth if it were sold. The renter keeps the whole nest egg
                invested because they never spend it on a down payment — that&apos;s
                the opportunity cost buying has to overcome.
              </li>
              <li>
                <strong>Buyer wealth:</strong> After-tax home sale proceeds
                (appreciated value − remaining mortgage balance − seller closing
                costs − capital-gains tax on the gain above the exclusion){" "}
                <strong>plus</strong> the buyer&apos;s side investment portfolio
                (also after capital-gains tax).
              </li>
              <li>
                <strong>Cash-flow differential:</strong> Each year, the
                difference between rent and that scenario&apos;s net housing cost is
                added to — or drawn from — the <em>buyer&apos;s</em> investment
                portfolio. The renter&apos;s portfolio is a single baseline that
                doesn&apos;t change from scenario to scenario. This keeps one clean
                &quot;rent&quot; line on the charts while still making each
                buy-vs-rent comparison scenario-specific.
              </li>
              <li>
                <strong>Payoff relief:</strong> Once a loan term ends (year 15
                for a 15-year loan), the mortgage payment drops away and only
                carrying costs — property tax, insurance, maintenance, HOA —
                remain. The freed-up cash flow then feeds the investment
                portfolio.
              </li>
            </ul>
          </section>

          {/* Tax calculations */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Tax calculations</h2>
            <p className="text-muted-foreground leading-relaxed">
              The calculator uses <strong>2026 federal and California</strong>{" "}
              parameters to estimate the tax effects of homeownership and
              investing:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
              <li>
                <strong>Itemized deductions, measured incrementally.</strong>{" "}
                Mortgage interest and property tax are treated as itemized
                deductions, but the benefit is the <em>incremental</em> tax
                saved versus renting — itemized-with-housing compared against
                the greater of (itemized-without-housing, the standard
                deduction). For higher earners who already itemize on the
                strength of their state income tax, this means the housing
                deductions deliver close to their full marginal value instead
                of being quietly absorbed by the standard deduction.
              </li>
              <li>
                <strong>SALT cap (2026 law).</strong> The state-and-local-tax
                deduction cap is <strong>$40,400</strong> for 2026 (not the old
                $10,000), phasing down above ~$505,000 of income toward a
                $10,000 floor, and is scheduled to revert to $10,000 in 2030.
                State income tax counts toward that cap alongside property tax.
              </li>
              <li>
                <strong>Mortgage interest limit.</strong> Interest is deductible
                only on the first <strong>$750,000</strong> of mortgage balance.
              </li>
              <li>
                <strong>Proposition 13.</strong> California limits
                assessed-value increases to 2% per year, so your property-tax
                base grows more slowly than the market value of the home.
                California also allows the full property-tax and
                mortgage-interest deduction with no SALT cap.
              </li>
              <li>
                <strong>Capital gains.</strong> Investment-portfolio growth
                (both renter and buyer) is taxed at sale at a combined
                long-term rate — federal 0/15/20% by income, plus the 3.8% Net
                Investment Income Tax, plus California (which taxes gains as
                ordinary income). The home sale gets the{" "}
                <strong>§121 exclusion</strong> ($250k single / $500k married);
                only the gain above it is taxed.
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

          {/* What's not modeled */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">What&apos;s not modeled</h2>
            <p className="text-muted-foreground leading-relaxed">
              No calculator captures everything. A few simplifications worth
              knowing:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground leading-relaxed">
              <li>
                <strong>The home-sale tax assumes you sell at the horizon.</strong>{" "}
                Capital-gains tax on the home is applied when computing buyer
                wealth — but only because the model treats every year as &quot;if
                you sold today.&quot; Many owners never realize the gain (they roll
                into the next home, or hold until heirs receive a stepped-up
                basis), in which case that tax wouldn&apos;t apply and buying looks
                even better.
              </li>
              <li>
                <strong>Carrying costs are held flat.</strong> Insurance is a
                fixed annual figure and maintenance is a percentage of the
                original price, so neither grows with inflation or home value.
                Long-horizon ownership costs are therefore slightly understated.
              </li>
              <li>
                <strong>Tax parameters are held constant.</strong> The
                projection applies one year&apos;s brackets, caps, and rates across
                all 30 years — it does not model bracket drift, your own income
                changing, or scheduled law changes (such as the 2030 SALT
                reversion).
              </li>
              <li>
                <strong>PMI (Private Mortgage Insurance):</strong> Not
                included. With a down payment below 20%, most lenders require
                PMI (~0.5–1% of the loan/year), so low-down-payment scenarios
                understate the true cost of buying.
              </li>
              <li>
                <strong>Inflation:</strong> All figures are nominal.
              </li>
              <li>
                <strong>Variable rates / refinancing:</strong> The mortgage
                rate is fixed for the life of the loan.
              </li>
              <li>
                <strong>Non-California taxes:</strong> The tax logic is
                California-specific; results are less accurate elsewhere.
              </li>
            </ul>
          </section>

          {/* Why results can be surprising */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">
              Why the results can be surprising
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              The interactions between leverage, taxes, and compounding
              aren&apos;t intuitive. A few patterns that trip people up:
            </p>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <div>
                <p>
                  <strong>
                    A 15-year and a 30-year mortgage often end up nearly equal
                    in long-run wealth.
                  </strong>{" "}
                  It seems like the 15-year should win — once it&apos;s paid off, it
                  frees up years of cash flow to invest. But three forces
                  roughly cancel out: the 30-year pays more total interest
                  (favoring the 15-year), yet it also earns ~15 more years of
                  mortgage-interest deductions and keeps more money invested
                  early, and because capital-gains tax is deferred until you
                  sell, that invested money compounds at nearly the full return
                  rate. At typical inputs the two terms land within a rounding
                  error of each other at year 30.{" "}
                  <strong>
                    The tie-breaker is your investment return versus your
                    mortgage rate:
                  </strong>{" "}
                  when your expected return is above your mortgage rate, the
                  30-year&apos;s &quot;borrow cheap, invest the difference&quot; leverage
                  pulls ahead; when it&apos;s below, faster payoff (15-year) wins.
                  So the choice is really about cash-flow comfort and risk
                  tolerance, not a large wealth gap.
                </p>
              </div>
              <div>
                <p>
                  <strong>
                    Capital-gains tax narrows buying&apos;s lead over renting —
                    but rarely erases it.
                  </strong>{" "}
                  Taxing investment growth at sale lowers both sides, but it
                  hits the renter harder: the renter holds a large, fully
                  taxable portfolio, while much of the buyer&apos;s gain is shielded
                  by the home-sale exclusion. In high-rent California markets
                  over long horizons, buying still tends to come out ahead —
                  just by less than a pre-tax view suggests.
                </p>
              </div>
              <div>
                <p>
                  <strong>
                    There&apos;s only one &quot;rent&quot; line even though each home costs
                    something different.
                  </strong>{" "}
                  That&apos;s deliberate. The renter keeps their entire nest egg
                  invested; each buy scenario separately credits or debits its
                  own cost difference to the buyer&apos;s side. The rent baseline is
                  shared across scenarios, but the comparison against each one
                  is still specific to that scenario.
                </p>
              </div>
              <div>
                <p>
                  <strong>Breakeven can arrive early.</strong> Because the
                  renter&apos;s wealth is taxed too, the bar that buying must clear
                  is lower than it looks — so in strong-rent markets, buying&apos;s
                  net worth can overtake renting within just a few years, even
                  though intuition says owning takes a decade to &quot;pay off.&quot;
                </p>
              </div>
              <div>
                <p>
                  <strong>
                    Investment return moves the needle more than anything else.
                  </strong>{" "}
                  Before agonizing over closing costs or insurance, try sweeping
                  the investment-return input a couple of points in each
                  direction. It reshapes the renter&apos;s trajectory and can flip
                  both the rent-vs-buy verdict and the 15-vs-30 ordering on its
                  own.
                </p>
              </div>
            </div>
          </section>

          {/* Verdict */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold">How the verdict works</h2>
            <p className="text-muted-foreground leading-relaxed">
              The calculator compares renter and buyer net worth at{" "}
              <strong>year 10</strong> for each scenario. If the difference is
              under $5,000 it calls a tie; otherwise the higher-wealth side
              wins. The <strong>breakeven year</strong> is the first year
              buying overtakes renting in net worth.
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
