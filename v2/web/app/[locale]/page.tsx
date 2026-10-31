"use client";

import React from "react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { Shield } from "lucide-react";

export default function LocaleLandingPage() {
  const t = useTranslations();

  return (
    <div className="max-w-4xl mx-auto px-6 py-20 text-center space-y-6">
      <div className="inline-flex items-center space-x-2 bg-panel border border-hairline px-4 py-1.5 rounded-pill shadow-innerHighlight text-signal text-sm">
        <Shield className="w-4 h-4" />
        <span>Scam Shield v2</span>
      </div>
      <h1 className="text-4xl sm:text-6xl font-bold font-display tracking-tight text-paper">
        {t("hero.h1Line1")}
        <br />
        <span className="text-signal">{t("hero.h1Line2")}</span>
      </h1>
      <p className="text-lg text-fog max-w-2xl mx-auto font-sans leading-relaxed">
        {t("hero.subtitle")}
      </p>
      <div className="pt-4 flex justify-center gap-4">
        <Link
          href="./dev"
          className="px-6 py-3 bg-signal text-on-signal font-sans font-bold rounded-pill hover:opacity-90 transition shadow-innerHighlight"
        >
          View Token System (/dev)
        </Link>
      </div>
    </div>
  );
}
