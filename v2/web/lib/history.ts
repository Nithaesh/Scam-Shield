"use client";

import { FinalResultEvent } from "./api/contract";

export interface HistoryItem {
  id: string;
  caseId: string;
  timestamp: string;
  messagePreview: string;
  verdict: "safe" | "suspicious" | "scam";
  confidence: number;
  scamType: string;
  result: FinalResultEvent;
}

const STORAGE_KEY = "scam_shield_history_v2";
const PREF_SAVE_TEXT_KEY = "scam_shield_pref_save_text";

export function getSaveTextPreference(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(PREF_SAVE_TEXT_KEY) === "true";
}

export function setSaveTextPreference(enable: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(PREF_SAVE_TEXT_KEY, enable ? "true" : "false");
}

export function getInvestigationHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveInvestigationToHistory(
  caseId: string,
  userMessage: string,
  result: FinalResultEvent
): HistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const saveText = getSaveTextPreference();
    const preview = saveText
      ? userMessage.slice(0, 80) + (userMessage.length > 80 ? "..." : "")
      : "[Text discarded for privacy]";

    const newItem: HistoryItem = {
      id: result.request_id || `case-${Date.now()}`,
      caseId: caseId || "SS-0001",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      messagePreview: preview,
      verdict: result.verdict,
      confidence: result.confidence,
      scamType: result.scam_type,
      result,
    };

    const existing = getInvestigationHistory();
    // Keep max 10 recent cases
    const updated = [newItem, ...existing.filter((item) => item.id !== newItem.id)].slice(0, 10);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error("Failed to save history:", err);
    return [];
  }
}

export function clearInvestigationHistory(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}
