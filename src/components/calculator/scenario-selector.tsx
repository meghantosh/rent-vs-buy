"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ChevronRight, Trash2 } from "lucide-react";

interface Calculation {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

interface ScenarioSelectorProps {
  savedId: string | null;
  savedName: string;
}

export function ScenarioSelector({ savedId, savedName }: ScenarioSelectorProps) {
  const { data: session } = useSession();
  const [calculations, setCalculations] = useState<Calculation[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const displayName = savedName || "My Scenario";

  useEffect(() => {
    if (!session?.user) {
      setLoading(false);
      return;
    }
    fetch("/api/calculations")
      .then((res) => res.json())
      .then((data) => setCalculations(data))
      .finally(() => setLoading(false));
  }, [session?.user]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this scenario?")) return;
    await fetch(`/api/calculations/${id}`, { method: "DELETE" });
    setCalculations((prev) => prev.filter((c) => c.id !== id));
    if (id === savedId) {
      router.push("/dashboard");
    }
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

  const hasScenarios = session?.user && !loading && calculations.length > 0;

  if (!hasScenarios) {
    return <h1 className="text-2xl font-bold">{displayName}</h1>;
  }

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-2xl font-bold cursor-pointer bg-transparent border-none p-0"
      >
        <ChevronRight
          className={`h-5 w-5 transition-transform ${open ? "rotate-90" : ""}`}
        />
        {displayName}
      </button>

      {open && (
        <div className="mt-2 space-y-1">
          {calculations.map((calc) => (
            <div
              key={calc.id}
              className={`flex items-center justify-between pl-7 pr-1 py-1.5 rounded-md cursor-pointer hover:bg-muted/50 transition-colors ${calc.id === savedId ? "bg-muted/50" : ""}`}
              onClick={() => {
                router.push(`/dashboard?calc=${calc.id}`);
                setOpen(false);
              }}
            >
              <div className="flex items-baseline gap-3 min-w-0">
                <span className="text-sm font-medium truncate">
                  {calc.name}
                </span>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatDate(calc.updatedAt)}
                </span>
              </div>
              <button
                className="h-7 w-7 shrink-0 inline-flex items-center justify-center text-muted-foreground hover:text-destructive bg-transparent border-none cursor-pointer rounded-md hover:bg-muted"
                onClick={(e) => handleDelete(calc.id, e)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
