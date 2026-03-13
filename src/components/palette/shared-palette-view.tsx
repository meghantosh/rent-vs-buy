"use client";

import { PaletteSection } from "./palette-section";

interface SharedPaletteViewProps {
  name: string;
  colors: [string, string][];
  authorName: string | null;
}

export function SharedPaletteView({ name, colors, authorName }: SharedPaletteViewProps) {
  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-8">
      <div>
        <h1 className="text-2xl font-medium tracking-tight text-[#9c5454]">{name}</h1>
        {authorName && (
          <p className="text-sm text-muted-foreground">Shared by {authorName}</p>
        )}
      </div>
      {colors.map(([start, end], i) => (
        <PaletteSection
          key={i}
          index={i}
          start={start}
          end={end}
          readOnly
          onChangeStart={() => {}}
          onChangeEnd={() => {}}
        />
      ))}
    </div>
  );
}
