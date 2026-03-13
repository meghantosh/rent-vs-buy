"use client";

import { usePalette } from "@/hooks/use-palette";
import { PaletteSection } from "./palette-section";
import { PalettesList } from "./palettes-list";
import { SavePaletteDialog } from "./save-palette-dialog";
import { SharePaletteButton } from "./share-palette-button";

interface PalettePageProps {
  initialColors?: [string, string][];
  initialId?: string;
  initialName?: string;
}

export function PalettePage({ initialColors, initialId, initialName }: PalettePageProps) {
  const { colors, updateColor, savedId, savedName, saving, dirty, save } = usePalette(
    initialColors,
    initialId,
    initialName
  );

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-medium tracking-tight text-[#9c5454]">
          Color Palette Visualizer
        </h1>
        <div className="flex items-center gap-2">
          {savedId && <SharePaletteButton paletteId={savedId} />}
          <SavePaletteDialog
            currentName={savedName}
            saving={saving}
            dirty={dirty}
            savedId={savedId}
            onSave={save}
          />
        </div>
      </div>
      {colors.map(([start, end], i) => (
        <PaletteSection
          key={i}
          index={i}
          start={start}
          end={end}
          onChangeStart={(v) => updateColor(i, 0, v)}
          onChangeEnd={(v) => updateColor(i, 1, v)}
        />
      ))}
      <div className="border-t pt-8">
        <PalettesList />
      </div>
    </div>
  );
}
