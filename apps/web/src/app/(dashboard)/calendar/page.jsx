"use client";

import { useState } from "react";
import Link from "next/link";
import {
  format,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sliders,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardBody, Button } from "@/components/ui";
import { useTodayTasks } from "@/features/tasks";
import { useGoals } from "@/features/goals";

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const formattedSelected = format(selectedDate, "yyyy-MM-dd");
  const { data: tasksForDate, isLoading: tasksLoading } = useTodayTasks(formattedSelected);
  const { data: allGoals } = useGoals();

  const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const handleToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDate(now);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E7E5E0] pb-6">
        <div>
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">
            Calendar View
          </span>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
            Schedule & Deadlines
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            A peaceful monthly overview of your commitments, milestone targets, and daily action distribution.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/planner">
            <Button variant="outline" size="sm" className="text-xs flex items-center gap-1.5">
              <Sliders className="h-3.5 w-3.5 text-[#2D5A43]" />
              <span>Open Capacity Planner</span>
            </Button>
          </Link>
          <div className="flex items-center border border-[#E7E5E0] rounded-xl bg-white overflow-hidden shadow-xs">
            <button
              onClick={handlePrevMonth}
              className="p-2 hover:bg-[#FAF9F5] text-stone-600 transition cursor-pointer"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-3 text-xs font-bold text-stone-800">
              {format(currentDate, "MMMM yyyy")}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-[#FAF9F5] text-stone-600 transition cursor-pointer"
              aria-label="Next month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar Grid */}
        <div className="lg:col-span-2">
          <Card className="shadow-xs">
            <CardBody className="p-4 sm:p-5">
              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-stone-400 pb-3 border-b border-[#E7E5E0]">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                  <div key={day} className="py-1">
                    {day}
                  </div>
                ))}
              </div>

              {/* Day Cells */}
              <div className="grid grid-cols-7 gap-1 pt-2">
                {days.map((day) => {
                  const dayStr = format(day, "yyyy-MM-dd");
                  const isCurrentMonth = isSameMonth(day, monthStart);
                  const isSelected = isSameDay(day, selectedDate);
                  const isCurrentDay = isToday(day);

                  // Goals targeted on this day
                  const goalsOnDay = (allGoals || []).filter((g) => g.targetDate === dayStr);

                  return (
                    <button
                      key={dayStr}
                      type="button"
                      onClick={() => setSelectedDate(day)}
                      className={`min-h-[76px] sm:min-h-[92px] p-2 text-left rounded-xl border transition flex flex-col justify-between cursor-pointer ${
                        isSelected
                          ? "border-[#2D5A43] bg-[#EAF4EE] ring-1 ring-[#2D5A43]"
                          : isCurrentDay
                          ? "border-amber-300 bg-amber-50/40"
                          : isCurrentMonth
                          ? "border-[#E7E5E0] bg-white hover:border-stone-300"
                          : "border-transparent bg-[#FAF9F5] text-stone-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-bold ${
                            isSelected
                              ? "text-[#2D5A43]"
                              : isCurrentDay
                              ? "text-amber-800"
                              : isCurrentMonth
                              ? "text-stone-800"
                              : "text-stone-300"
                          }`}
                        >
                          {format(day, "d")}
                        </span>
                        {isCurrentDay && (
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                        )}
                      </div>

                      {goalsOnDay.length > 0 && (
                        <div className="mt-1">
                          <span className="inline-block truncate rounded-md bg-[#E2EDE7] px-1.5 py-0.5 text-[10px] font-bold text-[#2D5A43] max-w-full">
                            🎯 {goalsOnDay[0].title}
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Selected Day Agenda */}
        <div>
          <Card className="shadow-xs">
            <CardHeader className="border-b border-[#E7E5E0] pb-3">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-[#2D5A43]" />
                <CardTitle className="text-sm font-bold text-stone-900">
                  {format(selectedDate, "EEEE, MMMM do")}
                </CardTitle>
              </div>
            </CardHeader>
            <CardBody className="space-y-3 pt-4">
              {tasksLoading ? (
                <div className="space-y-2">
                  <div className="h-12 bg-stone-100 animate-pulse rounded-xl" />
                  <div className="h-12 bg-stone-100 animate-pulse rounded-xl" />
                </div>
              ) : (tasksForDate || []).length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="h-8 w-8 mx-auto text-stone-300 mb-2" />
                  <p className="text-xs text-stone-500 font-medium">
                    No tasks scheduled for this day.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {(tasksForDate || []).map((t) => (
                    <div
                      key={t.id}
                      className="p-3 rounded-xl border border-[#E7E5E0] bg-[#FAF9F5] flex items-start gap-2.5"
                    >
                      <CheckCircle2
                        className={`h-4 w-4 mt-0.5 shrink-0 ${
                          t.status === "done" ? "text-[#2D5A43]" : "text-stone-300"
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-xs font-semibold truncate ${
                            t.status === "done"
                              ? "text-stone-400 line-through"
                              : "text-stone-900"
                          }`}
                        >
                          {t.title}
                        </p>
                        {t.estimatedMinutes && (
                          <span className="text-[11px] text-stone-500">
                            ~{t.estimatedMinutes} mins
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}