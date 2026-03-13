import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { palettes } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import { randomBytes } from "crypto";

// POST /api/palettes/:id/share — generate a share link
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
    .select({ id: palettes.id, shareId: palettes.shareId })
    .from(palettes)
    .where(and(eq(palettes.id, id), eq(palettes.userId, session.user.id)))
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
    .update(palettes)
    .set({ shareId })
    .where(eq(palettes.id, id));

  return NextResponse.json({ shareId });
}

// DELETE /api/palettes/:id/share — revoke sharing
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
    .update(palettes)
    .set({ shareId: null })
    .where(and(eq(palettes.id, id), eq(palettes.userId, session.user.id)))
    .returning({ id: palettes.id });

  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
