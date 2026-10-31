import { z } from "zod";

export const StageStartSchema = z.object({
  v: z.literal(1),
  request_id: z.string(),
  stage: z.enum(["extractor", "pattern_analyst", "entity_checker", "judge", "advisor"]),
});
export type StageStartEvent = z.infer<typeof StageStartSchema>;

export const StageResultSchema = z.object({
  v: z.literal(1),
  request_id: z.string(),
  stage: z.enum(["extractor", "pattern_analyst", "entity_checker", "judge", "advisor"]),
  status: z.string(),
  output: z.record(z.any()).default({}),
  duration_ms: z.number().default(0),
  cached: z.boolean().default(false),
  llm_provider: z.string().optional(),
  tools_used: z.array(z.string()).default([]),
});
export type StageResultEvent = z.infer<typeof StageResultSchema>;

export const ConflictPayloadSchema = z.object({
  winner: z.string(),
  resolution: z.string(),
  confidence_delta: z.number().default(0),
});
export type ConflictPayload = z.infer<typeof ConflictPayloadSchema>;

export const AdvicePayloadSchema = z.object({
  headline: z.string(),
  summary: z.string().default(""),
  do_not: z.array(z.string()).default([]),
  do_next: z.array(z.string()).default([]),
  report_to: z.array(z.string()).default([]),
});
export type AdvicePayload = z.infer<typeof AdvicePayloadSchema>;

export const CommunityMatchSchema = z.object({
  entity_type: z.string(),
  entity_masked: z.string(),
  report_count: z.number().default(1),
  scam_type: z.string().default("unknown"),
});
export type CommunityMatch = z.infer<typeof CommunityMatchSchema>;

export const FinalResultSchema = z.object({
  v: z.literal(1),
  request_id: z.string(),
  verdict: z.enum(["safe", "suspicious", "scam"]),
  confidence: z.number().min(0).max(1),
  scam_type: z.string(),
  reasoning: z.string(),
  conflict: ConflictPayloadSchema.nullable().optional(),
  advice: AdvicePayloadSchema,
  share_text: z.string(),
  language: z.string().default("en"),
  entities: z.object({
    urls: z.array(z.string()).default([]),
    phones: z.array(z.string()).default([]),
    upi_ids: z.array(z.string()).default([]),
    sender: z.string().nullable().optional(),
  }),
  community: z.object({
    matches: z.array(CommunityMatchSchema).default([]),
  }),
  total_ms: z.number().default(0),
  cached: z.boolean().default(false),
});
export type FinalResultEvent = z.infer<typeof FinalResultSchema>;
