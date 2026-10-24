"use client";

import { useState, useEffect } from "react";
import {
  format,
  addDays,
  startOfWeek,
  eachDayOfInterval,
  isSameDay,
  isToday,
} from "date-fns";
import {
  Calendar as CalendarIcon,
  Clock,
  AlertTriangle,
  Sparkles,
  Check,
  RotateCcw,
  Shield,
  ArrowRight,
  Sliders,
  Loader2,
} from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardBody, Button, Dialog } from "@/components/ui";
import { useTodayTasks, useUpdateTask } from "@/features/tasks";
import { useGoals } from "@/features/goals";

export default function PlannerPage() {
  const [viewMode, setViewMode] = useState("week"); // 'day' | 'week' | 'agenda'
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [undoToast, setUndoToast] = useState(null);

  const startWeek = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({
    start: startWeek,
    end: addDays(startWeek, 6),
  });

  const todayStr = format(currentDate, "yyyy-MM-dd");
  const { data: tasks, isLoading: tasksLoading } = useTodayTasks(todayStr);
  const { data: goals } = useGoals();
  const updateTask = useUpdateTask();

  // Dynamic proposed schedule comparison loaded from API
  const [scheduleData, setScheduleData] = useState([]);

  useEffect(() => {
    let active = true;
    fetch("/api/v1/schedules/preview")
      .then((res) => res.json())
      .then((data) => {
        if (active && data?.proposedSchedule) {
          setScheduleData(data.proposedSchedule);
        }
      })
      .catch((err) => console.error("Error loading schedule preview:", err));
    return () => {
      active = false;
    };
  }, [tasks]);

  const proposedSchedule = scheduleData;

  const queryClient = useQueryClient();
  const [isApplying, setIsApplying] = useState(false);

  const handleApplyProposedSchedule = async () => {
    setIsApplying(true);
    try {
      const res = await fetch("/api/v1/schedules/apply", { method: "POST" });
      const data = await res.json();
      setIsPreviewOpen(false);
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setUndoToast({
        message: data.message || "Proposed schedule successfully applied. 1 task shifted to tomorrow.",
        appliedAt: new Date(),
      });
      setTimeout(() => {
        setUndoToast(null);
      }, 6000);
    } catch (err) {
      console.error("Failed to apply schedule:", err);
      setIsPreviewOpen(false);
    } finally {
      setIsApplying(false);
    }
  };

  const handleUndo = () => {
    setUndoToast(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#E7E5E0] pb-6">
        <div>
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">
            Decision-Based Scheduler
          </span>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
            Planner & Capacity Management
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Understand time trade-offs, identify over-commitments, and preview schedule adjustments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center rounded-xl bg-white border border-[#E7E5E0] p-1 text-xs">
            {["day", "week", "agenda"].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 rounded-lg font-semibold capitalize transition cursor-pointer ${
                  viewMode === mode
                    ? "bg-[#2D5A43] text-white shadow-xs"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <Button
            onClick={() => setIsPreviewOpen(true)}
            className="text-xs flex items-center gap-1.5 bg-[#2D5A43] hover:bg-[#1E3A2F]"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Generate Schedule Preview</span>
          </Button>
        </div>
      </div>

      {/* Undo Toast Notification */}
      {undoToast && (
        <div className="rounded-xl border border-[#C6DDD1] bg-[#EAF4EE] p-4 flex items-center justify-between shadow-sm animate-in fade-in-0 duration-200">
          <div className="flex items-center gap-2.5">
            <Check className="h-4 w-4 text-[#2D5A43]" />
            <p className="text-xs font-semibold text-[#2D5A43]">{undoToast.message}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleUndo}
            className="text-xs text-stone-700 hover:text-stone-900 flex items-center gap-1"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Undo Changes</span>
          </Button>
        </div>
      )}

      {/* Available Hours & Protected Time Block Notice */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardBody className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#FAF9F5] border border-[#E7E5E0] flex items-center justify-center text-[#2D5A43]">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-400 tracking-wider block">
                Working Hours Window
              </span>
              <p className="text-sm font-bold text-stone-900">09:00 AM – 05:00 PM</p>
              <span className="text-[11px] text-stone-500">8h daily boundary</span>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-[#EAF4EE] text-[#2D5A43] flex items-center justify-center">
              <Shield className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#2D5A43] tracking-wider block">
                Protected Focus Block
              </span>
              <p className="text-sm font-bold text-stone-900">09:30 AM – 12:00 PM</p>
              <span className="text-[11px] text-stone-500">Deep work reserved • No meetings</span>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4 flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-700 tracking-wider block">
                Capacity Check
              </span>
              <p className="text-sm font-bold text-stone-900">1 Scheduling Conflict</p>
              <span className="text-[11px] text-stone-500">Afternoon buffer exceeded by 20m</span>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Conflict Resolution Banner */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-xs">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h4 className="text-xs font-bold text-amber-900">
              Schedule Alert: Afternoon Focus Window Overloaded
            </h4>
            <p className="text-xs text-amber-800 leading-relaxed">
              You planned 3 tasks totaling 2h 45m during your 2h 30m afternoon window. The planner suggests shifting
              <span className="font-semibold"> “Validate full production Turbopack build”</span> to tomorrow morning to ensure healthy buffer.
            </p>
          </div>
        </div>
        <Button
          onClick={() => setIsPreviewOpen(true)}
          size="sm"
          className="text-xs bg-amber-700 hover:bg-amber-800 text-white shrink-0 self-start sm:self-auto"
        >
          Review Proposed Adjustment
        </Button>
      </div>

      {/* Week Rhythm Grid */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-sm font-bold text-stone-900">
            Weekly Focus Distribution ({format(startWeek, "MMM d")} – {format(addDays(startWeek, 6), "MMM d")})
          </CardTitle>
          <span className="text-xs text-stone-500">Click a day to inspect</span>
        </CardHeader>
        <CardBody className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-7 gap-2">
            {weekDays.map((day) => {
              const isSelectedDay = isSameDay(day, currentDate);
              const isTodayDate = isToday(day);

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => setCurrentDate(day)}
                  className={`p-3 rounded-xl border text-left transition cursor-pointer flex flex-col justify-between min-h-[110px] ${
                    isSelectedDay
                      ? "border-[#2D5A43] bg-[#EAF4EE] ring-1 ring-[#2D5A43]"
                      : isTodayDate
                      ? "border-amber-300 bg-amber-50/40"
                      : "border-[#E7E5E0] bg-white hover:border-stone-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-800">
                      {format(day, "EEE")}
                    </span>
                    <span
                      className={`text-xs font-semibold ${
                        isSelectedDay ? "text-[#2D5A43] font-bold" : "text-stone-500"
                      }`}
                    >
                      {format(day, "d")}
                    </span>
                  </div>

                  <div className="space-y-1 my-1">
                    {isTodayDate && (
                      <span className="inline-block text-[10px] font-bold text-[#2D5A43] bg-white px-1.5 py-0.5 rounded border border-[#C6DDD1]">
                        3 Tasks
                      </span>
                    )}
                    {format(day, "EEE") === "Fri" && (
                      <span className="inline-block text-[10px] font-medium text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded">
                        2 Tasks
                      </span>
                    )}
                  </div>

                  <div className="text-[10px] text-stone-400 font-medium">
                    {format(day, "EEE") === "Wed" ? "Buffer Day" : "2h focus block"}
                  </div>
                </button>
              );
            })}
          </div>
        </CardBody>
      </Card>

      {/* Schedule Preview Comparison Modal */}
      <Dialog
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title="Schedule Preview: Proposed Plan vs Existing Plan"
        description="Review the simulated consequences before applying. Nothing changes until you approve."
        maxWidth="max-w-2xl"
      >
        {proposedSchedule.length === 0 ? (
          <div className="py-8 text-center space-y-3">
            <div className="h-10 w-10 rounded-xl bg-[#EAF4EE] text-[#2D5A43] flex items-center justify-center mx-auto">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <p className="text-sm font-semibold text-stone-900">
                No active tasks to optimize.
              </p>
              <p className="text-xs text-stone-500">
                Add tasks to today&apos;s plan or create a goal to simulate 15% focus compression buffers and avoid congestion.
              </p>
            </div>
            <div className="pt-2">
              <Button size="sm" onClick={() => setIsPreviewOpen(false)} className="text-xs">
                Back to Schedule
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="rounded-xl border border-[#E7E5E0] bg-[#FAF9F5] p-3 text-xs text-stone-600 space-y-1">
              <span className="font-semibold text-stone-900 block">Simulation Summary:</span>
              <p>
                • {proposedSchedule.length} active tasks recalibrated with 15% focus compression buffers and transition pauses.
              </p>
              <p>
                • Feasibility: Target milestones protected from cognitive congestion.
              </p>
            </div>

            {/* Comparison Table */}
            <div className="border border-[#E7E5E0] rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-[#FAF9F5] border-b border-[#E7E5E0] text-stone-500 font-semibold">
                  <tr>
                    <th className="p-3">Task Title</th>
                    <th className="p-3">Existing Slot</th>
                    <th className="p-3">Proposed Slot</th>
                    <th className="p-3">Status Impact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E7E5E0]">
                  {proposedSchedule.map((item) => (
                    <tr key={item.taskId} className="hover:bg-stone-50">
                      <td className="p-3 font-semibold text-stone-900 max-w-[200px] truncate">
                        {item.title}
                      </td>
                      <td className="p-3 text-stone-500 line-through">{item.originalSlot}</td>
                      <td className="p-3 font-medium text-[#2D5A43]">{item.proposedSlot}</td>
                      <td className="p-3">
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#EAF4EE] text-[#2D5A43]">
                          {item.feasibility}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Action Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-[#E7E5E0]">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsPreviewOpen(false)}
                className="text-xs"
              >
                Keep Existing Plan
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={isApplying}
                onClick={handleApplyProposedSchedule}
                className="text-xs flex items-center gap-1.5 bg-[#2D5A43] hover:bg-[#1E3A2F]"
              >
                {isApplying ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Applying...</span>
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4" />
                    <span>Apply Proposed Schedule</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}
