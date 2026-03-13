import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { palettes } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { PalettePage } from "@/components/palette/palette-page";

export const metadata: Metadata = {
  title: "Color Palette Visualizer",
  description: "Preview D3 Lab-interpolated color palettes on sample charts",
};

interface Props {
  searchParams: Promise<{ id?: string }>;
}

export default async function Page({ searchParams }: Props) {
  const { id } = await searchParams;

  if (id) {
    const session = await auth();
    if (session?.user?.id) {
      const [row] = await db
        .select()
        .from(palettes)
        .where(
          and(eq(palettes.id, id), eq(palettes.userId, session.user.id))
        )
        .limit(1);

      if (row) {
        return (
          <PalettePage
            initialColors={row.colors as [string, string][]}
            initialId={row.id}
            initialName={row.name}
          />
        );
      }
    }
  }

  return <PalettePage />;
}
