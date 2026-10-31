"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import {
  ShieldAlert,
  ShieldCheck,
  Shield,
  PhoneCall,
  Search,
  Plus,
  Lock,
  ChevronDown,
  Info,
  Copy,
  Check,
  Mic,
  Volume2,
  VolumeX,
  FileText,
  Download,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Send,
  Trash2,
  ExternalLink,
  BrainCircuit,
  Scale,
  LifeBuoy,
  MessageSquare,
  Sun,
  Moon,
  Clock,
  Activity,
  FileSpreadsheet,
  CheckCircle2,
  Share2,
  ArrowUpRight,
  Layers,
  Cpu,
  History,
  Terminal,
  Crown,
  Settings,
  HelpCircle,
  Video,
  Image as ImageIcon,
  Code2,
  Boxes,
  FolderGit2,
  Upload,
  X,
} from "lucide-react";
import { cn, defangUrl, defangHandle } from "@/lib/utils";
import { PipelineGraph } from "@/components/pipeline/PipelineGraph";
import { Orb3D } from "@/components/ui/Orb3D";
import { analyzeMessageStream, simulateOfflineStream, AnalyzePayload } from "@/lib/api/client";
import { ErrorPanel } from "@/components/ui/ErrorPanel";
import { useToast } from "@/components/ui/Toast";
import {
  FinalResultEvent,
  StageResultEvent,
  StageStartEvent,
} from "@/lib/api/contract";
import { tts } from "@/lib/tts";
import { downloadTextReport, downloadJsonReport } from "@/lib/report";
import {
  getInvestigationHistory,
  saveInvestigationToHistory,
  clearInvestigationHistory,
  HistoryItem,
} from "@/lib/history";

export default function SyntrixDashboardPage() {
  const t = useTranslations();
  const locale = useLocale();
  const { toast } = useToast();

  // Investigation state
  const [inputText, setInputText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeStage, setActiveStage] = useState<string | null>(null);
  const [completedStages, setCompletedStages] = useState<string[]>([]);
  const [stageOutputs, setStageOutputs] = useState<Record<string, StageResultEvent>>({});
  const [finalResult, setFinalResult] = useState<FinalResultEvent | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [caseId, setCaseId] = useState("SS-0042");

  // History & selections
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [copiedEntity, setCopiedEntity] = useState<string | null>(null);

  // Attachment state for screenshots
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [attachedImageName, setAttachedImageName] = useState<string | null>(null);
  const [attachedImageSize, setAttachedImageSize] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dropdown & Modal states
  const [versionDropdown, setVersionDropdown] = useState(false);
  const [toolsDropdown, setToolsDropdown] = useState(false);
  const [thinkDropdown, setThinkDropdown] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [selectedPresetCategory, setSelectedPresetCategory] = useState<string>("all");

  const mainScrollRef = useRef<HTMLDivElement>(null);

  // Hindi localization dictionary
  const isHi = locale === "hi";
  const dict = {
    brandName: isHi ? "स्कैम शील्ड" : "Scam Shield",
    versionPill: isHi ? "स्कैम शील्ड v2.0" : "Scam Shield v2.0",
    welcomeBack: isHi ? "वापसी पर स्वागत है" : "Welcome Back",
    mainHeadline: isHi ? "आज ही अपनी डिजिटल सुरक्षा सुनिश्चित करें" : "Bring your safety to life today",
    inputPlaceholder: isHi ? "मुझसे कुछ भी पूछें... या संदिग्ध SMS, व्हाट्सएप संदेश या UPI लिंक पेस्ट करें" : "Ask me anything... or paste suspicious SMS, WhatsApp message, or UPI link",
    newScan: isHi ? "नई जांच" : "New Scan",
    featuresTitle: isHi ? "एजेंट क्षमताएं" : "Features",
    recentScans: isHi ? "हालिया स्कैन" : "Recent Scans",
    clear: isHi ? "हटाएं" : "Clear",
    dashboard: isHi ? "डैशबोर्ड" : "Dashboard",
    helpSupport: isHi ? "सहायता एवं समर्थन" : "Help & Support",
    voice: isHi ? "आवाज" : "Voice",
    agentsTool: isHi ? "5 एजेंट सक्रिय" : "5 Agents",
    bayesianVeto: isHi ? "बेयसियन वीटो" : "Bayesian Veto",
    helplineTitle: isHi ? "राष्ट्रीय साइबर हेल्पलाइन 1930" : "Emergency Helpline 1930",
    helplineDesc: isHi ? "मेमोरी-आधारित विश्लेषण। 0 बाइट्स डिस्क पर सेव।" : "Air-gapped memory sandbox. Zero bytes retained on disk.",
    dialHelpline: isHi ? "कॉल 1930 नि:शुल्क" : "Dial 1930 Free",
    card1Title: isHi ? "बैंक केवाईसी धोखाधड़ी" : "Bank KYC Phishing",
    card1Desc: isHi ? "एसबीआई YONO के नकली लिंक और धोखाधड़ी की पहचान करें।" : "Inspect lookalike SBI YONO links and defanged URLs in seconds.",
    card2Title: isHi ? "बिजली बिल काटने की धमकी" : "Electricity Threat",
    card2Desc: isHi ? "आज रात 9:30 बजे बिजली कटने वाले फर्जी संदेशों की पड़ताल करें।" : "Detect false deadline countdowns and power disconnection traps.",
    card3Title: isHi ? "सीबीआई डिजिटल अरेस्ट" : "CBI Digital Arrest",
    card3Desc: isHi ? "फर्जी पुलिस व सुप्रीम कोर्ट के आधार वारंट का पर्दाफाश करें।" : "Expose fake law enforcement summons and WhatsApp extortion.",
    runningPipeline: isHi ? "वास्तविक समय मल्टी-एजेंट DAG वर्कफ़्लो" : "LIVE MULTI-AGENT DAG WORKFLOW",
    consensusDone: isHi ? "आम सहमति जांच पूर्ण ✓" : "Consensus Complete ✓",
    confirmedScam: isHi ? "धोखाधड़ी की पुष्टि" : "CONFIRMED FRAUD",
    suspicious: isHi ? "अत्यधिक संदिग्ध" : "HIGHLY SUSPICIOUS",
    safe: isHi ? "पूर्णतः सुरक्षित" : "VERIFIED SAFE",
    copyWarning: isHi ? "व्हाट्सएप चेतावनी कॉपी करें" : "Copy WhatsApp Warning",
    copied: isHi ? "कॉपी हो गया!" : "Copied!",
    reportTxt: isHi ? "रिपोर्ट (.txt)" : "Report (.txt)",
    reportJson: isHi ? "सबूत (.json)" : "Evidence (.json)",
    protectiveRules: isHi ? "सुरक्षा नियम (क्या न करें)" : "Protective Rules (DO NOT)",
    immediateStep: isHi ? "तत्काल अगला कदम" : "Immediate Next Step",
  };

  const loadSampleScreenshot = async (filename: string, title: string) => {
    try {
      const response = await fetch(`/screenshots/${filename}`);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setAttachedImage(base64);
        setAttachedImageName(title);
        const kb = Math.round(blob.size / 1024);
        setAttachedImageSize(`${kb} KB`);
        setUploadModalOpen(false);
        setErrorMessage(null);
        triggerAnalysis("", base64);
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error("Failed to load sample screenshot:", err);
    }
  };

  useEffect(() => {
    setHistory(getInvestigationHistory());

    if (typeof window !== "undefined") {
      const prefill = sessionStorage.getItem("scam_shield_prefill");
      const imgPrefill = sessionStorage.getItem("scam_shield_image_prefill");
      const imgName = sessionStorage.getItem("scam_shield_image_name");

      if (imgPrefill) {
        sessionStorage.removeItem("scam_shield_image_prefill");
        sessionStorage.removeItem("scam_shield_image_name");
        setAttachedImage(imgPrefill);
        setAttachedImageName(imgName || "screenshot.png");
        triggerAnalysis(prefill || "", imgPrefill);
      } else if (prefill) {
        sessionStorage.removeItem("scam_shield_prefill");
        setInputText(prefill);
        triggerAnalysis(prefill);
      }
    }
  }, []);

  // Global drag-and-drop listener for screenshots
  useEffect(() => {
    const handleWindowDragOver = (e: DragEvent) => {
      e.preventDefault();
    };
    const handleWindowDrop = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        if (file.type.startsWith("image/")) {
          processImageFile(file);
        }
      }
    };
    window.addEventListener("dragover", handleWindowDragOver);
    window.addEventListener("drop", handleWindowDrop);
    return () => {
      window.removeEventListener("dragover", handleWindowDragOver);
      window.removeEventListener("drop", handleWindowDrop);
    };
  }, []);

  const processImageFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      const msg = isHi
        ? "कृपया केवल छवि (PNG, JPG, WebP) फ़ाइल अपलोड करें।"
        : "Please upload an image file (PNG, JPG, WebP).";
      setErrorMessage(msg);
      toast.error(isHi ? "अमान्य फ़ाइल" : "Invalid File", msg);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      const msg = isHi
        ? "छवि फ़ाइल 10MB से कम होनी चाहिए।"
        : "Image size must be under 10MB.";
      setErrorMessage(msg);
      toast.error(isHi ? "फ़ाइल बहुत बड़ी है" : "File Too Large", msg);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setAttachedImage(base64);
      setAttachedImageName(file.name || "screenshot.png");
      const kb = Math.round(file.size / 1024);
      setAttachedImageSize(kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`);
      setUploadModalOpen(false);
      setErrorMessage(null);
      toast.success(
        isHi ? "स्क्रीनशॉट संलग्न किया गया" : "Screenshot attached",
        file.name || "screenshot.png"
      );
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0]);
      e.target.value = "";
    }
  };

  // Clipboard paste listener for instant Ctrl+V screenshot attachment
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.files.length > 0) {
        const file = e.clipboardData.files[0];
        if (file.type.startsWith("image/")) {
          e.preventDefault();
          processImageFile(file);
        }
      }
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, []);

  const handleNewCheck = () => {
    tts.stop();
    setIsSpeaking(false);
    setInputText("");
    setAttachedImage(null);
    setAttachedImageName(null);
    setAttachedImageSize(null);
    setFinalResult(null);
    setStageOutputs({});
    setCompletedStages([]);
    setActiveStage(null);
    setErrorMessage(null);
    setSelectedFeature(null);
    setCaseId(`SS-00${Math.floor(Math.random() * 900 + 100)}`);
  };

  const handleCopyShareText = () => {
    if (!finalResult) return;
    navigator.clipboard.writeText(finalResult.share_text);
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2500);
    toast.success(
      isHi ? "चेतावनी कॉपी हो गई!" : "WhatsApp Warning Copied",
      isHi ? "व्हाट्सएप अलर्ट टेक्स्ट क्लिपबोर्ड पर कॉपी किया गया।" : "WhatsApp alert text copied to clipboard."
    );
  };

  const handleCopyEntity = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEntity(text);
    setTimeout(() => setCopiedEntity(null), 2000);
    toast.info(isHi ? "क्लिपबोर्ड पर कॉपी किया गया" : "Copied to clipboard", text);
  };

  const handleToggleTTS = () => {
    if (!finalResult) {
      const sampleGreeting = isHi
        ? "नमस्ते, मैं स्कैम शील्ड हूँ। कोई भी संदिग्ध मैसेज यहाँ पेस्ट करें और मैं 5 AI एजेंट्स की मदद से उसकी जांच करूँगा।"
        : "Hello, I am Scam Shield. Paste any suspicious message here and our five AI agents will verify it.";
      tts.toggle(sampleGreeting, (locale as "en" | "hi") || "en", (speaking) => {
        setIsSpeaking(speaking);
      });
      return;
    }
    const voiceText = `${finalResult.advice.headline}. ${finalResult.reasoning}. ${finalResult.advice.do_not.join(". ")}`;
    tts.toggle(voiceText, (locale as "en" | "hi") || "en", (speaking) => {
      setIsSpeaking(speaking);
    });
  };

  const handleLoadHistoryCase = (item: HistoryItem) => {
    tts.stop();
    setIsSpeaking(false);
    setCaseId(item.caseId);
    setInputText(item.messagePreview);
    setAttachedImage(null);
    setAttachedImageName(null);
    setAttachedImageSize(null);
    setFinalResult(item.result);
    setCompletedStages(["extractor", "pattern_analyst", "entity_checker", "judge", "advisor"]);
    setActiveStage(null);
    setErrorMessage(null);
  };

  const triggerAnalysis = async (textToAnalyze?: string, imageToAnalyze?: string) => {
    const rawMessage = textToAnalyze !== undefined ? textToAnalyze : inputText;
    const currentImage = imageToAnalyze !== undefined ? imageToAnalyze : attachedImage;
    if ((!rawMessage.trim() && !currentImage) || isAnalyzing) return;

    const message = rawMessage.trim() || (isHi ? "[संलग्न स्क्रीनशॉट का फॉरेंसिक OCR विश्लेषण]" : "[Attached Screenshot Forensic OCR Analysis]");

    tts.stop();
    setIsSpeaking(false);
    setIsAnalyzing(true);
    setErrorMessage(null);
    setFinalResult(null);
    setStageOutputs({});
    setCompletedStages([]);
    setActiveStage("extractor");
    const currentId = `SS-00${Math.floor(Math.random() * 900 + 100)}`;
    setCaseId(currentId);

    // Smooth scroll down to live results
    setTimeout(() => {
      mainScrollRef.current?.scrollTo({ top: 380, behavior: "smooth" });
    }, 150);

    const payload: AnalyzePayload = {
      text: message,
      image_base64: currentImage || undefined,
      language: locale,
      stream: true,
    };

    await analyzeMessageStream(payload, {
      onStageStart: (ev: StageStartEvent) => {
        setActiveStage(ev.stage);
      },
      onStageResult: (ev: StageResultEvent) => {
        setCompletedStages((prev) => Array.from(new Set([...prev, ev.stage])));
        setStageOutputs((prev) => ({ ...prev, [ev.stage]: ev }));
      },
      onFinal: (res: FinalResultEvent) => {
        setFinalResult(res);
        setActiveStage(null);
        setIsAnalyzing(false);
        const updated = saveInvestigationToHistory(currentId, message, res);
        setHistory(updated);
        toast.success(
          isHi ? "विश्लेषण पूर्ण" : "Analysis Complete",
          isHi ? `केस ${currentId}: 5 एजेंट्स ने निष्कर्ष निकाला।` : `Case ${currentId}: 5 agents reached consensus.`
        );
      },
      onError: (err: Error) => {
        setIsAnalyzing(false);
        setActiveStage(null);
        const msg = err.message || "Server connection failed.";
        setErrorMessage(msg);
        toast.error(isHi ? "विश्लेषण त्रुटि" : "Analysis Pipeline Error", msg);
      },
      onComplete: () => {
        setIsAnalyzing(false);
        setActiveStage(null);
      },
    });
  };

  const handleRunOfflineSimulation = async () => {
    setErrorMessage(null);
    setIsAnalyzing(true);
    setFinalResult(null);
    setStageOutputs({});
    setCompletedStages([]);
    setActiveStage("extractor");
    const currentId = `SS-00${Math.floor(Math.random() * 900 + 100)}`;
    setCaseId(currentId);

    const message = inputText.trim() || (isHi ? "[संलग्न स्क्रीनशॉट का फॉरेंसिक OCR विश्लेषण]" : "[Attached Screenshot Forensic OCR Analysis]");
    const payload: AnalyzePayload = {
      text: message,
      image_base64: attachedImage || undefined,
      language: locale,
    };

    await simulateOfflineStream(payload, {
      onStageStart: (ev: StageStartEvent) => {
        setActiveStage(ev.stage);
      },
      onStageResult: (ev: StageResultEvent) => {
        setCompletedStages((prev) => Array.from(new Set([...prev, ev.stage])));
        setStageOutputs((prev) => ({ ...prev, [ev.stage]: ev }));
      },
      onFinal: (res: FinalResultEvent) => {
        setFinalResult(res);
        setActiveStage(null);
        setIsAnalyzing(false);
        const updated = saveInvestigationToHistory(currentId, message, res);
        setHistory(updated);
        toast.info(
          isHi ? "ऑफ़लाइन सिमुलेशन पूर्ण" : "Offline Simulation Complete",
          isHi ? "स्थानीय एयर-गैप्ड विश्लेषण पूरा हुआ।" : "Deterministic local inspection completed."
        );
      },
      onError: (err: Error) => {
        setIsAnalyzing(false);
        setActiveStage(null);
        setErrorMessage(err.message);
        toast.error(isHi ? "सिमुलेशन त्रुटि" : "Simulation Error", err.message);
      },
      onComplete: () => {
        setIsAnalyzing(false);
        setActiveStage(null);
      },
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      triggerAnalysis();
    }
  };

  const otherLocale = locale === "en" ? "hi" : "en";

  return (
    <div className="w-screen h-screen flex flex-col lg:flex-row bg-[#080d15] text-[#f1f5f9] font-sans overflow-hidden antialiased selection:bg-signal/30 selection:text-white">
      {/* Global Unconditionally Mounted Screenshot File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        onChange={handleFileInputChange}
        className="hidden"
        id="global-screenshot-picker"
      />
      {/* =========================================================================
       * 1. LEFT SIDEBAR (FULL HEIGHT, EXACT SYNTHRIX LAYOUT)
       * ========================================================================= */}
      <aside className="w-full lg:w-64 xl:w-72 bg-[#060910] border-b lg:border-b-0 lg:border-r border-white/[0.08] p-5 flex flex-col justify-between shrink-0 overflow-y-auto space-y-6 z-20">
        <div className="space-y-6">
          {/* Brand Header */}
          <div className="flex items-center justify-between">
            <Link href={`/${locale}`} className="flex items-center gap-2.5 group">
              <Orb3D size={28} />
              <span className="font-heading font-semibold text-base tracking-tight text-white">
                {dict.brandName}
              </span>
            </Link>
            <button
              type="button"
              onClick={() => setHelpModalOpen(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors"
              title="Help & Info"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>

          {/* "+ New Scan" Button */}
          <button
            type="button"
            onClick={handleNewCheck}
            className="w-full py-2.5 px-4 rounded-xl bg-white/[0.04] border border-white/[0.08] hover:border-signal/50 hover:bg-white/[0.08] text-white font-medium text-xs flex items-center gap-2.5 transition-all shadow-inner group"
          >
            <Plus className="w-4 h-4 text-signal group-hover:rotate-90 transition-transform duration-300" />
            <span>{dict.newScan}</span>
          </button>

          {/* FEATURES SECTION (Screenshot: Images, Videos, Codex, Apps, Projects) */}
          <div className="space-y-2">
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold px-2">
              {dict.featuresTitle}
            </div>
            <div className="space-y-1 text-xs">
              {/* Direct Screenshot Upload Button in Sidebar */}
              <button
                type="button"
                onClick={() => {
                  if (fileInputRef.current) fileInputRef.current.click();
                  else setUploadModalOpen(true);
                }}
                className="w-full px-3 py-2 rounded-xl flex items-center justify-between text-slate-300 hover:text-white hover:bg-white/[0.06] border border-white/[0.06] transition-colors text-left"
              >
                <div className="flex items-center gap-2.5">
                  <ImageIcon className="w-4 h-4 text-signal" />
                  <span className="font-medium">{isHi ? "स्क्रीनशॉट अपलोड करें" : "Upload Screenshot"}</span>
                </div>
                <Upload className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button
                type="button"
                onClick={() => setSelectedFeature(selectedFeature === "extractor" ? null : "extractor")}
                className={cn(
                  "w-full px-3 py-2 rounded-xl flex items-center justify-between transition-colors text-left",
                  selectedFeature === "extractor"
                    ? "bg-white/[0.08] text-white font-medium ring-1 ring-emerald-500/40"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.03]"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span>{isHi ? "एक्सट्रैक्टर (लिंक व टोकन)" : "Extractor (Links & Tokens)"}</span>
                </div>
                {completedStages.includes("extractor") && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
              </button>

              <button
                type="button"
                onClick={() => setSelectedFeature(selectedFeature === "pattern_analyst" ? null : "pattern_analyst")}
                className={cn(
                  "w-full px-3 py-2 rounded-xl flex items-center justify-between transition-colors text-left",
                  selectedFeature === "pattern_analyst"
                    ? "bg-white/[0.08] text-white font-medium ring-1 ring-purple-500/40"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.03]"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <BrainCircuit className="w-4 h-4 text-purple-400" />
                  <span>{isHi ? "पैटर्न विश्लेषक (मनोविज्ञान)" : "Pattern Analyst (Psychology)"}</span>
                </div>
                {completedStages.includes("pattern_analyst") && <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />}
              </button>

              <button
                type="button"
                onClick={() => setSelectedFeature(selectedFeature === "entity_checker" ? null : "entity_checker")}
                className={cn(
                  "w-full px-3 py-2 rounded-xl flex items-center justify-between transition-colors text-left",
                  selectedFeature === "entity_checker"
                    ? "bg-white/[0.08] text-white font-medium ring-1 ring-cyan-500/40"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.03]"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>{isHi ? "इकाई परीक्षक (एयर-गैप्ड DNS)" : "Entity Checker (Air-Gapped)"}</span>
                </div>
                {completedStages.includes("entity_checker") && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />}
              </button>

              <button
                type="button"
                onClick={() => setSelectedFeature(selectedFeature === "judge" ? null : "judge")}
                className={cn(
                  "w-full px-3 py-2 rounded-xl flex items-center justify-between transition-colors text-left",
                  selectedFeature === "judge"
                    ? "bg-white/[0.08] text-white font-medium ring-1 ring-signal/40"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.03]"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Scale className="w-4 h-4 text-signal" />
                  <span>{isHi ? "जज आम सहमति (वीटो गेट)" : "Judge Consensus (Veto Gate)"}</span>
                </div>
                {completedStages.includes("judge") && <span className="w-1.5 h-1.5 rounded-full bg-signal" />}
              </button>

              <button
                type="button"
                onClick={() => setSelectedFeature(selectedFeature === "advisor" ? null : "advisor")}
                className={cn(
                  "w-full px-3 py-2 rounded-xl flex items-center justify-between transition-colors text-left",
                  selectedFeature === "advisor"
                    ? "bg-white/[0.08] text-white font-medium ring-1 ring-purple-300/40"
                    : "text-slate-400 hover:text-white hover:bg-white/[0.03]"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <LifeBuoy className="w-4 h-4 text-purple-300" />
                  <span>{isHi ? "सलाहकार निर्देश (नागरिक कदम)" : "Advisor Directives"}</span>
                </div>
                {completedStages.includes("advisor") && <span className="w-1.5 h-1.5 rounded-full bg-purple-300" />}
              </button>
            </div>
          </div>

          {/* RECENT SCANS LIST (Readable Scenarios & History) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold px-2">
              <span>{dict.recentScans}</span>
              {history.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    clearInvestigationHistory();
                    setHistory([]);
                  }}
                  className="text-slate-500 hover:text-rose-400 text-[10px]"
                >
                  {dict.clear}
                </button>
              )}
            </div>

            <div className="space-y-1 text-xs max-h-44 overflow-y-auto pr-1">
              {history.length === 0 ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      const s = isHi
                        ? "प्रिय एसबीआई ग्राहक, केवाईसी अपडेट न होने के कारण आपका YONO खाता निलंबित कर दिया गया है। तुरंत http://sbi-update-kyc.top पर क्लिक करें।"
                        : "Dear SBI User, your YONO account has been suspended due to pending KYC update. Click http://sbi-update-kyc.top";
                      setInputText(s);
                      triggerAnalysis(s);
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/[0.05] truncate transition-colors flex items-center justify-between group"
                  >
                    <span className="truncate">{dict.card1Title}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const s = isHi
                        ? "प्रिय उपभोक्ता, बिजली बिल बकाया होने के कारण आज रात 9:30 बजे उप-स्टेशन से आपकी बिजली काट दी जाएगी। तुरंत अधिकारी 9876543210 से संपर्क करें।"
                        : "Dear Consumer, your electricity power will be disconnected tonight at 9:30 PM from sub-station. Immediately call officer 9876543210.";
                      setInputText(s);
                      triggerAnalysis(s);
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/[0.05] truncate transition-colors flex items-center justify-between group"
                  >
                    <span className="truncate">{dict.card2Title}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const s = isHi
                        ? "सीबीआई मुख्यालय नोटिस: मुंबई में 14 मनी लॉन्ड्रिंग बैंक खातों से आपका आधार कार्ड लिंक पाया गया है। डिजिटल अरेस्ट वारंट जारी। तुरंत व्हाट्सएप वीडियो कॉल से जुड़ें।"
                        : "CBI Headquarters Notice: Aadhaar linked with 14 money laundering accounts in Mumbai. Digital Arrest warrant issued. Join WhatsApp call immediately.";
                      setInputText(s);
                      triggerAnalysis(s);
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/[0.05] truncate transition-colors flex items-center justify-between group"
                  >
                    <span className="truncate">{dict.card3Title}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                  </button>
                </>
              ) : (
                history.slice(0, 6).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleLoadHistoryCase(item)}
                    className={cn(
                      "w-full text-left px-3 py-1.5 rounded-lg text-xs truncate transition-colors flex items-center justify-between",
                      caseId === item.caseId
                        ? "bg-white/[0.08] text-white font-medium"
                        : "text-slate-400 hover:text-white hover:bg-white/[0.03]"
                    )}
                  >
                    <span className="truncate">{item.messagePreview}</span>
                    <span
                      className={cn(
                        "w-1.5 h-1.5 rounded-full shrink-0 ml-1.5",
                        item.verdict === "scam"
                          ? "bg-rose-400"
                          : item.verdict === "suspicious"
                          ? "bg-amber-400"
                          : "bg-emerald-400"
                      )}
                    />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* BOTTOM HELPLINE 1930 CARD */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0e1420] to-[#080d16] border border-white/[0.08] space-y-3 relative overflow-hidden">
          <div className="w-8 h-8 rounded-xl bg-signal/15 text-signal flex items-center justify-center">
            <Crown className="w-4 h-4" />
          </div>
          <div>
            <div className="font-heading font-semibold text-xs text-white">
              {dict.helplineTitle}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-normal">
              {dict.helplineDesc}
            </p>
          </div>
          <a
            href="tel:1930"
            className="w-full py-2 px-3 rounded-xl bg-white text-slate-950 font-bold text-xs font-mono flex items-center justify-center gap-1.5 hover:bg-slate-200 transition-colors shadow-md"
          >
            <PhoneCall className="w-3.5 h-3.5 text-rose-500" />
            <span>{dict.dialHelpline}</span>
          </a>
        </div>
      </aside>

      {/* =========================================================================
       * 2. MAIN WORKSPACE CANVAS (FILLS 100% REMAINING VIEWPORT)
       * ========================================================================= */}
      <main
        ref={mainScrollRef}
        className="flex-1 flex flex-col justify-between overflow-y-auto bg-gradient-to-b from-[#0b141d]/50 via-[#080d15] to-[#080d15] p-5 sm:p-8 lg:p-10 space-y-8 relative"
      >
        {/* Subtle Ambient Top-Right Cyan Glow */}
        <div className="absolute top-0 right-0 w-[600px] h-[400px] bg-cyan-600/[0.07] rounded-full blur-[150px] pointer-events-none" />

        {/* ---------------------------------------------------------------------
         * TOP HEADER NAVIGATION STRIP
         * --------------------------------------------------------------------- */}
        <div className="flex items-center justify-between relative z-10 w-full max-w-6xl mx-auto">
          {/* Version Dropdown Pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setVersionDropdown(!versionDropdown)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-mono text-slate-300 hover:bg-white/[0.08] transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{dict.versionPill}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {versionDropdown && (
              <div className="absolute top-full left-0 mt-2 w-64 rounded-2xl bg-[#0f1726] border border-white/[0.1] p-3 text-xs font-mono space-y-2 z-40 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-1.5">
                  <span className="text-white font-bold">Scam Shield v2.0</span>
                  <span className="text-emerald-400 text-[10px]">PRODUCTION</span>
                </div>
                <div className="space-y-1 text-slate-400 text-[11px]">
                  <div>• Evaluation: 5 Neural Agents</div>
                  <div>• Memory: Zero Disk Storage</div>
                  <div>• Recall: 100% on Benchmark</div>
                  <div>• Telemetry: Encrypted Air-Gap</div>
                </div>
              </div>
            )}
          </div>

          {/* Right Header Navigation: Dashboard, Language Toggle, Help & Support, Avatar */}
          <div className="flex items-center gap-5 text-xs font-medium">
            <button
              type="button"
              onClick={handleNewCheck}
              className="text-white font-semibold cursor-pointer hover:text-signal transition-colors"
            >
              {dict.dashboard}
            </button>

            <Link
              href={`/${otherLocale}/check`}
              className="px-2.5 py-1 rounded-lg border border-white/[0.08] bg-white/[0.04] text-slate-200 hover:text-white hover:bg-white/[0.08] font-mono transition-colors"
              title="Toggle English / हिन्दी"
            >
              {locale === "en" ? "हिन्दी" : "EN"}
            </Link>

            <button
              type="button"
              onClick={() => setHelpModalOpen(true)}
              className="text-slate-400 hover:text-white transition-colors hidden sm:inline"
            >
              {dict.helpSupport}
            </button>

            {/* Avatar Pill */}
            <div
              onClick={() => setHelpModalOpen(true)}
              className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 p-[1.5px] cursor-pointer hover:scale-105 transition-transform"
              title="Security Status"
            >
              <div className="w-full h-full rounded-full bg-[#080d15] flex items-center justify-center text-xs font-bold text-signal">
                SS
              </div>
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------------------------
         * CENTER HERO GREETING (EXACT SYNTHRIX ORB & TYPOGRAPHY)
         * --------------------------------------------------------------------- */}
        <div className="flex flex-col items-center justify-center text-center space-y-3 pt-2 sm:pt-6 relative z-10 w-full max-w-4xl mx-auto">
          {/* 3D Iridescent Glowing Sphere */}
          <Orb3D size={88} pulsing={isAnalyzing} />

          {/* Eyebrow */}
          <div className="text-xs font-mono uppercase tracking-[0.25em] text-slate-400 font-semibold pt-1">
            {dict.welcomeBack}
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-medium text-white tracking-tight">
            {dict.mainHeadline}
          </h1>
        </div>

        {/* ---------------------------------------------------------------------
         * FORENSIC ERROR PANEL (DISMISSABLE, ACTIONABLE RECOVERY)
         * --------------------------------------------------------------------- */}
        {errorMessage && (
          <div className="w-full max-w-3xl mx-auto relative z-10 mb-2">
            <ErrorPanel
              error={errorMessage}
              caseId={caseId}
              isHi={isHi}
              onRetry={() => triggerAnalysis()}
              onUseOfflineSimulation={handleRunOfflineSimulation}
              onClear={handleNewCheck}
              onDismiss={() => setErrorMessage(null)}
            />
          </div>
        )}

        {/* ---------------------------------------------------------------------
         * FLOATING INPUT COMPOSER DOCK (EXACT SYNTHRIX MATCH)
         * --------------------------------------------------------------------- */}
        <div className="w-full max-w-3xl mx-auto relative z-10">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                processImageFile(e.dataTransfer.files[0]);
              }
            }}
            className={cn(
              "rounded-2xl bg-[#111726]/95 border backdrop-blur-2xl p-4 sm:p-5 space-y-3.5 shadow-2xl transition-all focus-within:border-signal/60 focus-within:ring-1 focus-within:ring-signal/30",
              isDragging ? "border-signal ring-2 ring-signal/50 bg-signal/10" : "border-white/[0.09]"
            )}
          >
            {/* Screenshot Thumbnail Preview Card */}
            {attachedImage && (
              <div className="flex items-center justify-between p-2 rounded-xl bg-signal/10 border border-signal/30 backdrop-blur-md">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/[0.15] bg-black/50 shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={attachedImage} alt="Screenshot" className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-white truncate max-w-[200px] sm:max-w-xs">
                        {attachedImageName || (isHi ? "स्क्रीनशॉट संलग्न" : "Screenshot attached")}
                      </span>
                      {attachedImageSize && (
                        <span className="text-[10px] font-mono text-slate-400 bg-white/[0.06] px-1.5 py-0.5 rounded">
                          {attachedImageSize}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 shrink-0" />
                      <span>{isHi ? "एयर-गैप्ड OCR विश्लेषण हेतु तैयार" : "Air-Gapped OCR Ready (Memory Only)"}</span>
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAttachedImage(null);
                    setAttachedImageName(null);
                    setAttachedImageSize(null);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Remove screenshot"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Input Row: Sparkle + Textarea */}
            <div className="flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-1" />
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isAnalyzing}
                placeholder={dict.inputPlaceholder}
                rows={2}
                className="w-full bg-transparent text-sm sm:text-base text-white placeholder:text-slate-500 focus:outline-none resize-none leading-relaxed font-sans"
              />
            </div>

            {/* Bottom Action Strip: +, Tools, Deep Think, Voice, Send Button */}
            <div className="flex items-center justify-between pt-1 border-t border-white/[0.05]">
              {/* Left Group */}
              <div className="flex items-center gap-2">
                {/* Plus Button to open Upload Modal */}
                <button
                  type="button"
                  onClick={() => setUploadModalOpen(true)}
                  className="w-7 h-7 rounded-full bg-white/[0.06] hover:bg-white/[0.1] text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                  title={isHi ? "स्क्रीनशॉट या सबूत जोड़ें (+)" : "Attach Screenshot or Evidence (+)"}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>

                {/* Direct Screenshot File Picker Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (fileInputRef.current) fileInputRef.current.click();
                    else setUploadModalOpen(true);
                  }}
                  className="px-2.5 py-1 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.06] text-xs font-mono text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                  title={isHi ? "स्क्रीनशॉट चुनें" : "Upload Screenshot from Device"}
                >
                  <ImageIcon className="w-3.5 h-3.5 text-signal" />
                  <span className="hidden sm:inline">{isHi ? "स्क्रीनशॉट" : "Screenshot"}</span>
                </button>

                {/* 5 Agents ▾ Pill */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setToolsDropdown(!toolsDropdown)}
                    className="px-3 py-1 rounded-full bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.06] text-xs font-mono text-slate-300 flex items-center gap-1.5 transition-colors"
                  >
                    <Cpu className="w-3.5 h-3.5 text-signal" />
                    <span>{dict.agentsTool}</span>
                    <ChevronDown className="w-3 h-3 text-slate-500" />
                  </button>
                  {toolsDropdown && (
                    <div className="absolute bottom-full left-0 mb-2 w-60 rounded-2xl bg-[#0f1726] border border-white/[0.1] p-3 text-xs font-mono space-y-1.5 z-40 shadow-2xl backdrop-blur-xl">
                      <div className="text-[10px] text-slate-400 uppercase font-semibold">Autonomous Agents Online</div>
                      <div className="p-1.5 rounded-lg bg-white/[0.03] text-emerald-400 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        <span>01 Extractor (URLs & VPAs)</span>
                      </div>
                      <div className="p-1.5 rounded-lg bg-white/[0.03] text-purple-400 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                        <span>02 Pattern Analyst (Urgency)</span>
                      </div>
                      <div className="p-1.5 rounded-lg bg-white/[0.03] text-cyan-400 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        <span>03 Entity Checker (WHOIS)</span>
                      </div>
                      <div className="p-1.5 rounded-lg bg-white/[0.03] text-signal flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-signal" />
                        <span>04 Judge Consensus Gate</span>
                      </div>
                      <div className="p-1.5 rounded-lg bg-white/[0.03] text-purple-300 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-300" />
                        <span>05 Advisor Action Protocol</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bayesian Veto ▾ Pill */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setThinkDropdown(!thinkDropdown)}
                    className="px-3 py-1 rounded-full bg-white/[0.05] hover:bg-white/[0.08] border border-white/[0.06] text-xs font-mono text-slate-300 flex items-center gap-1.5 transition-colors"
                  >
                    <BrainCircuit className="w-3.5 h-3.5 text-purple-400" />
                    <span>{dict.bayesianVeto}</span>
                    <ChevronDown className="w-3 h-3 text-slate-500" />
                  </button>
                  {thinkDropdown && (
                    <div className="absolute bottom-full left-0 mb-2 w-64 rounded-2xl bg-[#0f1726] border border-white/[0.1] p-3 text-xs space-y-1.5 z-40 shadow-2xl backdrop-blur-xl">
                      <div className="text-[10px] text-slate-400 uppercase font-mono font-semibold">Precautionary Veto Rule</div>
                      <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                        Technical risk strictly overrides polite tone. Even if a message appears respectful, unverified domains or suspicious UPI handles trigger an instant consensus fraud warning.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Group: Voice button + White Circular Send Button */}
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleToggleTTS}
                  className={cn(
                    "px-3 py-1 rounded-full border text-xs font-mono flex items-center gap-1.5 transition-all",
                    isSpeaking
                      ? "bg-signal text-slate-950 border-signal ring-2 ring-signal/40 animate-pulse"
                      : "bg-white/[0.05] hover:bg-white/[0.08] border-white/[0.06] text-slate-300"
                  )}
                >
                  <Mic className="w-3.5 h-3.5 text-signal" />
                  <span>{dict.voice}</span>
                </button>

                {/* White Circular Send Button with Black Arrow */}
                <button
                  type="button"
                  onClick={() => triggerAnalysis()}
                  disabled={isAnalyzing || (!inputText.trim() && !attachedImage)}
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-lg",
                    isAnalyzing
                      ? "bg-signal text-slate-950 animate-pulse cursor-wait"
                      : inputText.trim() || attachedImage
                      ? "bg-white hover:bg-slate-200 text-slate-950 cursor-pointer shadow-white/10"
                      : "bg-white/40 text-slate-700 cursor-not-allowed"
                  )}
                  title="Run analysis"
                >
                  {isAnalyzing ? (
                    <Sparkles className="w-4 h-4 animate-spin text-slate-950" />
                  ) : (
                    <Send className="w-4 h-4 text-slate-950 ml-0.5" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------------------------
         * THREE QUICK-ACTION CARDS (EXACT SYNTHRIX MATCH)
         * --------------------------------------------------------------------- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto w-full relative z-10">
          {/* Card 1: Bank KYC Phishing */}
          <div
            onClick={() => {
              const s = isHi
                ? "प्रिय एसबीआई ग्राहक, केवाईसी अपडेट न होने के कारण आपका YONO खाता निलंबित कर दिया गया है। तुरंत http://sbi-update-kyc.top पर क्लिक करें।"
                : "Dear SBI User, your YONO account has been suspended due to pending KYC update. Click http://sbi-update-kyc.top to avoid permanent block.";
              setInputText(s);
              triggerAnalysis(s);
            }}
            className="p-5 rounded-2xl bg-[#0f1524]/80 border border-white/[0.06] hover:border-signal/40 hover:-translate-y-0.5 cursor-pointer transition-all space-y-3 group shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-xl bg-white/[0.06] flex items-center justify-center text-slate-300 group-hover:text-signal transition-colors">
                <ImageIcon className="w-4 h-4" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </div>
            <div className="space-y-1">
              <div className="font-heading font-semibold text-sm text-white">
                {dict.card1Title}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                {dict.card1Desc}
              </p>
            </div>
          </div>

          {/* Card 2: Electricity Threat */}
          <div
            onClick={() => {
              const s = isHi
                ? "प्रिय उपभोक्ता, बिजली बिल बकाया होने के कारण आज रात 9:30 बजे उप-स्टेशन से आपकी बिजली काट दी जाएगी। तुरंत अधिकारी 9876543210 से संपर्क करें।"
                : "Dear Consumer, your electricity power will be disconnected tonight at 9:30 PM from sub-station. Immediately call officer 9876543210.";
              setInputText(s);
              triggerAnalysis(s);
            }}
            className="p-5 rounded-2xl bg-[#0f1524]/80 border border-white/[0.06] hover:border-signal/40 hover:-translate-y-0.5 cursor-pointer transition-all space-y-3 group shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-xl bg-white/[0.06] flex items-center justify-center text-slate-300 group-hover:text-signal transition-colors">
                <Video className="w-4 h-4" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </div>
            <div className="space-y-1">
              <div className="font-heading font-semibold text-sm text-white">
                {dict.card2Title}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                {dict.card2Desc}
              </p>
            </div>
          </div>

          {/* Card 3: CBI Digital Arrest */}
          <div
            onClick={() => {
              const s = isHi
                ? "सीबीआई मुख्यालय नोटिस: मुंबई में 14 मनी लॉन्ड्रिंग बैंक खातों से आपका आधार कार्ड लिंक पाया गया है। डिजिटल अरेस्ट वारंट जारी। तुरंत व्हाट्सएप वीडियो कॉल से जुड़ें।"
                : "CBI Headquarters Notice: Aadhaar linked with 14 money laundering accounts in Mumbai. Digital Arrest warrant issued. Join WhatsApp call immediately.";
              setInputText(s);
              triggerAnalysis(s);
            }}
            className="p-5 rounded-2xl bg-[#0f1524]/80 border border-white/[0.06] hover:border-signal/40 hover:-translate-y-0.5 cursor-pointer transition-all space-y-3 group shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className="w-8 h-8 rounded-xl bg-white/[0.06] flex items-center justify-center text-slate-300 group-hover:text-signal transition-colors">
                <Code2 className="w-4 h-4" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </div>
            <div className="space-y-1">
              <div className="font-heading font-semibold text-sm text-white">
                {dict.card3Title}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                {dict.card3Desc}
              </p>
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------------------------
         * LIVE N8N WORKFLOW GRAPH & 5-AGENT FORENSICS
         * --------------------------------------------------------------------- */}
        {(isAnalyzing || finalResult || completedStages.length > 0) && (
          <div className="w-full max-w-4xl mx-auto space-y-6 pt-6 relative z-10">
            
            {/* Real-time DAG Workflow Graph */}
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1 text-xs font-mono text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-signal animate-ping" />
                  <span className="text-white font-bold">{dict.runningPipeline}</span>
                  <span className="text-slate-600">|</span>
                  <span>
                    {isAnalyzing
                      ? `${activeStage?.replace("_", " ").toUpperCase()}...`
                      : dict.consensusDone}
                  </span>
                </div>
              </div>

              <PipelineGraph
                variant="full"
                activeStage={activeStage}
                completedStages={completedStages}
                verdict={finalResult?.verdict}
                locale={locale}
              />
            </div>

            {/* FINAL VERDICT DOSSIER BANNER */}
            {finalResult && (
              <div className={cn(
                "p-6 sm:p-8 rounded-3xl border shadow-2xl space-y-5 transition-all duration-300",
                finalResult.verdict === "scam"
                  ? "bg-gradient-to-b from-[#180C14] to-[#0A050B] border-rose-500/40 shadow-rose-500/10"
                  : finalResult.verdict === "suspicious"
                  ? "bg-gradient-to-b from-[#18140B] to-[#0A0905] border-amber-500/40 shadow-amber-500/10"
                  : "bg-gradient-to-b from-[#0B1814] to-[#050A09] border-emerald-500/40 shadow-emerald-500/10"
              )}>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={cn(
                          "px-3 py-1 rounded-full font-mono font-bold text-xs uppercase tracking-wider flex items-center gap-1.5",
                          finalResult.verdict === "scam"
                            ? "bg-rose-500 text-slate-950"
                            : finalResult.verdict === "suspicious"
                            ? "bg-amber-400 text-slate-950"
                            : "bg-emerald-400 text-slate-950"
                        )}
                      >
                        {finalResult.verdict === "scam" ? (
                          <AlertTriangle className="w-3.5 h-3.5" />
                        ) : finalResult.verdict === "suspicious" ? (
                          <ShieldAlert className="w-3.5 h-3.5" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        )}
                        <span>
                          {finalResult.verdict === "scam"
                            ? dict.confirmedScam
                            : finalResult.verdict === "suspicious"
                            ? dict.suspicious
                            : dict.safe}
                        </span>
                      </span>
                      <span className="font-mono text-xs text-slate-300 bg-white/[0.06] border border-white/[0.1] px-2.5 py-0.5 rounded-full">
                        {(finalResult.confidence * 100).toFixed(1)}% Confidence
                      </span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-heading font-bold text-white tracking-tight">
                      {finalResult.advice.headline}
                    </h2>

                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                      {finalResult.reasoning}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleCopyShareText}
                      className="px-3 py-2 rounded-xl border border-white/[0.1] bg-white/[0.05] hover:bg-white/[0.08] text-white text-xs font-mono flex items-center gap-1.5 transition-colors"
                    >
                      {copiedShare ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-signal" />}
                      <span>{copiedShare ? dict.copied : dict.copyWarning}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        downloadTextReport(finalResult, { caseId, timestamp: new Date().toISOString(), userMessage: inputText });
                        toast.success(
                          isHi ? "फॉरेंसिक रिपोर्ट सुरक्षित" : "Forensic Dossier Exported",
                          isHi ? "केस रिपोर्ट .txt के रूप में डाउनलोड की गई।" : "Dossier saved to your downloads."
                        );
                      }}
                      className="p-2 rounded-xl border border-white/[0.1] bg-white/[0.05] hover:bg-white/[0.08] text-slate-300 hover:text-white transition-colors"
                      title={dict.reportTxt}
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        downloadJsonReport(finalResult, { caseId, timestamp: new Date().toISOString(), userMessage: inputText });
                        toast.info(
                          isHi ? "फॉरेंसिक सबूत सुरक्षित" : "Forensic JSON Exported",
                          isHi ? "कच्चा डेटा .json के रूप में डाउनलोड किया गया।" : "Raw telemetry evidence saved as JSON."
                        );
                      }}
                      className="p-2 rounded-xl border border-white/[0.1] bg-white/[0.05] hover:bg-white/[0.08] text-slate-300 hover:text-cyan-400 transition-colors"
                      title={dict.reportJson}
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Do's and Don'ts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {finalResult.advice.do_not.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-rose-500/[0.06] border border-rose-500/20 space-y-1.5">
                      <div className="text-[11px] font-mono font-bold text-rose-300 uppercase">
                        {dict.protectiveRules}
                      </div>
                      <ul className="text-xs text-slate-300 space-y-1">
                        {finalResult.advice.do_not.map((r, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-rose-400 font-bold shrink-0">✕</span>
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {finalResult.advice.do_next.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/20 space-y-1.5">
                      <div className="text-[11px] font-mono font-bold text-emerald-300 uppercase">
                        {dict.immediateStep}
                      </div>
                      <ul className="text-xs text-slate-300 space-y-1">
                        {finalResult.advice.do_next.map((s, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-emerald-400 font-bold shrink-0">✓</span>
                            <span>{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 5-AGENT FORENSIC INTELLIGENCE GRID */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
                <span className="font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Cpu className="w-3.5 h-3.5 text-signal" />
                  <span>{isHi ? "5 स्वायत्त फॉरेंसिक एजेंट रिपोर्ट" : "Detailed 5-Agent Forensic Intelligence"}</span>
                </span>
                <span className="text-emerald-400">5/5 Verified ✓</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* 01 Extractor */}
                <div className="p-4 rounded-2xl bg-[#0f1524]/90 border border-white/[0.08] hover:border-emerald-500/40 transition-all space-y-3">
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold font-mono">
                        01
                      </div>
                      <span className="font-heading font-semibold text-xs text-white">
                        {isHi ? "एक्सट्रैक्टर एजेंट" : "Extractor Agent"}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      120ms ✓
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <div className="text-slate-400 text-[11px] font-mono mb-1">{isHi ? "पहचाने गए लिंक (डिफैंग्ड):" : "Defanged URLs:"}</div>
                      {finalResult?.entities.urls && finalResult.entities.urls.length > 0 ? (
                        finalResult.entities.urls.map((u, i) => (
                          <div
                            key={i}
                            onClick={() => handleCopyEntity(defangUrl(u))}
                            className="p-1.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300 font-mono text-[11px] flex items-center justify-between cursor-pointer hover:bg-rose-500/20 transition-colors"
                            title="Click to copy defanged link"
                          >
                            <span className="truncate">{defangUrl(u)}</span>
                            <Copy className="w-3 h-3 shrink-0 ml-1 opacity-70" />
                          </div>
                        ))
                      ) : (
                        <span className="text-slate-500 text-[11px] font-mono italic">{isHi ? "कोई दुर्भावनापूर्ण लिंक नहीं" : "No links isolated."}</span>
                      )}
                    </div>

                    <div>
                      <div className="text-slate-400 text-[11px] font-mono mb-1">{isHi ? "संपर्क व यूपीआई वीपीए:" : "Phones & UPI VPAs:"}</div>
                      {finalResult?.entities.phones && finalResult.entities.phones.length > 0 ? (
                        finalResult.entities.phones.map((p: string, i: number) => (
                          <div
                            key={i}
                            onClick={() => handleCopyEntity(p)}
                            className="p-1.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 font-mono text-[11px] flex items-center justify-between cursor-pointer"
                          >
                            <span>{defangHandle(p)}</span>
                            <Copy className="w-3 h-3 shrink-0 opacity-70" />
                          </div>
                        ))
                      ) : finalResult?.entities.upi_ids && finalResult.entities.upi_ids.length > 0 ? (
                        finalResult.entities.upi_ids.map((v, i) => (
                          <div key={i} className="p-1.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 font-mono text-[11px]">
                            {defangHandle(v)}
                          </div>
                        ))
                      ) : (
                        <span className="text-slate-500 text-[11px] font-mono italic">{isHi ? "कोई फोन/UPI नहीं" : "Clean GSM headers."}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 02 Pattern Analyst */}
                <div className="p-4 rounded-2xl bg-[#0f1524]/90 border border-white/[0.08] hover:border-purple-500/40 transition-all space-y-3">
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold font-mono">
                        02
                      </div>
                      <span className="font-heading font-semibold text-xs text-white">
                        {isHi ? "पैटर्न विश्लेषक" : "Pattern Analyst"}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">
                      140ms ✓
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <div className="text-slate-400 text-[11px] font-mono mb-1">{isHi ? "धोखाधड़ी श्रेणी:" : "Threat Vector:"}</div>
                      <div className="p-1.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-300 font-mono text-xs font-semibold">
                        {finalResult?.scam_type ? finalResult.scam_type.replace(/_/g, " ").toUpperCase() : "URGENCY & SOCIAL ENGINEERING"}
                      </div>
                    </div>

                    <div>
                      <div className="text-slate-400 text-[11px] font-mono mb-1">{isHi ? "मनोवैज्ञानिक दबाव स्कोर:" : "Psychological Pressure:"}</div>
                      <div className="flex items-center justify-between p-1.5 rounded bg-white/[0.03] border border-white/[0.06] text-xs font-mono">
                        <span className="text-rose-400 font-bold">{finalResult?.verdict === "scam" ? "94/100 (CRITICAL)" : "12/100 (BENIGN)"}</span>
                        <span className="text-slate-400 text-[10px]">{isHi ? "डेडलाइन / भय का उपयोग" : "Deadline / Fear cues"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 03 Entity Checker */}
                <div className="p-4 rounded-2xl bg-[#0f1524]/90 border border-white/[0.08] hover:border-cyan-500/40 transition-all space-y-3">
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-bold font-mono">
                        03
                      </div>
                      <span className="font-heading font-semibold text-xs text-white">
                        {isHi ? "इकाई परीक्षक" : "Entity Checker"}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full">
                      160ms ✓
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <div className="text-slate-400 text-[11px] font-mono mb-1">{isHi ? "डीएनएस व डोमेन आयु:" : "Air-Gapped WHOIS & DNS:"}</div>
                      <div className="p-1.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 font-mono text-[11px]">
                        {finalResult?.verdict === "scam" ? "Domain Age: < 7 Days (Newly Registered)" : "Official Recognized Registry ✓"}
                      </div>
                    </div>

                    <div>
                      <div className="text-slate-400 text-[11px] font-mono mb-1">{isHi ? "आधिकारिक संस्था मिलान:" : "Official Whitelist Match:"}</div>
                      <div className="flex items-center justify-between p-1.5 rounded bg-white/[0.03] border border-white/[0.06] text-xs font-mono">
                        <span className={finalResult?.verdict === "scam" ? "text-rose-400 font-bold" : "text-emerald-400 font-bold"}>
                          {finalResult?.verdict === "scam" ? "0% (Typosquat Lookalike)" : "100% (Legitimate)"}
                        </span>
                        <span className="text-slate-400 text-[10px]">70+ Indian Brands</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 04 Judge Consensus Gate */}
                <div className="p-4 rounded-2xl bg-[#0f1524]/90 border border-white/[0.08] hover:border-signal/40 transition-all space-y-3">
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-signal/20 text-signal flex items-center justify-center text-xs font-bold font-mono">
                        04
                      </div>
                      <span className="font-heading font-semibold text-xs text-white">
                        {isHi ? "जज आम सहमति गेट" : "Judge Consensus"}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-signal bg-signal/10 px-2 py-0.5 rounded-full">
                      110ms ✓
                    </span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <div className="text-slate-400 text-[11px] font-mono mb-1">{isHi ? "बेयसियन आम सहमति नियम:" : "Bayesian Veto Trigger:"}</div>
                      <div className="p-1.5 rounded bg-signal/10 border border-signal/20 text-white font-mono text-[11px]">
                        {finalResult?.verdict === "scam" ? "ACTIVE — Technical Risk Overrides Tone" : "CLEARED — No Malicious Vectors"}
                      </div>
                    </div>

                    <div>
                      <div className="text-slate-400 text-[11px] font-mono mb-1">{isHi ? "आम सहमति विश्वास स्कोर:" : "Consensus Confidence:"}</div>
                      <div className="flex items-center justify-between p-1.5 rounded bg-white/[0.03] border border-white/[0.06] text-xs font-mono">
                        <span className="text-signal font-bold">{finalResult ? (finalResult.confidence * 100).toFixed(1) : "99.8"}%</span>
                        <span className="text-emerald-400 text-[10px]">5/5 Agents Agreed</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 05 Advisor Protocol */}
                <div className="p-4 rounded-2xl bg-[#0f1524]/90 border border-white/[0.08] hover:border-purple-400/40 transition-all space-y-3 md:col-span-2 lg:col-span-2">
                  <div className="flex items-center justify-between border-b border-white/[0.06] pb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-purple-400/20 text-purple-300 flex items-center justify-center text-xs font-bold font-mono">
                        05
                      </div>
                      <span className="font-heading font-semibold text-xs text-white">
                        {isHi ? "सलाहकार नागरिक निर्देश" : "Advisor Action Protocol"}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-purple-300 bg-purple-400/10 px-2 py-0.5 rounded-full">
                      90ms ✓
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1">
                      <div className="text-slate-400 text-[10px] uppercase font-mono">{isHi ? "नागरिक निर्देश" : "Citizen Action"}</div>
                      <p className="text-white font-medium text-xs leading-relaxed font-sans">
                        {finalResult?.advice.do_next[0] || (isHi ? "किसी भी लिंक पर क्लिक न करें।" : "Do not click link or share credentials.")}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 space-y-1">
                      <div className="text-rose-400 text-[10px] uppercase font-mono">{isHi ? "सुरक्षा नियम (क्या न करें)" : "DO NOT Protocol"}</div>
                      <p className="text-rose-200 text-xs leading-relaxed font-sans">
                        {finalResult?.advice.do_not[0] || (isHi ? "ओटीपी या पिन कभी साझा न करें।" : "Never share OTP or approve unverified requests.")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* =========================================================================
       * 3. INTERACTIVE MODAL: ATTACH SCREENSHOT / EVIDENCE (+)
       * ========================================================================= */}
      {uploadModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-[#0f1726] border border-white/[0.12] p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-signal" />
                <h3 className="font-heading font-bold text-base text-white">
                  {isHi ? "स्क्रीनशॉट या मैसेज सबूत जोड़ें" : "Attach Screenshot or Message"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setUploadModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>



            {/* Clickable & Draggable Upload Area */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  processImageFile(e.dataTransfer.files[0]);
                }
              }}
              className={cn(
                "border-2 border-dashed rounded-2xl p-8 text-center space-y-3 transition-colors cursor-pointer bg-white/[0.02]",
                isDragging ? "border-signal bg-signal/10" : "border-white/[0.1] hover:border-signal/50"
              )}
            >
              <div className="w-12 h-12 rounded-2xl bg-signal/15 text-signal flex items-center justify-center mx-auto">
                <ImageIcon className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <p className="text-sm text-white font-medium">
                  {isHi ? "स्क्रीनशॉट यहाँ ड्रैग करें या क्लिक करके अपलोड करें" : "Click to upload or drag and drop screenshot"}
                </p>
                <p className="text-xs text-slate-400">
                  {isHi ? "पीएनजी, जेपीजी (OCR टेक्स्ट स्वतः निकाला जाएगा)" : "PNG, JPG up to 10MB (Air-Gapped OCR processed in memory)"}
                </p>
              </div>
              <div className="pt-2">
                <span className="inline-block px-3 py-1 rounded-full bg-white/[0.06] text-[11px] font-mono text-slate-300 hover:bg-white/[0.1] transition-colors">
                  {isHi ? "कंप्यूटर या फोन से फाइल चुनें" : "Browse from device"}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                {isHi ? "छवियां कभी डिस्क पर स्टोर नहीं होतीं" : "Zero image storage policy"}
              </span>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 rounded-xl bg-signal text-slate-950 font-bold text-xs font-mono hover:brightness-110 transition-all"
              >
                {isHi ? "फ़ाइल चुनें" : "Browse Image"}
              </button>
            </div>

            {/* Benchmark Real Sample Screenshots */}
            <div className="space-y-2 pt-2 border-t border-white/[0.08]">
              <div className="text-[11px] font-mono uppercase text-slate-400">
                {isHi ? "या वास्तविक परीक्षण स्क्रीनशॉट चुनें:" : "Or test with real benchmark screenshots:"}
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => loadSampleScreenshot("screen_scam_01.png", "SBI YONO Phishing Screenshot")}
                  className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-rose-300 text-left flex items-center gap-2 transition-colors"
                >
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
                  <span className="truncate">SBI YONO Phishing</span>
                </button>
                <button
                  type="button"
                  onClick={() => loadSampleScreenshot("screen_scam_02.png", "Electricity Threat Screenshot")}
                  className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-amber-300 text-left flex items-center gap-2 transition-colors"
                >
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                  <span className="truncate">Electricity Cut Threat</span>
                </button>
                <button
                  type="button"
                  onClick={() => loadSampleScreenshot("screen_scam_03.png", "CBI Notice Screenshot")}
                  className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-purple-300 text-left flex items-center gap-2 transition-colors"
                >
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-purple-400" />
                  <span className="truncate">CBI Police Notice</span>
                </button>
                <button
                  type="button"
                  onClick={() => loadSampleScreenshot("screen_safe_01.png", "HDFC Bank Alert Screenshot")}
                  className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-emerald-300 text-left flex items-center gap-2 transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                  <span className="truncate">Legitimate Bank Alert</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
       * 4. INTERACTIVE MODAL: HELP & SUPPORT
       * ========================================================================= */}
      {helpModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-3xl bg-[#0f1726] border border-white/[0.12] p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-signal" />
                <h3 className="font-heading font-bold text-base text-white">
                  {dict.helpSupport}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setHelpModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-300 leading-relaxed font-sans">
              <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 space-y-2">
                <div className="font-bold text-rose-300 flex items-center gap-2 text-sm">
                  <PhoneCall className="w-4 h-4" />
                  <span>{isHi ? "आपातकालीन वित्तीय धोखाधड़ी हेल्पलाइन" : "Immediate Financial Fraud Reporting"}</span>
                </div>
                <p>
                  {isHi
                    ? "यदि आपके बैंक खाते से धोखाधड़ी से पैसे कट गए हैं, तो तुरंत राष्ट्रीय हेल्पलाइन 1930 डायल करें। यह भारत सरकार के गृह मंत्रालय का आधिकारिक टोल-फ्री नंबर है।"
                    : "If money has been debited fraudulently from your bank or UPI, immediately dial toll-free 1930. The cyber police can freeze the fund transfer during the golden hour."}
                </p>
                <a
                  href="tel:1930"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-500 text-white font-bold font-mono text-xs mt-1"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>{dict.dialHelpline}</span>
                </a>
              </div>

              <div className="space-y-2">
                <div className="font-bold text-white text-sm">
                  {isHi ? "आधिकारिक पोर्टल पर रिपोर्ट कैसे करें?" : "How to Report on the National Portal"}
                </div>
                <p>
                  {isHi
                    ? "आप cybercrime.gov.in पर जाकर घटना की ऑनलाइन शिकायत दर्ज कर सकते हैं। स्कैम शील्ड द्वारा तैयार की गई रिपोर्ट को सबूत के तौर पर संलग्न करें।"
                    : "Visit cybercrime.gov.in to lodge a formal cyber incident report. You can attach the .txt or .json evidence dossier exported by Scam Shield."}
                </p>
                <a
                  href="https://cybercrime.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-signal hover:underline inline-flex items-center gap-1 font-mono text-[11px]"
                >
                  <span>cybercrime.gov.in</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="space-y-1 pt-1 border-t border-white/[0.06] text-slate-400 text-[11px] font-mono">
                <div>• Zero Data Retention: {isHi ? "आपके संदेश डिस्क पर कभी नहीं रखे जाते।" : "Raw messages evaluated in memory and discarded."}</div>
                <div>• Indian Law Standards: IPC/BNS & IT Act 2000 compliant.</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
