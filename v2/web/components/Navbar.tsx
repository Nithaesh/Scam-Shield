"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, Globe, PhoneCall, ZoomIn, ZoomOut } from "lucide-react";
import { useI18n } from "../lib/i18n";

export function Navbar() {
  const { locale, setLocale, seniorMode, setSeniorMode, t } = useI18n();

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="p-2 rounded-xl bg-blue-600 text-white shadow-sm group-hover:bg-blue-700 transition">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="font-bold text-lg text-slate-900 leading-tight">
              {t("brand.title")}
            </div>
            <div className="text-xs text-slate-500 font-medium hidden sm:block">
              {t("brand.tagline")}
            </div>
          </div>
        </Link>

        {/* Navigation & Controls */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {/* Senior Mode Toggle */}
          <button
            onClick={() => setSeniorMode((prev) => !prev)}
            aria-label="Toggle senior mode high contrast large text"
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition border ${
              seniorMode
                ? "bg-amber-100 text-amber-900 border-amber-300"
                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
            }`}
          >
            {seniorMode ? <ZoomOut className="w-4 h-4 text-amber-700" /> : <ZoomIn className="w-4 h-4 text-slate-600" />}
            <span className="hidden md:inline">
              {seniorMode ? t("accessibility.seniorModeActive") : t("accessibility.seniorMode")}
            </span>
          </button>

          {/* Bilingual Switcher */}
          <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200">
            <button
              onClick={() => setLocale("en")}
              className={`px-2.5 py-1 text-xs sm:text-sm font-semibold rounded-md transition ${
                locale === "en"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              English
            </button>
            <button
              onClick={() => setLocale("hi")}
              className={`px-2.5 py-1 text-xs sm:text-sm font-semibold rounded-md transition ${
                locale === "hi"
                  ? "bg-white text-blue-700 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              हिन्दी
            </button>
          </div>

          {/* Emergency 1930 Helpline Call */}
          <a
            href="tel:1930"
            className="flex items-center space-x-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition"
            title="National Cyber Crime Reporting Helpline"
          >
            <PhoneCall className="w-4 h-4 text-rose-600" />
            <span>1930</span>
          </a>
        </div>
      </div>
    </header>
  );
}
