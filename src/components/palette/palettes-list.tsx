"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronRight, Trash2 } from "lucide-react";

interface Palette {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export function PalettesList() {
  const [palettes, setPalettes] = useState<Palette[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/palettes")
      .then((res) => res.json())
      .then((data) => setPalettes(data))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this palette?")) return;

    await fetch(`/api/palettes/${id}`, { method: "DELETE" });
    setPalettes((prev) => prev.filter((p) => p.id !== id));
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    const month = (d.getMonth() + 1).toString().padStart(2, "0");
    const day = d.getDate().toString().padStart(2, "0");
    const year = d.getFullYear();
    const hours = d.getHours();
    const minutes = d.getMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    const h12 = hours % 12 || 12;
    return `${month}/${day}/${year}, ${h12}:${minutes} ${ampm}`;
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 text-xl font-bold cursor-pointer bg-transparent border-none p-0"
        >
          <ChevronRight
            className={`h-5 w-5 transition-transform ${open ? "rotate-90" : ""}`}
          />
          Saved Palettes
        </button>
        <Button onClick={() => router.push("/palette")}>
          New Palette
        </Button>
      </div>

      {open && (
        <div className="mt-4 space-y-1">
          {loading ? (
            <p className="text-muted-foreground text-sm pl-7">Loading...</p>
          ) : palettes.length === 0 ? (
            <p className="text-muted-foreground text-sm pl-7">
              No saved palettes yet.
            </p>
          ) : (
            palettes.map((palette) => (
              <div
                key={palette.id}
                className="flex items-center justify-between pl-7 pr-1 py-1.5 rounded-md cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => router.push(`/palette?id=${palette.id}`)}
              >
                <div className="flex items-baseline gap-3 min-w-0">
                  <span className="text-sm font-medium truncate">
                    {palette.name}
                  </span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(palette.updatedAt)}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={(e) => handleDelete(palette.id, e)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
