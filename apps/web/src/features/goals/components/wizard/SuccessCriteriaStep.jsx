"use client";

import { CheckCircle2, Plus, Trash2 } from "lucide-react";
import { Input, Button } from "@/components/ui";

export function SuccessCriteriaStep({ criteria, onChange }) {
  const handleAdd = () => {
    onChange([...criteria, ""]);
  };

  const handleUpdate = (index, val) => {
    const updated = [...criteria];
    updated[index] = val;
    onChange(updated);
  };

  const handleRemove = (index) => {
    onChange(criteria.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2D5A43]">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>Step 2 of 5 • Define Success</span>
        </div>
        <h3 className="text-lg font-bold text-stone-900 tracking-tight">
          What does a successful outcome look like?
        </h3>
        <p className="text-xs text-stone-500 leading-relaxed">
          Tangible, measurable milestones make progress concrete and prevent ambiguous plans.
        </p>
      </div>

      <div className="space-y-2.5">
        <label className="block text-xs font-semibold text-stone-700">
          Measurable Criteria (at least one)
        </label>

        {criteria.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#2D5A43] w-5 text-right">{idx + 1}.</span>
            <Input
              value={item}
              onChange={(e) => handleUpdate(idx, e.target.value)}
              placeholder="e.g. Complete 40 LeetCode Medium problems, or pass 2 mock interviews..."
              className="flex-1"
            />
            {criteria.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="p-2 text-stone-400 hover:text-red-600 transition"
                aria-label="Remove criterion"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2D5A43] hover:underline pt-1 cursor-pointer"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add another success measure</span>
        </button>
      </div>
    </div>
  );
}
