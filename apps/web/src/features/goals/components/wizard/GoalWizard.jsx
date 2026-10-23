"use client";

import { useState } from "react";
import { format, addWeeks, addDays } from "date-fns";
import { GoalDescriptionStep } from "./GoalDescriptionStep";
import { SuccessCriteriaStep } from "./SuccessCriteriaStep";
import { AvailabilityStep } from "./AvailabilityStep";
import { GeneratedPlanReview } from "./GeneratedPlanReview";
import { PlanApprovalFooter } from "./PlanApprovalFooter";
import { useCreateGoal, useGeneratePlan } from "@/features/goals";
import { useCreateTask } from "@/features/tasks";
import { AlertCircle, Sparkles, Loader2 } from "lucide-react";

export function GoalWizard({ onComplete, onCancel }) {
  const [step, setStep] = useState(1);
  const maxStep = 4; // 1: Desc, 2: Criteria, 3: Constraints, 4: Plan Review

  // Goal Inputs
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Engineering");
  const [criteria, setCriteria] = useState([""]);
  const defaultTarget = format(addWeeks(new Date(), 6), "yyyy-MM-dd");
  const [targetDate, setTargetDate] = useState(defaultTarget);
  const [hoursPerWeek, setHoursPerWeek] = useState(8);
  const [selectedDays, setSelectedDays] = useState(["Mon", "Tue", "Thu", "Sat"]);

  // Generated Plan State
  const [isGenerating, setIsGenerating] = useState(false);
  const [milestones, setMilestones] = useState([]);
  const [errorMsg, setErrorMsg] = useState(null);

  const createGoal = useCreateGoal();
  const createTask = useCreateTask();
  const generatePlanMutation = useGeneratePlan();

  // Real LLM / Adaptive Plan Generator
  const generateDraftPlan = async (goalTitle) => {
    setIsGenerating(true);
    setErrorMsg(null);
    try {
      const plan = await generatePlanMutation.mutateAsync({
        title: (goalTitle || title).trim(),
        category,
        criteria,
        targetDate,
        hoursPerWeek,
        selectedDays,
      });

      if (plan?.milestones && Array.isArray(plan.milestones) && plan.milestones.length > 0) {
        setMilestones(plan.milestones);
        setStep(4);
      } else {
        throw new Error("Plan was generated without milestones");
      }
    } catch (err) {
      console.error("AI Plan generation error:", err);
      setErrorMsg(
        err?.response?.data?.message ||
        err?.message ||
        "Could not generate plan with AI right now. You can try again or save a manual goal."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNext = () => {
    if (step === 3) {
      generateDraftPlan(title);
    } else {
      setStep((s) => Math.min(s + 1, maxStep));
    }
  };

  const handlePrev = () => {
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleTaskChange = (milestoneId, taskIdx, field, value) => {
    setMilestones((prev) =>
      prev.map((m) => {
        if (m.id !== milestoneId) return m;
        const newTasks = [...m.tasks];
        newTasks[taskIdx] = { ...newTasks[taskIdx], [field]: value };
        return { ...m, tasks: newTasks };
      })
    );
  };

  const handleDeleteTask = (milestoneId, taskIdx) => {
    setMilestones((prev) =>
      prev.map((m) => {
        if (m.id !== milestoneId) return m;
        return { ...m, tasks: m.tasks.filter((_, i) => i !== taskIdx) };
      })
    );
  };

  const handleAddTask = (milestoneId) => {
    setMilestones((prev) =>
      prev.map((m) => {
        if (m.id !== milestoneId) return m;
        return {
          ...m,
          tasks: [
            ...m.tasks,
            {
              id: `t-${Date.now()}`,
              title: "New action step",
              estimatedMinutes: 30,
            },
          ],
        };
      })
    );
  };

  // Save full plan with milestones and child tasks
  const handleSaveFullPlan = async () => {
    const totalTasksCount = milestones.reduce((sum, m) => sum + m.tasks.length, 0);

    createGoal.mutate(
      {
        title: title.trim(),
        description: `Success criteria: ${criteria.filter(Boolean).join("; ") || "Defined in milestones"}`,
        category: category || "General",
        status: "in_progress",
        targetDate: targetDate || null,
        totalTasks: totalTasksCount,
        completedTasks: 0,
      },
      {
        onSuccess: (newGoal) => {
          // Schedule initial tasks for the goal intelligently distributed across phases
          const now = new Date();
          milestones.forEach((m, mIdx) => {
            m.tasks.forEach((t, tIdx) => {
              let dayOffset = 0;
              if (mIdx === 0) {
                // Phase 1 tasks start today and in the upcoming days
                dayOffset = tIdx === 0 ? 0 : tIdx * 2;
              } else if (mIdx === 1) {
                // Phase 2 tasks are scheduled across weeks 2 to 3
                dayOffset = 7 + tIdx * 3;
              } else {
                // Phase 3 tasks are scheduled in weeks 4+
                dayOffset = 18 + tIdx * 4;
              }

              const taskDueDate = format(addDays(now, dayOffset), "yyyy-MM-dd");

              createTask.mutate({
                goalId: newGoal.id,
                title: t.title,
                notes: `${m.title || `Phase ${mIdx + 1}`} · ${t.estimatedMinutes || 30} min focus block`,
                estimatedMinutes: t.estimatedMinutes || 30,
                dueDate: taskDueDate,
              });
            });
          });
          onComplete?.(newGoal);
        },
      }
    );
  };

  // Fallback: Save basic goal manually
  const handleSaveBasicGoal = () => {
    createGoal.mutate(
      {
        title: title.trim(),
        description: `Success criteria: ${criteria.filter(Boolean).join("; ") || "Manual planning"}`,
        category: category || "General",
        status: "in_progress",
        targetDate: targetDate || null,
        totalTasks: 0,
        completedTasks: 0,
      },
      {
        onSuccess: (newGoal) => onComplete?.(newGoal),
      }
    );
  };

  const canProceed =
    step === 1 ? Boolean(title.trim()) : step === 2 ? criteria.some((c) => Boolean(c.trim())) : true;

  return (
    <div className="space-y-4">
      {/* Progress Dots */}
      <div className="flex items-center justify-between pb-3 border-b border-[#E7E5E0]">
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all ${
                i === step
                  ? "w-8 bg-[#2D5A43]"
                  : i < step
                  ? "w-2.5 bg-[#70A48E]"
                  : "w-2.5 bg-[#E7E5E0]"
              }`}
            />
          ))}
        </div>
        <span className="text-xs font-semibold text-stone-500">
          Step {step} of {maxStep}
        </span>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 flex items-start gap-2.5 text-xs text-red-800 animate-in fade-in-0 duration-150">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">{errorMsg}</p>
            <p className="text-stone-500 text-[11px] mt-0.5">
              You can retry generating, edit your inputs, or use &quot;Save Goal Only&quot; to proceed.
            </p>
          </div>
        </div>
      )}

      {/* Loading Overlay / Progress Indicator when generating */}
      {isGenerating && (
        <div className="rounded-xl border border-[#C6DDD1] bg-[#F2F7F4] p-6 text-center space-y-3 animate-in fade-in-0 duration-150">
          <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-[#EAF4EE] text-[#2D5A43]">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-stone-900 flex items-center justify-center gap-1.5">
              <Sparkles className="h-4 w-4 text-[#2D5A43]" />
              AI Planning Coach is structuring your goal
            </h4>
            <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
              Breaking down &ldquo;{title || "your goal"}&rdquo; into realistic milestones and bite-sized focus tasks based on your weekly availability.
            </p>
          </div>
        </div>
      )}

      {/* Dynamic Step View */}
      {step === 1 && (
        <GoalDescriptionStep
          value={title}
          category={category}
          onChange={setTitle}
          onCategoryChange={setCategory}
        />
      )}

      {step === 2 && (
        <SuccessCriteriaStep criteria={criteria} onChange={setCriteria} />
      )}

      {step === 3 && (
        <AvailabilityStep
          targetDate={targetDate}
          hoursPerWeek={hoursPerWeek}
          selectedDays={selectedDays}
          onTargetDateChange={setTargetDate}
          onHoursChange={setHoursPerWeek}
          onDaysChange={setSelectedDays}
        />
      )}

      {step === 4 && (
        <GeneratedPlanReview
          milestones={milestones}
          onTaskChange={handleTaskChange}
          onDeleteTask={handleDeleteTask}
          onAddTask={handleAddTask}
          onRegenerate={() => generateDraftPlan(title)}
          isRegenerating={isGenerating}
        />
      )}

      {/* Footer Controls */}
      <PlanApprovalFooter
        step={step}
        maxStep={maxStep}
        onPrev={handlePrev}
        onNext={handleNext}
        onSavePlan={handleSaveFullPlan}
        onSaveBasicGoal={handleSaveBasicGoal}
        isSaving={createGoal.isPending}
        isGenerating={isGenerating}
        canProceed={canProceed}
      />
    </div>
  );
}
