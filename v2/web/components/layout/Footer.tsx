"use client";

import React from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { PhoneCall, ExternalLink, ShieldCheck } from "lucide-react";

export const Footer: React.FC = () => {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <footer className="border-t border-hairline/80 bg-panel/60 transition-colors pt-12 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand Col */}
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-signal/10 border border-signal/30 flex items-center justify-center text-signal">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="font-heading font-bold text-base text-paper">Scam Shield</span>
            </div>
            <p className="text-xs text-fog max-w-sm leading-relaxed">
              Autonomous multi-agent citizen fraud intelligence layer. Instant plain-language verdicts in English & Hindi for suspicious SMS, WhatsApp forwards, and UPI requests.
            </p>
            {/* National Helpline Badge */}
            <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-signal/30 bg-signal/10 text-signal text-xs">
              <PhoneCall className="w-3.5 h-3.5 shrink-0" />
              <div>
                <span className="font-semibold font-mono">1930</span>
                <span className="text-fog ml-1.5 text-[11px]">— Cyber Financial Fraud Helpline</span>
              </div>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <div className="text-xs font-mono uppercase tracking-wider text-paper font-semibold">
              {t("footer.product")}
            </div>
            <ul className="space-y-2 text-xs text-fog">
              <li>
                <Link href={`/${locale}/check`} className="hover:text-paper transition-colors">
                  {t("nav.check")}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}#how-it-works`} className="hover:text-paper transition-colors">
                  {t("nav.howItWorks")}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}#scams-we-catch`} className="hover:text-paper transition-colors">
                  {t("nav.scamsWeCatch")}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/community`} className="hover:text-paper transition-colors">
                  {t("nav.community")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Help Links */}
          <div className="space-y-3">
            <div className="text-xs font-mono uppercase tracking-wider text-paper font-semibold">
              {t("footer.help")}
            </div>
            <ul className="space-y-2 text-xs text-fog">
              <li>
                <a
                  href="tel:1930"
                  className="hover:text-paper transition-colors flex items-center gap-1"
                >
                  <span>Dial 1930 (Helpline)</span>
                </a>
              </li>
              <li>
                <a
                  href="https://cybercrime.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-paper transition-colors flex items-center gap-1"
                >
                  <span>cybercrime.gov.in</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://sancharsaathi.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-paper transition-colors flex items-center gap-1"
                >
                  <span>Sanchar Saathi (Chakshu)</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>

          {/* Legal / Project */}
          <div className="space-y-3">
            <div className="text-xs font-mono uppercase tracking-wider text-paper font-semibold">
              {t("footer.legal")}
            </div>
            <ul className="space-y-2 text-xs text-fog">
              <li>
                <Link href={`/${locale}/about`} className="hover:text-paper transition-colors">
                  {t("nav.about")}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/about#privacy`} className="hover:text-paper transition-colors">
                  Privacy Guarantees
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/dev`} className="hover:text-paper transition-colors font-mono">
                  Token Audit / Dev
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar with Hackathon Disclaimer */}
        <div className="pt-6 border-t border-hairline/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-fog">
          <div>
            <span>{t("footer.hackathonNote")}</span>
            <span className="mx-2">•</span>
            <span>{t("footer.disclaimer")}</span>
          </div>
          <div className="font-mono text-paper/70">
            Scam Shield v2.0 • Zero Storage Architecture
          </div>
        </div>
      </div>
    </footer>
  );
};
