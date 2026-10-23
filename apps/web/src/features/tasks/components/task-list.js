"use client";

import { TaskRow } from "./task-row";
import { Skeleton } from "@/components/feedback/skeleton";
import { EmptyState } from "@/components/feedback/empty-state";



export function TaskList({ tasks,isLoading , isError , error , emptyLabel }) {
    if (isLoading) {
        return (
            <div className="space-y-2">
                {Array.from({ length: 3 }).map((_ , i) => (
                    <Skeleton key = {i} className="h-14 w-full" />
                ))}
            </div>
        );
    }

    if (isError) {
        return (
        <EmptyState
            title="Couldn't load tasks"
            description={error?.response?.data?.message || error.message}
        />
        );
    }

    if (!tasks?.length) {
        return <EmptyState title={emptyLabel || "No tasks yet"} />;
    }

    return (
        <div className="space-y-2">
            {tasks.map((t) => (
                <TaskRow key={t.id} task={t} />
            ))}
        </div>
  );
}