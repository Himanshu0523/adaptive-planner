"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  RotateCcw,
  CheckCircle2,
  Calendar,
  Clock,
  ArrowRight,
  Shield,
  AlertTriangle,
  Sparkles,
  Check,
  Sliders,
  Loader2,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardBody, Button, Dialog } from "@/components/ui";

const defaultRecoveryStrategies = [
  {
    id: "keep_deadline",
    title: "Option 1 — Keep the Target Deadline",
    tagline: "Prioritize critical path and defer non-essential items",
    feasibility: "Highly Feasible",
    feasibilityColor: "text-[#2D5A43] bg-[#EAF4EE] border-[#C6DDD1]",
    whatChanges: [
      "Non-critical items deferred to the next iteration",
      "Focus sessions condensed to high-impact requirements",
      "Daily workload reduced to sustainable focus blocks",
    ],
    whatRemainsUnchanged: [
      "Target completion deadline remains strictly preserved",
      "Core demonstration criteria intact",
      "Upcoming commitments untouched",
    ],
    tradeoffs: "Some lower-priority polish work will be moved to post-launch.",
    affectedTasks: [
      { title: "Secondary review and formatting pass", action: "Deferred to Phase 2", date: "Next Month" },
      { title: "Core implementation block", action: "Retained on Schedule", date: "This Week" },
    ],
  },
  {
    id: "extend_deadline",
    title: "Option 2 — Extend the Deadline Gently",
    tagline: "Preserve full original scope while moving the target date",
    feasibility: "Feasible (+4 Days)",
    feasibilityColor: "text-blue-800 bg-blue-50 border-blue-200",
    whatChanges: [
      "Target deadline moved forward by 4 business days",
      "Workload distributed comfortably over 8 days instead of crunching",
      "Zero tasks cut or de-scoped",
    ],
    whatRemainsUnchanged: [
      "Complete task list and full scope preserved",
      "All success criteria met without compromise",
      "Original task duration estimates maintained",
    ],
    tradeoffs: "The goal milestone completes 4 days later than initially scheduled.",
    affectedTasks: [
      { title: "Validation test suite expansion", action: "Shifted +3 Days", date: "Next Tuesday" },
      { title: "Final demo walk-through", action: "Shifted +4 Days", date: "Next Thursday" },
    ],
  },
  {
    id: "reallocate_time",
    title: "Option 3 — Reallocate Available Time",
    tagline: "Utilize upcoming open weekend/evening buffers to stay on schedule",
    feasibility: "Conditionally Feasible",
    feasibilityColor: "text-amber-800 bg-amber-50 border-amber-200",
    whatChanges: [
      "Adds one 2-hour Saturday morning focus block",
      "Shifts administrative tasks out of weekday afternoons",
      "Increases weekly capacity by 3 hours",
    ],
    whatRemainsUnchanged: [
      "Original deadline remains unchanged",
      "Full scope retained",
      "Weekday evenings remain protected",
    ],
    tradeoffs: "Requires drawing on weekend buffer time.",
    affectedTasks: [
      { title: "Complete deep-work implementation block", action: "Scheduled for Saturday 10:00 AM", date: "This Saturday" },
      { title: "Administrative check-in", action: "Shifted to Friday 4 PM", date: "This Friday" },
    ],
  },
];

export default function RecoveryPage() {
  const [selectedStrategyId, setSelectedStrategyId] = useState("keep_deadline");
  const [appliedToast, setAppliedToast] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [strategies, setStrategies] = useState(defaultRecoveryStrategies);
  const [activeGoalInfo, setActiveGoalInfo] = useState(null);

  useEffect(() => {
    let active = true;
    fetch("/api/v1/recovery/options")
      .then((res) => res.json())
      .then((data) => {
        if (active && data?.recoveryStrategies?.length > 0) {
          setStrategies(data.recoveryStrategies);
          if (data.activeGoal) setActiveGoalInfo(data.activeGoal);
        }
      })
      .catch((err) => console.error("Error loading recovery options:", err));
    return () => {
      active = false;
    };
  }, []);

  const selectedStrategy = strategies.find((s) => s.id === selectedStrategyId) || strategies[0];

  const queryClient = useQueryClient();
  const [isApplying, setIsApplying] = useState(false);

  const handleApply = async () => {
    setIsApplying(true);
    try {
      const res = await fetch("/api/v1/recovery/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ strategyId: selectedStrategyId }),
      });
      const data = await res.json();
      setConfirmModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      setAppliedToast({
        title: `${selectedStrategy.title} Applied`,
        message: data.message || "Your schedule and task dates have been recalibrated. You can undo this anytime.",
      });
      setTimeout(() => {
        setAppliedToast(null);
      }, 7000);
    } catch (err) {
      console.error("Failed to apply recovery strategy:", err);
      setConfirmModalOpen(false);
    } finally {
      setIsApplying(false);
    }
  };

  const handleUndo = () => {
    setAppliedToast(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E7E5E0] pb-6">
        <div>
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">
            Adaptive Recovery Engine
          </span>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
            Plan Recovery Simulator
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            How can I recover without feeling like I have failed? Compare honest trade-offs and pick a path forward.
          </p>
        </div>

        <Link href="/planner">
          <Button variant="outline" className="text-xs flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            <span>View Current Schedule</span>
          </Button>
        </Link>
      </div>

      {/* Undo / Success Toast */}
      {appliedToast && (
        <div className="rounded-xl border border-[#C6DDD1] bg-[#EAF4EE] p-4 flex items-center justify-between shadow-xs animate-in fade-in-0 duration-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-[#2D5A43]" />
            <div>
              <p className="text-xs font-bold text-[#2D5A43]">{appliedToast.title}</p>
              <p className="text-[11px] text-stone-600">{appliedToast.message}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleUndo}
            className="text-xs text-stone-700 hover:text-stone-900 flex items-center gap-1"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Undo Plan Change</span>
          </Button>
        </div>
      )}

      {/* Context Banner: "Let's adjust the plan" */}
      <div className="rounded-2xl border border-[#C6DDD1] bg-[#F2F7F4] p-5 space-y-2 shadow-xs">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#2D5A43]" />
          <h3 className="text-sm font-bold text-stone-900">Let&apos;s adjust the plan together</h3>
        </div>
        <p className="text-xs text-stone-700 leading-relaxed max-w-3xl">
          <span className="font-semibold text-[#2D5A43]">Observed Situation:</span> A target milestone is at risk because available focus hours decreased by 4.5 hours this week due to unexpected commitments. Below are 3 deterministic alternatives. You retain total agency over which path to choose.
        </p>
      </div>

      {/* 3 Alternative Strategy Cards Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {recoveryStrategies.map((strat) => {
          const isSelected = strat.id === selectedStrategyId;
          return (
            <button
              key={strat.id}
              type="button"
              onClick={() => setSelectedStrategyId(strat.id)}
              className={`p-5 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between space-y-4 ${
                isSelected
                  ? "border-[#2D5A43] bg-white ring-2 ring-[#2D5A43]/20 shadow-sm"
                  : "border-[#E7E5E0] bg-white hover:border-stone-300 hover:bg-[#FAF9F5]"
              }`}
            >
              <div className="space-y-2">
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${strat.feasibilityColor}`}>
                  {strat.feasibility}
                </span>
                <h4 className="text-sm font-bold text-stone-900 leading-snug">{strat.title}</h4>
                <p className="text-xs text-stone-500 leading-relaxed">{strat.tagline}</p>
              </div>

              <div className="pt-2 border-t border-[#E7E5E0]/70 flex items-center justify-between text-xs font-semibold text-[#2D5A43]">
                <span>{isSelected ? "Currently Selected" : "Select this alternative"}</span>
                <ArrowRight className={`h-3.5 w-3.5 transition ${isSelected ? "translate-x-1" : ""}`} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Detailed Strategy Inspector Card */}
      {selectedStrategy && (
        <Card className="border-[#2D5A43]/30 shadow-sm">
          <CardHeader className="border-b border-[#E7E5E0] pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#2D5A43] tracking-wider block">
                  Detailed Strategy Breakdown
                </span>
                <CardTitle className="text-lg font-bold text-stone-900 mt-0.5">
                  {selectedStrategy.title}
                </CardTitle>
              </div>

              <Button
                onClick={() => setConfirmModalOpen(true)}
                className="text-xs flex items-center gap-1.5 bg-[#2D5A43] hover:bg-[#1E3A2F] self-start sm:self-auto"
              >
                <Check className="h-4 w-4" />
                <span>Apply this Recovery Plan</span>
              </Button>
            </div>
          </CardHeader>

          <CardBody className="p-6 space-y-6">
            {/* What Changes vs What Remains Unchanged */}
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Changes */}
              <div className="p-4 rounded-xl bg-[#FAF9F5] border border-[#E7E5E0] space-y-2.5">
                <span className="text-xs font-bold text-stone-900 block">
                  What will change:
                </span>
                <ul className="space-y-1.5 text-xs text-stone-600">
                  {selectedStrategy.whatChanges.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#2D5A43] mt-1.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Unchanged */}
              <div className="p-4 rounded-xl bg-[#FAF9F5] border border-[#E7E5E0] space-y-2.5">
                <span className="text-xs font-bold text-stone-900 block">
                  What remains unchanged:
                </span>
                <ul className="space-y-1.5 text-xs text-stone-600">
                  {selectedStrategy.whatRemainsUnchanged.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-stone-400 mt-1.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Trade-offs Banner */}
            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 text-xs text-amber-900 space-y-1">
              <span className="font-bold flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-700" />
                <span>Explicit Trade-off:</span>
              </span>
              <p className="leading-relaxed pl-5">{selectedStrategy.tradeoffs}</p>
            </div>

            {/* Preview of Affected Tasks */}
            <div className="space-y-2.5">
              <span className="text-xs font-bold text-stone-900 block">
                Preview of Affected Tasks & Dates:
              </span>
              <div className="border border-[#E7E5E0] rounded-xl overflow-hidden divide-y divide-[#E7E5E0]">
                {selectedStrategy.affectedTasks.map((t, idx) => (
                  <div key={idx} className="p-3.5 bg-white flex items-center justify-between text-xs gap-3">
                    <span className="font-semibold text-stone-900 truncate">{t.title}</span>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-stone-500">{t.date}</span>
                      <span className="px-2 py-0.5 rounded-md font-medium text-[11px] bg-[#EAF4EE] text-[#2D5A43]">
                        {t.action}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Confirmation Dialog */}
      <Dialog
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title="Confirm Recovery Plan Application"
        description="This will update your scheduled dates deterministically. You can undo this action immediately after applying."
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-[#FAF9F5] border border-[#E7E5E0] space-y-1">
            <span className="text-[10px] font-bold text-[#2D5A43] uppercase tracking-wider block">
              Strategy To Apply
            </span>
            <p className="text-sm font-bold text-stone-900">{selectedStrategy?.title}</p>
            <p className="text-xs text-stone-500 mt-1">{selectedStrategy?.tradeoffs}</p>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#E7E5E0]">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setConfirmModalOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              disabled={isApplying}
              onClick={handleApply}
              className="text-xs flex items-center gap-1.5 bg-[#2D5A43] hover:bg-[#1E3A2F]"
            >
              {isApplying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Recalibrating...</span>
                </>
              ) : (
                <span>Confirm & Recalibrate Schedule</span>
              )}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
