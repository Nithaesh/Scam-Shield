"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "signal" | "raised" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "raised", size = "md", isLoading = false, leftIcon, children, disabled, ...props }, ref) => {
    const sizeClasses = {
      sm: "h-10 px-3.5 text-xs rounded-lg gap-2",
      md: "h-12 px-5 text-sm font-medium rounded-xl gap-2.5",
      lg: "h-14 px-6 text-base font-semibold rounded-xl gap-3",
    }[size];

    const variantClasses = {
      signal:
        "bg-signal text-white font-semibold shadow-sm hover:brightness-110 active:brightness-95 border border-signal/20",
      raised:
        "bg-raised text-paper hover:bg-hairline active:scale-[0.99] border border-hairline/80 shadow-xs",
      ghost:
        "text-fog hover:text-paper hover:bg-raised/60 active:bg-raised",
      danger:
        "bg-verdict-scam text-white hover:brightness-110 active:brightness-95 border border-verdict-scam/20",
      outline:
        "border border-hairline text-paper hover:border-fog/50 hover:bg-raised/40",
    }[variant];

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center select-none transition-all duration-150 cursor-pointer",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/80 focus-visible:ring-offset-2 focus-visible:ring-offset-page",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
          sizeClasses,
          variantClasses,
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />
        ) : leftIcon ? (
          <span className="shrink-0">{leftIcon}</span>
        ) : null}
        <span>{children}</span>
      </button>
    );
  }
);

Button.displayName = "Button";
