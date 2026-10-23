"use client";

import { useState } from "react";
import { CheckCircle2, Clock, ThumbsUp } from "lucide-react";
import { Dialog, Button, Input } from "@/components/ui";

export function TaskReflectionDialog({ isOpen, task, onClose, onConfirmComplete }) {
  const [actualMinutes, setActualMinutes] = useState(task?.estimatedMinutes || 30);
  const [notes, setNotes] = useState("");

  if (!task) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirmComplete(task.id, {
      actualMinutes: Number(actualMinutes),
      notes: notes.trim(),
    });
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Task Completed!"
      description="Nice progress. An optional quick check-in helps the adaptive scheduler learn your real pace."
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3.5 rounded-xl bg-[#EAF4EE] border border-[#C6DDD1] flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-[#2D5A43] shrink-0" />
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-bold text-[#2D5A43] tracking-wider block">
              Marked Complete
            </span>
            <p className="text-xs font-semibold text-stone-900 truncate mt-0.5">{task.title}</p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-stone-400" />
            <span>Actual time spent (minutes)</span>
          </label>
          <Input
            type="number"
            min="5"
            step="5"
            value={actualMinutes}
            onChange={(e) => setActualMinutes(e.target.value)}
          />
          <p className="text-[11px] text-stone-500 mt-1">
            Planned: ~{task.estimatedMinutes || 30} minutes
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">
            Brief takeaway or outcome note (Optional)
          </label>
          <Input
            placeholder="e.g. Wrapped up section 1; ready for review"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="pt-2 flex items-center justify-between border-t border-[#E7E5E0]">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onConfirmComplete(task.id, {})}
            className="text-xs text-stone-500"
          >
            Skip reflection
          </Button>

          <Button type="submit" size="sm" className="text-xs flex items-center gap-1.5">
            <ThumbsUp className="h-3.5 w-3.5" />
            <span>Save & Done</span>
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
