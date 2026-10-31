"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Sun, Moon, Shield, Menu, X, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const Header: React.FC = () => {
  const t = useTranslations();
  const locale = useLocale();
  const pathname = usePathname();
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("scam_shield_theme") as "dark" | "light" | null;
    if (saved) {
      setTheme(saved);
      document.documentElement.setAttribute("data-theme", saved);
      if (saved === "light") document.documentElement.classList.add("light");
      else document.documentElement.classList.remove("light");
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem("scam_shield_theme", next);
    document.documentElement.setAttribute("data-theme", next);
    if (next === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
  };

  const otherLocale = locale === "en" ? "hi" : "en";
  const otherPath = pathname.replace(`/${locale}`, `/${otherLocale}`) || `/${otherLocale}`;

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-[#060913]/80 border-b border-white/[0.06] transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Name (Screenshot 1 Style) */}
        <Link
          href={`/${locale}`}
          className="flex items-center gap-3 group focus-visible:outline-none rounded-lg"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-signal to-blue-600 p-[1px] shadow-sm group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#060913] rounded-[7px] flex items-center justify-center text-signal">
              <Shield className="w-4 h-4 fill-signal/20" />
            </div>
          </div>
          <span className="font-heading font-bold text-base tracking-tight text-white">
            Scam Shield
          </span>
        </Link>

        {/* Center Floating Pill Navigation (Screenshot 1 Style) */}
        <nav className="hidden md:flex items-center gap-1 p-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-medium text-slate-400">
          <Link
            href={`/${locale}#threat-map`}
            className="px-3.5 py-1.5 rounded-full hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            Threat Map
          </Link>
          <Link
            href={`/${locale}#pipeline`}
            className="px-3.5 py-1.5 rounded-full hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            Pipeline
          </Link>
          <Link
            href={`/${locale}#security-stack`}
            className="px-3.5 py-1.5 rounded-full hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            Forensics
          </Link>
          <Link
            href={`/${locale}/community`}
            className="px-3.5 py-1.5 rounded-full hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            Community
          </Link>
          <Link
            href={`/${locale}/about`}
            className="px-3.5 py-1.5 rounded-full hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            About
          </Link>
        </nav>

        {/* Right Controls: Status Pill, Language, Theme, Action Button (Screenshot 1 Style) */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Status Badge */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>5 AGENTS ONLINE</span>
          </div>

          {/* Language Switcher */}
          <Link
            href={otherPath}
            className="px-2.5 py-1 rounded-full border border-white/[0.08] bg-white/[0.04] text-slate-300 text-xs font-mono hover:border-signal transition-colors"
            title="Switch Language"
          >
            {locale === "en" ? "हिन्दी" : "EN"}
          </Link>

          {/* Theme Switcher */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-full border border-white/[0.08] bg-white/[0.04] text-slate-400 hover:text-white hover:border-signal transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="w-3.5 h-3.5 text-signal" /> : <Moon className="w-3.5 h-3.5 text-signal" />}
          </button>

          {/* Primary Action Button (Screenshot 1 Style: Pill with Arrow) */}
          <Link
            href={`/${locale}/check`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-slate-950 font-semibold text-xs hover:bg-slate-200 transition-all shadow-sm group"
          >
            <span>Check Message</span>
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex sm:hidden items-center gap-2">
          <Link
            href={otherPath}
            className="px-2 py-1 rounded border border-white/[0.08] bg-white/[0.04] text-white text-xs font-mono"
          >
            {locale === "en" ? "हिं" : "EN"}
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded border border-white/[0.08] bg-white/[0.04] text-slate-300"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden px-4 pt-3 pb-6 border-t border-white/[0.08] bg-[#0A0F1E] space-y-4">
          <nav className="flex flex-col space-y-3 text-sm font-medium text-slate-300">
            <Link
              href={`/${locale}#threat-map`}
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-white"
            >
              Threat Map
            </Link>
            <Link
              href={`/${locale}#pipeline`}
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-white"
            >
              Pipeline
            </Link>
            <Link
              href={`/${locale}#security-stack`}
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-white"
            >
              Forensics
            </Link>
            <Link
              href={`/${locale}/community`}
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-white"
            >
              Community
            </Link>
            <Link
              href={`/${locale}/about`}
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-white"
            >
              About
            </Link>
          </nav>
          <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between">
            <Link href={`/${locale}/check`} onClick={() => setMobileMenuOpen(false)}>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-slate-950 font-semibold text-xs">
                Check Message →
              </span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
