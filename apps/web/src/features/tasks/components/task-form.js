"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input } from "@/components/ui";
import { createTaskSchema } from "../schemas/task.schemas";
import { useCreateTask } from "../hooks/use-tasks";

export function TaskForm({ goalId, onCreated }) {
    const create = useCreateTask();
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(createTaskSchema),
        defaultValues: {
        goalId,
        title: "",
        notes: "",
        dueDate: null,
        estimatedMinutes: null,
        },
    });

    const onSubmit = (values) =>
        create.mutate(
        { ...values, goalId },
        {
            onSuccess: () => {
            reset({ goalId, title: "", notes: "", dueDate: null, estimatedMinutes: null });
            onCreated?.();
            },
        }
        );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
        <Input placeholder="Task title" {...register("title")} error={errors.title} />
        {errors.title && (
            <p className="text-xs text-red-600">{errors.title.message}</p>
        )}

        <div className="grid grid-cols-2 gap-2">
            <Input type="date" {...register("dueDate")} />
            <Input
            type="number"
            min="0"
            placeholder="Minutes"
            {...register("estimatedMinutes")}
            />
        </div>

        {create.error && (
            <p className="text-xs text-red-600">
            {create.error?.response?.data?.message || "Failed to create task"}
            </p>
        )}

        <Button type="submit" size="sm" disabled={isSubmitting || create.isPending}>
            {create.isPending ? "Adding…" : "Add task"}
        </Button>
    </form>
  );
}