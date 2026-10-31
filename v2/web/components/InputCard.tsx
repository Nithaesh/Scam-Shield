"use client";

import React, { useRef } from "react";
import { 
  Clipboard, 
  Mic, 
  MicOff, 
  Image as ImageIcon, 
  X, 
  Search, 
  Loader2, 
  Sparkles,
  ShieldCheck 
} from "lucide-react";
import { useI18n } from "../lib/i18n";

interface InputCardProps {
  inputText: string;
  setInputText: (val: string) => void;
  imagePreview: string | null;
  handleImageSelect: (file: File) => void;
  clearImage: () => void;
  isListening: boolean;
  toggleSpeechRecognition: () => void;
  isAnalyzing: boolean;
  onAnalyze: () => void;
  errorMessage: string | null;
}

export function InputCard({
  inputText,
  setInputText,
  imagePreview,
  handleImageSelect,
  clearImage,
  isListening,
  toggleSpeechRecognition,
  isAnalyzing,
  onAnalyze,
  errorMessage,
}: InputCardProps) {
  const { t } = useI18n();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInputText(text);
      }
    } catch {
      alert("Please allow clipboard permission or paste manually.");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageSelect(e.dataTransfer.files[0]);
    }
  };

  const samples = [
    {
      titleKey: "input.sampleKyc",
      text: "Dear SBI User, your YONO account KYC expired. Please verify documents immediately at http://sbi-kyc-update.com to avoid account suspension within 24 hours.",
    },
    {
      titleKey: "input.sampleElectricity",
      text: "Dear Consumer, your electricity connection will be disconnected at 9:30 PM tonight because your previous month bill was not updated. Please immediately contact our power officer at +919876543210.",
    },
    {
      titleKey: "input.sampleArrest",
      text: "URGENT CBI LEGAL NOTICE: You are placed under digital arrest for money laundering and illegal parcel detected in customs. Do not leave your room. Contact officer on Skype immediately.",
    },
    {
      titleKey: "input.sampleGenuine",
      text: "INR 1,250.00 debited from A/C XX1234 on 30-OCT-2026 14:22 via UPI Ref 629482910384. Available balance: INR 18,430.50. If not done by you, SMS BLOCK to 567676.",
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-6 transition">
      {/* Label and Actions */}
      <div className="flex items-center justify-between mb-3">
        <label 
          htmlFor="message-input" 
          className="text-base sm:text-lg font-bold text-slate-800 flex items-center space-x-2"
        >
          <Sparkles className="w-5 h-5 text-blue-600" />
          <span>{t("input.label")}</span>
        </label>
        
        <div className="flex items-center space-x-2">
          {/* Paste Button */}
          <button
            type="button"
            onClick={handlePaste}
            className="flex items-center space-x-1 text-xs sm:text-sm font-medium text-slate-600 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 px-3 py-1.5 rounded-lg border border-slate-200 transition"
          >
            <Clipboard className="w-4 h-4" />
            <span>{t("input.pasteButton")}</span>
          </button>

          {/* Voice Input Button */}
          <button
            type="button"
            onClick={toggleSpeechRecognition}
            aria-label={isListening ? t("accessibility.stopListening") : t("accessibility.speechInput")}
            className={`flex items-center space-x-1 text-xs sm:text-sm font-medium px-3 py-1.5 rounded-lg border transition ${
              isListening
                ? "bg-rose-500 text-white border-rose-600 animate-pulse"
                : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200"
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            <span className="hidden sm:inline">
              {isListening ? t("accessibility.listening") : t("accessibility.speechInput")}
            </span>
          </button>
        </div>
      </div>

      {/* Main Textarea */}
      <div className="relative">
        <textarea
          id="message-input"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={t("input.placeholder")}
          rows={4}
          disabled={isAnalyzing}
          className="w-full p-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 text-base placeholder-slate-400 bg-slate-50/50 resize-y"
        />
        {inputText && (
          <button
            type="button"
            onClick={() => setInputText("")}
            className="absolute top-3 right-3 text-slate-400 hover:text-slate-600 bg-white/80 p-1 rounded-md"
            title="Clear text"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Quick Sample Selector Chips */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-500">
          {t("input.samplesTitle")}
        </span>
        {samples.map((s, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setInputText(s.text)}
            className="text-xs font-medium bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 px-2.5 py-1 rounded-full border border-slate-200 transition"
          >
            {t(s.titleKey)}
          </button>
        ))}
      </div>

      {/* Screenshot Upload Dropzone */}
      <div className="mt-4">
        {imagePreview ? (
          <div className="relative inline-block border-2 border-blue-300 rounded-xl overflow-hidden shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={imagePreview} 
              alt="Screenshot to verify" 
              className="max-h-48 rounded-lg object-contain bg-slate-100" 
            />
            <button
              type="button"
              onClick={clearImage}
              aria-label="Remove image"
              className="absolute top-2 right-2 bg-rose-600 hover:bg-rose-700 text-white p-1 rounded-full shadow-md transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-blue-400 bg-slate-50/70 hover:bg-blue-50/40 rounded-xl p-4 text-center cursor-pointer transition"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files?.[0] && handleImageSelect(e.target.files[0])}
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center space-y-1">
              <ImageIcon className="w-6 h-6 text-slate-400" />
              <p className="text-sm font-semibold text-slate-700">
                {t("input.dropzone")}
              </p>
              <p className="text-xs text-slate-500">
                {t("input.dropzoneHint")}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-medium flex items-center space-x-2">
          <X className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Analyze CTA Button (min 48px touch target for accessibility) */}
      <button
        type="button"
        disabled={isAnalyzing}
        onClick={onAnalyze}
        className={`mt-5 w-full min-h-[52px] rounded-xl font-bold text-base sm:text-lg flex items-center justify-center space-x-2 shadow-md transition ${
          isAnalyzing
            ? "bg-slate-300 text-slate-600 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white shadow-blue-500/20"
        }`}
      >
        {isAnalyzing ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>{t("input.analyzing")}</span>
          </>
        ) : (
          <>
            <ShieldCheck className="w-6 h-6" />
            <span>{t("input.analyzeButton")}</span>
          </>
        )}
      </button>
    </div>
  );
}
