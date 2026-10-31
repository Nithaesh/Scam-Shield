"use client";

import React from "react";
import { History, Trash2, ShieldCheck, ShieldAlert, AlertTriangle } from "lucide-react";
import { ScanHistoryItem } from "../hooks/useAnalysis";
import { useI18n } from "../lib/i18n";

interface HistoryDrawerProps {
  history: ScanHistoryItem[];
  clearHistory: () => void;
  onSelectSnippet: (snippet: string) => void;
}

export function HistoryDrawer({
  history,
  clearHistory,
  onSelectSnippet,
}: HistoryDrawerProps) {
  const { t } = useI18n();

  if (history.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 my-6">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2 text-sm font-bold text-slate-800">
          <History className="w-4 h-4 text-slate-500" />
          <span>{t("history.title")}</span>
        </div>
        <button
          type="button"
          onClick={clearHistory}
          className="text-xs text-slate-500 hover:text-rose-600 flex items-center space-x-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>{t("history.clear")}</span>
        </button>
      </div>

      <div className="divide-y divide-slate-100 mt-2">
        {history.map((item) => {
          const isScam = item.verdict === "scam";
          const isSuspicious = item.verdict === "suspicious";

          const Icon = isScam ? ShieldAlert : isSuspicious ? AlertTriangle : ShieldCheck;
          const badgeClass = isScam
            ? "text-rose-700 bg-rose-50 border-rose-200"
            : isSuspicious
            ? "text-amber-700 bg-amber-50 border-amber-200"
            : "text-emerald-700 bg-emerald-50 border-emerald-200";

          return (
            <div
              key={item.id}
              onClick={() => onSelectSnippet(item.textSnippet)}
              className="py-2.5 flex items-center justify-between hover:bg-slate-50 rounded-lg px-2 cursor-pointer transition"
            >
              <div className="flex items-center space-x-3 overflow-hidden mr-3">
                <Icon className={`w-4 h-4 flex-shrink-0 ${isScam ? "text-rose-600" : isSuspicious ? "text-amber-600" : "text-emerald-600"}`} />
                <span className="text-xs sm:text-sm font-medium text-slate-800 truncate">
                  {item.textSnippet}
                </span>
              </div>
              <div className="flex items-center space-x-2 flex-shrink-0">
                <span className="text-[11px] text-slate-400 font-mono">
                  {item.timestamp}
                </span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${badgeClass} uppercase`}>
                  {item.verdict}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
