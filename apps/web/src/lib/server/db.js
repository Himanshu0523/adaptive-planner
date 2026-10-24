/**
 * Server-side Data Store for Adaptive Planner API
 * Provides in-memory persistence with pre-populated starter records.
 */

const todayStr = new Date().toISOString().split("T")[0];

let users = [
  {
    id: "usr-demo-1",
    name: "Alex Morgan",
    email: "demo@adaptiveplanner.io",
    password: "password123",
    role: "OWNER",
    workspaceId: "ws-demo-001",
    createdAt: new Date().toISOString(),
  },
];

let goals = [];

let tasks = [];


export const db = {
  // Goals
  getGoals(filter = {}) {
    let result = [...goals];
    if (filter.status && filter.status !== "all") {
      result = result.filter((g) => g.status === filter.status);
    }
    return result;
  },

  getGoalById(id) {
    return goals.find((g) => g.id === id) || null;
  },

  createGoal(data) {
    const newGoal = {
      id: `goal-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: data.title,
      description: data.description || "",
      category: data.category || "General",
      status: data.status || "in_progress",
      targetDate: data.targetDate || null,
      totalTasks: Number(data.totalTasks) || 0,
      completedTasks: Number(data.completedTasks) || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    goals.unshift(newGoal);
    return newGoal;
  },

  updateGoal(id, patch) {
    const idx = goals.findIndex((g) => g.id === id);
    if (idx === -1) return null;
    goals[idx] = {
      ...goals[idx],
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    return goals[idx];
  },

  deleteGoal(id) {
    goals = goals.filter((g) => g.id !== id);
    tasks = tasks.filter((t) => t.goalId !== id);
    return true;
  },

  // Tasks
  getTasks(filter = {}) {
    let result = [...tasks];
    if (filter.goalId) {
      result = result.filter((t) => t.goalId === filter.goalId);
    }
    if (filter.date) {
      result = result.filter((t) => !filter.date || t.dueDate === filter.date || !t.dueDate);
    }
    return result;
  },

  getTaskById(id) {
    return tasks.find((t) => t.id === id) || null;
  },

  createTask(data) {
    const newTask = {
      id: `task-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      goalId: data.goalId || null,
      title: data.title,
      notes: data.notes || "",
      status: data.status || "todo",
      dueDate: data.dueDate || todayStr,
      estimatedMinutes: Number(data.estimatedMinutes) || 30,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    tasks.push(newTask);

    // Update goal task count if goalId is provided
    if (data.goalId) {
      const g = goals.find((item) => item.id === data.goalId);
      if (g) {
        g.totalTasks = (g.totalTasks || 0) + 1;
      }
    }

    return newTask;
  },

  updateTask(id, patch) {
    const idx = tasks.findIndex((t) => t.id === id);
    if (idx === -1) return null;

    const oldStatus = tasks[idx].status;
    tasks[idx] = {
      ...tasks[idx],
      ...patch,
      updatedAt: new Date().toISOString(),
    };

    // If status changed to/from done, update parent goal
    if (patch.status && patch.status !== oldStatus && tasks[idx].goalId) {
      const g = goals.find((item) => item.id === tasks[idx].goalId);
      if (g) {
        if (patch.status === "done" && oldStatus !== "done") {
          g.completedTasks = (g.completedTasks || 0) + 1;
        } else if (oldStatus === "done" && patch.status !== "done") {
          g.completedTasks = Math.max((g.completedTasks || 1) - 1, 0);
        }
      }
    }

    return tasks[idx];
  },

  deleteTask(id) {
    const taskToDelete = tasks.find((t) => t.id === id);
    if (taskToDelete && taskToDelete.goalId) {
      const g = goals.find((item) => item.id === taskToDelete.goalId);
      if (g) {
        g.totalTasks = Math.max((g.totalTasks || 1) - 1, 0);
        if (taskToDelete.status === "done") {
          g.completedTasks = Math.max((g.completedTasks || 1) - 1, 0);
        }
      }
    }
    tasks = tasks.filter((t) => t.id !== id);
    return true;
  },

  // Users & Authentication
  findUserByEmail(email) {
    if (!email) return null;
    return users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase()) || null;
  },

  findUserById(id) {
    return users.find((u) => u.id === id) || null;
  },

  createUser({ name, email, password }) {
    const newUser = {
      id: `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: "OWNER",
      workspaceId: `ws-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    return newUser;
  },

  verifyUser(email, password) {
    const user = this.findUserByEmail(email);
    if (!user) return null;
    if (user.password !== password) return null;
    return user;
  },

  generateAuthToken(user) {
    return `jwt_${Buffer.from(
      JSON.stringify({
        userId: user.id,
        email: user.email,
        name: user.name,
        exp: Date.now() + 86400000,
      })
    ).toString("base64url")}`;
  },
};
