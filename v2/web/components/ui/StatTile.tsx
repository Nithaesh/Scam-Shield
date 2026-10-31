"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Info, X } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";

export interface StatTileProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string | number;
  unit?: string;
  label: string;
  caption?: string;
  icon?: React.ReactNode;
  measurementDetail?: string;
}

export const StatTile: React.FC<StatTileProps> = ({
  value,
  unit,
  label,
  caption,
  icon,
  measurementDetail,
  className,
  ...props
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={cn(
        "p-5 rounded-2xl bg-panel border border-hairline/80 shadow-xs relative overflow-hidden flex flex-col justify-between",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-mono tracking-wider uppercase text-fog">{label}</span>
        {icon && <div className="text-fog/70">{icon}</div>}
      </div>

      <div className="flex items-baseline gap-1 my-1">
        <span className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-paper tabular-nums">
          {value}
        </span>
        {unit && <span className="text-base font-semibold text-signal">{unit}</span>}
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        {caption && <span className="text-xs text-fog leading-relaxed">{caption}</span>}
        {measurementDetail && (
          <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger asChild>
              <button
                type="button"
                className="inline-flex items-center gap-1 text-[11px] text-fog hover:text-signal transition-colors shrink-0 underline decoration-dotted underline-offset-2"
                aria-label="Measurement details"
              >
                <Info className="w-3 h-3" />
                <span>Method</span>
              </button>
            </Dialog.Trigger>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 animate-in fade-in" />
              <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md p-6 bg-panel border border-hairline rounded-2xl shadow-xl z-50 animate-in zoom-in-95">
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title className="font-heading text-lg font-semibold text-paper">
                    Measurement: {label}
                  </Dialog.Title>
                  <Dialog.Close className="text-fog hover:text-paper p-1 rounded-md">
                    <X className="w-4 h-4" />
                  </Dialog.Close>
                </div>
                <Dialog.Description className="text-sm text-fog leading-relaxed">
                  {measurementDetail}
                </Dialog.Description>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        )}
      </div>
    </div>
  );
};
