"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2 } from "lucide-react";

interface Palette {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export function PalettesList() {
  const [palettes, setPalettes] = useState<Palette[]>([]);
  const [loading, setLoading] = useState(true);
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
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Saved Palettes</h2>
        <Button onClick={() => router.push("/palette")}>
          New Palette
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : palettes.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No saved palettes yet. Create one and hit Save to see it here.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {palettes.map((palette) => (
            <Card
              key={palette.id}
              className="cursor-pointer transition-colors hover:bg-muted/50"
              onClick={() => router.push(`/palette?id=${palette.id}`)}
            >
              <CardHeader className="flex-row items-center justify-between py-3">
                <div>
                  <CardTitle className="text-base">{palette.name}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Updated {formatDate(palette.updatedAt)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={(e) => handleDelete(palette.id, e)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
