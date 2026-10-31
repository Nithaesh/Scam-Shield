"use client";

import React, { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import {
  ShieldCheck,
  AlertTriangle,
  ShieldAlert,
  Sun,
  Moon,
  Search,
  CheckCircle2,
  Database,
  Layers,
  Cpu,
  FileCheck,
  PhoneCall,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { IconTile } from "@/components/ui/IconTile";
import { Chip } from "@/components/ui/Chip";
import { Pill } from "@/components/ui/Pill";
import { StatTile } from "@/components/ui/StatTile";
import { SpecRow } from "@/components/ui/SpecRow";
import { HorizontalBar } from "@/components/ui/HorizontalBar";
import { ConfidenceRing } from "@/components/ui/ConfidenceRing";
import { EvidenceDonut } from "@/components/ui/EvidenceDonut";

export default function DevTokensPage() {
  const t = useTranslations();
  const locale = useLocale();
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    if (theme === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const otherLocale = locale === "en" ? "hi" : "en";

  return (
    <main id="main-content" className="max-w-5xl mx-auto px-6 py-12 space-y-12">
      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 bg-panel border border-hairline rounded-2xl shadow-xs">
        <div>
          <h1 className="text-2xl font-bold font-heading text-paper">
            Scam Shield Primitive & Token Showcase
          </h1>
          <p className="text-sm text-fog mt-1">
            Phase B Gate: Verifying restyled buttons, squircle icon tiles, defanged chips, stat tiles, spec rows, confidence rings, and donut metrics.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href={`/${otherLocale}/dev`}
            className="px-3.5 py-1.5 rounded-lg border border-hairline bg-raised text-paper text-sm hover:border-signal transition"
          >
            Switch to {otherLocale === "hi" ? "हिन्दी" : "English"}
          </Link>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-hairline bg-raised text-paper hover:border-signal transition flex items-center space-x-2 text-sm"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-signal" /> : <Moon className="w-4 h-4 text-signal" />}
            <span className="capitalize">{theme}</span>
          </button>
        </div>
      </div>

      {/* Primitive Showcase: Buttons */}
      <section className="p-6 bg-panel border border-hairline rounded-2xl space-y-4">
        <h2 className="text-lg font-heading font-semibold text-paper">Button Scale & Variants (No Arrows Rule)</h2>
        <div className="flex flex-wrap items-center gap-4">
          <Button variant="signal" size="lg" leftIcon={<ShieldAlert className="w-4 h-4" />}>
            Check this message
          </Button>
          <Button variant="raised" size="md">
            Secondary Action
          </Button>
          <Button variant="outline" size="md">
            Outline Action
          </Button>
          <Button variant="ghost" size="sm">
            Ghost Action
          </Button>
          <Button variant="danger" size="md">
            Block & Report
          </Button>
          <Button variant="signal" size="md" isLoading>
            Analysing...
          </Button>
        </div>
      </section>

      {/* Primitive Showcase: Icon Tiles & Chips */}
      <section className="p-6 bg-panel border border-hairline rounded-2xl space-y-6">
        <h2 className="text-lg font-heading font-semibold text-paper">Squircle IconTiles & Defanged Chips</h2>
        <div className="flex flex-wrap items-center gap-4">
          <IconTile icon={<Cpu />} tone="signal" size="lg" />
          <IconTile icon={<CheckCircle2 />} tone="safe" size="md" />
          <IconTile icon={<AlertTriangle />} tone="suspicious" size="md" />
          <IconTile icon={<ShieldAlert />} tone="scam" size="md" />
          <IconTile icon={<Database />} tone="default" size="sm" />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Chip variant="defanged" value="https://sbi-kyc-update.xyz/login" copyable />
          <Chip variant="phone" value="+91 98765 43210" copyable />
          <Chip variant="upi" value="refund-hdfc@paytm" copyable />
          <Chip variant="helpline" value="1930 Cybercrime Helpline" />
          <Pill variant="signal" dot>Live Pipeline</Pill>
          <Pill variant="safe">Verdict: Safe</Pill>
          <Pill variant="suspicious">Verdict: Suspicious</Pill>
          <Pill variant="scam">Verdict: Scam</Pill>
        </div>
      </section>

      {/* Primitive Showcase: Stats & Confidence Rings */}
      <section className="space-y-4">
        <h2 className="text-lg font-heading font-semibold text-paper">Metrics, StatTiles & Confidence Rings</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <StatTile
            label="Recall on Scams"
            value="100"
            unit="%"
            caption="Zero missed scam messages on benchmark set."
            measurementDetail="Tested against 30 confirmed Indian phishing & fraud vectors including electricity bills, KYC, and digital arrest."
          />
          <StatTile
            label="Active Agents"
            value="5"
            unit="piped"
            caption="Extractor, Analyst, Checker, Judge, Advisor."
            measurementDetail="Sequential multi-agent pipeline with deterministic consensus enforcement."
          />
          <StatTile
            label="Zero Storage"
            value="0"
            unit="logs"
            caption="Input messages never saved to disk or database."
            measurementDetail="Memory-only processing ensures citizens' confidential personal messages are never retained."
          />
          <StatTile
            label="Precision"
            value="91.7"
            unit="%"
            caption="Conservative flagging with clear explanations."
            measurementDetail="False positive rate capped at 6.25% on benign transactional notifications."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-6 bg-panel border border-hairline rounded-2xl items-center">
          <div className="flex items-center gap-4">
            <ConfidenceRing score={98} verdict="scam" />
            <div>
              <div className="font-heading font-semibold text-paper text-sm">Scam Verdict</div>
              <div className="text-xs text-fog">98% model confidence</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ConfidenceRing score={65} verdict="suspicious" />
            <div>
              <div className="font-heading font-semibold text-paper text-sm">Suspicious Verdict</div>
              <div className="text-xs text-fog">65% confidence check</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <ConfidenceRing score={94} verdict="safe" />
            <div>
              <div className="font-heading font-semibold text-paper text-sm">Safe Verdict</div>
              <div className="text-xs text-fog">94% verified authentic</div>
            </div>
          </div>
        </div>
      </section>

      {/* Primitive Showcase: SpecRows & Donut Chart */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-panel border border-hairline rounded-2xl space-y-4">
          <h2 className="text-lg font-heading font-semibold text-paper">Technical Spec Rows</h2>
          <div className="rounded-xl border border-hairline overflow-hidden bg-raised/30">
            <SpecRow label="Architecture" value="Multi-Agent DAG" />
            <SpecRow label="Inference Engine" value="Gemini Flash 2.5" />
            <SpecRow label="Consensus Mode" value="Judge + Conflict Gate" highlight />
            <SpecRow label="Privacy Boundary" value="Ephemeral / No Disk Write" />
            <SpecRow label="Response Format" value="SSE Stream (EventSource)" />
          </div>
        </div>

        <div className="p-6 bg-panel border border-hairline rounded-2xl space-y-4">
          <h2 className="text-lg font-heading font-semibold text-paper">Evidence & Tools Donut</h2>
          <EvidenceDonut
            items={[
              { label: "Domain & WHOIS", count: 18, color: "#F26522" },
              { label: "UPI & Banking Check", count: 12, color: "#3B82F6" },
              { label: "Phone Lookup", count: 9, color: "#10B981" },
              { label: "Community Intel", count: 5, color: "#F59E0B" },
            ]}
          />
        </div>
      </section>

      {/* Primitive Showcase: Honest Numbers Horizontal Bars */}
      <section className="p-6 bg-panel border border-hairline rounded-2xl space-y-4">
        <h2 className="text-lg font-heading font-semibold text-paper">Scam Detection Recall by Category</h2>
        <div className="space-y-3">
          <HorizontalBar label="Bank KYC & Account Block" percentage={100} sublabel="12/12 tested" tone="safe" />
          <HorizontalBar label="Electricity Bill Disconnection Threat" percentage={100} sublabel="8/8 tested" tone="safe" />
          <HorizontalBar label="Digital Arrest & Law Enforcement Impersonation" percentage={100} sublabel="7/7 tested" tone="safe" />
          <HorizontalBar label="UPI Collect Request & QR Scam" percentage={100} sublabel="8/8 tested" tone="safe" />
          <HorizontalBar label="Work-From-Home & Fake Job Offers" percentage={87.5} sublabel="7/8 tested" tone="signal" />
        </div>
      </section>
    </main>
  );
}
