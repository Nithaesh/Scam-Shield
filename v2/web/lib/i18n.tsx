"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import enMessages from "../messages/en.json";
import hiMessages from "../messages/hi.json";

export type Locale = "en" | "hi";

interface I18nContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
  seniorMode: boolean;
  setSeniorMode: (v: boolean | ((prev: boolean) => boolean)) => void;
  t: (keyPath: string) => string;
}

const dictionaries: Record<Locale, any> = {
  en: enMessages,
  hi: hiMessages,
};

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");
  const [seniorMode, setSeniorModeState] = useState<boolean>(false);

  useEffect(() => {
    const savedLocale = localStorage.getItem("scam_shield_locale") as Locale;
    if (savedLocale === "en" || savedLocale === "hi") {
      setLocaleState(savedLocale);
    }
    const savedSenior = localStorage.getItem("scam_shield_senior_mode") === "true";
    setSeniorModeState(savedSenior);
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    localStorage.setItem("scam_shield_locale", l);
  };

  const setSeniorMode = (v: boolean | ((prev: boolean) => boolean)) => {
    setSeniorModeState((prev) => {
      const next = typeof v === "function" ? v(prev) : v;
      localStorage.setItem("scam_shield_senior_mode", String(next));
      return next;
    });
  };

  const t = (keyPath: string): string => {
    const keys = keyPath.split(".");
    let current = dictionaries[locale];
    for (const k of keys) {
      if (current && typeof current === "object" && k in current) {
        current = current[k];
      } else {
        return keyPath;
      }
    }
    return typeof current === "string" ? current : keyPath;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, seniorMode, setSeniorMode, t }}>
      <div className={seniorMode ? "senior-mode text-lg" : ""}>
        {children}
      </div>
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within an I18nProvider");
  }
  return ctx;
}
