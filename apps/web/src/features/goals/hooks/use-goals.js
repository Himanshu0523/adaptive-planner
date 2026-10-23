"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { goalKeys } from "../keys";
import {
  listGoals,
  getGoal,
  createGoal,
  updateGoal,
  deleteGoal,
} from "../api/goals.api";

export function useGoal(goalId) {
  return useQuery({
    queryKey: goalKeys.detail(goalId),
    queryFn: () => getGoal(goalId),
    enabled: Boolean(goalId),
    staleTime: 30_000,
  });
}

export function useGoals(filters = {}) {
  return useQuery({
    queryKey: goalKeys.list(filters),
    queryFn: () => listGoals(filters),
    staleTime: 30_000,
  });
}

export function useCreateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createGoal,
    onSuccess: (newGoal) => {
      queryClient.invalidateQueries({ queryKey: goalKeys.lists() });
      queryClient.setQueryData(goalKeys.detail(newGoal.id), newGoal);
    },
  });
}

export function useUpdateGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateGoal,
    onMutate: async (patch) => {
      const detailKey = goalKeys.detail(patch.id);
      await queryClient.cancelQueries({ queryKey: detailKey });
      const previousGoal = queryClient.getQueryData(detailKey);
      if (previousGoal) {
        queryClient.setQueryData(detailKey, { ...previousGoal, ...patch });
      }
      return { previousGoal, detailKey };
    },
    onError: (err, patch, context) => {
      if (context?.previousGoal && context?.detailKey) {
        queryClient.setQueryData(context.detailKey, context.previousGoal);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: goalKeys.lists() });
    },
  });
}

export function useDeleteGoal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteGoal,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: goalKeys.lists() });
      const snapshots = queryClient.getQueriesData({ queryKey: goalKeys.lists() });
      snapshots.forEach(([key, data]) => {
        if (Array.isArray(data)) {
          queryClient.setQueryData(key, data.filter((g) => g.id !== id));
        }
      });
      return { snapshots };
    },
    onError: (err, id, context) => {
      context?.snapshots?.forEach(([key, data]) => queryClient.setQueryData(key, data));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: goalKeys.lists() });
    },
  });
}
