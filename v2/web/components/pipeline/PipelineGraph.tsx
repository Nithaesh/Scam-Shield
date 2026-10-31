"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import {
  MessageSquare,
  Search,
  BrainCircuit,
  ShieldCheck,
  Scale,
  LifeBuoy,
  Stamp,
  Check,
  AlertTriangle,
  X,
  Wrench,
  FileCode,
  FileSpreadsheet,
  Bot,
  GitBranch,
  Mail,
  Clock,
  Shield,
  Send,
} from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { PIPELINE_NODES, AgentNodeMeta } from "@/lib/pipeline/graph";

export interface PipelineGraphProps {
  variant?: "hero" | "full" | "compact" | "mobile-vertical";
  activeStage?: string | null;
  completedStages?: string[];
  verdict?: "safe" | "suspicious" | "scam" | null;
  locale?: string;
  className?: string;
}

export const PipelineGraph: React.FC<PipelineGraphProps> = ({
  variant = "full",
  activeStage,
  completedStages = [],
  verdict,
  locale = "en",
  className,
}) => {
  const [selectedNode, setSelectedNode] = useState<AgentNodeMeta | null>(null);

  // Scripted looping demo for hero mode (14 second cycle)
  const [heroStep, setHeroStep] = useState(0);

  useEffect(() => {
    if (variant !== "hero") return;
    const interval = setInterval(() => {
      setHeroStep((prev) => (prev + 1) % 6);
    }, 2400);
    return () => clearInterval(interval);
  }, [variant]);

  const heroStages = ["message", "extractor", "parallel", "judge", "advisor", "verdict"];
  const currentHeroStage = heroStages[heroStep];

  const isNodeActive = (nodeId: string): boolean => {
    if (variant === "hero") {
      if (currentHeroStage === "parallel") {
        return nodeId === "pattern_analyst" || nodeId === "entity_checker";
      }
      return currentHeroStage === nodeId;
    }
    return activeStage === nodeId;
  };

  const isNodeDone = (nodeId: string): boolean => {
    if (variant === "hero") {
      const idx = heroStages.indexOf(
        nodeId === "pattern_analyst" || nodeId === "entity_checker" ? "parallel" : nodeId
      );
      return heroStep > idx;
    }
    return completedStages.includes(nodeId);
  };

  /* =========================================================================
   * COMPACT VIEW (FOR HERMES CONSOLE RIGHT RAIL)
   * ========================================================================= */
  if (variant === "compact") {
    return (
      <div className={cn("p-4 bg-[#0A0F1E] border border-white/[0.08] rounded-2xl space-y-3", className)}>
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono uppercase tracking-wider text-slate-400">Pipeline Consensus</span>
          <span className="font-mono text-signal font-semibold">5 Nodes</span>
        </div>
        <div className="flex items-center justify-between gap-1.5">
          {PIPELINE_NODES.slice(1, 6).map((node) => {
            const active = isNodeActive(node.id);
            const done = isNodeDone(node.id);
            return (
              <button
                key={node.id}
                type="button"
                onClick={() => setSelectedNode(node)}
                title={`${node.name} (${node.role})`}
                className={cn(
                  "flex-1 p-2 rounded-xl border text-center transition-all flex flex-col items-center gap-1",
                  active
                    ? "bg-signal/20 border-signal text-signal shadow-sm ring-1 ring-signal/50 animate-pulse"
                    : done
                    ? "bg-[#141B2D] border-white/[0.1] text-white"
                    : "bg-[#0E1424] border-white/[0.05] text-slate-500 hover:text-slate-300"
                )}
              >
                <div className="w-6 h-6 rounded-lg bg-white/[0.06] flex items-center justify-center">
                  {getNodeIcon(node.id)}
                </div>
                <span className="text-[10px] font-mono leading-none truncate max-w-full">
                  {node.name.split(" ")[0]}
                </span>
              </button>
            );
          })}
        </div>
        {renderDetailModal()}
      </div>
    );
  }

  /* =========================================================================
   * N8N-STYLE WORKFLOW NODE GRAPH (SCREENSHOT 2 REPRODUCTION)
   * Beautiful dark canvas with branching paths:
   * [Message] -> [Extractor] -> [Switch] --(true: Technical Risk)--> [Entity Checker] ----\
   *                                      --(false: Linguistic Urgency)--> [Pattern Analyst] --+--> [Judge] -> [Advisor] -> [Verdict]
   * ========================================================================= */
  return (
    <div
      className={cn(
        "relative w-full rounded-2xl bg-[#090E1A] border border-white/[0.08] p-6 sm:p-8 overflow-hidden shadow-2xl",
        className
      )}
    >
      {/* Background Tech Dots Grid (Screenshot 2 Style) */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, #38BDF8 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Top Header Section (Screenshot 2 Style) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 relative z-10 border-b border-white/[0.06] pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2.5 h-2.5 rounded-full bg-signal animate-pulse" />
            <span className="font-heading font-bold text-lg sm:text-xl text-white tracking-tight">
              AI Scam Intelligence Pipeline
            </span>
          </div>
          <p className="text-xs sm:text-sm font-sans text-slate-400 flex items-center gap-2">
            <span>Ingest</span>
            <span className="text-slate-600">→</span>
            <span>Extract Entities</span>
            <span className="text-slate-600">→</span>
            <span className="text-signal">Parallel Forensics</span>
            <span className="text-slate-600">→</span>
            <span>Consensus Veto</span>
            <span className="text-slate-600">→</span>
            <span className="text-emerald-400">Citizen Action</span>
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-mono px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-slate-300">
            Directed Acyclic Graph (DAG)
          </span>
        </div>
      </div>

      {/* Interactive Workflow Canvas */}
      <div className="relative w-full overflow-x-auto pb-4">
        <div className="min-w-[960px] h-[300px] relative">
          {/* SVG Connector Bezier Lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 960 300">
            <defs>
              <linearGradient id="n8nActiveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#38BDF8" />
                <stop offset="100%" stopColor="#10B981" />
              </linearGradient>
              <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <filter id="glow-emerald" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <filter id="glow-rose" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Path 1: Message (100, 150) -> Extractor (160, 150) */}
            <path
              d="M 120 150 L 160 150"
              stroke={isNodeActive("extractor") || isNodeDone("extractor") ? "#38BDF8" : "#2A354C"}
              strokeWidth={isNodeActive("extractor") ? "3.5" : "2.5"}
              fill="none"
              filter={isNodeActive("extractor") ? "url(#glow-cyan)" : undefined}
              className="transition-all duration-300"
            />
            {/* Path 2: Extractor (260, 150) -> Switch (310, 150) */}
            <path
              d="M 260 150 L 310 150"
              stroke={isNodeDone("extractor") ? "#38BDF8" : "#2A354C"}
              strokeWidth={isNodeDone("extractor") ? "3" : "2.5"}
              fill="none"
              className="transition-all duration-300"
            />

            {/* Path 3 (Branch True): Switch (370, 140) -> Entity Checker (480, 75) */}
            <path
              d="M 370 140 C 420 140, 430 75, 480 75"
              stroke={isNodeActive("entity_checker") || isNodeDone("entity_checker") ? "#10B981" : "#1e4034"}
              strokeWidth={isNodeActive("entity_checker") ? "3.5" : "2.5"}
              strokeDasharray={isNodeActive("entity_checker") ? "6 6" : "4 4"}
              fill="none"
              filter={isNodeActive("entity_checker") ? "url(#glow-emerald)" : undefined}
              className="transition-all duration-300"
            />

            {/* Path 4 (Branch False): Switch (370, 160) -> Pattern Analyst (480, 225) */}
            <path
              d="M 370 160 C 420 160, 430 225, 480 225"
              stroke={isNodeActive("pattern_analyst") || isNodeDone("pattern_analyst") ? "#F43F5E" : "#4c1d28"}
              strokeWidth={isNodeActive("pattern_analyst") ? "3.5" : "2.5"}
              strokeDasharray={isNodeActive("pattern_analyst") ? "6 6" : "4 4"}
              fill="none"
              filter={isNodeActive("pattern_analyst") ? "url(#glow-rose)" : undefined}
              className="transition-all duration-300"
            />

            {/* Path 5: Entity Checker (580, 75) -> Judge (680, 140) */}
            <path
              d="M 580 75 C 630 75, 630 140, 680 140"
              stroke={isNodeActive("judge") || isNodeDone("judge") ? "#38BDF8" : "#2A354C"}
              strokeWidth={isNodeActive("judge") ? "3.5" : "2.5"}
              fill="none"
              filter={isNodeActive("judge") ? "url(#glow-cyan)" : undefined}
              className="transition-all duration-300"
            />

            {/* Path 6: Pattern Analyst (580, 225) -> Judge (680, 160) */}
            <path
              d="M 580 225 C 630 225, 630 160, 680 160"
              stroke={isNodeActive("judge") || isNodeDone("judge") ? "#38BDF8" : "#2A354C"}
              strokeWidth={isNodeActive("judge") ? "3.5" : "2.5"}
              fill="none"
              filter={isNodeActive("judge") ? "url(#glow-cyan)" : undefined}
              className="transition-all duration-300"
            />

            {/* Path 7: Judge (730, 150) -> Advisor (780, 150) */}
            <path
              d="M 730 150 L 780 150"
              stroke={isNodeActive("advisor") || isNodeDone("advisor") ? "#A855F7" : "#2A354C"}
              strokeWidth={isNodeActive("advisor") ? "3.5" : "2.5"}
              fill="none"
              className="transition-all duration-300"
            />

            {/* Path 8: Advisor (840, 150) -> Verdict (890, 150) */}
            <path
              d="M 840 150 L 890 150"
              stroke={verdict ? (verdict === "scam" ? "#F43F5E" : "#10B981") : "#2A354C"}
              strokeWidth={verdict ? "3.5" : "2.5"}
              fill="none"
              className="transition-all duration-300"
            />

            {/* LIVE PACKET PULSES: Real-Time Animated Movement */}
            {(isNodeActive("extractor") || variant === "hero") && (
              <circle r="4.5" fill="#38BDF8" className="filter drop-shadow-[0_0_8px_#38BDF8]">
                <animateMotion
                  dur={isNodeActive("extractor") ? "0.8s" : "2.4s"}
                  repeatCount="indefinite"
                  path="M 120 150 L 210 150"
                />
              </circle>
            )}

            {(isNodeActive("entity_checker") || isNodeActive("pattern_analyst") || variant === "hero") && (
              <>
                <circle r="4.5" fill="#10B981" className="filter drop-shadow-[0_0_8px_#10B981]">
                  <animateMotion
                    dur="1.2s"
                    repeatCount="indefinite"
                    path="M 370 140 C 420 140, 430 75, 530 75"
                  />
                </circle>
                <circle r="4.5" fill="#F43F5E" className="filter drop-shadow-[0_0_8px_#F43F5E]">
                  <animateMotion
                    dur="1.2s"
                    repeatCount="indefinite"
                    path="M 370 160 C 420 160, 430 225, 530 225"
                  />
                </circle>
              </>
            )}

            {(isNodeActive("judge") || variant === "hero") && (
              <circle r="4.5" fill="#38BDF8" className="filter drop-shadow-[0_0_8px_#38BDF8]">
                <animateMotion
                  dur="0.9s"
                  repeatCount="indefinite"
                  path="M 550 75 C 630 75, 630 140, 705 150"
                />
              </circle>
            )}

            {!activeStage && (
              <circle r="4" fill="#38BDF8" opacity="0.7" className="filter drop-shadow-[0_0_6px_#38BDF8]">
                <animateMotion
                  dur="6s"
                  repeatCount="indefinite"
                  path="M 70 150 L 210 150 L 340 150 C 420 140, 430 75, 530 75 C 630 75, 630 140, 705 150 L 810 150 L 910 150"
                />
              </circle>
            )}
          </svg>

          {/* Node 1: Ingest Message */}
          <div
            style={{ position: "absolute", left: "60px", top: "150px", transform: "translate(-50%, -50%)" }}
            className="flex flex-col items-center gap-2 select-none cursor-pointer group"
            onClick={() => setSelectedNode(PIPELINE_NODES[0])}
          >
            <div className={cn(
              "w-14 h-14 rounded-2xl bg-[#161D2E] border p-3 flex items-center justify-center shadow-lg transition-all",
              isNodeActive("message") ? "border-signal ring-2 ring-signal/50 shadow-signal/30 animate-pulse" : isNodeDone("message") ? "border-emerald-500/50" : "border-white/[0.1] group-hover:border-signal"
            )}>
              <div className="w-9 h-9 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center">
                <MessageSquare className="w-5 h-5" />
              </div>
            </div>
            <div className="text-center">
              <div className="font-heading font-semibold text-xs text-white">Message Ingest</div>
              <div className="text-[10px] text-slate-400 font-mono">SMS / WhatsApp</div>
            </div>
          </div>

          {/* Node 2: Extractor */}
          <div
            style={{ position: "absolute", left: "210px", top: "150px", transform: "translate(-50%, -50%)" }}
            className="flex flex-col items-center gap-2 select-none cursor-pointer group"
            onClick={() => setSelectedNode(PIPELINE_NODES[1])}
          >
            <div className={cn(
              "w-14 h-14 rounded-2xl bg-[#161D2E] border p-3 flex items-center justify-center shadow-lg transition-all",
              isNodeActive("extractor") ? "border-signal ring-2 ring-signal/50 shadow-signal/30 animate-pulse bg-signal/10" : isNodeDone("extractor") ? "border-emerald-500/60 bg-emerald-500/10" : "border-white/[0.1] group-hover:border-signal"
            )}>
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
            </div>
            <div className="text-center">
              <div className="font-heading font-semibold text-xs text-white flex items-center gap-1 justify-center">
                <span>Extractor</span>
                {isNodeActive("extractor") && <span className="w-1.5 h-1.5 rounded-full bg-signal animate-ping" />}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">Links & VPAs</div>
            </div>
          </div>

          {/* Node 3: Switch Branching Gate */}
          <div
            style={{ position: "absolute", left: "340px", top: "150px", transform: "translate(-50%, -50%)" }}
            className="flex flex-col items-center gap-2 select-none"
          >
            <div className={cn(
              "w-14 h-14 rounded-2xl bg-[#161D2E] border p-3 flex items-center justify-center shadow-lg transition-all",
              (isNodeActive("pattern_analyst") || isNodeActive("entity_checker")) ? "border-signal ring-2 ring-signal/50 animate-pulse" : "border-signal/40"
            )}>
              <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <GitBranch className="w-5 h-5" />
              </div>
            </div>
            <div className="text-center">
              <div className="font-heading font-semibold text-xs text-white">Switch Gate</div>
              <div className="text-[10px] text-slate-400 font-mono">Fork Analysis</div>
            </div>
          </div>

          {/* Branch Pill 1 (True / Technical Risk) */}
          <div
            style={{ position: "absolute", left: "410px", top: "105px", transform: "translate(-50%, -50%)" }}
            className={cn(
              "px-2 py-0.5 rounded-full border text-[10px] font-mono font-bold transition-all",
              isNodeActive("entity_checker") || isNodeDone("entity_checker")
                ? "bg-emerald-500/30 border-emerald-400 text-emerald-300 ring-2 ring-emerald-500/30"
                : "bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
            )}
          >
            technical
          </div>

          {/* Branch Pill 2 (False / Psychological Threat) */}
          <div
            style={{ position: "absolute", left: "410px", top: "195px", transform: "translate(-50%, -50%)" }}
            className={cn(
              "px-2 py-0.5 rounded-full border text-[10px] font-mono font-bold transition-all",
              isNodeActive("pattern_analyst") || isNodeDone("pattern_analyst")
                ? "bg-rose-500/30 border-rose-400 text-rose-300 ring-2 ring-rose-500/30"
                : "bg-rose-500/20 border-rose-500/40 text-rose-400"
            )}
          >
            urgency
          </div>

          {/* Node 4 (Top Branch): Entity Checker */}
          <div
            style={{ position: "absolute", left: "530px", top: "75px", transform: "translate(-50%, -50%)" }}
            className="flex flex-col items-center gap-2 select-none cursor-pointer group"
            onClick={() => setSelectedNode(PIPELINE_NODES[3])}
          >
            <div className={cn(
              "w-14 h-14 rounded-2xl bg-[#161D2E] border p-3 flex items-center justify-center shadow-lg transition-all",
              isNodeActive("entity_checker") ? "border-cyan-400 ring-2 ring-cyan-400/50 shadow-cyan-400/30 animate-pulse bg-cyan-500/10" : isNodeDone("entity_checker") ? "border-emerald-500/60 bg-emerald-500/10" : "border-white/[0.1] group-hover:border-signal"
            )}>
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="text-center">
              <div className="font-heading font-semibold text-xs text-white flex items-center gap-1 justify-center">
                <span>Entity Checker</span>
                {isNodeActive("entity_checker") && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">DNS & WHOIS Age</div>
            </div>
          </div>

          {/* Node 5 (Bottom Branch): Pattern Analyst */}
          <div
            style={{ position: "absolute", left: "530px", top: "225px", transform: "translate(-50%, -50%)" }}
            className="flex flex-col items-center gap-2 select-none cursor-pointer group"
            onClick={() => setSelectedNode(PIPELINE_NODES[2])}
          >
            <div className={cn(
              "w-14 h-14 rounded-2xl bg-[#161D2E] border p-3 flex items-center justify-center shadow-lg transition-all",
              isNodeActive("pattern_analyst") ? "border-purple-400 ring-2 ring-purple-400/50 shadow-purple-400/30 animate-pulse bg-purple-500/10" : isNodeDone("pattern_analyst") ? "border-emerald-500/60 bg-emerald-500/10" : "border-white/[0.1] group-hover:border-signal"
            )}>
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <BrainCircuit className="w-5 h-5" />
              </div>
            </div>
            <div className="text-center">
              <div className="font-heading font-semibold text-xs text-white flex items-center gap-1 justify-center">
                <span>Pattern Analyst</span>
                {isNodeActive("pattern_analyst") && <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">Panic & Threat Vector</div>
            </div>
          </div>

          {/* Node 6: Judge Consensus */}
          <div
            style={{ position: "absolute", left: "705px", top: "150px", transform: "translate(-50%, -50%)" }}
            className="flex flex-col items-center gap-2 select-none cursor-pointer group"
            onClick={() => setSelectedNode(PIPELINE_NODES[4])}
          >
            <div className={cn(
              "w-14 h-14 rounded-2xl bg-[#161D2E] border p-3 flex items-center justify-center shadow-lg transition-all",
              isNodeActive("judge") ? "border-signal ring-4 ring-signal/50 shadow-signal/40 animate-pulse bg-signal/15" : isNodeDone("judge") ? "border-emerald-500/60 bg-emerald-500/10" : "border-signal/50 ring-2 ring-signal/20 group-hover:ring-signal/40"
            )}>
              <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-signal flex items-center justify-center">
                <Scale className="w-5 h-5" />
              </div>
            </div>
            <div className="text-center">
              <div className="font-heading font-semibold text-xs text-white flex items-center gap-1 justify-center">
                <span>Judge Agent</span>
                {isNodeActive("judge") && <span className="w-1.5 h-1.5 rounded-full bg-signal animate-ping" />}
              </div>
              <div className="text-[10px] text-signal font-mono">Veto Consensus</div>
            </div>
          </div>

          {/* Node 7: Advisor */}
          <div
            style={{ position: "absolute", left: "810px", top: "150px", transform: "translate(-50%, -50%)" }}
            className="flex flex-col items-center gap-2 select-none cursor-pointer group"
            onClick={() => setSelectedNode(PIPELINE_NODES[5])}
          >
            <div className={cn(
              "w-14 h-14 rounded-2xl bg-[#161D2E] border p-3 flex items-center justify-center shadow-lg transition-all",
              isNodeActive("advisor") ? "border-purple-400 ring-2 ring-purple-400/50 shadow-purple-400/30 animate-pulse bg-purple-500/10" : isNodeDone("advisor") ? "border-emerald-500/60 bg-emerald-500/10" : "border-white/[0.1] group-hover:border-signal"
            )}>
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <LifeBuoy className="w-5 h-5" />
              </div>
            </div>
            <div className="text-center">
              <div className="font-heading font-semibold text-xs text-white flex items-center gap-1 justify-center">
                <span>Advisor</span>
                {isNodeActive("advisor") && <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">Plain Language</div>
            </div>
          </div>

          {/* Node 8: Citizen Verdict */}
          <div
            style={{ position: "absolute", left: "910px", top: "150px", transform: "translate(-50%, -50%)" }}
            className="flex flex-col items-center gap-2 select-none cursor-pointer group"
            onClick={() => setSelectedNode(PIPELINE_NODES[6])}
          >
            <div className={cn(
              "w-14 h-14 rounded-2xl border p-3 flex items-center justify-center shadow-lg transition-all",
              verdict === "scam"
                ? "bg-rose-500/30 border-rose-400 ring-2 ring-rose-400/40"
                : verdict === "safe"
                ? "bg-emerald-500/30 border-emerald-400 ring-2 ring-emerald-400/40"
                : "bg-gradient-to-br from-emerald-500/30 to-signal/30 border-emerald-400/50"
            )}>
              <div className={cn(
                "w-9 h-9 rounded-xl flex items-center justify-center text-slate-950",
                verdict === "scam" ? "bg-rose-500 text-white" : "bg-emerald-500 text-slate-950"
              )}>
                <Stamp className="w-5 h-5" />
              </div>
            </div>
            <div className="text-center">
              <div className="font-heading font-semibold text-xs text-emerald-400 font-bold">
                {verdict ? verdict.toUpperCase() : "Safe / Scam"}
              </div>
              <div className="text-[10px] text-slate-300 font-mono">Action Ready</div>
            </div>
          </div>
        </div>
      </div>

      {renderDetailModal()}
    </div>
  );

  function getNodeIcon(id: string) {
    switch (id) {
      case "message":
        return <MessageSquare className="w-4 h-4 text-pink-400" />;
      case "extractor":
        return <FileSpreadsheet className="w-4 h-4 text-emerald-400" />;
      case "pattern_analyst":
        return <BrainCircuit className="w-4 h-4 text-purple-400" />;
      case "entity_checker":
        return <ShieldCheck className="w-4 h-4 text-cyan-400" />;
      case "judge":
        return <Scale className="w-4 h-4 text-signal" />;
      case "advisor":
        return <LifeBuoy className="w-4 h-4 text-purple-400" />;
      case "verdict":
        return <Stamp className="w-4 h-4 text-emerald-400" />;
      default:
        return <Shield className="w-4 h-4 text-signal" />;
    }
  }

  function renderDetailModal() {
    if (!selectedNode) return null;
    return (
      <Dialog.Root open={!!selectedNode} onOpenChange={(open) => !open && setSelectedNode(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 animate-in fade-in" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-lg p-6 bg-[#0E1528] border border-white/[0.12] rounded-2xl shadow-2xl z-50 animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-4 border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-signal/15 border border-signal/30 text-signal flex items-center justify-center">
                  {getNodeIcon(selectedNode.id)}
                </div>
                <div>
                  <Dialog.Title className="font-heading font-bold text-lg text-white">
                    {selectedNode.name}
                  </Dialog.Title>
                  <p className="text-xs text-slate-400">{selectedNode.role}</p>
                </div>
              </div>
              <Dialog.Close className="text-slate-400 hover:text-white p-1.5 rounded-lg border border-white/[0.08] hover:bg-white/[0.05]">
                <X className="w-4 h-4" />
              </Dialog.Close>
            </div>

            <div className="space-y-4 text-xs text-slate-300">
              <div>
                <span className="font-mono uppercase tracking-wider text-[10px] text-white block mb-1">
                  Agent Mission
                </span>
                <p className="leading-relaxed bg-white/[0.03] p-3 rounded-xl border border-white/[0.06]">
                  {selectedNode.description}
                </p>
              </div>

              <div>
                <span className="font-mono uppercase tracking-wider text-[10px] text-white flex items-center gap-1.5 mb-1.5">
                  <FileCode className="w-3.5 h-3.5 text-signal" />
                  <span>Prompt Directive</span>
                </span>
                <pre className="font-mono text-[11px] bg-[#070B16] p-3 rounded-xl border border-white/[0.08] text-slate-300 whitespace-pre-wrap">
                  {selectedNode.systemRole}
                </pre>
              </div>

              <div>
                <span className="font-mono uppercase tracking-wider text-[10px] text-white flex items-center gap-1.5 mb-1.5">
                  <Wrench className="w-3.5 h-3.5 text-signal" />
                  <span>Assigned Forensics & Tools</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedNode.tools.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 rounded-md border border-white/[0.08] bg-white/[0.04] font-mono text-[11px] text-slate-200"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    );
  }
};
