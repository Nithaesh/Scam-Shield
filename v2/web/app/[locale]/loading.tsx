import React from "react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-page flex flex-col items-center justify-center p-6 space-y-4">
      <div className="w-10 h-10 rounded-xl bg-signal/15 border border-signal/30 animate-pulse flex items-center justify-center text-signal font-mono text-xs font-bold">
        SS
      </div>
      <div className="space-y-2 text-center">
        <div className="h-4 w-44 bg-raised rounded animate-pulse mx-auto" />
        <div className="h-3 w-64 bg-raised/60 rounded animate-pulse mx-auto" />
      </div>
    </div>
  );
}
