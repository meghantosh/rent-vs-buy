import { db } from "@/lib/db";
import { calculations, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { SharedCalculatorView } from "@/components/calculator/shared-view";

interface Props {
  params: Promise<{ shareId: string }>;
}

export default async function SharedCalculationPage({ params }: Props) {
  const { shareId } = await params;

  const [row] = await db
    .select({
      name: calculations.name,
      inputs: calculations.inputs,
      createdAt: calculations.createdAt,
      userName: users.name,
    })
    .from(calculations)
    .innerJoin(users, eq(users.id, calculations.userId))
    .where(eq(calculations.shareId, shareId))
    .limit(1);

  if (!row) {
    notFound();
  }

  return (
    <SharedCalculatorView
      name={row.name}
      inputs={row.inputs as never}
      authorName={row.userName}
    />
  );
}
