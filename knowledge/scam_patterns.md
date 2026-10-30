# India-Specific Scam Patterns Knowledge Base

This knowledge base details widespread digital scam typologies targeting citizens in India across SMS, WhatsApp, Telegram, and voice/video channels, alongside indicators of legitimate transactions to prevent false positives.

---

## 1. Fake Bank KYC / PAN Card Update / Account Blocked
- **Description**: Fraudulent alerts claiming the user's bank account, NetBanking, or debit card is suspended due to pending KYC or PAN linkage.
- **Red Flags**:
  - Urgent deadlines ("within 24 hours", "tonight", "immediately").
  - Unofficial domains (`.xyz`, `.top`, `.click`, `.site`, or lookalikes like `sbi-kyc.com`).
  - SMS received from personal 10-digit mobile numbers rather than registered TRAI alpha-headers.
  - Threats of permanent account termination.
- **Example Phrasing**: "Dear SBI User, your account has been blocked due to uncompleted KYC. Please click here to update your PAN immediately: bit.ly/sbi-kyc-verify" / "HDFC Alert: Your NetBanking will be suspended today. Click http://hdfc-bank.top"
- **What Real Institutions Never Ask**: Banks never send SMS with third-party links to update KYC or enter NetBanking passwords/PINs. KYC is completed via official branch visits or secured in-app Video-KYC.

---

## 2. SBI YONO / Bank APK Malicious Download
- **Description**: Attackers distribute modified Android APK files masquerading as official banking apps (e.g. `SBI_YONO_Update.apk`, `HDFC_Reward.apk`).
- **Red Flags**:
  - Direct links to download `.apk` files or shortened links hosted on cloud drives or unknown servers.
  - Claims of "mandatory security patch" or "YONO reward update".
- **Example Phrasing**: "Dear customer, new mandatory YONO SBI update is required to keep your card active. Download the official update APK here: http://192.168.1.10/sbi.apk"
- **What Real Institutions Never Ask**: Banks never distribute APK files via SMS or WhatsApp; all official apps are installed strictly via Google Play Store or Apple App Store.

---

## 3. Electricity Bill Disconnection Threat
- **Description**: High-pressure intimidation claiming the victim's power supply will be disconnected at 9:30 PM due to an unpaid bill.
- **Red Flags**:
  - Urgency citing disconnection tonight (typically 9:30 PM or 10:00 PM).
  - Personal 10-digit phone number provided to call an "electricity officer" immediately.
  - Demands for immediate payment via third-party UPI or remote screen-sharing.
- **Example Phrasing**: "Dear consumer, your electricity power will be disconnected tonight at 9:30 pm from electricity office because your previous month bill was not updated. Please immediately contact our electricity officer at 9876543210. Thank you."
- **What Real Institutions Never Ask**: State electricity boards (e.g., BESCOM, TNEB, MSEDCL, UPPCL) never send disconnection threats from personal numbers asking consumers to call an individual mobile phone.

---

## 4. "Scan QR Code / Accept Collect Request to Receive Money"
- **Description**: Fraudsters pretending to be buyers on OLX, landlords, or refund agents send a QR code or UPI collect request claiming it will credit money to the victim.
- **Red Flags**:
  - Asking the victim to scan a QR code or enter their UPI PIN to "receive" or "refund" money.
  - Prompts from payment apps saying "Authorize Payment" or "Enter UPI PIN".
- **Example Phrasing**: "I have sent you advance payment of Rs. 15,000 for your sofa. Please scan this QR code and enter your UPI PIN to accept money into your account."
- **What Real Institutions Never Ask**: **UPI PIN is strictly required only to SEND money or check account balance.** Scanning a QR code or typing a PIN NEVER deposits money into your bank account.

---

## 5. Kaun Banega Crorepati (KBC) / Lottery Lures
- **Description**: Fraudulent WhatsApp messages or audio recordings claiming the user has won a multi-lakh lottery from KBC, Jio, or a lucky draw.
- **Red Flags**:
  - Claims of winning unentered lotteries (e.g. "Rs. 25 Lakhs").
  - Instruction to contact a specific "WhatsApp lottery manager".
  - Requirement to pay a refundable "registration fee", "tax", or "processing charge".
- **Example Phrasing**: "Badhai ho! Aapka number KBC all India sim card lucky draw me 25 Lakh ka lottery jeeta hai. Manager Rana Pratap Singh se WhatsApp karein 9876543210 par."
- **What Real Institutions Never Ask**: Legitimate lotteries never demand an advance fee or transfer to claim a prize.

---

## 6. Fake Part-Time Job / Telegram Review Rating Task
- **Description**: Offers for high daily earnings (Rs. 2,000 - 5,000/day) for liking YouTube videos, rating Google Maps locations, or reviewing hotel bookings.
- **Red Flags**:
  - Initial small payouts (Rs. 150 - 500) to build trust.
  - Funneling communication into Telegram channels.
  - Demands to deposit money for "prepaid tasks" or "crypto investments" with impossible returns.
- **Example Phrasing**: "Part-time job offer! Earn Rs 3000 to 5000 daily from home just by rating hotels on Google. No experience needed. Contact WhatsApp: +919123456789"
- **What Real Institutions Never Ask**: Legitimate employers never ask candidates to pay money or deposit funds to perform job tasks.

---

## 7. Fake India Post / Courier Customs & Delivery Rescheduling
- **Description**: Phishing SMS stating an incoming package cannot be delivered due to an incorrect house address, requiring an address update and a nominal redelivery fee (Rs. 5 - 25).
- **Red Flags**:
  - SMS from personal mobile numbers or non-gov domains (`indiapost-delivery.top`).
  - Small fee designed to capture card credentials and trigger unauthorized OTP debits.
- **Example Phrasing**: "India Post: Your package IND9847239 could not be delivered due to incomplete address. Please update your address within 24 hours at http://indiapost-update.xyz or package will be returned."
- **What Real Institutions Never Ask**: India Post sends tracking messages from official headers (e.g., `DH-INPOST`, `CP-POSTS`) and directs to `indiapost.gov.in`. They never request online card payments via unsolicited SMS links.

---

## 8. Income Tax Refund Phishing
- **Description**: SMS or email claiming an approved income tax refund is pending and requires confirmation of bank account credentials.
- **Red Flags**:
  - Claims of exact refund figures (e.g., "Rs. 15,490 has been approved").
  - Links to deceptive domains imitating `incometax.gov.in`.
- **Example Phrasing**: "Dear Taxpayer, an income tax refund of Rs 24,750 has been approved for your PAN. Please verify your bank account details here to receive it: http://incometax-refund-portal.click"
- **What Real Institutions Never Ask**: Income Tax refunds are directly credited via ECS/NEFT into the bank account pre-validated on the official e-filing portal `incometax.gov.in`.

---

## 9. "Digital Arrest" / Law Enforcement / CBI / Police Threat
- **Description**: Impersonators posing as CBI, Mumbai Police, Narcotics Control Bureau (NCB), or Telecom Department claiming the victim's SIM or parcel was caught with illegal narcotics or money laundering.
- **Red Flags**:
  - Video calls showing fake police stations, uniforms, and forged warrant documents.
  - Intimidation of "digital arrest" where the victim is forbidden from disconnecting the call.
  - Coercion to transfer "clearance funds" into "court RBI escrow accounts".
- **Example Phrasing**: "This is CBI officer Rajesh Sharma. A courier from DHL with MDMA drugs in your Aadhaar name has been intercepted. You are under digital arrest. Do not disconnect the video call."
- **What Real Institutions Never Ask**: **There is NO provision of "digital arrest" under Indian law.** Law enforcement officers never investigate or demand financial transfers over Skype, WhatsApp, or phone calls.

---

## 10. Remote Screen-Sharing App Installation
- **Description**: Scammers convince users to install applications like AnyDesk, TeamViewer QuickSupport, or RustDesk under the pretext of resolving customer care complaints.
- **Red Flags**:
  - Instructing the victim to install screen-sharing software on their mobile phone.
  - Asking the victim to read out a 9-digit code and accept permission prompts.
  - Instructing the victim to open their banking or UPI app while screen-sharing is active.
- **What Real Institutions Never Ask**: Legitimate support agents never ask customers to download screen-sharing or remote desktop applications to resolve banking, telecom, or courier issues.

---

## 11. TRAI / Mobile Number Disconnection Threat
- **Description**: Automated calls or SMS alleging the customer's phone number will be disconnected in 2 hours due to illegal activities or unverified SIM registration.
- **Red Flags**:
  - Short deadline (2 hours).
  - Prompts to press 9 to connect with an executive.
- **What Real Institutions Never Ask**: TRAI does not block or disconnect individual mobile connections; regulatory communications come directly from telecom operators through official billing channels.

---

## 12. Instant Loan App Harassment
- **Description**: Fraudulent instant loan apps that harvest contacts and photos, charge 50%+ hidden deductions, and threaten contacts with morphed photos upon repayment default.
- **Red Flags**:
  - Loan approval without credit check via untrusted APK download.
  - Demands for excessive Android permissions (Contacts, Gallery, SMS).

---

## 13. Investment & Crypto Telegram Groups
- **Description**: VIP stock market prediction or cryptocurrency trading groups promising guaranteed 200-500% returns within days.
- **Red Flags**:
  - Showcasing fake screenshots of trading profits.
  - Inability to withdraw deposited capital without paying "clearance taxes".

---

## 14. "Hi Mom/Dad" Emergency Distress
- **Description**: WhatsApp message from an unknown number claiming the user's son, daughter, or close relative broke their phone and urgently needs money transferred for an emergency.
- **Red Flags**:
  - Emotional distress and pressure to transfer money immediately without calling.

---

## 15. Credit Card Reward Points Expiry
- **Description**: SMS stating reward points worth thousands of rupees are expiring today and can be converted into cash.
- **Red Flags**:
  - Webpage asking for credit card number, CVV, expiry date, and net-banking OTP.

---

## 16. Legitimate Transaction Patterns (To Prevent False Positives)
- **Official Bank Debit/Credit SMS**:
  - Originates from registered TRAI alphabetic headers (e.g., `AD-HDFCBK`, `VK-SBIINB`, `JM-ICICIB`).
  - Contains masked account numbers (e.g., `A/c ending XX1234`).
  - Contains transaction details: date, time, reference number (UTR/Ref), and available balance.
  - **Does NOT include links to verify, login, or update details.**
- **Standard OTP Verification Messages**:
  - Clearly states purpose (e.g. "OTP for login to Swiggy", "OTP for transaction of Rs 500 at Amazon").
  - Prominently features warnings: **"Do not share this OTP with anyone, including bank employees."**
  - Legitimate OTP messages never ask the user to call a personal number or click an untrusted link to cancel.
- **Delivery and E-Commerce Updates**:
  - Updates from Amazon, Flipkart, Swiggy, Zomato detailing delivery agent location or pin on official apps.
  - Never ask for payment of delivery reschedule charges via unsolicited SMS links.
