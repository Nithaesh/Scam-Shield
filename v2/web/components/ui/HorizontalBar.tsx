"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export interface HorizontalBarProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  percentage: number;
  sublabel?: string;
  tone?: "signal" | "safe" | "scam" | "default";
}

export const HorizontalBar: React.FC<HorizontalBarProps> = ({
  label,
  percentage,
  sublabel,
  tone = "signal",
  className,
  ...props
}) => {
  const barColors = {
    signal: "bg-signal",
    safe: "bg-verdict-safe",
    scam: "bg-verdict-scam",
    default: "bg-fog",
  }[tone];

  const clamped = Math.max(0, Math.min(100, percentage));

  return (
    <div className={cn("space-y-1.5", className)} {...props}>
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-paper truncate">{label}</span>
        <div className="flex items-center gap-2 shrink-0">
          {sublabel && <span className="text-fog text-[11px]">{sublabel}</span>}
          <span className="font-mono font-semibold text-paper tabular-nums">{clamped.toFixed(1)}%</span>
        </div>
      </div>
      <div className="h-2 w-full bg-raised rounded-full overflow-hidden p-[1px] border border-hairline/60">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${clamped}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className={cn("h-full rounded-full", barColors)}
        />
      </div>
    </div>
  );
};
