"use client";

import React, { useState } from "react";
import { cn, defangUrl } from "@/lib/utils";
import { Copy, Check, ExternalLink, ShieldAlert, PhoneCall } from "lucide-react";

export interface ChipProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "defanged" | "phone" | "upi" | "helpline" | "neutral";
  value: string;
  label?: string;
  copyable?: boolean;
}

export const Chip: React.FC<ChipProps> = ({
  variant = "neutral",
  value,
  label,
  copyable = false,
  className,
  ...props
}) => {
  const [copied, setCopied] = useState(false);

  const displayValue = variant === "defanged" ? defangUrl(value) : value;

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const variantStyles = {
    defanged: "bg-verdict-scam/10 border-verdict-scam/30 text-verdict-scam font-mono",
    phone: "bg-raised border-hairline text-paper font-mono",
    upi: "bg-raised border-hairline text-signal font-mono",
    helpline: "bg-signal/10 border-signal/30 text-signal font-semibold",
    neutral: "bg-raised/70 border-hairline text-fog",
  }[variant];

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md border select-all transition-colors",
        variantStyles,
        className
      )}
      {...props}
    >
      {variant === "defanged" && <ShieldAlert className="w-3 h-3 shrink-0" aria-hidden="true" />}
      {variant === "helpline" && <PhoneCall className="w-3 h-3 shrink-0" aria-hidden="true" />}
      {label && <span className="text-fog select-none">{label}:</span>}
      <span className="truncate max-w-[260px]">{displayValue}</span>

      {copyable && (
        <button
          type="button"
          onClick={handleCopy}
          className="ml-1 p-0.5 hover:text-paper rounded focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-signal"
          aria-label={copied ? "Copied" : "Copy to clipboard"}
          title={copied ? "Copied" : "Copy value"}
        >
          {copied ? <Check className="w-3 h-3 text-verdict-safe" /> : <Copy className="w-3 h-3 opacity-70 hover:opacity-100" />}
        </button>
      )}
    </div>
  );
};
