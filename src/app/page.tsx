import Link from "next/link";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const steps = [
  {
    number: "1",
    title: "Enter your numbers",
    description:
      "Input your income, rent, home prices, down payment, interest rates, and other assumptions.",
  },
  {
    number: "2",
    title: "Compare scenarios",
    description:
      "See side-by-side comparisons across multiple price points and loan terms.",
  },
  {
    number: "3",
    title: "Make a confident decision",
    description:
      "Understand the true cost of renting vs. buying with 30-year projections.",
  },
];

const features = [
  {
    title: "Multiple price points",
    description:
      "Compare 3 different home prices simultaneously to find your sweet spot.",
  },
  {
    title: "15yr vs. 30yr loans",
    description:
      "See how loan term affects your monthly payment, total interest, and net worth.",
  },
  {
    title: "Rent escalation",
    description:
      "Model annual rent increases to see the long-term cost of continuing to rent.",
  },
  {
    title: "Opportunity cost",
    description:
      "Account for investment returns on your down payment if you chose to rent instead.",
  },
  {
    title: "CA tax logic",
    description:
      "California-specific tax calculations including Prop 13 property tax caps and State and Local (SALT) tax deduction of mortgage interest from your federal taxes.",
  },
  {
    title: "30-year projections",
    description:
      "Year-by-year breakdowns showing cumulative costs and net worth over time.",
  },
];

export default function HomePage() {
  return (
    <main>
      {/* Hero */}
      <section className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight max-w-3xl mx-auto">
          Should you rent or buy?
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
          Stop guessing. Compare scenarios with real math — opportunity cost,
          rent escalation, California taxes, and 30-year projections — so you
          can make a confident decision.
        </p>
        <div className="mt-10 flex gap-4 justify-center">
          <Link href="/dashboard" className={buttonVariants({ size: "lg" })}>
            Get Started
          </Link>
          <Link href="/sign-in" className={buttonVariants({ size: "lg", variant: "outline" })}>
            Sign In
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-muted/50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How it works</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {steps.map((step) => (
              <div key={step.number} className="text-center space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-lg font-bold">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          What makes this different
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {features.map((feature) => (
            <Card key={feature.title}>
              <CardHeader>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-muted/50 py-20">
        <div className="container mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl font-bold">Ready to run your numbers?</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Create a free account and start comparing rent vs. buy scenarios in
            minutes.
          </p>
          <Link href="/dashboard" className={buttonVariants({ size: "lg" })}>
            Try It Free
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
