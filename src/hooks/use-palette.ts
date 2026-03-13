"use client";

import { useState, useCallback, useEffect } from "react";
import { loadPalettes, savePalettes } from "@/components/palette/color-utils";

export function usePalette(
  initialColors?: [string, string][],
  initialId?: string,
  initialName?: string
) {
  const [colors, setColors] = useState<[string, string][]>(
    initialColors ?? loadPalettes
  );
  const [savedId, setSavedId] = useState<string | null>(initialId ?? null);
  const [savedName, setSavedName] = useState<string>(initialName ?? "");
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    savePalettes(colors);
  }, [colors]);

  const updateColor = useCallback(
    (index: number, which: 0 | 1, value: string) => {
      setColors((prev) => {
        const next = prev.map((p) => [...p] as [string, string]);
        next[index][which] = value;
        return next;
      });
      setDirty(true);
    },
    []
  );

  const save = useCallback(
    async (name: string) => {
      setSaving(true);
      try {
        if (savedId) {
          const res = await fetch(`/api/palettes/${savedId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, colors }),
          });
          if (!res.ok) throw new Error("Failed to save");
          setSavedName(name);
          setDirty(false);
        } else {
          const res = await fetch("/api/palettes", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, colors }),
          });
          if (!res.ok) throw new Error("Failed to save");
          const data = await res.json();
          setSavedId(data.id);
          setSavedName(name);
          setDirty(false);
          window.history.replaceState(null, "", `/palette?id=${data.id}`);
        }
      } finally {
        setSaving(false);
      }
    },
    [savedId, colors]
  );

  return {
    colors,
    updateColor,
    savedId,
    savedName,
    saving,
    dirty,
    save,
  };
}
