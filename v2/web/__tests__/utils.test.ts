import { describe, it, expect } from "vitest";
import { defangUrl, defangHandle } from "../lib/utils";
import { PROOF } from "../lib/data/proof";
import { generateTextReport } from "../lib/report";
import { MOCK_SCAM_RESULT } from "../lib/mock/stream_fixtures";

describe("Scam Shield Utilities & Proof Data", () => {
  it("defangs URLs correctly preventing accidental clicks", () => {
    const malicious = "https://sbi-kyc-verification.com/login";
    const defanged = defangUrl(malicious);
    expect(defanged).toBe("hxxps[://]sbi-kyc-verification[.]com/login");
    expect(defanged).not.toContain("https://");
    expect(defanged).toContain("[.]");
  });

  it("defangs handles correctly", () => {
    const upi = "fraudster@upi";
    const defanged = defangHandle(upi);
    expect(defanged).toBe("fraudster[at]upi");
    expect(defanged).not.toContain("@");
  });

  it("contains honest benchmark proof numbers with zero fabrication", () => {
    expect(PROOF.testMessagesCount).toBe(55);
    expect(PROOF.scamRecallPct).toBe(100.0);
    expect(PROOF.precisionPct).toBeCloseTo(91.67, 1);
    expect(PROOF.falsePositiveRatePct).toBeCloseTo(6.25, 1);
    expect(PROOF.messagesStored).toBe(0);
    expect(PROOF.agentsCount).toBe(5);
    expect(PROOF.byType.length).toBeGreaterThan(5);
    expect(PROOF.whatWeGotWrong.length).toBeGreaterThan(0);
  });

  it("generates citizen text report with 1930 helpline and defanged entities", () => {
    const report = generateTextReport(MOCK_SCAM_RESULT, {
      caseId: "SS-0042",
      timestamp: "2026-10-31 12:00:00",
    });

    expect(report).toContain("SCAM SHIELD INVESTIGATION REPORT");
    expect(report).toContain("SS-0042");
    expect(report).toContain("1930");
    expect(report).toContain("hxxp[://]sbi-update-kyc[.]top");
    expect(report).toContain("cybercrime.gov.in");
  });
});
