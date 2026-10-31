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
} from "lucide-react";
import { cn, defangUrl, defangHandle } from "@/lib/utils";
import { EvidenceDonut } from "@/components/ui/EvidenceDonut";
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

  const [inputText, setInputText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeStage, setActiveStage] = useState<string | null>(null);
  const [completedStages, setCompletedStages] = useState<string[]>([]);
  const [stageOutputs, setStageOutputs] = useState<Record<string, StageResultEvent>>({});
  const [finalResult, setFinalResult] = useState<FinalResultEvent | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [caseId, setCaseId] = useState("SS-0042");

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [saveTextPref, setSaveTextPref] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  const threadEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHistory(getInvestigationHistory());
    setSaveTextPref(getSaveTextPreference());

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
    <div className="min-h-screen bg-[#070B14] text-[#F1F5F9] flex flex-col items-center justify-between p-4 sm:p-8 selection:bg-signal/20 selection:text-signal">
      {/* =========================================================================
       * HERMES HEADER (EXACT SCREENSHOT 3 TITLE HIERARCHY)
       * ========================================================================= */}
      <div className="w-full max-w-6xl text-center space-y-3 mb-8">
        <Link href={`/${locale}`} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-slate-300 hover:text-white transition-colors">
          <div className="w-4 h-4 rounded bg-signal/20 text-signal flex items-center justify-center font-bold text-[9px]">
            SS
          </div>
          <span>Hermes Agent Platform</span>
        </Link>
        <h1 className="text-4xl sm:text-6xl font-heading font-black tracking-tight text-white">
          Hermes Web UI
        </h1>
        <p className="text-slate-400 text-sm sm:text-base font-normal">
          Autonomous Multi-Agent Investigation Console for Citizens & Forensics
        </p>
      </div>

      {/* =========================================================================
       * MAIN 3-COLUMN HERMES WORKSPACE (SCREENSHOT 3 REPRODUCTION)
       * ========================================================================= */}
      <div className="w-full max-w-6xl rounded-3xl bg-[#0B0E17] border border-white/[0.1] shadow-2xl p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 relative overflow-hidden backdrop-blur-2xl">
        {/* Subtle Ambient Radial Lighting */}
        <div className="absolute top-0 right-1/4 w-[400px] h-[300px] bg-blue-600/[0.04] rounded-full blur-[100px] pointer-events-none" />

        {/* =======================================================================
         * 1. LEFT SIDEBAR (SCREENSHOT 3: HERMES NAVIGATION)
         * ======================================================================= */}
        <aside className="lg:col-span-3 rounded-2xl bg-[#070B13] border border-white/[0.06] p-4 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Logo */}
            <div className="flex items-center gap-2.5 pb-3 border-b border-white/[0.06] text-white font-heading font-bold text-sm">
              <div className="w-7 h-7 rounded-lg bg-signal/20 text-signal flex items-center justify-center">
                <Shield className="w-4 h-4" />
              </div>
              <span>Hermes</span>
            </div>

            {/* Navigation Items (Screenshot 3 Style) */}
            <nav className="space-y-1 font-mono text-xs">
              <button
                type="button"
                onClick={handleNewCheck}
                className="w-full p-2.5 rounded-xl bg-white/[0.08] border border-white/[0.1] text-white font-medium flex items-center gap-3 text-left shadow-xs transition-colors"
              >
                <MessageSquare className="w-4 h-4 text-signal" />
                <span>Chat</span>
              </button>

              <div className="w-full p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.03] flex items-center gap-3 transition-colors cursor-pointer">
                <Users className="w-4 h-4" />
                <span>Agents (5)</span>
              </div>

              <div className="w-full p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.03] flex items-center gap-3 transition-colors cursor-pointer">
                <Clock className="w-4 h-4" />
                <span>Sessions</span>
              </div>

              <div className="w-full p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.03] flex items-center gap-3 transition-colors cursor-pointer">
                <Box className="w-4 h-4" />
                <span>Tools</span>
              </div>

              <div className="w-full p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.03] flex items-center gap-3 transition-colors cursor-pointer">
                <BookOpen className="w-4 h-4" />
                <span>Knowledge</span>
              </div>

              <div className="w-full p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.03] flex items-center gap-3 transition-colors cursor-pointer">
                <BarChart3 className="w-4 h-4" />
                <span>Analytics</span>
              </div>

              <div className="w-full p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.03] flex items-center gap-3 transition-colors cursor-pointer">
                <FileText className="w-4 h-4" />
                <span>Logs</span>
              </div>

              <div className="w-full p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.03] flex items-center gap-3 transition-colors cursor-pointer">
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </div>
            </nav>
          </div>

          {/* 1930 Helpline Box at Bottom */}
          <div className="pt-3 border-t border-white/[0.06] space-y-2">
            <a
              href="tel:1930"
              className="p-3 rounded-xl bg-signal/10 border border-signal/20 hover:bg-signal/20 text-signal flex items-center gap-2.5 text-xs transition-colors"
            >
              <PhoneCall className="w-4 h-4 shrink-0" />
              <div>
                <div className="font-bold font-mono">Dial 1930 Helpline</div>
                <div className="text-[10px] text-slate-400">National Cybercrime</div>
              </div>
            </a>
          </div>
        </aside>

        {/* =======================================================================
         * 2. MIDDLE CHAT THREAD (SCREENSHOT 3 CENTER PANEL)
         * ======================================================================= */}
        <section className="lg:col-span-6 rounded-2xl bg-[#070B13] border border-white/[0.06] flex flex-col justify-between h-[650px] relative overflow-hidden">
          {/* Header (Screenshot 3: Agent Avatar + Online Dot) */}
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
                  <span>Online • 5 Agents Active</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleNewCheck}
              className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-white/[0.04] transition-colors"
              title="Reset check"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-sans">
            {/* Welcome Bubble if empty */}
            {!inputText && !finalResult && !isAnalyzing && (
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2 text-slate-300">
                <div className="font-heading font-bold text-white text-sm">Investigation Ready</div>
                <p className="text-slate-400 leading-relaxed">
                  Paste any suspicious SMS, WhatsApp forward, electricity bill threat, or UPI collect request below. The 5 specialized agents will inspect links without opening them and deliver a clear verdict.
                </p>
                <div className="pt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const s = "Dear SBI User, your YONO account has been suspended due to pending KYC update. Click http://sbi-update-kyc.top";
                      setInputText(s);
                      triggerAnalysis(s);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-[11px] font-mono text-slate-200"
                  >
                    Load SBI KYC Phishing Sample
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const s = "Dear Consumer, your electricity power will be disconnected tonight at 9:30 PM. Call officer 9876543210 immediately.";
                      setInputText(s);
                      triggerAnalysis(s);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] text-[11px] font-mono text-slate-200"
                  >
                    Load Electricity Cut Sample
                  </button>
                </div>
              </div>
            )}

            {/* User Bubble (Screenshot 3 User Message) */}
            {inputText && (
              <div className="flex justify-end gap-2.5">
                <div className="max-w-[85%] p-3.5 rounded-2xl rounded-tr-xs bg-[#12192D] border border-white/[0.08] text-slate-100 shadow-sm leading-relaxed">
                  {inputText}
                </div>
              </div>
            )}

            {/* In-Flight Pipeline Status */}
            {isAnalyzing && (
              <div className="p-3.5 rounded-xl bg-signal/10 border border-signal/30 text-signal space-y-2">
                <div className="flex items-center gap-2 font-mono font-semibold text-xs">
                  <div className="w-2 h-2 rounded-full bg-signal animate-ping" />
                  <span>5-AGENT PIPELINE EXECUTING...</span>
                </div>
                <div className="text-[11px] text-slate-300 font-mono">
                  Extractor → Parallel Forensic Check → Judge Consensus → Plain Action
                </div>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {errorMessage}
              </div>
            )}

            {/* Agent Result Bubble (Screenshot 3 Assistant Reply) */}
            {finalResult && (
              <div className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-signal/20 text-signal flex items-center justify-center font-bold text-[10px] shrink-0 mt-1">
                  SS
                </div>
                <div
                  className={cn(
                    "flex-1 p-4 rounded-2xl rounded-tl-xs border space-y-3 shadow-md",
                    finalResult.verdict === "scam"
                      ? "bg-rose-500/10 border-rose-500/30 text-slate-100"
                      : finalResult.verdict === "suspicious"
                      ? "bg-amber-500/10 border-amber-500/30 text-slate-100"
                      : "bg-emerald-500/10 border-emerald-500/30 text-slate-100"
                  )}
                >
                  {/* Verdict Badge */}
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "font-heading font-black text-sm uppercase px-2.5 py-1 rounded-md",
                        finalResult.verdict === "scam"
                          ? "bg-rose-500 text-slate-950"
                          : finalResult.verdict === "suspicious"
                          ? "bg-amber-500 text-slate-950"
                          : "bg-emerald-500 text-slate-950"
                      )}
                    >
                      {finalResult.verdict === "scam" ? "VERDICT: SCAM" : finalResult.verdict === "suspicious" ? "VERDICT: SUSPICIOUS" : "VERDICT: SAFE"}
                    </span>
                    <span className="font-mono font-bold text-xs">
                      {Math.round(finalResult.confidence * 100)}% CONFIDENCE
                    </span>
                  </div>

                  {/* Plain Language Rationale */}
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {finalResult.reasoning}
                  </p>

                  {/* Bulleted Action Steps (Screenshot 3 Assistant Reply with Bullets) */}
                  <div className="space-y-1.5 pt-2 border-t border-white/[0.08] text-xs">
                    <div className="font-mono uppercase text-[10px] text-slate-400">Recommended Steps:</div>
                    {finalResult.advice.do_not.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-rose-300">
                        <span className="font-bold">•</span>
                        <span>{item}</span>
                      </div>
                    ))}
                    {finalResult.advice.do_next.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-emerald-300">
                        <span className="font-bold">•</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="pt-2 flex flex-wrap items-center gap-2 border-t border-white/[0.08]">
                    <button
                      type="button"
                      onClick={handleToggleTTS}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-[11px] font-mono flex items-center gap-1.5 text-slate-300"
                    >
                      {isSpeaking ? <VolumeX className="w-3 h-3 text-signal" /> : <Volume2 className="w-3 h-3" />}
                      <span>{isSpeaking ? "Stop" : "Listen"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleCopyShareText}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-[11px] font-mono flex items-center gap-1.5 text-slate-300"
                    >
                      {copiedShare ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedShare ? "Copied" : "Copy Warning"}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => downloadTextReport(finalResult, { caseId, timestamp: new Date().toISOString() })}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-[11px] font-mono flex items-center gap-1.5 text-slate-300"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download Report</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div ref={threadEndRef} />
          </div>

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
                placeholder="Type your message..."
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
         * 3. RIGHT SIDEBAR (SCREENSHOT 3: 3 STACKED CARDS)
         * ======================================================================= */}
        <aside className="lg:col-span-3 space-y-4">
          {/* Card 1: Agents (Screenshot 3: Active 12, Circle Avatars) */}
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

            {/* Circular Agent Avatars (Screenshot 3 Style) */}
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

          {/* Card 2: Conversations (Screenshot 3: Sparkline + Count) */}
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

          {/* Card 3: Tools Donut Chart (Screenshot 3: Segmented Donut with Legend) */}
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
      <div className="w-full max-w-6xl pt-8 space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center text-xs font-mono text-slate-400">
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-center gap-2">
            <BarChart3 className="w-3.5 h-3.5 text-signal" />
            <span>Analytics</span>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-center gap-2">
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            <span>Agent Management</span>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-center gap-2">
            <Box className="w-3.5 h-3.5 text-cyan-400" />
            <span>Powerful Tools</span>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04] flex items-center justify-center gap-2">
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
