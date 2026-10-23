"use client";

import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui";
import { useTasksByGoal } from "../hooks/use-tasks";
import { TaskList } from "./task-list";
import { TaskForm } from "./task-form";

export function GoalTasksPanel({ goalId }) {
    const { data, isLoading, isError, error } = useTasksByGoal(goalId);

    return (
        <Card>
        <CardHeader>
            <CardTitle>Tasks</CardTitle>
        </CardHeader>
        <CardBody className="space-y-4">
            <TaskForm goalId={goalId} />
            <TaskList
            tasks={data}
            isLoading={isLoading}
            isError={isError}
            error={error}
            />
        </CardBody>
        </Card>
    );
}