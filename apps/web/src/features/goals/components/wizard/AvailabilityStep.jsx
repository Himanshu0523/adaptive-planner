"use client";

import { Calendar, Clock, Sliders } from "lucide-react";
import { Input } from "@/components/ui";

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function AvailabilityStep({
  targetDate,
  hoursPerWeek,
  selectedDays,
  onTargetDateChange,
  onHoursChange,
  onDaysChange,
}) {
  const toggleDay = (day) => {
    if (selectedDays.includes(day)) {
      onDaysChange(selectedDays.filter((d) => d !== day));
    } else {
      onDaysChange([...selectedDays, day]);
    }
  };

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2D5A43]">
          <Sliders className="h-3.5 w-3.5" />
          <span>Step 3 of 5 • Understand Constraints</span>
        </div>
        <h3 className="text-lg font-bold text-stone-900 tracking-tight">
          What are your time and availability constraints?
        </h3>
        <p className="text-xs text-stone-500 leading-relaxed">
          The planner calibrates task duration around realistic capacity so you never face impossible workloads.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Target Deadline */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-stone-500" />
            <span>Target completion deadline</span>
          </label>
          <Input
            type="date"
            value={targetDate}
            onChange={(e) => onTargetDateChange(e.target.value)}
            required
          />
        </div>

        {/* Weekly Hours */}
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-stone-500" />
            <span>Available focus hours / week</span>
          </label>
          <Input
            type="number"
            min="1"
            max="60"
            value={hoursPerWeek}
            onChange={(e) => onHoursChange(Number(e.target.value))}
            placeholder="e.g. 8"
          />
        </div>
      </div>

      {/* Preferred Working Days */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-stone-700">
          Preferred focus days
        </label>
        <div className="flex flex-wrap gap-2">
          {daysOfWeek.map((day) => {
            const isSelected = selectedDays.includes(day);
            return (
              <button
                key={day}
                type="button"
                onClick={() => toggleDay(day)}
                className={`h-9 w-12 rounded-xl text-xs font-semibold transition border cursor-pointer ${
                  isSelected
                    ? "bg-[#2D5A43] text-white border-[#2D5A43] shadow-xs"
                    : "bg-white text-stone-600 border-[#E7E5E0] hover:bg-[#FAF9F5]"
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>
        <p className="text-[11px] text-stone-400">
          Tasks will only be scheduled into your selected focus days.
        </p>
      </div>
    </div>
  );
}
