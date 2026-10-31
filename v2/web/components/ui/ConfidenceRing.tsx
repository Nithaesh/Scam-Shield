"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export interface ConfidenceRingProps extends React.HTMLAttributes<HTMLDivElement> {
  score: number; // 0 to 100
  verdict?: "safe" | "suspicious" | "scam" | "neutral";
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
}

export const ConfidenceRing: React.FC<ConfidenceRingProps> = ({
  score,
  verdict = "neutral",
  size = 72,
  strokeWidth = 6,
  showLabel = true,
  className,
  ...props
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, score));
  const strokeDashoffset = circumference - (clamped / 100) * circumference;

  const strokeColor = {
    safe: "var(--color-verdict-safe, #15803D)",
    suspicious: "var(--color-verdict-suspicious, #D97706)",
    scam: "var(--color-verdict-scam, #DC2626)",
    neutral: "var(--color-signal, #F26522)",
  }[verdict];

  return (
    <div
      className={cn("relative inline-flex items-center justify-center shrink-0 select-none", className)}
      style={{ width: size, height: size }}
      {...props}
    >
      <svg width={size} height={size} className="rotate-[-90deg]">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="var(--color-hairline, rgba(255,255,255,0.08))"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Fill */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1] }}
          strokeLinecap="round"
          fill="transparent"
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="font-mono font-bold text-paper tabular-nums text-sm leading-none">
            {Math.round(clamped)}%
          </span>
          <span className="text-[9px] font-mono uppercase text-fog mt-0.5">conf</span>
        </div>
      )}
    </div>
  );
};
