"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Scam Shield Error Boundary Caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-page text-paper flex items-center justify-center p-6 selection:bg-signal/20 selection:text-signal">
      <div className="max-w-md w-full p-8 rounded-2xl bg-panel border border-verdict-scam/30 text-center space-y-6 shadow-md">
        <div className="w-12 h-12 rounded-xl bg-verdict-scam/10 border border-verdict-scam/30 text-verdict-scam flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div className="space-y-2">
          <div className="font-mono text-xs uppercase tracking-wider text-verdict-scam font-bold">
            Application Error
          </div>
          <h1 className="text-2xl font-heading font-bold text-paper">Something went wrong</h1>
          <p className="text-xs text-fog leading-relaxed">
            The multi-agent pipeline encountered an unexpected issue while processing.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Button variant="signal" size="md" onClick={() => reset()} leftIcon={<RotateCcw className="w-4 h-4" />}>
            Try Again
          </Button>
          <a
            href="tel:1930"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-signal/30 bg-signal/10 text-signal text-sm font-semibold hover:bg-signal/20"
          >
            <PhoneCall className="w-4 h-4" />
            <span>Dial 1930</span>
          </a>
        </div>
      </div>
    </div>
  );
}
