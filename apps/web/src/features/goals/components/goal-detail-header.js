"use client";

import { useGoal } from "../hooks/use-goals";
import { Skeleton } from "@/components/feedback/skeleton";
import { EmptyState } from "@/components/feedback/empty-state";

export function GoalDetailHeader({ goalId }) {
  const { data, isLoading, isError, error } = useGoal(goalId);

  if (isLoading) {
    return <Skeleton className="h-16 w-1/2" />;
  }
  if (isError) {
    return <EmptyState title="Goal not found" description={error?.message} />;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">{data.title}</h1>
        {data.description && (
            <p className="mt-1 text-sm text-slate-500">{data.description}</p>
        )}
    </div>
  );
}