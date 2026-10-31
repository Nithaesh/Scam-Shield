import React from "react";
import { cn } from "@/lib/utils";

export interface SpecRowProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  value: React.ReactNode;
  monoValue?: boolean;
  highlight?: boolean;
}

export const SpecRow: React.FC<SpecRowProps> = ({
  label,
  value,
  monoValue = true,
  highlight = false,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        "flex items-center justify-between py-2.5 px-3 border-b border-hairline/60 last:border-b-0 text-sm gap-4 transition-colors",
        highlight && "bg-signal/5",
        className
      )}
      {...props}
    >
      <span className="text-fog text-xs sm:text-sm select-none">{label}</span>
      <span
        className={cn(
          "text-paper text-right font-medium text-xs sm:text-sm",
          monoValue && "font-mono tabular-nums"
        )}
      >
        {value}
      </span>
    </div>
  );
};
