import { z } from "zod";
import { TASK_STATUS } from "../lib/task-status";


export const taskSchema = z.object({
    id: z.string(),
    goalId: z.string(),
    title: z.string().min(1),
    notes: z.string().optional().default(""),
    status: z.enum(TASK_STATUS),
    dueDate: z.string().nullable().optional(),
    estimatedMinutes: z.number().int().nonnegative().nullable().optional(),
    createdAt: z.string(),
    updatedAt: z.string(),
});


export const taskListSchema = z.array(taskSchema);


export const createTaskSchema = z.object({
    goalId: z.string().min(1),
    title: z.string().min(1, "Title is required").max(160),
    notes: z.string().max(2000).optional().default(""),
    dueDate: z.string().nullable().optional(),
    estimatedMinutes: z.coerce.number().int().nonnegative().nullable().optional(),
});


export const updateTaskSchema = createTaskSchema.partial().extend({
    status: z.enum(TASK_STATUS).optional(),
});


export const changeTaskStatusSchema = z.object({
    id: z.string(),
    status: z.enum(TASK_STATUS),
});