"use client";

import { useState } from "react";
import { Gauge, Check, Sparkles, Sliders } from "lucide-react";
import { Card, Button } from "@/components/ui";

export function PlanningOverheadCard({ planningMinutes = 12, executionMinutes = 150 }) {
  const [confirmedToday, setConfirmedToday] = useState(false);
  const ratio = Math.round((planningMinutes / (planningMinutes + executionMinutes)) * 100) || 7;

  return (
    <Card className="p-5 bg-white border border-[#E7E5E0] shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
          <Gauge className="h-4 w-4 text-[#2D5A43]" />
          <span>Planning Overhead Meter (&ldquo;Planning Tax&rdquo;)</span>
        </span>
        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#EAF4EE] text-[#2D5A43] border border-[#C6DDD1]">
          {ratio}% Tax • Highly Efficient
        </span>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 text-xs">
        <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#E7E5E0] space-y-1">
          <span className="text-stone-500 block">Weekly Planning & Rescheduling</span>
          <p className="text-sm font-bold text-stone-900">{planningMinutes} minutes</p>
          <span className="text-[10px] text-stone-400 block">Lightweight daily ritual</span>
        </div>

        <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#E7E5E0] space-y-1">
          <span className="text-stone-500 block">Deep Focused Execution</span>
          <p className="text-sm font-bold text-[#2D5A43]">{executionMinutes} minutes</p>
          <span className="text-[10px] text-stone-400 block">Protected focus hours</span>
        </div>
      </div>

      {/* 1-Tap Daily Confirm (When plan hasn't changed much) */}
      <div className="pt-2 border-t border-[#E7E5E0] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <p className="text-[11px] text-stone-500">
          Your schedule has 0 conflicts today. No 20-minute planning chore needed.
        </p>
        <Button
          size="sm"
          disabled={confirmedToday}
          onClick={() => setConfirmedToday(true)}
          className={`text-xs h-8 shrink-0 ${
            confirmedToday ? "bg-stone-200 text-stone-600" : "bg-[#2D5A43] hover:bg-[#1E3A2F] text-white"
          }`}
        >
          {confirmedToday ? (
            <>
              <Check className="h-3.5 w-3.5 mr-1" />
              <span>Day Confirmed</span>
            </>
          ) : (
            <>
              <Sparkles className="h-3.5 w-3.5 mr-1" />
              <span>1-Tap Confirm Day</span>
            </>
          )}
        </Button>
      </div>
    </Card>
  );
}
