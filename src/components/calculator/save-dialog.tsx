"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface SaveDialogProps {
  currentName: string;
  saving: boolean;
  dirty: boolean;
  savedId: string | null;
  onSave: (name: string) => Promise<void>;
}

export function SaveDialog({ currentName, saving, dirty, savedId, onSave }: SaveDialogProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(currentName || "");

  const requireAuth = () => {
    if (!session?.user) {
      router.push("/sign-in");
      return true;
    }
    return false;
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    if (requireAuth()) return;
    await onSave(name.trim());
    setOpen(false);
  };

  // Quick save if already named
  const handleQuickSave = async () => {
    if (requireAuth()) return;
    if (savedId && currentName) {
      await onSave(currentName);
    } else {
      setName(currentName || "");
      setOpen(true);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {savedId && (
        <span className="text-sm text-muted-foreground truncate max-w-[200px]">
          {currentName}
          {dirty && <span className="text-amber-500 ml-1">*</span>}
        </span>
      )}

      {savedId && dirty && (
        <Button size="sm" variant="outline" onClick={handleQuickSave} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger
          render={
            <Button
              size="sm"
              variant={savedId ? "ghost" : "default"}
              onClick={() => {
                if (requireAuth()) return;
                setName(currentName || "");
              }}
            />
          }
        >
          {savedId ? "Save As..." : "Save"}
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{savedId ? "Save As" : "Save Calculation"}</DialogTitle>
            <DialogDescription>
              Give your calculation a name so you can find it later.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="calc-name">Name</Label>
            <Input
              id="calc-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. SF Bay Area comparison"
              onKeyDown={(e) => { if (e.key === "Enter") handleSave(); }}
            />
          </div>
          <DialogFooter>
            <Button onClick={handleSave} disabled={saving || !name.trim()}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
