"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../stores/auth-store";
import { loginRequest, registerRequest, meRequest, logoutRequest } from "../api/auth.api";
import { authKeys } from "./auth.keys";

export function useCurrentUser() {
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);

  return useQuery({
    queryKey: authKeys.me(),
    queryFn: meRequest,
    enabled: status === "authenticated",
    staleTime: 5 * 60_000,
    initialData: user ? { user } : undefined,
  });
}

export function useLogin() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: loginRequest,
    onSuccess: ({ accessToken, user }) => {
      setAuth({ accessToken, user });
      queryClient.setQueryData(authKeys.me(), { user });
      router.replace("/dashboard");
    },
  });
}

export function useRegister() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: registerRequest,
    onSuccess: ({ accessToken, user }) => {
      setAuth({ accessToken, user });
      queryClient.setQueryData(authKeys.me(), { user });
      router.replace("/dashboard");
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const clear = useAuthStore((s) => s.clear);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutRequest,
    onSettled: () => {
      clear();
      queryClient.clear();
      router.replace("/login");
    },
  });
}