"use client";

import React from "react";
import { 
  FileSearch, 
  BrainCircuit, 
  ShieldCheck, 
  Scale, 
  HeartHandshake, 
  CheckCircle2, 
  Loader2, 
  Clock 
} from "lucide-react";
import { AgentStageStatus } from "../hooks/useAnalysis";
import { useI18n } from "../lib/i18n";

interface PipelineViewProps {
  stages: AgentStageStatus[];
  isAnalyzing: boolean;
}

const AGENT_ICONS = {
  extractor: FileSearch,
  pattern_analyst: BrainCircuit,
  entity_checker: ShieldCheck,
  judge: Scale,
  advisor: HeartHandshake,
};

export function PipelineView({ stages, isAnalyzing }: PipelineViewProps) {
  const { t } = useI18n();

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6 my-6 transition">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base sm:text-lg font-bold text-slate-800 flex items-center space-x-2">
          <BrainCircuit className="w-5 h-5 text-blue-600" />
          <span>{t("pipeline.heading")}</span>
        </h3>
        {isAnalyzing && (
          <span className="flex items-center space-x-1.5 text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full animate-pulse border border-blue-200">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Active Pipeline</span>
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {stages.map((stage) => {
          const Icon = AGENT_ICONS[stage.id];
          const isPending = stage.state === "pending";
          const isRunning = stage.state === "running";
          const isDone = stage.state === "done";

          return (
            <div
              key={stage.id}
              className={`p-3.5 rounded-xl border transition flex flex-col justify-between ${
                isRunning
                  ? "bg-blue-50/70 border-blue-400 ring-2 ring-blue-100"
                  : isDone
                  ? "bg-emerald-50/50 border-emerald-300"
                  : "bg-slate-50/60 border-slate-200 opacity-75"
              }`}
            >
              {/* Top: Icon & Name */}
              <div className="flex items-start justify-between">
                <div
                  className={`p-2 rounded-lg ${
                    isRunning
                      ? "bg-blue-600 text-white"
                      : isDone
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                {isRunning && <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />}
                {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                {isPending && <Clock className="w-4 h-4 text-slate-400" />}
              </div>

              {/* Middle: Agent Title */}
              <div className="my-2.5">
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  {t(stage.nameKey)}
                </div>
                <div className="text-[11px] font-medium text-slate-500 mt-0.5">
                  {isRunning
                    ? t("pipeline.statusRunning")
                    : isDone
                    ? t("pipeline.statusDone")
                    : t("pipeline.statusPending")}
                </div>
              </div>

              {/* Bottom: Latency Badge if completed */}
              <div className="text-[10px] text-slate-400 font-mono">
                {isDone && stage.durationMs ? `${stage.durationMs.toFixed(0)} ms` : "—"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
