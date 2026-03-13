"use client";

import { SaveDialog } from "./save-dialog";
import { ShareButton } from "./share-button";

interface ActionBarProps {
  savedId: string | null;
  savedName: string;
  saving: boolean;
  dirty: boolean;
  onSave: (name: string) => Promise<void>;
  className?: string;
}

export function ActionBar({ savedId, savedName, saving, dirty, onSave, className }: ActionBarProps) {
  return (
    <div className={className}>
      {savedId && <ShareButton calculationId={savedId} />}
      <SaveDialog
        currentName={savedName}
        saving={saving}
        dirty={dirty}
        savedId={savedId}
        onSave={onSave}
      />
    </div>
  );
}
