"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input, Card, CardHeader, CardTitle, CardBody } from "@/components/ui";
import { registerSchema } from "@/features/auth/schemas/auth.schemas";
import { useRegister } from "@/features/auth/hooks/use-auth";
import { useAuthStore } from "@/features/auth/stores/auth-store";
import { Sparkles, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const reg = useRegister();
  const setAuth = useAuthStore((s) => s.setAuth);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = ({ confirmPassword, ...values }) => reg.mutate(values);

  const handleDemoAccess = () => {
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
          <CardTitle className="text-xl font-bold text-stone-900">Create Account</CardTitle>
          <p className="text-xs text-stone-500">Join a calm, adaptive productivity platform</p>
        </CardHeader>

        <CardBody className="space-y-4 pt-6">
          <button
            type="button"
            onClick={handleDemoAccess}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-[#2D5A43]/30 bg-[#EAF4EE] p-3 text-xs font-semibold text-[#2D5A43] transition hover:bg-[#DCEEE3] cursor-pointer"
          >
            <Sparkles className="h-4 w-4 text-[#2D5A43]" />
            <span>Skip registration & explore as Guest</span>
            <ArrowRight className="h-3.5 w-3.5 ml-auto text-[#2D5A43]" />
          </button>

          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-[#E7E5E0]" />
            <span className="absolute bg-white px-3 text-[11px] uppercase tracking-wider text-stone-400">
              Or sign up with email
            </span>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">Full Name</label>
              <Input
                placeholder="Alex Morgan"
                type="text"
                {...register("name")}
                error={errors.name}
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
              )}
            </div>

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
              <label className="block text-xs font-medium text-stone-700 mb-1">Password</label>
              <Input
                placeholder="At least 8 characters"
                type="password"
                {...register("password")}
                error={errors.password}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">Confirm Password</label>
              <Input
                placeholder="Repeat password"
                type="password"
                {...register("confirmPassword")}
                error={errors.confirmPassword}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>

            {reg.error && (
              <div className="rounded-xl bg-red-50 p-2.5 border border-red-200">
                <p className="text-xs text-red-700">
                  {reg.error?.response?.data?.message || "Registration failed. Try guest access instead."}
                </p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || reg.isPending}
            >
              {reg.isPending ? "Creating account…" : "Create Account"}
            </Button>
          </form>

          <div className="pt-2 text-center text-xs text-stone-500">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-[#2D5A43] hover:underline">
              Sign in
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}