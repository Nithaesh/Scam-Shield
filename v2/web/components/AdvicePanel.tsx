"use client";

import React, { useState } from "react";
import { 
  ShieldCheck, 
  XCircle, 
  CheckCircle, 
  PhoneCall, 
  Share2, 
  ExternalLink, 
  Flag,
  Check
} from "lucide-react";
import { FinalResultEvent } from "../lib/api/contract";
import { useI18n } from "../lib/i18n";

interface AdvicePanelProps {
  result: FinalResultEvent;
}

export function AdvicePanel({ result }: AdvicePanelProps) {
  const { t } = useI18n();
  const [reported, setReported] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  const advice = result.advice;
  const isScam = result.verdict === "scam" || result.verdict === "suspicious";

  const handleWhatsAppShare = () => {
    const encoded = encodeURIComponent(result.share_text);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, "_blank");
  };

  const handleCopyShare = async () => {
    try {
      await navigator.clipboard.writeText(result.share_text);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2500);
    } catch {}
  };

  const handleReportCommunity = async () => {
    if (reported) return;
    try {
      // Report first entity if present
      const firstPhone = result.entities.phones[0];
      const firstUrl = result.entities.urls[0];
      const firstUpi = result.entities.upi_ids[0];

      let entityType = "domain";
      let entityValue = firstUrl || "suspicious-message";
      if (firstPhone) {
        entityType = "phone";
        entityValue = firstPhone;
      } else if (firstUpi) {
        entityType = "upi";
        entityValue = firstUpi;
      }

      await fetch("/api/v2/community/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entity_type: entityType,
          entity_value: entityValue,
          scam_type: result.scam_type || "other",
        }),
      }).catch(() => {});
      setReported(true);
    } catch {
      setReported(true);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-7 my-6 transition">
      <div className="flex items-center space-x-2 pb-4 border-b border-slate-100">
        <ShieldCheck className="w-6 h-6 text-blue-600" />
        <h3 className="text-lg sm:text-xl font-bold text-slate-900">
          {t("advice.title")}: {advice.headline}
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-5">
        {/* Do Not Section */}
        {advice.do_not.length > 0 && (
          <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-4 sm:p-5">
            <h4 className="text-sm font-bold text-rose-900 uppercase tracking-wider flex items-center space-x-1.5 mb-3">
              <XCircle className="w-4 h-4 text-rose-600" />
              <span>{t("advice.doNot")}</span>
            </h4>
            <ul className="space-y-2.5">
              {advice.do_not.map((item, idx) => (
                <li key={idx} className="flex items-start space-x-2.5 text-sm sm:text-base font-semibold text-rose-950">
                  <span className="text-rose-500 font-bold">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* One Next Step / Do Next Section */}
        {advice.do_next.length > 0 && (
          <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 sm:p-5">
            <h4 className="text-sm font-bold text-emerald-900 uppercase tracking-wider flex items-center space-x-1.5 mb-3">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              <span>{t("advice.doNext")}</span>
            </h4>
            <ul className="space-y-2.5">
              {advice.do_next.map((item, idx) => (
                <li key={idx} className="flex items-start space-x-2.5 text-sm sm:text-base font-semibold text-emerald-950">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Emergency Helpline & Government Portals */}
      <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <a
            href="tel:1930"
            className="flex-1 sm:flex-none flex items-center justify-center space-x-2 bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-sm transition"
          >
            <PhoneCall className="w-4 h-4" />
            <span>{t("advice.helplineCall")}</span>
          </a>
          <a
            href="https://cybercrime.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-4 py-2.5 rounded-xl border border-slate-300 transition text-sm"
          >
            <span>{t("advice.helplineWeb")}</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
          </a>
        </div>

        {/* Action Buttons: WhatsApp Share & Community Flag */}
        <div className="flex items-center space-x-2.5 w-full sm:w-auto justify-end">
          {/* WhatsApp Share Button */}
          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="flex-1 sm:flex-none flex items-center justify-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl shadow-sm transition text-sm"
          >
            <Share2 className="w-4 h-4" />
            <span>{t("advice.shareWhatsApp")}</span>
          </button>

          {/* Copy Share Text */}
          <button
            type="button"
            onClick={handleCopyShare}
            className="p-2.5 rounded-xl border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            title="Copy shareable warning text"
          >
            {copiedShare ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
          </button>

          {/* Community Flag Button */}
          {isScam && (
            <button
              type="button"
              disabled={reported}
              onClick={handleReportCommunity}
              className={`p-2.5 rounded-xl border transition flex items-center justify-center ${
                reported
                  ? "bg-slate-100 text-slate-400 border-slate-200 cursor-default"
                  : "bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-300"
              }`}
              title={t("advice.reportCommunity")}
            >
              <Flag className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
