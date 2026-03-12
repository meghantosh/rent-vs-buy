import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { calculations } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

// GET /api/calculations — list user's saved calculations
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await db
    .select({
      id: calculations.id,
      name: calculations.name,
      createdAt: calculations.createdAt,
      updatedAt: calculations.updatedAt,
    })
    .from(calculations)
    .where(eq(calculations.userId, session.user.id))
    .orderBy(desc(calculations.updatedAt));

  return NextResponse.json(rows);
}

// POST /api/calculations — save a new calculation
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, inputs } = body;

  if (!name || !inputs) {
    return NextResponse.json({ error: "name and inputs are required" }, { status: 400 });
  }

  const [row] = await db
    .insert(calculations)
    .values({
      userId: session.user.id,
      name,
      inputs,
    })
    .returning();

  return NextResponse.json(row, { status: 201 });
}
