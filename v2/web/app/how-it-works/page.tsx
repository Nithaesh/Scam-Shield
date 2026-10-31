"use client";

import React from "react";
import { FileSearch, BrainCircuit, ShieldCheck, Scale, HeartHandshake, ArrowRight } from "lucide-react";
import { useI18n } from "../../lib/i18n";

export default function HowItWorksPage() {
  const { locale } = useI18n();

  const steps = [
    {
      num: "01",
      icon: FileSearch,
      title: locale === "hi" ? "1. एक्सट्रैक्टर एजेंट" : "1. Entity Extractor",
      desc:
        locale === "hi"
          ? "संदेश से सभी लिंक, फ़ोन नंबर, UPI आईडी और प्रेषक की पहचान सुरक्षित रूप से निकालता है, बिना किसी लिंक पर क्लिक किए।"
          : "Safely parses URLs, phone numbers, UPI handles, and sender headers from text or screenshots without ever clicking on untrusted links.",
    },
    {
      num: "02",
      icon: BrainCircuit,
      title: locale === "hi" ? "2. पैटर्न और रणनीति विश्लेषक" : "2. Pattern & Tactic Analyst",
      desc:
        locale === "hi"
          ? "धोखाधड़ी के मनोवैज्ञानिक हथकंडों का विश्लेषण करता है: बिजली काटने की धमकी, बैंक खाता ब्लॉक, डिजिटल अरेस्ट, लॉटरी आदि।"
          : "Identifies psychological manipulation tactics: urgency, fear, account disconnection threats, digital arrest notices, and lottery claims.",
    },
    {
      num: "03",
      icon: ShieldCheck,
      title: locale === "hi" ? "3. डोमेन व प्रतिष्ठा परीक्षक" : "3. Domain & Reputation Checker",
      desc:
        locale === "hi"
          ? "डोमेन आयु, हूबहू नकल (Lookalike) और नेशनल कम्युनिटी इंटेलिजेंस में पूर्व रिपोर्टों की जांच करता है।"
          : "Verifies domain registration age, WHOIS authenticity, punycode/lookalike impersonation, and flags against community fraud intelligence.",
    },
    {
      num: "04",
      icon: Scale,
      title: locale === "hi" ? "4. जज एजेंट (सिंथेसिस)" : "4. Synthesis Judge",
      desc:
        locale === "hi"
          ? "यदि भाषा सामान्य लगे लेकिन लिंक खतरनाक हो, तो तकनीकी साक्ष्य को प्राथमिकता देकर सटीक व सुरक्षित निर्णय देता है।"
          : "Weighs behavioral and technical evidence. In cases of conflict, technical entity risk takes precedence to eliminate false negatives.",
    },
    {
      num: "05",
      icon: HeartHandshake,
      title: locale === "hi" ? "5. नागरिक सुरक्षा सलाहकार" : "5. Citizen Safety Advisor",
      desc:
        locale === "hi"
          ? "सरल और स्पष्ट भाषा में बताता है कि अब क्या करना है और क्या नहीं करना, साथ ही तुरंत हेल्पलाइन 1930 का विकल्प देता है।"
          : "Translates findings into simple, actionable steps in plain English or Hindi, with one-tap 1930 helpline dialing.",
    },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-4">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-extrabold text-slate-900">
          {locale === "hi" ? "स्कैम शील्ड कैसे काम करता है?" : "How Scam Shield Works"}
        </h1>
        <p className="text-base text-slate-600">
          {locale === "hi"
            ? "5 विशेष AI एजेंटों की टीम मिलकर आपकी सुरक्षा करती है।"
            : "A specialized multi-agent security pipeline safeguarding citizens against fraud."}
        </p>
      </div>

      <div className="space-y-4">
        {steps.map((st, idx) => {
          const Icon = st.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex items-start space-x-4"
            >
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl flex-shrink-0">
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono font-bold text-blue-600">
                    STEP {st.num}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  {st.title}
                </h3>
                <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                  {st.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
