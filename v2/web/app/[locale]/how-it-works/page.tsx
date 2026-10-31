"use client";

import React from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { PipelineGraph } from "@/components/pipeline/PipelineGraph";
import { PIPELINE_NODES } from "@/lib/pipeline/graph";
import { SpecRow } from "@/components/ui/SpecRow";
import {
  ShieldCheck,
  BrainCircuit,
  Search,
  Scale,
  LifeBuoy,
  PhoneCall,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export default function HowItWorksPage() {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <div className="min-h-screen bg-page text-paper flex flex-col selection:bg-signal/20 selection:text-signal">
      <Header />

      <main id="main-content" className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-16">
        {/* Intro */}
        <div className="space-y-4 max-w-2xl">
          <div className="text-xs font-mono uppercase tracking-wider text-signal font-semibold">
            Technical Architecture
          </div>
          <h1 className="text-4xl sm:text-5xl font-heading font-bold tracking-tight text-paper">
            How Scam Shield Works
          </h1>
          <p className="text-fog text-base sm:text-lg leading-relaxed">
            Most fraud detectors rely on a single AI prompt or basic keyword filters. Scam Shield deploys five specialized agents in a directed acyclic graph (DAG) with an explicit conflict resolution gate.
          </p>
        </div>

        {/* Live Topology */}
        <section className="space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-fog">
            <span>PIPELINE CONSENSUS TOPOLOGY</span>
            <span>CLICK ANY NODE TO INSPECT TOOLS & PROMPTS</span>
          </div>
          <div className="hidden md:block">
            <PipelineGraph variant="full" locale={locale} />
          </div>
          <div className="md:hidden">
            <PipelineGraph variant="mobile-vertical" locale={locale} />
          </div>
        </section>

        {/* Agent In-Depth Breakdown */}
        <section className="space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-heading font-bold text-paper">The Five Specialist Agents</h2>
            <p className="text-fog text-sm">
              Each agent has an isolated task, tailored prompt constraints, and specialized verification tools.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {PIPELINE_NODES.slice(1, 6).map((node) => (
              <div
                key={node.id}
                className="p-6 rounded-2xl bg-panel border border-hairline space-y-4 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="font-heading font-bold text-lg text-paper">
                      {locale === "hi" ? node.nameHi : node.name}
                    </span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-raised border border-hairline text-signal">
                      {node.stageKey}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-fog leading-relaxed">{node.description}</p>

                <div className="space-y-2 pt-2 border-t border-hairline/60">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-fog block">
                    Assigned Tools
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {node.tools.map((tool, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 rounded bg-raised border border-hairline font-mono text-[11px] text-paper"
                      >
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Consensus & Conflict Resolution Explanation */}
        <section className="p-8 rounded-2xl bg-panel border border-hairline space-y-6">
          <div className="flex items-center gap-3 text-verdict-suspicious">
            <Scale className="w-6 h-6" />
            <h2 className="text-2xl font-heading font-bold text-paper">
              The Judge & Conflict Resolution Gate
            </h2>
          </div>
          <p className="text-sm text-fog leading-relaxed">
            Sophisticated fraudsters often craft polite, well-punctuated messages without overt urgency, tricking standard linguistic classifiers into scoring them as "Safe". However, when our Entity Checker examines the link's WHOIS age and discovers it was registered 3 days ago in another country, an evidence conflict occurs.
          </p>

          <div className="p-4 rounded-xl bg-raised/40 border border-hairline space-y-2 text-xs">
            <span className="font-mono text-[11px] font-semibold text-signal uppercase tracking-wider block">
              Consensus Invariant Rule:
            </span>
            <p className="text-paper italic">
              "Technical forensic risk always vetoes linguistic innocence. If a domain or phone number is newly registered or lookalike, the Judge overrides polite wording and rules it a Scam."
            </p>
          </div>
        </section>

        {/* CTA */}
        <div className="p-8 rounded-2xl bg-panel border border-hairline text-center space-y-4">
          <h3 className="text-2xl font-heading font-bold text-paper">Test a Message in Real Time</h3>
          <p className="text-sm text-fog max-w-lg mx-auto">
            Try our 5-agent investigation pipeline with your own message or one of our benchmark cases.
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
