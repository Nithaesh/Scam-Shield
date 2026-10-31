"use client";

import React from "react";
import { 
  AlertTriangle, 
  ShieldAlert, 
  ShieldCheck, 
  Percent, 
  Tag, 
  Info, 
  Globe, 
  Phone, 
  CreditCard 
} from "lucide-react";
import { FinalResultEvent } from "../lib/api/contract";
import { useI18n } from "../lib/i18n";

interface VerdictBannerProps {
  result: FinalResultEvent;
}

export function VerdictBanner({ result }: VerdictBannerProps) {
  const { t } = useI18n();
  const isScam = result.verdict === "scam";
  const isSuspicious = result.verdict === "suspicious";
  const isSafe = result.verdict === "safe";

  const bannerConfig = isScam
    ? {
        bg: "bg-rose-50 border-rose-300 text-rose-900",
        badgeBg: "bg-rose-600 text-white",
        title: t("verdict.scam"),
        sub: t("verdict.scamSub"),
        icon: ShieldAlert,
        colorClass: "text-rose-600",
      }
    : isSuspicious
    ? {
        bg: "bg-amber-50 border-amber-300 text-amber-900",
        badgeBg: "bg-amber-500 text-white",
        title: t("verdict.suspicious"),
        sub: t("verdict.suspiciousSub"),
        icon: AlertTriangle,
        colorClass: "text-amber-600",
      }
    : {
        bg: "bg-emerald-50 border-emerald-300 text-emerald-900",
        badgeBg: "bg-emerald-600 text-white",
        title: t("verdict.safe"),
        sub: t("verdict.safeSub"),
        icon: ShieldCheck,
        colorClass: "text-emerald-600",
      };

  const Icon = bannerConfig.icon;
  const confidencePercent = Math.round(result.confidence * 100);

  return (
    <section 
      aria-live="polite" 
      className={`rounded-2xl border-2 p-5 sm:p-7 shadow-sm transition ${bannerConfig.bg}`}
    >
      {/* Header Verdict Card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-black/10">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className={`p-3 rounded-2xl ${bannerConfig.badgeBg} shadow-sm`}>
            <Icon className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              {bannerConfig.title}
            </h2>
            <p className="text-sm font-semibold mt-0.5 opacity-90">
              {bannerConfig.sub}
            </p>
          </div>
        </div>

        {/* Confidence & Category Badges */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Confidence Badge */}
          <div className="bg-white/80 backdrop-blur-sm border border-black/10 px-3 py-1.5 rounded-xl flex items-center space-x-1.5 shadow-sm">
            <Percent className="w-4 h-4 text-slate-600" />
            <span className="text-xs font-medium text-slate-600">{t("verdict.confidence")}:</span>
            <span className="text-sm font-bold text-slate-900">{confidencePercent}%</span>
          </div>

          {/* Scam Type Badge */}
          {result.scam_type && result.scam_type !== "none" && (
            <div className="bg-white/80 backdrop-blur-sm border border-black/10 px-3 py-1.5 rounded-xl flex items-center space-x-1.5 shadow-sm">
              <Tag className="w-4 h-4 text-slate-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
                {result.scam_type.replace(/_/g, " ")}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Synthesis Reasoning Box */}
      <div className="mt-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center space-x-1 mb-2">
          <Info className="w-4 h-4" />
          <span>{t("verdict.why")}</span>
        </h3>
        <p className="text-base text-slate-900 font-medium leading-relaxed bg-white/70 backdrop-blur-sm p-4 rounded-xl border border-black/5">
          {result.reasoning}
        </p>
      </div>

      {/* Extracted Suspicious Entities */}
      {(result.entities.urls.length > 0 ||
        result.entities.phones.length > 0 ||
        result.entities.upi_ids.length > 0) && (
        <div className="mt-4 pt-4 border-t border-black/10">
          <div className="text-xs font-bold text-slate-700 mb-2">
            Identified Elements:
          </div>
          <div className="flex flex-wrap gap-2">
            {result.entities.urls.map((u, i) => (
              <span
                key={i}
                className="bg-white/90 text-slate-800 text-xs font-mono font-semibold px-2.5 py-1 rounded-lg border border-black/10 flex items-center space-x-1"
              >
                <Globe className="w-3.5 h-3.5 text-blue-600" />
                <span className="truncate max-w-[200px]">{u}</span>
              </span>
            ))}
            {result.entities.phones.map((p, i) => (
              <span
                key={i}
                className="bg-white/90 text-slate-800 text-xs font-mono font-semibold px-2.5 py-1 rounded-lg border border-black/10 flex items-center space-x-1"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>{p}</span>
              </span>
            ))}
            {result.entities.upi_ids.map((upi, i) => (
              <span
                key={i}
                className="bg-white/90 text-slate-800 text-xs font-mono font-semibold px-2.5 py-1 rounded-lg border border-black/10 flex items-center space-x-1"
              >
                <CreditCard className="w-3.5 h-3.5 text-purple-600" />
                <span>{upi}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
