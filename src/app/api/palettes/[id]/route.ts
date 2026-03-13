import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { palettes } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

// GET /api/palettes/:id — load a single palette
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
    .from(palettes)
    .where(and(eq(palettes.id, id), eq(palettes.userId, session.user.id)))
    .limit(1);

  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(row);
}

// PUT /api/palettes/:id — update a palette
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
  const { name, colors } = body;

  const [row] = await db
    .update(palettes)
    .set({
      ...(name !== undefined && { name }),
      ...(colors !== undefined && { colors }),
      updatedAt: new Date(),
    })
    .where(and(eq(palettes.id, id), eq(palettes.userId, session.user.id)))
    .returning();

  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(row);
}

// DELETE /api/palettes/:id — delete a palette
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
    .delete(palettes)
    .where(and(eq(palettes.id, id), eq(palettes.userId, session.user.id)))
    .returning({ id: palettes.id });

  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
