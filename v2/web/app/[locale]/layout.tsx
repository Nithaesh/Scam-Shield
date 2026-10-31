import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Mukta, JetBrains_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { locales } from "../../i18n";
import "../globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans-modern",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const mukta = Mukta({
  subsets: ["latin", "devanagari"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Scam Shield | Citizen Fraud Protection for India",
  description:
    "A multi-agent AI investigation desk checking suspicious SMS, WhatsApp forwards, UPI requests and screenshots in English and Hindi. Zero data retention.",
  metadataBase: new URL("https://scamshield.in"),
  keywords: [
    "Scam Shield",
    "Indian cyber fraud",
    "1930 helpline",
    "UPI fraud checker",
    "Electricity bill scam",
    "SBI KYC update scam",
    "Digital arrest cybercrime",
  ],
  openGraph: {
    title: "Scam Shield — 5-Agent Citizen Fraud Intelligence",
    description: "Check suspicious SMS, WhatsApp forwards, and UPI requests with 5 AI agents. Instant plain-language verdict in English & Hindi.",
    url: "https://scamshield.in",
    siteName: "Scam Shield",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Scam Shield | Citizen Fraud Protection",
    description: "Multi-agent consensus AI checking suspicious messages with zero data storage.",
  },
  icons: {
    icon: "/icons/shield.svg",
  },
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }> | { locale: string };
}) {
  const resolvedParams = await Promise.resolve(params);
  const locale = resolvedParams.locale;

  if (!locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages({ locale });

  return (
    <html
      lang={locale}
      data-theme="dark"
      className={`${jakarta.variable} ${mukta.variable} ${jetbrains.variable}`}
    >
      <body className="min-h-screen bg-page text-paper antialiased grain-overlay selection:bg-signal selection:text-on-signal">
        {/* Skip to Content for Accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 z-50 px-4 py-2 bg-signal text-on-signal font-semibold rounded-sm shadow-md"
        >
          Skip to main content
        </a>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <div className="relative min-h-screen flex flex-col">{children}</div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
