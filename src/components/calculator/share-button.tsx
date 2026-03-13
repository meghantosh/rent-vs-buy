"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link2, Check } from "lucide-react";

interface ShareButtonProps {
  calculationId: string;
}

export function ShareButton({ calculationId }: ShareButtonProps) {
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    setSharing(true);
    try {
      const res = await fetch(`/api/calculations/${calculationId}/share`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to share");
      const { shareId } = await res.json();
      const url = `${window.location.origin}/share/${shareId}`;
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } finally {
      setSharing(false);
    }
  };

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={handleShare}
      disabled={sharing}
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 mr-1" />
          Copied!
        </>
      ) : (
        <>
          <Link2 className="h-3.5 w-3.5 mr-1" />
          {sharing ? "Sharing..." : "Share Scenario"}
        </>
      )}
    </Button>
  );
}
