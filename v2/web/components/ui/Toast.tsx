"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { CheckCircle2, AlertTriangle, Info, ShieldAlert, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toast: {
    success: (title: string, message?: string) => void;
    error: (title: string, message?: string) => void;
    info: (title: string, message?: string) => void;
    warning: (title: string, message?: string) => void;
  };
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type: ToastType, title: string, message?: string, duration = 3500) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newToast: ToastItem = { id, type, title, message, duration };

    setToasts((prev) => [...prev.slice(-3), newToast]); // Keep max 4 active

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const toast = {
    success: (title: string, message?: string) => addToast("success", title, message),
    error: (title: string, message?: string) => addToast("error", title, message, 5000),
    info: (title: string, message?: string) => addToast("info", title, message),
    warning: (title: string, message?: string) => addToast("warning", title, message, 4500),
  };

  return (
    <ToastContext.Provider value={{ toast, removeToast }}>
      {children}

      {/* Floating Toast Viewport */}
      <div
        className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
        aria-live="polite"
        role="region"
      >
        {toasts.map((item) => (
          <div
            key={item.id}
            className={cn(
              "pointer-events-auto w-full rounded-2xl p-3.5 backdrop-blur-2xl shadow-2xl border transition-all duration-300 animate-in slide-in-from-bottom-5 fade-in",
              item.type === "success" && "bg-[#091512]/95 border-emerald-500/40 text-emerald-300 shadow-emerald-500/10",
              item.type === "error" && "bg-[#180C14]/95 border-rose-500/40 text-rose-300 shadow-rose-500/10",
              item.type === "warning" && "bg-[#18140B]/95 border-amber-500/40 text-amber-300 shadow-amber-500/10",
              item.type === "info" && "bg-[#090E1D]/95 border-cyan-500/40 text-cyan-300 shadow-cyan-500/10"
            )}
          >
            <div className="flex items-start gap-3">
              <div className="shrink-0 mt-0.5">
                {item.type === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                {item.type === "error" && <AlertTriangle className="w-4 h-4 text-rose-400" />}
                {item.type === "warning" && <ShieldAlert className="w-4 h-4 text-amber-400" />}
                {item.type === "info" && <Info className="w-4 h-4 text-cyan-400" />}
              </div>

              <div className="flex-1 min-w-0 space-y-0.5">
                <div className="font-heading font-semibold text-xs text-white tracking-tight leading-tight">
                  {item.title}
                </div>
                {item.message && (
                  <p className="text-[11px] text-slate-300 leading-normal font-sans break-words">
                    {item.message}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => removeToast(item.id)}
                className="shrink-0 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
                title="Dismiss"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Graceful fallback if used outside provider
    return {
      toast: {
        success: (title: string, msg?: string) => console.log("[Toast Success]", title, msg),
        error: (title: string, msg?: string) => console.error("[Toast Error]", title, msg),
        info: (title: string, msg?: string) => console.log("[Toast Info]", title, msg),
        warning: (title: string, msg?: string) => console.warn("[Toast Warning]", title, msg),
      },
      removeToast: () => {},
    };
  }
  return context;
}
