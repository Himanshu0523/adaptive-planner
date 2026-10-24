import { apiClient } from "@/lib/api/client";
import { taskSchema, taskListSchema } from "../schemas/task.schemas";

const LOCAL_STORAGE_KEY = "adaptive_planner_local_tasks";

const todayStr = new Date().toISOString().split("T")[0];

// Map backend Prisma enums to frontend lowercase status strings
const BACKEND_TO_FRONTEND_STATUS = {
  TODO: "todo",
  IN_PROGRESS: "in_progress",
  BLOCKED: "blocked",
  DONE: "done",
  CANCELLED: "cancelled",
};

const FRONTEND_TO_BACKEND_STATUS = {
  todo: "TODO",
  in_progress: "IN_PROGRESS",
  blocked: "BLOCKED",
  done: "DONE",
  cancelled: "CANCELLED",
};

function adaptTaskFromBackend(t) {
  return {
    id: t.id,
    goalId: t.goalId || t.goal?.id || "goal-1",
    title: t.title,
    notes: t.notes ?? "",
    status: BACKEND_TO_FRONTEND_STATUS[t.status] || (typeof t.status === "string" ? t.status.toLowerCase() : "todo"),
    dueDate: t.dueDate ?? (t.dueAt ? String(t.dueAt).slice(0, 10) : null),
    estimatedMinutes: t.estimatedMinutes != null ? Number(t.estimatedMinutes) : null,
    createdAt: t.createdAt ?? new Date().toISOString(),
    updatedAt: t.updatedAt ?? new Date().toISOString(),
  };
}

const initialMockTasks = [];

function getLocalTasks() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    // Purge legacy mock tasks if present
    const cleaned = (parsed || []).filter(
      (t) =>
        t.id !== "task-1" &&
        t.id !== "task-2" &&
        t.id !== "task-3" &&
        t.id !== "task-4" &&
        t.title !== "Implement frontend feedback components"
    );
    if (cleaned.length !== parsed.length) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch {
    return [];
  }
}

function saveLocalTasks(tasks) {
  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks));
  }
}

export async function listTasksByGoal(goalId, params = {}) {
  try {
    const { data } = await apiClient.get(`/goals/${goalId}/tasks`, { params });
    const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
    return taskListSchema.parse(list.map(adaptTaskFromBackend));
  } catch (error) {
    if (error?.code === "ERR_NETWORK" || !error?.response || error?.code === "ECONNREFUSED") {
      const tasks = getLocalTasks().filter((t) => t.goalId === goalId);
      return taskListSchema.parse(tasks);
    }
    throw error;
  }
}

export async function listTodayTasks(date, params = {}) {
  try {
    const { data } = await apiClient.get("/tasks/today", {
      params: { date, ...params },
    });
    const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
    return taskListSchema.parse(list.map(adaptTaskFromBackend));
  } catch (error) {
    if (error?.code === "ERR_NETWORK" || !error?.response || error?.code === "ECONNREFUSED") {
      const tasks = getLocalTasks().filter((t) => !date || t.dueDate === date || !t.dueDate);
      return taskListSchema.parse(tasks);
    }
    throw error;
  }
}

export async function createTask(payload) {
  try {
    const backendPayload = {
      ...payload,
      dueAt: payload.dueDate ? new Date(payload.dueDate).toISOString() : undefined,
    };
    const { data } = await apiClient.post("/tasks", backendPayload);
    const item = data?.data ?? data;
    return taskSchema.parse(adaptTaskFromBackend(item));
  } catch (error) {
    if (error?.code === "ERR_NETWORK" || !error?.response || error?.code === "ECONNREFUSED") {
      const tasks = getLocalTasks();
      const newTask = {
        id: `task-${Date.now()}`,
        goalId: payload.goalId,
        title: payload.title,
        notes: payload.notes || "",
        status: "todo",
        dueDate: payload.dueDate || null,
        estimatedMinutes: payload.estimatedMinutes ? Number(payload.estimatedMinutes) : null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      saveLocalTasks([newTask, ...tasks]);
      return taskSchema.parse(newTask);
    }
    throw error;
  }
}

export async function updateTask({ id, ...patch }) {
  try {
    const backendPatch = {
      ...patch,
      status: patch.status ? FRONTEND_TO_BACKEND_STATUS[patch.status] || patch.status : undefined,
      dueAt: patch.dueDate !== undefined ? (patch.dueDate ? new Date(patch.dueDate).toISOString() : null) : undefined,
    };
    const { data } = await apiClient.patch(`/tasks/${id}`, backendPatch);
    const item = data?.data ?? data;
    return taskSchema.parse(adaptTaskFromBackend(item));
  } catch (error) {
    if (error?.code === "ERR_NETWORK" || !error?.response || error?.code === "ECONNREFUSED") {
      const tasks = getLocalTasks();
      let updatedTask = null;
      const updated = tasks.map((t) => {
        if (t.id === id) {
          updatedTask = { ...t, ...patch, updatedAt: new Date().toISOString() };
          return updatedTask;
        }
        return t;
      });
      if (updatedTask) {
        saveLocalTasks(updated);
        return taskSchema.parse(updatedTask);
      }
      throw new Error("Task not found");
    }
    throw error;
  }
}

export async function changeTaskStatus({ id, status }) {
  try {
    const backendStatus = FRONTEND_TO_BACKEND_STATUS[status] || status.toUpperCase();
    const { data } = await apiClient.patch(`/tasks/${id}/status`, { status: backendStatus });
    const item = data?.data ?? data;
    return taskSchema.parse(adaptTaskFromBackend(item));
  } catch (error) {
    if (error?.code === "ERR_NETWORK" || !error?.response || error?.code === "ECONNREFUSED") {
      const tasks = getLocalTasks();
      let updatedTask = null;
      const updated = tasks.map((t) => {
        if (t.id === id) {
          updatedTask = { ...t, status, updatedAt: new Date().toISOString() };
          return updatedTask;
        }
        return t;
      });
      if (updatedTask) {
        saveLocalTasks(updated);
        return taskSchema.parse(updatedTask);
      }
      throw new Error("Task not found");
    }
    throw error;
  }
}

export async function deleteTask(id) {
  try {
    await apiClient.delete(`/tasks/${id}`);
    return id;
  } catch (error) {
    if (error?.code === "ERR_NETWORK" || !error?.response || error?.code === "ECONNREFUSED") {
      const tasks = getLocalTasks();
      saveLocalTasks(tasks.filter((t) => t.id !== id));
      return id;
    }
    throw error;
  }
}