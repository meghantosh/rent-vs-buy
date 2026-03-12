"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2 } from "lucide-react";

interface Calculation {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export function CalculationsList() {
  const [calculations, setCalculations] = useState<Calculation[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/calculations")
      .then((res) => res.json())
      .then((data) => setCalculations(data))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this calculation?")) return;

    await fetch(`/api/calculations/${id}`, { method: "DELETE" });
    setCalculations((prev) => prev.filter((c) => c.id !== id));
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
        <h2 className="text-xl font-bold">Saved Calculations</h2>
        <Button onClick={() => router.push("/dashboard")}>
          New Calculation
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading...</p>
      ) : calculations.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No saved calculations yet. Create one and hit Save to see it here.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3">
          {calculations.map((calc) => (
            <Card
              key={calc.id}
              className="cursor-pointer transition-colors hover:bg-muted/50"
              onClick={() => router.push(`/dashboard?calc=${calc.id}`)}
            >
              <CardHeader className="flex-row items-center justify-between py-3">
                <div>
                  <CardTitle className="text-base">{calc.name}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Updated {formatDate(calc.updatedAt)}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={(e) => handleDelete(calc.id, e)}
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
