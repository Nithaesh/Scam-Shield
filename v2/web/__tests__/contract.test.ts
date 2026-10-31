import { describe, it, expect } from "vitest";
import { 
  FinalResultSchema, 
  StageStartSchema, 
  StageResultSchema, 
  ConflictPayloadSchema 
} from "../lib/api/contract";
import { MOCK_SCAM_RESULT, MOCK_SAFE_RESULT } from "../lib/mock/stream_fixtures";

describe("Scam Shield v2 Frontend Contract Conformance", () => {
  it("validates StageStart event schema", () => {
    const raw = {
      v: 1,
      request_id: "req-123",
      stage: "extractor",
    };
    const parsed = StageStartSchema.parse(raw);
    expect(parsed.stage).toBe("extractor");
  });

  it("validates StageResult event schema", () => {
    const raw = {
      v: 1,
      request_id: "req-123",
      stage: "entity_checker",
      status: "done",
      output: { risk: "high" },
      duration_ms: 45.2,
      cached: false,
      tools_used: ["whois", "domain_checker"],
    };
    const parsed = StageResultSchema.parse(raw);
    expect(parsed.status).toBe("done");
    expect(parsed.tools_used).toContain("whois");
  });

  it("validates mock scam result complies with FinalResultSchema", () => {
    const parsed = FinalResultSchema.parse(MOCK_SCAM_RESULT);
    expect(parsed.verdict).toBe("scam");
    expect(parsed.confidence).toBeGreaterThan(0.9);
    expect(parsed.share_text).toContain("1930");
    expect(parsed.advice.do_not.length).toBeGreaterThan(0);
  });

  it("validates mock safe result complies with FinalResultSchema", () => {
    const parsed = FinalResultSchema.parse(MOCK_SAFE_RESULT);
    expect(parsed.verdict).toBe("safe");
    expect(parsed.cached).toBe(true);
  });

  it("validates conflict payload schema if evidence diverges", () => {
    const rawConflict = {
      winner: "entity_checker",
      resolution: "Technical risk overrides behavioral pattern score.",
      confidence_delta: 0.15,
    };
    const parsed = ConflictPayloadSchema.parse(rawConflict);
    expect(parsed.winner).toBe("entity_checker");
  });
});
