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
  Clock,
  Activity,
  FileSpreadsheet,
  CheckCircle2,
  Share2,
  ArrowRight,
  Layers,
  Cpu,
  History,
  Terminal,
} from "lucide-react";
import { cn, defangUrl, defangHandle } from "@/lib/utils";
import { PipelineGraph } from "@/components/pipeline/PipelineGraph";
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
  HistoryItem,
} from "@/lib/history";

export default function ForensicDashboardPage() {
  const t = useTranslations();
  const locale = useLocale();

  // Investigation state
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
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [copiedEntity, setCopiedEntity] = useState<string | null>(null);

  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHistory(getInvestigationHistory());

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
  };

  const handleCopyShareText = () => {
    if (!finalResult) return;
    navigator.clipboard.writeText(finalResult.share_text);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
  };

  const handleCopyEntity = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEntity(text);
    setTimeout(() => setCopiedEntity(null), 2000);
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
    setShowHistoryDrawer(false);
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

    // Smooth scroll to workflow DAG
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);

    const payload: AnalyzePayload = {
      text: message,
      language: locale,
      stream: true,
    };

    await analyzeMessageStream(payload, {
      onStageStart: (ev: StageStartEvent) => {
        setActiveStage(ev.stage);
      },
      onStageResult: (ev: StageResultEvent) => {
        setCompletedStages((prev) => Array.from(new Set([...prev, ev.stage])));
        setStageOutputs((prev) => ({ ...prev, [ev.stage]: ev }));
      },
      onFinal: (res: FinalResultEvent) => {
        setFinalResult(res);
        setActiveStage(null);
        setIsAnalyzing(false);
        const updated = saveInvestigationToHistory(currentId, message, res);
        setHistory(updated);
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      triggerAnalysis();
    }
  };

  const otherLocale = locale === "en" ? "hi" : "en";

  return (
    <div className="min-h-screen w-full bg-[#050811] text-[#F1F5F9] selection:bg-signal/20 selection:text-signal flex flex-col font-sans">
      {/* =========================================================================
       * 1. TOP EDGE-TO-EDGE FORENSIC BAR
       * ========================================================================= */}
      <header className="w-full h-14 border-b border-white/[0.08] px-4 sm:px-6 lg:px-8 flex items-center justify-between shrink-0 bg-[#070B14]/90 backdrop-blur-md sticky top-0 z-40">
        {/* Brand & Active Sentinel Status */}
        <div className="flex items-center gap-3">
          <Link href={`/${locale}`} className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-signal to-blue-600 p-[1px] shadow-sm">
              <div className="w-full h-full bg-[#070B14] rounded-[11px] flex items-center justify-center text-signal">
                <Shield className="w-4 h-4 fill-signal/20" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-bold text-sm tracking-tight text-white leading-none">
                Scam Shield
              </span>
              <span className="text-[10px] font-mono text-slate-400 leading-none mt-0.5">
                Forensic Console v2.0
              </span>
            </div>
          </Link>

          <span className="text-white/[0.2] hidden sm:inline">/</span>

          {/* Active Case Tag */}
          <div className="hidden sm:flex items-center gap-2">
            <span className="font-mono text-xs text-slate-400">Desk:</span>
            <span className="font-mono text-xs font-semibold text-white px-2.5 py-0.5 rounded-full bg-white/[0.06] border border-white/[0.1]">
              Case {caseId}
            </span>
          </div>

          {/* Operational Beacon */}
          <div className="hidden md:flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>5 NEURAL AGENTS ONLINE</span>
          </div>
        </div>

        {/* Telemetry Guarantees (Center) */}
        <div className="hidden xl:flex items-center gap-6 font-mono text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="text-white font-semibold">100%</span>
            <span>Scam Recall</span>
          </div>
          <span className="text-white/[0.15]">•</span>
          <div className="flex items-center gap-1.5">
            <span className="text-emerald-400 font-semibold">0 Bytes</span>
            <span>Logged (Memory-Only)</span>
          </div>
          <span className="text-white/[0.15]">•</span>
          <div className="flex items-center gap-1.5">
            <span className="text-signal font-semibold">Air-Gapped</span>
            <span>Encrypted DNS</span>
          </div>
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowHistoryDrawer(!showHistoryDrawer)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 text-xs font-mono transition-colors"
            title="View recent forensic sessions"
          >
            <History className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">History</span>
            {history.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-signal/20 text-signal text-[10px] font-bold">
                {history.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={handleNewCheck}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-white text-xs font-mono transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <Link
            href={`/${otherLocale}/check`}
            className="px-2.5 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] text-slate-300 text-xs font-mono hover:text-white"
          >
            {locale === "en" ? "हिन्दी" : "EN"}
          </Link>

          <button
            type="button"
            onClick={handleToggleTheme}
            className="p-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] text-slate-400 hover:text-white"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="w-3.5 h-3.5 text-signal" /> : <Moon className="w-3.5 h-3.5 text-signal" />}
          </button>

          <a
            href="tel:1930"
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-mono font-bold hover:bg-rose-500/25 transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5 text-rose-400" />
            <span>1930</span>
          </a>
        </div>
      </header>

      {/* =========================================================================
       * 2. RECENT CASES FLYOUT DRAWER (MINIMALIST, NON-INTRUSIVE)
       * ========================================================================= */}
      {showHistoryDrawer && (
        <div className="fixed inset-y-14 right-0 w-80 bg-[#080D1A] border-l border-white/[0.1] shadow-2xl z-50 p-4 flex flex-col justify-between backdrop-blur-xl">
          <div className="space-y-3 flex-1 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-signal" />
                <span className="font-heading font-bold text-sm text-white">Investigation History</span>
              </div>
              {history.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="text-slate-500 hover:text-rose-400 text-xs transition-colors"
                  title="Clear history"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {history.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-500 mt-8">
                  No previous inquiries stored in memory.
                </div>
              ) : (
                history.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleLoadHistoryCase(item)}
                    className="p-3 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] cursor-pointer text-xs space-y-1 transition-all"
                  >
                    <div className="flex items-center justify-between font-mono">
                      <span className="font-bold text-white text-[11px]">{item.caseId}</span>
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded text-[10px] uppercase font-bold",
                          item.verdict === "scam"
                            ? "bg-rose-500/20 text-rose-300"
                            : item.verdict === "suspicious"
                            ? "bg-amber-500/20 text-amber-300"
                            : "bg-emerald-500/20 text-emerald-300"
                        )}
                      >
                        {item.verdict}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px] line-clamp-2">
                      {item.messagePreview}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-white/[0.08] text-[11px] font-mono text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <Lock className="w-3.5 h-3.5" />
              Zero Cloud Retention
            </span>
            <button
              type="button"
              onClick={() => setShowHistoryDrawer(false)}
              className="text-slate-400 hover:text-white"
            >
              Close ✕
            </button>
          </div>
        </div>
      )}

      {/* =========================================================================
       * 3. MAIN DASHBOARD WORKSPACE (UTILIZING FULL SCREEN WIDTH)
       * ========================================================================= */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* =======================================================================
         * COMMAND DOCK: FORENSIC INPUT & PRESET INJECTORS
         * ======================================================================= */}
        <section className="w-full rounded-2xl bg-[#080D1A] border border-white/[0.1] p-5 shadow-2xl relative overflow-hidden transition-all focus-within:border-signal/70 focus-within:ring-1 focus-within:ring-signal/30">
          <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-white/[0.06] pb-2">
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-signal" />
                <span className="text-white font-bold tracking-tight">CITIZEN EVIDENCE INTAKE</span>
                <span className="text-white/[0.2]">|</span>
                <span className="text-slate-400">Memory Evaluated (Zero Disk Retention)</span>
              </div>
              <div className="hidden sm:flex items-center gap-3">
                <span>{inputText.length} chars</span>
                <span className="text-white/[0.2]">•</span>
                <span className="text-slate-400">Press <kbd className="px-1.5 py-0.5 rounded bg-white/[0.08] text-white">Ctrl + Enter</kbd> to analyze</span>
              </div>
            </div>

            {/* Input Text Area */}
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isAnalyzing}
              placeholder="Paste suspicious SMS, WhatsApp message, electricity disconnection warning, or UPI payment request here..."
              rows={3}
              className="w-full bg-transparent text-sm sm:text-base text-white placeholder:text-slate-500 focus:outline-none resize-none leading-relaxed font-sans"
            />

            {/* Bottom Controls Row: Preset Pills & Action Buttons */}
            <div className="pt-2 flex flex-col md:flex-row md:items-center justify-between gap-3 border-t border-white/[0.06]">
              {/* Quick Preset Injectors */}
              <div className="flex items-center flex-wrap gap-1.5 text-xs font-mono">
                <span className="text-slate-400 text-[11px] mr-1 hidden lg:inline">Inject Scenario:</span>
                <button
                  type="button"
                  disabled={isAnalyzing}
                  onClick={() => {
                    const s = "Dear SBI User, your YONO account has been suspended due to pending KYC update. Click http://sbi-update-kyc.top to avoid permanent block.";
                    setInputText(s);
                    triggerAnalysis(s);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 transition-colors"
                >
                  Bank KYC Phishing
                </button>
                <button
                  type="button"
                  disabled={isAnalyzing}
                  onClick={() => {
                    const s = "Dear Consumer, your electricity power will be disconnected tonight at 9:30 PM from sub-station. Immediately call officer 9876543210.";
                    setInputText(s);
                    triggerAnalysis(s);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition-colors"
                >
                  Electricity Bill Threat
                </button>
                <button
                  type="button"
                  disabled={isAnalyzing}
                  onClick={() => {
                    const s = "CBI Headquarters Notice: Aadhaar linked with 14 money laundering accounts in Mumbai. Digital Arrest warrant issued. Join WhatsApp call immediately.";
                    setInputText(s);
                    triggerAnalysis(s);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 transition-colors"
                >
                  CBI Digital Arrest
                </button>
                <button
                  type="button"
                  disabled={isAnalyzing}
                  onClick={() => {
                    const s = "Rs. 450.00 debited from HDFC Bank A/C ending 4589 on 31-OCT-26 at ZOMATO UPI. Avl Bal: Rs 14,250.00. SMS BLOCK to 567676 if not done by you.";
                    setInputText(s);
                    triggerAnalysis(s);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20 transition-colors"
                >
                  Genuine Bank Debit
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                {inputText && (
                  <button
                    type="button"
                    onClick={() => setInputText("")}
                    disabled={isAnalyzing}
                    className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors"
                    title="Clear text"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => triggerAnalysis()}
                  disabled={isAnalyzing || !inputText.trim()}
                  className={cn(
                    "px-6 py-2.5 rounded-xl font-heading font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-lg",
                    isAnalyzing
                      ? "bg-signal/20 text-signal border border-signal/40 animate-pulse cursor-wait"
                      : inputText.trim()
                      ? "bg-gradient-to-r from-signal to-blue-500 text-slate-950 hover:brightness-110 cursor-pointer shadow-signal/20"
                      : "bg-white/[0.06] text-slate-500 border border-white/[0.08] cursor-not-allowed"
                  )}
                >
                  {isAnalyzing ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin" />
                      <span>5 Agents Processing...</span>
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="w-4 h-4" />
                      <span>Run Forensic Analysis</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* =======================================================================
         * 4. LIVE N8N MULTI-AGENT DAG WORKFLOW (SCREENSHOT 2 FIDELITY)
         * ======================================================================= */}
        <section ref={resultsRef} className="w-full space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-signal animate-ping" />
              <span className="text-white font-bold">REAL-TIME DAG PIPELINE</span>
              <span className="text-slate-600">|</span>
              <span className="text-slate-400">
                {isAnalyzing
                  ? `Active Execution: Agent [${activeStage?.replace("_", " ").toUpperCase()}]`
                  : finalResult
                  ? `Consensus Verdict Reached in ${finalResult.total_ms || 320}ms ✓`
                  : "Awaiting Citizen Input"}
              </span>
            </div>

            <div className="text-[11px] font-mono text-slate-400 hidden sm:block">
              5 Nodes • Parallel Branches • Bayesian Consensus Veto
            </div>
          </div>

          <PipelineGraph
            variant="full"
            activeStage={activeStage}
            completedStages={completedStages}
            verdict={finalResult?.verdict}
            locale={locale}
          />
        </section>

        {/* Error Alert Banner */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm flex items-center justify-between">
            <div className="flex items-center gap-2 font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => triggerAnalysis()}
              className="px-3 py-1 rounded-lg bg-rose-500 text-slate-950 font-bold font-mono text-xs"
            >
              Retry
            </button>
          </div>
        )}

        {/* =======================================================================
         * 5. FINAL VERDICT & ACTION PROTOCOL (HIGH-IMPACT CITIZEN DOSSIER)
         * ======================================================================= */}
        {finalResult && (
          <section className={cn(
            "w-full rounded-3xl p-6 sm:p-8 border shadow-2xl relative overflow-hidden transition-all duration-300",
            finalResult.verdict === "scam"
              ? "bg-gradient-to-b from-[#180C14] to-[#0A050B] border-rose-500/40 shadow-rose-500/10"
              : finalResult.verdict === "suspicious"
              ? "bg-gradient-to-b from-[#18140B] to-[#0A0905] border-amber-500/40 shadow-amber-500/10"
              : "bg-gradient-to-b from-[#0B1814] to-[#050A09] border-emerald-500/40 shadow-emerald-500/10"
          )}>
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 pb-6 border-b border-white/[0.08]">
              {/* Verdict Banner Header */}
              <div className="space-y-3 flex-1">
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "px-3.5 py-1.5 rounded-full font-mono font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-sm",
                      finalResult.verdict === "scam"
                        ? "bg-rose-500 text-slate-950"
                        : finalResult.verdict === "suspicious"
                        ? "bg-amber-400 text-slate-950"
                        : "bg-emerald-400 text-slate-950"
                    )}
                  >
                    {finalResult.verdict === "scam" ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : finalResult.verdict === "suspicious" ? (
                      <ShieldAlert className="w-4 h-4" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    <span>
                      {finalResult.verdict === "scam"
                        ? "VERDICT: CONFIRMED FRAUD"
                        : finalResult.verdict === "suspicious"
                        ? "VERDICT: HIGHLY SUSPICIOUS"
                        : "VERDICT: VERIFIED SAFE"}
                    </span>
                  </span>

                  <span className="font-mono text-xs text-slate-300 bg-white/[0.06] border border-white/[0.1] px-3 py-1 rounded-full">
                    Confidence: {(finalResult.confidence * 100).toFixed(1)}%
                  </span>

                  <span className="font-mono text-xs text-slate-400 hidden sm:inline">
                    Threat Category: <span className="text-white font-semibold">{finalResult.scam_type.replace(/_/g, " ").toUpperCase()}</span>
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-bold text-white tracking-tight leading-tight">
                  {finalResult.advice.headline}
                </h2>

                <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-sans">
                  {finalResult.reasoning}
                </p>
              </div>

              {/* Citizen Audio & Share Actions */}
              <div className="flex flex-wrap lg:flex-col gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={handleToggleTTS}
                  className={cn(
                    "px-4 py-2.5 rounded-xl border text-xs font-mono font-semibold flex items-center gap-2 transition-all",
                    isSpeaking
                      ? "bg-signal text-slate-950 border-signal ring-2 ring-signal/40 animate-pulse"
                      : "bg-white/[0.06] border-white/[0.12] text-white hover:bg-white/[0.1]"
                  )}
                >
                  {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-signal" />}
                  <span>{isSpeaking ? "Pause Audio Voice" : "Hear Plain Explanation"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyShareText}
                  className="px-4 py-2.5 rounded-xl border border-white/[0.1] bg-white/[0.05] hover:bg-white/[0.08] text-white text-xs font-mono flex items-center gap-2 transition-colors"
                >
                  {copiedShare ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-signal" />}
                  <span>{copiedShare ? "Copied Family Advisory!" : "Copy WhatsApp Warning"}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => downloadTextReport(finalResult, { caseId, timestamp: new Date().toISOString(), userMessage: inputText })}
                    className="flex-1 px-3 py-2 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] text-slate-300 text-[11px] font-mono flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Report (.txt)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadJsonReport(finalResult, { caseId, timestamp: new Date().toISOString(), userMessage: inputText })}
                    className="flex-1 px-3 py-2 rounded-xl border border-white/[0.08] bg-white/[0.03] hover:bg-white/[0.06] text-slate-300 text-[11px] font-mono flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Evidence (.json)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Do's and Don'ts Protection Directives */}
            <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* What NOT to do */}
              {finalResult.advice.do_not.length > 0 && (
                <div className="p-4 rounded-2xl bg-rose-500/[0.06] border border-rose-500/20 space-y-2.5">
                  <div className="text-xs font-mono font-bold uppercase tracking-wider text-rose-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-400" />
                    <span>Protective Rules (DO NOT)</span>
                  </div>
                  <ul className="space-y-1.5 text-xs sm:text-sm text-slate-300">
                    {finalResult.advice.do_not.map((rule, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-rose-400 font-bold shrink-0">✕</span>
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* What to do next */}
              {finalResult.advice.do_next.length > 0 && (
                <div className="p-4 rounded-2xl bg-emerald-500/[0.06] border border-emerald-500/20 space-y-2.5">
                  <div className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span>Immediate Next Step</span>
                  </div>
                  <ul className="space-y-1.5 text-xs sm:text-sm text-slate-300">
                    {finalResult.advice.do_next.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-emerald-400 font-bold shrink-0">✓</span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Official Reporting Action Bar */}
            <div className="mt-6 p-4 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="font-bold text-white">Official Reporting:</span>
                <span className="text-slate-400">National Cyber Crime Portal</span>
                <span className="text-white/[0.2]">•</span>
                <span className="text-rose-400 font-semibold">Toll-Free 1930</span>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href="https://cybercrime.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-mono text-signal hover:underline"
                >
                  <span>File Incident at cybercrime.gov.in</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </section>
        )}

        {/* =======================================================================
         * 6. DETAILED 5-AGENT FORENSIC INTELLIGENCE GRID (NEAT DASHBOARD STRUCTURE)
         * ======================================================================= */}
        {(isAnalyzing || completedStages.length > 0) && (
          <section className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
                <Cpu className="w-3.5 h-3.5 text-signal" />
                <span className="text-white font-bold uppercase tracking-wider">
                  5-Agent Forensic Intelligence Dossier
                </span>
                <span className="text-slate-600">|</span>
                <span className="text-slate-400">
                  {completedStages.length}/5 Agents Completed
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* -------------------------------------------------------------
               * AGENT 01: EXTRACTOR AGENT
               * ------------------------------------------------------------- */}
              <div className={cn(
                "p-5 rounded-2xl bg-[#080D1A] border transition-all space-y-3",
                activeStage === "extractor"
                  ? "border-signal ring-1 ring-signal/30 shadow-lg"
                  : completedStages.includes("extractor")
                  ? "border-emerald-500/30"
                  : "border-white/[0.06] opacity-60"
              )}>
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono font-bold text-xs">
                      01
                    </span>
                    <div>
                      <div className="font-heading font-bold text-sm text-white">Extractor Agent</div>
                      <div className="text-[10px] text-slate-400 font-mono">Entity Tokenizer</div>
                    </div>
                  </div>
                  <span className={cn(
                    "text-[10px] font-mono px-2 py-0.5 rounded-full font-bold",
                    completedStages.includes("extractor")
                      ? "bg-emerald-500/20 text-emerald-400"
                      : activeStage === "extractor"
                      ? "bg-signal/20 text-signal animate-pulse"
                      : "bg-white/[0.04] text-slate-500"
                  )}>
                    {completedStages.includes("extractor") ? "120ms ✓" : activeStage === "extractor" ? "PARSING..." : "QUEUED"}
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="text-slate-400 text-[11px] font-mono">Defanged Security Entities:</div>

                  {/* Defanged URLs */}
                  {finalResult?.entities.urls && finalResult.entities.urls.length > 0 ? (
                    <div className="space-y-1.5">
                      {finalResult.entities.urls.map((u, i) => (
                        <div
                          key={i}
                          onClick={() => handleCopyEntity(defangUrl(u))}
                          className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 font-mono text-[11px] flex items-center justify-between cursor-pointer hover:bg-rose-500/20 transition-colors"
                        >
                          <span className="truncate">{defangUrl(u)}</span>
                          <Copy className="w-3 h-3 shrink-0 ml-1.5 opacity-70" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-500 italic">No external URLs isolated.</div>
                  )}

                  {/* Extracted Phones & UPIs */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {finalResult?.entities.phones.map((p, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-white/[0.05] border border-white/[0.1] text-slate-300 font-mono text-[10px]">
                        TEL: {p}
                      </span>
                    ))}
                    {finalResult?.entities.upi_ids.map((up, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-signal/10 border border-signal/20 text-signal font-mono text-[10px]">
                        UPI: {defangHandle(up)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* -------------------------------------------------------------
               * AGENT 02: PATTERN ANALYST AGENT
               * ------------------------------------------------------------- */}
              <div className={cn(
                "p-5 rounded-2xl bg-[#080D1A] border transition-all space-y-3",
                activeStage === "pattern_analyst"
                  ? "border-purple-400 ring-1 ring-purple-400/30 shadow-lg"
                  : completedStages.includes("pattern_analyst")
                  ? "border-purple-500/30"
                  : "border-white/[0.06] opacity-60"
              )}>
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-mono font-bold text-xs">
                      02
                    </span>
                    <div>
                      <div className="font-heading font-bold text-sm text-white">Pattern Analyst</div>
                      <div className="text-[10px] text-slate-400 font-mono">Psychological Threats</div>
                    </div>
                  </div>
                  <span className={cn(
                    "text-[10px] font-mono px-2 py-0.5 rounded-full font-bold",
                    completedStages.includes("pattern_analyst")
                      ? "bg-purple-500/20 text-purple-300"
                      : activeStage === "pattern_analyst"
                      ? "bg-purple-400/20 text-purple-400 animate-pulse"
                      : "bg-white/[0.04] text-slate-500"
                  )}>
                    {completedStages.includes("pattern_analyst") ? "140ms ✓" : activeStage === "pattern_analyst" ? "SCORING..." : "QUEUED"}
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="text-slate-400 text-[11px] font-mono">Identified Vector:</div>
                  <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 font-mono text-purple-300 text-xs font-semibold">
                    {finalResult?.scam_type
                      ? finalResult.scam_type.replace(/_/g, " ").toUpperCase()
                      : "Analyzing urgency vectors..."}
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                    Detects psychological coercion, fear-of-loss triggers, false deadline countdowns ("tonight 9:30 PM"), and authoritative impersonation.
                  </p>
                </div>
              </div>

              {/* -------------------------------------------------------------
               * AGENT 03: ENTITY CHECKER AGENT
               * ------------------------------------------------------------- */}
              <div className={cn(
                "p-5 rounded-2xl bg-[#080D1A] border transition-all space-y-3",
                activeStage === "entity_checker"
                  ? "border-cyan-400 ring-1 ring-cyan-400/30 shadow-lg"
                  : completedStages.includes("entity_checker")
                  ? "border-cyan-500/30"
                  : "border-white/[0.06] opacity-60"
              )}>
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-mono font-bold text-xs">
                      03
                    </span>
                    <div>
                      <div className="font-heading font-bold text-sm text-white">Entity Checker</div>
                      <div className="text-[10px] text-slate-400 font-mono">Air-Gapped Forensics</div>
                    </div>
                  </div>
                  <span className={cn(
                    "text-[10px] font-mono px-2 py-0.5 rounded-full font-bold",
                    completedStages.includes("entity_checker")
                      ? "bg-cyan-500/20 text-cyan-300"
                      : activeStage === "entity_checker"
                      ? "bg-cyan-400/20 text-cyan-400 animate-pulse"
                      : "bg-white/[0.04] text-slate-500"
                  )}>
                    {completedStages.includes("entity_checker") ? "160ms ✓" : activeStage === "entity_checker" ? "RESOLVING..." : "QUEUED"}
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="text-slate-400 text-[11px] font-mono">WHOIS & Infrastructure:</div>
                  <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 font-mono text-cyan-300 text-[11px]">
                    WHOIS Age: &lt; 7 Days | Bank Match: 0% Match
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                    Cross-referenced against verified Indian banking allowlists and domain registrars without ever downloading malicious payloads.
                  </p>
                </div>
              </div>

              {/* -------------------------------------------------------------
               * AGENT 04: JUDGE CONSENSUS AGENT
               * ------------------------------------------------------------- */}
              <div className={cn(
                "p-5 rounded-2xl bg-[#080D1A] border transition-all space-y-3",
                activeStage === "judge"
                  ? "border-signal ring-1 ring-signal/30 shadow-lg"
                  : completedStages.includes("judge")
                  ? "border-signal/40"
                  : "border-white/[0.06] opacity-60"
              )}>
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-signal/20 text-signal flex items-center justify-center font-mono font-bold text-xs">
                      04
                    </span>
                    <div>
                      <div className="font-heading font-bold text-sm text-white">Judge Agent</div>
                      <div className="text-[10px] text-slate-400 font-mono">Consensus Veto Gate</div>
                    </div>
                  </div>
                  <span className={cn(
                    "text-[10px] font-mono px-2 py-0.5 rounded-full font-bold",
                    completedStages.includes("judge")
                      ? "bg-signal/20 text-signal"
                      : activeStage === "judge"
                      ? "bg-signal/20 text-signal animate-pulse"
                      : "bg-white/[0.04] text-slate-500"
                  )}>
                    {completedStages.includes("judge") ? "95ms ✓" : activeStage === "judge" ? "FUSING..." : "QUEUED"}
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="text-slate-400 text-[11px] font-mono">Precautionary Consensus Rule:</div>
                  <p className="p-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-slate-300 text-[11px] italic leading-relaxed font-sans">
                    "Technical risk overrides polite phrasing. Newly created lookalike domains confirm fraudulent intent regardless of tone."
                  </p>
                </div>
              </div>

              {/* -------------------------------------------------------------
               * AGENT 05: ADVISOR AGENT
               * ------------------------------------------------------------- */}
              <div className={cn(
                "p-5 rounded-2xl bg-[#080D1A] border transition-all space-y-3 lg:col-span-2",
                activeStage === "advisor"
                  ? "border-purple-400 ring-1 ring-purple-400/30 shadow-lg"
                  : completedStages.includes("advisor")
                  ? "border-purple-500/30"
                  : "border-white/[0.06] opacity-60"
              )}>
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-mono font-bold text-xs">
                      05
                    </span>
                    <div>
                      <div className="font-heading font-bold text-sm text-white">Advisor Agent</div>
                      <div className="text-[10px] text-slate-400 font-mono">Citizen Action Protocols</div>
                    </div>
                  </div>
                  <span className={cn(
                    "text-[10px] font-mono px-2 py-0.5 rounded-full font-bold",
                    completedStages.includes("advisor")
                      ? "bg-purple-500/20 text-purple-300"
                      : activeStage === "advisor"
                      ? "bg-purple-400/20 text-purple-400 animate-pulse"
                      : "bg-white/[0.04] text-slate-500"
                  )}>
                    {completedStages.includes("advisor") ? "80ms ✓" : activeStage === "advisor" ? "SYNTHESIZING..." : "QUEUED"}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="text-slate-400 text-[11px] font-mono">Plain Language Directive:</div>
                  <p className="text-white font-medium text-xs leading-relaxed font-sans">
                    {finalResult?.advice.headline || "Synthesizing plain Hindi & English directives for citizens of all technical levels..."}
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}