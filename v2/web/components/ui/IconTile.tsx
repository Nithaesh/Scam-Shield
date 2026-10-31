import React from "react";
import { cn } from "@/lib/utils";

export interface IconTileProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: React.ReactNode;
  size?: "sm" | "md" | "lg";
  tone?: "default" | "signal" | "safe" | "suspicious" | "scam";
}

export const IconTile: React.FC<IconTileProps> = ({
  icon,
  size = "md",
  tone = "default",
  className,
  ...props
}) => {
  const sizeClasses = {
    sm: "w-7 h-7 rounded-md p-1.5 [&_svg]:w-3.5 [&_svg]:h-3.5",
    md: "w-9 h-9 rounded-lg p-2 [&_svg]:w-4 [&_svg]:h-4",
    lg: "w-11 h-11 rounded-xl p-2.5 [&_svg]:w-5 [&_svg]:h-5",
  }[size];

  const toneClasses = {
    default: "bg-raised border-hairline text-fog",
    signal: "bg-signal/10 border-signal/30 text-signal",
    safe: "bg-verdict-safe/10 border-verdict-safe/30 text-verdict-safe",
    suspicious: "bg-verdict-suspicious/10 border-verdict-suspicious/30 text-verdict-suspicious",
    scam: "bg-verdict-scam/10 border-verdict-scam/30 text-verdict-scam",
  }[tone];

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center shrink-0 border shadow-xs relative overflow-hidden",
        "before:absolute before:inset-x-0 before:top-0 before:h-[1px] before:bg-white/10",
        sizeClasses,
        toneClasses,
        className
      )}
      {...props}
    >
      {icon}
    </div>
  );
};
