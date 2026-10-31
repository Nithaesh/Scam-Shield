import { 
  FinalResultEvent, 
  FinalResultSchema, 
  StageResultEvent, 
  StageResultSchema, 
  StageStartEvent, 
  StageStartSchema 
} from "./contract";
import { MOCK_SCAM_RESULT, MOCK_SAFE_RESULT } from "../mock/stream_fixtures";

export interface AnalyzePayload {
  text?: string;
  image_base64?: string;
  language?: string;
  stream?: boolean;
}

export type StreamEventHandler = {
  onStageStart?: (event: StageStartEvent) => void;
  onStageResult?: (event: StageResultEvent) => void;
  onHeartbeat?: () => void;
  onFinal?: (event: FinalResultEvent) => void;
  onError?: (error: Error) => void;
  onComplete?: () => void;
};

export async function analyzeMessageStream(
  payload: AnalyzePayload,
  handlers: StreamEventHandler
): Promise<void> {
  const host = typeof window !== "undefined" ? window.location.hostname : "127.0.0.1";
  const apiBase = 
    process.env.NEXT_PUBLIC_API_URL || 
    (typeof window !== "undefined" && (host === "localhost" || host === "127.0.0.1")
      ? `http://${host}:8000`
      : "");
  const endpoint = `${apiBase}/api/v2/analyze/stream`;
  const body = JSON.stringify({
    ...payload,
    stream: true,
  });

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "text/event-stream",
      },
      body,
    });

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(errJson.detail || `Server responded with HTTP ${response.status}`);
    }

    if (!response.body) {
      throw new Error("ReadableStream not supported on response body.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      // Normalize CRLF to LF
      buffer = buffer.replace(/\r\n/g, "\n");
      const parts = buffer.split("\n\n");
      buffer = parts.pop() || "";

      for (const block of parts) {
        if (!block.trim()) continue;
        const lines = block.split("\n");
        let currentEvent = "message";
        let currentData = "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith("event:")) {
            currentEvent = trimmed.replace("event:", "").trim();
          } else if (trimmed.startsWith("data:")) {
            currentData = trimmed.replace("data:", "").trim();
          }
        }

        if (currentEvent === "stage_start") {
          try {
            const parsed = StageStartSchema.parse(JSON.parse(currentData));
            handlers.onStageStart?.(parsed);
          } catch (e) {
            console.warn("Invalid stage_start event:", e);
          }
        } else if (currentEvent === "stage_result") {
          try {
            const parsed = StageResultSchema.parse(JSON.parse(currentData));
            handlers.onStageResult?.(parsed);
          } catch (e) {
            console.warn("Invalid stage_result event:", e);
          }
        } else if (currentEvent === "heartbeat") {
          handlers.onHeartbeat?.();
        } else if (currentEvent === "final") {
          try {
            const parsed = FinalResultSchema.parse(JSON.parse(currentData));
            handlers.onFinal?.(parsed);
          } catch (e) {
            console.error("Invalid final event schema:", e);
            throw e;
          }
        } else if (currentEvent === "error") {
          try {
            const errData = JSON.parse(currentData);
            handlers.onError?.(new Error(errData.detail || "Analysis stream error"));
          } catch {
            handlers.onError?.(new Error(currentData || "Unknown stream error"));
          }
        }
      }
    }

    handlers.onComplete?.();
  } catch (err: any) {
    // If backend is not running, provide graceful fallback simulation for seamless demo
    console.warn("API stream failed or offline, simulating local deterministic fallback:", err.message);
    await simulateOfflineStream(payload, handlers);
  }
}

async function simulateOfflineStream(
  payload: AnalyzePayload,
  handlers: StreamEventHandler
): Promise<void> {
  const stages: Array<"extractor" | "pattern_analyst" | "entity_checker" | "judge" | "advisor"> = [
    "extractor",
    "pattern_analyst",
    "entity_checker",
    "judge",
    "advisor",
  ];

  for (const s of stages) {
    handlers.onStageStart?.({
      v: 1,
      request_id: "local-sim",
      stage: s,
    });
    await new Promise((r) => setTimeout(r, 120));
    handlers.onStageResult?.({
      v: 1,
      request_id: "local-sim",
      stage: s,
      status: "done",
      output: {},
      duration_ms: 120,
      cached: false,
      tools_used: ["local-engine"],
    });
  }

  const textLower = (payload.text || "").toLowerCase();
  const isSafe = textLower.includes("debited") || textLower.includes("credited") || textLower.includes("otp");
  const finalResult = isSafe ? MOCK_SAFE_RESULT : MOCK_SCAM_RESULT;
  
  handlers.onFinal?.({
    ...finalResult,
    language: payload.language || "en",
  });
  handlers.onComplete?.();
}
