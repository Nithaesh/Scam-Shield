"use client";

import React from "react";
import { useAnalysis } from "../hooks/useAnalysis";
import { InputCard } from "../components/InputCard";
import { PipelineView } from "../components/PipelineView";
import { VerdictBanner } from "../components/VerdictBanner";
import { ConflictCallout } from "../components/ConflictCallout";
import { AdvicePanel } from "../components/AdvicePanel";
import { HistoryDrawer } from "../components/HistoryDrawer";
import { useI18n } from "../lib/i18n";
import { Shield, Sparkles } from "lucide-react";

export default function HomePage() {
  const { t } = useI18n();
  const {
    inputText,
    setInputText,
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
  } = useAnalysis();

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2 mb-6">
        <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
          <Shield className="w-4 h-4 text-blue-600" />
          <span>Scam Shield v2 Citizen Defence</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          {t("brand.subtitle")}
        </h1>
      </div>

      {/* Input Card */}
      <InputCard
        inputText={inputText}
        setInputText={setInputText}
        imagePreview={imagePreview}
        handleImageSelect={handleImageSelect}
        clearImage={clearImage}
        isListening={isListening}
        toggleSpeechRecognition={toggleSpeechRecognition}
        isAnalyzing={isAnalyzing}
        onAnalyze={analyze}
        errorMessage={errorMessage}
      />

      {/* Live 5-Agent Multi-Agent Progression */}
      <PipelineView stages={stages} isAnalyzing={isAnalyzing} />

      {/* Final Verdict Banner */}
      {result && <VerdictBanner result={result} />}

      {/* Evidence Conflict Callout if present */}
      {result && <ConflictCallout conflict={result.conflict} />}

      {/* Plain Language Advice & Next Step */}
      {result && <AdvicePanel result={result} />}

      {/* Client-side Local History */}
      <HistoryDrawer
        history={history}
        clearHistory={clearHistory}
        onSelectSnippet={(snippet) => setInputText(snippet)}
      />
    </div>
  );
}
