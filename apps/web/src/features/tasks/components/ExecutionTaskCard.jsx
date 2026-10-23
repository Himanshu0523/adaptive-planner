"use client";

import { useState } from "react";
import {
  Play,
  Pause,
  CheckCircle2,
  Clock,
  MoreVertical,
  Calendar,
  AlertTriangle,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui";

export function ExecutionTaskCard({
  task,
  goalTitle,
  onStart,
  onPause,
  onComplete,
  onPartialProgress,
  onSkip,
  onBlock,
  onReopen,
}) {
  const [showMenu, setShowMenu] = useState(false);

  const isPlanned = task.status === "todo" || task.status === "planned";
  const isInProgress = task.status === "in_progress";
  const isDone = task.status === "done";
  const isBlocked = task.status === "blocked";

  return (
    <div
      className={`rounded-2xl border p-4 sm:p-5 transition-all shadow-xs ${
        isInProgress
          ? "border-[#2D5A43] bg-gradient-to-r from-white via-white to-[#F2F7F4] ring-2 ring-[#2D5A43]/15"
          : isDone
          ? "border-[#E7E5E0] bg-[#FAF9F5] opacity-80"
          : isBlocked
          ? "border-amber-300 bg-amber-50/30"
          : "border-[#E7E5E0] bg-white hover:border-[#C6DDD1]"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Left Side: Goal, Title, Duration */}
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-block rounded-md bg-[#F3F2EE] px-2 py-0.5 text-[10px] font-bold text-stone-600 uppercase tracking-wider">
              {goalTitle || "Primary Goal"}
            </span>

            {isInProgress && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#E2EDE7] px-2.5 py-0.5 text-[11px] font-semibold text-[#2D5A43] animate-pulse">
                <span className="h-1.5 w-1.5 rounded-full bg-[#2D5A43]" />
                <span>Session Active</span>
              </span>
            )}

            {isBlocked && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-800">
                <AlertTriangle className="h-3 w-3" />
                <span>Blocked</span>
              </span>
            )}
          </div>

          <h3
            className={`text-sm sm:text-base font-semibold leading-snug ${
              isDone ? "text-stone-400 line-through" : "text-stone-900"
            }`}
          >
            {task.title}
          </h3>

          {task.notes && (
            <p className="text-xs text-stone-500 line-clamp-1">{task.notes}</p>
          )}

          <div className="flex items-center gap-3 text-xs text-stone-500 pt-0.5">
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-stone-400" />
              <span>{task.estimatedMinutes ? `~${task.estimatedMinutes} mins` : "Flexible"}</span>
            </span>
            {task.dueDate && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-stone-400" />
                <span>Due today</span>
              </span>
            )}
          </div>
        </div>

        {/* Right Side: Primary and Secondary Action Buttons */}
        <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E7E5E0]">
          {/* Primary Action Button Based on State Machine */}
          {isPlanned && (
            <Button
              size="sm"
              onClick={() => onStart(task.id)}
              className="text-xs flex items-center gap-1.5 px-4"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>Start</span>
            </Button>
          )}

          {isInProgress && (
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onPause(task.id)}
                className="text-xs flex items-center gap-1"
              >
                <Pause className="h-3.5 w-3.5" />
                <span>Pause</span>
              </Button>
              <Button
                size="sm"
                onClick={() => onComplete(task.id)}
                className="text-xs flex items-center gap-1.5 bg-[#2D5A43] hover:bg-[#1E3A2F]"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Complete</span>
              </Button>
            </div>
          )}

          {isDone && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onReopen(task.id)}
              className="text-xs text-stone-600 flex items-center gap-1"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reopen</span>
            </Button>
          )}

          {isBlocked && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onStart(task.id)}
              className="text-xs text-[#2D5A43] border-[#C6DDD1]"
            >
              Unblock & Start
            </Button>
          )}

          {/* Secondary Actions Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-[#F3F2EE] transition cursor-pointer"
              aria-label="More task actions"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-20"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-8 z-30 w-44 rounded-xl border border-[#E7E5E0] bg-white p-1.5 shadow-lg text-xs space-y-0.5">
                  {isInProgress && (
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onPartialProgress(task.id);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#FAF9F5] text-stone-700 cursor-pointer"
                    >
                      Record partial work
                    </button>
                  )}
                  {!isDone && (
                    <>
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          onSkip(task);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#FAF9F5] text-stone-700 cursor-pointer"
                      >
                        Reschedule / Defer
                      </button>
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          onBlock(task);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-amber-50 text-amber-800 cursor-pointer"
                      >
                        Report a blocker
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
