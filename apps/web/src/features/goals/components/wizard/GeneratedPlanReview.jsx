"use client";

import { Sparkles, Info, RefreshCw } from "lucide-react";
import { MilestoneCard } from "./MilestoneCard";
import { Button } from "@/components/ui";

export function GeneratedPlanReview({
  milestones,
  onTaskChange,
  onDeleteTask,
  onAddTask,
  onRegenerate,
  isRegenerating,
}) {
  const totalTasks = milestones.reduce((acc, m) => acc + m.tasks.length, 0);
  const totalMinutes = milestones.reduce(
    (acc, m) => acc + m.tasks.reduce((sum, t) => sum + (t.estimatedMinutes || 30), 0),
    0
  );
  const totalHours = (totalMinutes / 60).toFixed(1);

  return (
    <div className="space-y-5">
      {/* Step Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2D5A43]">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Step 4 & 5 • Review & Customize Draft Plan</span>
        </div>
        <h3 className="text-lg font-bold text-stone-900 tracking-tight">
          Review Proposed Milestones & Tasks
        </h3>
        <p className="text-xs text-stone-500 leading-relaxed">
          Here is a draft plan tailored to your available hours. All milestones, tasks, and estimates are editable suggestions.
        </p>
      </div>

      {/* AI Suggestion Banner (Intelligent but transparent) */}
      <div className="rounded-xl border border-[#C6DDD1] bg-[#F2F7F4] p-3 text-xs text-stone-700 flex items-start gap-2.5">
        <Info className="h-4 w-4 text-[#2D5A43] shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-semibold text-[#2D5A43]">AI Guidance Note:</span>
          <p className="text-stone-600 leading-snug">
            Estimates and sequences are recommendations based on typical velocity. You can adjust task titles, re-estimate durations, or delete steps before saving.
          </p>
        </div>
      </div>

      {/* Plan Summary Chips */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-[#FAF9F5] border border-[#E7E5E0] text-xs">
        <div className="flex items-center gap-4 text-stone-600 font-medium">
          <span>{milestones.length} Milestones</span>
          <span>•</span>
          <span>{totalTasks} Action Steps</span>
          <span>•</span>
          <span>~{totalHours} Total Hours</span>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRegenerate}
          disabled={isRegenerating}
          className="text-xs bg-white text-stone-700 border-[#E7E5E0] hover:bg-stone-50 flex items-center gap-1.5"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRegenerating ? "animate-spin" : ""}`} />
          <span>Regenerate Draft</span>
        </Button>
      </div>

      {/* Milestones List */}
      <div className="space-y-3.5">
        {milestones.map((milestone) => (
          <MilestoneCard
            key={milestone.id}
            milestone={milestone}
            onTaskChange={onTaskChange}
            onDeleteTask={onDeleteTask}
            onAddTask={onAddTask}
          />
        ))}
      </div>
    </div>
  );
}
