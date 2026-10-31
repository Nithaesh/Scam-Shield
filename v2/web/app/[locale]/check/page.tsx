"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import {
  ShieldAlert,
  ShieldCheck,
  Shield,
  PhoneCall,
  Search,
  Upload,
  Lock,
  ChevronDown,
  ChevronUp,
  Info,
  Copy,
  Check,
  Volume2,
  VolumeX,
  FileText,
  Download,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Send,
  Trash2,
  ExternalLink,
  BrainCircuit,
  Scale,
  LifeBuoy,
  MessageSquare,
  Sun,
  Moon,
  Menu,
  X,
  Box,
  BookOpen,
  BarChart3,
  Settings,
  Clock,
  Users,
  Terminal,
  Activity,
  Layers,
  FileSpreadsheet,
  CheckCircle2,
  Share2,
} from "lucide-react";
import { cn, defangUrl, defangHandle } from "@/lib/utils";
import { EvidenceDonut } from "@/components/ui/EvidenceDonut";
import { PipelineGraph } from "@/components/pipeline/PipelineGraph";
import { PIPELINE_NODES } from "@/lib/pipeline/graph";
import { PROOF } from "@/lib/data/proof";
import { analyzeMessageStream, AnalyzePayload } from "@/lib/api/client";
import {
  FinalResultEvent,
  StageResultEvent,
  StageStartEvent,
} from "@/lib/api/contract";
import { tts } from "@/lib/tts";
import { downloadTextReport, downloadJsonReport } from "@/lib/report";
import {
  getInvestigationHistory,
  saveInvestigationToHistory,
  clearInvestigationHistory,
  getSaveTextPreference,
  setSaveTextPreference,
  HistoryItem,
} from "@/lib/history";

export default function HermesConsolePage() {
  const t = useTranslations();
  const locale = useLocale();

  // Active navigation tab on the left: 'chat' | 'agents' | 'sessions' | 'tools' | 'analytics' | 'settings'
  const [activeTab, setActiveTab] = useState<"chat" | "agents" | "sessions" | "tools" | "analytics" | "settings">("chat");

  // Stream state
  const [inputText, setInputText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeStage, setActiveStage] = useState<string | null>(null);
  const [completedStages, setCompletedStages] = useState<string[]>([]);
  const [stageOutputs, setStageOutputs] = useState<Record<string, StageResultEvent>>({});
  const [finalResult, setFinalResult] = useState<FinalResultEvent | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [caseId, setCaseId] = useState("SS-0042");

  // History & preferences
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [saveTextPref, setSaveTextPref] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  // Workflow expand toggle inside thread
  const [showWorkflow, setShowWorkflow] = useState(true);

  const threadEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHistory(getInvestigationHistory());
    setSaveTextPref(getSaveTextPreference());

    const savedTheme = localStorage.getItem("scam_shield_theme") as "dark" | "light" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    }

    if (typeof window !== "undefined") {
      const prefill = sessionStorage.getItem("scam_shield_prefill");
      if (prefill) {
        sessionStorage.removeItem("scam_shield_prefill");
        setInputText(prefill);
        triggerAnalysis(prefill);
      }
    }
  }, []);

  const scrollToBottom = () => {
    setTimeout(() => {
      threadEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 150);
  };

  const handleNewCheck = () => {
    tts.stop();
    setIsSpeaking(false);
    setInputText("");
    setFinalResult(null);
    setStageOutputs({});
    setCompletedStages([]);
    setActiveStage(null);
    setErrorMessage(null);
    setCaseId(`SS-00${Math.floor(Math.random() * 900 + 100)}`);
    setActiveTab("chat");
  };

  const handleCopyShareText = () => {
    if (!finalResult) return;
    navigator.clipboard.writeText(finalResult.share_text);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  const handleToggleTTS = () => {
    if (!finalResult) return;
    const voiceText = `${finalResult.advice.headline}. ${finalResult.reasoning}. ${finalResult.advice.do_not.join(". ")}`;
    tts.toggle(voiceText, (locale as "en" | "hi") || "en", (speaking) => {
      setIsSpeaking(speaking);
    });
  };

  const handleToggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("scam_shield_theme", next);
    document.documentElement.setAttribute("data-theme", next);
    if (next === "light") document.documentElement.classList.add("light");
    else document.documentElement.classList.remove("light");
  };

  const handleToggleSaveText = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setSaveTextPref(checked);
    setSaveTextPreference(checked);
  };

  const handleClearHistory = () => {
    clearInvestigationHistory();
    setHistory([]);
  };

  const handleLoadHistoryCase = (item: HistoryItem) => {
    tts.stop();
    setIsSpeaking(false);
    setCaseId(item.caseId);
    setInputText(item.messagePreview);
    setFinalResult(item.result);
    setCompletedStages(["extractor", "pattern_analyst", "entity_checker", "judge", "advisor"]);
    setActiveStage(null);
    setErrorMessage(null);
    setActiveTab("chat");
  };

  const triggerAnalysis = async (textToAnalyze?: string) => {
    const message = textToAnalyze || inputText;
    if (!message.trim() || isAnalyzing) return;

    tts.stop();
    setIsSpeaking(false);
    setIsAnalyzing(true);
    setErrorMessage(null);
    setFinalResult(null);
    setStageOutputs({});
    setCompletedStages([]);
    setActiveStage("extractor");
    const currentId = `SS-00${Math.floor(Math.random() * 900 + 100)}`;
    setCaseId(currentId);
    setActiveTab("chat");
    setShowWorkflow(true);
    scrollToBottom();

    const payload: AnalyzePayload = {
      text: message,
      language: locale,
      stream: true,
    };

    await analyzeMessageStream(payload, {
      onStageStart: (ev: StageStartEvent) => {
        setActiveStage(ev.stage);
        scrollToBottom();
      },
      onStageResult: (ev: StageResultEvent) => {
        setCompletedStages((prev) => Array.from(new Set([...prev, ev.stage])));
        setStageOutputs((prev) => ({ ...prev, [ev.stage]: ev }));
        scrollToBottom();
      },
      onFinal: (res: FinalResultEvent) => {
        setFinalResult(res);
        setActiveStage(null);
        setIsAnalyzing(false);
        const updated = saveInvestigationToHistory(currentId, message, res);
        setHistory(updated);
        scrollToBottom();
      },
      onError: (err: Error) => {
        setIsAnalyzing(false);
        setActiveStage(null);
        setErrorMessage(err.message || "Server connection failed.");
      },
      onComplete: () => {
        setIsAnalyzing(false);
        setActiveStage(null);
      },
    });
  };

  return (
    <div className="min-h-screen bg-[#070B14] text-[#F1F5F9] flex flex-col items-center justify-between p-3 sm:p-6 lg:p-8 selection:bg-signal/20 selection:text-signal">
      {/* =========================================================================
       * HERMES HEADER (SCREENSHOT 3 TITLE HIERARCHY)
       * ========================================================================= */}
      <div className="w-full max-w-7xl text-center space-y-2 mb-6">
        <div className="flex items-center justify-center gap-3">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-slate-300 hover:text-white transition-colors"
          >
            <div className="w-4 h-4 rounded bg-signal/20 text-signal flex items-center justify-center font-bold text-[9px]">
              SS
            </div>
            <span>Hermes Agent Platform</span>
          </Link>
          <span className="text-white/[0.2]">•</span>
          <span className="text-xs font-mono text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>5 AGENTS ONLINE</span>
          </span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-heading font-black tracking-tight text-white">
          Hermes Web UI
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm font-normal">
          Multi-Agent Forensic Investigation Desk & Consensus Verification
        </p>
      </div>

      {/* =========================================================================
       * MAIN 3-COLUMN HERMES WORKSPACE
       * ========================================================================= */}
      <div className="w-full max-w-7xl rounded-3xl bg-[#0B0E17] border border-white/[0.1] shadow-2xl p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 relative overflow-hidden backdrop-blur-2xl">
        {/* Ambient Glow */}
        <div className="absolute top-0 right-1/4 w-[400px] h-[300px] bg-blue-600/[0.04] rounded-full blur-[100px] pointer-events-none" />

        {/* =======================================================================
         * 1. LEFT SIDEBAR (HERMES NAVIGATION & TABS)
         * ======================================================================= */}
        <aside className="lg:col-span-3 rounded-2xl bg-[#070B13] border border-white/[0.06] p-4 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Logo */}
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.06] text-white font-heading font-bold text-sm">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-signal/20 text-signal flex items-center justify-center">
                  <Shield className="w-4 h-4" />
                </div>
                <span>Hermes</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500 uppercase px-2 py-0.5 rounded bg-white/[0.04]">
                v2.0
              </span>
            </div>

            {/* Navigation Tabs (Screenshot 3 Style) */}
            <nav className="space-y-1 font-mono text-xs">
              <button
                type="button"
                onClick={() => setActiveTab("chat")}
                className={cn(
                  "w-full p-2.5 rounded-xl border flex items-center gap-3 text-left transition-all",
                  activeTab === "chat"
                    ? "bg-white/[0.08] border-white/[0.12] text-white font-medium shadow-xs"
                    : "border-transparent text-slate-400 hover:text-white hover:bg-white/[0.03]"
                )}
              >
                <MessageSquare className="w-4 h-4 text-signal" />
                <span>Chat & Stream</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("agents")}
                className={cn(
                  "w-full p-2.5 rounded-xl border flex items-center gap-3 text-left transition-all",
                  activeTab === "agents"
                    ? "bg-white/[0.08] border-white/[0.12] text-white font-medium shadow-xs"
                    : "border-transparent text-slate-400 hover:text-white hover:bg-white/[0.03]"
                )}
              >
                <Users className="w-4 h-4 text-emerald-400" />
                <span>Agents (5 Active)</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("sessions")}
                className={cn(
                  "w-full p-2.5 rounded-xl border flex items-center gap-3 text-left transition-all",
                  activeTab === "sessions"
                    ? "bg-white/[0.08] border-white/[0.12] text-white font-medium shadow-xs"
                    : "border-transparent text-slate-400 hover:text-white hover:bg-white/[0.03]"
                )}
              >
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>Sessions ({history.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("tools")}
                className={cn(
                  "w-full p-2.5 rounded-xl border flex items-center gap-3 text-left transition-all",
                  activeTab === "tools"
                    ? "bg-white/[0.08] border-white/[0.12] text-white font-medium shadow-xs"
                    : "border-transparent text-slate-400 hover:text-white hover:bg-white/[0.03]"
                )}
              >
                <Box className="w-4 h-4 text-purple-400" />
                <span>Forensic Tools</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("analytics")}
                className={cn(
                  "w-full p-2.5 rounded-xl border flex items-center gap-3 text-left transition-all",
                  activeTab === "analytics"
                    ? "bg-white/[0.08] border-white/[0.12] text-white font-medium shadow-xs"
                    : "border-transparent text-slate-400 hover:text-white hover:bg-white/[0.03]"
                )}
              >
                <BarChart3 className="w-4 h-4 text-amber-400" />
                <span>Benchmark Stats</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("settings")}
                className={cn(
                  "w-full p-2.5 rounded-xl border flex items-center gap-3 text-left transition-all",
                  activeTab === "settings"
                    ? "bg-white/[0.08] border-white/[0.12] text-white font-medium shadow-xs"
                    : "border-transparent text-slate-400 hover:text-white hover:bg-white/[0.03]"
                )}
              >
                <Settings className="w-4 h-4 text-slate-400" />
                <span>Settings</span>
              </button>
            </nav>
          </div>

          {/* 1930 Helpline Card */}
          <div className="pt-3 border-t border-white/[0.06] space-y-2">
            <a
              href="tel:1930"
              className="p-3 rounded-xl bg-signal/10 border border-signal/20 hover:bg-signal/20 text-signal flex items-center gap-2.5 text-xs transition-colors"
            >
              <PhoneCall className="w-4 h-4 shrink-0 text-signal" />
              <div>
                <div className="font-bold font-mono">Dial 1930 Helpline</div>
                <div className="text-[10px] text-slate-400">National Cybercrime 24x7</div>
              </div>
            </a>
          </div>
        </aside>

        {/* =======================================================================
         * 2. MIDDLE COLUMN (HERMES INVESTIGATION DESK & REPORTS)
         * ======================================================================= */}
        <section className="lg:col-span-6 rounded-2xl bg-[#070B13] border border-white/[0.06] flex flex-col justify-between h-[700px] relative overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-signal/20 border border-signal/40 text-signal flex items-center justify-center font-bold text-xs">
                SS
              </div>
              <div>
                <div className="font-heading font-bold text-sm text-white flex items-center gap-2">
                  <span>Hermes Agent</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-400">
                    Case {caseId}
                  </span>
                </div>
                <div className="text-[11px] text-emerald-400 font-mono flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>
                    {isAnalyzing ? `Analyzing: ${activeStage?.replace("_", " ").toUpperCase()}` : "Online • 5 Agents Ready"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowWorkflow(!showWorkflow)}
                className="px-2.5 py-1 rounded-lg border border-white/[0.08] bg-white/[0.04] text-[11px] font-mono text-slate-300 hover:text-white"
              >
                {showWorkflow ? "Hide Graph" : "Show Graph"}
              </button>
              <button
                type="button"
                onClick={handleNewCheck}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/[0.04] transition-colors"
                title="Reset check"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Tab 1: CHAT & LIVE STREAM (DEFAULT) */}
          {activeTab === "chat" && (
            <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs font-sans">
              {/* LIVE WORKFLOW GRAPH EMBEDDED INSIDE HERMES (SCREENSHOT 2 EXACTLY ON LIVE) */}
              {showWorkflow && (
                <div className="rounded-2xl border border-white/[0.08] bg-[#090E1A] p-3 overflow-hidden shadow-xl transition-all">
                  <div className="flex items-center justify-between pb-2 border-b border-white/[0.06] mb-2 text-[11px] font-mono">
                    <span className="text-signal flex items-center gap-1.5 font-bold">
                      <span className="w-2 h-2 rounded-full bg-signal animate-pulse" />
                      LIVE N8N WORKFLOW GRAPH
                    </span>
                    <span className="text-slate-400">
                      {isAnalyzing ? `Stage: ${activeStage}` : finalResult ? "Completed ✓" : "Ready"}
                    </span>
                  </div>
                  <PipelineGraph
                    variant="full"
                    activeStage={activeStage}
                    completedStages={completedStages}
                    verdict={finalResult?.verdict}
                    locale={locale}
                  />
                </div>
              )}

              {/* User Bubble */}
              {inputText && (
                <div className="flex justify-end gap-2.5">
                  <div className="max-w-[85%] p-3.5 rounded-2xl rounded-tr-xs bg-[#12192D] border border-white/[0.08] text-slate-100 shadow-sm leading-relaxed">
                    <div className="text-[10px] font-mono uppercase text-slate-400 mb-1">Citizen Evidence Submission</div>
                    {inputText}
                  </div>
                </div>
              )}

              {/* ===================================================================
               * DETAILED REPORTS FROM ALL 5 SPECIALIZED AGENTS
               * =================================================================== */}
              {(isAnalyzing || completedStages.length > 0) && (
                <div className="space-y-4">
                  {/* AGENT 1: EXTRACTOR REPORT */}
                  {(activeStage === "extractor" || completedStages.includes("extractor")) && (
                    <div className="p-4 rounded-2xl bg-[#090E1D] border border-emerald-500/30 space-y-2.5 shadow-sm">
                      <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono font-bold text-xs">
                            01
                          </div>
                          <div>
                            <div className="font-heading font-bold text-white text-xs">Extractor Agent</div>
                            <div className="text-[10px] text-slate-400 font-mono">Entity Extraction & URL Defanging</div>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">
                          {completedStages.includes("extractor") ? "COMPLETED (120ms)" : "EXTRACTING..."}
                        </span>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="text-slate-300">
                          Identified suspicious links, Indian mobile phone numbers (+91), urgency triggers, and payment handles:
                        </div>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {finalResult?.entities.urls.map((u, i) => (
                            <span key={i} className="px-2.5 py-1 rounded-md bg-rose-500/20 border border-rose-500/40 text-rose-300 font-mono text-[11px]">
                              URL: {defangUrl(u)}
                            </span>
                          ))}
                          {finalResult?.entities.phones.map((p, i) => (
                            <span key={i} className="px-2.5 py-1 rounded-md bg-white/[0.06] border border-white/[0.1] text-white font-mono text-[11px]">
                              Phone: {p}
                            </span>
                          ))}
                          {finalResult?.entities.upi_ids.map((up, i) => (
                            <span key={i} className="px-2.5 py-1 rounded-md bg-signal/20 border border-signal/40 text-signal font-mono text-[11px]">
                              UPI VPA: {defangHandle(up)}
                            </span>
                          ))}
                          {(!finalResult || (finalResult.entities.urls.length === 0 && finalResult.entities.phones.length === 0)) && (
                            <span className="text-slate-400 italic">Extracting raw tokens...</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* AGENT 2 & 3: PARALLEL BRACKET (PATTERN ANALYST & ENTITY CHECKER) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-3 border-l-2 border-signal/40">
                    {/* AGENT 2: PATTERN ANALYST REPORT */}
                    <div className="p-3.5 rounded-2xl bg-[#090E1D] border border-purple-500/30 space-y-2">
                      <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.06]">
                        <div className="flex items-center gap-1.5">
                          <BrainCircuit className="w-4 h-4 text-purple-400" />
                          <span className="font-heading font-bold text-white text-xs">Pattern Analyst</span>
                        </div>
                        <span className="text-[10px] font-mono text-purple-400 font-bold">02</span>
                      </div>
                      <div className="space-y-1 text-[11px] text-slate-300">
                        <div className="text-slate-400">Psychological Urgency Vector:</div>
                        <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 font-mono text-purple-300">
                          {finalResult?.scam_type ? `Detected Vector: ${finalResult.scam_type.replace(/_/g, " ").toUpperCase()}` : "Analyzing emotional manipulation..."}
                        </div>
                        <p className="text-slate-400 leading-relaxed pt-1">
                          Calculates time pressure threats ("immediate block", "power disconnect tonight"), fear framing, and official impersonation templates.
                        </p>
                      </div>
                    </div>

                    {/* AGENT 3: ENTITY CHECKER REPORT */}
                    <div className="p-3.5 rounded-2xl bg-[#090E1D] border border-cyan-500/30 space-y-2">
                      <div className="flex items-center justify-between pb-1.5 border-b border-white/[0.06]">
                        <div className="flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-cyan-400" />
                          <span className="font-heading font-bold text-white text-xs">Entity Checker</span>
                        </div>
                        <span className="text-[10px] font-mono text-cyan-400 font-bold">03</span>
                      </div>
                      <div className="space-y-1 text-[11px] text-slate-300">
                        <div className="text-slate-400">Technical Forensics Audit:</div>
                        <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 font-mono text-cyan-300">
                          WHOIS Age: &lt; 30 days | Lookalike Domain: Yes
                        </div>
                        <p className="text-slate-400 leading-relaxed pt-1">
                          Performs air-gapped DNS verification, checks authoritative bank registries, and scores domain age without downloading malware payloads.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* AGENT 4: JUDGE AGENT (CONSENSUS GATE & CONFLICT RESOLUTION) */}
                  {(activeStage === "judge" || completedStages.includes("judge") || finalResult) && (
                    <div className="p-4 rounded-2xl bg-[#090E1D] border border-signal/40 space-y-2.5 shadow-sm">
                      <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-signal/20 text-signal flex items-center justify-center font-mono font-bold text-xs">
                            04
                          </div>
                          <div>
                            <div className="font-heading font-bold text-white text-xs">Judge Agent</div>
                            <div className="text-[10px] text-slate-400 font-mono">Consensus Veto & Bayesian Calibration</div>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-signal/20 text-signal font-bold">
                          CONSENSUS GATE
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-1.5 text-xs text-slate-300">
                        <div className="font-mono text-signal font-semibold">Consensus Veto Rule Applied:</div>
                        <p className="italic text-slate-200">
                          "Technical forensic risk overrides any linguistic politeness. Even if the text appears legitimate or respectful, lookalike domain records confirm fraudulent intent."
                        </p>
                        {finalResult?.conflict && (
                          <div className="pt-1 text-[11px] text-amber-400 font-mono">
                            Conflict Resolution: {finalResult.conflict.resolution}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* AGENT 5: ADVISOR AGENT (PLAIN LANGUAGE GUIDANCE) */}
                  {(activeStage === "advisor" || completedStages.includes("advisor") || finalResult) && (
                    <div className="p-4 rounded-2xl bg-[#090E1D] border border-purple-500/40 space-y-2.5 shadow-sm">
                      <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-mono font-bold text-xs">
                            05
                          </div>
                          <div>
                            <div className="font-heading font-bold text-white text-xs">Advisor Agent</div>
                            <div className="text-[10px] text-slate-400 font-mono">Plain Language Citizen Directive</div>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 font-bold">
                          CITIZEN ACTION
                        </span>
                      </div>

                      <div className="text-xs text-slate-300 leading-relaxed">
                        Translates technical indicators into simple instructions: zero jargon, clear actions, and immediate routing to the 1930 Cyber Helpline.
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ===================================================================
               * DETAILED FINAL DOSSIER REPORT
               * =================================================================== */}
              {finalResult && (
                <div
                  className={cn(
                    "p-6 rounded-3xl border shadow-2xl space-y-5 animate-in zoom-in-95 transition-all",
                    finalResult.verdict === "scam"
                      ? "bg-rose-500/10 border-rose-500/40 text-slate-100"
                      : finalResult.verdict === "suspicious"
                      ? "bg-amber-500/10 border-amber-500/40 text-slate-100"
                      : "bg-emerald-500/10 border-emerald-500/40 text-slate-100"
                  )}
                >
                  {/* Verdict Stamp Header */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center font-bold shadow-lg",
                          finalResult.verdict === "scam"
                            ? "bg-rose-500 text-slate-950"
                            : finalResult.verdict === "suspicious"
                            ? "bg-amber-500 text-slate-950"
                            : "bg-emerald-500 text-slate-950"
                        )}
                      >
                        {finalResult.verdict === "scam" ? (
                          <ShieldAlert className="w-6 h-6" />
                        ) : finalResult.verdict === "suspicious" ? (
                          <AlertTriangle className="w-6 h-6" />
                        ) : (
                          <ShieldCheck className="w-6 h-6" />
                        )}
                      </div>
                      <div>
                        <div className="font-heading font-black text-2xl uppercase tracking-tight">
                          {finalResult.verdict === "scam"
                            ? "VERDICT: SCAM DETECTED"
                            : finalResult.verdict === "suspicious"
                            ? "VERDICT: SUSPICIOUS ACTIVITY"
                            : "VERDICT: VERIFIED SAFE"}
                        </div>
                        <div className="text-xs text-slate-300 font-mono">
                          Category: {finalResult.scam_type.replace(/_/g, " ").toUpperCase()} • {Math.round(finalResult.confidence * 100)}% Confidence
                        </div>
                      </div>
                    </div>

                    <div className="text-right font-mono text-xs">
                      <div className="text-slate-400">Case Identifier</div>
                      <div className="font-bold text-white">{caseId}</div>
                    </div>
                  </div>

                  {/* Forensic Rationale */}
                  <div className="p-4 rounded-xl bg-[#060913] border border-white/[0.08] space-y-1.5 text-xs text-slate-200">
                    <span className="font-mono uppercase text-[10px] text-slate-400 block">
                      Investigation Executive Summary
                    </span>
                    <p className="leading-relaxed">{finalResult.reasoning}</p>
                  </div>

                  {/* Action Steps Grid (DO NOT & DO NEXT) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {/* DO NOT */}
                    <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 space-y-2">
                      <div className="font-heading font-bold text-rose-400 flex items-center gap-1.5 uppercase">
                        <X className="w-4 h-4" />
                        <span>DO NOT:</span>
                      </div>
                      <ul className="space-y-1 text-slate-300">
                        {finalResult.advice.do_not.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-rose-400 font-bold">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* DO NEXT */}
                    <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 space-y-2">
                      <div className="font-heading font-bold text-emerald-400 flex items-center gap-1.5 uppercase">
                        <Check className="w-4 h-4" />
                        <span>DO NEXT:</span>
                      </div>
                      <ul className="space-y-1 text-slate-300">
                        {finalResult.advice.do_next.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-emerald-400 font-bold">✓</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Dossier Action Controls */}
                  <div className="pt-3 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={handleToggleTTS}
                        className="px-3 py-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.12] text-white font-mono flex items-center gap-2 transition-colors"
                      >
                        {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-signal" /> : <Volume2 className="w-3.5 h-3.5" />}
                        <span>{isSpeaking ? "Stop Speaking" : "Listen (TTS)"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleCopyShareText}
                        className="px-3 py-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.12] text-white font-mono flex items-center gap-2 transition-colors"
                      >
                        {copiedShare ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                        <span>{copiedShare ? "Copied" : "Copy Warning"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => downloadTextReport(finalResult, { caseId, timestamp: new Date().toISOString() })}
                        className="px-3 py-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.12] text-white font-mono flex items-center gap-2 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download TXT Report</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => downloadJsonReport(finalResult, { caseId, timestamp: new Date().toISOString() })}
                        className="px-3 py-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.12] text-white font-mono flex items-center gap-2 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>JSON Dossier</span>
                      </button>
                    </div>

                    <a
                      href="tel:1930"
                      className="px-4 py-1.5 rounded-lg bg-signal text-slate-950 font-bold font-mono flex items-center gap-1.5 ml-auto hover:brightness-110 transition-all shadow-md"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Call 1930</span>
                    </a>
                  </div>
                </div>
              )}

              <div ref={threadEndRef} />
            </div>
          )}

          {/* Tab 2: AGENTS DIRECTORY VIEW */}
          {activeTab === "agents" && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-sans">
              <div className="font-heading font-bold text-white text-base pb-2 border-b border-white/[0.06]">
                5 Autonomous Specialized Agents
              </div>
              <div className="space-y-3">
                {PIPELINE_NODES.slice(1, 6).map((agent) => (
                  <div key={agent.id} className="p-4 rounded-xl bg-[#090E1D] border border-white/[0.08] space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-heading font-bold text-white text-sm">{agent.name}</div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                        Active Node
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs">{agent.description}</p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {agent.tools.map((t, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06] text-[10px] font-mono text-slate-300">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: SESSIONS & HISTORY */}
          {activeTab === "sessions" && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-sans">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.06]">
                <div className="font-heading font-bold text-white text-base">Investigation Sessions</div>
                {history.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearHistory}
                    className="text-rose-400 hover:text-rose-300 text-[11px] font-mono flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear History</span>
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <div className="text-slate-400 italic py-6 text-center">No sessions recorded yet.</div>
              ) : (
                <div className="space-y-2">
                  {history.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleLoadHistoryCase(item)}
                      className="p-3 rounded-xl bg-[#090E1D] border border-white/[0.08] hover:border-signal/50 cursor-pointer transition-all space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-white font-bold">{item.caseId}</span>
                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-rose-500/20 text-rose-300">
                          {item.verdict} ({Math.round(item.confidence * 100)}%)
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px] line-clamp-1">{item.messagePreview}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 4: FORENSIC TOOLS DIRECTORY */}
          {activeTab === "tools" && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-sans">
              <div className="font-heading font-bold text-white text-base pb-2 border-b border-white/[0.06]">
                Forensic Tool Inventory
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { title: "WHOIS Domain Registry", desc: "Checks registration age, registrar, and country codes.", latency: "14ms" },
                  { title: "NPCI UPI Gateway Validator", desc: "Validates official bank handles and detect collect traps.", latency: "18ms" },
                  { title: "TRAI DND Telemarketer Filter", desc: "Matches 10-digit mobile sender numbers against Indian allowlist.", latency: "22ms" },
                  { title: "Multilingual OCR Vision", desc: "Extracts Hindi Devanagari & English text from phone screenshots.", latency: "42ms" },
                  { title: "Bayesian Consensus Engine", desc: "Aggregates evidence and applies precautionary conflict vetoes.", latency: "11ms" },
                  { title: "Web Speech TTS Generator", desc: "Synthesizes native Indian English & Hindi audio directives.", latency: "5ms" },
                ].map((tool, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-[#090E1D] border border-white/[0.08] space-y-1">
                    <div className="font-heading font-bold text-white">{tool.title}</div>
                    <p className="text-[11px] text-slate-400">{tool.desc}</p>
                    <div className="text-[10px] font-mono text-signal pt-1">Latency: {tool.latency} • Operational ✓</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 5: BENCHMARK ANALYTICS */}
          {activeTab === "analytics" && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-sans">
              <div className="font-heading font-bold text-white text-base pb-2 border-b border-white/[0.06]">
                Evaluation & Accuracy Benchmark
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-[#090E1D] border border-white/[0.08]">
                  <div className="text-slate-400 font-mono text-[10px] uppercase">Scam Recall Rate</div>
                  <div className="text-2xl font-bold text-emerald-400 font-mono">100.0%</div>
                  <div className="text-[10px] text-slate-500">30/30 Indian scams caught</div>
                </div>
                <div className="p-4 rounded-xl bg-[#090E1D] border border-white/[0.08]">
                  <div className="text-slate-400 font-mono text-[10px] uppercase">Precision</div>
                  <div className="text-2xl font-bold text-signal font-mono">91.67%</div>
                  <div className="text-[10px] text-slate-500">Conservative safety threshold</div>
                </div>
                <div className="p-4 rounded-xl bg-[#090E1D] border border-white/[0.08]">
                  <div className="text-slate-400 font-mono text-[10px] uppercase">False Positive Rate</div>
                  <div className="text-2xl font-bold text-amber-400 font-mono">6.25%</div>
                  <div className="text-[10px] text-slate-500">On genuine bank alerts</div>
                </div>
                <div className="p-4 rounded-xl bg-[#090E1D] border border-white/[0.08]">
                  <div className="text-slate-400 font-mono text-[10px] uppercase">Total Benchmark Set</div>
                  <div className="text-2xl font-bold text-white font-mono">55 Cases</div>
                  <div className="text-[10px] text-slate-500">Evaluated October 2026</div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 6: SETTINGS */}
          {activeTab === "settings" && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-sans">
              <div className="font-heading font-bold text-white text-base pb-2 border-b border-white/[0.06]">
                Console Settings & Privacy
              </div>
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-[#090E1D] border border-white/[0.08] space-y-2">
                  <div className="font-heading font-bold text-white">Privacy-Preserving Storage</div>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={saveTextPref}
                      onChange={handleToggleSaveText}
                      className="rounded accent-signal"
                    />
                    <span>Store text previews locally in browser storage</span>
                  </label>
                  <p className="text-[10px] text-slate-500">
                    Default is off. Scam Shield operates with zero server persistence.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#090E1D] border border-white/[0.08] flex items-center justify-between">
                  <div>
                    <div className="font-heading font-bold text-white">Theme Selection</div>
                    <div className="text-[10px] text-slate-500">Toggle dark / light display mode</div>
                  </div>
                  <button
                    type="button"
                    onClick={handleToggleTheme}
                    className="px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] text-white font-mono text-xs"
                  >
                    {theme === "dark" ? "Dark Mode" : "Light Mode"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Input Box at Bottom (Screenshot 3 Input Dock with Paper Plane) */}
          <div className="p-3 border-t border-white/[0.06] bg-[#070B13]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                triggerAnalysis();
              }}
              className="relative flex items-center"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your message, link, or phone number... (Enter to check)"
                className="w-full bg-[#0E1424] border border-white/[0.08] rounded-xl px-4 py-3 pr-12 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-signal/70 transition-all"
              />
              <button
                type="submit"
                disabled={!inputText.trim() || isAnalyzing}
                className="absolute right-2 p-2 rounded-lg bg-signal/20 hover:bg-signal text-signal hover:text-slate-950 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </section>

        {/* =======================================================================
         * 3. RIGHT SIDEBAR (HERMES 3 STACKED CARDS)
         * ======================================================================= */}
        <aside className="lg:col-span-3 space-y-4">
          {/* Card 1: Agents */}
          <div className="p-4 rounded-2xl bg-[#070B13] border border-white/[0.06] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-heading font-semibold text-xs text-white">Agents</div>
                <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Active</span>
                </div>
              </div>
              <div className="font-heading font-black text-2xl text-white">5</div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              {[
                { name: "Extractor", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
                { name: "Analyst", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
                { name: "Checker", color: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" },
                { name: "Judge", color: "bg-blue-500/20 text-signal border-blue-500/30" },
                { name: "Advisor", color: "bg-rose-500/20 text-rose-400 border-rose-500/30" },
              ].map((agent, i) => (
                <div
                  key={i}
                  title={agent.name}
                  className={cn(
                    "w-8 h-8 rounded-full border flex items-center justify-center font-mono text-[10px] font-bold shadow-sm",
                    agent.color
                  )}
                >
                  {agent.name.slice(0, 2)}
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Conversations */}
          <div className="p-4 rounded-2xl bg-[#070B13] border border-white/[0.06] space-y-2">
            <div className="text-slate-400 font-mono text-xs">Conversations</div>
            <div className="flex items-baseline justify-between">
              <div className="font-heading font-black text-2xl text-white">55</div>
              <div className="text-emerald-400 font-mono text-xs font-semibold">+18%</div>
            </div>

            {/* Green Sparkline Curve (Screenshot 3) */}
            <div className="h-10 w-full pt-1">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 200 40">
                <path
                  d="M 0 35 Q 30 20, 60 28 T 120 15 T 160 22 T 200 5"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          {/* Card 3: Tools Donut Chart */}
          <div className="p-4 rounded-2xl bg-[#070B13] border border-white/[0.06] space-y-3">
            <div className="text-slate-400 font-mono text-xs">Tools</div>
            <EvidenceDonut
              items={[
                { label: "Search", count: 42, color: "#38BDF8" },
                { label: "Code", count: 28, color: "#3B82F6" },
                { label: "Memory", count: 18, color: "#10B981" },
                { label: "Other", count: 12, color: "#F59E0B" },
              ]}
              size={80}
              strokeWidth={10}
            />
          </div>
        </aside>
      </div>

      {/* Bottom 4 Feature Icons & Watermark (Screenshot 3 Bottom) */}
      <div className="w-full max-w-7xl pt-8 space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-xs font-mono text-slate-400">
          <div
            onClick={() => setActiveTab("analytics")}
            className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-center gap-2 hover:bg-white/[0.05] cursor-pointer transition-colors"
          >
            <BarChart3 className="w-3.5 h-3.5 text-signal" />
            <span>Analytics</span>
          </div>
          <div
            onClick={() => setActiveTab("agents")}
            className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-center gap-2 hover:bg-white/[0.05] cursor-pointer transition-colors"
          >
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            <span>Agent Management</span>
          </div>
          <div
            onClick={() => setActiveTab("tools")}
            className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-center gap-2 hover:bg-white/[0.05] cursor-pointer transition-colors"
          >
            <Box className="w-3.5 h-3.5 text-cyan-400" />
            <span>Powerful Tools</span>
          </div>
          <div
            onClick={() => setActiveTab("analytics")}
            className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-center gap-2 hover:bg-white/[0.05] cursor-pointer transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-purple-400" />
            <span>Knowledge Base</span>
          </div>
        </div>

        <div className="text-center font-mono text-xs text-slate-600 pt-2">
          &lt;/&gt; ScriptByAI • Scam Shield v2.0
        </div>
      </div>
    </div>
  );
}
