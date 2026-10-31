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
  BrainCircuit,
  Scale,
} from "lucide-react";
import * as Accordion from "@radix-ui/react-accordion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PipelineGraph } from "@/components/pipeline/PipelineGraph";
import { EvidenceDonut } from "@/components/ui/EvidenceDonut";

export default function LandingPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();
  const isHi = locale === "hi";

  const [inputText, setInputText] = useState("");

  const handleLaunchCheck = (sampleText?: string) => {
    const defaultText = isHi
      ? "प्रिय एसबीआई ग्राहक, केवाईसी अपडेट न होने के कारण आपका YONO खाता निलंबित कर दिया गया है। तुरंत http://sbi-update-kyc.top पर क्लिक करें।"
      : "Dear SBI User, your YONO account has been suspended due to pending KYC update. Click http://sbi-update-kyc.top";
    const textToPass = sampleText || inputText || defaultText;
    if (typeof window !== "undefined") {
      sessionStorage.setItem("scam_shield_prefill", textToPass);
    }
    router.push(`/${locale}/check`);
  };

  return (
    <div className="min-h-screen bg-[#050811] text-[#F1F5F9] selection:bg-signal/20 selection:text-signal relative overflow-x-hidden font-sans">
      <Header />

      <main id="main-content">
        {/* =========================================================================
         * 1. HERO SECTION (CYBERSAFE HIGH FIDELITY WITH ANIMATIONS)
         * ========================================================================= */}
        <section className="relative min-h-[92svh] flex flex-col justify-center pt-8 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-white/[0.06]">
          {/* Subtle Ambient Radial Lighting with Floating Pulse */}
          <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[550px] bg-blue-600/[0.08] rounded-full blur-[140px] pointer-events-none animate-pulse duration-1000" />
          <div className="absolute top-1/3 right-1/4 w-[500px] h-[400px] bg-signal/[0.06] rounded-full blur-[120px] pointer-events-none" />

          {/* Huge Faint Watermark Background */}
          <div
            className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[15vw] font-heading font-black tracking-tighter text-white/[0.02] select-none pointer-events-none uppercase whitespace-nowrap"
            aria-hidden="true"
          >
            {isHi ? "स्कैम शील्ड" : "SCAM SHIELD"}
          </div>

          <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10 py-6">
            {/* Left Column: Hero Copy & Actions */}
            <div className="lg:col-span-7 space-y-6">
              {/* Top Pill Status Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-slate-300">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                </span>
                <span>
                  {isHi ? "नेटवर्क स्थिति: " : "Network Status: "}
                  <span className="text-emerald-400 font-semibold">{isHi ? "सुरक्षित" : "SECURE"}</span>
                </span>
                <span className="text-white/[0.2]">|</span>
                <span className="text-slate-400">{isHi ? "सभी खतरे रोके गए" : "ALL THREATS BLOCKED"}</span>
              </div>

              {/* Headline */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-heading font-bold tracking-tight text-white leading-[1.05]">
                {isHi ? (
                  <>
                    आपकी सुरक्षा, <br />
                    <span className="text-slate-300 font-normal">आपका नियंत्रण</span>
                  </>
                ) : (
                  <>
                    Your Safety, <br />
                    <span className="text-slate-300 font-normal">Your Control</span>
                  </>
                )}
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-slate-400 max-w-xl leading-relaxed">
                {isHi
                  ? "सैन्य-स्तरीय मल्टी-एजेंट साइबर जांच। शून्य डेटा स्टोरेज नीति। 70+ भारतीय बैंक, बिजली विभाग और कानून प्रवर्तन संस्थाओं की नकल की पहचान।"
                  : "Military-grade multi-agent forensic verification. Zero-logs policy. 70+ Indian bank, utility, and law enforcement lookalikes tracked across 120 verification nodes."}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  href={`/${locale}#pipeline`}
                  className="px-6 py-3 rounded-full bg-white/[0.06] border border-white/[0.1] hover:bg-white/[0.1] text-white font-medium text-sm transition-all shadow-sm"
                >
                  {isHi ? "यह कैसे काम करता है" : "How It Works"}
                </Link>

                <button
                  type="button"
                  onClick={() => handleLaunchCheck()}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-slate-950 font-semibold text-sm hover:bg-slate-200 transition-all shadow-lg group cursor-pointer"
                >
                  <span>{isHi ? "नि:शुल्क जांच शुरू करें" : "Start Inspection — Free"}</span>
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
                    placeholder={
                      isHi
                        ? "संदिग्ध SMS, व्हाट्सएप संदेश या UPI लिंक यहाँ डालें..."
                        : "Paste suspicious SMS, WhatsApp message, or UPI link..."
                    }
                    className="w-full bg-transparent text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleLaunchCheck()}
                    className="px-4 py-2 rounded-xl bg-signal text-slate-950 font-semibold text-xs shrink-0 hover:brightness-110 transition-all"
                  >
                    {isHi ? "जांचें" : "Check"}
                  </button>
                </div>

                {/* Quick Presets Under Bar */}
                <div className="flex items-center gap-2 pt-2 text-[11px] font-mono text-slate-400">
                  <span className="text-slate-500">{isHi ? "त्वरित उदाहरण:" : "Try:"}</span>
                  <button
                    type="button"
                    onClick={() => handleLaunchCheck(isHi ? "एसबीआई YONO खाता निलंबित। तुरंत http://sbi-update-kyc.top पर क्लिक करें" : "SBI YONO Account Blocked. Click http://sbi-update-kyc.top")}
                    className="hover:text-signal transition-colors underline decoration-dotted"
                  >
                    SBI KYC
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => handleLaunchCheck(isHi ? "आज रात 9:30 बजे बिजली काट दी जाएगी। कॉल करें 9876543210" : "Electricity disconnect tonight 9:30 PM. Call 9876543210")}
                    className="hover:text-signal transition-colors underline decoration-dotted"
                  >
                    Power Cut
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => handleLaunchCheck(isHi ? "सीबीआई डिजिटल अरेस्ट वारंट जारी।" : "CBI Digital Arrest warrant issued.")}
                    className="hover:text-signal transition-colors underline decoration-dotted"
                  >
                    CBI Warrant
                  </button>
                </div>
              </div>

              {/* Institutional Trust Logos */}
              <div className="pt-6 space-y-2 border-t border-white/[0.06] max-w-xl">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">
                  {isHi ? "राष्ट्रीय सत्यापन मानक" : "Institutional Verification Standards"}
                </span>
                <div className="flex items-center gap-6 text-xs font-mono text-slate-400">
                  <span className="hover:text-white transition-colors">NATIONAL 1930</span>
                  <span className="hover:text-white transition-colors">CYBERCRIME.GOV.IN</span>
                  <span className="hover:text-white transition-colors">NPCI UPI GATEWAY</span>
                  <span className="hover:text-white transition-colors">TRAI DND</span>
                </div>
              </div>
            </div>

            {/* Right Column: Floating Cyber-Card Visual */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="w-full max-w-md rounded-2xl bg-[#0A0F1E]/95 border border-white/[0.12] p-5 shadow-2xl backdrop-blur-xl space-y-5 relative">
                {/* Window Header */}
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="font-mono text-slate-400 text-[11px]">
                    {isHi ? "स्कैम शील्ड — सेंटिनल सक्रिय" : "Scam Shield — Sentinel Active"}
                  </span>
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
                    ● {isHi ? "5 एआई एजेंट ऑनलाइन" : "5 AGENTS ONLINE"}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Node: <span className="text-signal">National AI Sandbox (Prayagraj-01)</span>
                  </div>
                </div>

                {/* 2x2 Forensic Metrics Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1">
                    <div className="text-[10px] text-slate-400 uppercase">
                      {isHi ? "नागरिक पहचान" : "CITIZEN IDENTITY"}
                    </div>
                    <div className="text-white font-bold">{isHi ? "शून्य डेटा सुरक्षित ✓" : "Hashed & Salted ✓"}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1">
                    <div className="text-[10px] text-slate-400 uppercase">
                      {isHi ? "डिस्क स्टोरेज" : "DISK LOGS"}
                    </div>
                    <div className="text-emerald-400 font-bold">{isHi ? "0 बाइट्स सेव ✓" : "0 Bytes Retained ✓"}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1">
                    <div className="text-[10px] text-slate-400 uppercase">
                      {isHi ? "लिंक फॉरेंसिक्स" : "LINK FORENSICS"}
                    </div>
                    <div className="text-signal font-bold">{isHi ? "सुरक्षित DNS ✓" : "Air-Gapped DNS ✓"}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1">
                    <div className="text-[10px] text-slate-400 uppercase">
                      {isHi ? "आम सहमति गेट" : "CONSENSUS GATE"}
                    </div>
                    <div className="text-white font-bold">{isHi ? "वीटो मोड सक्रिय ✓" : "Veto Mode Active ✓"}</div>
                  </div>
                </div>

                {/* Bottom Pill Badge in Card */}
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs text-emerald-400">
                  <span className="font-mono">{isHi ? "राष्ट्रीय हेल्पलाइन संबद्ध" : "National Helpline Linked"}</span>
                  <span className="font-bold font-mono">Dial 1930</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
         * 2. METRICS ROW
         * ========================================================================= */}
        <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-b border-white/[0.06]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-6 rounded-2xl bg-[#090E1D] border border-white/[0.08] hover:border-signal/40 transition-all flex flex-col justify-between space-y-4">
              <div className="w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-400 flex items-center justify-center">
                <Server className="w-4 h-4" />
              </div>
              <div>
                <div className="font-heading text-4xl font-bold text-white tracking-tight">120+</div>
                <div className="text-xs text-slate-400 font-mono mt-1">
                  {isHi ? "परीक्षित सत्यापन नोड्स" : "Verification Nodes Tested"}
                </div>
              </div>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] text-slate-300 w-fit">
                DAG PIPELINE
              </span>
            </div>

            <div className="p-6 rounded-2xl bg-[#090E1D] border border-white/[0.08] hover:border-signal/40 transition-all flex flex-col justify-between space-y-4">
              <div className="w-8 h-8 rounded-lg bg-signal/15 border border-signal/30 text-signal flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="font-heading text-4xl font-bold text-white tracking-tight">100%</div>
                <div className="text-xs text-slate-400 font-mono mt-1">
                  {isHi ? "बेंचमार्क पर पकड़ दर" : "Scam Recall on Benchmark"}
                </div>
              </div>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-signal/10 border border-signal/30 text-signal w-fit">
                ZERO FALSE NEGATIVES
              </span>
            </div>

            <div className="p-6 rounded-2xl bg-[#090E1D] border border-white/[0.08] hover:border-signal/40 transition-all flex flex-col justify-between space-y-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <div className="font-heading text-4xl font-bold text-white tracking-tight">0 Bytes</div>
                <div className="text-xs text-slate-400 font-mono mt-1">
                  {isHi ? "डेटा लॉग स्टोर किया गया" : "Disk Retention Policy"}
                </div>
              </div>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 w-fit">
                EPHEMERAL RAM
              </span>
            </div>

            <div className="p-6 rounded-2xl bg-[#090E1D] border border-white/[0.08] hover:border-signal/40 transition-all flex flex-col justify-between space-y-4">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <div className="font-heading text-4xl font-bold text-white tracking-tight">99.98%</div>
                <div className="text-xs text-slate-400 font-mono mt-1">
                  {isHi ? "आम सहमति उपलब्धता एसएलए" : "Consensus Availability SLA"}
                </div>
              </div>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.06] text-slate-300 w-fit">
                24X7 CITIZEN SHIELD
              </span>
            </div>
          </div>
        </section>

        {/* =========================================================================
         * 3. REAL-TIME RADAR & THREAT MAP WITH ANIMATED SCAN BEAM
         * ========================================================================= */}
        <section id="threat-map" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 border-b border-white/[0.06]">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <div className="text-xs font-mono uppercase tracking-wider text-signal font-semibold">
              {isHi ? "राष्ट्रीय निगरानी ग्रिड" : "National Infrastructure"}
            </div>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white tracking-tight">
              {isHi ? "वास्तविक समय साइबर निगरानी" : "Real-Time Forensic Surveillance"}
            </h2>
            <p className="text-slate-400 text-sm">
              {isHi
                ? "सभी 28 भारतीय राज्यों में उच्च जोखिम वाले डोमेन, फर्जी बैंक पोर्टल और फिशिंग की स्वचालित निगरानी।"
                : "Continuous inspection of high-risk domains, fake banking portals, and impersonation scripts across all 28 Indian states."}
            </p>
          </div>

          <div className="p-6 sm:p-8 rounded-2xl bg-[#090E1D] border border-white/[0.08] shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Animated Radar Graphic */}
            <div className="lg:col-span-7 rounded-xl bg-[#060913] border border-white/[0.06] p-6 relative overflow-hidden h-[340px] flex items-center justify-center">
              {/* Matrix Grid */}
              <div
                className="absolute inset-0 opacity-[0.08]"
                style={{
                  backgroundImage: "radial-gradient(circle, #38BDF8 1.5px, transparent 1.5px)",
                  backgroundSize: "24px 24px",
                }}
              />

              {/* Animated Rotating Radar Sweep */}
              <div className="absolute w-[300px] h-[300px] rounded-full border border-signal/20 flex items-center justify-center pointer-events-none">
                <div className="w-[200px] h-[200px] rounded-full border border-signal/15" />
                <div className="w-[100px] h-[100px] rounded-full border border-signal/10" />
                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-signal/10 via-transparent to-transparent animate-[spin_6s_linear_infinite]" />
              </div>

              {/* Glowing Active Radar Blips across Indian hubs */}
              <div className="relative w-full h-full">
                {/* Node: Delhi */}
                <div className="absolute top-[35%] left-[38%] flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping absolute" />
                  <span className="w-3 h-3 rounded-full bg-emerald-400 relative" />
                  <span className="text-[10px] font-mono text-slate-300 bg-[#090E1D] px-2 py-0.5 rounded-full border border-white/[0.1] shadow-md">
                    DELHI • Active
                  </span>
                </div>

                {/* Node: Mumbai */}
                <div className="absolute top-[58%] left-[28%] flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-signal animate-ping absolute" />
                  <span className="w-3 h-3 rounded-full bg-signal relative" />
                  <span className="text-[10px] font-mono text-slate-300 bg-[#090E1D] px-2 py-0.5 rounded-full border border-white/[0.1] shadow-md">
                    MUMBAI • 18ms
                  </span>
                </div>

                {/* Node: Prayagraj / UP */}
                <div className="absolute top-[42%] left-[52%] flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-signal animate-ping absolute" />
                  <span className="w-3 h-3 rounded-full bg-signal relative" />
                  <span className="text-[10px] font-mono text-slate-300 bg-[#090E1D] px-2 py-0.5 rounded-full border border-white/[0.1] shadow-md">
                    PRAYAGRAJ • Hub
                  </span>
                </div>

                {/* Node: Bengaluru */}
                <div className="absolute top-[75%] left-[40%] flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping absolute" />
                  <span className="w-3 h-3 rounded-full bg-emerald-400 relative" />
                  <span className="text-[10px] font-mono text-slate-300 bg-[#090E1D] px-2 py-0.5 rounded-full border border-white/[0.1] shadow-md">
                    BENGALURU • Active
                  </span>
                </div>
              </div>
            </div>

            {/* Forensics Engines Status List */}
            <div className="lg:col-span-5 space-y-4">
              <div className="font-mono text-xs uppercase tracking-wider text-slate-400 font-semibold">
                {isHi ? "फॉरेंसिक इंजन स्थिति" : "Top Performing Forensics Engines"}
              </div>
              <div className="space-y-2.5">
                {[
                  { name: isHi ? "डोमेन आयु व WHOIS पंजीयक" : "Domain Age & Registrar WHOIS", latency: "14ms", status: isHi ? "सक्रिय" : "Active" },
                  { name: isHi ? "एनपीसीआई यूपीआई वीपीए सत्यापन" : "NPCI UPI Gateway VPA Validator", latency: "18ms", status: isHi ? "सक्रिय" : "Active" },
                  { name: isHi ? "ट्राई टेलीमार्केटर डीएनडी फ़िल्टर" : "TRAI Telemarketer DND Filter", latency: "22ms", status: isHi ? "सक्रिय" : "Active" },
                  { name: isHi ? "बहुभाषी विज़न ओसीआर इंजन" : "Multilingual OCR Vision Engine", latency: "42ms", status: isHi ? "सक्रिय" : "Active" },
                  { name: isHi ? "बेयसियन आम सहमति वीटो जज" : "Bayesian Consensus Veto Judge", latency: "11ms", status: isHi ? "सक्रिय" : "Active" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#060913] border border-white/[0.06] flex items-center justify-between text-xs font-mono hover:border-signal/30 transition-colors"
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
         * 4. LIVE MULTI-AGENT DAG PIPELINE (WITH REAL REAL-TIME EXECUTION)
         * ========================================================================= */}
        <section id="pipeline" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 border-b border-white/[0.06]">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="text-xs font-mono uppercase tracking-wider text-signal font-semibold">
                {isHi ? "स्वायत्त आम सहमति पाइपलाइन" : "Autonomous Consensus Pipeline"}
              </div>
              <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white tracking-tight">
                {isHi ? "लाइव मल्टी-एजेंट फॉरेंसिक आर्किटेक्चर" : "Live Multi-Agent Forensic Architecture"}
              </h2>
              <p className="text-slate-400 text-sm max-w-2xl">
                {isHi
                  ? "कच्चे नागरिक संदेशों को इनजेस्ट करता है, लिंक व फोन निकालता है, और एयर-गैप्ड बेयसियन आम सहमति वीटो गेट के माध्यम से समानांतर जांच करता है।"
                  : "Ingests raw citizen evidence, extracts defanged entities, and executes parallel forensic investigations through an air-gapped Bayesian consensus veto gate."}
              </p>
            </div>

            <Link
              href={`/${locale}/check`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-signal text-slate-950 font-bold text-xs font-mono hover:brightness-110 transition-all shrink-0 shadow-lg"
            >
              <span>{isHi ? "लाइव फॉरेंसिक स्टूडियो खोलें" : "Launch Live Forensic Studio"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <PipelineGraph variant="full" locale={locale} />
        </section>

        {/* =========================================================================
         * 5. ENTERPRISE-GRADE PROTECTION BENTO CARDS
         * ========================================================================= */}
        <section id="security-stack" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 border-b border-white/[0.06]">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <div className="text-xs font-mono uppercase tracking-wider text-signal font-semibold">
              {isHi ? "सुरक्षा ढांचा" : "Security Stack"}
            </div>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold text-white tracking-tight">
              {isHi ? "सभी के लिए एंटरप्राइज-ग्रेड सुरक्षा" : "Enterprise-Grade Protection for Everyone"}
            </h2>
            <p className="text-slate-400 text-sm">
              {isHi
                ? "सामान्य नागरिकों के लिए सरल, शक्तिशाली सुरक्षा तकनीक।"
                : "Democratizing state-of-the-art fraud intelligence with civilian privacy protections."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-2xl bg-[#090E1D] border border-white/[0.08] hover:border-signal/40 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-signal/15 text-signal flex items-center justify-center">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-base text-white">
                {isHi ? "एयर-गैप्ड डीएनएस" : "Air-Gapped DNS"}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                {isHi
                  ? "संदिग्ध लिंक को कभी भी ब्राउज़र में नहीं खोला जाता। केवल एन्क्रिप्टेड डीएनएस व डब्लूएचओआईएस रिकॉर्ड जाँचे जाते हैं।"
                  : "Links are never loaded in a browser. Only encrypted DNS and registrar age queries are executed."}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#090E1D] border border-white/[0.08] hover:border-signal/40 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-base text-white">
                {isHi ? "मनोवैज्ञानिक दबाव जांच" : "Psychology Matrix"}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                {isHi
                  ? "आतंक पैदा करने वाले शब्द ('आज रात बिजली कटेगी', 'अरेस्ट वारंट') और फर्जी डेडलाइन का तुरंत पता लगाना।"
                  : "Detects false countdowns, panic-inducing threats, and impersonation of authority figures."}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#090E1D] border border-white/[0.08] hover:border-signal/40 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
                <Scale className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-base text-white">
                {isHi ? "बेयसियन वीटो गेट" : "Consensus Veto"}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                {isHi
                  ? "यदि किसी नए डोमेन में तकनीकी खतरा है, तो संदेश की मीठी भाषा को खारिज कर तुरंत फ्रॉड घोषित किया जाता है।"
                  : "Technical threat overrides polite language. Newly registered lookalike domains trigger an invariant veto."}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#090E1D] border border-white/[0.08] hover:border-signal/40 transition-all space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
                <PhoneCall className="w-5 h-5" />
              </div>
              <h3 className="font-heading font-bold text-base text-white">
                {isHi ? "1930 सहायता सीधे जुड़ी" : "1930 Helpline"}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                {isHi
                  ? "गृह मंत्रालय की राष्ट्रीय साइबर अपराध हेल्पलाइन 1930 और cybercrime.gov.in के लिए तैयार प्रारूप।"
                  : "One-click connection to National Cybercrime Helpline 1930 with pre-formatted evidence reports."}
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================================
         * 6. FAQ ACCORDION (BILINGUAL)
         * ========================================================================= */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-heading font-bold text-white tracking-tight">
              {isHi ? "अक्सर पूछे जाने वाले प्रश्न" : "Frequently Asked Questions"}
            </h2>
          </div>

          <Accordion.Root type="single" collapsible className="space-y-3">
            {[
              {
                q: isHi ? "क्या स्कैम शील्ड मेरे निजी संदेशों को सहेजता है?" : "Does Scam Shield save my private messages?",
                a: isHi
                  ? "नहीं। सभी संदेश और स्क्रीनशॉट केवल अस्थायी मेमोरी (RAM) में जाँचे जाते हैं और फ़ैसला आने के बाद तुरंत नष्ट कर दिए जाते हैं। हमारे डेटाबेस में 0 बाइट्स स्टोर होता है।"
                  : "No. All raw messages and screenshots are evaluated strictly in ephemeral RAM and discarded upon verdict generation. Zero bytes are written to persistent disk.",
              },
              {
                q: isHi ? "क्या संदिग्ध लिंक पर क्लिक किया जाता है?" : "Does Scam Shield click the suspicious link?",
                a: isHi
                  ? "कभी नहीं। हम एयर-गैप्ड डीएनएस और डब्लूएचओआईएस उम्र की जांच करते हैं ताकि कोई मैलवेयर कभी भी डाउनलोड न हो सके।"
                  : "Never. We use air-gapped DNS inspection, WHOIS registration queries, and bank allowlists without ever executing HTTP payloads or downloading destination malware.",
              },
              {
                q: isHi ? "यदि मेरे पैसे कट गए हैं तो मुझे क्या करना चाहिए?" : "What should I do if my money has already been debited?",
                a: isHi
                  ? "बिना देर किए तुरंत राष्ट्रीय साइबर अपराध हेल्पलाइन 1930 पर कॉल करें। गोल्डन ऑवर में पुलिस संदिग्ध खाते को फ्रीज कर सकती है।"
                  : "Immediately call the National Cybercrime Helpline 1930. During the golden hour, authorities can freeze fraudulent recipient accounts before cash-out.",
              },
            ].map((faq, idx) => (
              <Accordion.Item
                key={idx}
                value={`item-${idx}`}
                className="rounded-xl border border-white/[0.08] bg-[#090E1D] overflow-hidden"
              >
                <Accordion.Header>
                  <Accordion.Trigger className="w-full p-4 text-left font-heading font-semibold text-sm text-white flex items-center justify-between hover:text-signal transition-colors">
                    <span>{faq.q}</span>
                    <ChevronDown className="w-4 h-4 text-slate-400 transition-transform duration-200 ease-out" />
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content className="px-4 pb-4 text-xs text-slate-400 leading-relaxed font-sans border-t border-white/[0.04] pt-2">
                  {faq.a}
                </Accordion.Content>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        </section>
      </main>

      <Footer />
    </div>
  );
}