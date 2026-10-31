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
            </defs>

            {/* Path 1: Message (70, 150) -> Extractor (200, 150) */}
            <path
              d="M 120 150 L 160 150"
              stroke="#2A354C"
              strokeWidth="2.5"
              fill="none"
            />
            {/* Path 2: Extractor (210, 150) -> Switch (350, 150) */}
            <path
              d="M 260 150 L 310 150"
              stroke="#2A354C"
              strokeWidth="2.5"
              fill="none"
            />

            {/* Path 3 (Branch True): Switch (360, 150) -> Entity Checker (500, 75) */}
            <path
              d="M 370 140 C 420 140, 430 75, 480 75"
              stroke="#10B981"
              strokeWidth="2.5"
              strokeDasharray="4 4"
              fill="none"
              opacity="0.8"
            />

            {/* Path 4 (Branch False): Switch (360, 150) -> Pattern Analyst (500, 225) */}
            <path
              d="M 370 160 C 420 160, 430 225, 480 225"
              stroke="#F43F5E"
              strokeWidth="2.5"
              strokeDasharray="4 4"
              fill="none"
              opacity="0.8"
            />

            {/* Path 5: Entity Checker (580, 75) -> Judge (680, 150) */}
            <path
              d="M 580 75 C 630 75, 630 140, 680 140"
              stroke="#2A354C"
              strokeWidth="2.5"
              fill="none"
            />

            {/* Path 6: Pattern Analyst (580, 225) -> Judge (680, 150) */}
            <path
              d="M 580 225 C 630 225, 630 160, 680 160"
              stroke="#2A354C"
              strokeWidth="2.5"
              fill="none"
            />

            {/* Path 7: Judge (730, 150) -> Advisor (820, 150) */}
            <path
              d="M 730 150 L 780 150"
              stroke="#2A354C"
              strokeWidth="2.5"
              fill="none"
            />

            {/* Path 8: Advisor (840, 150) -> Verdict (910, 150) */}
            <path
              d="M 840 150 L 890 150"
              stroke="#2A354C"
              strokeWidth="2.5"
              fill="none"
            />

            {/* Animated Packet Pulse */}
            <circle r="4.5" fill="#38BDF8" className="filter drop-shadow-[0_0_8px_#38BDF8]">
              <animateMotion
                dur="12s"
                repeatCount="indefinite"
                path="M 70 150 L 210 150 L 340 150 C 420 140, 430 75, 530 75 C 630 75, 630 140, 700 150 L 810 150 L 910 150"
              />
            </circle>
          </svg>

          {/* Node 1: Ingest Message */}
          <div
            style={{ position: "absolute", left: "60px", top: "150px", transform: "translate(-50%, -50%)" }}
            className="flex flex-col items-center gap-2 select-none cursor-pointer group"
            onClick={() => setSelectedNode(PIPELINE_NODES[0])}
          >
            <div className="w-14 h-14 rounded-2xl bg-[#161D2E] border border-white/[0.1] group-hover:border-signal p-3 flex items-center justify-center shadow-lg transition-all">
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
            <div className="w-14 h-14 rounded-2xl bg-[#161D2E] border border-white/[0.1] group-hover:border-signal p-3 flex items-center justify-center shadow-lg transition-all">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
            </div>
            <div className="text-center">
              <div className="font-heading font-semibold text-xs text-white">Extractor</div>
              <div className="text-[10px] text-slate-400 font-mono">Links & VPAs</div>
            </div>
          </div>

          {/* Node 3: Switch Branching Gate */}
          <div
            style={{ position: "absolute", left: "340px", top: "150px", transform: "translate(-50%, -50%)" }}
            className="flex flex-col items-center gap-2 select-none"
          >
            <div className="w-14 h-14 rounded-2xl bg-[#161D2E] border border-signal/40 p-3 flex items-center justify-center shadow-lg">
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
            className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[10px] font-mono font-bold"
          >
            technical
          </div>

          {/* Branch Pill 2 (False / Psychological Threat) */}
          <div
            style={{ position: "absolute", left: "410px", top: "195px", transform: "translate(-50%, -50%)" }}
            className="px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 text-[10px] font-mono font-bold"
          >
            urgency
          </div>

          {/* Node 4 (Top Branch): Entity Checker */}
          <div
            style={{ position: "absolute", left: "530px", top: "75px", transform: "translate(-50%, -50%)" }}
            className="flex flex-col items-center gap-2 select-none cursor-pointer group"
            onClick={() => setSelectedNode(PIPELINE_NODES[3])}
          >
            <div className="w-14 h-14 rounded-2xl bg-[#161D2E] border border-white/[0.1] group-hover:border-signal p-3 flex items-center justify-center shadow-lg transition-all">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="text-center">
              <div className="font-heading font-semibold text-xs text-white">Entity Checker</div>
              <div className="text-[10px] text-slate-400 font-mono">DNS & WHOIS Age</div>
            </div>
          </div>

          {/* Node 5 (Bottom Branch): Pattern Analyst */}
          <div
            style={{ position: "absolute", left: "530px", top: "225px", transform: "translate(-50%, -50%)" }}
            className="flex flex-col items-center gap-2 select-none cursor-pointer group"
            onClick={() => setSelectedNode(PIPELINE_NODES[2])}
          >
            <div className="w-14 h-14 rounded-2xl bg-[#161D2E] border border-white/[0.1] group-hover:border-signal p-3 flex items-center justify-center shadow-lg transition-all">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <BrainCircuit className="w-5 h-5" />
              </div>
            </div>
            <div className="text-center">
              <div className="font-heading font-semibold text-xs text-white">Pattern Analyst</div>
              <div className="text-[10px] text-slate-400 font-mono">Panic & Threat Vector</div>
            </div>
          </div>

          {/* Node 6: Judge Consensus */}
          <div
            style={{ position: "absolute", left: "705px", top: "150px", transform: "translate(-50%, -50%)" }}
            className="flex flex-col items-center gap-2 select-none cursor-pointer group"
            onClick={() => setSelectedNode(PIPELINE_NODES[4])}
          >
            <div className="w-14 h-14 rounded-2xl bg-[#161D2E] border border-signal/50 ring-2 ring-signal/20 group-hover:ring-signal/40 p-3 flex items-center justify-center shadow-lg transition-all">
              <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-signal flex items-center justify-center">
                <Scale className="w-5 h-5" />
              </div>
            </div>
            <div className="text-center">
              <div className="font-heading font-semibold text-xs text-white">Judge Agent</div>
              <div className="text-[10px] text-signal font-mono">Veto Consensus</div>
            </div>
          </div>

          {/* Node 7: Advisor */}
          <div
            style={{ position: "absolute", left: "810px", top: "150px", transform: "translate(-50%, -50%)" }}
            className="flex flex-col items-center gap-2 select-none cursor-pointer group"
            onClick={() => setSelectedNode(PIPELINE_NODES[5])}
          >
            <div className="w-14 h-14 rounded-2xl bg-[#161D2E] border border-white/[0.1] group-hover:border-signal p-3 flex items-center justify-center shadow-lg transition-all">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                <LifeBuoy className="w-5 h-5" />
              </div>
            </div>
            <div className="text-center">
              <div className="font-heading font-semibold text-xs text-white">Advisor</div>
              <div className="text-[10px] text-slate-400 font-mono">Plain Language</div>
            </div>
          </div>

          {/* Node 8: Citizen Verdict */}
          <div
            style={{ position: "absolute", left: "910px", top: "150px", transform: "translate(-50%, -50%)" }}
            className="flex flex-col items-center gap-2 select-none cursor-pointer group"
            onClick={() => setSelectedNode(PIPELINE_NODES[6])}
          >
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/30 to-signal/30 border border-emerald-400/50 p-3 flex items-center justify-center shadow-lg transition-all">
              <div className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center">
                <Stamp className="w-5 h-5" />
              </div>
            </div>
            <div className="text-center">
              <div className="font-heading font-semibold text-xs text-emerald-400 font-bold">Safe / Scam</div>
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
