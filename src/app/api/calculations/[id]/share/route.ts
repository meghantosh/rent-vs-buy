import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { calculations } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

// POST /api/calculations/:id/share — generate a share link
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Check ownership
  const [row] = await db
    .select({ id: calculations.id, shareId: calculations.shareId })
    .from(calculations)
    .where(and(eq(calculations.id, id), eq(calculations.userId, session.user.id)))
    .limit(1);

  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // If already shared, return existing shareId
  if (row.shareId) {
    return NextResponse.json({ shareId: row.shareId });
  }

  // Generate a short random share ID
  const shareId = randomBytes(6).toString("base64url");

  await db
    .update(calculations)
    .set({ shareId })
    .where(eq(calculations.id, id));

  return NextResponse.json({ shareId });
}

// DELETE /api/calculations/:id/share — revoke sharing
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
    .update(calculations)
    .set({ shareId: null })
    .where(and(eq(calculations.id, id), eq(calculations.userId, session.user.id)))
    .returning({ id: calculations.id });

  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
