"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-page text-paper flex items-center justify-center p-6 selection:bg-signal/20 selection:text-signal">
      <div className="max-w-md w-full p-8 rounded-2xl bg-panel border border-hairline text-center space-y-6 shadow-md">
        <div className="w-12 h-12 rounded-xl bg-signal/10 border border-signal/30 text-signal flex items-center justify-center mx-auto">
          <ShieldAlert className="w-6 h-6" />
        </div>

        <div className="space-y-2">
          <div className="font-mono text-xs uppercase tracking-wider text-fog">Error 404</div>
          <h1 className="text-2xl font-heading font-bold text-paper">Investigation Not Found</h1>
          <p className="text-xs text-fog leading-relaxed">
            The page or report you requested does not exist or has been securely discarded.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Link href="/en">
            <Button variant="raised" size="md" className="w-full">
              Back to Home
            </Button>
          </Link>
          <Link href="/en/check">
            <Button variant="signal" size="md" className="w-full">
              Check a Message
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
