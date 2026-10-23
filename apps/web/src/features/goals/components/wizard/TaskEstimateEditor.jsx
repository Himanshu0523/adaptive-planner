"use client";

import { Clock, Plus } from "lucide-react";

export function TaskEstimateEditor({ tasks, onChange }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
        <span>Suggested action items</span>
        <span>Duration</span>
      </div>
      {tasks.map((task, idx) => (
        <div
          key={idx}
          className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-[#E7E5E0] bg-white text-xs"
        >
          <input
            type="text"
            value={task.title}
            onChange={(e) => {
              const updated = [...tasks];
              updated[idx] = { ...updated[idx], title: e.target.value };
              onChange(updated);
            }}
            className="flex-1 bg-transparent font-medium text-stone-900 focus:outline-none"
            placeholder="Action step title..."
          />

          <div className="flex items-center gap-1.5 text-stone-500 bg-[#FAF9F5] px-2.5 py-1 rounded-lg border border-[#E7E5E0]">
            <Clock className="h-3.5 w-3.5 text-stone-400" />
            <input
              type="number"
              min="10"
              step="5"
              value={task.estimatedMinutes || 30}
              onChange={(e) => {
                const updated = [...tasks];
                updated[idx] = { ...updated[idx], estimatedMinutes: Number(e.target.value) };
                onChange(updated);
              }}
              className="w-10 bg-transparent text-right font-medium text-stone-800 focus:outline-none"
            />
            <span className="text-[10px]">mins</span>
          </div>
        </div>
      ))}
    </div>
  );
}
