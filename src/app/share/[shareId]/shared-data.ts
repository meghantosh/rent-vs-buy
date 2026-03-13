import { db } from "@/lib/db";
import { calculations, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function getSharedCalculation(shareId: string) {
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

  return row ?? null;
}
