"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input, Card, CardHeader, CardTitle, CardBody } from "@/components/ui";
import { loginSchema } from "@/features/auth/schemas/auth.schemas";
import { useLogin } from "@/features/auth/hooks/use-auth";
import { useAuthStore } from "@/features/auth/stores/auth-store";
import { Sparkles, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const login = useLogin();
  const setAuth = useAuthStore((s) => s.setAuth);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "demo@adaptiveplanner.io",
      password: "password123",
    },
  });

  const onSubmit = (values) => login.mutate(values);

  const handleDemoLogin = () => {
    setAuth({
      accessToken: "demo-jwt-token-local",
      user: {
        id: "demo-user-1",
        name: "Alex Morgan",
        email: "demo@adaptiveplanner.io",
      },
    });
    router.replace("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#FAF9F5]">
      <Card className="w-full max-w-md shadow-xl border-[#E7E5E0]">
        <CardHeader className="space-y-1 text-center border-b border-[#E7E5E0] pb-6 pt-6">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-[#2D5A43] text-white font-bold shadow-md shadow-[#2D5A43]/20">
            AP
          </div>
          <CardTitle className="text-xl font-bold text-stone-900">Welcome Back</CardTitle>
          <p className="text-xs text-stone-500">Sign in to your Adaptive Planner account</p>
        </CardHeader>

        <CardBody className="space-y-4 pt-6">
          <button
            type="button"
            onClick={handleDemoLogin}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-[#2D5A43]/30 bg-[#EAF4EE] p-3 text-xs font-semibold text-[#2D5A43] transition hover:bg-[#DCEEE3] cursor-pointer"
          >
            <Sparkles className="h-4 w-4 text-[#2D5A43]" />
            <span>Instant Demo / Guest Access</span>
            <ArrowRight className="h-3.5 w-3.5 ml-auto text-[#2D5A43]" />
          </button>

          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-[#E7E5E0]" />
            <span className="absolute bg-white px-3 text-[11px] uppercase tracking-wider text-stone-400">
              Or sign in with email
            </span>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">Email</label>
              <Input
                placeholder="name@example.com"
                type="email"
                {...register("email")}
                error={errors.email}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-stone-700">Password</label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] font-medium text-[#2D5A43] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                placeholder="••••••••"
                type="password"
                {...register("password")}
                error={errors.password}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>

            {login.error && (
              <div className="rounded-xl bg-red-50 p-2.5 border border-red-200">
                <p className="text-xs text-red-700">
                  {login.error?.response?.data?.message || "Login failed. You can use Instant Demo Access above."}
                </p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || login.isPending}
            >
              {login.isPending ? "Signing in…" : "Sign In"}
            </Button>
          </form>

          <div className="pt-2 text-center text-xs text-stone-500">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-semibold text-[#2D5A43] hover:underline">
              Create an account
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}