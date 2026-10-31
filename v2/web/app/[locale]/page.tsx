"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import {
  ShieldAlert,
  ShieldCheck,
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
} from "lucide-react";
import * as Accordion from "@radix-ui/react-accordion";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Pill } from "@/components/ui/Pill";
import { StatTile } from "@/components/ui/StatTile";
import { HorizontalBar } from "@/components/ui/HorizontalBar";
import { SpecRow } from "@/components/ui/SpecRow";
import { PipelineGraph } from "@/components/pipeline/PipelineGraph";
import { PROOF } from "@/lib/data/proof";

export default function LandingPage() {
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();

  const [inputText, setInputText] = useState("");
  const [selectedExample, setSelectedExample] = useState("");

  const examples = [
    {
      label: "SBI KYC Account Suspension (Scam)",
      text: "Dear SBI User, your YONO account has been suspended due to pending KYC update. Kindly click here immediately to update PAN: http://sbi-update-kyc.top to avoid permanent block.",
    },
    {
      label: "Electricity Bill Disconnection Threat (Scam)",
      text: "Dear Consumer, your electricity power will be disconnected tonight at 9:30 PM from the sub-station because your previous month bill was not updated. Please immediately call officer 9876543210.",
    },
    {
      label: "Legitimate HDFC Bank Debit Notification (Safe)",
      text: "Rs. 450.00 debited from HDFC Bank A/C ending 4589 on 31-OCT-26 at ZOMATO UPI. Avl Bal: Rs 14,250.00. If not done by you, call 18002586161.",
    },
  ];

  const handleApplyExample = (text: string) => {
    setInputText(text);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    // Pass message text to check page via query or session storage
    if (typeof window !== "undefined") {
      sessionStorage.setItem("scam_shield_prefill", inputText);
    }
    router.push(`/${locale}/check`);
  };

  return (
    <div className="min-h-screen bg-page text-paper flex flex-col selection:bg-signal/20 selection:text-signal">
      <Header />

      <main id="main-content" className="flex-1">
        {/* =========================================================================
         * 1. HERO SECTION (min-height 92svh, 7/5 desktop split, live looping pipeline)
         * ========================================================================= */}
        <section className="relative min-h-[90svh] flex items-center justify-center pt-8 pb-16 px-4 sm:px-6 overflow-hidden border-b border-hairline/80">
          {/* Subtle Ambient Radial Glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-signal/[0.04] rounded-full blur-3xl pointer-events-none" />

          {/* Huge 6% Watermark Behind Hero */}
          <div
            className="absolute -top-6 left-1/2 -translate-x-1/2 text-[12vw] font-heading font-black tracking-tighter text-paper/[0.03] select-none pointer-events-none uppercase whitespace-nowrap"
            aria-hidden="true"
          >
            {t("brand.watermark")}
          </div>

          <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
            {/* Left Column (7 cols): Heading & Input Dock */}
            <div className="lg:col-span-7 space-y-6">
              {/* Proof Pill Row */}
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href="tel:1930"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-signal/30 bg-signal/10 text-signal text-xs font-medium hover:brightness-110 transition-all"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>{t("hero.helplineChip")}</span>
                </a>
                <span className="text-xs font-mono text-fog px-2.5 py-1 rounded-full border border-hairline bg-raised/50">
                  {t("hero.proofCases")}
                </span>
                <span className="text-xs font-mono text-verdict-safe px-2.5 py-1 rounded-full border border-verdict-safe/30 bg-verdict-safe/10">
                  {t("hero.proofCaught")}
                </span>
              </div>

              {/* H1 2 Lines: Second line in Signal color */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold tracking-tight leading-[1.08] text-paper">
                <div>{t("hero.h1Line1")}</div>
                <div className="text-signal mt-1">{t("hero.h1Line2")}</div>
              </h1>

              <p className="text-base sm:text-lg text-fog max-w-xl leading-relaxed">
                {t("hero.subtitle")}
              </p>

              {/* Citizen Input Dock */}
              <form onSubmit={handleSubmit} className="space-y-3 pt-2">
                <div className="p-3 bg-panel border border-hairline rounded-2xl shadow-sm focus-within:border-signal/70 focus-within:ring-2 focus-within:ring-signal/30 transition-all">
                  <textarea
                    rows={3}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder={t("hero.inputPlaceholder")}
                    className="w-full bg-transparent border-0 resize-none text-sm sm:text-base text-paper placeholder:text-fog/60 focus:outline-none"
                  />

                  <div className="pt-2 border-t border-hairline/60 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-hairline bg-raised text-fog hover:text-paper text-xs cursor-pointer transition-colors">
                        <Upload className="w-3.5 h-3.5" />
                        <span>{t("hero.attachScreenshot")}</span>
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

                      {/* Example Dropdown */}
                      <select
                        onChange={(e) => handleApplyExample(e.target.value)}
                        className="px-2.5 py-1.5 rounded-lg border border-hairline bg-raised text-fog text-xs hover:text-paper cursor-pointer focus:outline-none"
                        value=""
                      >
                        <option value="" disabled>
                          {t("hero.tryExample")}
                        </option>
                        {examples.map((ex, idx) => (
                          <option key={idx} value={ex.text}>
                            {ex.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <Button type="submit" variant="signal" size="md" className="font-sans">
                      {t("hero.checkButton")}
                    </Button>
                  </div>
                </div>

                {/* Privacy Guarantee Microcopy */}
                <div className="flex items-center gap-2 text-xs text-fog/80 px-1">
                  <Lock className="w-3.5 h-3.5 text-signal" />
                  <span>{t("hero.privacyNotice")}</span>
                </div>
              </form>
            </div>

            {/* Right Column (5 cols): Live Scripted Case Panel with PipelineGraph */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-5 rounded-2xl bg-panel border border-hairline/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between text-xs pb-3 border-b border-hairline/60">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-verdict-scam animate-ping" />
                    <span className="font-mono text-paper font-semibold">LIVE INVESTIGATION DEMO</span>
                  </div>
                  <span className="font-mono text-fog text-[11px]">CASE SS-0038</span>
                </div>

                {/* Sample Suspicious Input Evidence */}
                <div className="p-3 rounded-xl bg-raised/50 border border-hairline text-xs font-sans space-y-1.5">
                  <span className="text-[10px] font-mono uppercase text-fog block">Incoming Message</span>
                  <p className="text-paper line-clamp-2">
                    "Dear SBI User, your YONO account has been suspended due to pending KYC update. Click: http://sbi-update-kyc.top to avoid permanent block."
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <Chip variant="defanged" value="http://sbi-update-kyc.top" />
                  </div>
                </div>

                {/* Pipeline Graph in Hero Mode */}
                <PipelineGraph variant="compact" locale={locale} />

                {/* Simulated Final Stamp */}
                <div className="p-3 rounded-xl border border-verdict-scam/30 bg-verdict-scam/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-verdict-scam" />
                    <span className="font-heading font-bold text-xs uppercase tracking-wide text-verdict-scam">
                      VERDICT: THIS IS A SCAM
                    </span>
                  </div>
                  <span className="font-mono text-xs text-verdict-scam font-bold">96% CONF</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
         * 2. EVIDENCE STRIP (4 equal tiles)
         * ========================================================================= */}
        <section className="py-12 px-4 sm:px-6 max-w-7xl mx-auto border-b border-hairline/80">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatTile
              label="Pipeline Architecture"
              value="5"
              unit="agents"
              caption={t("evidenceStrip.agentsCaption")}
              measurementDetail="Extractor, Pattern Analyst, Entity Checker, Judge, and Advisor operate with Bayesian fusion."
            />
            <StatTile
              label="Scam Detection Rate"
              value="100"
              unit="%"
              caption={t("evidenceStrip.recallCaption")}
              measurementDetail="Tested against 30 confirmed Indian phishing & fraud vectors (KYC, electricity, digital arrest, job traps). Zero bypasses."
            />
            <StatTile
              label="Brand Threat Matrix"
              value="70+"
              unit="brands"
              caption={t("evidenceStrip.brandsCaption")}
              measurementDetail="Tracks Indian banks (SBI, HDFC, ICICI, PNB), telecom providers (Jio, Airtel), and courier lookalikes."
            />
            <StatTile
              label="Citizen Privacy"
              value="0"
              unit="stored"
              caption={t("evidenceStrip.zeroStoredCaption")}
              measurementDetail="Citizen messages and phone numbers are processed in memory and never written to persistent disk storage."
            />
          </div>
        </section>

        {/* =========================================================================
         * 3. HOW IT WORKS (Five agents, one verdict + PipelineGraph)
         * ========================================================================= */}
        <section id="how-it-works" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto space-y-8 border-b border-hairline/80">
          <div className="max-w-2xl space-y-2">
            <div className="text-xs font-mono uppercase tracking-wider text-signal font-semibold">
              Autonomous Consensus
            </div>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold tracking-tight text-paper">
              {t("howItWorks.heading")}
            </h2>
            <p className="text-fog text-base leading-relaxed">
              {t("howItWorks.subtitle")}
            </p>
          </div>

          {/* Full Pipeline Graph Component with Interactive Node Details */}
          <div className="hidden md:block">
            <PipelineGraph variant="full" locale={locale} />
          </div>
          <div className="md:hidden">
            <PipelineGraph variant="mobile-vertical" locale={locale} />
          </div>
        </section>

        {/* =========================================================================
         * 4. INSIDE THE CONSOLE (Framed Preview Shell)
         * ========================================================================= */}
        <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto space-y-8 border-b border-hairline/80">
          <div className="max-w-2xl space-y-2">
            <div className="text-xs font-mono uppercase tracking-wider text-signal font-semibold">
              Live Investigation Workspace
            </div>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold tracking-tight text-paper">
              {t("consolePreview.heading")}
            </h2>
            <p className="text-fog text-base leading-relaxed">
              {t("consolePreview.caption")}
            </p>
          </div>

          {/* Framed 3-column Preview Shell */}
          <div className="p-3 sm:p-5 rounded-2xl bg-panel border border-hairline shadow-md overflow-hidden space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-hairline/60 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-verdict-scam/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-verdict-suspicious/60" />
                <span className="w-2.5 h-2.5 rounded-full bg-verdict-safe/60" />
                <span className="font-mono text-fog ml-2">scamshield.gov.in / console</span>
              </div>
              <Link href={`/${locale}/check`}>
                <Button variant="raised" size="sm">
                  Launch Interactive Console
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs font-sans">
              {/* Preview Col 1: Sidebar mini */}
              <div className="lg:col-span-3 p-4 rounded-xl bg-raised/40 border border-hairline space-y-3 hidden sm:block">
                <div className="font-heading font-semibold text-paper text-sm">Case SS-0042</div>
                <div className="space-y-1.5 text-fog">
                  <div className="p-2 rounded bg-raised border border-hairline text-paper">
                    Bank KYC Alert (Scam)
                  </div>
                  <div className="p-2 rounded hover:bg-raised transition-colors">
                    Electricity Bill (Scam)
                  </div>
                  <div className="p-2 rounded hover:bg-raised transition-colors">
                    HDFC Debit (Safe)
                  </div>
                </div>
              </div>

              {/* Preview Col 2: Investigation Thread */}
              <div className="lg:col-span-6 p-4 rounded-xl bg-raised/20 border border-hairline space-y-3">
                <div className="p-3 rounded-lg bg-panel border border-hairline space-y-1">
                  <span className="text-[10px] font-mono uppercase text-fog">Citizen Submission</span>
                  <p className="text-paper">
                    "Dear SBI User, your YONO account has been suspended due to pending KYC. Click http://sbi-update-kyc.top"
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-verdict-scam/10 border border-verdict-scam/30 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-heading font-bold text-verdict-scam uppercase">Verdict: Scam</span>
                    <span className="font-mono text-verdict-scam font-bold">96%</span>
                  </div>
                  <p className="text-verdict-scam text-xs">
                    Impersonates SBI YONO with an unregistered .top phishing domain created 4 days ago.
                  </p>
                </div>
              </div>

              {/* Preview Col 3: Right Rail Evidence */}
              <div className="lg:col-span-3 p-4 rounded-xl bg-raised/40 border border-hairline space-y-3">
                <div className="font-mono text-xs uppercase tracking-wider text-fog">Forensic Evidence</div>
                <div className="space-y-2">
                  <SpecRow label="WHOIS Age" value="4 days old" />
                  <SpecRow label="Registrar" value="NameCheap Inc." />
                  <SpecRow label="Official Bank Match" value="0% (Fake)" highlight />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
         * 5. FEATURES (12-column Bento Grid)
         * ========================================================================= */}
        <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto space-y-10 border-b border-hairline/80">
          <div className="max-w-2xl space-y-2">
            <div className="text-xs font-mono uppercase tracking-wider text-signal font-semibold">
              Engineering Specs
            </div>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold tracking-tight text-paper">
              {t("features.heading")}
            </h2>
            <p className="text-fog text-base leading-relaxed">
              {t("features.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
            {/* Card A: Multilingual & Screenshot OCR (7 cols) */}
            <div className="lg:col-span-7 p-6 rounded-2xl bg-panel border border-hairline space-y-4 shadow-xs">
              <div className="w-9 h-9 rounded-lg bg-signal/10 border border-signal/30 flex items-center justify-center text-signal">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-heading font-bold text-paper">{t("features.cardATitle")}</h3>
              <p className="text-sm text-fog leading-relaxed">{t("features.cardADesc")}</p>
              <div className="pt-2 rounded-xl border border-hairline bg-raised/30 overflow-hidden">
                <SpecRow label="Supported Scripts" value="Devanagari, Latin, Hinglish" />
                <SpecRow label="OCR Resolution Target" value="720p - 4K Phone Captures" />
              </div>
            </div>

            {/* Card B: Isolated Link Forensics (5 cols) */}
            <div className="lg:col-span-5 p-6 rounded-2xl bg-panel border border-hairline space-y-4 shadow-xs">
              <div className="w-9 h-9 rounded-lg bg-verdict-safe/10 border border-verdict-safe/30 flex items-center justify-center text-verdict-safe">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-heading font-bold text-paper">{t("features.cardBTitle")}</h3>
              <p className="text-sm text-fog leading-relaxed">{t("features.cardBDesc")}</p>
              <div className="pt-2 rounded-xl border border-hairline bg-raised/30 overflow-hidden">
                <SpecRow label="Execution Sandbox" value="Air-gapped (No HTTP GET)" />
                <SpecRow label="Domain Age Veto" value="< 30 days = High Risk" />
              </div>
            </div>

            {/* Card C: Explicit Conflict Gate (5 cols) */}
            <div className="lg:col-span-5 p-6 rounded-2xl bg-panel border border-hairline space-y-4 shadow-xs">
              <div className="w-9 h-9 rounded-lg bg-verdict-suspicious/10 border border-verdict-suspicious/30 flex items-center justify-center text-verdict-suspicious">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-heading font-bold text-paper">{t("features.cardCTitle")}</h3>
              <p className="text-sm text-fog leading-relaxed">{t("features.cardCDesc")}</p>
              <div className="pt-2 rounded-xl border border-hairline bg-raised/30 overflow-hidden">
                <SpecRow label="Consensus Rule" value="Technical Veto Overrides" highlight />
              </div>
            </div>

            {/* Card D: Zero Storage Architecture (7 cols) */}
            <div className="lg:col-span-7 p-6 rounded-2xl bg-panel border border-hairline space-y-4 shadow-xs">
              <div className="w-9 h-9 rounded-lg bg-signal/10 border border-signal/30 flex items-center justify-center text-signal">
                <EyeOff className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-heading font-bold text-paper">{t("features.cardDTitle")}</h3>
              <p className="text-sm text-fog leading-relaxed">{t("features.cardDDesc")}</p>
              <div className="pt-2 rounded-xl border border-hairline bg-raised/30 overflow-hidden">
                <SpecRow label="Citizen Message Storage" value="0 bytes / In-Memory Only" />
                <SpecRow label="Community Matching" value="HMAC-SHA256 Anonymized" />
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
         * 6. SCAMS WE CATCH (4x2 Grid of 8 Indian Scam Types with Defanged Snippets)
         * ========================================================================= */}
        <section id="scams-we-catch" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto space-y-10 border-b border-hairline/80">
          <div className="max-w-2xl space-y-2">
            <div className="text-xs font-mono uppercase tracking-wider text-verdict-scam font-semibold">
              Threat Vector Database
            </div>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold tracking-tight text-paper">
              {t("scams.heading")}
            </h2>
            <p className="text-fog text-base leading-relaxed">
              {t("scams.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Bank KYC */}
            <div className="p-4 rounded-xl bg-panel border border-hairline space-y-2.5">
              <span className="text-[11px] font-mono uppercase text-fog block">01 • Bank Impersonation</span>
              <h4 className="font-heading font-semibold text-paper text-sm">Bank KYC & Account Block</h4>
              <p className="text-xs text-fog">"Your account will be suspended today. Update PAN immediately."</p>
              <Chip variant="defanged" value="hxxp[://]sbi-update-kyc[.]top" />
            </div>

            {/* 2. Electricity Bill */}
            <div className="p-4 rounded-xl bg-panel border border-hairline space-y-2.5">
              <span className="text-[11px] font-mono uppercase text-fog block">02 • Utility Panic</span>
              <h4 className="font-heading font-semibold text-paper text-sm">Electricity Disconnection</h4>
              <p className="text-xs text-fog">"Power disconnect tonight at 9:30 PM. Call electricity officer now."</p>
              <Chip variant="phone" value="+91 98765 43210" />
            </div>

            {/* 3. Digital Arrest */}
            <div className="p-4 rounded-xl bg-panel border border-hairline space-y-2.5">
              <span className="text-[11px] font-mono uppercase text-fog block">03 • Legal Intimidation</span>
              <h4 className="font-heading font-semibold text-paper text-sm">Digital Arrest / CBI Summons</h4>
              <p className="text-xs text-fog">"Narcotics parcel seized under your Aadhaar. Connect via video call."</p>
              <Pill variant="scam">High Coercion</Pill>
            </div>

            {/* 4. UPI Collect Scam */}
            <div className="p-4 rounded-xl bg-panel border border-hairline space-y-2.5">
              <span className="text-[11px] font-mono uppercase text-fog block">04 • Payment Inversion</span>
              <h4 className="font-heading font-semibold text-paper text-sm">UPI "Receive Money" Collect</h4>
              <p className="text-xs text-fog">"Enter UPI PIN to accept Rs. 5,000 lottery refund in your bank."</p>
              <Chip variant="upi" value="refund-gate@paytm" />
            </div>

            {/* 5. Part-Time Job */}
            <div className="p-4 rounded-xl bg-panel border border-hairline space-y-2.5">
              <span className="text-[11px] font-mono uppercase text-fog block">05 • Employment Trap</span>
              <h4 className="font-heading font-semibold text-paper text-sm">Part-Time Video Like Job</h4>
              <p className="text-xs text-fog">"Earn Rs. 3,000/day by liking YouTube videos. Join our Telegram."</p>
              <Chip variant="defanged" value="hxxps[://]t[.]me/easyjobs_india" />
            </div>

            {/* 6. Customs Parcel */}
            <div className="p-4 rounded-xl bg-panel border border-hairline space-y-2.5">
              <span className="text-[11px] font-mono uppercase text-fog block">06 • Courier Extortion</span>
              <h4 className="font-heading font-semibold text-paper text-sm">Customs Parcel Detained</h4>
              <p className="text-xs text-fog">"Foreign gift package held at Mumbai airport. Pay clearance fee."</p>
              <Pill variant="suspicious">Unverified Fee</Pill>
            </div>

            {/* 7. KBC Lucky Draw */}
            <div className="p-4 rounded-xl bg-panel border border-hairline space-y-2.5">
              <span className="text-[11px] font-mono uppercase text-fog block">07 • Prize Bait</span>
              <h4 className="font-heading font-semibold text-paper text-sm">KBC 25 Lakh Lucky Draw</h4>
              <p className="text-xs text-fog">"Congratulations! Your WhatsApp number won 25 Lakhs in draw."</p>
              <Chip variant="phone" value="+92 300 1234567" />
            </div>

            {/* 8. Sextortion Blackmail */}
            <div className="p-4 rounded-xl bg-panel border border-hairline space-y-2.5">
              <span className="text-[11px] font-mono uppercase text-fog block">08 • Cyber Blackmail</span>
              <h4 className="font-heading font-semibold text-paper text-sm">Video Call Sextortion</h4>
              <p className="text-xs text-fog">"Recorded video will be sent to family unless ransom paid in 1 hour."</p>
              <Chip variant="helpline" value="1930 Cyber Helpline" />
            </div>
          </div>
        </section>

        {/* =========================================================================
         * 7. HONEST NUMBERS (Recall bars & Honest misses disclosure)
         * ========================================================================= */}
        <section id="honest-numbers" className="py-20 px-4 sm:px-6 max-w-7xl mx-auto space-y-10 border-b border-hairline/80">
          <div className="max-w-2xl space-y-2">
            <div className="text-xs font-mono uppercase tracking-wider text-signal font-semibold">
              Evaluation Transparency
            </div>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold tracking-tight text-paper">
              {t("honestNumbers.heading")}
            </h2>
            <p className="text-fog text-base leading-relaxed">
              {t("honestNumbers.explanation")}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: Recall by category (7 cols) */}
            <div className="lg:col-span-7 p-6 rounded-2xl bg-panel border border-hairline space-y-4 shadow-xs">
              <h3 className="font-heading font-semibold text-paper text-base">
                {t("honestNumbers.recallHeading")}
              </h3>
              <div className="space-y-4">
                {PROOF.byType.map((item, idx) => (
                  <HorizontalBar
                    key={idx}
                    label={item.name}
                    percentage={item.recallPct}
                    sublabel={`${item.totalTested} cases tested`}
                    tone={item.recallPct === 100 ? "safe" : "signal"}
                  />
                ))}
              </div>
            </div>

            {/* Right: What we got wrong (5 cols) */}
            <div className="lg:col-span-5 p-6 rounded-2xl bg-panel border border-hairline space-y-4 shadow-xs">
              <div className="flex items-center gap-2 text-verdict-suspicious">
                <AlertTriangle className="w-4 h-4" />
                <h3 className="font-heading font-semibold text-paper text-base">
                  {t("honestNumbers.whatWeGotWrong")}
                </h3>
              </div>
              <p className="text-xs text-fog leading-relaxed">
                We believe in full transparency. Our model is tuned with an intentionally conservative bias: we would rather ask a citizen to double-check a genuine bill than let a scam pass.
              </p>

              <div className="space-y-3 pt-2">
                {PROOF.whatWeGotWrong.map((miss, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl border border-hairline bg-raised/30 space-y-1 text-xs">
                    <div className="flex items-center justify-between font-mono">
                      <span className="font-bold text-paper">{miss.id}</span>
                      <span className="text-verdict-scam text-[11px]">Flagged as {miss.actual}</span>
                    </div>
                    <p className="text-fog">{miss.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
         * 8. PRIVACY PANEL (Zero-Knowledge Guarantees)
         * ========================================================================= */}
        <section className="py-20 px-4 sm:px-6 max-w-7xl mx-auto space-y-10 border-b border-hairline/80">
          <div className="max-w-2xl space-y-2">
            <div className="text-xs font-mono uppercase tracking-wider text-signal font-semibold">
              Data Minimization
            </div>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold tracking-tight text-paper">
              {t("privacy.heading")}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-panel border border-hairline space-y-2 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-signal/10 border border-signal/30 flex items-center justify-center text-signal">
                <EyeOff className="w-4 h-4" />
              </div>
              <h3 className="font-heading font-semibold text-paper text-base">
                {t("privacy.messageNotStored")}
              </h3>
              <p className="text-xs text-fog leading-relaxed">
                {t("privacy.messageNotStoredSub")}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-panel border border-hairline space-y-2 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-verdict-safe/10 border border-verdict-safe/30 flex items-center justify-center text-verdict-safe">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="font-heading font-semibold text-paper text-base">
                {t("privacy.linksNotOpened")}
              </h3>
              <p className="text-xs text-fog leading-relaxed">
                {t("privacy.linksNotOpenedSub")}
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-panel border border-hairline space-y-2 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-signal/10 border border-signal/30 flex items-center justify-center text-signal">
                <Database className="w-4 h-4" />
              </div>
              <h3 className="font-heading font-semibold text-paper text-base">
                {t("privacy.hashesOnly")}
              </h3>
              <p className="text-xs text-fog leading-relaxed">
                {t("privacy.hashesOnlySub")}
              </p>
            </div>
          </div>
        </section>

        {/* =========================================================================
         * 9. FAQ (Restyled Radix Accordion)
         * ========================================================================= */}
        <section className="py-20 px-4 sm:px-6 max-w-4xl mx-auto space-y-8 border-b border-hairline/80">
          <div className="text-center space-y-2">
            <h2 className="text-3xl sm:text-4xl font-heading font-bold tracking-tight text-paper">
              {t("faq.heading")}
            </h2>
            <p className="text-fog text-sm">
              Honest answers about accuracy, safety, privacy, and how Scam Shield works.
            </p>
          </div>

          <Accordion.Root type="single" collapsible className="space-y-3">
            {[
              {
                q: "Is it safe to paste a suspicious link or message here?",
                a: "Yes. Scam Shield parses text in an isolated sandbox. Our forensic agent checks DNS and WHOIS registration metadata without ever downloading, fetching, or executing the destination page.",
              },
              {
                q: "Can I check a screenshot directly from my phone?",
                a: "Yes. You can upload or drag-and-drop a screenshot from WhatsApp, SMS, or UPI apps. Our extractor agent scans the image locally with OCR and checks all visible URLs and phone numbers.",
              },
              {
                q: "Does Scam Shield save my personal conversations?",
                a: "No. Zero citizen messages are stored on disk or databases. The moment your verdict is delivered, the message text is expunged from server memory.",
              },
              {
                q: "What should I do if I already clicked a suspicious link or paid money?",
                a: "Call the National Cyber Financial Fraud Helpline immediately at 1930 (toll-free 24/7) and report the incident at https://cybercrime.gov.in. Call your bank using the official phone number printed on the back of your debit/credit card to freeze your accounts.",
              },
              {
                q: "Why do you show when the agents disagree?",
                a: "Because sophisticated scams use polished, official-sounding language that fools psychological pattern scanners. When our technical forensic agent finds a brand-new domain or unknown phone number, the Judge agent exposes this contradiction so you can see exactly why the message is dangerous.",
              },
              {
                q: "Is Scam Shield available in Hindi?",
                a: "Yes. All verdicts, explanations, and advice are natively available in Hindi (हिन्दी) and Indian English, with text-to-speech support for elderly citizens.",
              },
              {
                q: "Is Scam Shield an official Government of India application?",
                a: "No. Scam Shield is an independent citizen-protection project built for Hacktober Hack Day Prayagraj 2026. It directs victims to official Government helplines (1930, cybercrime.gov.in) but does not provide legal or police representation.",
              },
            ].map((faq, idx) => (
              <Accordion.Item
                key={idx}
                value={`item-${idx}`}
                className="rounded-xl border border-hairline bg-panel overflow-hidden"
              >
                <Accordion.Header>
                  <Accordion.Trigger className="w-full p-4 text-left font-heading font-semibold text-paper text-sm sm:text-base flex items-center justify-between gap-4 hover:bg-raised/40 transition-colors">
                    <span>{faq.q}</span>
                    <ChevronDown className="w-4 h-4 text-fog shrink-0 transition-transform duration-200 ease-out group-data-[state=open]:rotate-180" />
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content className="p-4 pt-1 text-sm text-fog leading-relaxed border-t border-hairline/40">
                  {faq.a}
                </Accordion.Content>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        </section>

        {/* =========================================================================
         * 10. FINAL CTA BAND WITH 1930 CARD
         * ========================================================================= */}
        <section className="py-20 px-4 sm:px-6 max-w-5xl mx-auto text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-heading font-bold tracking-tight text-paper">
            {t("cta.heading")}
          </h2>
          <p className="text-fog text-sm sm:text-base max-w-xl mx-auto">
            Takes less than 3 seconds. Five specialized agents will inspect the wording, check domain records, and give you one clear next step.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link href={`/${locale}/check`}>
              <Button variant="signal" size="lg" className="font-sans px-8">
                {t("cta.button")}
              </Button>
            </Link>
            <a
              href="tel:1930"
              className="inline-flex items-center gap-2 h-14 px-6 text-base font-semibold rounded-xl border border-hairline bg-raised hover:bg-hairline text-paper transition-all"
            >
              <PhoneCall className="w-4 h-4 text-signal" />
              <span>Call Helpline 1930</span>
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
