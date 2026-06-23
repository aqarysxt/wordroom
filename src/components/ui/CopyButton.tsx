"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export function CopyButton({
  value,
  className,
  label = "⧉ Көшіру",
  copiedLabel = "✓ Көшірілді",
  ariaLabel = "Көшіру",
}: {
  value: string;
  className?: string;
  label?: string;
  copiedLabel?: string;
  ariaLabel?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Clipboard API қолжетімсіз болса — мәтінді таңдау арқылы fallback
      const el = document.createElement("textarea");
      el.value = value;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/60 px-3 py-1.5 text-sm font-semibold text-ink-900 transition hover:bg-white/80",
        className,
      )}
      aria-label={ariaLabel}
    >
      {copied ? copiedLabel : label}
    </button>
  );
}
