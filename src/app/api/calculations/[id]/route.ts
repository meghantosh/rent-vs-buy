import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { calculations } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

// GET /api/calculations/:id — load a single calculation
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const [row] = await db
    .select()
    .from(calculations)
    .where(and(eq(calculations.id, id), eq(calculations.userId, session.user.id)))
    .limit(1);

  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(row);
}

// PUT /api/calculations/:id — update a calculation
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();
  const { name, inputs } = body;

  const [row] = await db
    .update(calculations)
    .set({
      ...(name !== undefined && { name }),
      ...(inputs !== undefined && { inputs }),
      updatedAt: new Date(),
    })
    .where(and(eq(calculations.id, id), eq(calculations.userId, session.user.id)))
    .returning();

  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(row);
}

// DELETE /api/calculations/:id — delete a calculation
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const [row] = await db
    .delete(calculations)
    .where(and(eq(calculations.id, id), eq(calculations.userId, session.user.id)))
    .returning({ id: calculations.id });

  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
