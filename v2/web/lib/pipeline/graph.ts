/**
 * Pipeline Graph topology, agent metadata, and SVG cubic bezier math.
 */

export interface AgentNodeMeta {
  id: string;
  name: string;
  nameHi: string;
  role: string;
  roleHi: string;
  tools: string[];
  systemRole: string;
  description: string;
  iconName: string;
  stageKey?: "extractor" | "pattern_analyst" | "entity_checker" | "judge" | "advisor";
}

export const PIPELINE_NODES: AgentNodeMeta[] = [
  {
    id: "message",
    name: "Suspicious Input",
    nameHi: "संदेहास्पद संदेश",
    role: "Raw Evidence",
    roleHi: "कच्चा साक्ष्य",
    tools: ["Text Sanitizer", "OCR Reader"],
    systemRole: "Citizen submitted SMS, WhatsApp, UPI collect request, or screenshot.",
    description: "Accepts raw input in English or Hindi, sanitizes encoding, extracts high-res image text if screenshot.",
    iconName: "MessageSquare",
  },
  {
    id: "extractor",
    name: "Extractor",
    nameHi: "एक्स्ट्रैक्टर",
    role: "Entity Extraction",
    roleHi: "तथ्य निष्कर्षण",
    tools: ["Regex Scanner", "URL Defanger", "Phone Normalizer", "VPA Checker"],
    systemRole: "You extract structured entities: URLs, phone numbers, sender masks, amounts, and UPI IDs without altering raw context.",
    description: "Locates high-risk indicators like shortened domains, Indian mobile numbers (+91), urgency keywords, and banking VPAs.",
    stageKey: "extractor",
    iconName: "Search",
  },
  {
    id: "pattern_analyst",
    name: "Pattern Analyst",
    nameHi: "पैटर्न विश्लेषक",
    role: "Linguistic & Psychological",
    roleHi: "मनोवैज्ञानिक विश्लेषण",
    tools: ["Urgency Scorer", "Threat Classifier", "Social Engineering Matrix"],
    systemRole: "You evaluate emotional manipulation, time pressure threats (electricity cut, KYC expiry), and impersonation templates.",
    description: "Evaluates psychological triggers: artificial panic, authority impersonation (police, CBI, RBI), and reward bait.",
    stageKey: "pattern_analyst",
    iconName: "BrainCircuit",
  },
  {
    id: "entity_checker",
    name: "Entity Checker",
    nameHi: "पहचान सत्यापक",
    role: "Technical Forensics",
    roleHi: "तकनीकी जांच",
    tools: ["WHOIS Domain Age", "DNS Lookups", "UPI Gateway Verification", "Gov / Bank Allowlist"],
    systemRole: "You perform deterministic forensic checks against authoritative registries, brand lookalikes, and known phishing hosts.",
    description: "Runs technical forensics in parallel with Pattern Analyst. Flags newly registered domains (<30 days) and private phone numbers claiming to be nationalized banks.",
    stageKey: "entity_checker",
    iconName: "ShieldCheck",
  },
  {
    id: "judge",
    name: "Judge",
    nameHi: "निर्णायक",
    role: "Consensus & Conflict Resolution",
    roleHi: "सहमति और निर्णय",
    tools: ["Bayesian Fusion", "Consensus Gate", "Confidence Calibrator"],
    systemRole: "You weigh psychological indicators against technical forensics. When Analyst and Checker disagree, apply strict precautionary safety rules.",
    description: "Aggregates evidence from Extractor, Analyst, and Checker. Enforces citizen protection: technical risk always vetoes linguistic innocence.",
    stageKey: "judge",
    iconName: "Scale",
  },
  {
    id: "advisor",
    name: "Advisor",
    nameHi: "सलाहकार",
    role: "Plain Citizen Guidance",
    roleHi: "नागरिक मार्गदर्शन",
    tools: ["Citizen Language Translator", "Action Step Compiler", "1930 Helpline Router"],
    systemRole: "You formulate plain-language instructions: exactly what NOT to do, what to do next, and how to report immediately.",
    description: "Translates technical verdicts into simple, panic-free action steps in English or Hindi with direct 1930 / cybercrime.gov.in links.",
    stageKey: "advisor",
    iconName: "LifeBuoy",
  },
  {
    id: "verdict",
    name: "Verdict Stamp",
    nameHi: "अंतिम निर्णय",
    role: "Final Decision",
    roleHi: "स्पष्ट फैसला",
    tools: ["Cryptographic Case ID", "Citizen Report Generator"],
    systemRole: "Safe, Suspicious, or Scam verdict with calibrated confidence score and one clear action.",
    description: "Deterministic verdict output presented with clear WCAG AA color badge, confidence ring, and one-tap share warning.",
    iconName: "Stamp",
  },
];

/**
 * Calculates a smooth cubic bezier SVG path between two points.
 */
export function getCubicBezierPath(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  curvature: number = 0.5
): string {
  const dx = x2 - x1;
  const cx1 = x1 + dx * curvature;
  const cy1 = y1;
  const cx2 = x2 - dx * curvature;
  const cy2 = y2;
  return `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;
}
