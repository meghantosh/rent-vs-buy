import { db } from "@/lib/db";
import { palettes, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { SharedPaletteView } from "@/components/palette/shared-palette-view";

interface Props {
  params: Promise<{ shareId: string }>;
}

export default async function SharedPalettePage({ params }: Props) {
  const { shareId } = await params;

  const [row] = await db
    .select({
      name: palettes.name,
      colors: palettes.colors,
      userName: users.name,
    })
    .from(palettes)
    .innerJoin(users, eq(users.id, palettes.userId))
    .where(eq(palettes.shareId, shareId))
    .limit(1);

  if (!row) {
    notFound();
  }

  return (
    <SharedPaletteView
      name={row.name}
      colors={row.colors as [string, string][]}
      authorName={row.userName}
    />
  );
}
