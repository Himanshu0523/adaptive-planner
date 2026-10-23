"use client";

import { useState } from "react";
import { AlertCircle, ShieldAlert, Check } from "lucide-react";
import { Dialog, Button, Input } from "@/components/ui";

const commonBlockers = [
  "Waiting on external review or teammate reply",
  "Missing credentials, API keys, or permissions",
  "Scope ambiguity — requirements need clarification",
  "Technical dependency or bug upstream",
];

export function TaskBlockerDialog({ isOpen, task, onClose, onConfirmBlocker }) {
  const [reason, setReason] = useState("");
  const [resolutionAction, setResolutionAction] = useState("");

  if (!task) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) return;
    onConfirmBlocker(task.id, reason.trim(), resolutionAction.trim());
    setReason("");
    setResolutionAction("");
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Report a Task Blocker"
      description="Record what is stopping progress so the planner can suggest a workaround or remove scheduling pressure."
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#E7E5E0]">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
            Blocked Item
          </span>
          <p className="text-sm font-semibold text-stone-900 mt-0.5">{task.title}</p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">
            What is blocking this task? *
          </label>
          <Input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Describe the obstacle..."
            required
          />
        </div>

        {/* Quick Blocker Tags */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-medium text-stone-500">
            Or select common blocker:
          </span>
          <div className="flex flex-col gap-1.5">
            {commonBlockers.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setReason(b)}
                className="text-left text-xs p-2 rounded-lg border border-[#E7E5E0] bg-white hover:bg-[#FAF9F5] hover:border-amber-400 text-stone-700 transition cursor-pointer"
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">
            Next resolution step (Optional)
          </label>
          <Input
            value={resolutionAction}
            onChange={(e) => setResolutionAction(e.target.value)}
            placeholder="e.g. Ping Sarah for API key access tomorrow morning"
          />
        </div>

        <div className="pt-2 flex items-center justify-end gap-2 border-t border-[#E7E5E0]">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} className="text-xs">
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={!reason.trim()}
            className="text-xs bg-amber-700 hover:bg-amber-800 text-white"
          >
            Mark as Blocked
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
