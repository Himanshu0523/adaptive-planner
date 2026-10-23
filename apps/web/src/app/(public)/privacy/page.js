import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#FAF9F5] text-stone-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-stone-900"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </Link>

        <div className="border-b border-[#E7E5E0] pb-6 space-y-2">
          <div className="inline-flex items-center gap-2 rounded-lg bg-[#EAF4EE] px-2.5 py-1 text-xs font-semibold text-[#2D5A43]">
            <Shield className="h-3.5 w-3.5" />
            <span>Privacy Information</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-stone-900">
            Privacy Policy
          </h1>
          <p className="text-xs text-stone-500">Last updated: October 2026</p>
        </div>

        <div className="prose prose-stone text-sm space-y-6 text-stone-700 leading-relaxed">
          <section className="space-y-2">
            <h2 className="text-base font-semibold text-stone-900">
              1. Our Human-First Privacy Commitment
            </h2>
            <p>
              Adaptive Planner treats your schedule and goals with complete confidentiality.
              We do not sell your personal data or use your private reflections to train public models.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-stone-900">
              2. Data We Process
            </h2>
            <p>
              We collect the information you voluntarily provide: goal descriptions, task titles,
              working hours constraints, and completion durations. This information is strictly used
              to compute your personal schedule and provide adaptive recovery options.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-stone-900">
              3. Transparent AI Processing
            </h2>
            <p>
              When you generate a plan or request diagnosis for time overruns, your task data is sent
              securely to our planning engine. The estimates produced are suggestions, and you retain
              full control to review, edit, or delete any plan before applying it.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-stone-900">
              4. Data Control & Deletion
            </h2>
            <p>
              You can export or purge your planning records anytime from the Settings page. Resetting
              demo storage or deleting a goal removes all associated task logs permanently.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
