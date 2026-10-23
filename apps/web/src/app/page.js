import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Target,
  CheckCircle2,
  Calendar,
  RotateCcw,
  HeartHandshake,
  Shield,
  HelpCircle,
  FileText,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FAF9F5] text-stone-900 selection:bg-[#2D5A43] selection:text-white">
      {/* Top Navigation */}
      <header className="border-b border-[#E7E5E0] bg-[#FAF9F5]/90 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-[#2D5A43] text-white font-bold flex items-center justify-center text-xs shadow-sm">
              AP
            </div>
            <span className="font-bold text-base tracking-tight text-stone-900">
              Adaptive Planner
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-semibold text-stone-700 hover:text-stone-900 px-3 py-1.5 transition"
            >
              Sign In
            </Link>
            <Link
              href="/dashboard"
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#2D5A43] hover:bg-[#1E3A2F] text-white transition shadow-sm flex items-center gap-1.5"
            >
              <span>Open Workspace</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 space-y-20">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#C6DDD1] bg-[#EAF4EE] text-[#2D5A43] text-xs font-semibold">
            <HeartHandshake className="h-3.5 w-3.5" />
            <span>A Personal Planning Coach, Not Just Another To-Do List</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-stone-900 leading-tight">
            Plans that adjust to life,{" "}
            <span className="text-[#2D5A43]">not the other way around.</span>
          </h1>

          <p className="text-base sm:text-lg text-stone-600 leading-relaxed max-w-2xl mx-auto">
            A calm, human-centered productivity platform that guides what to do today, explains why a plan slipped, and provides honest recovery options without guilt.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#2D5A43] hover:bg-[#1E3A2F] text-white font-semibold text-xs shadow-sm transition flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>Open Personal Workspace</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-6 py-3 rounded-xl border border-[#E7E5E0] bg-white hover:bg-[#F3F2EE] text-stone-700 font-semibold text-xs transition cursor-pointer"
            >
              Instant Guest / Demo Access
            </Link>
          </div>
        </div>

        {/* The 5 Core Human Questions We Answer */}
        <div className="space-y-6">
          <div className="text-center space-y-1">
            <span className="text-xs font-bold text-[#2D5A43] uppercase tracking-wider">
              Human-Centered Philosophy
            </span>
            <h2 className="text-2xl font-bold text-stone-900">
              Designed around the 5 essential questions
            </h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[
              {
                q: "1. What am I trying to achieve?",
                desc: "Conversational Goal Wizard with progressive disclosure, breaking vision into measurable milestones.",
                icon: Target,
                href: "/goals",
              },
              {
                q: "2. What should I do today?",
                desc: "Focused single-session Today mode. No 40-item overwhelming backlogs.",
                icon: CheckCircle2,
                href: "/today",
              },
              {
                q: "3. Am I making real progress?",
                desc: "Evidence-based velocity without guilt streaks or judgmental scores.",
                icon: Calendar,
                href: "/dashboard",
              },
              {
                q: "4. Why is my plan not working?",
                desc: "Transparent hypotheses on time overruns and back-to-back buffers with user verification.",
                icon: HelpCircle,
                href: "/insights",
              },
              {
                q: "5. How can I recover?",
                desc: "Recovery Simulator offering 3 honest alternatives with transparent trade-offs.",
                icon: RotateCcw,
                href: "/recovery",
              },
            ].map(({ q, desc, icon: Icon, href }) => (
              <Link
                key={q}
                href={href}
                className="p-5 rounded-2xl border border-[#E7E5E0] bg-white hover:border-[#2D5A43] hover:shadow-xs transition flex flex-col justify-between space-y-3 group"
              >
                <div className="space-y-2">
                  <div className="h-8 w-8 rounded-xl bg-[#EAF4EE] text-[#2D5A43] flex items-center justify-center">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-bold text-stone-900 group-hover:text-[#2D5A43] transition">
                    {q}
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed">{desc}</p>
                </div>
                <div className="text-xs font-semibold text-[#2D5A43] flex items-center gap-1">
                  <span>Explore screen</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Illustrative Dashboard Preview Section (Flattened hierarchy) */}
        <div className="border-t border-[#E7E5E0] pt-10 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-2">
            <div>
              <span className="text-xs font-bold text-[#2D5A43] uppercase tracking-wider block">
                Workspace Experience Preview
              </span>
              <h3 className="text-xl font-bold text-stone-900">
                THURSDAY, OCTOBER 15 • Welcome back.
              </h3>
            </div>
            <span className="text-xs text-stone-600 font-medium">
              Calm, supportive, action-oriented interface
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="p-5 rounded-2xl bg-white border border-[#E7E5E0] space-y-3 shadow-xs">
              <span className="text-xs font-semibold text-stone-600 block">Your focus for today</span>
              <p className="text-base font-bold text-stone-900">
                Finish the first draft of your project proposal
              </p>
              <div className="flex items-center gap-2 text-xs text-stone-600">
                <span className="px-2.5 py-1 rounded-md bg-[#FAF9F5] border border-[#E7E5E0] font-medium">
                  Estimated: 45m
                </span>
                <span className="text-[#2D5A43] font-semibold">Priority milestone</span>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#E7E5E0] space-y-3 shadow-xs">
              <span className="text-xs font-semibold text-stone-600 block">Today&apos;s tasks</span>
              <p className="text-3xl font-extrabold text-stone-900 tracking-tight">4 Planned</p>
              <p className="text-xs text-stone-600 leading-relaxed">
                Comfortably fits your 2h 30m afternoon focus window without back-to-back strain.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-[#E7E5E0] space-y-3 shadow-xs">
              <span className="text-xs font-semibold text-stone-600 block">Non-judgmental coaching</span>
              <p className="text-xs text-stone-800 font-medium leading-relaxed">
                &ldquo;Three tasks remain unfinished from yesterday. Would you like to adjust your plan?&rdquo;
              </p>
              <span className="text-xs font-semibold text-[#2D5A43] block">
                Zero guilt streaks • 100% agency
              </span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E7E5E0] py-8 text-xs text-stone-500 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 Adaptive Planner. Personal Planning Coach & Goal Execution Platform.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-stone-900 transition flex items-center gap-1">
              <Shield className="h-3.5 w-3.5" />
              <span>Privacy</span>
            </Link>
            <Link href="/terms" className="hover:text-stone-900 transition flex items-center gap-1">
              <FileText className="h-3.5 w-3.5" />
              <span>Terms</span>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
