"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface EvidenceItem {
  label: string;
  count: number;
  color: string;
}

export interface EvidenceDonutProps extends React.HTMLAttributes<HTMLDivElement> {
  items: EvidenceItem[];
  size?: number;
  strokeWidth?: number;
  centerText?: string;
  centerSubtext?: string;
}

export const EvidenceDonut: React.FC<EvidenceDonutProps> = ({
  items,
  size = 110,
  strokeWidth = 14,
  centerText,
  centerSubtext = "checks",
  className,
  ...props
}) => {
  const total = items.reduce((sum, item) => sum + item.count, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <div className={cn("flex flex-col sm:flex-row items-center gap-4", className)} {...props}>
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="rotate-[-90deg]">
          {/* Base track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="var(--color-hairline, rgba(255,255,255,0.08))"
            strokeWidth={strokeWidth}
            fill="transparent"
          />

          {total > 0 &&
            items.map((item, index) => {
              const itemPercent = (item.count / total) * 100;
              const strokeDasharray = `${(itemPercent / 100) * circumference} ${circumference}`;
              const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
              accumulatedPercent += itemPercent;

              return (
                <circle
                  key={index}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  stroke={item.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  fill="transparent"
                  className="transition-all duration-500"
                />
              );
            })}
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="font-mono font-bold text-paper text-sm leading-none tabular-nums">
            {centerText ?? total}
          </span>
          {centerSubtext && (
            <span className="text-[10px] text-fog font-mono uppercase mt-0.5">{centerSubtext}</span>
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-1.5 text-xs">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: item.color }}
              aria-hidden="true"
            />
            <span className="text-fog">{item.label}</span>
            <span className="font-mono font-semibold text-paper ml-auto tabular-nums pl-2">
              {item.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
