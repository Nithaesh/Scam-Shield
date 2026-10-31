"use client";

import React from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { StatTile } from "@/components/ui/StatTile";
import { SpecRow } from "@/components/ui/SpecRow";
import { PROOF } from "@/lib/data/proof";
import {
  ShieldCheck,
  Lock,
  Award,
  ExternalLink,
  PhoneCall,
  CheckCircle2,
  FileText,
} from "lucide-react";

export default function AboutPage() {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <div className="min-h-screen bg-page text-paper flex flex-col selection:bg-signal/20 selection:text-signal">
      <Header />

      <main id="main-content" className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-16">
        <div className="space-y-4 max-w-2xl">
          <div className="text-xs font-mono uppercase tracking-wider text-signal font-semibold">
            About The Project
          </div>
          <h1 className="text-4xl sm:text-5xl font-heading font-bold tracking-tight text-paper">
            Built for Citizen Trust
          </h1>
          <p className="text-fog text-base sm:text-lg leading-relaxed">
            Scam Shield was created with a clear civic principle: Indian citizens—especially elderly and non-technical mobile users—deserve plain-language, panic-free digital protection that never compromises their privacy.
          </p>
        </div>

        {/* Verification Stats */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatTile
            label="Benchmark Set"
            value="55"
            unit="messages"
            caption="Real-world Indian fraud, genuine notifications & adversarial tests."
          />
          <StatTile
            label="Scam Recall"
            value="100"
            unit="%"
            caption="Zero missed scam messages on verified evaluation."
          />
          <StatTile
            label="Precision"
            value="91.7"
            unit="%"
            caption="Conservative flagging with clear explanations."
          />
          <StatTile
            label="Disk Storage"
            value="0"
            unit="bytes"
            caption="Citizen text is never persisted or logged."
          />
        </section>

        {/* Core Principles */}
        <section className="space-y-6">
          <h2 className="text-2xl font-heading font-bold text-paper">Our Non-Negotiable Guarantees</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-panel border border-hairline space-y-3 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-verdict-safe/10 border border-verdict-safe/30 flex items-center justify-center text-verdict-safe">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h3 className="font-heading font-semibold text-paper text-base">Never Clicks Links</h3>
              <p className="text-xs text-fog leading-relaxed">
                We inspect DNS registries, WHOIS records, and TLS certificate metadata in an air-gapped sandbox. Scam Shield never downloads or triggers malicious payloads.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-panel border border-hairline space-y-3 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-signal/10 border border-signal/30 flex items-center justify-center text-signal">
                <Lock className="w-4 h-4" />
              </div>
              <h3 className="font-heading font-semibold text-paper text-base">No Data Retention</h3>
              <p className="text-xs text-fog leading-relaxed">
                Messages, bank transaction alerts, and phone screenshots are processed in memory and immediately discarded. We do not maintain citizen message databases.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-panel border border-hairline space-y-3 shadow-xs">
              <div className="w-8 h-8 rounded-lg bg-signal/10 border border-signal/30 flex items-center justify-center text-signal">
                <PhoneCall className="w-4 h-4" />
              </div>
              <h3 className="font-heading font-semibold text-paper text-base">Direct National Routing</h3>
              <p className="text-xs text-fog leading-relaxed">
                When monetary fraud occurs, we direct users immediately to the official National Cyber Financial Fraud Helpline (1930) and cybercrime.gov.in.
              </p>
            </div>
          </div>
        </section>

        {/* Hackathon Specs */}
        <section className="p-6 rounded-2xl bg-panel border border-hairline space-y-4">
          <h2 className="text-xl font-heading font-bold text-paper">Hackathon Project Information</h2>
          <div className="rounded-xl border border-hairline bg-raised/30 overflow-hidden text-xs">
            <SpecRow label="Event" value="Hacktober Hack Day Prayagraj 2026" />
            <SpecRow label="Layer Version" value="Scam Shield v2.0 (FastAPI + Next.js)" />
            <SpecRow label="Architecture" value="5 Autonomous Multi-Agent DAG with Bayesian Fusion" />
            <SpecRow label="Languages" value="Hindi (हिन्दी) & Indian English" />
            <SpecRow label="Design System" value="WCAG AA Compliant Minimalist Interface" />
          </div>
        </section>

        {/* Action */}
        <div className="p-8 rounded-2xl bg-panel border border-hairline text-center space-y-4">
          <h3 className="text-2xl font-heading font-bold text-paper">Protect Yourself and Your Family</h3>
          <p className="text-sm text-fog max-w-lg mx-auto">
            Got an SMS, WhatsApp forward, or UPI collect request that feels suspicious? Check it right now.
          </p>
          <Link href={`/${locale}/check`}>
            <Button variant="signal" size="lg" className="font-sans px-8">
              Open Investigation Console
            </Button>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
