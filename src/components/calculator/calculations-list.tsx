"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronRight, Trash2 } from "lucide-react";

interface Calculation {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export function CalculationsList() {
  const [calculations, setCalculations] = useState<Calculation[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/calculations")
      .then((res) => res.json())
      .then((data) => setCalculations(data))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this scenario?")) return;

    await fetch(`/api/calculations/${id}`, { method: "DELETE" });
    setCalculations((prev) => prev.filter((c) => c.id !== id));
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
          Saved Scenarios
        </button>
        <Button onClick={() => router.push("/dashboard")}>
          New Scenario
        </Button>
      </div>

      {open && (
        <div className="mt-4 space-y-1">
          {loading ? (
            <p className="text-muted-foreground text-sm pl-7">Loading...</p>
          ) : calculations.length === 0 ? (
            <p className="text-muted-foreground text-sm pl-7">
              No saved scenarios yet.
            </p>
          ) : (
            calculations.map((calc) => (
              <div
                key={calc.id}
                className="flex items-center justify-between pl-7 pr-1 py-1.5 rounded-md cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => router.push(`/dashboard?calc=${calc.id}`)}
              >
                <div className="flex items-baseline gap-3 min-w-0">
                  <span className="text-sm font-medium truncate">
                    {calc.name}
                  </span>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(calc.updatedAt)}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                  onClick={(e) => handleDelete(calc.id, e)}
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
