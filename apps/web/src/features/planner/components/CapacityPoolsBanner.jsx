"use client";

import { Clock, Cpu, CheckSquare, Sparkles, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui";

export function CapacityPoolsBanner({ plannedHours = 1.5, maxFocusHours = 4.0 }) {
  // Free-tier quotas & review bandwidth
  const focusPct = Math.min(Math.round((plannedHours / maxFocusHours) * 100), 100);
  const geminiQuotaLeft = 38;
  const geminiQuotaTotal = 50;
  const geminiPct = Math.round((geminiQuotaLeft / geminiQuotaTotal) * 100);
  const reviewLimit = 5;
  const reviewPending = 2;

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {/* Budget 1: Human Focus Capacity */}
      <Card className="p-4 bg-white border border-[#E7E5E0] shadow-xs space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-stone-600 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-[#2D5A43]" />
            <span>Focus Hours Budget</span>
          </span>
          <span className="font-bold text-[#2D5A43]">{plannedHours}h / {maxFocusHours}h</span>
        </div>

        <div className="w-full bg-[#FAF9F5] border border-[#E7E5E0] h-2 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              focusPct > 85 ? "bg-amber-500" : "bg-[#2D5A43]"
            }`}
            style={{ width: `${focusPct}%` }}
          />
        </div>

        <p className="text-[11px] text-stone-500 leading-tight">
          {focusPct > 85
            ? "Capacity near ceiling. Defer non-critical items to avoid exhaustion."
            : `${Math.round((maxFocusHours - plannedHours) * 10) / 10}h open buffer for spontaneous deep-work.`}
        </p>
      </Card>

      {/* Budget 2: Agent Free-Tier Quota */}
      <Card className="p-4 bg-white border border-[#E7E5E0] shadow-xs space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-stone-600 flex items-center gap-1.5">
            <Cpu className="h-3.5 w-3.5 text-blue-600" />
            <span>Agent Free-Tier Quota</span>
          </span>
          <span className="font-bold text-blue-800">{geminiQuotaLeft} / {geminiQuotaTotal} calls</span>
        </div>

        <div className="w-full bg-[#FAF9F5] border border-[#E7E5E0] h-2 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 transition-all duration-300"
            style={{ width: `${geminiPct}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-stone-500">
          <span>Gemini & Groq failover</span>
          <span className="font-medium text-stone-700">Resets in 6h</span>
        </div>
      </Card>

      {/* Budget 3: Human Review Bandwidth */}
      <Card className="p-4 bg-white border border-[#E7E5E0] shadow-xs space-y-2.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-stone-600 flex items-center gap-1.5">
            <CheckSquare className="h-3.5 w-3.5 text-amber-600" />
            <span>Daily Review Bandwidth</span>
          </span>
          <span className="font-bold text-amber-900">{reviewPending} / {reviewLimit} outputs</span>
        </div>

        <div className="w-full bg-[#FAF9F5] border border-[#E7E5E0] h-2 rounded-full overflow-hidden">
          <div
            className="h-full bg-amber-500 transition-all duration-300"
            style={{ width: `${(reviewPending / reviewLimit) * 100}%` }}
          />
        </div>

        <p className="text-[11px] text-stone-500 leading-tight">
          Batch digest protects you from notification fatigue. Max 5 agent approvals/day.
        </p>
      </Card>
    </div>
  );
}
