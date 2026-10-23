"use client";

import { CheckCircle2, Clock, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui";

export function MilestoneCard({
  milestone,
  onTaskChange,
  onDeleteTask,
  onAddTask,
}) {
  return (
    <div className="rounded-xl border border-[#E7E5E0] bg-white p-4 space-y-3 shadow-xs">
      {/* Milestone Header */}
      <div className="flex items-center justify-between border-b border-[#E7E5E0]/60 pb-2.5">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#2D5A43]">
            Milestone {milestone.order || 1}
          </span>
          <h4 className="text-sm font-bold text-stone-900">{milestone.title}</h4>
        </div>
        <span className="text-xs text-stone-500 font-medium">
          Target: {milestone.targetWeek || "Week 2"}
        </span>
      </div>

      {/* Child Tasks List */}
      <div className="space-y-2">
        {milestone.tasks.map((task, idx) => (
          <div
            key={task.id || idx}
            className="flex items-center justify-between p-2.5 rounded-lg border border-[#E7E5E0]/80 bg-[#FAF9F5] text-xs gap-3"
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-stone-400 shrink-0" />
              <input
                type="text"
                value={task.title}
                onChange={(e) => onTaskChange(milestone.id, idx, "title", e.target.value)}
                className="bg-transparent font-medium text-stone-800 focus:outline-none w-full"
                placeholder="Task description..."
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-1 text-stone-500 bg-white px-2 py-0.5 rounded border border-[#E7E5E0]">
                <Clock className="h-3 w-3 text-stone-400" />
                <input
                  type="number"
                  min="5"
                  step="5"
                  value={task.estimatedMinutes || 30}
                  onChange={(e) =>
                    onTaskChange(milestone.id, idx, "estimatedMinutes", Number(e.target.value))
                  }
                  className="w-10 bg-transparent text-right font-medium text-stone-700 focus:outline-none"
                />
                <span className="text-[10px]">m</span>
              </div>

              <button
                type="button"
                onClick={() => onDeleteTask(milestone.id, idx)}
                className="text-stone-400 hover:text-red-600 p-1"
                aria-label="Remove task"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Task Button */}
      <button
        type="button"
        onClick={() => onAddTask(milestone.id)}
        className="inline-flex items-center gap-1 text-xs font-semibold text-[#2D5A43] hover:underline pt-1"
      >
        <Plus className="h-3.5 w-3.5" />
        <span>Add a step to this milestone</span>
      </button>
    </div>
  );
}
