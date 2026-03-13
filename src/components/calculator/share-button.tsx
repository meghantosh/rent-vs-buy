"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Link2, Check, Share2 } from "lucide-react";

interface ShareButtonProps {
  calculationId: string;
}

export function ShareButton({ calculationId }: ShareButtonProps) {
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const getShareUrl = async (): Promise<string | null> => {
    if (shareUrl) return shareUrl;
    setLoading(true);
    try {
      const res = await fetch(`/api/calculations/${calculationId}/share`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to share");
      const { shareId } = await res.json();
      const url = `${window.location.origin}/share/${shareId}`;
      setShareUrl(url);
      return url;
    } catch {
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = async () => {
    const url = await getShareUrl();
    if (!url) return;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLinkedIn = async () => {
    const url = await getShareUrl();
    if (!url) return;
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handleTwitter = async () => {
    const url = await getShareUrl();
    if (!url) return;
    const text = "Check out my rent vs buy calculation";
    window.open(
      `https://x.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button size="sm" variant="ghost" className="border border-current bg-transparent" disabled={loading}>
            <Share2 className="h-4 w-4" />
            {loading ? "Sharing..." : "Share"}
          </Button>
        }
      />
      <DropdownMenuContent align="end" sideOffset={8}>
        <DropdownMenuItem onClick={handleLinkedIn}>
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
          LinkedIn
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleTwitter}>
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          X / Twitter
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleCopyLink}>
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              Copied!
            </>
          ) : (
            <>
              <Link2 className="h-4 w-4" />
              Copy link
            </>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
