import { apiClient } from "@/lib/api/client";

/**
 * Calls the AI Plan Generator route handler (/api/v1/plans/generate)
 * Accepts { title, category, criteria, targetDate, hoursPerWeek, selectedDays }
 */
export async function generateGoalPlan(payload) {
  const { data } = await apiClient.post("/plans/generate", payload);
  return data;
}
