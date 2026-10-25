"use client";

import { Shield, Sparkles, AlertTriangle, Check } from "lucide-react";

export function ExitRampsStep({ exitRamps, setExitRamps }) {
  const availableSignals = [
    {
      id: "SCHEDULE_SLIP_DAYS",
      title: "Schedule Slip Buffer",
      description: "If deadlines slip by more than 7 days, open a calm checkpoint with Plan Autopsy evidence rather than forcing overtime.",
      defaultValue: 7,
      unit: "days",
    },
    {
      id: "EFFORT_THRESHOLD",
      title: "Effort Cap Without Deliverable",
      description: "If 15 hours of focused work are logged without completing milestone 1, pause to re-scope before sinking more time.",
      defaultValue: 15,
      unit: "hours",
    },
    {
      id: "CONSECUTIVE_UNRESOLVED_BLOCKERS",
      title: "External Dependency Blocker Pivot",
      description: "If blocked by a third party or external dependency for more than 3 days, pivot to unblocked parallel tracks automatically.",
      defaultValue: 3,
      unit: "days",
    },
  ];

  const toggleRamp = (signalId) => {
    if (exitRamps.some((r) => r.id === signalId)) {
      setExitRamps(exitRamps.filter((r) => r.id !== signalId));
    } else {
      const match = availableSignals.find((s) => s.id === signalId);
      if (match) {
        setExitRamps([
          ...exitRamps,
          {
            id: match.id,
            title: match.title,
            thresholdValue: match.defaultValue,
            description: match.description,
          },
        ]);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#EAF4EE] text-[#2D5A43] border border-[#C6DDD1]">
          <Shield className="h-3 w-3" />
          <span>Exit Ramps & Psychological Safety</span>
        </div>
        <h3 className="text-xl font-bold text-stone-900">
          Pre-committed Stop & Pivot Signals
        </h3>
        <p className="text-xs text-stone-600 leading-relaxed max-w-xl">
          Decide now, while your mind is clear, when you will pause or pivot. If one of these conditions trips during execution, Adaptive Planner will open a supportive checkpoint with Plan Autopsy evidence—so you never feel like you failed.
        </p>
      </div>

      <div className="space-y-3">
        {availableSignals.map((signal) => {
          const isSelected = exitRamps.some((r) => r.id === signal.id);
          return (
            <div
              key={signal.id}
              onClick={() => toggleRamp(signal.id)}
              className={`p-4 rounded-xl border text-left cursor-pointer transition flex items-start justify-between gap-3 ${
                isSelected
                  ? "border-[#2D5A43] bg-white ring-1 ring-[#2D5A43]/20 shadow-xs"
                  : "border-[#E7E5E0] bg-[#FAF9F5] hover:bg-white"
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-stone-900">{signal.title}</span>
                  <span className="text-[10px] font-semibold text-[#2D5A43] bg-[#EAF4EE] px-2 py-0.5 rounded">
                    Threshold: {signal.defaultValue} {signal.unit}
                  </span>
                </div>
                <p className="text-[11px] text-stone-600 leading-relaxed max-w-lg">
                  {signal.description}
                </p>
              </div>

              <div
                className={`h-5 w-5 rounded-md border flex items-center justify-center shrink-0 transition ${
                  isSelected
                    ? "bg-[#2D5A43] border-[#2D5A43] text-white"
                    : "border-stone-300 bg-white"
                }`}
              >
                {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-3.5 rounded-xl bg-[#FAF9F5] border border-[#E7E5E0] text-[11px] text-stone-600 flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-[#2D5A43] shrink-0" />
        <span>
          Pre-committing to exit signals prevents the sunk-cost fallacy and protects your creative momentum.
        </span>
      </div>
    </div>
  );
}
