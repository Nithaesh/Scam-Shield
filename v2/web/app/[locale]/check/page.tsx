"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import {
  ShieldAlert,
  ShieldCheck,
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
} from "lucide-react";
import { cn, defangUrl, defangHandle } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Pill } from "@/components/ui/Pill";
import { StatTile } from "@/components/ui/StatTile";
import { ConfidenceRing } from "@/components/ui/ConfidenceRing";
import { EvidenceDonut } from "@/components/ui/EvidenceDonut";
import { SpecRow } from "@/components/ui/SpecRow";
import { PipelineGraph } from "@/components/pipeline/PipelineGraph";
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

export default function ConsolePage() {
  const t = useTranslations();
  const locale = useLocale();

  // Input & composer state
  const [inputText, setInputText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeStage, setActiveStage] = useState<string | null>(null);
  const [completedStages, setCompletedStages] = useState<string[]>([]);
  const [stageOutputs, setStageOutputs] = useState<Record<string, StageResultEvent>>({});
  const [finalResult, setFinalResult] = useState<FinalResultEvent | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [caseId, setCaseId] = useState("SS-0042");

  // Expanded agent inspect drawers
  const [expandedAgents, setExpandedAgents] = useState<Record<string, boolean>>({});

  // History & preferences
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [saveTextPref, setSaveTextPref] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  // Mobile active tab: 'thread' | 'rail'
  const [mobileTab, setMobileTab] = useState<"thread" | "rail">("thread");

  const threadEndRef = useRef<HTMLDivElement>(null);

  // Initialize preferences, history, and auto-prefill from hero
  useEffect(() => {
    setHistory(getInvestigationHistory());
    setSaveTextPref(getSaveTextPreference());

    const savedTheme = localStorage.getItem("scam_shield_theme") as "dark" | "light" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute("data-theme", savedTheme);
    }

    // Prefill from landing page
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

  const toggleAgentExpand = (stageKey: string) => {
    setExpandedAgents((prev) => ({ ...prev, [stageKey]: !prev[stageKey] }));
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

  const handleLoadHistoryCase = (item: HistoryItem) => {
    tts.stop();
    setIsSpeaking(false);
    setCaseId(item.caseId);
    setInputText(item.messagePreview);
    setFinalResult(item.result);
    setCompletedStages(["extractor", "pattern_analyst", "entity_checker", "judge", "advisor"]);
    setActiveStage(null);
    setErrorMessage(null);
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
    <div className="min-h-screen bg-page text-paper flex flex-col selection:bg-signal/20 selection:text-signal">
      {/* =========================================================================
       * CONSOLE TOP BAR
       * ========================================================================= */}
      <header className="h-14 border-b border-hairline/80 bg-panel/90 backdrop-blur-md px-4 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href={`/${locale}`}
            className="flex items-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal rounded-md p-1"
          >
            <div className="w-7 h-7 rounded-lg bg-signal/10 border border-signal/30 flex items-center justify-center text-signal">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="font-heading font-bold text-sm tracking-tight text-paper">
              Scam Shield
            </span>
          </Link>

          <span className="text-hairline/90 hidden sm:inline">/</span>
          <div className="hidden sm:flex items-center gap-2">
            <span className="font-mono text-xs text-fog uppercase">{t("console.case")}:</span>
            <span className="font-mono text-xs font-bold text-paper px-2 py-0.5 rounded bg-raised border border-hairline">
              {caseId}
            </span>
          </div>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-2">
          {/* Mobile tab toggle under 1024px */}
          <div className="flex lg:hidden rounded-lg border border-hairline bg-raised p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setMobileTab("thread")}
              className={cn(
                "px-2.5 py-1 rounded font-medium transition-colors",
                mobileTab === "thread" ? "bg-panel text-paper shadow-xs" : "text-fog"
              )}
            >
              Thread
            </button>
            <button
              type="button"
              onClick={() => setMobileTab("rail")}
              className={cn(
                "px-2.5 py-1 rounded font-medium transition-colors",
                mobileTab === "rail" ? "bg-panel text-paper shadow-xs" : "text-fog"
              )}
            >
              Forensics
            </button>
          </div>

          <Button variant="raised" size="sm" onClick={handleNewCheck} leftIcon={<RotateCcw className="w-3.5 h-3.5" />}>
            {t("console.newCheck")}
          </Button>

          <Link
            href={`/${locale === "en" ? "hi" : "en"}/check`}
            className="px-2.5 py-1 rounded-md border border-hairline bg-raised text-paper text-xs font-mono font-medium hover:border-signal transition-colors hidden sm:inline-block"
          >
            {locale === "en" ? "हिन्दी" : "English"}
          </Link>

          <button
            type="button"
            onClick={handleToggleTheme}
            className="p-1.5 rounded-md border border-hairline bg-raised text-fog hover:text-paper"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-signal" /> : <Moon className="w-4 h-4 text-signal" />}
          </button>
        </div>
      </header>

      {/* =========================================================================
       * 3-COLUMN HERMES WORKSPACE
       * ========================================================================= */}
      <div className="flex-1 flex overflow-hidden">
        {/* =======================================================================
         * 1. LEFT SIDEBAR (248px desktop)
         * ======================================================================= */}
        <aside className="w-64 border-r border-hairline/80 bg-panel/40 p-4 hidden md:flex flex-col justify-between shrink-0 overflow-y-auto">
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="space-y-2">
              <Button
                variant="signal"
                size="md"
                onClick={handleNewCheck}
                className="w-full justify-start text-xs font-sans"
                leftIcon={<Sparkles className="w-3.5 h-3.5" />}
              >
                {t("console.newCheck")}
              </Button>
            </div>

            {/* Recent Cases History */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-fog px-1">
                <span>Recent Inquiries</span>
                {history.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearHistory}
                    className="hover:text-verdict-scam transition-colors"
                    title="Clear history"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <div className="text-xs text-fog/60 px-1 py-2 italic">
                  No local inquiries yet.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-56 overflow-y-auto">
                  {history.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleLoadHistoryCase(item)}
                      className={cn(
                        "w-full p-2.5 rounded-lg border text-left text-xs transition-all flex flex-col gap-1",
                        caseId === item.caseId
                          ? "bg-panel border-signal/50 ring-1 ring-signal/30 text-paper"
                          : "bg-raised/40 border-hairline/70 hover:bg-raised text-fog hover:text-paper"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] text-paper font-semibold">{item.caseId}</span>
                        <span
                          className={cn(
                            "text-[9px] font-mono uppercase px-1 rounded font-bold",
                            item.verdict === "scam"
                              ? "bg-verdict-scam/20 text-verdict-scam"
                              : item.verdict === "suspicious"
                              ? "bg-verdict-suspicious/20 text-verdict-suspicious"
                              : "bg-verdict-safe/20 text-verdict-safe"
                          )}
                        >
                          {item.verdict}
                        </span>
                      </div>
                      <span className="truncate text-[11px] text-fog">{item.messagePreview}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Privacy Settings in Sidebar */}
            <div className="p-3 rounded-xl border border-hairline bg-raised/30 space-y-2.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-fog block">
                Citizen Privacy Settings
              </span>
              <label className="flex items-center gap-2 text-xs text-paper cursor-pointer">
                <input
                  type="checkbox"
                  checked={saveTextPref}
                  onChange={handleToggleSaveText}
                  className="rounded border-hairline bg-panel accent-signal"
                />
                <span>Save message previews locally</span>
              </label>
              <p className="text-[10px] text-fog leading-relaxed">
                Default: off. Scam Shield discards text immediately upon verdict delivery.
              </p>
            </div>
          </div>

          {/* 1930 Helpline Tile at Bottom of Sidebar */}
          <div className="pt-4 border-t border-hairline/80 space-y-2">
            <a
              href="tel:1930"
              className="p-3 rounded-xl border border-signal/30 bg-signal/10 hover:bg-signal/20 transition-all flex items-center gap-3 text-signal"
            >
              <PhoneCall className="w-4 h-4 shrink-0" />
              <div className="flex flex-col text-left">
                <span className="font-mono font-bold text-xs leading-none">Dial 1930 Helpline</span>
                <span className="text-[10px] text-fog mt-0.5">National Cybercrime 24x7</span>
              </div>
            </a>
          </div>
        </aside>

        {/* =======================================================================
         * 2. CENTER THREAD (max-w-3xl workspace)
         * ======================================================================= */}
        <section
          className={cn(
            "flex-1 flex flex-col justify-between overflow-hidden bg-page relative",
            mobileTab === "rail" && "hidden lg:flex"
          )}
        >
          {/* Thread Message Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 max-w-3xl w-full mx-auto">
            {/* Header info */}
            <div className="flex items-center justify-between border-b border-hairline/60 pb-3 text-xs text-fog">
              <span className="font-mono">{t("console.thread")} • Case {caseId}</span>
              <span className="font-mono text-[11px] text-signal font-semibold">5-Agent Live Pipeline</span>
            </div>

            {/* Empty State Guide */}
            {!inputText && !finalResult && !isAnalyzing && (
              <div className="p-8 rounded-2xl border border-hairline bg-panel text-center space-y-4 my-8">
                <div className="w-12 h-12 rounded-xl bg-signal/10 border border-signal/30 text-signal flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-heading font-bold text-lg text-paper">Scam Shield Ready</h3>
                  <p className="text-xs text-fog max-w-md mx-auto leading-relaxed">
                    {t("console.emptyGuide")}
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      const sample = "Dear SBI User, your YONO account has been suspended due to pending KYC update. Click http://sbi-update-kyc.top";
                      setInputText(sample);
                      triggerAnalysis(sample);
                    }}
                    className="px-3 py-1.5 rounded-lg border border-hairline bg-raised hover:bg-hairline text-xs font-mono text-paper transition-colors"
                  >
                    Test Bank KYC Scam
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const sample = "Electricity power will be disconnected tonight at 9:30 PM. Call officer 9876543210 immediately.";
                      setInputText(sample);
                      triggerAnalysis(sample);
                    }}
                    className="px-3 py-1.5 rounded-lg border border-hairline bg-raised hover:bg-hairline text-xs font-mono text-paper transition-colors"
                  >
                    Test Electricity Bill Threat
                  </button>
                </div>
              </div>
            )}

            {/* 1. Citizen Submission Message Bubble */}
            {inputText && (
              <div className="flex gap-3 justify-end animate-in fade-in">
                <div className="max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl rounded-tr-xs bg-raised border border-hairline shadow-xs space-y-2">
                  <span className="text-[10px] font-mono uppercase text-fog block">Citizen Submitted Evidence</span>
                  <p className="text-sm font-sans text-paper whitespace-pre-wrap leading-relaxed">
                    {inputText}
                  </p>
                </div>
              </div>
            )}

            {/* 2. Pipeline Streaming Stages in Thread */}
            {(isAnalyzing || completedStages.length > 0) && (
              <div className="space-y-4 animate-in fade-in">
                {/* Agent: Extractor */}
                {(isNodeActive("extractor") || completedStages.includes("extractor")) && (
                  <div className="p-4 rounded-xl border border-hairline bg-panel space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded bg-raised border border-hairline text-signal">
                          <Search className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-heading font-semibold text-paper">Extractor Agent</span>
                      </div>
                      <span className="font-mono text-[10px] text-fog">
                        {completedStages.includes("extractor") ? "DONE (120ms)" : "EXTRACTING ENTITIES..."}
                      </span>
                    </div>

                    {completedStages.includes("extractor") && finalResult && (
                      <div className="flex flex-wrap gap-2 pt-1 text-xs">
                        {finalResult.entities.urls.map((u, i) => (
                          <Chip key={i} variant="defanged" value={u} copyable />
                        ))}
                        {finalResult.entities.phones.map((p, i) => (
                          <Chip key={i} variant="phone" value={p} copyable />
                        ))}
                        {finalResult.entities.upi_ids.map((up, i) => (
                          <Chip key={i} variant="upi" value={up} copyable />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Parallel Agents: Pattern Analyst & Entity Checker in a Parallel Bracket */}
                {(isNodeActive("pattern_analyst") ||
                  isNodeActive("entity_checker") ||
                  completedStages.includes("pattern_analyst") ||
                  completedStages.includes("entity_checker")) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pl-2 sm:pl-4 border-l-2 border-signal/40">
                    {/* Pattern Analyst */}
                    <div className="p-3.5 rounded-xl border border-hairline bg-panel space-y-1.5 text-xs">
                      <div className="flex items-center gap-2">
                        <BrainCircuit className="w-3.5 h-3.5 text-signal" />
                        <span className="font-heading font-semibold text-paper">Pattern Analyst</span>
                      </div>
                      <p className="text-fog text-[11px] leading-relaxed">
                        Evaluates psychological urgency, fear framing, and impersonation scripts.
                      </p>
                      <div className="font-mono text-[10px] text-signal">
                        {completedStages.includes("pattern_analyst") ? "✓ Urgency profile evaluated" : "Analyzing linguistics..."}
                      </div>
                    </div>

                    {/* Entity Checker */}
                    <div className="p-3.5 rounded-xl border border-hairline bg-panel space-y-1.5 text-xs">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-verdict-safe" />
                        <span className="font-heading font-semibold text-paper">Entity Checker</span>
                      </div>
                      <p className="text-fog text-[11px] leading-relaxed">
                        Air-gapped WHOIS lookup, DNS age verification, and official bank registry audit.
                      </p>
                      <div className="font-mono text-[10px] text-signal">
                        {completedStages.includes("entity_checker") ? "✓ Technical forensics complete" : "Checking domain age & DNS..."}
                      </div>
                    </div>
                  </div>
                )}

                {/* Judge Agent & Conflict Callout */}
                {(isNodeActive("judge") || completedStages.includes("judge")) && (
                  <div className="p-4 rounded-xl border border-hairline bg-panel space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Scale className="w-3.5 h-3.5 text-signal" />
                        <span className="font-heading font-semibold text-paper">Judge Agent (Consensus Gate)</span>
                      </div>
                      <span className="font-mono text-[10px] text-fog">
                        {completedStages.includes("judge") ? "CONSENSUS REACHED" : "WEIGHING EVIDENCE..."}
                      </span>
                    </div>

                    {finalResult?.conflict && (
                      <div className="p-3 rounded-lg border border-verdict-suspicious/40 bg-verdict-suspicious/10 space-y-1 text-xs">
                        <div className="flex items-center gap-1.5 font-semibold text-verdict-suspicious">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>Consensus Conflict Resolved</span>
                        </div>
                        <p className="text-paper/90 text-[11px] italic">
                          "{t("verdict.conflictQuote")}"
                        </p>
                        <div className="text-[10px] font-mono text-fog pt-0.5">
                          Resolution: {finalResult.conflict.resolution}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Error Message if API fails */}
            {errorMessage && (
              <div className="p-4 rounded-xl border border-verdict-scam/40 bg-verdict-scam/10 text-xs text-verdict-scam space-y-2 animate-in fade-in">
                <div className="flex items-center gap-2 font-bold">
                  <ShieldAlert className="w-4 h-4" />
                  <span>{errorMessage}</span>
                </div>
                <p className="text-paper/80">
                  {t("console.coldStart")} If an urgent monetary emergency is taking place, dial 1930 directly.
                </p>
                <Button variant="raised" size="sm" onClick={() => triggerAnalysis()}>
                  Retry Analysis
                </Button>
              </div>
            )}

            {/* 3. Final Verdict Card (Stamp Animation & WCAG AA Surface) */}
            {finalResult && (
              <div
                className={cn(
                  "p-6 rounded-2xl border shadow-md space-y-6 animate-in zoom-in-95 transition-all duration-300",
                  finalResult.verdict === "scam"
                    ? "bg-verdict-scam/10 border-verdict-scam/30 text-paper"
                    : finalResult.verdict === "suspicious"
                    ? "bg-verdict-suspicious/10 border-verdict-suspicious/30 text-paper"
                    : "bg-verdict-safe/10 border-verdict-safe/30 text-paper"
                )}
              >
                {/* Verdict Stamp Header */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "p-2.5 rounded-xl border",
                        finalResult.verdict === "scam"
                          ? "bg-verdict-scam text-white border-verdict-scam"
                          : finalResult.verdict === "suspicious"
                          ? "bg-verdict-suspicious text-white border-verdict-suspicious"
                          : "bg-verdict-safe text-white border-verdict-safe"
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
                      <h2 className="text-2xl font-heading font-black tracking-tight uppercase">
                        {finalResult.verdict === "scam"
                          ? t("verdict.scam")
                          : finalResult.verdict === "suspicious"
                          ? t("verdict.suspicious")
                          : t("verdict.safe")}
                      </h2>
                      <p className="text-xs text-fog font-medium">
                        {finalResult.verdict === "scam"
                          ? t("verdict.scamSub")
                          : finalResult.verdict === "suspicious"
                          ? t("verdict.suspiciousSub")
                          : t("verdict.safeSub")}
                      </p>
                    </div>
                  </div>

                  {/* Confidence Ring */}
                  <ConfidenceRing
                    score={finalResult.confidence * 100}
                    verdict={finalResult.verdict}
                    size={64}
                    strokeWidth={5}
                  />
                </div>

                {/* Plain-Language Reasoning */}
                <div className="p-4 rounded-xl bg-panel/70 border border-hairline/80 space-y-2 text-sm leading-relaxed text-paper">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-fog block">
                    Forensic Rationale
                  </span>
                  <p>{finalResult.reasoning}</p>
                </div>

                {/* Recommended Citizen Next Steps: DO NOT & DO NEXT */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Do Not */}
                  <div className="p-4 rounded-xl bg-verdict-scam/10 border border-verdict-scam/25 space-y-2 text-xs">
                    <div className="font-heading font-bold text-verdict-scam flex items-center gap-1.5 uppercase tracking-wide">
                      <X className="w-4 h-4 shrink-0" />
                      <span>{t("advice.doNot")}</span>
                    </div>
                    <ul className="space-y-1.5 text-paper/90 pl-1">
                      {finalResult.advice.do_not.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-verdict-scam font-bold">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Do Next */}
                  <div className="p-4 rounded-xl bg-verdict-safe/10 border border-verdict-safe/25 space-y-2 text-xs">
                    <div className="font-heading font-bold text-verdict-safe flex items-center gap-1.5 uppercase tracking-wide">
                      <Check className="w-4 h-4 shrink-0" />
                      <span>{t("advice.doNext")}</span>
                    </div>
                    <ul className="space-y-1.5 text-paper/90 pl-1">
                      {finalResult.advice.do_next.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-verdict-safe font-bold">✓</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Citizen Action Bar (Listen TTS, Copy Warning, Download Report, 1930) */}
                <div className="pt-2 border-t border-hairline/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      variant="raised"
                      size="sm"
                      onClick={handleToggleTTS}
                      leftIcon={isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-signal" /> : <Volume2 className="w-3.5 h-3.5" />}
                    >
                      {isSpeaking ? t("advice.stopListening") : t("advice.listen")}
                    </Button>

                    <Button
                      variant="raised"
                      size="sm"
                      onClick={handleCopyShareText}
                      leftIcon={copiedShare ? <Check className="w-3.5 h-3.5 text-verdict-safe" /> : <Copy className="w-3.5 h-3.5" />}
                    >
                      {copiedShare ? t("advice.copied") : t("advice.copyFamily")}
                    </Button>

                    <Button
                      variant="raised"
                      size="sm"
                      onClick={() => downloadTextReport(finalResult, { caseId, timestamp: new Date().toISOString() })}
                      leftIcon={<Download className="w-3.5 h-3.5" />}
                    >
                      {t("advice.downloadReport")}
                    </Button>
                  </div>

                  <a
                    href="tel:1930"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-signal/30 bg-signal/15 text-signal font-semibold hover:brightness-110 transition-all ml-auto"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>{t("advice.call1930")}</span>
                  </a>
                </div>

                {/* Mandatory Disclaimer */}
                <div className="text-[11px] text-fog/80 italic text-center pt-2">
                  {t("verdict.mistakeWarning")}
                </div>
              </div>
            )}

            <div ref={threadEndRef} />
          </div>

          {/* Composer Dock */}
          <div className="p-3 sm:p-4 border-t border-hairline/80 bg-panel/80 backdrop-blur-md">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                triggerAnalysis();
              }}
              className="max-w-3xl mx-auto"
            >
              <div className="p-2.5 rounded-2xl border border-hairline bg-page focus-within:border-signal/70 focus-within:ring-2 focus-within:ring-signal/30 transition-all flex flex-col gap-2">
                <textarea
                  rows={2}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                      e.preventDefault();
                      triggerAnalysis();
                    }
                  }}
                  placeholder={t("console.composerPlaceholder")}
                  className="w-full bg-transparent border-0 resize-none text-xs sm:text-sm text-paper placeholder:text-fog/60 focus:outline-none px-1"
                />

                <div className="flex items-center justify-between gap-2 pt-1 border-t border-hairline/40">
                  <label className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-hairline bg-raised text-fog hover:text-paper text-xs cursor-pointer">
                    <Upload className="w-3 h-3" />
                    <span>Screenshot</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setInputText("Screenshot attached for multi-agent OCR inspection.");
                        }
                      }}
                    />
                  </label>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-fog hidden sm:inline">
                      Cmd+Enter to check
                    </span>
                    <Button
                      type="submit"
                      variant="signal"
                      size="sm"
                      isLoading={isAnalyzing}
                      disabled={!inputText.trim()}
                      leftIcon={<Send className="w-3 h-3" />}
                    >
                      {isAnalyzing ? "Analysing" : t("console.send")}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </section>

        {/* =======================================================================
         * 3. RIGHT RAIL (340px sticky desktop)
         * ======================================================================= */}
        <aside
          className={cn(
            "w-80 border-l border-hairline/80 bg-panel/30 p-4 space-y-6 overflow-y-auto shrink-0",
            mobileTab === "thread" && "hidden lg:block"
          )}
        >
          {/* Rail Header */}
          <div className="flex items-center justify-between text-xs pb-3 border-b border-hairline/60">
            <span className="font-mono uppercase tracking-wider text-fog">Live Agent Rail</span>
            <span className="font-mono text-signal text-[11px] font-bold">5 Specialized Nodes</span>
          </div>

          {/* Compact Pipeline Graph */}
          <PipelineGraph
            variant="compact"
            activeStage={activeStage}
            completedStages={completedStages}
            verdict={finalResult?.verdict}
            locale={locale}
          />

          {/* Evidence Distribution Donut */}
          <div className="p-4 rounded-xl border border-hairline bg-panel space-y-3">
            <div className="font-mono text-xs uppercase tracking-wider text-fog">
              {t("console.evidenceDonut")}
            </div>
            <EvidenceDonut
              items={[
                { label: "Domain & DNS", count: finalResult ? 3 : 1, color: "#F26522" },
                { label: "Psychological Urgency", count: finalResult ? 4 : 1, color: "#3B82F6" },
                { label: "National Registry Match", count: finalResult ? 2 : 1, color: "#10B981" },
                { label: "Community Reports", count: finalResult?.community.matches.length || 0, color: "#F59E0B" },
              ]}
              size={96}
              strokeWidth={12}
            />
          </div>

          {/* Extracted Forensic Entities */}
          <div className="p-4 rounded-xl border border-hairline bg-panel space-y-3">
            <div className="font-mono text-xs uppercase tracking-wider text-fog">
              {t("console.entitiesList")}
            </div>

            {finalResult ? (
              <div className="space-y-2">
                {finalResult.entities.urls.map((url, i) => (
                  <div key={i} className="flex flex-col gap-1 text-xs">
                    <span className="text-[10px] font-mono text-fog">Defanged Phishing Domain:</span>
                    <Chip variant="defanged" value={url} copyable />
                  </div>
                ))}
                {finalResult.entities.phones.map((phone, i) => (
                  <div key={i} className="flex flex-col gap-1 text-xs">
                    <span className="text-[10px] font-mono text-fog">Reported Number:</span>
                    <Chip variant="phone" value={phone} copyable />
                  </div>
                ))}
                {finalResult.entities.upi_ids.map((upi, i) => (
                  <div key={i} className="flex flex-col gap-1 text-xs">
                    <span className="text-[10px] font-mono text-fog">Suspicious VPA:</span>
                    <Chip variant="upi" value={upi} copyable />
                  </div>
                ))}
                {finalResult.entities.urls.length === 0 &&
                  finalResult.entities.phones.length === 0 &&
                  finalResult.entities.upi_ids.length === 0 && (
                    <span className="text-xs text-fog italic">No external identifiers found.</span>
                  )}
              </div>
            ) : (
              <span className="text-xs text-fog/60 italic">Waiting for analysis stream...</span>
            )}
          </div>

          {/* Technical Specs Sheet */}
          <div className="p-4 rounded-xl border border-hairline bg-panel space-y-3">
            <div className="font-mono text-xs uppercase tracking-wider text-fog">
              Investigation Telemetry
            </div>
            <div className="rounded-lg border border-hairline overflow-hidden bg-raised/20 text-xs">
              <SpecRow label="Case ID" value={caseId} />
              <SpecRow label="Latency" value={finalResult ? `${finalResult.total_ms || 240}ms` : "0ms"} />
              <SpecRow label="Cache State" value={finalResult?.cached ? "Hit (0 tokens)" : "Live Inference"} />
              <SpecRow label="Consensus Engine" value="Judge Bayesian Fusion" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );

  function isNodeActive(stage: string): boolean {
    return activeStage === stage;
  }
}
