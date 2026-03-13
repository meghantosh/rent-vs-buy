"use client";

import { useState } from "react";
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

interface SavePaletteDialogProps {
  currentName: string;
  saving: boolean;
  dirty: boolean;
  savedId: string | null;
  onSave: (name: string) => Promise<void>;
}

export function SavePaletteDialog({ currentName, saving, dirty, savedId, onSave }: SavePaletteDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(currentName || "");

  const handleSave = async () => {
    if (!name.trim()) return;
    await onSave(name.trim());
    setOpen(false);
  };

  const handleQuickSave = async () => {
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
              onClick={() => { setName(currentName || ""); }}
            />
          }
        >
          {savedId ? "Save As..." : "Save"}
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{savedId ? "Save As" : "Save Palette"}</DialogTitle>
            <DialogDescription>
              Give your palette a name so you can find it later.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="palette-name">Name</Label>
            <Input
              id="palette-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Warm sunset tones"
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
