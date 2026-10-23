import { apiClient } from "@/lib/api/client";
import { authResponseSchema } from "../schemas/auth.schemas";

export async function loginRequest(payload) {
  const { data } = await apiClient.post("/auth/login", payload);
  return authResponseSchema.parse(data);
}

export async function registerRequest(payload) {
  const { data } = await apiClient.post("/auth/register", payload);
  return authResponseSchema.parse(data);
}

export async function meRequest() {
  const { data } = await apiClient.get("/auth/me");
  return data;
}

export async function logoutRequest() {
  await apiClient.post("/auth/logout");
}