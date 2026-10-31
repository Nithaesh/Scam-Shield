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
} from "lucide-react";
import { PIPELINE_NODES, AgentNodeMeta, getCubicBezierPath } from "@/lib/pipeline/graph";
import * as Dialog from "@radix-ui/react-dialog";

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
    }, 2300);

    return () => clearInterval(interval);
  }, [variant]);

  // Resolve current active node for hero
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

  const getNodeIcon = (iconName: string) => {
    switch (iconName) {
      case "MessageSquare":
        return <MessageSquare className="w-4 h-4" />;
      case "Search":
        return <Search className="w-4 h-4" />;
      case "BrainCircuit":
        return <BrainCircuit className="w-4 h-4" />;
      case "ShieldCheck":
        return <ShieldCheck className="w-4 h-4" />;
      case "Scale":
        return <Scale className="w-4 h-4" />;
      case "LifeBuoy":
        return <LifeBuoy className="w-4 h-4" />;
      case "Stamp":
        return <Stamp className="w-4 h-4" />;
      default:
        return <BrainCircuit className="w-4 h-4" />;
    }
  };

  /* =========================================================================
   * COMPACT VARIANT (FOR CONSOLE RAIL)
   * ========================================================================= */
  if (variant === "compact") {
    return (
      <div className={cn("p-4 bg-panel border border-hairline rounded-xl space-y-3", className)}>
        <div className="flex items-center justify-between text-xs">
          <span className="font-mono uppercase tracking-wider text-fog">Pipeline Stages</span>
          <span className="font-mono text-signal font-semibold">5 Agents Active</span>
        </div>
        <div className="flex items-center justify-between gap-1 relative">
          {PIPELINE_NODES.slice(1, 6).map((node, i) => {
            const active = isNodeActive(node.id);
            const done = isNodeDone(node.id);

            return (
              <button
                key={node.id}
                type="button"
                onClick={() => setSelectedNode(node)}
                title={`${node.name} (${node.role})`}
                className={cn(
                  "flex-1 p-2 rounded-lg border text-center transition-all flex flex-col items-center gap-1",
                  active
                    ? "bg-signal/15 border-signal text-signal shadow-sm ring-1 ring-signal/50 animate-pulse"
                    : done
                    ? "bg-raised border-hairline text-paper"
                    : "bg-panel/40 border-hairline/60 text-fog/60 hover:text-fog hover:border-hairline"
                )}
              >
                <div className="shrink-0">{getNodeIcon(node.iconName)}</div>
                <span className="text-[10px] font-mono leading-none truncate max-w-full">
                  {node.name.split(" ")[0]}
                </span>
              </button>
            );
          })}
        </div>
        {/* Node Detail Drawer Modal */}
        {renderDetailModal()}
      </div>
    );
  }

  /* =========================================================================
   * MOBILE VERTICAL VARIANT (<768px)
   * ========================================================================= */
  if (variant === "mobile-vertical") {
    return (
      <div className={cn("space-y-3 relative pl-6 border-l-2 border-hairline/70 my-4", className)}>
        {PIPELINE_NODES.map((node) => {
          const active = isNodeActive(node.id);
          const done = isNodeDone(node.id);

          return (
            <div
              key={node.id}
              onClick={() => setSelectedNode(node)}
              className={cn(
                "p-3 rounded-xl border relative transition-all cursor-pointer flex items-center justify-between gap-3",
                active
                  ? "bg-signal/10 border-signal text-signal ring-1 ring-signal/40"
                  : done
                  ? "bg-panel border-hairline text-paper"
                  : "bg-panel/50 border-hairline/50 text-fog"
              )}
            >
              {/* Connector dot on the vertical spine */}
              <div
                className={cn(
                  "absolute -left-[31px] top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 border-page",
                  active ? "bg-signal animate-ping" : done ? "bg-verdict-safe" : "bg-hairline"
                )}
              />
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "p-2 rounded-lg border",
                    active
                      ? "bg-signal text-white border-signal"
                      : done
                      ? "bg-raised text-paper border-hairline"
                      : "bg-raised/40 text-fog border-hairline/40"
                  )}
                >
                  {getNodeIcon(node.iconName)}
                </div>
                <div>
                  <div className="text-xs font-semibold font-heading">
                    {locale === "hi" ? node.nameHi : node.name}
                  </div>
                  <div className="text-[11px] text-fog font-sans">
                    {locale === "hi" ? node.roleHi : node.role}
                  </div>
                </div>
              </div>

              <div className="text-[10px] font-mono px-2 py-0.5 rounded border border-hairline bg-raised/60">
                {active ? "PROCESSING" : done ? "DONE" : "WAITING"}
              </div>
            </div>
          );
        })}
        {renderDetailModal()}
      </div>
    );
  }

  /* =========================================================================
   * HERO & FULL SVG GRAPH (DESKTOP & TABLET n8n-STYLE NODE GRAPH)
   * Nodes coordinates on 940x260 SVG canvas:
   * 1. Message: (60, 130)
   * 2. Extractor: (220, 130)
   * 3. Pattern Analyst: (400, 65)  [Branch Top]
   * 4. Entity Checker:  (400, 195) [Branch Bottom]
   * 5. Judge:           (590, 130) [Converge]
   * 6. Advisor:         (750, 130)
   * 7. Verdict:         (880, 130)
   * ========================================================================= */
  const nodeCoords: Record<string, { x: number; y: number }> = {
    message: { x: 50, y: 130 },
    extractor: { x: 200, y: 130 },
    pattern_analyst: { x: 380, y: 65 },
    entity_checker: { x: 380, y: 195 },
    judge: { x: 580, y: 130 },
    advisor: { x: 740, y: 130 },
    verdict: { x: 880, y: 130 },
  };

  // Edges: start -> end
  const edges = [
    { from: "message", to: "extractor" },
    { from: "extractor", to: "pattern_analyst" },
    { from: "extractor", to: "entity_checker" },
    { from: "pattern_analyst", to: "judge" },
    { from: "entity_checker", to: "judge" },
    { from: "judge", to: "advisor" },
    { from: "advisor", to: "verdict" },
  ];

  return (
    <div
      className={cn(
        "relative w-full rounded-2xl bg-panel border border-hairline/80 p-6 overflow-hidden shadow-xs",
        className
      )}
    >
      {/* Background Subtle Tech Grid */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--color-paper) 1px, transparent 1px), linear-gradient(to bottom, var(--color-paper) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Header bar in graph */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-signal animate-pulse" />
          <span className="text-xs font-mono uppercase tracking-wider text-fog">
            Multi-Agent Consensus Topology
          </span>
        </div>
        <span className="text-xs text-fog font-mono hidden sm:inline-block">
          Click any node to inspect prompt & tools
        </span>
      </div>

      {/* SVG Canvas for Curves and Animating Packet */}
      <div className="relative w-full overflow-x-auto">
        <div className="min-w-[880px] h-[260px] relative">
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 940 260">
            <defs>
              <linearGradient id="edgeGradientActive" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--color-signal)" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.8" />
              </linearGradient>
            </defs>

            {/* Bezier Edge Curves */}
            {edges.map((edge, i) => {
              const start = nodeCoords[edge.from];
              const end = nodeCoords[edge.to];
              const d = getCubicBezierPath(start.x + 36, start.y, end.x - 36, end.y, 0.45);
              const isEdgeActive = isNodeActive(edge.to) || isNodeDone(edge.to);

              return (
                <g key={i}>
                  {/* Base Track */}
                  <path
                    d={d}
                    fill="none"
                    stroke="var(--color-hairline, rgba(255,255,255,0.08))"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                  />
                  {/* Glowing Animated Active Beam */}
                  {isEdgeActive && (
                    <path
                      d={d}
                      fill="none"
                      stroke="url(#edgeGradientActive)"
                      strokeWidth="2.5"
                      className="transition-all duration-700"
                    />
                  )}
                </g>
              );
            })}

            {/* In Hero mode: Moving Packet Dot */}
            {variant === "hero" && (
              <circle r="4" fill="var(--color-signal, #F26522)" className="filter drop-shadow-[0_0_6px_#F26522]">
                <animateMotion
                  dur="14s"
                  repeatCount="indefinite"
                  path={getCubicBezierPath(50, 130, 880, 130, 0.2)}
                />
              </circle>
            )}
          </svg>

          {/* Render Nodes as Interactive DOM Elements */}
          {PIPELINE_NODES.map((node) => {
            const coord = nodeCoords[node.id];
            const active = isNodeActive(node.id);
            const done = isNodeDone(node.id);

            return (
              <button
                key={node.id}
                type="button"
                onClick={() => setSelectedNode(node)}
                style={{
                  position: "absolute",
                  left: `${coord.x}px`,
                  top: `${coord.y}px`,
                  transform: "translate(-50%, -50%)",
                }}
                className={cn(
                  "w-[130px] p-2.5 rounded-xl border text-left transition-all duration-300 relative z-10 group cursor-pointer select-none",
                  active
                    ? "bg-panel border-signal shadow-md ring-2 ring-signal/50 scale-105"
                    : done
                    ? "bg-panel border-hairline hover:border-fog/50"
                    : "bg-panel/70 border-hairline/60 opacity-70 hover:opacity-100"
                )}
              >
                {/* Active Pulse Glow */}
                {active && (
                  <div className="absolute -inset-1 rounded-2xl bg-signal/15 blur-xs -z-10 animate-pulse" />
                )}

                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <div
                    className={cn(
                      "p-1.5 rounded-md border text-xs",
                      active
                        ? "bg-signal text-white border-signal"
                        : done
                        ? "bg-raised text-paper border-hairline"
                        : "bg-raised/40 text-fog border-hairline/40"
                    )}
                  >
                    {getNodeIcon(node.iconName)}
                  </div>
                  <span
                    className={cn(
                      "text-[9px] font-mono uppercase px-1.5 py-0.5 rounded",
                      active
                        ? "bg-signal/20 text-signal font-bold"
                        : done
                        ? "bg-verdict-safe/15 text-verdict-safe font-semibold"
                        : "text-fog"
                    )}
                  >
                    {active ? "ACTIVE" : done ? "DONE" : "IDLE"}
                  </span>
                </div>

                <div className="font-heading font-semibold text-xs text-paper truncate">
                  {locale === "hi" ? node.nameHi : node.name}
                </div>
                <div className="text-[10px] text-fog truncate">
                  {locale === "hi" ? node.roleHi : node.role}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {renderDetailModal()}
    </div>
  );

  /* Modal drawer for inspecting node details */
  function renderDetailModal() {
    if (!selectedNode) return null;

    return (
      <Dialog.Root open={!!selectedNode} onOpenChange={(open) => !open && setSelectedNode(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 animate-in fade-in" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-lg p-6 bg-panel border border-hairline rounded-2xl shadow-xl z-50 animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-4 border-b border-hairline/80 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-signal/10 border border-signal/30 text-signal">
                  {getNodeIcon(selectedNode.iconName)}
                </div>
                <div>
                  <Dialog.Title className="font-heading font-bold text-lg text-paper">
                    {selectedNode.name}
                  </Dialog.Title>
                  <p className="text-xs text-fog">{selectedNode.role}</p>
                </div>
              </div>
              <Dialog.Close className="text-fog hover:text-paper p-1.5 rounded-lg border border-hairline hover:bg-raised">
                <X className="w-4 h-4" />
              </Dialog.Close>
            </div>

            <div className="space-y-4 text-xs text-fog">
              <div>
                <span className="font-mono uppercase tracking-wider text-[10px] text-paper block mb-1">
                  Agent Mission & Architecture
                </span>
                <p className="leading-relaxed bg-raised/40 p-3 rounded-lg border border-hairline">
                  {selectedNode.description}
                </p>
              </div>

              <div>
                <span className="font-mono uppercase tracking-wider text-[10px] text-paper flex items-center gap-1.5 mb-1.5">
                  <FileCode className="w-3.5 h-3.5 text-signal" />
                  <span>System Prompt Directive</span>
                </span>
                <pre className="font-mono text-[11px] bg-page p-3 rounded-lg border border-hairline text-paper/90 whitespace-pre-wrap">
                  {selectedNode.systemRole}
                </pre>
              </div>

              <div>
                <span className="font-mono uppercase tracking-wider text-[10px] text-paper flex items-center gap-1.5 mb-1.5">
                  <Wrench className="w-3.5 h-3.5 text-signal" />
                  <span>Specialized Tools & Deterministic Checks</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedNode.tools.map((t, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 rounded-md border border-hairline bg-raised font-mono text-[11px] text-paper"
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
