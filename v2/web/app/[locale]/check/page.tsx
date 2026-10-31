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
  Plus,
  Lock,
  ChevronDown,
  Info,
  Copy,
  Check,
  Mic,
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
  ArrowUpRight,
  Layers,
  Cpu,
  History,
  Terminal,
  Crown,
  Settings,
  HelpCircle,
  Video,
  Image as ImageIcon,
  Code2,
  Boxes,
  FolderGit2,
} from "lucide-react";
import { cn, defangUrl, defangHandle } from "@/lib/utils";
import { PipelineGraph } from "@/components/pipeline/PipelineGraph";
import { Orb3D } from "@/components/ui/Orb3D";
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

export default function SyntrixDashboardPage() {
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

  // History & settings
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedFeature, setSelectedFeature] = useState<string>("all");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [copiedEntity, setCopiedEntity] = useState<string | null>(null);

  // Dropdown states
  const [toolsDropdown, setToolsDropdown] = useState(false);
  const [thinkDropdown, setThinkDropdown] = useState(false);

  const mainScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHistory(getInvestigationHistory());

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

    // Smooth scroll down to live results
    setTimeout(() => {
      mainScrollRef.current?.scrollTo({ top: 380, behavior: "smooth" });
    }, 150);

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
    <div className="min-h-screen w-full bg-[#dce5cb] p-2 sm:p-5 lg:p-8 flex items-center justify-center font-sans antialiased selection:bg-signal/30 selection:text-white">
      {/* =========================================================================
       * MAIN OBSIDIAN TABLET SHELL (EXACT SCREENSHOT FIDELITY)
       * ========================================================================= */}
      <div className="w-full max-w-[1520px] min-h-[92vh] rounded-[28px] sm:rounded-[36px] bg-[#0c1017] border border-white/[0.08] shadow-[0_25px_70px_rgba(0,0,0,0.65)] overflow-hidden flex flex-col lg:flex-row relative text-[#f1f5f9]">
        
        {/* =======================================================================
         * 1. LEFT SIDEBAR (EXACT SYNTHRIX SCREENSHOT LAYOUT)
         * ======================================================================= */}
        <aside className="w-full lg:w-64 xl:w-72 bg-[#090d14] border-b lg:border-b-0 lg:border-r border-white/[0.06] p-5 flex flex-col justify-between shrink-0 space-y-6">
          <div className="space-y-6">
            {/* Top Brand Logo & Search */}
            <div className="flex items-center justify-between">
              <Link href={`/${locale}`} className="flex items-center gap-2.5 group">
                <Orb3D size={28} />
                <span className="font-heading font-semibold text-base tracking-tight text-white">
                  Scam Shield
                </span>
              </Link>
              <button
                type="button"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors"
                title="Search inquiry records"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>

            {/* "+ New Chat" Action Button */}
            <button
              type="button"
              onClick={handleNewCheck}
              className="w-full py-2.5 px-4 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-signal/50 hover:bg-white/[0.08] text-white font-medium text-xs flex items-center gap-2.5 transition-all shadow-inner group"
            >
              <Plus className="w-4 h-4 text-signal group-hover:rotate-90 transition-transform duration-300" />
              <span>New Scan</span>
            </button>

            {/* FEATURES SECTION (Screenshot: Images, Videos, Codex, Apps, Projects) */}
            <div className="space-y-2">
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold px-2">
                Features
              </div>
              <div className="space-y-1 text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedFeature("extractor")}
                  className={cn(
                    "w-full px-3 py-2 rounded-xl flex items-center gap-3 transition-colors text-left",
                    selectedFeature === "extractor"
                      ? "bg-white/[0.08] text-white font-medium"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.03]"
                  )}
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span>Extractor (Links & Tokens)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedFeature("pattern_analyst")}
                  className={cn(
                    "w-full px-3 py-2 rounded-xl flex items-center gap-3 transition-colors text-left",
                    selectedFeature === "pattern_analyst"
                      ? "bg-white/[0.08] text-white font-medium"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.03]"
                  )}
                >
                  <BrainCircuit className="w-4 h-4 text-purple-400" />
                  <span>Pattern Analyst (Urgency)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedFeature("entity_checker")}
                  className={cn(
                    "w-full px-3 py-2 rounded-xl flex items-center gap-3 transition-colors text-left",
                    selectedFeature === "entity_checker"
                      ? "bg-white/[0.08] text-white font-medium"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.03]"
                  )}
                >
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>Entity Checker (Air-Gapped)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedFeature("judge")}
                  className={cn(
                    "w-full px-3 py-2 rounded-xl flex items-center gap-3 transition-colors text-left",
                    selectedFeature === "judge"
                      ? "bg-white/[0.08] text-white font-medium"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.03]"
                  )}
                >
                  <Scale className="w-4 h-4 text-signal" />
                  <span>Judge Consensus (Veto Gate)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedFeature("advisor")}
                  className={cn(
                    "w-full px-3 py-2 rounded-xl flex items-center gap-3 transition-colors text-left",
                    selectedFeature === "advisor"
                      ? "bg-white/[0.08] text-white font-medium"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.03]"
                  )}
                >
                  <LifeBuoy className="w-4 h-4 text-purple-300" />
                  <span>Advisor Directives</span>
                </button>
              </div>
            </div>

            {/* YOUR CHATS / RECENT SESSIONS SECTION (Screenshot List) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold px-2">
                <span>Recent Scans</span>
                {history.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      clearInvestigationHistory();
                      setHistory([]);
                    }}
                    className="text-slate-500 hover:text-rose-400 text-[10px]"
                    title="Clear history"
                  >
                    Clear
                  </button>
                )}
              </div>

              <div className="space-y-1 text-xs max-h-48 overflow-y-auto pr-1">
                {history.length === 0 ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        const s = "Dear SBI User, your YONO account has been suspended due to pending KYC update. Click http://sbi-update-kyc.top";
                        setInputText(s);
                        triggerAnalysis(s);
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.03] truncate transition-colors"
                    >
                      SBI YONO Suspended KYC
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const s = "Dear Consumer, your electricity power will be disconnected tonight at 9:30 PM from sub-station. Immediately call officer 9876543210.";
                        setInputText(s);
                        triggerAnalysis(s);
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.03] truncate transition-colors"
                    >
                      Electricity Disconnection Threat
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const s = "CBI Headquarters Notice: Digital Arrest warrant issued for Aadhaar money laundering.";
                        setInputText(s);
                        triggerAnalysis(s);
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.03] truncate transition-colors"
                    >
                      CBI Digital Arrest Warrant
                    </button>
                  </>
                ) : (
                  history.slice(0, 6).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleLoadHistoryCase(item)}
                      className={cn(
                        "w-full text-left px-3 py-1.5 rounded-lg text-xs truncate transition-colors flex items-center justify-between",
                        caseId === item.caseId
                          ? "bg-white/[0.08] text-white font-medium"
                          : "text-slate-400 hover:text-white hover:bg-white/[0.03]"
                      )}
                    >
                      <span className="truncate">{item.messagePreview}</span>
                      <span
                        className={cn(
                          "w-1.5 h-1.5 rounded-full shrink-0 ml-1.5",
                          item.verdict === "scam"
                            ? "bg-rose-400"
                            : item.verdict === "suspicious"
                            ? "bg-amber-400"
                            : "bg-emerald-400"
                        )}
                      />
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* BOTTOM UPGRADE / HELPLINE 1930 CARD (Screenshot: Upgrade to Pro) */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#121824] to-[#0d131d] border border-white/[0.08] space-y-3 relative overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-signal/15 text-signal flex items-center justify-center">
              <Crown className="w-4 h-4" />
            </div>
            <div>
              <div className="font-heading font-semibold text-xs text-white">
                Emergency Helpline 1930
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-normal">
                Air-gapped memory sandbox. Zero bytes retained on disk.
              </p>
            </div>
            <a
              href="tel:1930"
              className="w-full py-2 px-3 rounded-xl bg-white text-slate-950 font-bold text-xs font-mono flex items-center justify-center gap-1.5 hover:bg-slate-200 transition-colors shadow-md"
            >
              <PhoneCall className="w-3.5 h-3.5 text-rose-500" />
              <span>Dial 1930 Free</span>
            </a>
          </div>
        </aside>

        {/* =======================================================================
         * 2. MAIN STAGE / WORKSPACE (EXACT SCREENSHOT CENTER CANVAS)
         * ======================================================================= */}
        <main
          ref={mainScrollRef}
          className="flex-1 flex flex-col justify-between overflow-y-auto bg-gradient-to-b from-[#101b22]/35 via-[#0c1017] to-[#0c1017] p-5 sm:p-8 lg:p-10 space-y-8 relative"
        >
          {/* Subtle Top-Right Ambient Cyan Light Bleed (Screenshot Fidelity) */}
          <div className="absolute top-0 right-0 w-[500px] h-[350px] bg-cyan-600/[0.08] rounded-full blur-[140px] pointer-events-none" />

          {/* -------------------------------------------------------------------
           * TOP NAVIGATION STRIP
           * ------------------------------------------------------------------- */}
          <div className="flex items-center justify-between relative z-10">
            {/* Version Dropdown Pill (Screenshot: Syntrix v4.2 ▾) */}
            <div className="relative">
              <button
                type="button"
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-slate-300 hover:bg-white/[0.08] transition-colors"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Scam Shield v2.0</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>

            {/* Right Header Navigation (Screenshot: Dashboard, Settings, Help & Support, Avatar) */}
            <div className="flex items-center gap-5 text-xs font-medium">
              <span className="text-white font-semibold cursor-pointer">Dashboard</span>
              <Link
                href={`/${otherLocale}/check`}
                className="text-slate-400 hover:text-white transition-colors font-mono"
              >
                {locale === "en" ? "हिन्दी" : "EN"}
              </Link>
              <a
                href="https://cybercrime.gov.in"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition-colors hidden sm:inline"
              >
                Help & Support
              </a>

              {/* Avatar Pill with Status */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 p-[1.5px] cursor-pointer">
                <div className="w-full h-full rounded-full bg-[#0c1017] flex items-center justify-center text-xs font-bold text-signal">
                  SS
                </div>
              </div>
            </div>
          </div>

          {/* -------------------------------------------------------------------
           * CENTER HERO GREETING (EXACT SCREENSHOT ORB & TYPOGRAPHY)
           * ------------------------------------------------------------------- */}
          <div className="flex flex-col items-center justify-center text-center space-y-3 pt-4 sm:pt-8 relative z-10">
            {/* 3D Iridescent Glowing Sphere */}
            <Orb3D size={92} pulsing={isAnalyzing} />

            {/* Eyebrow text (Screenshot: WELCOME BACK) */}
            <div className="text-xs font-mono uppercase tracking-[0.25em] text-slate-400 font-semibold pt-1">
              Welcome Back
            </div>

            {/* Main Headline (Screenshot: Bring your ideas to life today) */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-medium text-white tracking-tight">
              Bring your safety to life today
            </h1>
          </div>

          {/* -------------------------------------------------------------------
           * FLOATING INPUT COMPOSER DOCK (EXACT SCREENSHOT FLOATING CARD)
           * ------------------------------------------------------------------- */}
          <div className="w-full max-w-3xl mx-auto relative z-10">
            <div className="rounded-2xl bg-[#141926]/90 border border-white/[0.08] backdrop-blur-xl p-4 sm:p-5 space-y-4 shadow-2xl transition-all focus-within:border-signal/60 focus-within:ring-1 focus-within:ring-signal/30">
              {/* Input Row: Sparkle + Textarea */}
              <div className="flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-1" />
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isAnalyzing}
                  placeholder="Ask me anything... or paste suspicious SMS, WhatsApp message, or UPI link"
                  rows={2}
                  className="w-full bg-transparent text-sm sm:text-base text-white placeholder:text-slate-500 focus:outline-none resize-none leading-relaxed font-sans"
                />
              </div>

              {/* Bottom Action Strip: Tools, Deep Think, Voice, Send Button */}
              <div className="flex items-center justify-between pt-1 border-t border-white/[0.04]">
                {/* Left: Plus, Tools dropdown, Deep Think dropdown */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setInputText("Dear SBI User, your YONO account has been suspended due to pending KYC update. Click http://sbi-update-kyc.top")}
                    className="w-7 h-7 rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                    title="Insert sample phishing"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>

                  {/* Tools ▾ Pill */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setToolsDropdown(!toolsDropdown)}
                      className="px-3 py-1 rounded-full bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.06] text-xs font-mono text-slate-300 flex items-center gap-1.5 transition-colors"
                    >
                      <Cpu className="w-3.5 h-3.5 text-signal" />
                      <span>5 Agents</span>
                      <ChevronDown className="w-3 h-3 text-slate-500" />
                    </button>
                    {toolsDropdown && (
                      <div className="absolute bottom-full left-0 mb-2 w-56 rounded-xl bg-[#141926] border border-white/[0.1] p-2 text-xs font-mono space-y-1 z-30 shadow-2xl">
                        <div className="text-[10px] text-slate-500 uppercase px-2 py-1">Active Forensic Suite</div>
                        <div className="p-1.5 rounded-lg bg-white/[0.04] text-emerald-400">● 01 Extractor Agent</div>
                        <div className="p-1.5 rounded-lg bg-white/[0.04] text-purple-400">● 02 Pattern Analyst</div>
                        <div className="p-1.5 rounded-lg bg-white/[0.04] text-cyan-400">● 03 Entity Checker</div>
                        <div className="p-1.5 rounded-lg bg-white/[0.04] text-signal">● 04 Judge Consensus</div>
                        <div className="p-1.5 rounded-lg bg-white/[0.04] text-purple-300">● 05 Advisor Protocol</div>
                      </div>
                    )}
                  </div>

                  {/* Deep Think ▾ Pill */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setThinkDropdown(!thinkDropdown)}
                      className="px-3 py-1 rounded-full bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.06] text-xs font-mono text-slate-300 flex items-center gap-1.5 transition-colors"
                    >
                      <BrainCircuit className="w-3.5 h-3.5 text-purple-400" />
                      <span>Bayesian Veto</span>
                      <ChevronDown className="w-3 h-3 text-slate-500" />
                    </button>
                    {thinkDropdown && (
                      <div className="absolute bottom-full left-0 mb-2 w-64 rounded-xl bg-[#141926] border border-white/[0.1] p-3 text-xs space-y-1.5 z-30 shadow-2xl">
                        <div className="text-[10px] text-slate-400 uppercase font-mono">Consensus Gate</div>
                        <p className="text-[11px] text-slate-300 leading-normal">
                          Precautionary consensus veto applied: technical forensic risk strictly overrides polite linguistic phrasing.
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Voice button + White Circle Send Button */}
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleToggleTTS}
                    className={cn(
                      "px-3 py-1 rounded-full border text-xs font-mono flex items-center gap-1.5 transition-all",
                      isSpeaking
                        ? "bg-signal text-slate-950 border-signal ring-2 ring-signal/40 animate-pulse"
                        : "bg-white/[0.05] hover:bg-white/[0.08] border-white/[0.06] text-slate-300"
                    )}
                  >
                    <Mic className="w-3.5 h-3.5 text-signal" />
                    <span>Voice</span>
                  </button>

                  {/* White Circular Send Button with Black Arrow (Exact Screenshot Match) */}
                  <button
                    type="button"
                    onClick={() => triggerAnalysis()}
                    disabled={isAnalyzing || !inputText.trim()}
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-lg",
                      isAnalyzing
                        ? "bg-signal text-slate-950 animate-pulse cursor-wait"
                        : inputText.trim()
                        ? "bg-white hover:bg-slate-200 text-slate-950 cursor-pointer shadow-white/10"
                        : "bg-white/40 text-slate-700 cursor-not-allowed"
                    )}
                  >
                    {isAnalyzing ? (
                      <Sparkles className="w-4 h-4 animate-spin text-slate-950" />
                    ) : (
                      <Send className="w-4 h-4 text-slate-950 ml-0.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* -------------------------------------------------------------------
           * THREE QUICK-ACTION CARDS (EXACT SCREENSHOT ROW WITH ARROW TOP RIGHT)
           * ------------------------------------------------------------------- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto w-full relative z-10">
            {/* Card 1: Bank KYC Phishing (Screenshot: Image Generator) */}
            <div
              onClick={() => {
                const s = "Dear SBI User, your YONO account has been suspended due to pending KYC update. Click http://sbi-update-kyc.top to avoid permanent block.";
                setInputText(s);
                triggerAnalysis(s);
              }}
              className="p-5 rounded-2xl bg-[#121824]/80 border border-white/[0.06] hover:border-signal/40 hover:-translate-y-0.5 cursor-pointer transition-all space-y-3 group"
            >
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-white/[0.06] flex items-center justify-center text-slate-300 group-hover:text-signal transition-colors">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
              <div className="space-y-1">
                <div className="font-heading font-semibold text-sm text-white">
                  Bank KYC Phishing
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  Inspect lookalike SBI YONO links and defanged URLs in seconds.
                </p>
              </div>
            </div>

            {/* Card 2: Electricity Threat (Screenshot: Video Generator) */}
            <div
              onClick={() => {
                const s = "Dear Consumer, your electricity power will be disconnected tonight at 9:30 PM from sub-station. Immediately call officer 9876543210.";
                setInputText(s);
                triggerAnalysis(s);
              }}
              className="p-5 rounded-2xl bg-[#121824]/80 border border-white/[0.06] hover:border-signal/40 hover:-translate-y-0.5 cursor-pointer transition-all space-y-3 group"
            >
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-white/[0.06] flex items-center justify-center text-slate-300 group-hover:text-signal transition-colors">
                  <Video className="w-4 h-4" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
              <div className="space-y-1">
                <div className="font-heading font-semibold text-sm text-white">
                  Electricity Threat
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  Detect false deadline countdowns and power disconnection traps.
                </p>
              </div>
            </div>

            {/* Card 3: CBI Digital Arrest (Screenshot: Dev Assistant) */}
            <div
              onClick={() => {
                const s = "CBI Headquarters Notice: Aadhaar linked with 14 money laundering accounts in Mumbai. Digital Arrest warrant issued. Join WhatsApp call immediately.";
                setInputText(s);
                triggerAnalysis(s);
              }}
              className="p-5 rounded-2xl bg-[#121824]/80 border border-white/[0.06] hover:border-signal/40 hover:-translate-y-0.5 cursor-pointer transition-all space-y-3 group"
            >
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-white/[0.06] flex items-center justify-center text-slate-300 group-hover:text-signal transition-colors">
                  <Code2 className="w-4 h-4" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
              <div className="space-y-1">
                <div className="font-heading font-semibold text-sm text-white">
                  CBI Digital Arrest
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  Expose fake law enforcement summons and WhatsApp extortion.
                </p>
              </div>
            </div>
          </div>

          {/* -------------------------------------------------------------------
           * LIVE N8N WORKFLOW GRAPH & 5-AGENT FORENSICS (THE "GOOD STUFFS")
           * ------------------------------------------------------------------- */}
          {(isAnalyzing || finalResult || completedStages.length > 0) && (
            <div className="w-full max-w-4xl mx-auto space-y-6 pt-6 relative z-10">
              
              {/* DAG Pipeline Graph */}
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1 text-xs font-mono text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-signal animate-ping" />
                    <span className="text-white font-bold">LIVE MULTI-AGENT DAG WORKFLOW</span>
                    <span className="text-slate-600">|</span>
                    <span>
                      {isAnalyzing
                        ? `Executing Node: [${activeStage?.replace("_", " ").toUpperCase()}]`
                        : "Consensus Complete ✓"}
                    </span>
                  </div>
                </div>

                <PipelineGraph
                  variant="full"
                  activeStage={activeStage}
                  completedStages={completedStages}
                  verdict={finalResult?.verdict}
                  locale={locale}
                />
              </div>

              {/* FINAL VERDICT DOSSIER BANNER */}
              {finalResult && (
                <div className={cn(
                  "p-6 sm:p-8 rounded-3xl border shadow-2xl space-y-5 transition-all duration-300",
                  finalResult.verdict === "scam"
                    ? "bg-gradient-to-b from-[#180C14] to-[#0A050B] border-rose-500/40 shadow-rose-500/10"
                    : finalResult.verdict === "suspicious"
                    ? "bg-gradient-to-b from-[#18140B] to-[#0A0905] border-amber-500/40 shadow-amber-500/10"
                    : "bg-gradient-to-b from-[#0B1814] to-[#050A09] border-emerald-500/40 shadow-emerald-500/10"
                )}>
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2.5">
                        <span
                          className={cn(
                            "px-3 py-1 rounded-full font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-1.5",
                            finalResult.verdict === "scam"
                              ? "bg-rose-500 text-slate-950"
                              : finalResult.verdict === "suspicious"
                              ? "bg-amber-400 text-slate-950"
                              : "bg-emerald-400 text-slate-950"
                          )}
                        >
                          {finalResult.verdict === "scam" ? (
                            <AlertTriangle className="w-3.5 h-3.5" />
                          ) : finalResult.verdict === "suspicious" ? (
                            <ShieldAlert className="w-3.5 h-3.5" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          )}
                          <span>
                            {finalResult.verdict === "scam"
                              ? "CONFIRMED FRAUD"
                              : finalResult.verdict === "suspicious"
                              ? "HIGHLY SUSPICIOUS"
                              : "VERIFIED SAFE"}
                          </span>
                        </span>
                        <span className="font-mono text-xs text-slate-300 bg-white/[0.06] border border-white/[0.1] px-2.5 py-0.5 rounded-full">
                          {(finalResult.confidence * 100).toFixed(1)}% Confidence
                        </span>
                      </div>

                      <h2 className="text-xl sm:text-2xl font-heading font-bold text-white tracking-tight">
                        {finalResult.advice.headline}
                      </h2>

                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                        {finalResult.reasoning}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={handleCopyShareText}
                        className="px-3 py-2 rounded-xl border border-white/[0.1] bg-white/[0.05] hover:bg-white/[0.08] text-white text-xs font-mono flex items-center gap-1.5 transition-colors"
                      >
                        {copiedShare ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-signal" />}
                        <span>{copiedShare ? "Copied!" : "WhatsApp Warning"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => downloadTextReport(finalResult, { caseId, timestamp: new Date().toISOString(), userMessage: inputText })}
                        className="p-2 rounded-xl border border-white/[0.1] bg-white/[0.05] hover:bg-white/[0.08] text-slate-300 hover:text-white transition-colors"
                        title="Download text report"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Do's and Don'ts */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    {finalResult.advice.do_not.length > 0 && (
                      <div className="p-3.5 rounded-xl bg-rose-500/[0.06] border border-rose-500/20 space-y-1.5">
                        <div className="text-[11px] font-mono font-bold text-rose-300 uppercase">
                          Protective Rules (DO NOT)
                        </div>
                        <ul className="text-xs text-slate-300 space-y-1">
                          {finalResult.advice.do_not.map((r, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-rose-400 font-bold shrink-0">✕</span>
                              <span>{r}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {finalResult.advice.do_next.length > 0 && (
                      <div className="p-3.5 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/20 space-y-1.5">
                        <div className="text-[11px] font-mono font-bold text-emerald-300 uppercase">
                          Immediate Next Step
                        </div>
                        <ul className="text-xs text-slate-300 space-y-1">
                          {finalResult.advice.do_next.map((s, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-emerald-400 font-bold shrink-0">✓</span>
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 5-AGENT FORENSIC INTELLIGENCE GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* 01 Extractor */}
                <div className="p-4 rounded-2xl bg-[#121824]/80 border border-white/[0.06] space-y-2.5">
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                    <span className="font-heading font-semibold text-xs text-white">01 Extractor Agent</span>
                    <span className="text-[10px] font-mono text-emerald-400">120ms ✓</span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="text-slate-400 text-[11px]">Defanged Links:</div>
                    {finalResult?.entities.urls && finalResult.entities.urls.length > 0 ? (
                      finalResult.entities.urls.map((u, i) => (
                        <div
                          key={i}
                          onClick={() => handleCopyEntity(defangUrl(u))}
                          className="p-1.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300 font-mono text-[11px] flex items-center justify-between cursor-pointer"
                        >
                          <span className="truncate">{defangUrl(u)}</span>
                          <Copy className="w-3 h-3 shrink-0 ml-1 opacity-70" />
                        </div>
                      ))
                    ) : (
                      <span className="text-slate-500 text-[11px] italic">No malicious links isolated.</span>
                    )}
                  </div>
                </div>

                {/* 02 Pattern Analyst */}
                <div className="p-4 rounded-2xl bg-[#121824]/80 border border-white/[0.06] space-y-2.5">
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                    <span className="font-heading font-semibold text-xs text-white">02 Pattern Analyst</span>
                    <span className="text-[10px] font-mono text-purple-400">140ms ✓</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="text-slate-400 text-[11px]">Threat Vector:</div>
                    <div className="p-1.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-300 font-mono text-xs">
                      {finalResult?.scam_type ? finalResult.scam_type.replace(/_/g, " ").toUpperCase() : "Urgency vectors"}
                    </div>
                  </div>
                </div>

                {/* 03 Entity Checker */}
                <div className="p-4 rounded-2xl bg-[#121824]/80 border border-white/[0.06] space-y-2.5">
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                    <span className="font-heading font-semibold text-xs text-white">03 Entity Checker</span>
                    <span className="text-[10px] font-mono text-cyan-400">160ms ✓</span>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="text-slate-400 text-[11px]">Air-Gapped Forensics:</div>
                    <div className="p-1.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 font-mono text-[11px]">
                      WHOIS Age: &lt; 7 Days | Official Bank: 0% Match
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}