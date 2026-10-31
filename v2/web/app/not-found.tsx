"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, Search, PhoneCall } from "lucide-react";
import "./globals.css";

export default function RootNotFound() {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#060913] text-slate-100 flex items-center justify-center p-4 sm:p-6 font-sans antialiased selection:bg-cyan-500/20 selection:text-cyan-400">
        <div className="w-full max-w-lg rounded-3xl bg-[#0c1220]/95 border border-white/[0.1] p-6 sm:p-8 shadow-2xl backdrop-blur-2xl text-center space-y-6 relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Shield Icon */}
          <div className="relative mx-auto w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/10">
            <ShieldAlert className="w-8 h-8 text-cyan-400" />
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-[11px] font-mono font-bold uppercase tracking-wider text-cyan-300">
              <Search className="w-3.5 h-3.5" />
              <span>Route 404 // Page Missing</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-heading font-bold text-white tracking-tight">
              Investigation Not Found
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans max-w-md mx-auto">
              The page or forensic report you requested does not exist or has been securely discarded under our zero-retention privacy protocol.
            </p>
            <p className="text-[11px] text-slate-400 font-sans">
              यह पृष्ठ मौजूद नहीं है या गोपनीयता नियमों के तहत हटा दिया गया है।
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 justify-center pt-2">
            <Link
              href="/en"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>

            <Link
              href="/en/check"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-white/[0.1] bg-white/[0.06] hover:bg-white/[0.1] text-white text-xs font-mono font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <span>Check a Message</span>
            </Link>

            <a
              href="tel:1930"
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-mono font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5 text-rose-400" />
              <span>1930</span>
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
