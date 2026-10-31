"use client";

import React, { useState } from "react";
import { Users, Search, ShieldAlert, CheckCircle2 } from "lucide-react";
import { useI18n } from "../../lib/i18n";

export default function CommunityPage() {
  const { locale } = useI18n();
  const [query, setQuery] = useState("");
  const [searchResult, setSearchResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearchResult(null);
    try {
      const isPhone = /^[0-9+]+$/.test(query.trim());
      const isUpi = query.includes("@");
      const entityType = isPhone ? "phone" : isUpi ? "upi" : "domain";

      const res = await fetch("/api/v2/community/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entities: [{ type: entityType, value: query.trim() }],
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setSearchResult(data.matches || []);
      } else {
        setSearchResult([]);
      }
    } catch {
      setSearchResult([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
          <Users className="w-4 h-4" />
          <span>Community Defense Network</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">
          {locale === "hi" ? "नागरिक फ्रॉड रिपोर्ट नेटवर्क" : "Citizen Threat Intelligence"}
        </h1>
        <p className="text-base text-slate-600">
          {locale === "hi"
            ? "सत्यापित नागरिकों द्वारा रिपोर्ट किए गए संदिग्ध नंबरों और लिंक की सुरक्षित खोज करें।"
            : "Search reported suspicious phone numbers, domains, and UPI handles masked for privacy."}
        </p>
      </div>

      {/* Lookup Form */}
      <form onSubmit={handleLookup} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <label className="block text-sm font-bold text-slate-800 mb-2">
          {locale === "hi" ? "फ़ोन नंबर, डोमेन या UPI ID दर्ज करें:" : "Check a Phone, Domain, or UPI ID:"}
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. +919876543210, sbi-kyc.top, fraud@upi"
            className="flex-1 p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 text-base"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-3 rounded-xl transition flex items-center space-x-1.5"
          >
            <Search className="w-4 h-4" />
            <span>{locale === "hi" ? "खोजें" : "Lookup"}</span>
          </button>
        </div>
      </form>

      {/* Results */}
      {searchResult !== null && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          {searchResult.length > 0 ? (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-rose-700 flex items-center space-x-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <span>Found In Community Fraud Database:</span>
              </h3>
              {searchResult.map((m: any, i: number) => (
                <div key={i} className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-mono font-bold text-rose-950 text-base">{m.entity_masked}</span>
                    <span className="ml-2 text-xs uppercase px-2 py-0.5 rounded bg-rose-200 text-rose-800 font-semibold">
                      {m.entity_type}
                    </span>
                  </div>
                  <div className="text-sm font-bold text-rose-700">
                    {m.report_count} Reports
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-slate-600 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <p className="font-semibold text-slate-800">No community fraud reports recorded for this entry.</p>
              <p className="text-xs text-slate-500">Always verify unexpected payment requests before transferring money.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
