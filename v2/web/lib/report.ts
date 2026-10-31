import { FinalResultEvent } from "./api/contract";
import { defangUrl, defangHandle } from "./utils";

export interface ReportMeta {
  caseId: string;
  timestamp: string;
  userMessage?: string;
}

/**
 * Generates a clean, citizen-friendly plain-text investigation summary report.
 */
export function generateTextReport(result: FinalResultEvent, meta: ReportMeta): string {
  const verdictUpper = result.verdict.toUpperCase();
  const dateStr = meta.timestamp || new Date().toISOString();

  const lines = [
    "===========================================================",
    "               SCAM SHIELD INVESTIGATION REPORT            ",
    "===========================================================",
    `Report ID   : ${meta.caseId || result.request_id}`,
    `Generated At: ${dateStr}`,
    `Verdict     : ${verdictUpper} (${Math.round(result.confidence * 100)}% confidence)`,
    `Scam Type   : ${result.scam_type.replace(/_/g, " ").toUpperCase()}`,
    "-----------------------------------------------------------",
    "",
    "1. VERDICT SUMMARY",
    result.reasoning,
    "",
    "2. SUSPICIOUS ENTITIES (DEFANGED FOR SECURITY)",
  ];

  if (result.entities.urls && result.entities.urls.length > 0) {
    lines.push(`- Links (defanged): ${result.entities.urls.map(defangUrl).join(", ")}`);
  }
  if (result.entities.phones && result.entities.phones.length > 0) {
    lines.push(`- Phone Numbers   : ${result.entities.phones.join(", ")}`);
  }
  if (result.entities.upi_ids && result.entities.upi_ids.length > 0) {
    lines.push(`- UPI Addresses   : ${result.entities.upi_ids.map(defangHandle).join(", ")}`);
  }
  if (
    (!result.entities.urls || result.entities.urls.length === 0) &&
    (!result.entities.phones || result.entities.phones.length === 0) &&
    (!result.entities.upi_ids || result.entities.upi_ids.length === 0)
  ) {
    lines.push("- No external phone numbers, links or UPI handles identified.");
  }

  lines.push("", "3. RECOMMENDED CITIZEN ACTIONS");
  if (result.advice.do_not && result.advice.do_not.length > 0) {
    lines.push("DO NOT:");
    result.advice.do_not.forEach((item) => lines.push(` [X] ${item}`));
  }
  if (result.advice.do_next && result.advice.do_next.length > 0) {
    lines.push("DO NEXT:");
    result.advice.do_next.forEach((item) => lines.push(` [!] ${item}`));
  }

  lines.push(
    "",
    "4. OFFICIAL HELPLINES (GOVERNMENT OF INDIA)",
    "- National Cybercrime Helpline: 1930 (Toll Free, 24x7)",
    "- National Cybercrime Reporting Portal: https://cybercrime.gov.in",
    "",
    "-----------------------------------------------------------",
    "Notice: Scam Shield provides privacy-preserving AI analysis.",
    "No citizen messages or personal credentials are stored on disk.",
    "==========================================================="
  );

  return lines.join("\n");
}

/**
 * Downloads a blob as a file in the browser.
 */
export function downloadFile(filename: string, content: string, mimeType: string) {
  if (typeof window === "undefined") return;
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export function downloadTextReport(result: FinalResultEvent, meta: ReportMeta) {
  const text = generateTextReport(result, meta);
  const filename = `scam-shield-report-${meta.caseId || "investigation"}.txt`;
  downloadFile(filename, text, "text/plain;charset=utf-8");
}

export function downloadJsonReport(result: FinalResultEvent, meta: ReportMeta) {
  const data = {
    meta,
    result: {
      ...result,
      defanged_urls: result.entities.urls.map(defangUrl),
      defanged_upi: result.entities.upi_ids.map(defangHandle),
    },
  };
  const jsonStr = JSON.stringify(data, null, 2);
  const filename = `scam-shield-report-${meta.caseId || "investigation"}.json`;
  downloadFile(filename, jsonStr, "application/json;charset=utf-8");
}
