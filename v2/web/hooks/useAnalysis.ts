"use client";

import { useState, useCallback, useEffect } from "react";
import { FinalResultEvent, StageResultEvent } from "../lib/api/contract";
import { analyzeMessageStream } from "../lib/api/client";
import { useI18n } from "../lib/i18n";

export type AgentStageId = 
  | "extractor" 
  | "pattern_analyst" 
  | "entity_checker" 
  | "judge" 
  | "advisor";

export interface AgentStageStatus {
  id: AgentStageId;
  nameKey: string;
  state: "pending" | "running" | "done" | "error";
  durationMs?: number;
  toolsUsed?: string[];
}

export interface ScanHistoryItem {
  id: string;
  timestamp: string;
  textSnippet: string;
  verdict: "safe" | "suspicious" | "scam";
  confidence: number;
  scamType: string;
}

const INITIAL_STAGES: AgentStageStatus[] = [
  { id: "extractor", nameKey: "pipeline.extractor", state: "pending" },
  { id: "pattern_analyst", nameKey: "pipeline.pattern", state: "pending" },
  { id: "entity_checker", nameKey: "pipeline.checker", state: "pending" },
  { id: "judge", nameKey: "pipeline.judge", state: "pending" },
  { id: "advisor", nameKey: "pipeline.advisor", state: "pending" },
];

export function useAnalysis() {
  const { locale } = useI18n();
  const [inputText, setInputText] = useState("");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [stages, setStages] = useState<AgentStageStatus[]>(INITIAL_STAGES);
  const [result, setResult] = useState<FinalResultEvent | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);
  const [isListening, setIsListening] = useState(false);

  // Load history from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("scam_shield_history");
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  const saveHistory = useCallback((item: ScanHistoryItem) => {
    setHistory((prev) => {
      const updated = [item, ...prev.slice(0, 9)];
      try {
        localStorage.setItem("scam_shield_history", JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem("scam_shield_history");
    } catch {}
  }, []);

  // Web Speech API Voice Input
  const toggleSpeechRecognition = useCallback(() => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = 
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please type or paste your text.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = locale === "hi" ? "hi-IN" : "en-IN";
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      recognition.onresult = (e: any) => {
        const transcript = e.results[0][0].transcript;
        setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  }, [isListening, locale]);

  // Image handling
  const handleImageSelect = useCallback((file: File) => {
    if (!file.type.match(/^image\/(png|jpeg|jpg|webp)$/)) {
      setErrorMessage("Please select a valid image file (PNG, JPG, or WebP).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("Image is larger than 10MB limit.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const b64 = reader.result as string;
      setImagePreview(b64);
      setImageBase64(b64);
      setErrorMessage(null);
    };
    reader.readAsDataURL(file);
  }, []);

  const clearImage = useCallback(() => {
    setImagePreview(null);
    setImageBase64(null);
  }, []);

  // Start analysis
  const analyze = useCallback(async () => {
    if (!inputText.trim() && !imageBase64) {
      setErrorMessage("Please enter message text or upload a screenshot.");
      return;
    }

    setIsAnalyzing(true);
    setResult(null);
    setErrorMessage(null);
    setStages(INITIAL_STAGES.map((s) => ({ ...s, state: "pending" })));

    await analyzeMessageStream(
      {
        text: inputText.trim() || undefined,
        image_base64: imageBase64 || undefined,
        language: locale,
        stream: true,
      },
      {
        onStageStart: (ev) => {
          setStages((prev) =>
            prev.map((st) => (st.id === ev.stage ? { ...st, state: "running" } : st))
          );
        },
        onStageResult: (ev: StageResultEvent) => {
          setStages((prev) =>
            prev.map((st) =>
              st.id === ev.stage
                ? {
                    ...st,
                    state: "done",
                    durationMs: ev.duration_ms,
                    toolsUsed: ev.tools_used,
                  }
                : st
            )
          );
        },
        onFinal: (finalRes: FinalResultEvent) => {
          setResult(finalRes);
          setIsAnalyzing(false);
          // Record history snippet
          const snippet = inputText.trim().slice(0, 60) || "Screenshot analysis";
          saveHistory({
            id: finalRes.request_id,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            textSnippet: snippet,
            verdict: finalRes.verdict,
            confidence: Math.round(finalRes.confidence * 100),
            scamType: finalRes.scam_type,
          });
        },
        onError: (err) => {
          setErrorMessage(err.message);
          setIsAnalyzing(false);
        },
        onComplete: () => {
          setIsAnalyzing(false);
        },
      }
    );
  }, [inputText, imageBase64, locale, saveHistory]);

  return {
    inputText,
    setInputText,
    imageBase64,
    imagePreview,
    handleImageSelect,
    clearImage,
    isListening,
    toggleSpeechRecognition,
    isAnalyzing,
    stages,
    result,
    errorMessage,
    history,
    clearHistory,
    analyze,
  };
}
