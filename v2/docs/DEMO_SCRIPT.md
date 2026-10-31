# Scam Shield v2: Hackathon Demo Script (2–3 Minutes)

A high-impact walkthrough designed for judges and audiences demonstrating Scam Shield v2's citizen-first multi-agent protection layer.

---

## ⏱️ Timeline & Narrative Arc

```
[ 0:00 - 0:30 ] The Problem & Elderly Vulnerability
[ 0:30 - 1:15 ] Live Demo 1: Fake Electricity Bill Scam (Hinglish + SSE Stream)
[ 1:15 - 1:45 ] Live Demo 2: Senior Mode & Hindi Switch (Devanagari Notice)
[ 1:45 - 2:15 ] Live Demo 3: Conflict Resolution & Genuine Alert Safety
[ 2:15 - 2:45 ] 1-Click WhatsApp Family Alert & National Helpline 1930
[ 2:45 - 3:00 ] Technical Architecture & Non-Destructive Layering Signoff
```

---

## 🎬 Step-by-Step Presentation Guide

### 1. Opening Hook (0:00 – 0:30)
> **Speaker**: *"Every single day, millions of Indian citizens — especially elderly parents and non-technical users — receive terrifying WhatsApp messages claiming their electricity will be disconnected tonight, or their bank account is blocked. Panic causes people to click and lose life savings.*  
> *Existing security tools are either too technical or click-happy. **Scam Shield v2** is a zero-knowledge, bilingual defense shield that tells citizens exactly what to do in plain language, without ever touching or downloading malicious links."*

---

### 2. Live Demo 1: Real-time Multi-Agent SSE Analysis (0:30 – 1:15)

1. Open the web app at `http://localhost:3000`.
2. Click the quick example pill: **"Electricity Disconnect Threat"**.
3. **Input Text in Textarea**:
   > *"Dear Consumer, your electricity power will be disconnected at 9:30 PM tonight because your previous month bill was not updated. Please immediately contact our power officer at +919876543210."*
4. Click **"Scan for Fraud Now"**.
5. **Point at the screen**:
   - Show the **5 Agent Cards** lighting up sequentially:
     - `Extractor`: Finds phone number `+919876543210`.
     - `Pattern Analyst`: Detects false urgency (cutoff in hours) and emotional coercion.
     - `Entity Checker`: Cross-checks official state electricity discom contact rosters.
     - `Judge`: Computes synthesis verdict.
     - `Advisor`: Generates plain-language protection steps.
6. **Show Final Verdict**:
   - Bold Red Banner: **FRAUD DETECTED (SCAM)** (Confidence: 95%).
   - Scam Category: `electricity_bill`.
   - Action Guidance: **DO NOT** call the phone number. **ONE NEXT STEP**: Verify through your official electricity bill app.

---

### 3. Live Demo 2: Senior Accessibility & Bilingual Switch (1:15 – 1:45)

1. Click the **"Senior Mode (Large Text)"** button in the header:
   - Fonts instantly expand to accessible 18px+ sizing, high-contrast borders activate, buttons enlarge to 52px touch targets.
2. Click the **"हिन्दी"** language button:
   - Entire interface switches seamlessly to Hindi.
3. Paste a Devanagari Bank KYC scam:
   > *"प्रिय ग्राहक, आपका SBI YONO खाता ब्लॉक कर दिया गया है। तुरंत पैन कार्ड अपडेट करने के लिए http://sbi-kyc-update.com पर क्लिक करें।"*
4. Click **"अभी धोखाधड़ी की जांच करें"**:
   - The analysis streams in real-time.
   - Verdict appears in clean Hindi: **धोखाधड़ी पाई गई (SCAM)**.
   - Advisory: *किसी भी लिंक पर क्लिक न करें, न ही अपना पासवर्ड साझा करें।*

---

### 4. Live Demo 3: Conflict Detection & Zero False Alarms (1:45 – 2:15)

1. Click the quick example pill: **"Bank Account Debit (Genuine)"**:
   > *"INR 1,250.00 debited from A/C XX1234 on 30-OCT-2026 14:22 via UPI Ref 629482910384. Available balance: INR 18,430.50. If not done by you, SMS BLOCK to 567676."*
2. Click **"Scan for Fraud Now"**:
   - Shows Green Banner: **LIKELY SAFE** (Confidence: 92%).
   - Explains: *Message adheres strictly to RBI transactional notification formats without demanding urgent payment or external credential harvesting.*

---

### 5. Call to Action: WhatsApp Family Share & 1930 Helpline (2:15 – 2:45)

1. Return to the scam verdict.
2. Click **"Share Alert with Family on WhatsApp"**:
   - Opens pre-filled WhatsApp alert:
   > *"🚨 Scam Shield Family Alert: New 'Electricity Bill' scam reported! Do NOT click any link or send money. Dial 1930 immediately or visit cybercrime.gov.in."*
3. Point out the emergency red **"1930"** button in the top navbar and advice panel:
   - One-tap direct dial to the **National Cyber Crime Helpline**.

---

### 6. Closing (2:45 – 3:00)

> **Speaker**: *"Scam Shield v2 combines cutting-edge multi-agent reasoning with empathetic, accessible design for Indian citizens. It was engineered strictly non-destructively on top of the original core, maintaining 100% backward compatibility with 125 passing regression tests and zero file modifications to protected paths. Thank you!"*
