"use client";

import React, { useEffect } from "react";
import { AlertTriangle, RotateCcw, PhoneCall, ShieldAlert, Home, Terminal } from "lucide-react";
import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Scam Shield Global Fatal Error:", error);
  }, [error]);

  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#060913] text-slate-100 antialiased flex items-center justify-center p-4 sm:p-6 font-sans selection:bg-cyan-500/20 selection:text-cyan-400">
        <div className="w-full max-w-lg rounded-3xl bg-[#0c1220]/95 border border-rose-500/30 p-6 sm:p-8 shadow-2xl backdrop-blur-2xl space-y-6 text-center relative overflow-hidden">
          {/* Ambient Glow */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Glowing Shield Icon */}
          <div className="relative mx-auto w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center shadow-lg shadow-rose-500/10">
            <ShieldAlert className="w-8 h-8 animate-pulse text-rose-400" />
          </div>

          {/* Headings */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/15 border border-rose-500/30 text-[11px] font-mono font-bold uppercase tracking-wider text-rose-300">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>System Recovery // Error 500</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-white tracking-tight">
              Application Error
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans max-w-md mx-auto">
              The multi-agent security pipeline encountered an unexpected runtime exception. Your data remains air-gapped and protected.
            </p>
            <p className="text-[11px] text-slate-400 font-sans">
              मल्टी-एजेंट सुरक्षा पाइपलाइन में त्रुटि हुई। आपका डेटा सुरक्षित है।
            </p>
          </div>

          {/* Diagnostic Code Box */}
          <div className="p-3.5 rounded-xl bg-black/40 border border-rose-500/20 text-left font-mono text-xs text-rose-300/90 space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase tracking-wider border-b border-white/[0.06] pb-1.5">
              <Terminal className="w-3 h-3 text-rose-400" />
              <span>Diagnostics</span>
              {error?.digest && (
                <span className="ml-auto text-slate-400 font-bold">ID: {error.digest}</span>
              )}
            </div>
            <p className="text-[11px] text-rose-200 break-words leading-relaxed">
              {error?.message || "An unhandled exception occurred in the client application bundle."}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 justify-center pt-2">
            <button
              type="button"
              onClick={() => reset()}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-rose-500/20"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reload System</span>
            </button>

            <a
              href="tel:1930"
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-mono font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5 text-rose-400" />
              <span>Dial 1930 Helpline</span>
            </a>

            <a
              href="/en"
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-white/[0.1] bg-white/[0.05] hover:bg-white/[0.1] text-white text-xs font-mono flex items-center justify-center gap-2 transition-colors"
            >
              <Home className="w-3.5 h-3.5 text-slate-400" />
              <span>Return Home</span>
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
