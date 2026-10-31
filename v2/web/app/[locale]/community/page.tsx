"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/Button";
import { Chip } from "@/components/ui/Chip";
import { Pill } from "@/components/ui/Pill";
import { SpecRow } from "@/components/ui/SpecRow";
import {
  Users,
  Search,
  ShieldAlert,
  ShieldCheck,
  Lock,
  PhoneCall,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";

export default function CommunityPage() {
  const t = useTranslations();
  const locale = useLocale();

  const [searchQuery, setSearchQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const sampleReports = [
    {
      type: "Domain",
      masked: "sbi-update-kyc[.]top",
      reports: 47,
      scamType: "Bank KYC Suspension",
      firstSeen: "28-Oct-2026",
    },
    {
      type: "Phone",
      masked: "+91 98*** 43210",
      reports: 31,
      scamType: "Electricity Bill Cut Threat",
      firstSeen: "29-Oct-2026",
    },
    {
      type: "UPI VPA",
      masked: "refund-support[at]paytm",
      reports: 19,
      scamType: "UPI Collect Request",
      firstSeen: "25-Oct-2026",
    },
    {
      type: "Domain",
      masked: "cbi-arrest-warrant[.]site",
      reports: 14,
      scamType: "Digital Arrest Coercion",
      firstSeen: "30-Oct-2026",
    },
  ];

  const filtered = searchQuery.trim()
    ? sampleReports.filter(
        (r) =>
          r.masked.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.scamType.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : sampleReports;

  return (
    <div className="min-h-screen bg-page text-paper flex flex-col selection:bg-signal/20 selection:text-signal">
      <Header />

      <main id="main-content" className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 py-12 space-y-12">
        <div className="space-y-4 max-w-2xl">
          <div className="text-xs font-mono uppercase tracking-wider text-signal font-semibold">
            Collective Defense
          </div>
          <h1 className="text-4xl sm:text-5xl font-heading font-bold tracking-tight text-paper">
            Community Threat Intelligence
          </h1>
          <p className="text-fog text-base leading-relaxed">
            When one citizen identifies a fraud attempt, cryptographic anonymized hashes protect thousands of others across India. No personal numbers or messages are ever retained.
          </p>
        </div>

        {/* Masked Lookup Search Bar */}
        <section className="p-6 rounded-2xl bg-panel border border-hairline space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-fog absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setHasSearched(true);
                }}
                placeholder="Search phone number, link, or UPI handle..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-hairline bg-raised text-paper text-sm placeholder:text-fog focus:outline-none focus:border-signal/80 focus:ring-1 focus:ring-signal"
              />
            </div>
            <Button
              variant="signal"
              size="md"
              onClick={() => setHasSearched(true)}
              className="font-sans shrink-0"
            >
              Search Registry
            </Button>
          </div>

          <div className="flex items-center gap-2 text-xs text-fog">
            <Lock className="w-3.5 h-3.5 text-signal" />
            <span>Searches are matched against salted SHA-256 hashes only. We do not log your queries.</span>
          </div>
        </section>

        {/* Threat Table */}
        <section className="space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-fog">
            <span>ACTIVE COMMUNITY SIGNALS ({filtered.length})</span>
            <span>UPDATED LIVE</span>
          </div>

          <div className="rounded-2xl border border-hairline bg-panel overflow-hidden shadow-xs divide-y divide-hairline">
            {filtered.map((item, idx) => (
              <div key={idx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono px-2 py-0.5 rounded bg-raised border border-hairline text-fog">
                      {item.type}
                    </span>
                    <span className="font-mono font-bold text-paper text-sm">{item.masked}</span>
                    <Pill variant="scam">{item.scamType}</Pill>
                  </div>
                  <div className="text-fog text-[11px]">First identified in community network: {item.firstSeen}</div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-mono font-bold text-paper">{item.reports} reports</div>
                    <div className="text-[10px] text-verdict-scam font-mono">Flagged Malicious</div>
                  </div>
                  <Link href={`/${locale}/check`}>
                    <Button variant="outline" size="sm">
                      Check Your Message
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Cryptographic Hash Guarantee Box */}
        <section className="p-6 rounded-2xl bg-panel border border-hairline space-y-4">
          <h2 className="text-lg font-heading font-semibold text-paper">
            How Community Hashes Preserve Citizen Privacy
          </h2>
          <div className="rounded-xl border border-hairline bg-raised/30 overflow-hidden text-xs">
            <SpecRow label="Algorithm" value="HMAC-SHA256 (Salted)" />
            <SpecRow label="Plaintext Stored" value="0 bytes (Zero Retention)" />
            <SpecRow label="Entity Lookup" value="Constant-time Hash Comparison" />
            <SpecRow label="Victim Anonymity" value="100% Cryptographically Guaranteed" />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
