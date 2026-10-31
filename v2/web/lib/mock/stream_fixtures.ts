import { FinalResultEvent, StageResultEvent } from "../api/contract";

export const MOCK_SCAM_RESULT: FinalResultEvent = {
  v: 1,
  request_id: "mock-scam-123",
  verdict: "scam",
  confidence: 0.96,
  scam_type: "bank_kyc",
  reasoning: "SMS uses false urgency claiming SBI account suspension, directs to lookalike phishing domain 'sbi-update-kyc.top', and requests immediate credential entry.",
  conflict: null,
  advice: {
    headline: "Do not open any link or reply to this message",
    summary: "This is a confirmed phishing attack impersonating State Bank of India.",
    do_not: [
      "Do not tap on the link http://sbi-update-kyc.top.",
      "Never enter your NetBanking username, password, or OTP on unverified portals.",
      "Do not call back any phone number provided in the SMS."
    ],
    do_next: [
      "Check your SBI account status directly through the official YONO app or https://onlinesbi.sbi.",
      "Forward the fraudulent SMS to 1909 (TRAI DND reporting)."
    ],
    report_to: [
      "National Cyber Crime Reporting Portal: https://cybercrime.gov.in",
      "National Toll-Free Helpline: 1930",
      "SBI Fraud Reporting Helpline: 1800 11 1109"
    ]
  },
  share_text: "🚨 Family Alert: New 'Fake Bank KYC Block' scam reported! Do NOT click any link or send money. Verified by Scam Shield. If trapped, dial 1930 immediately or visit cybercrime.gov.in.",
  language: "en",
  entities: {
    urls: ["http://sbi-update-kyc.top"],
    phones: ["+919876543210"],
    upi_ids: [],
    sender: "VM-SBISMS"
  },
  community: {
    matches: [
      {
        entity_type: "domain",
        entity_masked: "sbi-update-***.top",
        report_count: 8,
        scam_type: "bank_kyc"
      }
    ]
  },
  total_ms: 420.5,
  cached: false,
};

export const MOCK_SAFE_RESULT: FinalResultEvent = {
  v: 1,
  request_id: "mock-safe-456",
  verdict: "safe",
  confidence: 0.94,
  scam_type: "bank_debit_alert",
  reasoning: "Message adheres strictly to RBI transactional notification standards: contains masked account reference, legitimate transaction ID, and does not demand credential entry or urgent payment.",
  conflict: null,
  advice: {
    headline: "Message appears to be a legitimate banking alert",
    summary: "Routine debit notification matching official bank templates.",
    do_not: [
      "Never share the OTP with anyone, even someone claiming to be bank staff."
    ],
    do_next: [
      "If you did not initiate this transaction, immediately lock your card via your official banking app or call your bank's emergency hotline."
    ],
    report_to: [
      "Official Bank Customer Care number printed on the back of your debit card"
    ]
  },
  share_text: "✅ Verified through Scam Shield: Standard transaction alert. Always remember never to share OTP with anyone.",
  language: "en",
  entities: {
    urls: [],
    phones: [],
    upi_ids: [],
    sender: "AX-HDFCBK"
  },
  community: {
    matches: []
  },
  total_ms: 180.2,
  cached: true,
};
