# Scam Shield — Demo Flow

A five-minute walkthrough that works offline, with or without API keys. The app
starts in demo mode automatically when no LLM key is configured.

## Before the demo

```powershell
.\.venv\Scripts\Activate.ps1
streamlit run app.py
```

Open <http://localhost:8501>. The sidebar shows the **Demo mode** toggle and a
badge explaining why demo data is being used.

If you have keys, put them in `.env` and set `USE_STUB_UI=0` to show the real
pipeline. Keep demo mode as the fallback in case the venue network fails.

## Story to tell

> "Scam Shield reads a suspicious message in under a few seconds, shows what
> each of five specialist agents found, and gives one clear next step — in
> English or Hindi. It never opens the links it finds."

## Script

### 1. Pitch (20 s)

Point at the hero and the five-agent strip. Explain that Extractor, Pattern
Analyst, Entity Checker, Judge and Advisor run in sequence, and that the Judge
resolves disagreements between language and technical evidence.

### 2. Run a scam sample (60 s)

1. Click **फ़र्ज़ी KYC ब्लॉक · धोखा** (Fake KYC block) under "Try an example".
2. Leave the advice language on **Auto**.
3. Click **इस संदेश की जाँच करें** (Check this message).

Watch the cards move from running to done. Point out:

- Extractor found sender `AX-SBIINB`, a link, and a phone number.
- Pattern Analyst found urgency, fear, a KYC threat and a link mismatch.
- Entity Checker found a lookalike domain (`sbi-kyc-update.xyz`), a personal
  mobile used as a bank helpline, and a sender-header mismatch.
- Judge shows the **conflict box**: official-sounding language versus technical
  evidence, and explains why the evidence wins.
- The verdict banner is red and says the message is fraudulent. The advice
  says not to click or call, verify in the official app, and report to 1930 /
  cybercrime.gov.in.

Press the read-aloud button to play the advice. Use the download buttons to
show the JSON and text report.

### 3. Show the safe case (30 s)

Click **असली बैंक OTP · सुरक्षित** and analyse. The banner turns green, the
advice still warns never to share an OTP, and the cards show low risk. This
demonstrates that the tool is not alarmist.

### 4. Switch to Hindi (30 s)

Change the advice language to **हिन्दी** (or the UI language, depending on the
build). The app re-runs once so the advice and labels match. Point out the
Devanagari labels, Hindi advice, and the same fixed verdict colours.

Optional: paste a Hindi message and show that Auto detects Devanagari.

### 5. Show partial checks (30 s)

In the sidebar, turn on **लुप्त जाँच का अनुकरण करें** (simulate unavailable
checks) and run a sample again. The affected card shows an amber
"could not check" state, and the verdict says what could not be verified.
Explain that missing data is never reported as safe.

### 6. Show the real tool layer (optional, 45 s)

If keys are configured, turn off demo mode and run the same sample. The real
Entity Checker calls WHOIS and any configured reputation providers. If there is
no network or no keys, the tools still return the full evidence shape and a
useful verdict; unavailable providers appear as "not checked", not "clean".

From a terminal, show the raw tool output:

```powershell
.\.venv\Scripts\python.exe -m tools.real "http://sbi-kyc-update.xyz/login call 9876543210 pay sbi.kyc@paytm"
```

### 7. Close (15 s)

> "The pipeline is teammate-built and untouched. Our layer adds a mobile-first
> bilingual UI, a normalised streaming adapter with failure fallbacks, and real
> entity intelligence that never fetches a suspicious link. The same code runs
> live with keys or offline in demo mode."

## Recovery lines

- **No network:** demo mode already works; the badge explains why.
- **Slow WHOIS:** the tools time out after five seconds and mark the age as
  unavailable.
- **No reputation keys:** providers are shown as not checked; local URL,
  phone, UPI and sender checks still run.
- **Pipeline error:** the app shows an error panel with a Retry button instead
  of a traceback. If streaming fails, the adapter retries once through
  `analyse()`.

## Things to avoid saying

- Do not claim the demo is a legal or financial guarantee.
- Do not call an unchecked link "safe"; absence of evidence is shown as
  unavailable.
- Do not promise phone-reputation counts; the real tools deliberately report
  zero and state the limitation.
