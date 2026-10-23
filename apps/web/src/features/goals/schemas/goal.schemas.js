import { z } from "zod";

export const GOAL_STATUS = ["draft", "in_progress", "completed", "archived"];

export const goalSchema = z.object({
  id: z.string(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional().default(""),
  category: z.string().optional().default(""),
  status: z.enum(GOAL_STATUS).default("draft"),
  targetDate: z.string().nullable().optional(),
  totalTasks: z.number().int().nonnegative().optional().default(0),
  completedTasks: z.number().int().nonnegative().optional().default(0),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const goalListSchema = z.array(goalSchema);

export const createGoalSchema = z.object({
  title: z.string().min(1, "Title is required").max(160),
  description: z.string().max(2000).optional().default(""),
  category: z.string().max(50).optional().default(""),
  targetDate: z.string().nullable().optional(),
  status: z.enum(GOAL_STATUS).optional().default("draft"),
});

export const updateGoalSchema = createGoalSchema.partial();
