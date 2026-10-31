"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  Info,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Cpu,
  Layers,
  Database,
  EyeOff,
  ArrowRight,
  Globe2,
  Activity,
  Terminal,
  Server,
  Zap,
  Check,
  Send,
  Sparkles,
} from "lucide-react";
import * as Accordion from "@radix-ui/react-accordion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PipelineGraph } from "@/components/pipeline/PipelineGraph";
import { EvidenceDonut } from "@/components/ui/EvidenceDonut";
import { SpecRow } from "@/components/ui/SpecRow";

export default function LandingPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();

  const [inputText, setInputText] = useState("");

  const handleLaunchCheck = (sampleText?: string) => {
    const textToPass = sampleText || inputText || "Dear SBI User, your YONO account has been suspended due to pending KYC update. Click http://sbi-update-kyc.top";
    if (typeof window !== "undefined") {
      sessionStorage.setItem("scam_shield_prefill", textToPass);
    }
    router.push(`/${locale}/check`);
  };

  return (
    <div className="min-h-screen bg-[#050811] text-[#F1F5F9] selection:bg-signal/20 selection:text-signal relative overflow-x-hidden">
      <Header />

      <main id="main-content">
        {/* =========================================================================
         * 1. HERO SECTION (EXACT CYBERSAFE SCREENSHOT 1 FIDELITY)
         * ========================================================================= */}
        <section className="relative min-h-[92svh] flex flex-col justify-center pt-8 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-white/[0.06]">
          {/* Subtle Ambient Radial Lighting */}
          <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[550px] bg-blue-600/[0.07] rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute top-1/3 right-1/4 w-[500px] h-[400px] bg-signal/[0.05] rounded-full blur-[120px] pointer-events-none" />

          {/* Huge Faint Watermark (Screenshot 1: "CYBERSAFE" -> "SCAMSHIELD") */}
          <div
            className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[15vw] font-heading font-black tracking-tighter text-white/[0.02] select-none pointer-events-none uppercase whitespace-nowrap"
            aria-hidden="true"
          >
            SCAM SHIELD
          </div>

          <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10 py-6">
            {/* Left Column: Hero Copy & Actions (Screenshot 1) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Top Pill Status Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-slate-300">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                </span>
                <span>Network Status: <span className="text-emerald-400 font-semibold">SECURE</span></span>
                <span className="text-white/[0.2]">|</span>
                <span className="text-slate-400">ALL THREATS BLOCKED</span>
              </div>

              {/* Headline (Screenshot 1: "Your Data, Your Control") */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-heading font-bold tracking-tight text-white leading-[1.05]">
                Your Safety, <br />
                <span className="text-slate-300 font-normal">Your Control</span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-400 max-w-xl leading-relaxed">
                Military-grade multi-agent forensic verification. Zero-logs policy. 70+ Indian bank, utility, and law enforcement lookalikes tracked across 120 verification nodes.
              </p>

              {/* Action Buttons (Screenshot 1: "How it Works" & "Start Free Trial ->") */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href={`/${locale}#pipeline`}
                  className="px-6 py-3 rounded-full bg-white/[0.06] border border-white/[0.1] hover:bg-white/[0.1] text-white font-medium text-sm transition-all shadow-sm"
                >
                  How It Works
                </Link>

                <button
                  type="button"
                  onClick={() => handleLaunchCheck()}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-slate-950 font-semibold text-sm hover:bg-slate-200 transition-all shadow-lg group cursor-pointer"
                >
                  <span>Start Inspection — Free</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Quick Input Bar directly in Hero */}
              <div className="pt-4 max-w-xl">
                <div className="p-2 rounded-2xl bg-[#090E1D] border border-white/[0.1] shadow-xl flex items-center gap-2 focus-within:border-signal/60 transition-all">
                  <Search className="w-4 h-4 text-slate-400 ml-2.5 shrink-0" />
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLaunchCheck()}
                    placeholder="Paste suspicious SMS, WhatsApp message, or UPI link..."
                    className="w-full bg-transparent text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleLaunchCheck()}
                    className="px-4 py-2 rounded-xl bg-signal text-slate-950 font-semibold text-xs shrink-0 hover:brightness-110 transition-all"
                  >
                    Check
                  </button>
                </div>
              </div>

              {/* Institutional Trust Logos (Screenshot 1 Grayscale Bar) */}
              <div className="pt-6 space-y-2 border-t border-white/[0.06] max-w-xl">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">
                  Institutional Verification Standards
                </span>
                <div className="flex items-center gap-6 text-xs font-mono text-slate-400">
                  <span className="hover:text-white transition-colors">NATIONAL 1930</span>
                  <span className="hover:text-white transition-colors">CYBERCRIME.GOV.IN</span>
                  <span className="hover:text-white transition-colors">NPCI UPI GATEWAY</span>
                  <span className="hover:text-white transition-colors">TRAI DND</span>
                </div>
              </div>
            </div>

            {/* Right Column: Floating Cyber-Card Visual (Screenshot 1 Top Right Terminal) */}
            <div className="lg:col-span-5 relative flex justify-center">
              {/* Floating App Mockup Window */}
              <div className="w-full max-w-md rounded-2xl bg-[#0A0F1E]/95 border border-white/[0.12] p-5 shadow-2xl backdrop-blur-xl space-y-5 relative">
                {/* Window Header */}
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="font-mono text-slate-400 text-[11px]">Scam Shield — Sentinel Active</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-mono font-bold">
                    LIVE
                  </span>
                </div>

                {/* Central Status Graphic */}
                <div className="flex flex-col items-center justify-center py-4 text-center space-y-2">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-2xl bg-signal/15 border border-signal/40 flex items-center justify-center text-signal shadow-lg">
                      <ShieldCheck className="w-8 h-8" />
                    </div>
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                    </span>
                  </div>
                  <div className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                    ● 5 AGENTS ONLINE
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Node: <span className="text-signal">National AI Sandbox (Prayagraj-01)</span>
                  </div>
                </div>

                {/* 2x2 Forensic Metrics Grid (Screenshot 1 Style) */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1">
                    <div className="text-[10px] text-slate-400 uppercase">CITIZEN IDENTITY</div>
                    <div className="text-white font-bold">Hashed & Salted ✓</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1">
                    <div className="text-[10px] text-slate-400 uppercase">DISK LOGS</div>
                    <div className="text-emerald-400 font-bold">0 Bytes Retained ✓</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1">
                    <div className="text-[10px] text-slate-400 uppercase">LINK FORENSICS</div>
                    <div className="text-signal font-bold">Air-Gapped DNS ✓</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1">
                    <div className="text-[10px] text-slate-400 uppercase">CONSENSUS GATE</div>
                    <div className="text-white font-bold">Veto Mode Active ✓</div>
                  </div>
                </div>

                {/* Bottom Pill Badge in Card */}
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs text-emerald-400">
                  <span className="font-mono">National Helpline Linked</span>
                  <span className="font-bold font-mono">Dial 1930</span>
                </div>

                {/* Floating Glass Badge (Screenshot 1: "8,900+") */}
                <div className="absolute -bottom-5 -left-5 p-3 px-4 rounded-xl bg-[#10182E]/90 border border-white/[0.15] shadow-2xl backdrop-blur-md flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-signal/20 text-signal flex items-center justify-center">
                    <Globe2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-heading font-bold text-sm text-white leading-none">70+ Brands</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">Live Phishing Feeds</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
         * 2. METRICS ROW (SCREENSHOT 1: 120, AES-256, ZERO, 99.98%)
         * ========================================================================= */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-white/[0.06]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Metric 1 */}
            <div className="p-6 rounded-2xl bg-[#090E1D] border border-white/[0.08] hover:border-signal/40 transition-all flex flex-col justify-between space-y-4">
              <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center">
                <Server className="w-4 h-4" />
              </div>
              <div>
                <div className="font-heading text-4xl font-bold text-white tracking-tight">120+</div>
                <div className="text-xs text-slate-400 font-mono mt-1">Verification Nodes Tested</div>
              </div>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] text-slate-300 w-fit">
                DAG PIPELINE
              </span>
            </div>

            {/* Metric 2 */}
            <div className="p-6 rounded-2xl bg-[#090E1D] border border-white/[0.08] hover:border-signal/40 transition-all flex flex-col justify-between space-y-4">
              <div className="w-8 h-8 rounded-lg bg-signal/15 border border-signal/30 text-signal flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="font-heading text-4xl font-bold text-white tracking-tight">100%</div>
                <div className="text-xs text-slate-400 font-mono mt-1">Scam Recall on Benchmark</div>
              </div>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 w-fit">
                ZERO SCAM BYPASS
              </span>
            </div>

            {/* Metric 3 */}
            <div className="p-6 rounded-2xl bg-[#090E1D] border border-white/[0.08] hover:border-signal/40 transition-all flex flex-col justify-between space-y-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <EyeOff className="w-4 h-4" />
              </div>
              <div>
                <div className="font-heading text-4xl font-bold text-white tracking-tight">Zero</div>
                <div className="text-xs text-slate-400 font-mono mt-1">Citizen Logs Retained</div>
              </div>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] text-slate-300 w-fit">
                HMAC-SHA256 ONLY
              </span>
            </div>

            {/* Metric 4 */}
            <div className="p-6 rounded-2xl bg-[#090E1D] border border-white/[0.08] hover:border-signal/40 transition-all flex flex-col justify-between space-y-4">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <div className="font-heading text-4xl font-bold text-white tracking-tight">99.98%</div>
                <div className="text-xs text-slate-400 font-mono mt-1">Consensus Availability SLA</div>
              </div>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] text-slate-300 w-fit">
                24X7 CITIZEN SHIELD
              </span>
            </div>
          </div>
        </section>

        {/* =========================================================================
         * 3. REAL-TIME RADAR & THREAT MAP (SCREENSHOT 1 CENTER SECTION)
         * ========================================================================= */}
        <section id="threat-map" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 border-b border-white/[0.06]">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <div className="text-xs font-mono uppercase tracking-wider text-signal font-semibold">
              National Infrastructure
            </div>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white tracking-tight">
              Real-Time Forensic Surveillance
            </h2>
            <p className="text-slate-400 text-sm">
              Continuous inspection of high-risk domains, fake banking portals, and impersonation scripts across all 28 Indian states.
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl bg-[#090E1D] border border-white/[0.08] shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Map Simulation Graphic (Left 7 cols) */}
            <div className="lg:col-span-7 rounded-xl bg-[#060913] border border-white/[0.06] p-6 relative overflow-hidden h-[300px] flex items-center justify-center">
              <div
                className="absolute inset-0 opacity-[0.08]"
                style={{
                  backgroundImage: "radial-gradient(circle, #38BDF8 1.5px, transparent 1.5px)",
                  backgroundSize: "24px 24px",
                }}
              />

              {/* Glowing Active Radar Blips across Indian hubs */}
              <div className="relative w-full h-full">
                {/* Node: Delhi */}
                <div className="absolute top-[35%] left-[38%] flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping absolute" />
                  <span className="w-3 h-3 rounded-full bg-emerald-400 relative" />
                  <span className="text-[10px] font-mono text-slate-300 bg-[#090E1D] px-1.5 py-0.5 rounded border border-white/[0.1]">
                    DELHI • Active
                  </span>
                </div>

                {/* Node: Mumbai */}
                <div className="absolute top-[58%] left-[28%] flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-signal animate-ping absolute" />
                  <span className="w-3 h-3 rounded-full bg-signal relative" />
                  <span className="text-[10px] font-mono text-slate-300 bg-[#090E1D] px-1.5 py-0.5 rounded border border-white/[0.1]">
                    MUMBAI • 18ms
                  </span>
                </div>

                {/* Node: Prayagraj / UP */}
                <div className="absolute top-[42%] left-[52%] flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-signal animate-ping absolute" />
                  <span className="w-3 h-3 rounded-full bg-signal relative" />
                  <span className="text-[10px] font-mono text-slate-300 bg-[#090E1D] px-1.5 py-0.5 rounded border border-white/[0.1]">
                    PRAYAGRAJ • Hub
                  </span>
                </div>

                {/* Node: Bengaluru */}
                <div className="absolute top-[75%] left-[40%] flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping absolute" />
                  <span className="w-3 h-3 rounded-full bg-emerald-400 relative" />
                  <span className="text-[10px] font-mono text-slate-300 bg-[#090E1D] px-1.5 py-0.5 rounded border border-white/[0.1]">
                    BENGALURU • Active
                  </span>
                </div>
              </div>
            </div>

            {/* Top Performing Forensics Feed (Right 5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="font-mono text-xs uppercase tracking-wider text-slate-400">
                Top Performing Forensics Engines
              </div>
              <div className="space-y-2.5">
                {[
                  { name: "Domain Age & Registrar WHOIS", latency: "14ms", status: "Active" },
                  { name: "NPCI UPI Gateway VPA Validator", latency: "18ms", status: "Active" },
                  { name: "TRAI Telemarketer DND Filter", latency: "22ms", status: "Active" },
                  { name: "Multilingual OCR Vision Engine", latency: "42ms", status: "Active" },
                  { name: "Bayesian Consensus Veto Judge", latency: "11ms", status: "Active" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#060913] border border-white/[0.06] flex items-center justify-between text-xs font-mono"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-white font-medium">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-signal">{item.latency}</span>
                      <span className="text-slate-500">•</span>
                      <span className="text-emerald-400">{item.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
         * 4. WORKFLOW PIPELINE GRAPH (SCREENSHOT 2 REPRODUCTION)
         * ========================================================================= */}
        <section id="pipeline" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 border-b border-white/[0.06]">
          <PipelineGraph variant="full" locale={locale} />
        </section>

        {/* =========================================================================
         * 5. HERMES INVESTIGATION CONSOLE SHOWCASE (SCREENSHOT 3 REPRODUCTION)
         * ========================================================================= */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 border-b border-white/[0.06]">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <div className="text-xs font-mono uppercase tracking-wider text-signal font-semibold">
              Investigation Workspace
            </div>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white tracking-tight">
              Hermes Multi-Agent Console
            </h2>
            <p className="text-slate-400 text-sm">
              The unified desktop interface for inspecting incoming threats, observing parallel agent consensus, and receiving panic-free guidance.
            </p>
          </div>

          {/* Floating Hermes 3-Column UI (Screenshot 3 Mockup) */}
          <div className="rounded-2xl bg-[#090E1D] border border-white/[0.1] shadow-2xl p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="font-mono text-slate-400 ml-2">Hermes Web UI / Scam Shield v2.0</span>
              </div>
              <Link
                href={`/${locale}/check`}
                className="px-4 py-1.5 rounded-full bg-signal text-slate-950 font-semibold text-xs hover:brightness-110 transition-all"
              >
                Launch Console
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs font-sans">
              {/* Left Sidebar (Hermes Screenshot 3: Navigation list) */}
              <div className="lg:col-span-3 rounded-xl bg-[#060913] border border-white/[0.06] p-4 space-y-3 hidden sm:block">
                <div className="flex items-center gap-2 text-white font-heading font-semibold pb-2 border-b border-white/[0.06]">
                  <div className="w-6 h-6 rounded-lg bg-signal/20 text-signal flex items-center justify-center">
                    <Shield className="w-3.5 h-3.5" />
                  </div>
                  <span>Scam Shield</span>
                </div>
                <div className="space-y-1 font-mono text-[11px] text-slate-400">
                  <div className="p-2 rounded-lg bg-white/[0.06] text-white font-semibold">● Active Cases</div>
                  <div className="p-2 rounded-lg hover:bg-white/[0.03]">Agents (5)</div>
                  <div className="p-2 rounded-lg hover:bg-white/[0.03]">Sessions</div>
                  <div className="p-2 rounded-lg hover:bg-white/[0.03]">Tools & Forensics</div>
                  <div className="p-2 rounded-lg hover:bg-white/[0.03]">Knowledge Base</div>
                  <div className="p-2 rounded-lg hover:bg-white/[0.03]">Analytics</div>
                  <div className="p-2 rounded-lg hover:bg-white/[0.03]">Settings</div>
                </div>
              </div>

              {/* Center Thread (Hermes Screenshot 3: Agent chat with bubbles) */}
              <div className="lg:col-span-6 rounded-xl bg-[#060913] border border-white/[0.06] p-4 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-white/[0.06]">
                  <div className="w-6 h-6 rounded-full bg-signal/20 text-signal flex items-center justify-center font-bold text-[10px]">
                    SS
                  </div>
                  <div>
                    <div className="font-heading font-semibold text-white">Scam Shield Agent</div>
                    <div className="text-[10px] text-emerald-400 font-mono">● Online</div>
                  </div>
                </div>

                {/* User Message Bubble */}
                <div className="p-3 rounded-xl bg-[#141B2D] border border-white/[0.08] text-slate-200">
                  "Dear SBI User, your YONO account has been suspended due to pending KYC update. Click http://sbi-update-kyc.top"
                </div>

                {/* Agent Reply Bubble */}
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 space-y-2">
                  <div className="font-heading font-bold text-sm uppercase">VERDICT: SCAM (96% CONFIDENCE)</div>
                  <p className="text-xs text-slate-300">
                    The link sbi-update-kyc[.]top is a newly created lookalike domain registered in Russia 4 days ago. SBI never sends SMS from personal 10-digit mobile numbers.
                  </p>
                  <div className="pt-1 text-[11px] font-mono text-rose-400">
                    DO NOT: Tap link, enter OTP. | DO NEXT: Call SBI or 1930.
                  </div>
                </div>
              </div>

              {/* Right Sidebar (Hermes Screenshot 3: 3 stacked cards - Agents, Conversations, Tools Donut) */}
              <div className="lg:col-span-3 space-y-3">
                {/* Card 1: Agents */}
                <div className="p-3.5 rounded-xl bg-[#060913] border border-white/[0.06] space-y-2">
                  <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
                    <span>Agents Active</span>
                    <span className="text-white font-bold">5</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {["Ex", "PA", "EC", "Jg", "Ad"].map((initial, i) => (
                      <div key={i} className="w-6 h-6 rounded-full bg-signal/20 text-signal text-[9px] font-mono font-bold flex items-center justify-center border border-signal/40">
                        {initial}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card 2: Conversations */}
                <div className="p-3.5 rounded-xl bg-[#060913] border border-white/[0.06] space-y-1">
                  <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
                    <span>Verified Cases</span>
                    <span className="text-emerald-400 font-bold">+18%</span>
                  </div>
                  <div className="font-heading text-xl font-bold text-white">55 Tests</div>
                </div>

                {/* Card 3: Tools Donut Chart */}
                <div className="p-3.5 rounded-xl bg-[#060913] border border-white/[0.06] space-y-2">
                  <div className="text-slate-400 font-mono text-[11px]">Forensic Tools</div>
                  <EvidenceDonut
                    items={[
                      { label: "DNS/Domain", count: 42, color: "#38BDF8" },
                      { label: "Psychology", count: 28, color: "#3B82F6" },
                      { label: "UPI/Phone", count: 18, color: "#10B981" },
                      { label: "Other", count: 12, color: "#F59E0B" },
                    ]}
                    size={72}
                    strokeWidth={9}
                  />
                </div>
              </div>
            </div>

            {/* Bottom 4 Feature Icons (Hermes Screenshot 3 Bottom Strip) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/[0.06] text-center text-xs font-mono text-slate-400">
              <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">Analytics & Telemetry</div>
              <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">Agent Management</div>
              <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">Forensic Tools</div>
              <div className="p-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">Knowledge Base</div>
            </div>
          </div>
        </section>

        {/* =========================================================================
         * 6. ENTERPRISE-GRADE PROTECTION BENTO CARDS (SCREENSHOT 1 BOTTOM)
         * ========================================================================= */}
        <section id="security-stack" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 border-b border-white/[0.06]">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <div className="text-xs font-mono uppercase tracking-wider text-signal font-semibold">
              Security Stack
            </div>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white tracking-tight">
              Enterprise-Grade Protection for Everyone
            </h2>
            <p className="text-slate-400 text-sm">
              Every Scam Shield feature is designed to give you absolute control over your digital safety — no compromises, no exceptions.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Card 1: Air-Gapped Domain Forensics */}
            <div className="p-6 rounded-2xl bg-[#090E1D] border border-white/[0.08] hover:border-signal/40 transition-all flex flex-col justify-between space-y-4">
              <div className="w-9 h-9 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center">
                <Search className="w-5 h-5" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-heading font-bold text-base text-white">Air-Gapped Forensics</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  We inspect domain age, registrar WHOIS, and DNS records without ever downloading or opening the suspicious link.
                </p>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-[#060913] p-2 text-[11px] font-mono space-y-1">
                <div className="flex justify-between text-slate-400"><span>HTTP GET:</span><span className="text-emerald-400">Blocked ✓</span></div>
                <div className="flex justify-between text-slate-400"><span>DNS Lookup:</span><span className="text-emerald-400">Isolated ✓</span></div>
                <div className="flex justify-between text-slate-400"><span>Payload Risk:</span><span className="text-emerald-400">0% ✓</span></div>
              </div>
            </div>

            {/* Card 2: Strict No-Logs Policy */}
            <div className="p-6 rounded-2xl bg-[#090E1D] border border-white/[0.08] hover:border-signal/40 transition-all flex flex-col justify-between space-y-4">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <EyeOff className="w-5 h-5" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-heading font-bold text-base text-white">Strict No-Logs Policy</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  We never collect, store, or share your messages, screenshots, OTPs, or phone numbers. Zero persistence.
                </p>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-[#060913] p-2 text-[11px] font-mono space-y-1">
                <div className="flex justify-between text-slate-400"><span>Raw Message:</span><span className="text-emerald-400">Never ✓</span></div>
                <div className="flex justify-between text-slate-400"><span>Phone Numbers:</span><span className="text-emerald-400">Never ✓</span></div>
                <div className="flex justify-between text-slate-400"><span>Community:</span><span className="text-signal">Salted Hash ✓</span></div>
              </div>
            </div>

            {/* Card 3: Bayesian Consensus Protocol */}
            <div className="p-6 rounded-2xl bg-[#090E1D] border border-white/[0.08] hover:border-signal/40 transition-all flex flex-col justify-between space-y-4">
              <div className="w-9 h-9 rounded-xl bg-signal/15 border border-signal/30 text-signal flex items-center justify-center">
                <Cpu className="w-5 h-5" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-heading font-bold text-base text-white">Consensus Protocol</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Five AI specialists vote. When psychological wording and technical records disagree, technical risk always vetoes.
                </p>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-[#060913] p-2 text-[11px] font-mono space-y-1">
                <div className="flex justify-between text-slate-400"><span>Architecture:</span><span className="text-white">DAG Fusion ✓</span></div>
                <div className="flex justify-between text-slate-400"><span>Conflict Gate:</span><span className="text-emerald-400">Active ✓</span></div>
                <div className="flex justify-between text-slate-400"><span>Inference:</span><span className="text-signal">Gemini 2.5 ✓</span></div>
              </div>
            </div>

            {/* Card 4: Automatic Kill Switch / 1930 */}
            <div className="p-6 rounded-2xl bg-[#090E1D] border border-white/[0.08] hover:border-signal/40 transition-all flex flex-col justify-between space-y-4">
              <div className="w-9 h-9 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-heading font-bold text-base text-white">Emergency Kill Switch</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  If funds are compromised, one tap connects you directly to the 1930 Cyber Financial Fraud helpline.
                </p>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-[#060913] p-2 text-[11px] font-mono space-y-1">
                <div className="flex justify-between text-slate-400"><span>Toll Free:</span><span className="text-white">1930 (24x7)</span></div>
                <div className="flex justify-between text-slate-400"><span>Portal:</span><span className="text-signal">cybercrime.gov.in</span></div>
                <div className="flex justify-between text-slate-400"><span>Response:</span><span className="text-emerald-400">Immediate ✓</span></div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
         * 7. NATIONAL HELPLINE FINAL CTA
         * ========================================================================= */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-4xl sm:text-5xl font-heading font-bold text-white tracking-tight">
            Got a Message That Feels Off?
          </h2>
          <p className="text-slate-400 text-base max-w-lg mx-auto">
            Check it before you click. Five AI agents will inspect the words, the links, and the sender, then tell you what to do next.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              type="button"
              onClick={() => handleLaunchCheck()}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white text-slate-950 font-bold text-sm hover:bg-slate-200 transition-all shadow-xl group cursor-pointer"
            >
              <span>Check This Message</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <a
              href="tel:1930"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white/[0.06] border border-white/[0.1] hover:bg-white/[0.1] text-white font-semibold text-sm transition-all"
            >
              <PhoneCall className="w-4 h-4 text-rose-400" />
              <span>Dial 1930 Helpline</span>
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
