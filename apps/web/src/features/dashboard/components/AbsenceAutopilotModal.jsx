"use client";

import { useState } from "react";
import { Moon, Sparkles, ArrowRight, RotateCcw, Calendar, Check } from "lucide-react";
import { Dialog, Button } from "@/components/ui";

export function AbsenceAutopilotModal({ isOpen, onClose, daysAway = 4, onDecision }) {
  const [selectedOption, setSelectedOption] = useState("ramp_up");

  const options = [
    {
      id: "resume_pace",
      title: "1. Resume Regular Pace",
      tagline: "Keep your standard 4h daily focus ceiling and absorb deferred tasks over the next 2 weeks.",
      badge: "Normal Pace",
      badgeColor: "bg-[#EAF4EE] text-[#2D5A43] border-[#C6DDD1]",
    },
    {
      id: "ramp_up",
      title: "2. Gentle Ramp-Up Week (Recommended)",
      tagline: "Half-capacity (2h/day) for the next 3 days to get settled without feeling overwhelmed or behind.",
      badge: "Supportive Ramp",
      badgeColor: "bg-blue-50 text-blue-800 border-blue-200",
    },
    {
      id: "replan",
      title: "3. Clean Slate Re-Plan",
      tagline: "Archive obsolete backlog items and re-align milestone dates with your current reality.",
      badge: "Fresh Start",
      badgeColor: "bg-purple-50 text-purple-800 border-purple-200",
    },
  ];

  const handleConfirm = () => {
    onDecision?.(selectedOption);
    onClose();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title=""
      maxWidth="max-w-lg"
    >
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-[#EAF4EE] text-[#2D5A43] flex items-center justify-center shrink-0">
            <Moon className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#2D5A43] block">
              Absence Autopilot Activated
            </span>
            <h3 className="text-lg font-bold text-stone-900">
              Welcome back. You were away for {daysAway} days.
            </h3>
          </div>
        </div>

        <p className="text-xs text-stone-600 leading-relaxed">
          While you were away, <strong>Absence Autopilot protected your schedule</strong>: deadlines automatically slid forward (+{daysAway} days), recurring tasks did not pile up, and agents paused to save your free-tier quota. Zero guilt.
        </p>

        <div className="space-y-2.5">
          <span className="text-xs font-bold text-stone-800 block">
            Choose how you would like to step back in:
          </span>

          {options.map((opt) => {
            const isSelected = selectedOption === opt.id;
            return (
              <div
                key={opt.id}
                onClick={() => setSelectedOption(opt.id)}
                className={`p-3.5 rounded-xl border text-left cursor-pointer transition flex items-start justify-between gap-3 ${
                  isSelected
                    ? "border-[#2D5A43] bg-white ring-2 ring-[#2D5A43]/20 shadow-xs"
                    : "border-[#E7E5E0] bg-[#FAF9F5] hover:bg-white"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-stone-900">{opt.title}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${opt.badgeColor}`}>
                      {opt.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-600 leading-relaxed">
                    {opt.tagline}
                  </p>
                </div>

                <div
                  className={`h-5 w-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition ${
                    isSelected ? "bg-[#2D5A43] border-[#2D5A43] text-white" : "border-stone-300 bg-white"
                  }`}
                >
                  {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-2 border-t border-[#E7E5E0] flex items-center justify-end gap-2">
          <Button
            size="sm"
            onClick={handleConfirm}
            className="text-xs bg-[#2D5A43] hover:bg-[#1E3A2F]"
          >
            <span>Confirm & Update Workspace</span>
            <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
