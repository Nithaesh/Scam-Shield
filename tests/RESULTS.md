# Scam Shield Evaluation Results

**Date**: 2026-10-30

## Performance Metrics Summary

| Metric | Value | Target Threshold | Status |
| :--- | :--- | :--- | :--- |
| **Overall Accuracy** | `100.0%` | ≥ 85% | ✅ Met |
| **Scam Recall (Detection Rate)** | `100.0%` | ≥ 90% | ✅ Met |
| **Scam Precision** | `100.0%` | ≥ 85% | ✅ Met |
| **Genuine False Positive Rate** | `0.0%` | ≤ 10% | ✅ Met |
| **Scam F1 Score** | `100.0` | ≥ 85.0 | ✅ Met |

## Detailed Evaluation Table

| ID | Category | Expected | Predicted | Confidence | Result | Latency (ms) | Notes |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `SCAM_001` | fake_kyc_bank | `scam` | `scam` | 98% | ✅ PASS | 1023.56ms | Fictional domain sbi-kyc-update.xyz. Phishing for NetBanking credentials. |
| `SCAM_002` | fake_kyc_bank | `scam` | `scam` | 95% | ✅ PASS | 3.65ms | Hindi text with fake .top domain impersonating HDFC. |
| `SCAM_003` | electricity_bill_threat | `scam` | `scam` | 90% | ✅ PASS | 3.44ms | Classic Indian electricity disconnection urgency scam with personal phone number. |
| `SCAM_004` | apk_malware | `scam` | `scam` | 90% | ✅ PASS | 3.44ms | IP-hosted APK download pretending to be SBI YONO banking app. |
| `SCAM_005` | lottery_kbc | `scam` | `scam` | 88% | ✅ PASS | 3.42ms | Famous KBC lottery WhatsApp advance fee scam. |
| `SCAM_006` | fake_job_offer | `scam` | `scam` | 88% | ✅ PASS | 3.39ms | YouTube rating task scam funneling users to Telegram prepaid task trap. |
| `SCAM_007` | fake_courier_customs | `scam` | `scam` | 95% | ✅ PASS | 3.16ms | Impersonating India Post with .click phishing link to harvest credit card OTP. |
| `SCAM_008` | income_tax_refund | `scam` | `scam` | 95% | ✅ PASS | 3.08ms | Fake Income Tax refund link harvesting NetBanking login details. |
| `SCAM_009` | upi_qr_collect_scam | `scam` | `scam` | 88% | ✅ PASS | 3.45ms | Classic QR code / UPI PIN collect trap. UPI PIN is never needed to receive money. |
| `SCAM_010` | digital_arrest_police | `scam` | `scam` | 88% | ✅ PASS | 4.05ms | Coercive digital arrest scam impersonating CBI and narcotics bureau. |
| `SCAM_011` | whatsapp_family_distress | `scam` | `scam` | 90% | ✅ PASS | 3.73ms | Family impersonation emergency distress scam targeting parents. |
| `SCAM_012` | credit_card_reward | `scam` | `scam` | 95% | ✅ PASS | 3.7ms | Reward points expiration phishing stealing credit card details and OTP. |
| `SCAM_013` | trai_sim_block | `scam` | `scam` | 90% | ✅ PASS | 3.24ms | Telecom disconnection intimidation impersonating TRAI regulator. |
| `SCAM_014` | predatory_loan_app | `scam` | `scam` | 90% | ✅ PASS | 3.81ms | Malicious loan app APK designed to exfiltrate user contacts and photos for extortion. |
| `SCAM_015` | remote_access_scam | `scam` | `scam` | 88% | ✅ PASS | 2.76ms | Remote desktop screen-sharing takeover scam using QuickSupport/AnyDesk. |
| `SCAM_016` | crypto_investment_group | `scam` | `scam` | 88% | ✅ PASS | 2.66ms | Guaranteed high-return Ponzi investment scheme. |
| `SCAM_017` | irctc_refund | `scam` | `scam` | 95% | ✅ PASS | 3.09ms | Phishing domain impersonating Indian Railways booking portal. |
| `SCAM_018` | aadhaar_pan_fine | `scam` | `scam` | 95% | ✅ PASS | 3.41ms | Government fine intimidation phishing for Aadhaar number and OTP. |
| `SCAM_019` | otp_request_fraud | `scam` | `scam` | 88% | ✅ PASS | 2.51ms | Direct social engineering asking user to disclose transactional OTP. |
| `SCAM_020` | upi_cashback_lure | `scam` | `scam` | 95% | ✅ PASS | 3.45ms | Fake cashback landing page triggering UPI collect requests. |
| `SCAM_021` | electricity_bill_threat | `scam` | `scam` | 88% | ✅ PASS | 3.48ms | Pure Hindi power disconnection urgency scam. |
| `SCAM_022` | fake_kyc_bank | `scam` | `scam` | 90% | ✅ PASS | 3.58ms | Urgent password expiry phishing imitating Punjab National Bank. |
| `SCAM_023` | fastag_toll_scam | `scam` | `scam` | 90% | ✅ PASS | 3.11ms | Hinglish FASTag highway fine intimidation link. |
| `SCAM_024` | fake_kyc_bank | `scam` | `scam` | 98% | ✅ PASS | 3.15ms | Phishing site asking for card PIN and CVV. |
| `SCAM_025` | prize_lure | `scam` | `scam` | 88% | ✅ PASS | 3.02ms | Food delivery app prize lure asking for advance fee. |
| `SCAM_026` | digital_arrest_police | `scam` | `scam` | 90% | ✅ PASS | 2.58ms | Fake police legal notice intimidation demanding immediate extortion money. |
| `SCAM_027` | apk_malware | `scam` | `scam` | 90% | ✅ PASS | 4.08ms | Airline flight disruption lure distributing malicious APK. |
| `SCAM_028` | government_scheme_lure | `scam` | `scam` | 90% | ✅ PASS | 3.63ms | Hindi government subsidy fraud targeting rural citizens. |
| `SCAM_029` | fake_customer_support | `scam` | `scam` | 88% | ✅ PASS | 3.5ms | Fake high-value purchase alert prompting user to call scam call center. |
| `GENUINE_001` | bank_debit_alert | `safe` | `safe` | 92% | ✅ PASS | 3.53ms | Standard official debit notification with masked account number and reference ID. No links or calls. |
| `GENUINE_002` | bank_otp | `safe` | `safe` | 92% | ✅ PASS | 3.21ms | Standard official OTP verification explicitly reminding user not to share. |
| `GENUINE_003` | ecommerce_delivery | `safe` | `safe` | 92% | ✅ PASS | 3.29ms | Legitimate Amazon delivery dispatch linking to verified domain amazon.in. |
| `GENUINE_004` | food_delivery_update | `safe` | `safe` | 92% | ✅ PASS | 2.64ms | Informational food delivery arrival notice with no actionable threats or credentials. |
| `GENUINE_005` | telecom_recharge | `safe` | `safe` | 92% | ✅ PASS | 3.63ms | Routine telecom plan renewal confirmation. |
| `GENUINE_006` | appointment_reminder | `safe` | `safe` | 92% | ✅ PASS | 4.01ms | Healthcare appointment reminder pointing to official 1800 toll-free number. |
| `GENUINE_007` | utility_bill_receipt | `safe` | `safe` | 92% | ✅ PASS | 3.07ms | Legitimate electricity bill payment acknowledgment. |
| `GENUINE_008` | salary_credit_alert | `safe` | `safe` | 92% | ✅ PASS | 2.9ms | Routine salary credit message with masked account details. |
| `GENUINE_009` | travel_booking | `safe` | `safe` | 92% | ✅ PASS | 3.02ms | Official IRCTC railway confirmation linking to legitimate irctc.co.in. |
| `GENUINE_010` | utility_bill_due | `safe` | `safe` | 92% | ✅ PASS | 3.39ms | Normal billing notice with realistic due date and verified airtel.in link. |
| `GENUINE_011` | bank_debit_alert | `safe` | `safe` | 92% | ✅ PASS | 3.72ms | Authentic Hindi bank debit notification. |
| `GENUINE_012` | service_otp | `safe` | `safe` | 92% | ✅ PASS | 3.46ms | Routine account recovery OTP with clear warning. |
| `GENUINE_013` | postal_delivery | `safe` | `safe` | 92% | ✅ PASS | 4.02ms | Authentic India Post delivery confirmation linking strictly to .gov.in domain. |
| `GENUINE_014` | credit_card_statement | `safe` | `safe` | 92% | ✅ PASS | 2.97ms | Standard monthly credit card statement alert without phishing links. |
| `EDGE_001` | prompt_injection_attack | `scam` | `scam` | 95% | ✅ PASS | 4.45ms | Direct prompt injection attempt combined with phishing link. Must be judged scam. |
| `EDGE_002` | shortened_url_unverified | `suspicious` | `suspicious` | 65% | ✅ PASS | 3.5ms | Polite neutral e-commerce wording masking unknown shortened link. |
| `EDGE_003` | bank_wording_personal_sender | `suspicious` | `suspicious` | 65% | ✅ PASS | 3.38ms | Bank-like phrasing but instructs calling a personal 10-digit mobile number. |
| `EDGE_004` | urgent_genuine_bank_alert | `suspicious` | `suspicious` | 65% | ✅ PASS | 2.63ms | High urgency tone causing potential panic, but points to official 1800 toll-free number. Borderline safe/suspicious requiring careful evaluation. |
| `EDGE_005` | ultra_short_scam | `scam` | `scam` | 88% | ✅ PASS | 3.4ms | Minimal 6-word scam message without punctuation. |
| `EDGE_006` | multilingual_code_switching | `scam` | `scam` | 95% | ✅ PASS | 3.63ms | Code-switched Tamil-English (Tanglish) threatening account block with fake .site link. |
| `EDGE_007` | empty_input | `safe` | `safe` | 100% | ✅ PASS | 0.0ms | Completely empty input string. Pipeline must handle without crashing and return safe. |
| `EDGE_008` | emoji_only | `safe` | `safe` | 92% | ✅ PASS | 3.27ms | String composed solely of emojis without actionable links, phone numbers, or text. |
| `EDGE_009` | long_dense_legal_phishing | `scam` | `scam` | 90% | ✅ PASS | 3.62ms | Densely worded pseudo-legal text (>1200 chars) burying a malicious .click phishing link. |
