"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react";
import { Button, Input, Card, CardHeader, CardTitle, CardBody } from "@/components/ui";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#FAF9F5]">
      <Card className="w-full max-w-md shadow-xl border-[#E7E5E0]">
        <CardHeader className="space-y-1 text-center border-b border-[#E7E5E0] pb-6 pt-6">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-[#2D5A43] text-white font-bold shadow-md shadow-[#2D5A43]/20">
            AP
          </div>
          <CardTitle className="text-xl font-bold text-stone-900">Reset Your Password</CardTitle>
          <p className="text-xs text-stone-500">
            Enter your email and we&apos;ll send recovery instructions.
          </p>
        </CardHeader>

        <CardBody className="space-y-4 pt-6">
          {submitted ? (
            <div className="rounded-xl bg-[#EAF4EE] p-4 text-center space-y-2 border border-[#C6DDD1]">
              <CheckCircle2 className="h-8 w-8 text-[#2D5A43] mx-auto" />
              <h3 className="text-sm font-semibold text-stone-900">Recovery link sent</h3>
              <p className="text-xs text-stone-600">
                If an account exists for <span className="font-semibold">{email}</span>, you will receive password reset instructions shortly.
              </p>
              <div className="pt-2">
                <Link href="/login" className="text-xs font-semibold text-[#2D5A43] hover:underline">
                  Return to sign in
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                Send Reset Link
              </Button>

              <div className="pt-2 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-stone-600 hover:text-stone-900"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </form>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
