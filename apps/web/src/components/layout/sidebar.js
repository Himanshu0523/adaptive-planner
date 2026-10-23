"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Target,
  CheckCircle2,
  Calendar,
  Sparkles,
  RefreshCw,
  Settings,
  HeartHandshake,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

export const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/today", label: "Today", icon: CheckCircle2 },
  { href: "/planner", label: "Planner", icon: Calendar },
  { href: "/insights", label: "Insights", icon: Sparkles },
  { href: "/recovery", label: "Recovery", icon: RefreshCw },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ className, onClose }) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex h-full w-64 flex-col border-r border-[#E7E5E0] bg-[#FAF9F5]",
        className
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-[#E7E5E0]">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-[#2D5A43] text-white font-bold flex items-center justify-center text-xs shadow-sm">
            AP
          </div>
          <div>
            <span className="font-semibold text-stone-900 text-sm tracking-tight block leading-tight">
              Adaptive Planner
            </span>
            <span className="text-[10px] text-stone-500 font-medium block">
              Personal Planning Coach
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-[#2D5A43] text-white shadow-sm font-medium"
                  : "text-stone-700 hover:bg-[#F3F2EE] hover:text-stone-900"
              )}
            >
              <Icon className={cn("h-4 w-4 shrink-0", active ? "text-white" : "text-stone-500")} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Human Philosophy Card */}
      <div className="p-3 border-t border-[#E7E5E0]">
        <div className="rounded-xl bg-[#F5F4EF] p-3 text-stone-600 border border-[#E7E5E0]/60 space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#2D5A43]">
            <HeartHandshake className="h-3.5 w-3.5" />
            <span>Calm & Human UI</span>
          </div>
          <p className="text-[11px] text-stone-500 leading-snug">
            Plans adjust to life, not the other way around. No guilt streaks here.
          </p>
        </div>
      </div>
    </aside>
  );
}