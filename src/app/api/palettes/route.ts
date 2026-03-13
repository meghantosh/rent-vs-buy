import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { palettes } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

// GET /api/palettes — list user's saved palettes
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await db
    .select({
      id: palettes.id,
      name: palettes.name,
      createdAt: palettes.createdAt,
      updatedAt: palettes.updatedAt,
    })
    .from(palettes)
    .where(eq(palettes.userId, session.user.id))
    .orderBy(desc(palettes.updatedAt));

  return NextResponse.json(rows);
}

// POST /api/palettes — save a new palette
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, colors } = body;

  if (!name || !colors) {
    return NextResponse.json({ error: "name and colors are required" }, { status: 400 });
  }

  const [row] = await db
    .insert(palettes)
    .values({
      userId: session.user.id,
      name,
      colors,
    })
    .returning();

  return NextResponse.json(row, { status: 201 });
}
