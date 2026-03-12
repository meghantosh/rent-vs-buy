import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { calculations } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { CalculatorPage } from "@/components/calculator/calculator-page";
import { CalculationsList } from "@/components/calculator/calculations-list";

interface Props {
  searchParams: Promise<{ calc?: string }>;
}

export default async function DashboardPage({ searchParams }: Props) {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  const { calc } = await searchParams;

  // If a calc ID is provided, load it
  if (calc) {
    const [row] = await db
      .select()
      .from(calculations)
      .where(
        and(eq(calculations.id, calc), eq(calculations.userId, session.user.id!))
      )
      .limit(1);

    if (row) {
      return (
        <CalculatorPage
          initialInputs={row.inputs as never}
          initialId={row.id}
          initialName={row.name}
        />
      );
    }
  }

  // No calc param → show new calculator with listing below
  return (
    <div className="space-y-8">
      <CalculatorPage />
      <div className="border-t px-4 lg:px-6 py-8">
        <CalculationsList />
      </div>
    </div>
  );
}
