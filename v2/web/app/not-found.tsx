"use client";

import React from "react";
import Link from "next/link";

export default function RootNotFound() {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#080F1D] text-[#E6EEF8] flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full p-8 rounded-2xl bg-[#0C1730] border border-[rgba(255,255,255,0.08)] text-center space-y-6">
          <div className="font-mono text-xs uppercase tracking-wider text-[#7E95B8]">Error 404</div>
          <h1 className="text-2xl font-bold text-[#E6EEF8]">Page Not Found</h1>
          <p className="text-xs text-[#7E95B8]">The requested page could not be located.</p>
          <div className="pt-2">
            <Link
              href="/en"
              className="inline-block px-5 py-2.5 rounded-xl bg-[#6EA8FF] text-[#080F1D] text-sm font-semibold hover:brightness-110"
            >
              Return Home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
