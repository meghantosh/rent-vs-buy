import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { calculations } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { CalculatorPage } from "@/components/calculator/calculator-page";


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

  return <CalculatorPage />;
}
