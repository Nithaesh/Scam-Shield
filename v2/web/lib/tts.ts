/**
 * Text-to-Speech (TTS) helper using the Web Speech API.
 * Supports Hindi (hi-IN) and Indian English (en-IN) voices with clean start/stop callbacks.
 */

export interface TTSState {
  isPlaying: boolean;
  isSupported: boolean;
}

class TTSService {
  private utterance: SpeechSynthesisUtterance | null = null;
  private isSpeaking = false;
  private onStateChange: ((speaking: boolean) => void) | null = null;

  public isSupported(): boolean {
    return typeof window !== "undefined" && "speechSynthesis" in window;
  }

  public speak(
    text: string,
    locale: "en" | "hi" = "en",
    onStatusChange?: (speaking: boolean) => void
  ): boolean {
    if (!this.isSupported()) return false;

    this.stop();
    this.onStateChange = onStatusChange || null;

    const synth = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    this.utterance = utterance;

    // Pick appropriate voice
    const voices = synth.getVoices();
    const targetLang = locale === "hi" ? "hi-IN" : "en-IN";
    const selectedVoice =
      voices.find((v) => v.lang === targetLang) ||
      voices.find((v) => v.lang.startsWith(locale)) ||
      null;

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    utterance.lang = targetLang;
    utterance.rate = 0.95; // Slightly slower for clear citizen comprehension
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      this.isSpeaking = true;
      this.onStateChange?.(true);
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.onStateChange?.(false);
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      this.onStateChange?.(false);
    };

    synth.speak(utterance);
    return true;
  }

  public stop(): void {
    if (this.isSupported()) {
      window.speechSynthesis.cancel();
      this.isSpeaking = false;
      this.onStateChange?.(false);
    }
  }

  public toggle(
    text: string,
    locale: "en" | "hi" = "en",
    onStatusChange?: (speaking: boolean) => void
  ): boolean {
    if (this.isSpeaking) {
      this.stop();
      return false;
    } else {
      return this.speak(text, locale, onStatusChange);
    }
  }
}

export const tts = new TTSService();
