"use client";

import Link from "next/link";
import { MoreVertical, Trash2, Edit2, Calendar } from "lucide-react";
import { Card, CardHeader, CardTitle, CardBody, Button } from "@/components/ui";
import { cn } from "@/lib/utils/cn";

export function GoalCard({ goal, onDelete, onEdit }) {
  const progress = goal.totalTasks > 0 
    ? Math.round((goal.completedTasks / goal.totalTasks) * 100) 
    : 0;

  return (
    <Card className="group relative flex flex-col justify-between transition-all hover:shadow-md">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1 pr-4">
          <Link
            href={`/goals/${goal.id}`}
            className="text-base font-semibold text-slate-900 hover:underline hover:text-brand-600 line-clamp-1"
          >
            {goal.title}
          </Link>
          {goal.category && (
            <span className="inline-block text-xs font-medium text-slate-500 uppercase tracking-wider">
              {goal.category}
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(goal)}
              aria-label="Edit goal"
            >
              <Edit2 className="h-4 w-4 text-slate-500" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(goal.id)}
              aria-label="Delete goal"
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardBody className="space-y-4 pt-2">
        {/* Description */}
        {goal.description && (
          <p className="text-sm text-slate-600 line-clamp-2">
            {goal.description}
          </p>
        )}

        {/* Progress Bar (if task metrics are present) */}
        {goal.totalTasks !== undefined && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-500 font-medium">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-brand-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Footer Meta Details */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          {goal.targetDate && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span>Target: {goal.targetDate}</span>
            </div>
          )}

          {goal.status && (
            <span
              className={cn(
                "px-2 py-0.5 rounded-full font-medium capitalize",
                goal.status === "completed" && "bg-green-100 text-green-700",
                goal.status === "in_progress" && "bg-blue-100 text-blue-700",
                goal.status === "draft" && "bg-slate-100 text-slate-600"
              )}
            >
              {goal.status.replace("_", " ")}
            </span>
          )}
        </div>
      </CardBody>
    </Card>
  );
}