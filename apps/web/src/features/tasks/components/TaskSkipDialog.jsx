"use client";

import { Calendar, ArrowRight, Clock, X } from "lucide-react";
import { Dialog, Button } from "@/components/ui";

export function TaskSkipDialog({ isOpen, task, onClose, onConfirmSkip }) {
  if (!task) return null;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Adjust Task Schedule"
      description="Life happens and priorities shift. How would you like to handle this task?"
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#E7E5E0]">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
            Selected Task
          </span>
          <p className="text-sm font-semibold text-stone-900 mt-0.5">{task.title}</p>
        </div>

        <p className="text-xs text-stone-600 font-medium">
          “No problem. Would you like to move this to tomorrow, choose another time, or leave it unscheduled?”
        </p>

        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={() => onConfirmSkip(task.id, "tomorrow")}
            className="w-full flex items-center justify-between p-3 rounded-xl border border-[#E7E5E0] bg-white hover:bg-[#F2F7F4] hover:border-[#2D5A43] transition text-left cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <Calendar className="h-4 w-4 text-[#2D5A43]" />
              <div>
                <p className="text-xs font-semibold text-stone-900">Move to Tomorrow</p>
                <p className="text-[11px] text-stone-500">Add to tomorrow&apos;s morning planning session</p>
              </div>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-stone-400 group-hover:text-[#2D5A43] group-hover:translate-x-0.5 transition" />
          </button>

          <button
            type="button"
            onClick={() => onConfirmSkip(task.id, "next_week")}
            className="w-full flex items-center justify-between p-3 rounded-xl border border-[#E7E5E0] bg-white hover:bg-[#F2F7F4] hover:border-[#2D5A43] transition text-left cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <Clock className="h-4 w-4 text-stone-500" />
              <div>
                <p className="text-xs font-semibold text-stone-900">Defer to Next Available Window</p>
                <p className="text-[11px] text-stone-500">Let adaptive planner allocate into next open slot</p>
              </div>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-stone-400 group-hover:text-[#2D5A43] group-hover:translate-x-0.5 transition" />
          </button>

          <button
            type="button"
            onClick={() => onConfirmSkip(task.id, "unscheduled")}
            className="w-full flex items-center justify-between p-3 rounded-xl border border-[#E7E5E0] bg-white hover:bg-stone-50 transition text-left cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <X className="h-4 w-4 text-stone-400" />
              <div>
                <p className="text-xs font-semibold text-stone-900">Leave Unscheduled (Goal Backlog)</p>
                <p className="text-[11px] text-stone-500">Keep inside the goal without a specific due date</p>
              </div>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-stone-400 group-hover:translate-x-0.5 transition" />
          </button>
        </div>

        <div className="pt-2 flex justify-end">
          <Button variant="ghost" size="sm" onClick={onClose} className="text-xs">
            Cancel
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
