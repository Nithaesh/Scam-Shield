"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, PhoneCall, ShieldAlert, Home, Terminal } from "lucide-react";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Scam Shield Root Error Caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 antialiased flex items-center justify-center p-4 sm:p-6 font-sans selection:bg-cyan-500/20 selection:text-cyan-400">
      <div className="w-full max-w-lg rounded-3xl bg-[#0c1220]/95 border border-rose-500/30 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl space-y-6 text-center relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative mx-auto w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center shadow-lg shadow-rose-500/10">
          <ShieldAlert className="w-8 h-8 animate-pulse text-rose-400" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-[11px] font-mono font-bold uppercase tracking-wider text-rose-300">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Pipeline Recovery // Error</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-heading font-bold text-white tracking-tight">
            Something went wrong
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans max-w-md mx-auto">
            The multi-agent investigation system encountered an unexpected error. Zero citizen data was compromised.
          </p>
          <p className="text-[11px] text-slate-400 font-sans">
            मल्टी-एजेंट जांच प्रणाली में समस्या आई। डेटा पूरी तरह सुरक्षित है।
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-black/40 border border-rose-500/20 text-left font-mono text-xs text-rose-300/90 space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase tracking-wider border-b border-white/[0.06] pb-1.5">
            <Terminal className="w-3 h-3 text-rose-400" />
            <span>Diagnostics</span>
            {error?.digest && (
              <span className="ml-auto text-slate-400 font-bold">ID: {error.digest}</span>
            )}
          </div>
          <p className="text-[11px] text-rose-200 break-words leading-relaxed">
            {error?.message || "An unexpected error occurred during execution."}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 justify-center pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-rose-500/20"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>

          <a
            href="tel:1930"
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-mono font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5 text-rose-400" />
            <span>Dial 1930</span>
          </a>

          <Link
            href="/en"
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-white/[0.1] bg-white/[0.05] hover:bg-white/[0.1] text-white text-xs font-mono flex items-center justify-center gap-2 transition-colors"
          >
            <Home className="w-3.5 h-3.5 text-slate-400" />
            <span>Return Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
