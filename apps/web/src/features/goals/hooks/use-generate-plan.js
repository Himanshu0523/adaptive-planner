import { useMutation } from "@tanstack/react-query";
import { generateGoalPlan } from "../api/plans.api";

export function useGeneratePlan(options = {}) {
  return useMutation({
    mutationFn: (payload) => generateGoalPlan(payload),
    ...options,
  });
}
