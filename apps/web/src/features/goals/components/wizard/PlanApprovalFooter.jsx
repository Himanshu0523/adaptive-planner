"use client";

import { Check, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui";

export function PlanApprovalFooter({
  step,
  maxStep,
  onPrev,
  onNext,
  onSavePlan,
  onSaveBasicGoal,
  isSaving,
  isGenerating,
  canProceed,
}) {
  return (
    <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-5 border-t border-[#E7E5E0] mt-6">
      {/* Left Back Button */}
      {step > 1 ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onPrev}
          className="w-full sm:w-auto text-stone-600 flex items-center gap-1.5"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Button>
      ) : (
        <div />
      )}

      {/* Right Action Buttons */}
      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
        {step < maxStep ? (
          <Button
            type="button"
            onClick={onNext}
            disabled={!canProceed || isGenerating}
            className="w-full sm:w-auto flex items-center gap-1.5"
          >
            {isGenerating ? (
              <span>Drafting your plan…</span>
            ) : (
              <>
                <span>Continue</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        ) : (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              type="button"
              variant="secondary"
              onClick={onSaveBasicGoal}
              disabled={isSaving}
              className="text-xs"
            >
              Save Goal Only
            </Button>
            <Button
              type="button"
              onClick={onSavePlan}
              disabled={isSaving}
              className="text-xs flex items-center gap-1.5 bg-[#2D5A43] hover:bg-[#1E3A2F]"
            >
              <Check className="h-4 w-4" />
              <span>{isSaving ? "Saving Plan…" : "Approve & Save Plan"}</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
