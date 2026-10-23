"use client";

import { Target, Sparkles } from "lucide-react";
import { Input } from "@/components/ui";

const goalPrompts = [
  "Prepare for a backend developer interview in 8 weeks",
  "Launch my portfolio website with 3 case studies",
  "Write and publish 4 technical articles",
  "Establish a consistent 30-minute morning study routine",
];

export function GoalDescriptionStep({ value, category, onChange, onCategoryChange }) {
  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2D5A43]">
          <Target className="h-3.5 w-3.5" />
          <span>Step 1 of 5 • Understand the Goal</span>
        </div>
        <h3 className="text-lg font-bold text-stone-900 tracking-tight">
          What would you like to achieve?
        </h3>
        <p className="text-xs text-stone-500 leading-relaxed">
          State your objective in your own words. We will break it down into realistic milestones together.
        </p>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">
            Goal statement *
          </label>
          <textarea
            rows={3}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="e.g. Prepare for a backend developer interview in 8 weeks..."
            className="w-full rounded-xl border border-[#E7E5E0] bg-white p-3.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#2D5A43]/30 focus:border-[#2D5A43]"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">
            Domain or Category
          </label>
          <Input
            placeholder="e.g. Career, Engineering, Health, Learning"
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
          />
        </div>

        {/* Suggestion Prompts */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[11px] font-medium text-stone-400 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-stone-400" />
            <span>Or click an inspiration prompt:</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            {goalPrompts.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => onChange(p)}
                className="rounded-lg border border-[#E7E5E0] bg-[#FAF9F5] px-2.5 py-1 text-xs text-stone-600 hover:border-[#2D5A43] hover:text-[#2D5A43] transition text-left cursor-pointer"
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
