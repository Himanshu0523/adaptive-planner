import { apiClient } from "@/lib/api/client";
import { goalSchema, goalListSchema } from "../schemas/goal.schemas";

const LOCAL_STORAGE_KEY = "adaptive_planner_local_goals";

// Map backend Prisma enums to frontend lowercase status strings
const BACKEND_TO_FRONTEND_STATUS = {
  DRAFT: "draft",
  ACTIVE: "in_progress",
  PAUSED: "in_progress",
  COMPLETED: "completed",
  ARCHIVED: "archived",
};
const FRONTEND_TO_BACKEND_STATUS = {
  draft: "DRAFT",
  in_progress: "ACTIVE",
  completed: "COMPLETED",
  archived: "ARCHIVED",
};

function adaptGoalFromBackend(g) {
  return {
    id: g.id,
    title: g.title,
    description: g.description ?? "",
    category: g.goalType ?? "General",
    status: BACKEND_TO_FRONTEND_STATUS[g.status] ?? "draft",
    targetDate: g.targetDate ?? null,
    totalTasks: g._count?.tasks ?? g.tasks?.length ?? 0,
    completedTasks: (g.tasks ?? []).filter((t) => t.status === "DONE").length,
    createdAt: g.createdAt,
    updatedAt: g.updatedAt,
  };
}

const initialMockGoals = [];

function getLocalGoals() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    // Purge legacy mock goals if present
    const cleaned = (parsed || []).filter(
      (g) => g.id !== "goal-1" && g.id !== "goal-2" && g.id !== "goal-3" && g.title !== "Launch MVP Web App"
    );
    if (cleaned.length !== parsed.length) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cleaned));
    }
    return cleaned;
  } catch {
    return [];
  }
}

function saveLocalGoals(goals) {
  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(goals));
  }
}

export async function listGoals(params = {}) {
  try {
    const backendParams = { ...params };
    if (params.status && params.status !== "all") {
      backendParams.status = FRONTEND_TO_BACKEND_STATUS[params.status] ?? params.status;
    }
    const { data } = await apiClient.get("/goals", { params: backendParams });
    // Backend returns { success, data, timestamp } wrapper
    const goals = Array.isArray(data) ? data : (data?.data ?? []);
    return goalListSchema.parse(goals.map(adaptGoalFromBackend));
  } catch (error) {
    if (error?.code === "ERR_NETWORK" || !error?.response || error?.code === "ECONNREFUSED") {
      let goals = getLocalGoals();
      if (params.status && params.status !== "all") {
        goals = goals.filter((g) => g.status === params.status);
      }
      return goalListSchema.parse(goals);
    }
    throw error;
  }
}

export async function getGoal(id) {
  try {
    const { data } = await apiClient.get(`/goals/${id}`);
    const goal = data?.data ?? data;
    return goalSchema.parse(adaptGoalFromBackend(goal));
  } catch (error) {
    if (error?.code === "ERR_NETWORK" || !error?.response || error?.code === "ECONNREFUSED") {
      const goals = getLocalGoals();
      const found = goals.find((g) => g.id === id);
      if (found) return goalSchema.parse(found);
      throw new Error("Goal not found");
    }
    throw error;
  }
}

export async function createGoal(payload) {
  try {
    // Translate frontend status to backend enum before sending
    const backendPayload = {
      ...payload,
      status: FRONTEND_TO_BACKEND_STATUS[payload.status] ?? undefined,
      goalType: payload.category ?? undefined,
    };
    const { data } = await apiClient.post("/goals", backendPayload);
    const goal = data?.data ?? data;
    return goalSchema.parse(adaptGoalFromBackend(goal));
  } catch (error) {
    if (error?.code === "ERR_NETWORK" || !error?.response || error?.code === "ECONNREFUSED") {
      const goals = getLocalGoals();
      const newGoal = {
        id: `goal-${Date.now()}`,
        title: payload.title,
        description: payload.description || "",
        category: payload.category || "General",
        status: payload.status || "draft",
        targetDate: payload.targetDate || null,
        totalTasks: 0,
        completedTasks: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const updated = [newGoal, ...goals];
      saveLocalGoals(updated);
      return goalSchema.parse(newGoal);
    }
    throw error;
  }
}

export async function updateGoal({ id, ...patch }) {
  try {
    const backendPatch = {
      ...patch,
      status: patch.status ? FRONTEND_TO_BACKEND_STATUS[patch.status] : undefined,
    };
    const { data } = await apiClient.patch(`/goals/${id}`, backendPatch);
    const goal = data?.data ?? data;
    return goalSchema.parse(adaptGoalFromBackend(goal));
  } catch (error) {
    if (error?.code === "ERR_NETWORK" || !error?.response || error?.code === "ECONNREFUSED") {
      const goals = getLocalGoals();
      let updatedGoal = null;
      const updated = goals.map((g) => {
        if (g.id === id) {
          updatedGoal = { ...g, ...patch, updatedAt: new Date().toISOString() };
          return updatedGoal;
        }
        return g;
      });
      if (updatedGoal) {
        saveLocalGoals(updated);
        return goalSchema.parse(updatedGoal);
      }
      throw new Error("Goal not found");
    }
    throw error;
  }
}

export async function deleteGoal(id) {
  try {
    await apiClient.delete(`/goals/${id}`);
    return id;
  } catch (error) {
    if (error?.code === "ERR_NETWORK" || !error?.response || error?.code === "ECONNREFUSED") {
      const goals = getLocalGoals();
      saveLocalGoals(goals.filter((g) => g.id !== id));
      return id;
    }
    throw error;
  }
}
