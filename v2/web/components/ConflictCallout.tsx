"use client";

import React from "react";
import { AlertCircle, ShieldAlert } from "lucide-react";
import { ConflictPayload } from "../lib/api/contract";
import { useI18n } from "../lib/i18n";

interface ConflictCalloutProps {
  conflict: ConflictPayload | null | undefined;
}

export function ConflictCallout({ conflict }: ConflictCalloutProps) {
  const { t } = useI18n();
  if (!conflict) return null;

  return (
    <div className="my-5 p-4 rounded-xl bg-orange-50 border border-orange-300 text-orange-950 flex items-start space-x-3 shadow-sm">
      <div className="p-1.5 bg-orange-200 text-orange-800 rounded-lg flex-shrink-0 mt-0.5">
        <AlertCircle className="w-5 h-5" />
      </div>
      <div>
        <h4 className="text-sm font-bold text-orange-900 flex items-center space-x-1.5">
          <span>{t("verdict.conflictAlert")}</span>
          <span className="text-xs bg-orange-200 text-orange-800 font-semibold px-2 py-0.5 rounded-full">
            Winner: {conflict.winner}
          </span>
        </h4>
        <p className="text-sm font-medium mt-1 text-orange-850">
          {conflict.resolution}
        </p>
      </div>
    </div>
  );
}
