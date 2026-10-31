import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "../lib/i18n";
import { Navbar } from "../components/Navbar";

export const metadata: Metadata = {
  title: "Scam Shield | Citizen Fraud Protection for India",
  description: "Bilingual, privacy-preserving AI scam detection for SMS, WhatsApp, UPI, and suspicious links. Dial 1930 for cyber helpline.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased flex flex-col min-h-screen">
        <I18nProvider>
          <Navbar />
          <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
            {children}
          </main>
          <footer className="border-t border-slate-200 bg-white py-6 mt-12 text-center text-xs text-slate-500">
            <div className="max-w-5xl mx-auto px-4 space-y-2">
              <p className="font-semibold text-slate-700">
                Scam Shield v2 — Citizen First Cybersecurity Layer
              </p>
              <p>
                Zero-logging privacy guarantee. We never store message bodies, OTPs, or uploaded screenshots.
              </p>
              <p>
                For official cybercrime complaints, visit <a href="https://cybercrime.gov.in" target="_blank" rel="noreferrer" className="text-blue-600 underline">cybercrime.gov.in</a> or dial <strong>1930</strong>.
              </p>
            </div>
          </footer>
        </I18nProvider>
      </body>
    </html>
  );
}
