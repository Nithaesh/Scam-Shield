"use client";

import React from "react";
import { ShieldCheck, Lock, EyeOff, PhoneCall } from "lucide-react";
import { useI18n } from "../../lib/i18n";

export default function AboutPage() {
  const { locale } = useI18n();

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900">
          {locale === "hi" ? "गोपनीयता और नागरिक सुरक्षा गारंटी" : "Privacy & Safety Guarantees"}
        </h1>
        <p className="text-base text-slate-600">
          {locale === "hi"
            ? "आपकी व्यक्तिगत जानकारी, OTP और छवियां हमेशा 100% सुरक्षित हैं।"
            : "Built with zero-knowledge, privacy-first principles to protect Indian citizens."}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-2">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl inline-block">
            <EyeOff className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            {locale === "hi" ? "संदेश कभी स्टोर नहीं होते" : "Zero Message Storage"}
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            {locale === "hi"
              ? "हम आपका पूरा मैसेज या स्क्रीनशॉट डेटाबेस में कभी सेव नहीं करते। केवल हैश किए गए अनाम पैटर्न ही जांचे जाते हैं।"
              : "Raw message bodies, personal chats, and screenshots are never stored in databases or permanent disks."}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-2">
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl inline-block">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            {locale === "hi" ? "OTP व क्रेडेंशियल सुरक्षा" : "OTP & Password Protection"}
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            {locale === "hi"
              ? "OTP, पिन और बैंक पासवर्ड स्वचालित रूप से फ़िल्टर हो जाते हैं। हमारा AI कभी आपके निजी पासवर्ड नहीं मांगता।"
              : "OTPs and PINs are automatically stripped. Scam Shield never requests personal credentials or banking PINs."}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-2">
          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl inline-block">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            {locale === "hi" ? "सक्रिय लिंक कभी क्लिक नहीं होते" : "Never Clicks Suspicious Links"}
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            {locale === "hi"
              ? "हमारा सिस्टम किसी भी संदिग्ध लिंक को कभी डाउनलोड या ओपन नहीं करता। केवल DNS व सुरक्षा प्रतिष्ठा जांची जाती है।"
              : "The analyzer never initiates HTTP downloads or activates potentially malicious payloads from scanned links."}
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-2">
          <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl inline-block">
            <PhoneCall className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            {locale === "hi" ? "राष्ट्रीय हेल्पलाइन 1930" : "National Helpline 1930"}
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">
            {locale === "hi"
              ? "यदि आप किसी धोखाधड़ी में पैसे गंवा चुके हैं, तो तुरंत 1930 पर कॉल करें या cybercrime.gov.in पर रिपोर्ट दर्ज करें।"
              : "Direct emergency access to India's National Cyber Crime helpline 1930 and official reporting portal."}
          </p>
        </div>
      </div>
    </div>
  );
}
