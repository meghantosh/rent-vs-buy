import { auth } from "@/lib/auth";
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
  const { calc } = await searchParams;

  // If logged in and a calc ID is provided, load it
  if (session?.user && calc) {
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

  // Show calculator; saved calculations list only for logged-in users
  return (
    <div className="space-y-8">
      <CalculatorPage />
      {session?.user && (
        <div className="border-t px-4 lg:px-6 py-8">
          <CalculationsList />
        </div>
      )}
    </div>
  );
}
