import React from "react";
import { cn } from "@/lib/utils";

export interface PillProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "signal" | "safe" | "suspicious" | "scam" | "muted";
  dot?: boolean;
}

export const Pill: React.FC<PillProps> = ({
  variant = "muted",
  dot = false,
  children,
  className,
  ...props
}) => {
  const variantStyles = {
    signal: "bg-signal/10 border-signal/30 text-signal",
    safe: "bg-verdict-safe/10 border-verdict-safe/30 text-verdict-safe",
    suspicious: "bg-verdict-suspicious/10 border-verdict-suspicious/30 text-verdict-suspicious",
    scam: "bg-verdict-scam/10 border-verdict-scam/30 text-verdict-scam",
    muted: "bg-raised border-hairline text-fog",
  }[variant];

  const dotColors = {
    signal: "bg-signal",
    safe: "bg-verdict-safe",
    suspicious: "bg-verdict-suspicious",
    scam: "bg-verdict-scam",
    muted: "bg-fog",
  }[variant];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-mono uppercase tracking-wider rounded-full border select-none",
        variantStyles,
        className
      )}
      {...props}
    >
      {dot && <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotColors)} aria-hidden="true" />}
      {children}
    </span>
  );
};
