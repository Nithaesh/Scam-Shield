"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Sun, Moon, Shield, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

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
  // Swap locale prefix in pathname
  const otherPath = pathname.replace(`/${locale}`, `/${otherLocale}`) || `/${otherLocale}`;

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-page/85 border-b border-hairline/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <Link
          href={`/${locale}`}
          className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal rounded-lg p-1"
        >
          <div className="relative w-8 h-8 rounded-lg bg-signal/10 border border-signal/30 flex items-center justify-center text-signal group-hover:scale-105 transition-transform">
            {/* Custom SVG Shield */}
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-heading font-bold text-base tracking-tight text-paper leading-none">
              Scam Shield
            </span>
            <span className="text-[10px] font-mono text-fog uppercase tracking-wider mt-0.5">
              5-Agent Defense
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-fog">
          <Link href={`/${locale}#how-it-works`} className="hover:text-paper transition-colors">
            {t("nav.howItWorks")}
          </Link>
          <Link href={`/${locale}#scams-we-catch`} className="hover:text-paper transition-colors">
            {t("nav.scamsWeCatch")}
          </Link>
          <Link href={`/${locale}#honest-numbers`} className="hover:text-paper transition-colors">
            {t("nav.honestNumbers")}
          </Link>
          <Link href={`/${locale}/community`} className="hover:text-paper transition-colors">
            {t("nav.community")}
          </Link>
          <Link href={`/${locale}/about`} className="hover:text-paper transition-colors">
            {t("nav.about")}
          </Link>
        </nav>

        {/* Right Controls: Language, Theme, Pill CTA */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Language Switcher */}
          <Link
            href={otherPath}
            className="px-2.5 py-1 rounded-md border border-hairline bg-raised text-paper text-xs font-mono font-medium hover:border-signal transition-colors"
            title="Switch Language"
          >
            {locale === "en" ? "हिन्दी" : "English"}
          </Link>

          {/* Theme Switcher */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-md border border-hairline bg-raised text-fog hover:text-paper hover:border-signal transition-colors"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="w-4 h-4 text-signal" /> : <Moon className="w-4 h-4 text-signal" />}
          </button>

          {/* Check Button Pill */}
          <Link href={`/${locale}/check`}>
            <Button variant="signal" size="sm" className="font-sans">
              {t("nav.check")}
            </Button>
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="flex sm:hidden items-center gap-2">
          <Link
            href={otherPath}
            className="px-2 py-1 rounded border border-hairline bg-raised text-paper text-xs font-mono"
          >
            {locale === "en" ? "हिं" : "EN"}
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded border border-hairline bg-raised text-fog"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="sm:hidden px-4 pt-3 pb-6 border-t border-hairline bg-panel space-y-4 animate-in slide-in-from-top-2">
          <nav className="flex flex-col space-y-3 text-sm font-medium text-fog">
            <Link
              href={`/${locale}#how-it-works`}
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-paper"
            >
              {t("nav.howItWorks")}
            </Link>
            <Link
              href={`/${locale}#scams-we-catch`}
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-paper"
            >
              {t("nav.scamsWeCatch")}
            </Link>
            <Link
              href={`/${locale}#honest-numbers`}
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-paper"
            >
              {t("nav.honestNumbers")}
            </Link>
            <Link
              href={`/${locale}/community`}
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-paper"
            >
              {t("nav.community")}
            </Link>
            <Link
              href={`/${locale}/about`}
              onClick={() => setMobileMenuOpen(false)}
              className="hover:text-paper"
            >
              {t("nav.about")}
            </Link>
          </nav>

          <div className="flex items-center justify-between pt-3 border-t border-hairline">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-2 text-xs text-fog"
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-signal" /> : <Moon className="w-4 h-4 text-signal" />}
              <span>{theme === "dark" ? "Light theme" : "Dark theme"}</span>
            </button>
            <Link href={`/${locale}/check`} onClick={() => setMobileMenuOpen(false)}>
              <Button variant="signal" size="sm">
                {t("nav.check")}
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
