"use client";

import React, { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import Link from "next/link";
import { ShieldCheck, AlertTriangle, ShieldAlert, Sun, Moon } from "lucide-react";

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
      <div className="flex flex-wrap items-center justify-between gap-4 p-6 bg-panel border border-hairline rounded-panel shadow-innerHighlight">
        <div>
          <h1 className="text-2xl font-bold font-display text-paper">
            Scam Shield Token Audit & Test Harness
          </h1>
          <p className="text-sm text-fog font-sans">
            Phase A Gate: Verifying color contrast, typography scales, verdict surfaces, and locale fidelity.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            href={`/${otherLocale}/dev`}
            className="px-3 py-1.5 rounded-pill border border-hairline bg-raised text-paper font-sans text-sm hover:border-signal transition"
          >
            Switch to {otherLocale === "hi" ? "हिन्दी" : "English"}
          </Link>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-tile border border-hairline bg-raised text-paper hover:border-signal transition flex items-center space-x-2 text-sm font-sans"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-signal" /> : <Moon className="w-4 h-4 text-signal" />}
            <span className="capitalize">{theme}</span>
          </button>
        </div>
      </div>

      {/* 1. Core Palette Swatches */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold font-display text-paper">1. Core Theme Palette</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-sm border border-hairline bg-page text-paper">
            <span className="text-xs text-fog font-mono">--page</span>
            <div className="font-bold font-mono mt-1 text-sm">{theme === "dark" ? "#080F1D" : "#F4F6FB"}</div>
          </div>
          <div className="p-4 rounded-sm border border-hairline bg-panel text-paper">
            <span className="text-xs text-fog font-mono">--panel</span>
            <div className="font-bold font-mono mt-1 text-sm">{theme === "dark" ? "#0C1730" : "#FFFFFF"}</div>
          </div>
          <div className="p-4 rounded-sm border border-hairline bg-raised text-paper">
            <span className="text-xs text-fog font-mono">--raised</span>
            <div className="font-bold font-mono mt-1 text-sm">{theme === "dark" ? "#111F3D" : "#EAEFF8"}</div>
          </div>
          <div className="p-4 rounded-sm border border-hairline bg-signal text-on-signal">
            <span className="text-xs opacity-80 font-mono">--signal</span>
            <div className="font-bold font-mono mt-1 text-sm">{theme === "dark" ? "#6EA8FF" : "#1F5FD6"}</div>
          </div>
        </div>
      </section>

      {/* 2. Verdict & Risk Surfaces (WCAG AA Compliance) */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold font-display text-paper">2. Verdict & Risk Surfaces (4.5:1 Contrast)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Safe */}
          <div className="p-5 rounded-tile border border-verdict-safe/30 bg-verdict-safe-surface">
            <div className="flex items-center space-x-2 text-verdict-safe">
              <ShieldCheck className="w-5 h-5" />
              <span className="font-bold font-display text-base uppercase">Looks Safe / सुरक्षित</span>
            </div>
            <p className="mt-2 text-sm text-verdict-safe-text font-sans font-medium">
              Verified genuine notification. Text tint guarantees WCAG AA compliance across dark & light modes.
            </p>
          </div>

          {/* Warn / Suspicious */}
          <div className="p-5 rounded-tile border border-verdict-warn/30 bg-verdict-warn-surface">
            <div className="flex items-center space-x-2 text-verdict-warn">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-bold font-display text-base uppercase">Be Careful / सावधान</span>
            </div>
            <p className="mt-2 text-sm text-verdict-warn-text font-sans font-medium">
              Elevated behavioral tension. Technical risk parameters require secondary user verification.
            </p>
          </div>

          {/* Scam */}
          <div className="p-5 rounded-tile border border-verdict-scam/30 bg-verdict-scam-surface">
            <div className="flex items-center space-x-2 text-verdict-scam">
              <ShieldAlert className="w-5 h-5" />
              <span className="font-bold font-display text-base uppercase">This is a Scam / धोखाधड़ी</span>
            </div>
            <p className="mt-2 text-sm text-verdict-scam-text font-sans font-medium">
              Active phishing domain, lookalike sender, or fraudulent payment gateway confirmed.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Typography Hierarchy */}
      <section className="space-y-4 p-6 bg-panel border border-hairline rounded-panel">
        <h2 className="text-xl font-bold font-display text-paper">3. Typography Hierarchy</h2>
        <div className="space-y-6">
          <div>
            <span className="text-xs font-mono text-fog">H1 Hero Clamp (Bricolage Grotesque 700)</span>
            <h1 className="text-4xl sm:text-6xl font-bold font-display text-paper tracking-tight leading-none mt-1">
              {t("hero.h1Line1")}
            </h1>
            <h1 className="text-4xl sm:text-6xl font-bold font-display text-signal tracking-tight leading-none mt-1">
              {t("hero.h1Line2")}
            </h1>
          </div>

          <div>
            <span className="text-xs font-mono text-fog">Body 18px Base (Mukta 400/500)</span>
            <p className="text-lg text-fog font-sans leading-relaxed mt-1 max-w-prose">
              {t("hero.subtitle")}
            </p>
          </div>

          <div>
            <span className="text-xs font-mono text-fog">Data-Only (JetBrains Mono 500)</span>
            <div className="font-mono text-sm text-paper bg-raised p-3 rounded-sm border border-hairline mt-1">
              Case SS-0001 | Latency: 42.5ms | Domain: sbi-kyc-verify[.]xyz | Status: 200 OK
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
