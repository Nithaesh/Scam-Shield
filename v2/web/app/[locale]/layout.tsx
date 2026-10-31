import type { Metadata } from "next";
import { Bricolage_Grotesque, Mukta, JetBrains_Mono } from "next/font/google";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { locales } from "../../i18n";
import "../globals.css";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["600", "700"],
  display: "swap",
});

const mukta = Mukta({
  subsets: ["latin", "devanagari"],
  variable: "--font-body",
  weight: ["400", "500", "700"],
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
  icons: {
    icon: "/icons/shield.svg",
  },
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages({ locale });

  return (
    <html
      lang={locale}
      data-theme="dark"
      className={`${bricolage.variable} ${mukta.variable} ${jetbrains.variable}`}
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
