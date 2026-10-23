import { create } from "zustand";

const TOKEN_KEY = "adaptive_planner_token";
const USER_KEY = "adaptive_planner_user";

export const useAuthStore = create((set) => ({
  accessToken: null,
  user: null,
  status: "idle", // 'idle' | 'authenticating' | 'authenticated' | 'unauthenticated'

  initializeAuth: () => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem(TOKEN_KEY);
    const storedUser = localStorage.getItem(USER_KEY);
    if (token) {
      let parsedUser = null;
      try {
        parsedUser = storedUser ? JSON.parse(storedUser) : null;
      } catch {
        parsedUser = null;
      }
      set({ accessToken: token, user: parsedUser, status: "authenticated" });
    } else {
      set({ accessToken: null, user: null, status: "unauthenticated" });
    }
  },

  setAuth: ({ accessToken, user }) => {
    if (typeof window !== "undefined") {
      if (accessToken) {
        localStorage.setItem(TOKEN_KEY, accessToken);
        if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
    }
    set({
      accessToken,
      user,
      status: accessToken ? "authenticated" : "unauthenticated",
    });
  },

  setAccessToken: (token) => {
    if (typeof window !== "undefined") {
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
    }
    set({
      accessToken: token,
      status: token ? "authenticated" : "unauthenticated",
    });
  },

  setStatus: (status) => set({ status }),

  clear: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
    set({ accessToken: null, user: null, status: "unauthenticated" });
  },
}));

/** Non-hook accessor for use inside axios interceptors. */
export const getAccessToken = () => {
  if (typeof window !== "undefined") {
    return useAuthStore.getState().accessToken || localStorage.getItem(TOKEN_KEY);
  }
  return useAuthStore.getState().accessToken;
};

export const clearAuth = () => useAuthStore.getState().clear();