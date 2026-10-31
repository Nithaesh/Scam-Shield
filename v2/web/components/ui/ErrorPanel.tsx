"use client";

import React, { useState } from "react";
import { AlertTriangle, RotateCcw, X, ShieldAlert, PhoneCall, ChevronDown, ChevronUp, Terminal, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ErrorPanelProps {
  error: string;
  caseId?: string;
  isHi?: boolean;
  onRetry?: () => void;
  onClear?: () => void;
  onDismiss?: () => void;
  onUseOfflineSimulation?: () => void;
  className?: string;
}

export const ErrorPanel: React.FC<ErrorPanelProps> = ({
  error,
  caseId = "SS-ERROR",
  isHi = false,
  onRetry,
  onClear,
  onDismiss,
  onUseOfflineSimulation,
  className,
}) => {
  const [detailsOpen, setDetailsOpen] = useState(false);

  return (
    <div
      className={cn(
        "w-full rounded-2xl bg-gradient-to-b from-[#180B12]/95 to-[#0F070B]/95 border border-rose-500/40 p-5 shadow-2xl backdrop-blur-xl space-y-4 animate-in fade-in slide-in-from-top-4 duration-300",
        className
      )}
      role="alert"
    >
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-3 border-b border-rose-500/20 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-bold text-sm text-white">
                {isHi ? "फॉरेंसिक विश्लेषण में त्रुटि" : "Forensic Pipeline Error"}
              </span>
              <span className="font-mono text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full font-bold">
                {caseId}
              </span>
            </div>
            <p className="text-xs text-rose-200/80 font-sans mt-0.5">
              {isHi
                ? "संदेश की जांच करते समय एक अप्रत्याशित समस्या उत्पन्न हुई।"
                : "The multi-agent inspection encountered a communication or processing error."}
            </p>
          </div>
        </div>

        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.08] transition-colors"
            title="Dismiss error"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Main Error Description Box */}
      <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/20 text-xs font-mono text-rose-200 flex items-start gap-2 break-words">
        <Terminal className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
        <span className="flex-1">{error}</span>
      </div>

      {/* Recovery Action Buttons */}
      <div className="flex flex-wrap items-center gap-2.5 pt-1">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs font-mono transition-all shadow-md"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isHi ? "पुनः प्रयास करें" : "Retry Analysis"}</span>
          </button>
        )}

        {onUseOfflineSimulation && (
          <button
            type="button"
            onClick={onUseOfflineSimulation}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] text-white text-xs font-mono transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>{isHi ? "ऑफ़लाइन सिमुलेशन मोड चलाएं" : "Run Offline Simulation"}</span>
          </button>
        )}

        {onClear && (
          <button
            type="button"
            onClick={onClear}
            className="px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 text-xs font-mono transition-colors"
          >
            {isHi ? "मैसेज हटाएं" : "Clear Input"}
          </button>
        )}

        <a
          href="tel:1930"
          className="ml-auto inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs font-mono hover:bg-rose-500/20 transition-colors"
          title="National Cyber Crime Helpline"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>{isHi ? "कॉल 1930" : "Dial 1930"}</span>
        </a>
      </div>

      {/* Collapsible Diagnostics */}
      <div className="pt-1 border-t border-white/[0.05]">
        <button
          type="button"
          onClick={() => setDetailsOpen(!detailsOpen)}
          className="text-[11px] font-mono text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
        >
          <span>{detailsOpen ? (isHi ? "विवरण छुपाएं" : "Hide Diagnostics") : (isHi ? "तकनीकी विवरण देखें" : "View Diagnostics")}</span>
          {detailsOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        {detailsOpen && (
          <div className="mt-2 p-2.5 rounded-lg bg-black/40 border border-white/[0.06] text-[10px] font-mono text-slate-400 space-y-1">
            <div>Timestamp: {new Date().toISOString()}</div>
            <div>Node Target: FastAPI /api/v2/analyze/stream</div>
            <div>Air-Gap Safety: Memory-Only Sandbox Active (0 bytes persisted)</div>
          </div>
        )}
      </div>
    </div>
  );
};
