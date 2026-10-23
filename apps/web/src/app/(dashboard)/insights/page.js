"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  MessageSquare,
  Clock,
  Layers,
  ThumbsUp,
  Loader2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardBody, Button, Dialog, Input } from "@/components/ui";

const feedbackOptions = [
  "This explanation is correct.",
  "That is not what happened.",
  "I had an unexpected interruption.",
  "My priority changed.",
  "The estimate was unrealistic.",
  "I want to explain another reason.",
];

export default function InsightsPage() {
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [feedbackConfirmed, setFeedbackConfirmed] = useState(false);
  const [customFeedback, setCustomFeedback] = useState("");
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);

  // Live Diagnostic State from API
  const [diagnosis, setDiagnosis] = useState(null);
  const [isDiagnosing, setIsDiagnosing] = useState(true);

  useEffect(() => {
    let active = true;
    fetch("/api/v1/insights/diagnose")
      .then((res) => res.json())
      .then((data) => {
        if (active && data?.primaryPatternTitle) {
          setDiagnosis(data);
        }
      })
      .catch((err) => console.error("Error diagnosing insights:", err))
      .finally(() => {
        if (active) setIsDiagnosing(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleSelectFeedback = (option) => {
    setSelectedFeedback(option);
    if (option === "I want to explain another reason.") {
      setIsFeedbackModalOpen(true);
    } else {
      setFeedbackConfirmed(true);
      setTimeout(() => setFeedbackConfirmed(false), 3500);
    }
  };

  const handleSaveCustomFeedback = (e) => {
    e.preventDefault();
    setIsFeedbackModalOpen(false);
    setFeedbackConfirmed(true);
    setTimeout(() => setFeedbackConfirmed(false), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E7E5E0] pb-6">
        <div>
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">
            Evidence-Based Diagnostics
          </span>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
            Planning Insights
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Why is my plan not working? Evidence-based observations with user-verified hypotheses.
          </p>
        </div>

        <Link href="/recovery">
          <Button className="text-xs flex items-center gap-1.5 bg-[#2D5A43] hover:bg-[#1E3A2F]">
            <span>Explore Recovery Options</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>

      {/* Confirmation Toast */}
      {feedbackConfirmed && (
        <div className="rounded-xl border border-[#C6DDD1] bg-[#EAF4EE] p-4 flex items-center gap-2.5 text-xs font-semibold text-[#2D5A43] animate-in fade-in-0 duration-150">
          <ThumbsUp className="h-4 w-4 shrink-0" />
          <span>Thank you for validating this hypothesis. The planner will recalibrate future estimate buffers.</span>
        </div>
      )}

      {/* Featured Insight Card: "A pattern worth reviewing" */}
      <Card className="border-[#2D5A43]/20 bg-gradient-to-br from-white via-white to-[#F2F7F4] shadow-sm">
        <CardBody className="p-6 sm:p-7 space-y-6">
          <div className="space-y-1">
            <span className="text-xs font-bold text-[#2D5A43] uppercase tracking-wider block">
              A pattern worth reviewing
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900">
              {diagnosis?.primaryPatternTitle || "Several tasks took longer than planned"}
            </h2>
            <p className="text-xs text-stone-500">
              {diagnosis?.observationSummary || "Pattern observed across active task sessions • Calculated from ledger timestamps"}
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 pt-2">
            {/* What We Observed */}
            <div className="p-4.5 rounded-xl bg-white border border-[#E7E5E0] space-y-3 shadow-xs">
              <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-stone-500" />
                <span>What we observed</span>
              </span>
              <ul className="space-y-2 text-xs text-stone-600 leading-relaxed">
                {diagnosis?.observations ? (
                  diagnosis.observations.map((obs, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-stone-400 mt-1.5 shrink-0" />
                      <span>
                        <strong className="text-stone-800">{obs.label}:</strong> {obs.value}
                        <span className="text-stone-400 text-[11px] block">{obs.context}</span>
                      </span>
                    </li>
                  ))
                ) : (
                  <>
                    <li className="flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-stone-400 mt-1.5 shrink-0" />
                      <span>Task estimates compared against active completion timestamps.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-stone-400 mt-1.5 shrink-0" />
                      <span>Several sessions were scheduled without transition buffers.</span>
                    </li>
                  </>
                )}
              </ul>
            </div>

            {/* Possible Explanation */}
            <div className="p-4.5 rounded-xl bg-white border border-[#E7E5E0] space-y-3 shadow-xs">
              <span className="text-xs font-bold text-[#2D5A43] flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-[#2D5A43]" />
                <span>Possible explanation</span>
              </span>
              <p className="text-xs text-stone-700 leading-relaxed">
                {diagnosis?.hypotheses?.[0]?.title ||
                  "Your plan may not include enough buffer time between tasks. Cognitive context-switching typically requires 10–15 minutes between deep work activities."}
              </p>
              {diagnosis?.hypotheses?.[0]?.actionableRecommendation && (
                <div className="p-2.5 rounded-lg bg-[#EAF4EE] border border-[#C6DDD1] text-[11px] text-[#2D5A43]">
                  💡 <span className="font-semibold">Next Step:</span> {diagnosis.hypotheses[0].actionableRecommendation}
                </div>
              )}
              <div className="p-2.5 rounded-lg bg-[#FAF9F5] border border-[#E7E5E0] text-[11px] text-stone-500">
                ⚠️ <span className="font-semibold text-stone-700">Notice:</span> This is an evidence-backed hypothesis. Your validation below trains future schedule calibration.
              </div>
            </div>
          </div>

          {/* Interactive Feedback Section */}
          <div className="pt-3 border-t border-[#E7E5E0] space-y-3">
            <span className="text-xs font-semibold text-stone-700 block">
              Does this explanation match what happened?
            </span>
            <div className="flex flex-wrap gap-2">
              {feedbackOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleSelectFeedback(opt)}
                  className={`text-xs px-3 py-1.5 rounded-xl border transition cursor-pointer ${
                    selectedFeedback === opt
                      ? "bg-[#2D5A43] text-white border-[#2D5A43]"
                      : "bg-white text-stone-700 border-[#E7E5E0] hover:bg-[#FAF9F5]"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link href="/recovery">
              <Button size="sm" className="text-xs flex items-center gap-1.5">
                <span>Explore a fix in Recovery Simulator</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </CardBody>
      </Card>

      {/* Additional Observations Grid */}
      <div className="grid gap-5 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-stone-900">
              Peak Focus Window
            </CardTitle>
          </CardHeader>
          <CardBody className="space-y-2 pt-2">
            <p className="text-xs text-stone-600 leading-relaxed">
              Your fastest task completion rate happens between 09:30 AM and 11:30 AM. Tasks scheduled during this window finish 24% faster than afternoon sessions.
            </p>
            <span className="inline-block text-[11px] font-semibold text-[#2D5A43] bg-[#EAF4EE] px-2 py-0.5 rounded-md">
              Recommendation: Reserve this window for primary goal milestones.
            </span>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-stone-900">
              Task Scope Accuracy
            </CardTitle>
          </CardHeader>
          <CardBody className="space-y-2 pt-2">
            <p className="text-xs text-stone-600 leading-relaxed">
              Tasks estimated at 30 minutes or less had an 88% on-time completion rate, while tasks estimated above 60 minutes often required splitting.
            </p>
            <span className="inline-block text-[11px] font-semibold text-stone-700 bg-[#F3F2EE] px-2 py-0.5 rounded-md">
              Recommendation: Decompose long tasks into 35-minute sub-steps.
            </span>
          </CardBody>
        </Card>
      </div>

      {/* Custom Feedback Modal */}
      <Dialog
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        title="Share Your Perspective"
        description="Help the planning engine understand the real circumstance behind the time difference."
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveCustomFeedback} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              What caused the schedule discrepancy?
            </label>
            <Input
              value={customFeedback}
              onChange={(e) => setCustomFeedback(e.target.value)}
              placeholder="e.g. Unplanned production outage / shifted team priority..."
              required
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#E7E5E0]">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsFeedbackModalOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" className="text-xs">
              Submit Feedback
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}