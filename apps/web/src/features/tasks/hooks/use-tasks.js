"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { taskKeys } from "../keys";
import { goalKeys } from "@/features/goals/keys";
import {
  listTasksByGoal,
  listTodayTasks,
  createTask,
  updateTask,
  changeTaskStatus,
  deleteTask,
} from "../api/tasks.api";
import { canTransition } from "../lib/task-status";

export function useTasksByGoal(goalId, filters = {}) {
  return useQuery({
    queryKey: taskKeys.byGoal(goalId, filters),
    queryFn: () => listTasksByGoal(goalId, filters),
    enabled: Boolean(goalId),
    staleTime: 30_000,
  });
}

export function useTodayTasks(date) {
  return useQuery({
    queryKey: taskKeys.today(date),
    queryFn: () => listTodayTasks(date),
    enabled: Boolean(date),
    staleTime: 30_000,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createTask,
    onSuccess: (newTask) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      queryClient.invalidateQueries({ queryKey: goalKeys.details(newTask.goalId) });
      queryClient.setQueryData(taskKeys.detail(newTask.id), newTask);
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateTask,
    onMutate: async (patch) => {
      const detailKey = taskKeys.detail(patch.id);
      await queryClient.cancelQueries({ queryKey: detailKey });
      const previousTask = queryClient.getQueryData(detailKey);

      if (previousTask) {
        queryClient.setQueryData(detailKey, { ...previousTask, ...patch });
      }

      return { previousTask, detailKey };
    },
    onError: (err, patch, context) => {
      if (context?.previousTask && context?.detailKey) {
        queryClient.setQueryData(context.detailKey, context.previousTask);
      }
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: taskKeys.lists() }),
  });
}

export function useChangeTaskStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: changeTaskStatus,
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.lists() });
      const snapshots = queryClient.getQueriesData({ queryKey: taskKeys.lists() });

      snapshots.forEach(([key, data]) => {
        if (!Array.isArray(data)) return;
        const next = data.map((task) => {
          if (task.id !== id) return task;
          if (!canTransition(task.status, status)) return task;
          return { ...task, status };
        });
        queryClient.setQueryData(key, next);
      });
      return { snapshots };
    },
    onError: (err, { id }, context) => {
      if (context?.snapshots) {
        context.snapshots.forEach(([key, data]) => {
          queryClient.setQueryData(key, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTask,
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: taskKeys.lists() });
      const snapshots = queryClient.getQueriesData({ queryKey: taskKeys.lists() });
      snapshots.forEach(([key, data]) => {
        if (Array.isArray(data)) {
          queryClient.setQueryData(key, data.filter((task) => task.id !== id));
        }
      });
      return { snapshots };
    },
    onError: (err, id, context) => {
      context?.snapshots?.forEach(([key, data]) => queryClient.setQueryData(key, data));
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
}
